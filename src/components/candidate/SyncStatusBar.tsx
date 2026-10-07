import React from 'react';
import { Clock, CheckCircle2, CloudUpload, WifiOff, RefreshCw, AlertTriangle, Wifi } from 'lucide-react';
import { SyncState, ExamStageId } from '../../types';
import { STAGES_CONFIG } from '../../data/questionBank';

interface SyncStatusBarProps {
  stageId: ExamStageId;
  remainingSeconds: number;
  syncState: SyncState;
  queueCount: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isSimulatedOffline: boolean;
  onToggleOffline: () => void;
  onManualFlush: () => void;
}

export const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  stageId,
  remainingSeconds,
  syncState,
  queueCount,
  currentQuestionIndex,
  totalQuestions,
  isSimulatedOffline,
  onToggleOffline,
  onManualFlush
}) => {
  const currentStageConfig = STAGES_CONFIG.find(s => s.id === stageId) || STAGES_CONFIG[0];
  const isUrgentTime = remainingSeconds <= 120; // Red in last 2 minutes (< 120s)

  // Format mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Stage numbering
  const stageNumber = stageId === 'STAGE_1_PSYCHO' ? 1 : stageId === 'STAGE_2_EMOTIONAL' ? 2 : 3;

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Stage Title & Progress */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {stageNumber}
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                {currentStageConfig.shortName}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Pregunta {currentQuestionIndex + 1} de {totalQuestions}
              </p>
            </div>
          </div>

          {/* Right: Offline Simulator, Sync Status and Authoritative Countdown Timer */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Offline Simulator Switch for Demo / Testing resilience */}
            <button
              type="button"
              onClick={onToggleOffline}
              title="Permite simular caída de internet para verificar guardado en IndexedDB"
              className={`text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer touch-manipulation ${
                isSimulatedOffline
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden md:inline">Modo Offline (Simulado)</span>
                  <span className="md:hidden font-bold">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden md:inline">Conexión en línea</span>
                  <span className="md:hidden font-bold">Online</span>
                </>
              )}
            </button>

            {/* Sync State Badge */}
            <div className="flex items-center text-xs">
              {syncState === 'SAVING' && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Guardando…</span>
                </span>
              )}

              {syncState === 'SYNCED' && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Guardado</span>
                </span>
              )}

              {syncState === 'OFFLINE_SAVED' && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[150px]">
                    Guardado local
                  </span>
                  {queueCount > 0 && (
                    <span className="px-1 bg-amber-200 dark:bg-amber-900 rounded text-[10px] font-bold">
                      {queueCount}
                    </span>
                  )}
                </div>
              )}

              {syncState === 'SYNCING' && (
                <button
                  type="button"
                  onClick={onManualFlush}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                  <span className="hidden sm:inline">Sincronizando ({queueCount})</span>
                </button>
              )}
            </div>

            {/* Authoritative Countdown Timer */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-bold transition-all ${
                isUrgentTime
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse ring-2 ring-rose-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {isUrgentTime ? (
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              )}
              <span aria-label={`Tiempo restante: ${minutes} minutos y ${seconds} segundos`}>
                {formattedTime}
              </span>
              {isUrgentTime && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 ml-1 hidden lg:inline">
                  ¡Últimos 2 min!
                </span>
              )}
            </div>

          </div>

        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isUrgentTime ? 'bg-rose-500' : 'bg-blue-600'
            }`}
            style={{
              width: `${Math.min(100, Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100))}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};
