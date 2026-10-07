import React from 'react';
import { CheckCircle2, FileCheck, ShieldCheck, Calendar, ArrowRight, Printer, Sparkles } from 'lucide-react';
import { Candidate } from '../../types';

interface CompletionScreenProps {
  candidate: Candidate;
  totalAnswered: number;
  isCandidate?: boolean;
  onViewSummary?: () => void;
  onSwitchToAdmin?: () => void;
  onResetExam?: () => void;
  onLogout?: () => void;
  onViewProcesses?: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  candidate,
  totalAnswered,
  isCandidate = false,
  onViewSummary,
  onSwitchToAdmin,
  onResetExam,
  onLogout,
  onViewProcesses
}) => {
  const submissionCode = `GEA-${candidate.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const submissionDate = new Date().toLocaleString('es-PE', {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone: 'America/Lima'
  });

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-3 sm:px-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-xs text-center transition-colors">
        
        {/* Success Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-950/20">
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Proceso completado
        </span>

        <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Evaluación enviada con éxito
        </h1>

        <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Tus respuestas han sido procesadas, cifradas y remitidas al sistema central de selección de <strong>GEA Perú</strong>.
        </p>

        {/* Digital Voucher Card (La primera parte del cuadro) */}
        <div className="mt-6 sm:mt-8 text-left p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl space-y-3 sm:space-y-4 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 sm:pb-3 gap-0.5 sm:gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Código de comprobante</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
              {submissionCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 sm:pb-3 gap-0.5 sm:gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Postulante</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{candidate.fullName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 sm:pb-3 gap-0.5 sm:gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Convocatoria</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{candidate.position}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 sm:pb-3 gap-0.5 sm:gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Fecha y hora (Lima, Perú)</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{submissionDate}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Reactivos procesados</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {totalAnswered} respuestas sincronizadas
            </span>
          </div>
        </div>

        {/* Next Steps Guidance: visible para todos */}
        <div className="mt-5 sm:mt-6 text-left p-3.5 sm:p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-4 h-4 shrink-0" />
            Próximos pasos del proceso de selección
          </h3>
          <p className="text-xs text-blue-900/80 dark:text-blue-200 leading-relaxed">
            El comité evaluador revisará los resultados consolidados en los próximos 3 días hábiles. Si tu perfil avanza a la etapa final de entrevistas con la jefatura del área, serás contactado mediante el correo <code>{candidate.email}</code> o vía llamada telefónica.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {isCandidate ? (
            <>
              {onViewProcesses && (
                <button
                  type="button"
                  onClick={onViewProcesses}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-[#1F2A5E] text-[#1F2A5E] dark:border-blue-400 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs sm:text-sm font-medium min-h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors touch-manipulation"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Volver a Mis Procesos</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#161E42] text-white text-xs sm:text-sm font-medium min-h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors touch-manipulation"
                >
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium min-h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors touch-manipulation"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir comprobante</span>
              </button>

              {onResetExam && (
                <button
                  type="button"
                  onClick={onResetExam}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs sm:text-sm font-medium min-h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors touch-manipulation"
                >
                  <span>Reiniciar examen (Demo)</span>
                </button>
              )}

              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-medium min-h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors touch-manipulation"
                >
                  <span>Ver en el Panel de Selección</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
