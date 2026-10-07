import React, { useState, useEffect } from 'react';
import { EvaluationTest, QuestionCategory, TestStageConfig } from '../../types';
import { AVAILABLE_QUESTION_CATEGORIES } from '../../data/testTemplates';
import { VALIDATION_DISCLAIMER } from '../../data/questionBank';
import { 
  PlusCircle, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Trash2, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Brain,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Check,
  Building,
  Target,
  ListFilter,
  LayoutGrid,
  CheckSquare,
  Square,
  Plus
} from 'lucide-react';

interface TestManagerViewProps {
  tests: EvaluationTest[];
  activeTestId: string;
  onSelectActiveTest: (testId: string) => void;
  onCreateTest: (newTest: EvaluationTest) => void;
}

export const TestManagerView: React.FC<TestManagerViewProps> = ({
  tests,
  activeTestId,
  onSelectActiveTest,
  onCreateTest
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'CARDS'>('LIST');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state for creating a new test
  const [title, setTitle] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('Examen de avance unidireccional con cronómetro autoritativo en servidor.');

  // Selected categories state (key: category ID, value: boolean enabled)
  const [selectedCategories, setSelectedCategories] = useState<Record<QuestionCategory, boolean>>({
    PSYCHOLOGICAL: true,
    EMOTIONAL: true,
    EDUCATIONAL: false,
    COMPETENCIES: true,
    WORK_CASES: true,
    TECHNICAL: false
  });

  // Category parameters (duration, question count, weight)
  const [stageParams, setStageParams] = useState<Record<QuestionCategory, { durationMinutes: number; questionCount: number; weightPercent: number }>>({
    PSYCHOLOGICAL: { durationMinutes: 15, questionCount: 15, weightPercent: 25 },
    EMOTIONAL: { durationMinutes: 15, questionCount: 15, weightPercent: 25 },
    EDUCATIONAL: { durationMinutes: 15, questionCount: 15, weightPercent: 25 },
    COMPETENCIES: { durationMinutes: 15, questionCount: 15, weightPercent: 25 },
    WORK_CASES: { durationMinutes: 15, questionCount: 15, weightPercent: 25 },
    TECHNICAL: { durationMinutes: 15, questionCount: 15, weightPercent: 25 }
  });

  // Competencies selection state
  const [chosenCompetencies, setChosenCompetencies] = useState<string[]>([
    'Razonamiento lógico y analítico',
    'Atención al detalle y rigor documental',
    'Autorregulación emocional bajo estrés',
    'Toma de decisiones operativas inmediatas',
    'Comunicación persuasiva y asertiva'
  ]);
  const [customCompetencyInput, setCustomCompetencyInput] = useState('');

  const getCategoryIcon = (category: QuestionCategory) => {
    switch (category) {
      case 'PSYCHOLOGICAL':
        return Brain;
      case 'EMOTIONAL':
        return HeartHandshake;
      case 'EDUCATIONAL':
        return GraduationCap;
      case 'COMPETENCIES':
        return Target;
      case 'WORK_CASES':
        return Briefcase;
      case 'TECHNICAL':
        return Sliders;
      default:
        return HelpCircle;
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Toggle category on/off
  const handleToggleCategory = (catId: QuestionCategory) => {
    const nextVal = !selectedCategories[catId];
    const updated = { ...selectedCategories, [catId]: nextVal };
    setSelectedCategories(updated);

    // Auto rebalance weights equally across active stages
    const activeKeys = (Object.keys(updated) as QuestionCategory[]).filter(k => updated[k]);
    if (activeKeys.length > 0) {
      const equalWeight = Math.floor(100 / activeKeys.length);
      const remainder = 100 - (equalWeight * activeKeys.length);
      
      const newStageParams = { ...stageParams };
      activeKeys.forEach((key, idx) => {
        newStageParams[key] = {
          ...newStageParams[key],
          weightPercent: equalWeight + (idx === 0 ? remainder : 0)
        };
      });
      setStageParams(newStageParams);
    }
  };

  // Toggle competency selection
  const handleToggleCompetency = (competency: string) => {
    if (chosenCompetencies.includes(competency)) {
      setChosenCompetencies(chosenCompetencies.filter(c => c !== competency));
    } else {
      setChosenCompetencies([...chosenCompetencies, competency]);
    }
  };

  // Add custom competency
  const handleAddCustomCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCompetencyInput.trim();
    if (trimmed && !chosenCompetencies.includes(trimmed)) {
      setChosenCompetencies([...chosenCompetencies, trimmed]);
      setCustomCompetencyInput('');
      showToast(`✓ Competencia "${trimmed}" añadida.`);
    }
  };

  // Update specific category param
  const handleUpdateParam = (
    catId: QuestionCategory,
    field: 'durationMinutes' | 'questionCount' | 'weightPercent',
    value: number
  ) => {
    setStageParams(prev => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [field]: value
      }
    }));
  };

  // Active stages count and total weight
  const activeCategoriesList = AVAILABLE_QUESTION_CATEGORIES.filter(c => selectedCategories[c.id]);
  const totalWeight = activeCategoriesList.reduce((acc, c) => acc + (stageParams[c.id]?.weightPercent || 0), 0);
  const totalDuration = activeCategoriesList.reduce((acc, c) => acc + (stageParams[c.id]?.durationMinutes || 0), 0);

  // Submit new test creation
  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetPosition.trim()) {
      alert('Por favor complete el nombre del puesto a postular.');
      return;
    }

    if (activeCategoriesList.length === 0) {
      alert('Debe activar al menos un tipo de pregunta para conformar la prueba.');
      return;
    }

    if (chosenCompetencies.length === 0) {
      alert('Debe seleccionar al menos una competencia a medir para el postulante.');
      return;
    }

    const testId = `test-gea-${Date.now().toString(36)}`;
    const code = `GEA-${targetPosition.toUpperCase().replace(/\s+/g, '-').slice(0, 16)}-${new Date().getFullYear()}`;

    const stages: TestStageConfig[] = activeCategoriesList.map((cat, idx) => {
      const params = stageParams[cat.id];
      return {
        id: `stg-${testId}-${idx + 1}`,
        category: cat.id,
        name: `Etapa ${idx + 1}: ${cat.name}`,
        description: cat.description,
        durationMinutes: params.durationMinutes,
        questionCount: params.questionCount,
        weightPercent: params.weightPercent,
        isEnabled: true
      };
    });

    const newEvaluationTest: EvaluationTest = {
      id: testId,
      code,
      title: targetPosition.trim(), // El proceso tiene como título el nombre del puesto a postular
      targetPosition: targetPosition.trim(),
      description: description.trim() || `Evaluación de competencias laborales y conductuales para el puesto de ${targetPosition.trim()}.`,
      instructions: instructions.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalDurationMinutes: totalDuration,
      stages,
      selectedCompetencies: chosenCompetencies,
      candidateCount: 0,
      completedCount: 0
    };

    onCreateTest(newEvaluationTest);
    setIsCreating(false);
    setTitle('');
    setTargetPosition('');
    setDescription('');
    showToast(`✓ Proceso para "${newEvaluationTest.title}" creado con ${chosenCompetencies.length} competencias.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-zinc-700 dark:border-zinc-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP BANNER WITH ACTION */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Convocatorias & Pruebas • GEA Perú
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
            Gestor de Pruebas y Competencias
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Selecciona la prueba activa para el proceso de selección o crea una nueva definiendo el puesto, los tipos de preguntas y las competencias específicas a medir en cada postulante.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreating ? 'Cerrar diseñador' : 'Crear nueva prueba'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL AL INICIO: LISTA DE PRUEBAS PARA SELECCIONAR CON 1 CLIC           */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        
        {/* Controls: Title and View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Visual de Pruebas Disponibles (Selecciona la Convocatoria Activa)</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Haz clic en el selector para activar la prueba que regirá el examen de los postulantes en GEA Perú.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Modo Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Modo Tarjetas</span>
            </button>
          </div>
        </div>

        {/* 1. MODO LISTA (TABLA INTERACTIVA AL INICIO) */}
        {viewMode === 'LIST' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase text-[10px] font-bold">
                  <th className="p-3 text-center w-12">Estado</th>
                  <th className="p-3">Puesto a Postular (Título del Proceso)</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Etapas / Módulos</th>
                  <th className="p-3">Competencias a Medir</th>
                  <th className="p-3 text-center">Duración</th>
                  <th className="p-3 text-center">Postulantes</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tests.map((test) => {
                  const isCurrentActive = test.id === activeTestId;

                  return (
                    <tr
                      key={test.id}
                      onClick={() => onSelectActiveTest(test.id)}
                      className={`cursor-pointer transition-colors ${
                        isCurrentActive
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 font-medium'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Radio / Selection Indicator */}
                      <td className="p-3 text-center">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mx-auto transition-colors ${
                          isCurrentActive
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                        }`}>
                          {isCurrentActive && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </td>

                      {/* Position Name / Process Title */}
                      <td className="p-3">
                        <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {test.title}
                        </div>
                        <span className="text-[11px] text-zinc-500 line-clamp-1">
                          {test.description}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="p-3 font-mono text-[11px] text-zinc-500">
                        {test.code}
                      </td>

                      {/* Stages Badges */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {test.stages.map((stg) => {
                            const CatIcon = getCategoryIcon(stg.category);
                            return (
                              <span
                                key={stg.id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                              >
                                <CatIcon className="w-2.5 h-2.5 text-blue-600" />
                                <span>{stg.name.split('(')[0].replace('Etapa ', '')}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Competencies Badges */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {test.selectedCompetencies?.slice(0, 3).map((comp, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            >
                              {comp}
                            </span>
                          ))}
                          {(test.selectedCompetencies?.length || 0) > 3 && (
                            <span className="text-[10px] text-zinc-400 font-semibold px-1 py-0.5">
                              +{(test.selectedCompetencies?.length || 0) - 3} más
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="p-3 text-center font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {test.totalDurationMinutes}m
                      </td>

                      {/* Candidates count */}
                      <td className="p-3 text-center font-mono">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{test.candidateCount}</span>
                        <span className="text-[10px] text-zinc-400 block">({test.completedCount} concl.)</span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Activa</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectActiveTest(test.id);
                              showToast(`✓ Prueba seleccionada: ${test.title}`);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Seleccionar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. MODO TARJETAS (GRID VIEW) */}
        {viewMode === 'CARDS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {tests.map((test) => {
              const isCurrentActive = test.id === activeTestId;

              return (
                <div
                  key={test.id}
                  onClick={() => onSelectActiveTest(test.id)}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isCurrentActive
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {test.code}
                      </span>
                      {isCurrentActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Prueba Activa</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-semibold text-[10px]">
                          Disponible
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
                      {test.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {test.description}
                    </p>

                    {/* Competencies Badges */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                        Competencias que mide ({test.selectedCompetencies?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {test.selectedCompetencies?.map((comp, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-500 font-semibold">
                      {test.totalDurationMinutes} min • {test.candidateCount} postulantes
                    </span>

                    {isCurrentActive ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                        ✓ Seleccionada
                      </span>
                    ) : (
                      <span className="text-zinc-400 hover:text-blue-600 font-semibold">
                        Clic para activar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* FORM: CREAR NUEVA PRUEBA CON ELECCIÓN DE COMPETENCIAS (DESPLEGABLE)      */}
      {/* ========================================================================= */}
      {isCreating && (
        <form onSubmit={handleSaveTest} className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-blue-500/40 dark:border-blue-600/40 rounded-3xl shadow-xl space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Diseñador de Evaluaciones • GEA Perú
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Creación de Proceso y Selección de Competencias
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Batería GEA Perú</span>
          </div>

          {/* PASO 1: PUESTO A POSTULAR (TÍTULO DEL PROCESO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Puesto a postular (Título del Proceso) *
              </label>
              <input
                type="text"
                required
                value={targetPosition}
                onChange={e => {
                  const val = e.target.value;
                  setTargetPosition(val);
                  setTitle(val); // El proceso creado tiene como título el nombre del puesto a postular
                }}
                placeholder="Ej. Supervisor de Atención y Ventanilla"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-blue-300 dark:border-blue-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Define el título oficial con el que se identificará este proceso de selección en GEA Perú.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Código de convocatoria
              </label>
              <input
                type="text"
                readOnly
                value={targetPosition ? `GEA-${targetPosition.toUpperCase().replace(/\s+/g, '-').slice(0, 16)}-2026` : 'GEA-CONV-2026'}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-mono"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Generado automáticamente para la trazabilidad del proceso.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              Descripción del objetivo de la evaluación
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describa el perfil y competencias esperadas para el puesto…"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
            />
          </div>

          {/* PASO 2: SELECCIÓN DE TIPOS DE PREGUNTAS / ETAPAS */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Paso 2 de 3 • Tipos de Preguntas & Ponderación
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Selecciona los tipos de preguntas para las etapas del examen
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                  {activeCategoriesList.length} etapas activas
                </span>
                <span className={`px-3 py-1 rounded-full font-bold ${
                  totalWeight === 100
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  Ponderación: {totalWeight}% {totalWeight !== 100 && '(Ajustar a 100%)'}
                </span>
              </div>
            </div>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {AVAILABLE_QUESTION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories[cat.id];
                const CatIcon = getCategoryIcon(cat.id);
                const params = stageParams[cat.id];

                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {cat.name}
                          </h5>
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                            {cat.badgeLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border border-zinc-300 dark:border-zinc-700 text-transparent hover:border-blue-400'
                        }`}
                        aria-label={`Activar tipo ${cat.name}`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {cat.description}
                    </p>

                    {isSelected && (
                      <div className="pt-2.5 border-t border-blue-200/60 dark:border-blue-900/60 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Tiempo</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={5}
                              max={60}
                              value={params.durationMinutes}
                              onChange={e => handleUpdateParam(cat.id, 'durationMinutes', parseInt(e.target.value) || 15)}
                              className="w-12 p-1 text-center font-mono font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs"
                            />
                            <span className="text-[10px] text-zinc-400">min</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Preguntas</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={5}
                              max={40}
                              value={params.questionCount}
                              onChange={e => handleUpdateParam(cat.id, 'questionCount', parseInt(e.target.value) || 15)}
                              className="w-12 p-1 text-center font-mono font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs"
                            />
                            <span className="text-[10px] text-zinc-400">react.</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Ponderación</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={params.weightPercent}
                              onChange={e => handleUpdateParam(cat.id, 'weightPercent', parseInt(e.target.value) || 25)}
                              className="w-12 p-1 text-center font-mono font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-blue-600 dark:text-blue-400"
                            />
                            <span className="text-[10px] text-zinc-400">%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PASO 3: ELECCIÓN DE COMPETENCIAS ESPECÍFICAS A MEDIR PARA EL POSTULANTE   */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Paso 3 de 3 • Elección de Competencias a Medir
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Selecciona las competencias que se medirán en el postulante</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Estas competencias alimentarán el informe psicolaboral y las preguntas sugeridas para la entrevista.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs shrink-0">
                {chosenCompetencies.length} competencias elegidas
              </span>
            </div>

            {/* Competency Pool Selection grouped by active categories */}
            <div className="space-y-4">
              {activeCategoriesList.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      {cat.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold">
                      {cat.badgeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.competencies.map((comp) => {
                      const isChecked = chosenCompetencies.includes(comp);
                      return (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => handleToggleCompetency(comp)}
                          className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 rounded flex items-center justify-center ${
                            isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                          }`}>
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </div>
                          <span className="text-xs leading-snug">{comp}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add Custom Competency */}
              <div className="p-4 rounded-2xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  ¿Deseas agregar una competencia específica adicional?
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCompetencyInput}
                    onChange={e => setCustomCompetencyInput(e.target.value)}
                    placeholder="Ej. Criterio de compras públicas / Conocimiento de ERP SAP"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCompetency}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Psychological Compliance Notice */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Cumplimiento Institucional:</strong> {VALIDATION_DISCLAIMER} Cada competencia seleccionada cuenta con rúbrica psicométrica validada bajo la Ley N° 29733.
              </span>
            </div>

          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Publicar y Guardar Prueba</span>
              <Check className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
