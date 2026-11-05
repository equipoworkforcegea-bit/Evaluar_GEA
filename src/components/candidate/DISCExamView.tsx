import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Wifi, Lock, ShieldCheck } from 'lucide-react';
import discMirrorImg from '../../assets/disc_mirror.jpg';
import discColleaguesImg from '../../assets/disc_colleagues.jpg';
import { EvaluacionesService } from '../../services/evaluacionesService';
import { NotificacionesService } from '../../services/notificacionesService';

const SECTION1_BLOCKS: { left: string[]; right: string[] }[] = [
  // Block 1 (Question 2)
  {
    left: ['Independiente', 'Influyente', 'Cuestionador', 'Autocontrolado', 'Disciplinado', 'Busca resultados', 'Espontáneo', 'Tranquilo'],
    right: ['Cumplido', 'Obediente', 'Reflexivo', 'Flexible', 'Negociador', 'Buena escucha', 'Insistente', 'Meticuloso'],
  },
  // Block 2 (Question 3)
  {
    left: ['Extrovertido', 'Tenaz', 'Cooperador', 'Entusiasta', 'Autosuficiente', 'Convincente', 'Ideas firmes', 'Preciso'],
    right: ['Estable', 'Perceptivo', 'Enérgico', 'Discreto', 'Equilibrado', 'Perfeccionista', 'Dispuesto', 'Paciente'],
  },
  // Block 3 (Question 4)
  {
    left: ['Directo', 'Sociable', 'Leal', 'Analítico', 'Valiente', 'Optimista', 'Servicial', 'Exacto'],
    right: ['Confiado', 'Expresivo', 'Sincero', 'Ordenado', 'Ambicioso', 'Creativo', 'Formal', 'Cuidadoso'],
  },
  // Block 4 (Question 5)
  {
    left: ['Decidido', 'Persuasivo', 'Tolerante', 'Sistemático', 'Audaz', 'Entusiasta', 'Paciente', 'Detallista'],
    right: ['Competitivo', 'Comunicativo', 'Estable', 'Riguroso', 'Dinámico', 'Empático', 'Constante', 'Preciso'],
  },
];

const SECTION2_BLOCKS: { left: string[]; right: string[] }[] = [
  // Block 1 (Question 7)
  {
    left: ['Dominante', 'Entusiasta', 'Paciente', 'Concienzudo', 'Seguro', 'Optimista', 'Tranquilo', 'Exacto'],
    right: ['Enérgico', 'Sociable', 'Constante', 'Cuidadoso', 'Impulsivo', 'Expresivo', 'Formal', 'Analítico'],
  },
  // Block 2 (Question 8)
  {
    left: ['Rápido', 'Amigable', 'Comprensivo', 'Perfeccionista', 'Decidido', 'Motivador', 'Colaborativo', 'Detallista'],
    right: ['Agresivo', 'Hablador', 'Leal', 'Cauteloso', 'Fuerte', 'Persuasivo', 'Estable', 'Ordenado'],
  },
  // Block 3 (Question 9)
  {
    left: ['Independiente', 'Popular', 'Confiable', 'Preciso', 'Controlador', 'Animado', 'Servicial', 'Sistemático'],
    right: ['Directo', 'Expresivo', 'Paciente', 'Riguroso', 'Audaz', 'Empático', 'Formal', 'Metódico'],
  },
  // Block 4 (Question 10)
  {
    left: ['Competitivo', 'Entusiasta', 'Tolerante', 'Minucioso', 'Exigente', 'Creativo', 'Tranquilo', 'Disciplinado'],
    right: ['Impetuoso', 'Sociable', 'Constante', 'Exacto', 'Ambicioso', 'Comunicativo', 'Paciente', 'Cuidadoso'],
  },
];

interface DISCAnswers {
  [blockKey: string]: string[];
}

interface DISCExamViewProps {
  processName?: string;
  candidateId?: string;
  processId?: string;
  onComplete: (answers: DISCAnswers) => void;
  onExit?: () => void;
}

export const DISCExamView: React.FC<DISCExamViewProps> = ({
  processName,
  candidateId,
  processId,
  onComplete,
  onExit,
}) => {
  const TOTAL_QUESTIONS = 10;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<DISCAnswers>({});

  // Bloqueo estricto de navegación/cierre mientras la prueba está activa
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'La evaluación DISC está en curso. Si sales ahora, tus respuestas se registrarán incompletas.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const getBlockKey = (q: number): string => {
    if (q >= 2 && q <= 5) return `s1_b${q - 1}`;
    if (q >= 7 && q <= 10) return `s2_b${q - 6}`;
    return '';
  };

  const currentBlockKey = getBlockKey(currentQuestion);
  const currentSelected = answers[currentBlockKey] || [];

  const handleToggle = (word: string) => {
    if (!currentBlockKey) return;
    setAnswers((prev) => {
      const existing = prev[currentBlockKey] || [];
      if (existing.includes(word)) {
        return {
          ...prev,
          [currentBlockKey]: existing.filter((w) => w !== word),
        };
      }
      if (existing.length >= 5) {
        return prev;
      }
      return {
        ...prev,
        [currentBlockKey]: [...existing, word],
      };
    });
  };

  const canGoNext = (): boolean => {
    if (currentQuestion === 1 || currentQuestion === 6) return true;
    return currentSelected.length === 5;
  };

  const handleNext = async () => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion((q) => q + 1);
    } else {
      // Calcular patrones D, I, S, C a partir de las palabras seleccionadas
      const dWords = new Set(['Independiente', 'Cuestionador', 'Busca resultados', 'Insistente', 'Tenaz', 'Autosuficiente', 'Ideas firmes', 'Directo', 'Valiente', 'Ambicioso', 'Decidido', 'Audaz', 'Competitivo', 'Dinámico', 'Dominante', 'Seguro', 'Enérgico', 'Impulsivo', 'Rápido', 'Agresivo', 'Fuerte', 'Controlador', 'Exigente', 'Impetuoso']);
      const iWords = new Set(['Influyente', 'Espontáneo', 'Flexible', 'Negociador', 'Extrovertido', 'Entusiasta', 'Convincente', 'Sociable', 'Optimista', 'Expresivo', 'Creativo', 'Persuasivo', 'Comunicativo', 'Empático', 'Popular', 'Animado', 'Hablador', 'Motivador']);
      const sWords = new Set(['Autocontrolado', 'Tranquilo', 'Obediente', 'Reflexivo', 'Buena escucha', 'Cooperador', 'Estable', 'Perceptivo', 'Discreto', 'Equilibrado', 'Dispuesto', 'Paciente', 'Leal', 'Servicial', 'Confiado', 'Sincero', 'Tolerante', 'Constante', 'Amigable', 'Comprensivo', 'Colaborativo', 'Confiable']);
      const cWords = new Set(['Disciplinado', 'Cumplido', 'Meticuloso', 'Preciso', 'Perfeccionista', 'Analítico', 'Exacto', 'Ordenado', 'Formal', 'Cuidadoso', 'Sistemático', 'Detallista', 'Riguroso', 'Concienzudo', 'Cauteloso', 'Metódico', 'Minucioso']);

      let conteoD = 0, conteoI = 0, conteoS = 0, conteoC = 0;
      Object.values(answers).forEach((wordList) => {
        wordList.forEach((w) => {
          if (dWords.has(w)) conteoD++;
          else if (iWords.has(w)) conteoI++;
          else if (sWords.has(w)) conteoS++;
          else if (cWords.has(w)) conteoC++;
        });
      });

      const maxVal = Math.max(conteoD, conteoI, conteoS, conteoC);
      let perfilDominante = 'Equilibrado';
      if (conteoD === maxVal) perfilDominante = 'D - Dominante / Orientado a Resultados';
      else if (conteoI === maxVal) perfilDominante = 'I - Influyente / Comunicador';
      else if (conteoS === maxVal) perfilDominante = 'S - Estable / Cooperador';
      else if (conteoC === maxVal) perfilDominante = 'C - Concienzudo / Analítico';

      // Guardar en Supabase y respaldo local
      await EvaluacionesService.guardarResultadoDISC({
        candidatoId: candidateId || 'cand_invitado',
        procesoId: processId || 'proc_invitado',
        respuestas: answers,
        conteoD,
        conteoI,
        conteoS,
        conteoC,
        perfilDominante
      });

      // Disparar notificación en tiempo real
      NotificacionesService.crearNotificacion({
        tipo: 'CANDIDATO_COMPLETO',
        titulo: 'Postulante completó prueba DISC',
        mensaje: `Evaluación conductual DISC finalizada con perfil "${perfilDominante}".`,
        candidato_id: candidateId,
        proceso_id: processId
      });

      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((q) => q - 1);
    }
  };

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
              <span className="text-[10px] text-slate-400">Evaluación Oficial</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-[#1F2A5E] text-base tracking-wide">DISC</span>
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBFDF2] border border-[#A6F4C5] text-[#027A48] text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              Online
            </span>
          </div>

          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium cursor-help"
            title="Por seguridad del proceso de selección, la prueba no se puede pausar ni abandonar hasta finalizarla"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Prueba activa • Salida bloqueada</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 min-h-[460px] justify-between">
          {/* Question 1: Intro Section 1 */}
          {currentQuestion === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-6">
              <div className="text-zinc-600 font-normal leading-relaxed text-sm sm:text-base">
                Del siguiente listado, escoge las palabras que<br />
                <span className="font-bold text-zinc-900 tracking-wide uppercase">
                  MEJOR TE DESCRIBEN DENTRO DEL TRABAJO
                </span>
              </div>

              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <img
                  src={discMirrorImg}
                  alt="Auto-descripción en el trabajo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              <p className="text-xs sm:text-sm text-zinc-400">
                Esta es una sección informativa. Haz clic en &quot;Siguiente&quot; para continuar.
              </p>
            </div>
          )}

          {/* Questions 2-5: Section 1 Blocks */}
          {currentQuestion >= 2 && currentQuestion <= 5 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base text-zinc-800 font-semibold leading-snug">
                  Del siguiente listado, escoge las palabras que MEJOR TE DESCRIBEN DENTRO DEL TRABAJO
                </p>
                <p className="text-xs text-zinc-400 italic">
                  Debe marcar 5 palabras exactamente (ni mas, ni menos)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl mx-auto pt-2">
                {/* Columna Izquierda */}
                <div className="space-y-2">
                  {SECTION1_BLOCKS[currentQuestion - 2].left.map((word) => {
                    const isSelected = currentSelected.includes(word);
                    const isDisabled = !isSelected && currentSelected.length >= 5;
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => !isDisabled && handleToggle(word)}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-sm transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#6851FF] bg-[#F5F3FF] text-[#1F2A5E] font-medium shadow-xs'
                            : isDisabled
                            ? 'border-zinc-200/60 bg-zinc-50/50 text-zinc-400 cursor-not-allowed'
                            : 'border-zinc-200 bg-white hover:border-[#6851FF]/50 hover:bg-zinc-50/70 text-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#6851FF] bg-[#6851FF] text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{word}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Columna Derecha */}
                <div className="space-y-2">
                  {SECTION1_BLOCKS[currentQuestion - 2].right.map((word) => {
                    const isSelected = currentSelected.includes(word);
                    const isDisabled = !isSelected && currentSelected.length >= 5;
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => !isDisabled && handleToggle(word)}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-sm transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#6851FF] bg-[#F5F3FF] text-[#1F2A5E] font-medium shadow-xs'
                            : isDisabled
                            ? 'border-zinc-200/60 bg-zinc-50/50 text-zinc-400 cursor-not-allowed'
                            : 'border-zinc-200 bg-white hover:border-[#6851FF]/50 hover:bg-zinc-50/70 text-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#6851FF] bg-[#6851FF] text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{word}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <span
                  className={`text-xs font-semibold px-3.5 py-1 rounded-full border transition-all ${
                    currentSelected.length === 5
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                  }`}
                >
                  {currentSelected.length === 5
                    ? '✓ 5 palabras seleccionadas'
                    : `${currentSelected.length} / 5 palabras seleccionadas`}
                </span>
              </div>
            </div>
          )}

          {/* Question 6: Intro Section 2 */}
          {currentQuestion === 6 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-6">
              <div className="text-zinc-600 font-normal leading-relaxed text-sm sm:text-base">
                Del siguiente listado, escoge las palabras que mejor describen<br />
                <span className="font-bold text-zinc-900 tracking-wide uppercase">
                  LO QUE PIENSAN TUS COMPAÑEROS SOBRE TI
                </span>
              </div>

              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <img
                  src={discColleaguesImg}
                  alt="Opinión de compañeros"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              <p className="text-xs sm:text-sm text-zinc-400">
                Esta es una sección informativa. Haz clic en &quot;Siguiente&quot; para continuar.
              </p>
            </div>
          )}

          {/* Questions 7-10: Section 2 Blocks */}
          {currentQuestion >= 7 && currentQuestion <= 10 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base text-zinc-800 font-semibold leading-snug">
                  Del siguiente listado, escoge las palabras que mejor describen LO QUE PIENSAN TUS COMPAÑEROS SOBRE TI
                </p>
                <p className="text-xs text-zinc-400 italic">
                  Debe marcar 5 palabras exactamente (ni mas, ni menos)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl mx-auto pt-2">
                {/* Columna Izquierda */}
                <div className="space-y-2">
                  {SECTION2_BLOCKS[currentQuestion - 7].left.map((word) => {
                    const isSelected = currentSelected.includes(word);
                    const isDisabled = !isSelected && currentSelected.length >= 5;
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => !isDisabled && handleToggle(word)}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-sm transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#6851FF] bg-[#F5F3FF] text-[#1F2A5E] font-medium shadow-xs'
                            : isDisabled
                            ? 'border-zinc-200/60 bg-zinc-50/50 text-zinc-400 cursor-not-allowed'
                            : 'border-zinc-200 bg-white hover:border-[#6851FF]/50 hover:bg-zinc-50/70 text-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#6851FF] bg-[#6851FF] text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{word}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Columna Derecha */}
                <div className="space-y-2">
                  {SECTION2_BLOCKS[currentQuestion - 7].right.map((word) => {
                    const isSelected = currentSelected.includes(word);
                    const isDisabled = !isSelected && currentSelected.length >= 5;
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => !isDisabled && handleToggle(word)}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-sm transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-[#6851FF] bg-[#F5F3FF] text-[#1F2A5E] font-medium shadow-xs'
                            : isDisabled
                            ? 'border-zinc-200/60 bg-zinc-50/50 text-zinc-400 cursor-not-allowed'
                            : 'border-zinc-200 bg-white hover:border-[#6851FF]/50 hover:bg-zinc-50/70 text-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#6851FF] bg-[#6851FF] text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{word}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <span
                  className={`text-xs font-semibold px-3.5 py-1 rounded-full border transition-all ${
                    currentSelected.length === 5
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                  }`}
                >
                  {currentSelected.length === 5
                    ? '✓ 5 palabras seleccionadas'
                    : `${currentSelected.length} / 5 palabras seleccionadas`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-t border-zinc-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentQuestion === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-400 text-[#6851FF] font-semibold text-sm hover:bg-violet-50 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="text-sm font-semibold text-zinc-500">
            Pregunta <span className="font-bold text-zinc-900">{currentQuestion}</span>{' '}
            <span className="text-zinc-400">/ {TOTAL_QUESTIONS}</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
              canGoNext()
                ? 'bg-[#6851FF] hover:bg-[#5841EF] text-white shadow-violet-500/25 cursor-pointer active:scale-98'
                : 'bg-[#C3B8FE] text-white cursor-not-allowed shadow-none'
            }`}
          >
            {currentQuestion === TOTAL_QUESTIONS ? 'Finalizar' : 'Siguiente'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {processName && (
        <div className="text-center pt-3 text-xs text-zinc-400 font-medium">
          {processName}
        </div>
      )}
    </div>
  );
};
