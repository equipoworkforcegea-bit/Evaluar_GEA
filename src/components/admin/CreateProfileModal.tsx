import React, { useState, useMemo } from 'react';
import { EvaluationTest, TestStageConfig } from '../../types';
import { 
  X, 
  User, 
  Briefcase, 
  Clock, 
  Check, 
  Layers, 
  Sparkles,
  FileText,
  Sliders,
  GraduationCap,
  Gauge,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  Smile,
  Target,
  CheckCircle2
} from 'lucide-react';

interface CreateProfileModalProps {
  onClose: () => void;
  onCreateProfile: (profile: EvaluationTest) => void;
}

export type DifficultyLevel = 'BAJO' | 'MEDIO' | 'ALTO';

const RYS_COMPETENCIES_CATALOG = [
  { id: 'c1', name: 'Razonamiento Lógico & Análisis', description: 'Capacidad de deducción analítica y detección de patrones' },
  { id: 'c2', name: 'Autorregulación Emocional bajo Presión', description: 'Manejo del estrés, tolerancia a la frustración y calma' },
  { id: 'c3', name: 'Toma de Decisiones en Contingencias', description: 'Criterio ágil y asertivo ante situaciones operativas imprevistas' },
  { id: 'c4', name: 'Orientación a Resultados & Eficiencia', description: 'Enfoque en metas cuantitativas y calidad operativa' },
  { id: 'c5', name: 'Atención al Cliente & Empatía', description: 'Escucha activa, calidez en el trato y resolución de reclamos' },
  { id: 'c6', name: 'Liderazgo & Gestión de Equipos', description: 'Capacidad de coordinación, motivación y supervisión' },
  { id: 'c7', name: 'Negociación Asertiva', description: 'Persuasión ética, manejo de objeciones y acuerdos comerciales' },
  { id: 'c8', name: 'Agilidad de Aprendizaje', description: 'Asimilación rápida de nuevos sistemas y procedimientos' },
  { id: 'c9', name: 'Adaptabilidad al Cambio Organizacional', description: 'Flexibilidad ante modificaciones de turnos, procesos y metas' },
  { id: 'c10', name: 'Comunicación Escrita & Ortografía', description: 'Redacción clara, sintaxis correcta y registro de tickets' },
  { id: 'c11', name: 'Alineamiento Ético & Cumplimiento', description: 'Adherencia estricta a políticas de confidencialidad y normas' }
];

// Sample questions generated based on difficulty level
const GENERATED_QUESTIONS_BY_DIFFICULTY: Record<DifficultyLevel, Array<{
  category: string;
  question: string;
  type: string;
}>> = {
  BAJO: [
    {
      category: 'Psicopedagógica (Cognitiva)',
      question: 'Si una llamada debe registrarse en 3 pasos secuenciales A, B y C, y el paso B no se realiza, ¿cuál es el estado de la gestión?',
      type: 'Lógica básica'
    },
    {
      category: 'RYS - Competencias',
      question: 'Un cliente solicita información básica sobre su saldo. ¿Cuál es el saludo y procedimiento inicial adecuado?',
      type: 'Atención al Cliente'
    },
    {
      category: 'Autorregulación Emocional',
      question: 'Cuando un usuario habla en tono molesto sin insultar, mi reacción habitual es:',
      type: 'Tolerancia y Escucha'
    },
    {
      category: 'Casos Laborales',
      question: 'Identifica la opción correcta para agendar una cita según el horario estándar de atención.',
      type: 'Seguimiento de normas'
    }
  ],
  MEDIO: [
    {
      category: 'Psicopedagógica (Cognitiva)',
      question: 'Tres asesores atienden 150 consultas en 5 horas a ritmo constante. ¿Cuántos asesores se requerirán para 300 consultas en 4 horas?',
      type: 'Razonamiento lógico-matemático'
    },
    {
      category: 'RYS - Competencias',
      question: 'Ante un cliente con reclamo recurrente no resuelto en 48 horas, ¿qué acción priorizas entre retención comercial o derivación a supervisor?',
      type: 'Toma de Decisiones & Empatía'
    },
    {
      category: 'Autorregulación Emocional',
      question: 'Al recibir retroalimentación correctiva directa sobre un error involuntario en métricas:',
      type: 'Resiliencia y Feedback'
    },
    {
      category: 'Casos Laborales',
      question: 'El sistema principal de facturación presenta intermitencia durante una llamada de alta complejidad. ¿Cómo procedes?',
      type: 'Gestión de Contingencias'
    }
  ],
  ALTO: [
    {
      category: 'Psicopedagógica (Cognitiva)',
      question: 'Análisis de matriz relacional compleja: Deduce el patrón de contingencia considerando variables condicionales cruzadas y márgenes de error acumulativo.',
      type: 'Pensamiento crítico superior'
    },
    {
      category: 'RYS - Competencias',
      question: 'Dilema ético-estratégico: Se detecta una discrepancia en los KPIs del equipo que favorece el bono grupal pero distorsiona el reporte oficial a gerencia.',
      type: 'Alineamiento Ético & Liderazgo'
    },
    {
      category: 'Autorregulación Emocional',
      question: 'Gestión en escenarios de alta presión sostenida con clientes corporativos VIP y riesgo de penalidad contractual:',
      type: 'Inteligencia Emocional Avanzada'
    },
    {
      category: 'Casos Laborales',
      question: 'Resolución de crisis operativa simultánea: Fallo del conmutador central, queja colectiva en redes y 15 asesores esperando instrucciones.',
      type: 'Liderazgo Situacional Crítico'
    }
  ]
};

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  onClose,
  onCreateProfile
}) => {
  // Basic Profile Info
  const [profileName, setProfileName] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [profileCode, setProfileCode] = useState('');

  const [jobDescription, setJobDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Requirement: Dificultad de la prueba (Bajo, Medio, Alto)
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('MEDIO');
  const [showQuestionPreview, setShowQuestionPreview] = useState(true);

  // Requirement: Selección de pruebas a incluir en la batería
  const [includeRysTest, setIncludeRysTest] = useState(true);
  const [includePsychoTest, setIncludePsychoTest] = useState(true);
  const [includeEmotionalTest, setIncludeEmotionalTest] = useState(true);
  const [includeWorkCasesTest, setIncludeWorkCasesTest] = useState(true);

  // Requirement: Competencias buscadas para la Prueba RYS
  const [rysCompetencies, setRysCompetencies] = useState<string[]>([
    'Razonamiento Lógico & Análisis',
    'Autorregulación Emocional bajo Presión',
    'Orientación a Resultados & Eficiencia',
    'Atención al Cliente & Empatía'
  ]);

  const toggleRysCompetency = (compName: string) => {
    if (rysCompetencies.includes(compName)) {
      if (rysCompetencies.length > 1) {
        setRysCompetencies(rysCompetencies.filter(c => c !== compName));
      }
    } else {
      setRysCompetencies([...rysCompetencies, compName]);
    }
  };

  // Questions tailored to current difficulty level
  const currentQuestions = useMemo(() => {
    return GENERATED_QUESTIONS_BY_DIFFICULTY[difficultyLevel] || GENERATED_QUESTIONS_BY_DIFFICULTY.MEDIO;
  }, [difficultyLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!profileName.trim() || !targetPosition.trim()) {
      setSubmitError('Por favor completa el nombre del perfil y el puesto objetivo.');
      return;
    }

    setIsSubmitting(true);
    const uniqueId = crypto.randomUUID();
    const cleanPos = targetPosition.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'POS';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = profileCode.trim() || `PRF-${cleanPos}-${new Date().getFullYear()}-${randomSuffix}`;

    // Calculate stage distribution based on selected tests
    const activeStages: TestStageConfig[] = [];
    const testCount = [includeRysTest, includePsychoTest, includeEmotionalTest, includeWorkCasesTest].filter(Boolean).length || 1;
    const baseDuration = Math.round(durationMinutes / testCount);
    const baseWeight = Math.round(100 / testCount);

    if (includeRysTest) {
      activeStages.push({
        id: 'STAGE_RYS',
        category: 'COMPETENCIES',
        name: 'Prueba RYS: Reclutamiento y Selección por Competencias',
        description: `Evaluación de competencias clave: ${rysCompetencies.slice(0, 3).join(', ')}...`,
        durationMinutes: baseDuration,
        questionCount: difficultyLevel === 'BAJO' ? 8 : (difficultyLevel === 'MEDIO' ? 10 : 12),
        weightPercent: baseWeight,
        isEnabled: true
      });
    }

    if (includePsychoTest) {
      activeStages.push({
        id: 'STAGE_PSYCHO',
        category: 'PSYCHOLOGICAL',
        name: `Prueba Psicopedagógica (Dificultad ${difficultyLevel})`,
        description: 'Aptitud lógica, deducción analítica y agilidad cognitiva',
        durationMinutes: baseDuration,
        questionCount: difficultyLevel === 'BAJO' ? 8 : (difficultyLevel === 'MEDIO' ? 10 : 12),
        weightPercent: baseWeight,
        isEnabled: true
      });
    }

    if (includeEmotionalTest) {
      activeStages.push({
        id: 'STAGE_EMOTIONAL',
        category: 'EMOTIONAL',
        name: 'Prueba de Clima & Autorregulación Emocional (DISC)',
        description: 'Manejo del estrés, resiliencia y control de impulsos',
        durationMinutes: baseDuration,
        questionCount: 8,
        weightPercent: baseWeight,
        isEnabled: true
      });
    }

    if (includeWorkCasesTest) {
      activeStages.push({
        id: 'STAGE_WORK_CASES',
        category: 'WORK_CASES',
        name: `Prueba de Casos Laborales Simulados (${difficultyLevel})`,
        description: 'Criterio operativo, toma de decisiones y resolución situacional',
        durationMinutes: baseDuration,
        questionCount: difficultyLevel === 'BAJO' ? 3 : (difficultyLevel === 'MEDIO' ? 4 : 5),
        weightPercent: 100 - (baseWeight * (activeStages.length)),
        isEnabled: true
      });
    }

    const newProfile: EvaluationTest = {
      id: uniqueId,
      code,
      title: profileName.trim(),
      targetPosition: targetPosition.trim(),
      description: jobDescription.trim() || `Perfil de puesto para ${targetPosition.trim()}. Nivel de dificultad: ${difficultyLevel}.`,
      instructions: `Evaluación de selección adaptada al nivel de dificultad ${difficultyLevel}. Supervisión de foco y cronometrado.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalDurationMinutes: durationMinutes,
      candidateCount: 0,
      completedCount: 0,
      averageScore: 0,
      launchedBy: 'Tania León (Líder)',
      startDate: new Date().toLocaleDateString('es-PE'),
      endDate: '31/12/2026',
      processStatus: 'LANZADO',
      profileName: profileName.trim(),
      hiredCount: 0,
      inProgressCount: 0,
      difficultyLevel,
      selectedCompetencies: rysCompetencies,
      stages: activeStages
    };

    try {
      await onCreateProfile(newProfile);
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al guardar el perfil en la base de datos.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F2A5E]">
                Catálogo de Perfiles • GEA Internacional
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-bold text-[#1F2A5E] dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1F2A5E] dark:text-blue-400" />
                <span>Configuración de Pruebas & RYS</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1F2A5E]" />
              <span>Crear Nuevo Perfil de Puesto</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Define los datos del perfil, selecciona el nivel de dificultad y elige las pruebas de la batería (incluyendo Prueba RYS por competencias).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          
          {/* ========================================================================= */}
          {/* SECCIÓN 1: DATOS BÁSICOS DEL PERFIL & CÓDIGO                              */}
          {/* ========================================================================= */}
          <div className="space-y-3.5">
            <label className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#1F2A5E]" />
              <span>1. Identificación del Perfil</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre del Perfil *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Ej. ASESOR DE SERVICIO Y RETENCIÓN POSTPAGO"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Código del Perfil
                </label>
                <input
                  type="text"
                  value={profileCode}
                  onChange={e => setProfileCode(e.target.value)}
                  placeholder="GEA-ATC-2026"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Puesto / Cargo Objetivo *
                </label>
                <input
                  type="text"
                  required
                  value={targetPosition}
                  onChange={e => setTargetPosition(e.target.value)}
                  placeholder="Ej. Asesor Telefónico"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                />
              </div>


            </div>
          </div>

          {/* ========================================================================= */}
          {/* ESPACIO DEDICADO PARA DESCRIPCIÓN DEL PUESTO                             */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1F2A5E]" />
                <span>Descripción del Puesto & Perfil Requerido *</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Funciones, responsabilidades y competencias
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa:
            </p>

            <textarea
              rows={3}
              required
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Ej. El puesto es responsable de la gestión integral de atención y retención de clientes en la campaña Claro Postpago. Se requiere alta empatía, tolerancia a la frustración, excelente dicción y orientación al cumplimiento de metas cuantitativas..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: SELECCIONADOR DE NIVEL DE DIFICULTAD (BAJO, MEDIO, ALTO)       */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#1F2A5E]/5 dark:bg-[#1F2A5E]/15 border border-[#1F2A5E]/20 dark:border-[#1F2A5E]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-xs font-bold uppercase text-[#1F2A5E] dark:text-blue-300 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#1F2A5E] dark:text-blue-400" />
                  <span>2. Nivel de Dificultad de la Prueba *</span>
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  En base al nivel seleccionado se calibrarán y generarán automáticamente los reactivos de la evaluación.
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1F2A5E]/10 text-[#1F2A5E] dark:bg-[#1F2A5E]/30 dark:text-blue-200 self-start sm:self-auto font-mono">
                Nivel activo: {difficultyLevel}
              </span>
            </div>

            {/* 3 Difficulty Option Cards: Bajo, Medio, Alto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Opción 1: BAJO */}
              <div
                onClick={() => setDifficultyLevel('BAJO')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  difficultyLevel === 'BAJO'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                      Bajo
                    </span>
                  </div>
                  {difficultyLevel === 'BAJO' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                  Reactivos directos y situaciones cotidianas. Lenguaje claro, tiempo holgado y complejidad analítica básica.
                </p>
                <span className="mt-2 block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Ideal para: Puestos operativos iniciales
                </span>
              </div>

              {/* Opción 2: MEDIO */}
              <div
                onClick={() => setDifficultyLevel('MEDIO')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  difficultyLevel === 'MEDIO'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                      Medio
                    </span>
                  </div>
                  {difficultyLevel === 'MEDIO' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                  Reactivos de razonamiento estructurado, dilemas operativos estándar y autorregulación en contingencias.
                </p>
                <span className="mt-2 block text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Ideal para: Asesores, Analistas y ATC
                </span>
              </div>

              {/* Opción 3: ALTO */}
              <div
                onClick={() => setDifficultyLevel('ALTO')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  difficultyLevel === 'ALTO'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="font-extrabold text-sm text-rose-800 dark:text-rose-300">
                      Alto
                    </span>
                  </div>
                  {difficultyLevel === 'ALTO' && (
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                  Pensamiento crítico superior, resolución de crisis bajo alta presión y toma de decisiones estratégicas.
                </p>
                <span className="mt-2 block text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                  Ideal para: Supervisores, Líderes y Seniors
                </span>
              </div>
            </div>

            {/* PREGUNTAS RELACIONADAS GENERADAS EN BASE AL NIVEL SELECCIONADO */}
            <div className="pt-2 border-t border-[#1F2A5E]/20 dark:border-[#1F2A5E]/30">
              <button
                type="button"
                onClick={() => setShowQuestionPreview(!showQuestionPreview)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#1F2A5E] dark:text-blue-300 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#1F2A5E] dark:text-blue-400" />
                  <span>Preguntas calibradas generadas para nivel {difficultyLevel} ({currentQuestions.length} ejemplos)</span>
                </span>
                {showQuestionPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showQuestionPreview && (
                <div className="mt-2.5 space-y-2 animate-in fade-in">
                  {currentQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-[#1F2A5E] dark:text-blue-400">
                          {q.category}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {q.type}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
                        "{q.question}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 3: APARTADO DE ELECCIÓN DE PRUEBAS (CON PRUEBA RYS Y COMPETENCIAS) */}
          {/* ========================================================================= */}
          <div className="space-y-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#1F2A5E]" />
                <span>3. Selección de Pruebas para la Batería del Perfil</span>
              </label>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Selecciona las pruebas que compondrán la evaluación y configura las competencias clave buscadas para la Prueba RYS.
              </p>
            </div>

            {/* PRUEBA 1: PRUEBA RYS (RECLUTAMIENTO Y SELECCIÓN) CON SELECTOR DE COMPETENCIAS */}
            <div className={`p-4 rounded-2xl border transition-all ${
              includeRysTest 
                ? 'bg-[#1F2A5E]/5 dark:bg-[#1F2A5E]/20 border-[#1F2A5E] shadow-xs' 
                : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 opacity-60'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk-rys"
                    checked={includeRysTest}
                    onChange={e => setIncludeRysTest(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#1F2A5E] focus:ring-[#1F2A5E] cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="chk-rys" className="text-xs sm:text-sm font-extrabold text-[#1F2A5E] dark:text-blue-300 cursor-pointer flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        <span>Prueba RYS (Reclutamiento y Selección por Competencias)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F2A5E] text-white font-bold">
                        Recomendada RYS
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      Evalúa directamente el ajuste del postulante a las competencias conductuales y operacionales críticas del puesto de trabajo.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-zinc-500 font-mono">
                  {rysCompetencies.length} competencias
                </span>
              </div>

              {/* SUB-SECCIÓN DENTRO DE RYS: ELEGIR COMPETENCIAS BUSCADAS PARA EL PUESTO */}
              {includeRysTest && (
                <div className="mt-3 pt-3 border-t border-[#1F2A5E]/20 dark:border-[#1F2A5E]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#1F2A5E]" />
                      <span>Competencias buscadas para el puesto ({rysCompetencies.length} seleccionadas):</span>
                    </span>
                    <span className="text-[11px] text-[#1F2A5E] font-medium">
                      Haz clic en cada competencia para incluirla
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {RYS_COMPETENCIES_CATALOG.map((comp) => {
                      const isSelected = rysCompetencies.includes(comp.name);
                      return (
                        <div
                          key={comp.id}
                          onClick={() => toggleRysCompetency(comp.name)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors flex items-start gap-2 ${
                            isSelected
                              ? 'bg-white dark:bg-zinc-800 border-[#1F2A5E] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                              : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#1F2A5E] text-white' : 'border border-zinc-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div className="space-y-0.5">
                            <span className="block leading-tight">{comp.name}</span>
                            <span className="block text-[10px] text-zinc-400 font-normal leading-tight">
                              {comp.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* OTRAS PRUEBAS DISPONIBLES EN LA BATERÍA */}
            <div className="space-y-2">
              {/* Prueba 2: Psicopedagógica */}
              <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includePsychoTest}
                    onChange={e => setIncludePsychoTest(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                      Prueba Psicopedagógica & Habilidad Cognitiva
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Razonamiento deductivo, cálculo numérico, agilidad mental y comprensión.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Dificultad: {difficultyLevel}
                </span>
              </label>

              {/* Prueba 3: Autorregulación Emocional */}
              <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeEmotionalTest}
                    onChange={e => setIncludeEmotionalTest(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                      Prueba de Clima & Autorregulación Emocional (DISC)
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Inteligencia emocional, resiliencia bajo presión y estilo de comunicación.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  8 reactivos
                </span>
              </label>

              {/* Prueba 4: Casos Laborales */}
              <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeWorkCasesTest}
                    onChange={e => setIncludeWorkCasesTest(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                      Prueba de Casos Laborales Simulados
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Resolución de incidentes reales, priorización y criterio situacional.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Dificultad: {difficultyLevel}
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-500">
              Dificultad: <strong className="text-[#1F2A5E] dark:text-blue-400">{difficultyLevel}</strong> • Pruebas activas: <strong className="text-zinc-800 dark:text-zinc-200">{[includeRysTest, includePsychoTest, includeEmotionalTest, includeWorkCasesTest].filter(Boolean).length}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando perfil...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Perfil & Batería</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
