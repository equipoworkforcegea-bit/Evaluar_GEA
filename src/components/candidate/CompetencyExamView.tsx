import React, { useState, useEffect, useMemo } from 'react';
import { RotateCw, ArrowLeft, ArrowRight, Wifi, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getCompetencyTestBlocks, CompetencyTestBlock, CompetencyBehaviorStatement } from '../../data/competencyTestsData';
import { EvaluacionesService } from '../../services/evaluacionesService';

interface CompetencyExamViewProps {
  competencyName: string;
  candidateId: string;
  processId?: string;
  onComplete: (score: number, level: string) => void;
  onExit?: () => void;
}

export const CompetencyExamView: React.FC<CompetencyExamViewProps> = ({
  competencyName,
  candidateId,
  processId,
  onComplete
}) => {
  // Cargar bloques de evaluación adaptados específicamente a la competencia
  const blocks: CompetencyTestBlock[] = useMemo(() => {
    return getCompetencyTestBlocks(competencyName, 10);
  }, [competencyName]);

  const totalBlocks = blocks.length;
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // Almacenar las respuestas: blockIndex -> { statementId: rank (1=Primero, 2=Segundo, 3=Tercero, 4=Cuarto) }
  const [responses, setResponses] = useState<Record<number, Record<string, number>>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalLevel, setFinalLevel] = useState<string>('Avanzado');
  const [startTime] = useState<number>(() => Date.now());

  // Bloque actual
  const currentBlock = blocks[currentBlockIndex] || blocks[0];
  const currentBlockSelections = responses[currentBlockIndex] || {};

  // Prevenir cierre accidental de pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCompleted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCompleted]);

  // Asignar rango a un enunciado respetando la unicidad ipsativa
  const handleSelectRank = (statementId: string, rank: number) => {
    setResponses(prev => {
      const current = { ...(prev[currentBlockIndex] || {}) };

      // Si otro enunciado ya tenía este mismo rango, lo deseleccionamos para garantizar unicidad por columna
      Object.keys(current).forEach(id => {
        if (current[id] === rank && id !== statementId) {
          delete current[id];
        }
      });

      // Asignar el nuevo rango al enunciado seleccionado
      current[statementId] = rank;

      return {
        ...prev,
        [currentBlockIndex]: current
      };
    });
  };

  // Botón de reinicio (↻): Limpia las asignaciones del bloque actual
  const handleResetCurrentBlock = () => {
    setResponses(prev => {
      const copy = { ...prev };
      delete copy[currentBlockIndex];
      return copy;
    });
  };

  // Verificar si las 4 opciones del bloque actual han sido asignadas
  const isCurrentBlockComplete = useMemo(() => {
    if (!currentBlock || !currentBlock.behaviors) return false;
    const assignedRanks = Object.values(currentBlockSelections);
    // Deben estar seleccionados los rangos 1, 2, 3 y 4 exactamente
    return [1, 2, 3, 4].every(rank => assignedRanks.includes(rank));
  }, [currentBlock, currentBlockSelections]);

  const handleNext = async () => {
    if (!isCurrentBlockComplete) return;

    if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      // Finalizar examen y calcular puntaje
      await finishExam();
    }
  };

  const handlePrev = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
    }
  };

  const finishExam = async () => {
    setIsSaving(true);
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

    // Algoritmo psicométrico ipsativo:
    // Ponderación de rango asignado:
    // Primero = 4, Segundo = 3, Tercero = 2, Cuarto = 1
    // Puntaje por ítem = statement.level * rankWeight
    const rankWeights: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };
    let totalAchieved = 0;
    let maxPossible = 0;
    let minPossible = 0;

    blocks.forEach((block, bIdx) => {
      const blockSelections = responses[bIdx] || {};
      block.behaviors.forEach(behavior => {
        const assignedRank = blockSelections[behavior.id] || 4;
        const weight = rankWeights[assignedRank] || 1;
        totalAchieved += behavior.level * weight;
      });
      // En cada bloque con niveles 4, 3, 2, 1:
      // Max = 4*4 + 3*3 + 2*2 + 1*1 = 16 + 9 + 4 + 1 = 30
      // Min = 4*1 + 3*2 + 2*3 + 1*4 = 4 + 6 + 6 + 4 = 20
      maxPossible += 30;
      minPossible += 20;
    });

    const range = maxPossible - minPossible;
    const normalizedRatio = range > 0 ? Math.max(0, Math.min(1, (totalAchieved - minPossible) / range)) : 0.5;
    
    // Escala estándar peruana 0 a 20 pts
    const score20 = Math.round((normalizedRatio * 20) * 10) / 10;
    setFinalScore(score20);

    let levelStr = 'Básico';
    if (score20 >= 17) levelStr = 'Sobresaliente';
    else if (score20 >= 14) levelStr = 'Avanzado';
    else if (score20 >= 11) levelStr = 'Intermedio';
    else levelStr = 'Básico';

    setFinalLevel(levelStr);

    // Guardar mediante EvaluacionesService
    await EvaluacionesService.guardarResultadoCompetencia({
      candidatoId,
      procesoId: processId || 'proc_default',
      competencia: competencyName,
      puntaje: score20,
      puntajeMaximo: 20,
      nivel: levelStr,
      totalBloques: totalBlocks,
      respuestas: responses,
      tiempoSegundos: elapsedSeconds
    });

    setIsSaving(false);
    setIsCompleted(true);
  };

  // Pantalla de Felicitación / Finalización
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#F4F5F9] dark:bg-[#0f1424] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#182044] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ¡Evaluación Completada!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Has finalizado la evaluación conductual de la competencia:
            </p>
            <p className="text-sm font-semibold text-[#6355A4] dark:text-[#a794ff]">
              {competencyName}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121936] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Puntaje Obtenido:</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {finalScore} / 20 pts
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Nivel de Desempeño:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {finalLevel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onComplete(finalScore, finalLevel)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#6355A4] hover:bg-[#52448d] text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
          >
            Volver a Mis Evaluaciones
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    { label: 'Primero', rank: 1 },
    { label: 'Segundo', rank: 2 },
    { label: 'Tercero', rank: 3 },
    { label: 'Cuarto', rank: 4 }
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F9] dark:bg-[#0f1424] flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-[860px] bg-white dark:bg-[#182044] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in">
        
        {/* ============================================================== */}
        {/* HEADER SUPERIOR: EVALUAR LOGO | CONDUCT... | ONLINE BADGE     */}
        {/* ============================================================== */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {/* Logo evaluar oficial */}
          <div className="flex items-center gap-1 font-sans">
            <span className="text-rose-500 text-2xl sm:text-3xl font-extrabold italic leading-none">e</span>
            <span className="text-[#1F2A5E] dark:text-white text-xl sm:text-2xl font-bold tracking-tight">valuar</span>
          </div>

          {/* Título central truncado tipo 'Conduct...' */}
          <div className="text-center px-2">
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              Conduct...
            </span>
          </div>

          {/* Badge Online con señal de wifi */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            <span>Online</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBTÍTULO / INSTRUCCIÓN CONDUCTUAL                             */}
        {/* ============================================================== */}
        <div className="px-6 sm:px-8 pt-6 pb-4">
          <p className="text-center sm:text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Ordene los comportamientos, empezando por el que <strong className="text-slate-900 dark:text-white font-bold">MÁS</strong> se asemeje a su manera de actuar.
          </p>
        </div>

        {/* ============================================================== */}
        {/* MATRIZ DE COMPORTAMIENTOS E IPSATIVIDAD                         */}
        {/* ============================================================== */}
        <div className="px-4 sm:px-8 pb-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                {/* Botón de reinicio ↻ en la cabecera izquierda */}
                <th className="py-3 px-2 w-[45px] text-center">
                  <button
                    type="button"
                    onClick={handleResetCurrentBlock}
                    title="Reiniciar selecciones de esta pregunta"
                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-purple-400 text-slate-500 hover:text-purple-600 flex items-center justify-center transition-all cursor-pointer active:scale-95 bg-white dark:bg-slate-800"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Comportamiento
                </th>
                {columns.map(col => (
                  <th key={col.rank} className="py-3 px-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 w-[85px] sm:w-[95px]">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {currentBlock.behaviors.map((item: CompetencyBehaviorStatement) => {
                const assignedRank = currentBlockSelections[item.id];

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors"
                  >
                    {/* Espaciador izquierdo */}
                    <td className="py-4 px-2 text-center"></td>

                    {/* Texto del comportamiento */}
                    <td className="py-4 px-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug font-normal pr-4">
                      {item.text}
                    </td>

                    {/* 4 Columnas de Selección (Primero, Segundo, Tercero, Cuarto) */}
                    {columns.map(col => {
                      const isSelected = assignedRank === col.rank;

                      return (
                        <td 
                          key={col.rank} 
                          className="py-4 px-3 text-center align-middle"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectRank(item.id, col.rank)}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer focus:outline-hidden transition-all group"
                            aria-label={`Asignar ${col.label} a: ${item.text}`}
                          >
                            <span 
                              className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#6355A4] bg-[#6355A4] shadow-xs'
                                  : 'border-slate-300 dark:border-slate-600 group-hover:border-[#6355A4]/60'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-white animate-in zoom-in-75" />
                              )}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* FOOTER DE NAVEGACIÓN: ANTERIOR | PREGUNTA X / N | SIGUIENTE    */}
        {/* ============================================================== */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-4">
          
          {/* Botón Anterior */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentBlockIndex === 0}
            className={`px-4 sm:px-5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
              currentBlockIndex === 0
                ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-98'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          {/* Contador de pregunta central: Pregunta X / N */}
          <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            Pregunta <span className="font-bold text-[#6355A4] dark:text-[#a794ff]">{currentBlockIndex + 1}</span> / {totalBlocks}
          </div>

          {/* Botón Siguiente / Finalizar */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentBlockComplete || isSaving}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
              !isCurrentBlockComplete || isSaving
                ? 'bg-[#B4AEE8] dark:bg-purple-950/40 text-white cursor-not-allowed opacity-60'
                : 'bg-[#6355A4] hover:bg-[#52448d] text-white cursor-pointer shadow-md active:scale-98'
            }`}
          >
            <span>
              {isSaving 
                ? 'Guardando...' 
                : currentBlockIndex === totalBlocks - 1 
                  ? 'Finalizar' 
                  : 'Siguiente'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
