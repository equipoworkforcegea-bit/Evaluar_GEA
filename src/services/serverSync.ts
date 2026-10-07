import { examDb, markAnswersAsSynced, LocalAnswerRecord } from './db';
import { ExamStageId, SyncState, AuditEvent } from '../types';

export interface AuthoritativeStageAttempt {
  attemptId: string;
  stageId: ExamStageId;
  serverStartedAt: number; // unix timestamp ms
  serverExpiresAt: number; // unix timestamp ms
  isClosed: boolean;
  answers: Map<string, { optionId: string; timestamp: number }>;
}

// In-memory Authoritative Server State (simulating NestJS/Fastify backend + Redis)
class AuthoritativeExamServer {
  private stages: Map<string, AuthoritativeStageAttempt> = new Map(); // key: `${attemptId}_${stageId}`
  private auditEvents: AuditEvent[] = [];
  public isOfflineMode: boolean = false;
  public simulatedLatencyMs: number = 350;

  public startStage(attemptId: string, stageId: ExamStageId, durationSeconds: number = 900): {
    startedAt: string;
    expiresAt: string;
    remainingSeconds: number;
  } {
    const key = `${attemptId}_${stageId}`;
    const now = Date.now();
    
    // If already started on server, return existing authoritative expiration unless closed/expired
    let existing = this.stages.get(key);
    if (!existing || existing.isClosed || existing.serverExpiresAt <= now) {
      existing = {
        attemptId,
        stageId,
        serverStartedAt: now,
        serverExpiresAt: now + durationSeconds * 1000,
        isClosed: false,
        answers: new Map()
      };
      this.stages.set(key, existing);
    }

    const remaining = Math.max(0, Math.floor((existing.serverExpiresAt - Date.now()) / 1000));
    return {
      startedAt: new Date(existing.serverStartedAt).toISOString(),
      expiresAt: new Date(existing.serverExpiresAt).toISOString(),
      remainingSeconds: remaining
    };
  }

  public getStageRemainingSeconds(attemptId: string, stageId: ExamStageId): {
    remainingSeconds: number;
    isExpired: boolean;
    serverNow: string;
  } {
    const key = `${attemptId}_${stageId}`;
    const stage = this.stages.get(key);
    const now = Date.now();

    if (!stage) {
      return { remainingSeconds: 900, isExpired: false, serverNow: new Date(now).toISOString() };
    }

    const remaining = Math.max(0, Math.floor((stage.serverExpiresAt - now) / 1000));
    const isExpired = remaining <= 0 || stage.isClosed;
    
    if (isExpired && !stage.isClosed) {
      stage.isClosed = true;
    }

    return {
      remainingSeconds: remaining,
      isExpired,
      serverNow: new Date(now).toISOString()
    };
  }

  public submitBatch(items: {
    answers: Array<{ attemptId: string; questionId: string; stageId: ExamStageId; selectedOptionId: string; confirmedAt: string }>;
    auditEvents: Array<any>;
  }): {
    success: boolean;
    acceptedAnswers: string[];
    rejectedAnswers: Array<{ questionId: string; reason: string }>;
    serverTimestamp: string;
  } {
    const now = Date.now();
    const acceptedAnswers: string[] = [];
    const rejectedAnswers: Array<{ questionId: string; reason: string }> = [];

    // Process answers
    for (const ans of items.answers) {
      const stageKey = `${ans.attemptId}_${ans.stageId}`;
      const stage = this.stages.get(stageKey);

      // 1. Authoritative expiration check
      if (stage && now > stage.serverExpiresAt) {
        rejectedAnswers.push({
          questionId: ans.questionId,
          reason: 'STAGE_EXPIRED: El tiempo límite fijado por el servidor para esta etapa ha expirado.'
        });
        continue;
      }

      // 2. Authoritative idempotency check
      if (stage) {
        if (stage.answers.has(ans.questionId)) {
          // Idempotent: already recorded, acknowledge it without error
          acceptedAnswers.push(ans.questionId);
          continue;
        }
        stage.answers.set(ans.questionId, {
          optionId: ans.selectedOptionId,
          timestamp: now
        });
      }

      acceptedAnswers.push(ans.questionId);
    }

    // Process audit logs
    for (const aud of items.auditEvents) {
      this.auditEvents.push({
        id: aud.id,
        candidateId: aud.candidateId,
        attemptId: aud.attemptId,
        stageId: aud.stageId,
        type: aud.type,
        description: aud.description,
        timestamp: aud.timestamp || new Date().toISOString(),
        severity: aud.severity || 'INFO',
        metadata: aud.metadata
      });
    }

    return {
      success: true,
      acceptedAnswers,
      rejectedAnswers,
      serverTimestamp: new Date(now).toISOString()
    };
  }

  public getAuditEventsForCandidate(candidateId: string): AuditEvent[] {
    return this.auditEvents.filter(e => e.candidateId === candidateId);
  }
}

export const serverInstance = new AuthoritativeExamServer();

// Client-Side Batch Sync Service with Dexie and Network Status Awareness
export class ClientSyncWorker {
  private syncIntervalId: any = null;
  private onStateChangeCallback?: (state: SyncState, queueSize: number) => void;
  private currentSyncState: SyncState = 'SYNCED';

  constructor(onStateChange?: (state: SyncState, queueSize: number) => void) {
    this.onStateChangeCallback = onStateChange;
  }

  public setStateListener(cb: (state: SyncState, queueSize: number) => void) {
    this.onStateChangeCallback = cb;
  }

  public start() {
    if (this.syncIntervalId) return;
    this.syncIntervalId = setInterval(() => {
      this.flushQueue();
    }, 3000);
  }

  public stop() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  public async triggerImmediateFlush() {
    await this.flushQueue();
  }

  public async flushQueue(): Promise<void> {
    const isOnline = !serverInstance.isOfflineMode && navigator.onLine;

    const pendingCount = await examDb.syncQueue.where('status').equals('PENDING').count();

    if (!isOnline) {
      if (pendingCount > 0) {
        this.updateState('OFFLINE_SAVED', pendingCount);
      } else {
        this.updateState('SYNCED', 0);
      }
      return;
    }

    if (pendingCount === 0) {
      if (this.currentSyncState === 'SYNCING') {
        this.updateState('SYNCED', 0);
      }
      return;
    }

    this.updateState('SYNCING', pendingCount);

    const pendingItems = await examDb.syncQueue
      .where('status')
      .equals('PENDING')
      .limit(20)
      .toArray();

    if (pendingItems.length === 0) {
      this.updateState('SYNCED', 0);
      return;
    }

    const answerPayloads: any[] = [];
    const auditPayloads: any[] = [];
    const itemIds = pendingItems.map(i => i.id);

    for (const item of pendingItems) {
      if (item.type === 'ANSWER') {
        answerPayloads.push(item.payload);
      } else if (item.type === 'AUDIT_EVENT') {
        auditPayloads.push(item.payload);
      }
    }

    try {
      // Simulate network request with server latency
      await new Promise(res => setTimeout(res, serverInstance.simulatedLatencyMs));

      if (serverInstance.isOfflineMode) {
        throw new Error('Network offline simulation active');
      }

      const response = serverInstance.submitBatch({
        answers: answerPayloads,
        auditEvents: auditPayloads
      });

      if (response.success) {
        // Mark answers as synced in Dexie local storage
        const syncedQIds = answerPayloads.map(a => a.questionId);
        if (answerPayloads.length > 0) {
          await markAnswersAsSynced(answerPayloads[0].attemptId, syncedQIds);
        }

        // Delete processed sync queue items
        await examDb.syncQueue.bulkDelete(itemIds);

        const remaining = await examDb.syncQueue.where('status').equals('PENDING').count();
        if (remaining > 0) {
          this.updateState('SYNCING', remaining);
        } else {
          this.updateState('SYNCED', 0);
        }
      }
    } catch (err) {
      console.warn('[SyncWorker] Error al sincronizar con el servidor, conservado en IndexedDB:', err);
      // Increment retries
      for (const item of pendingItems) {
        item.retries += 1;
        item.status = 'PENDING';
        await examDb.syncQueue.put(item);
      }
      this.updateState('OFFLINE_SAVED', pendingItems.length);
    }
  }

  private updateState(state: SyncState, queueSize: number) {
    this.currentSyncState = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state, queueSize);
    }
  }
}
