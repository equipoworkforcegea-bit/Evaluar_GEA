import React, { useState } from 'react';
import { Question, Option } from '../../types';
import { AlertCircle, Check, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onConfirmAnswer: (selectedOptionId: string) => Promise<void>;
  onCopyAttempt: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onConfirmAnswer,
  onCopyAttempt
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleConfirm = async () => {
    if (!selectedOptionId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirmAnswer(selectedOptionId);
      setSelectedOptionId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation for options (1, 2, 3, 4 or A, B, C, D)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['1', 'a', 'A'].includes(e.key) && question.options[0]) setSelectedOptionId(question.options[0].id);
    if (['2', 'b', 'B'].includes(e.key) && question.options[1]) setSelectedOptionId(question.options[1].id);
    if (['3', 'c', 'C'].includes(e.key) && question.options[2]) setSelectedOptionId(question.options[2].id);
    if (['4', 'd', 'D'].includes(e.key) && question.options[3]) setSelectedOptionId(question.options[3].id);
    if (e.key === 'Enter' && selectedOptionId && !isSubmitting) {
      handleConfirm();
    }
  };

  return (
    <div 
      className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] outline-hidden select-none focus:outline-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onCopy={(e) => {
        e.preventDefault();
        onCopyAttempt();
      }}
    >
      {/* Modern Focus Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-lg dark:shadow-2xl transition-all">
        
        {/* Top Meta Bar: Competency badge & Question counter */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#004B87]/10 dark:bg-[#004B87]/30 text-[#004B87] dark:text-[#93C5FD] border border-[#004B87]/20">
              {question.competency}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline-block">
              • Evaluación Estándar GEA
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
            <span>Reactivo</span>
            <span className="text-zinc-900 dark:text-white font-extrabold">{currentIndex + 1}</span>
            <span>de</span>
            <span>{totalQuestions}</span>
          </div>
        </div>

        {/* Question Statement */}
        <div className="mb-5 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight font-sans">
            {question.statement}
          </h2>
          {question.context && (
            <div className="mt-2.5 sm:mt-3 p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {question.context}
            </div>
          )}
        </div>

        {/* Interactive Option Tiles */}
        <fieldset className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          <legend className="sr-only">Opciones de respuesta</legend>
          {question.options.map((option: Option, idx: number) => {
            const isSelected = selectedOptionId === option.id;
            const letter = String.fromCharCode(65 + idx);

            return (
              <label
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border text-sm sm:text-base cursor-pointer transition-all duration-150 select-none relative min-h-[52px] touch-manipulation active:scale-[0.99] ${
                  isSelected
                    ? 'border-[#004B87] dark:border-[#60A5FA] bg-[#004B87]/5 dark:bg-[#004B87]/20 text-zinc-900 dark:text-white shadow-md ring-2 ring-[#004B87]/20 dark:ring-[#60A5FA]/30'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 shadow-2xs'
                }`}
              >
                {/* Option Letter Pill */}
                <div className="flex items-center h-6 shrink-0 mt-0.5">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSelectOption(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                      isSelected
                        ? 'border-[#004B87] dark:border-[#60A5FA] bg-[#004B87] dark:bg-[#60A5FA] text-white shadow-xs scale-105'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-800'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>{letter}</span>
                    )}
                  </div>
                </div>

                {/* Option Text */}
                <div className="flex-1 leading-relaxed text-sm sm:text-[15px] font-medium pt-0.5">
                  {option.text}
                </div>
              </label>
            );
          })}
        </fieldset>

        {/* Warning Callout before Confirming */}
        <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl sm:rounded-2xl text-amber-900 dark:text-amber-200 text-xs mb-6 sm:mb-8">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px] sm:text-xs">
            <strong>Registro irreversible:</strong> Al pulsar "Confirmar y continuar", tu selección se guardará de forma definitiva. No se permite retroceder.
          </p>
        </div>

        {/* Bottom Bar: Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            {selectedOptionId ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Opción seleccionada lista</span>
              </>
            ) : (
              <span className="text-[11px] sm:text-xs">Selecciona una opción para continuar</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedOptionId || isSubmitting}
            className={`w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-xl font-bold text-sm sm:text-xs min-h-[48px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md touch-manipulation active:scale-[0.98] ${
              selectedOptionId && !isSubmitting
                ? 'bg-gradient-to-r from-[#004B87] to-[#003666] hover:from-[#003d70] hover:to-[#002d55] text-white hover:shadow-lg ring-2 ring-[#004B87]/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{isSubmitting ? 'Guardando respuesta…' : 'Confirmar y continuar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
