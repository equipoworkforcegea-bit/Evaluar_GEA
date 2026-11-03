import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Award,
  Sparkles
} from 'lucide-react';
import { getQuestionsForTopic, QuestionData } from '../../data/questionnairesData';
import { EvaluacionesService } from '../../services/evaluacionesService';

interface KnowledgeExamViewProps {
  topicName: string;
  difficulty?: 'Personalizada' | 'Baja' | 'Media' | 'Alta';
  questionCount?: number;
  candidateId?: string;
  processId?: string;
  onComplete: (score: number, maxScore: number, correctCount: number) => void;
}

export const KnowledgeExamView: React.FC<KnowledgeExamViewProps> = ({
  topicName,
  difficulty = 'Media',
  questionCount = 20,
  candidateId = 'cand_invitado',
  processId = 'proc_invitado',
  onComplete
}) => {
  // 1. Obtener las 20 preguntas correspondientes al tema configurado
  const [questions] = useState<QuestionData[]>(() => {
    return getQuestionsForTopic(topicName, difficulty, questionCount);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(Math.max(15, Math.ceil(questionCount * 1.2)) * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [resultsSummary, setResultsSummary] = useState<{
    score: number;
    maxScore: number;
    correctCount: number;
    totalCount: number;
    percentage: number;
  } | null>(null);

  // 2. Bloqueo estricto de salida / cierre mientras la prueba está en curso
  useEffect(() => {
    if (isFinished) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'La evaluación de conocimientos está en curso. Si sales ahora, tus respuestas se guardarán incompletas.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinished]);

  // 3. Temporizador regresivo
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, selectedAnswers]);

  const currentQ = questions[currentIndex] || questions[0];
  const total = questions.length;
  const isLast = currentIndex === total - 1;
  const currentSelected = selectedAnswers[currentQ?.id];

  const handleSelectOption = (optText: string) => {
    if (isFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optText
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinishExam();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleFinishExam = async () => {
    if (isFinished) return;
    setIsFinished(true);

    let correctCount = 0;
    const formattedAnswers = questions.map((q) => {
      const selected = selectedAnswers[q.id] || '';
      const correctOpt = q.options.find((o) => o.isCorrect)?.text || '';
      const isCorrect = selected === correctOpt;
      if (isCorrect) correctCount++;
      return {
        preguntaId: q.id,
        enunciado: q.question,
        respuestaSeleccionada: selected,
        respuestaCorrecta: correctOpt,
        esCorrecta: isCorrect
      };
    });

    const maxScore = 20;
    const score = Math.round((correctCount / total) * maxScore * 10) / 10;
    const percentage = Math.round((correctCount / total) * 100);

    setResultsSummary({
      score,
      maxScore,
      correctCount,
      totalCount: total,
      percentage
    });

    // Guardar en Supabase tabla evaluaciones_conocimientos y LocalStorage
    try {
      await EvaluacionesService.guardarResultadoConocimientos({
        candidatoId: candidatoId || 'cand_oficial',
        procesoId: procesoId || 'proc_oficial',
        tema: topicName || 'General',
        dificultad: dificultad || 'Media',
        puntaje: score,
        puntajeMaximo: maxScore,
        totalPreguntas: total,
        aciertos: correctCount,
        errores: total - correctCount,
        respuestas: formattedAnswers
      });
    } catch (saveErr) {
      console.warn('[KnowledgeExamView] Error al guardar resultados:', saveErr);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Pantalla de Resultados al finalizar
  if (isFinished && resultsSummary) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
        style={{
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 40%, #FAF5FF 100%)',
        }}
      >
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-violet-100 p-6 sm:p-9 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block mb-1">
              Cuestionario Completado
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {topicName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tus respuestas han sido procesadas y guardadas satisfactoriamente en el sistema oficial de selección.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block">Puntaje Obtenido</span>
              <span className="text-xl sm:text-2xl font-black text-purple-700">
                {resultsSummary.score} <span className="text-xs font-bold text-slate-400">/ 20</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Aciertos</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {resultsSummary.correctCount} <span className="text-xs font-bold text-slate-400">/ {resultsSummary.totalCount}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Efectividad</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {resultsSummary.percentage}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onComplete(resultsSummary.score, resultsSummary.maxScore, resultsSummary.correctCount)}
            className="w-full py-3.5 rounded-2xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
          >
            Volver a Mis Evaluaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 40%, #FAF5FF 100%)',
      }}
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden flex flex-col my-auto">
        
        {/* Header inside card - Sin la palabra evaluar y con salida bloqueada */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-xl bg-[#1F2A5E] text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs">
              GEA
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 leading-none">GEA Internacional</span>
              <span className="text-[10px] text-slate-400">Evaluación de Conocimiento</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{topicName}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium cursor-help"
            title="Por seguridad del proceso de selección, la prueba no se puede pausar ni abandonar hasta finalizarla"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Prueba activa • Salida bloqueada</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-[#6D28D9] h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 sm:p-9 min-h-[460px] justify-between">
          <div className="space-y-6">
            
            {/* Metadata de pregunta */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Pregunta {currentIndex + 1} de {total}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                Dificultad: {currentQ.difficulty || difficulty}
              </span>
            </div>

            {/* Enunciado */}
            <div className="text-slate-900 font-semibold text-base sm:text-lg leading-relaxed">
              {currentQ.question}
            </div>

            {/* Opciones */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentSelected === option.text;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option.text)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#6D28D9] bg-purple-50/70 ring-2 ring-purple-100 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#6D28D9] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {letter}
                    </div>

                    <span className={`text-xs sm:text-sm pt-0.5 leading-relaxed font-normal ${
                      isSelected ? 'text-purple-950 font-medium' : 'text-slate-700'
                    }`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Footer Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!currentSelected}
              className={`px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white'
              }`}
            >
              <span>{isLast ? 'Finalizar Cuestionario' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

