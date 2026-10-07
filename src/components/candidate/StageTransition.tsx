import React from 'react';
import { ExamStageConfig } from '../../types';
import { Clock, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { VALIDATION_DISCLAIMER } from '../../data/questionBank';

interface StageTransitionProps {
  completedStageName?: string;
  completedAnswerCount?: number;
  wasForceExpired?: boolean;
  nextStageConfig: ExamStageConfig;
  nextStageNumber: number;
  totalStages: number;
  onStartNextStage: () => void;
}

export const StageTransition: React.FC<StageTransitionProps> = ({
  completedStageName,
  completedAnswerCount,
  wasForceExpired,
  nextStageConfig,
  nextStageNumber,
  totalStages,
  onStartNextStage
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Previous Stage Completion Summary Banner */}
        {completedStageName && (
          <div
            className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
              wasForceExpired
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {wasForceExpired ? (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {wasForceExpired
                  ? `Tiempo concluido: ${completedStageName}`
                  : `Etapa completada con éxito: ${completedStageName}`}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                {wasForceExpired
                  ? `El cronómetro del servidor alcanzó los 15 minutos. Todas tus ${completedAnswerCount || 0} respuestas enviadas fueron preservadas en el servidor.`
                  : `Tus respuestas han sido sincronizadas y guardadas con integridad.`}
              </p>
            </div>
          </div>
        )}

        {/* Next Stage Introduction */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            Etapa {nextStageNumber} de {totalStages}
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {nextStageConfig?.name || 'Siguiente Etapa'}
          </h1>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
            {nextStageConfig?.description || 'Preparando siguiente sección de evaluación.'}
          </p>

          {/* Time & Rules Callout */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Tiempo asignado: 15 minutos continuos</span>
            </div>
            
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              <strong>Importante:</strong> El cronómetro de 15:00 iniciará <em>únicamente</em> cuando presiones el botón "Comenzar etapa" de abajo. Puedes tomarte un breve momento para respirar y prepararte.
            </p>

            {nextStageConfig?.guidelines && (
              <ul className="space-y-1.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                {nextStageConfig.guidelines.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Psychological Validation Note */}
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{VALIDATION_DISCLAIMER}</span>
          </div>

          {/* Start Action */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onStartNextStage}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Comenzar etapa {nextStageNumber}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
