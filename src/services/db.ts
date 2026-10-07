import Dexie, { Table } from 'dexie';
import { CandidateAnswer, AuditEvent, ExamStageId } from '../types';

export interface LocalAnswerRecord {
  id: string; // `${attemptId}_${questionId}`
  attemptId: string;
  questionId: string;
  stageId: ExamStageId;
  selectedOptionId: string;
  confirmedAt: string;
  syncedToServer: boolean;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  attemptId: string;
  type: 'ANSWER' | 'AUDIT_EVENT' | 'STAGE_TRANSITION';
  payload: any;
  createdAt: string;
  retries: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  lastError?: string;
}

export interface LocalAuditRecord {
  id: string;
  candidateId: string;
  attemptId: string;
  stageId?: ExamStageId;
  type: string;
  description: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: any;
  synced: boolean;
}

export class CandidateExamDatabase extends Dexie {
  localAnswers!: Table<LocalAnswerRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  auditLogs!: Table<LocalAuditRecord, string>;

  constructor() {
    super('GEAPeruExamDB');
    this.version(1).stores({
      localAnswers: 'id, attemptId, questionId, stageId, syncedToServer',
      syncQueue: 'id, attemptId, type, status, createdAt',
      auditLogs: 'id, attemptId, type, timestamp, synced'
    });
  }
}

export const examDb = new CandidateExamDatabase();

// IndexedDB Helper Operations
export async function saveLocalAnswerIdempotent(
  attemptId: string,
  questionId: string,
  stageId: ExamStageId,
  selectedOptionId: string
): Promise<LocalAnswerRecord> {
  const compositeKey = `${attemptId}_${questionId}`;
  const now = new Date().toISOString();

  // Check if answer already exists to enforce client-side immutability
  const existing = await examDb.localAnswers.get(compositeKey);
  if (existing) {
    return existing; // Immutable once confirmed
  }

  const record: LocalAnswerRecord = {
    id: compositeKey,
    attemptId,
    questionId,
    stageId,
    selectedOptionId,
    confirmedAt: now,
    syncedToServer: false,
    updatedAt: now
  };

  await examDb.localAnswers.put(record);

  // Queue for batch network sync
  const queueItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    attemptId,
    type: 'ANSWER',
    payload: {
      attemptId,
      questionId,
      stageId,
      selectedOptionId,
      confirmedAt: now
    },
    createdAt: now,
    retries: 0,
    status: 'PENDING'
  };

  await examDb.syncQueue.put(queueItem);
  return record;
}

export async function saveLocalAuditEvent(
  candidateId: string,
  attemptId: string,
  type: string,
  description: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO',
  stageId?: ExamStageId,
  metadata?: any
): Promise<LocalAuditRecord> {
  const now = new Date().toISOString();
  const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const record: LocalAuditRecord = {
    id,
    candidateId,
    attemptId,
    stageId,
    type,
    description,
    timestamp: now,
    severity,
    metadata,
    synced: false
  };

  await examDb.auditLogs.put(record);

  // Also queue for sync
  await examDb.syncQueue.put({
    id: `sync_aud_${id}`,
    attemptId,
    type: 'AUDIT_EVENT',
    payload: record,
    createdAt: now,
    retries: 0,
    status: 'PENDING'
  });

  return record;
}

export async function getLocalAnswersForAttempt(attemptId: string): Promise<Record<string, CandidateAnswer>> {
  const records = await examDb.localAnswers.where('attemptId').equals(attemptId).toArray();
  const map: Record<string, CandidateAnswer> = {};
  for (const r of records) {
    map[r.questionId] = {
      questionId: r.questionId,
      selectedOptionId: r.selectedOptionId,
      stageId: r.stageId,
      confirmedAt: r.confirmedAt,
      syncedToServer: r.syncedToServer,
      serverTimestamp: r.syncedToServer ? r.updatedAt : undefined
    };
  }
  return map;
}

export async function markAnswersAsSynced(attemptId: string, questionIds: string[]): Promise<void> {
  await examDb.transaction('rw', examDb.localAnswers, examDb.syncQueue, async () => {
    for (const qId of questionIds) {
      const key = `${attemptId}_${qId}`;
      const item = await examDb.localAnswers.get(key);
      if (item) {
        item.syncedToServer = true;
        await examDb.localAnswers.put(item);
      }
    }
  });
}
