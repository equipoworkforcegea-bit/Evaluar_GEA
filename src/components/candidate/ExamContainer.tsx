import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Candidate, ExamStageId, SyncState } from '../../types';
import { STAGES_CONFIG, SAMPLE_QUESTIONS } from '../../data/questionBank';
import { ConsentScreen } from './ConsentScreen';
import { SyncStatusBar } from './SyncStatusBar';
import { QuestionView } from './QuestionView';
import { StageTransition } from './StageTransition';
import { CompletionScreen } from './CompletionScreen';
import { AuditBanner } from './AuditBanner';
import {
  saveLocalAnswerIdempotent,
  saveLocalAuditEvent,
  getLocalAnswersForAttempt
} from '../../services/db';
import { serverInstance, ClientSyncWorker } from '../../services/serverSync';
import { 
  CandidateDataService, 
  generateDefaultReportForCandidate,
  calculateScoresFromAnswers,
  getAnswersFromSupabase
} from '../../services/candidateDataService';

interface ExamContainerProps {
  candidate: Candidate;
  isCandidate?: boolean;
  onCandidateUpdated: (updated: Candidate) => void;
  onSwitchToAdmin: () => void;
  onLogout?: () => void;
  onViewProcesses?: () => void;
}

export const ExamContainer: React.FC<ExamContainerProps> = ({
  candidate,
  isCandidate = false,
  onCandidateUpdated,
  onSwitchToAdmin,
  onLogout,
  onViewProcesses
}) => {
  // Determinar etapa inicial según el estado persistido del candidato
  const getStageIndexFromCandidate = (stageId?: string): number => {
    if (!stageId) return 0;
    const s = String(stageId).toUpperCase();
    if (s.includes('3') || s.includes('WORK_CASES') || s.includes('CASOS')) return 2;
    if (s.includes('2') || s.includes('EMOTIONAL') || s.includes('EMOCIONAL')) return 1;
    return 0;
  };

  const initialStageIdx = getStageIndexFromCandidate(candidate.currentStage);

  // Exam flow states
  const [hasConsented, setHasConsented] = useState<boolean>(candidate.isConsentSigned);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(initialStageIdx);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(candidate.status === 'SCORED' || candidate.status === 'FINALIST');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(900); // 15:00
  const [wasForceExpired, setWasForceExpired] = useState<boolean>(false);

  // Sincronizar si el candidato cambia externamente (e.g. props propagadas desde App.tsx)
  useEffect(() => {
    if (candidate.isConsentSigned) {
      setHasConsented(true);
    }
    if (candidate.status === 'SCORED' || candidate.status === 'FINALIST') {
      setIsExamCompleted(true);
    }
    // Sincronizar etapa si viene de Supabase y es mayor a la actual
    if (candidate.currentStage) {
      const remoteIdx = getStageIndexFromCandidate(candidate.currentStage);
      setCurrentStageIndex(prev => Math.max(prev, remoteIdx));
    }
  }, [candidate.id, candidate.isConsentSigned, candidate.status, candidate.currentStage]);

  // Sync states
  const [syncState, setSyncState] = useState<SyncState>('SYNCED');
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Audit alerts
  const [auditBannerMessage, setAuditBannerMessage] = useState<string | null>(null);
  const [showAuditBanner, setShowAuditBanner] = useState<boolean>(false);

  const attemptId = useMemo(() => `att_${candidate.id}`, [candidate.id]);
  const currentStageConfig = STAGES_CONFIG[currentStageIndex];
  const syncWorkerRef = useRef<ClientSyncWorker | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Filter and pseudo-randomize questions deterministically for this candidate
  const stageQuestions = useMemo(() => {
    const list = SAMPLE_QUESTIONS.filter(q => q.stageId === currentStageConfig.id);
    // Shuffle deterministically based on candidate ID seed to preserve order on re-render
    return [...list].sort((a, b) => {
      const hashA = (a.id + candidate.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + candidate.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return (hashA % 100) - (hashB % 100);
    });
  }, [currentStageConfig.id, candidate.id]);

  // Total answers count
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Initialize Sync Worker
  useEffect(() => {
    const worker = new ClientSyncWorker((state, size) => {
      setSyncState(state);
      setQueueCount(size);
    });
    syncWorkerRef.current = worker;
    worker.start();

    return () => {
      worker.stop();
    };
  }, []);

  // Auto-start timer when component mounts with an already-consented candidate
  // (e.g. resuming from stage 2 or 3 after a page refresh)
  const timerStartedRef = useRef(false);
  useEffect(() => {
    if (
      hasConsented &&
      !isExamCompleted &&
      !isTransitioning &&
      !timerStartedRef.current &&
      currentStageConfig
    ) {
      timerStartedRef.current = true;
      startStageTimer(currentStageConfig.id, currentStageIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConsented, isExamCompleted]);

  // Record audit event helper
  const logAudit = useCallback(async (
    type: any,
    description: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
  ) => {
    try {
      await saveLocalAuditEvent(
        candidate.id,
        attemptId,
        type,
        description,
        severity,
        currentStageConfig.id
      );
      // Persist audit event directly to Supabase
      CandidateDataService.logAuditEvent(
        candidate.id,
        type,
        description,
        severity,
        currentStageConfig.id
      );
      if (syncWorkerRef.current) {
        syncWorkerRef.current.triggerImmediateFlush();
      }
    } catch (err) {
      console.error('Error logging audit event:', err);
    }
  }, [candidate.id, attemptId, currentStageConfig.id]);

  // Trigger banner alert
  const triggerAuditWarning = useCallback((msg: string) => {
    setAuditBannerMessage(msg);
    setShowAuditBanner(true);
    setTimeout(() => {
      setShowAuditBanner(false);
    }, 7000);
  }, []);

  // Listen to visibilitychange, window blur, and network online/offline events
  useEffect(() => {
    if (!hasConsented || isExamCompleted || isTransitioning) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const msg = 'Aviso: Se detectó salida de pestaña. La evaluación debe realizarse en pantalla activa.';
        triggerAuditWarning(msg);
        logAudit('TAB_SWITCH_OUT', 'El postulante minimizó o cambió de pestaña activa en el navegador.', 'WARNING');
      } else {
        logAudit('TAB_SWITCH_BACK', 'El postulante regresó a la pestaña de evaluación.', 'INFO');
      }
    };

    const handleBlur = () => {
      logAudit('WINDOW_BLUR', 'La ventana de evaluación perdió el foco de la pantalla.', 'WARNING');
    };

    const handleFocus = () => {
      logAudit('WINDOW_FOCUS', 'La ventana de evaluación recuperó el foco.', 'INFO');
    };

    const handleOffline = () => {
      setIsSimulatedOffline(true);
      serverInstance.isOfflineMode = true;
      triggerAuditWarning('Conexión perdida. Tus respuestas se están guardando localmente en tu dispositivo.');
      logAudit('NETWORK_OFFLINE', 'El navegador perdió la conexión a internet. Guardado automático en IndexedDB.', 'WARNING');
    };

    const handleOnline = () => {
      setIsSimulatedOffline(false);
      serverInstance.isOfflineMode = false;
      triggerAuditWarning('Conexión reestablecida. Sincronizando datos con el servidor central…');
      logAudit('NETWORK_ONLINE', 'Conexión reestablecida. Vaciando cola de sincronización.', 'INFO');
      if (syncWorkerRef.current) {
        syncWorkerRef.current.triggerImmediateFlush();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [hasConsented, isExamCompleted, isTransitioning, triggerAuditWarning, logAudit]);

  // Authoritative Stage Timer Management
  const startStageTimer = useCallback((stageId: ExamStageId, stageIndex?: number) => {
    const resolvedIdx = stageIndex !== undefined ? stageIndex : currentStageIndex;
    const serverResult = serverInstance.startStage(attemptId, stageId, STAGES_CONFIG[resolvedIdx].durationSeconds);
    setRemainingSeconds(serverResult.remainingSeconds);
    setWasForceExpired(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      const status = serverInstance.getStageRemainingSeconds(attemptId, stageId);
      setRemainingSeconds(status.remainingSeconds);

      // Automatic timeout handling (auto-close and force advance)
      if (status.isExpired) {
        clearInterval(timerIntervalRef.current);
        handleStageTimeout(resolvedIdx);
      }
    }, 1000);
  }, [attemptId, currentStageIndex]);

  // Stage timeout handler – receives the stageIndex at the moment of expiry to avoid stale closure
  const handleStageTimeout = useCallback((expiredStageIdx?: number) => {
    const idx = expiredStageIdx !== undefined ? expiredStageIdx : currentStageIndex;
    setWasForceExpired(true);
    logAudit(
      'STAGE_FORCE_EXPIRED',
      `El tiempo límite de 15 minutos de la ${STAGES_CONFIG[idx]?.name ?? currentStageConfig.name} ha concluido en el servidor. Respuestas preservadas.`,
      'WARNING'
    );

    if (idx < STAGES_CONFIG.length - 1) {
      setIsTransitioning(true);
    } else {
      finishWholeExam();
    }
  }, [currentStageIndex, currentStageConfig.name, logAudit]);

  // Start exam after consent
  const handleConsentAccepted = async () => {
    setHasConsented(true);
    const updatedCandidate: Candidate = {
      ...candidate,
      isConsentSigned: true,
      consentSignedAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
      currentStage: STAGES_CONFIG[0].id,
      startedAt: new Date().toISOString()
    };
    onCandidateUpdated(updatedCandidate);

    await logAudit(
      'STAGE_STARTED',
      `El postulante aceptó el consentimiento informado bajo Ley 29733 e inició la ${STAGES_CONFIG[0].name}.`,
      'INFO'
    );

    startStageTimer(STAGES_CONFIG[0].id);
  };

  // Start next stage
  const handleStartNextStage = () => {
    const nextIdx = currentStageIndex + 1;
    if (nextIdx >= STAGES_CONFIG.length) {
      finishWholeExam();
      return;
    }

    const nextConfig = STAGES_CONFIG[nextIdx];
    setCurrentStageIndex(nextIdx);
    setCurrentQuestionIndex(0);
    setIsTransitioning(false);
    setWasForceExpired(false);

    const updatedCandidate: Candidate = {
      ...candidate,
      currentStage: nextConfig.id,
      status: 'IN_PROGRESS'
    };
    onCandidateUpdated(updatedCandidate);

    logAudit('STAGE_STARTED', `El postulante inició la ${nextConfig.name}.`, 'INFO');
    startStageTimer(nextConfig.id, nextIdx);
  };

  // Confirm single answer and advance strictly
  const handleConfirmAnswer = async (selectedOptionId: string) => {
    const currentQ = stageQuestions[currentQuestionIndex];
    if (!currentQ) return;

    setSyncState('SAVING');

    // 1. Save idempotently to client-side IndexedDB with Dexie
    await saveLocalAnswerIdempotent(
      attemptId,
      currentQ.id,
      currentStageConfig.id,
      selectedOptionId
    );

    // 2. Persist answer to Supabase cloud
    CandidateDataService.saveAnswer(
      candidate.id,
      currentQ.id,
      selectedOptionId,
      currentStageConfig.id
    );

    setAnsweredCount(prev => prev + 1);

    // 2. Trigger sync worker to send batch
    if (syncWorkerRef.current) {
      syncWorkerRef.current.triggerImmediateFlush();
    }

    // 3. Strict forward-only navigation
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed all questions of this stage
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      logAudit(
        'STAGE_COMPLETED',
        `El postulante concluyó todas las preguntas de la ${currentStageConfig.name}.`,
        'INFO'
      );

      if (currentStageIndex < STAGES_CONFIG.length - 1) {
        setIsTransitioning(true);
      } else {
        finishWholeExam();
      }
    }
  };

  // Finish exam
  const finishWholeExam = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setIsExamCompleted(true);
    setIsTransitioning(false);

    // Ensure all pending records in Dexie are pushed
    if (syncWorkerRef.current) {
      await syncWorkerRef.current.flushQueue();
    }

    // 1. Obtener respuestas reales del postulante almacenadas en IndexedDB
    let localAnswers: Record<string, any> = {};
    try {
      localAnswers = await getLocalAnswersForAttempt(attemptId);
    } catch (e) {
      console.warn('[ExamContainer] Error leyendo respuestas locales:', e);
    }

    // 1b. Si IndexedDB está vacío, intentar obtener respuestas desde el servidor en memoria (misma sesión)
    if (Object.keys(localAnswers).length === 0 && attemptId) {
      try {
        const serverAnswers = serverInstance.getAnswersForAttempt(attemptId);
        if (Object.keys(serverAnswers).length > 0) {
          console.info('[ExamContainer] Usando respuestas del servidor en memoria:', Object.keys(serverAnswers).length);
          localAnswers = serverAnswers;
        }
      } catch (e) {
        console.warn('[ExamContainer] Error leyendo respuestas del servidor:', e);
      }
    }

    // 1c. Si aún está vacío, intentar obtener respuestas desde Supabase como fallback final
    if (Object.keys(localAnswers).length === 0) {
      try {
        console.info('[ExamContainer] IndexedDB y servidor vacíos, cargando respuestas desde Supabase...');
        localAnswers = await getAnswersFromSupabase(candidate.id);
      } catch (e) {
        console.warn('[ExamContainer] Error leyendo respuestas desde Supabase:', e);
      }
    }

    // 2. Calcular puntuaciones reales basadas en pesos de opciones elegidas
    const finalScores = calculateScoresFromAnswers(localAnswers, {
      id: candidate.id,
      fullName: candidate.fullName
    });

    // 3. Generar informe psicológico calibrado según el desempeño real
    const finalReport = generateDefaultReportForCandidate(
      { id: candidate.id, fullName: candidate.fullName, position: candidate.position },
      finalScores
    );

    // Calcular duración real del examen
    const realDuration = candidate.startedAt
      ? Math.round((Date.now() - new Date(candidate.startedAt).getTime()) / 1000)
      : (candidate.totalDurationSeconds || 0);

    const updated: Candidate = {
      ...candidate,
      status: 'SCORED',
      completedAt: new Date().toISOString(),
      totalDurationSeconds: realDuration > 0 ? realDuration : (candidate.totalDurationSeconds || 0),
      scores: finalScores,
      detailedReport: finalReport
    };

    // 4. Persistir en Supabase
    try {
      await CandidateDataService.updateCandidate(updated);
    } catch (e) {
      console.warn('[ExamContainer] Error persistiendo candidato:', e);
    }

    onCandidateUpdated(updated);
    logAudit('STAGE_COMPLETED', 'Evaluación finalizada y remitida íntegramente.', 'INFO');
  };

  // Copy attempt detector
  const handleCopyAttempt = () => {
    triggerAuditWarning('Atención: El copiado de enunciados no está permitido y ha quedado registrado.');
    logAudit('COPY_ATTEMPT', 'Intento detectado de copiar texto del examen al portapapeles.', 'WARNING');
  };

  // Toggle simulated offline mode
  const handleToggleOffline = () => {
    const nextVal = !isSimulatedOffline;
    setIsSimulatedOffline(nextVal);
    serverInstance.isOfflineMode = nextVal;
    if (nextVal) {
      setSyncState('OFFLINE_SAVED');
      triggerAuditWarning('Modo Offline activado para prueba. Las respuestas se almacenan en IndexedDB.');
      logAudit('NETWORK_OFFLINE', 'Simulación de desconexión activada en prueba.', 'INFO');
    } else {
      triggerAuditWarning('Modo Online reestablecido. Vaciando lote de respuestas guardadas en Dexie.');
      logAudit('NETWORK_ONLINE', 'Simulación de reconexión activada.', 'INFO');
      if (syncWorkerRef.current) {
        syncWorkerRef.current.triggerImmediateFlush();
      }
    }
  };

  // 1. Consent Screen (Ley 29733)
  if (!hasConsented) {
    return (
      <ConsentScreen
        candidateName={candidate.fullName}
        candidateDni={candidate.dni}
        position={candidate.position}
        onConsentAccepted={handleConsentAccepted}
      />
    );
  }

  // 2. Completion Screen
  if (isExamCompleted) {
    return (
      <CompletionScreen
        candidate={candidate}
        totalAnswered={answeredCount || 45}
        isCandidate={isCandidate}
        onLogout={onLogout}
        onViewProcesses={isCandidate ? onViewProcesses : undefined}
        onSwitchToAdmin={isCandidate ? undefined : onSwitchToAdmin}
        onResetExam={isCandidate ? undefined : () => {
          setIsExamCompleted(false);
          setCurrentStageIndex(0);
          setCurrentQuestionIndex(0);
          setIsTransitioning(false);
          setHasConsented(true);
          startStageTimer(STAGES_CONFIG[0].id);
        }}
      />
    );
  }

  // 3. Transition Screen between stages
  if (isTransitioning) {
    const nextIdx = currentStageIndex + 1;
    const nextConfig = STAGES_CONFIG[nextIdx];
    return (
      <StageTransition
        completedStageName={currentStageConfig.name}
        completedAnswerCount={currentQuestionIndex + 1}
        wasForceExpired={wasForceExpired}
        nextStageConfig={nextConfig}
        nextStageNumber={nextIdx + 1}
        totalStages={STAGES_CONFIG.length}
        onStartNextStage={handleStartNextStage}
      />
    );
  }

  const currentQuestion = stageQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16 transition-colors">
      {/* Top Authoritative Sync and Timer Bar */}
      <SyncStatusBar
        stageId={currentStageConfig.id}
        remainingSeconds={remainingSeconds}
        syncState={syncState}
        queueCount={queueCount}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={stageQuestions.length}
        isSimulatedOffline={isSimulatedOffline}
        onToggleOffline={handleToggleOffline}
        onManualFlush={() => syncWorkerRef.current?.triggerImmediateFlush()}
      />

      {/* Discrete Audit Notification Banner */}
      <AuditBanner
        message={auditBannerMessage || ''}
        isVisible={showAuditBanner}
        onDismiss={() => setShowAuditBanner(false)}
      />

      {/* Active Question View */}
      {currentQuestion && (
        <QuestionView
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={stageQuestions.length}
          onConfirmAnswer={handleConfirmAnswer}
          onCopyAttempt={handleCopyAttempt}
        />
      )}
    </div>
  );
};
