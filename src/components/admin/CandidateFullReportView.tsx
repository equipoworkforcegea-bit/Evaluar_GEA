import React, { useState } from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { 
  ArrowLeft, 
  Plus, 
  MessageCircle, 
  Sparkles, 
  MoreVertical, 
  Calendar, 
  X, 
  ArrowRight, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Send,
  UserCheck,
  Check,
  Smile,
  Target
} from 'lucide-react';

interface CandidateFullReportViewProps {
  candidate: Candidate;
  process?: EvaluationTest;
  onBack: () => void;
  onHireCandidate?: (candidateId: string) => void;
}

export const CandidateFullReportView: React.FC<CandidateFullReportViewProps> = ({
  candidate,
  process,
  onBack,
  onHireCandidate
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'DISC' | 'COMPETENCIAS'>('DISC');
  const [activeDiscSubTab, setActiveDiscSubTab] = useState<'ARQUETIPO' | 'PERFIL_DISC'>('ARQUETIPO');
  const [showProfileComparisonDrawer, setShowProfileComparisonDrawer] = useState<boolean>(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const [openAccordions, setOpenAccordions] = useState<Set<number>>(new Set([0, 1])); // Primero y segundo abiertos por defecto
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAccordion = (index: number) => {
    const next = new Set(openAccordions);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setOpenAccordions(next);
  };

  const initials = (candidate.fullName || 'JA')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const scoreVal = candidate.scores?.overall || 87;

  // Preguntas del acordeón de descripción (las 9 preguntas exactas de la captura de Evaluar)
  const ACCORDION_QUESTIONS = [
    {
      q: '¿Cuáles son sus características principales?',
      a: 'Posee alta orientación a las personas, carácter afable y empático. Actúa como mediador natural en equipos de trabajo, buscando mantener la armonía, estabilidad y un ambiente de colaboración libre de confrontaciones directas.'
    },
    {
      q: '¿Cómo es su tipo de liderazgo?',
      a: 'Liderazgo participativo y de apoyo (servant leadership). Prefiere guiar mediante el ejemplo, el consenso y la persuasión amable antes que la imposición de autoridad estricta.'
    },
    {
      q: '¿Cuáles son sus fortalezas?',
      a: 'Excelente capacidad de escucha activa, paciencia ante interlocutores difíciles, optimismo contagioso, lealtad hacia los acuerdos de equipo y alta disposición de servicio.'
    },
    {
      q: '¿Cuáles son sus miedos?',
      a: 'El conflicto abierto, la hostilidad interpersonal no resuelta y los cambios abruptos e impredecibles que alteren la estabilidad de su entorno habitual.'
    },
    {
      q: '¿Cuáles son sus debilidades?',
      a: 'Dificultad ocasional para decir "no", tendencia a postergar decisiones impopulares o disciplinarias y propensión a absorber el estrés emocional de los demás.'
    },
    {
      q: '¿Cuáles son sus oportunidades de crecimiento?',
      a: 'Desarrollar mayor asertividad para comunicar límites firmes, acelerar tiempos de respuesta en escenarios de alta presión y cultivar tolerancia al debate constructivo.'
    },
    {
      q: '¿Cómo comunicarse con este tipo de personalidad?',
      a: 'Utilizar un tono cálido y respetuoso, mostrar genuino interés personal, evitar confrontaciones públicas y presentar los cambios con anticipación y fundamentación clara.'
    },
    {
      q: '¿Cómo aprende?',
      a: 'A través de dinámicas grupales, interacción con mentores y ejemplos prácticos basados en experiencias humanas reales y retroalimentación empática.'
    },
    {
      q: '¿Qué le motiva en el trabajo?',
      a: 'Sentirse valorado en su equipo, trabajar en un clima laboral amigable y saber que su labor contribuye al bienestar de sus compañeros y usuarios.'
    },
    {
      q: '¿Qué le desmotiva en el trabajo?',
      a: 'Ambientes laborales tóxicos o hipercompetitivos, falta de reconocimiento humano y órdenes autoritarias sin espacio para el diálogo.'
    }
  ];

  // Subfactores DISC de la captura
  const SUBFACTORES = [
    {
      code: 'D · DOMINANCIA',
      desc: 'Conducta orientada a la acción, a la rápida solución de problemas, a la toma de decisiones y a la asunción de riesgos. Al dominante le gusta tomar decisiones por sí mismo y para otros.',
      val: 4,
      color: 'bg-rose-500',
      trackColor: 'bg-rose-100 dark:bg-rose-950/40'
    },
    {
      code: 'DI · DINÁMICO',
      desc: 'Representa la combinación de los factores dominancia e influyente que se caracteriza por: automotivación, independencia, entusiasmo, influencia.',
      val: 5,
      color: 'bg-orange-500',
      trackColor: 'bg-orange-100 dark:bg-orange-950/40'
    },
    {
      code: 'I · INFLUENCIA',
      desc: 'Conducta orientada a las personas, a la interacción, a las relaciones interpersonales y al uso de tácticas persuasivas. Al influyente le gusta socializar y llevar a otros a través de la persuasión.',
      val: 6,
      color: 'bg-amber-400',
      trackColor: 'bg-amber-100 dark:bg-amber-950/40'
    },
    {
      code: 'IS · SOCIABLE',
      desc: 'Predisposición a generar confianza inmediata, trato cordial y capacidad innata para acoger a nuevos miembros en el equipo con calidez.',
      val: 8,
      color: 'bg-lime-500',
      trackColor: 'bg-lime-100 dark:bg-lime-950/40'
    },
    {
      code: 'S · ESTABILIDAD',
      desc: 'Consistencia metódica, perseverancia y ritmo constante en la ejecución de tareas programadas sin altibajos anímicos.',
      val: 7,
      color: 'bg-emerald-500',
      trackColor: 'bg-emerald-100 dark:bg-emerald-950/40'
    },
    {
      code: 'SC · COLABORADOR',
      desc: 'Alineamiento riguroso con estándares de calidad y soporte paciente a los objetivos colectivos de la campaña.',
      val: 7,
      color: 'bg-teal-500',
      trackColor: 'bg-teal-100 dark:bg-teal-950/40'
    },
    {
      code: 'C · CUMPLIMIENTO',
      desc: 'Apego a normativas, análisis de detalles y comprobación responsable de información antes de su emisión.',
      val: 6,
      color: 'bg-cyan-600',
      trackColor: 'bg-cyan-100 dark:bg-cyan-950/40'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in select-none relative pb-12">
      
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#1F2A5E] text-white text-xs font-bold shadow-xl border border-white/20 animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* 1. TOP PROCESS HEADER (IDÉNTICO A LA CAPTURA) */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#1F2A5E] dark:text-[#5B8AE0] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5 cursor-pointer transition-colors shrink-0 shadow-2xs"
              title="Volver a la lista de candidatos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white tracking-tight uppercase">
                {process?.title || 'POSTPAGO CHILE PRUEBA 2026 09 28'}
              </h1>
              
              <span className="px-3 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#065F46]/20 text-[#10B981] font-bold text-xs border border-[#10B981]/30">
                En progreso
              </span>

              <span className="flex items-center gap-1.5 text-xs text-[#6B7494] dark:text-[#9AA5C4] font-medium">
                <span>Lanzado Por:</span>
                <strong className="text-[#161C3A] dark:text-white font-semibold">
                  {process?.launchedBy || 'Tania León'}
                </strong>
              </span>

              <span className="w-6 h-6 rounded-md bg-[#5844D8]/10 text-[#5844D8] font-black text-xs flex items-center justify-center border border-[#5844D8]/20">
                A+
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2.5 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:text-[#161C3A] cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. LAYOUT PRINCIPAL DE 2 COLUMNAS (PANEL CANDIDATO + INFORME PSICOMÉTRICO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* COLUMNA IZQUIERDA: TARJETA DEL CANDIDATO (EXACTA A CAPTURAS 2 Y 3) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-5 sticky top-4">
          
          {/* Header del Candidato: Avatar, Nombre, Ranking y Acciones */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar con emoji superpuesto */}
              <div className="relative shrink-0">
                <div className="w-13 h-13 rounded-full bg-[#1F2A5E] text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {initials || 'JA'}
                </div>
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white dark:bg-[#182044] shadow-xs flex items-center justify-center text-xs">
                  😊
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#161C3A] dark:text-white leading-tight">
                  {candidate.fullName || 'Jean Carlos Baldeon'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7494] mt-1 font-semibold">
                  <span>📋 Ranking:</span>
                  <span className="text-[#161C3A] dark:text-white font-bold">1°</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={candidate.phone ? `https://wa.me/${candidate.phone.replace(/\D/g, '')}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <button type="button" className="p-1.5 text-[#6B7494] hover:text-[#161C3A]">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botón "+ Añadir" */}
          <div>
            <button
              type="button"
              onClick={() => showToast('Candidato guardado en tu preselección')}
              className="px-3 py-1 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-xs font-bold text-[#6B7494] hover:text-[#161C3A] hover:border-[#1F2A5E] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>

          {/* Botones de Acción: Comenzar análisis (degradado) y Contratar (púrpura) */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => showToast('Iniciando sesión de análisis profundo')}
              className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-[#9370DB] via-[#D87093] to-[#FF82A9] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              <span>Comenzar análisis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onHireCandidate) onHireCandidate(candidate.id);
                showToast(`✓ ¡${candidate.fullName} marcado como Contratado!`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5844D8] hover:bg-[#4837BA] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Contratar</span>
            </button>
          </div>

          {/* Email row */}
          <div className="pt-2 border-t border-[#DDE2EF]/60 dark:border-[#2A3563]/60 text-xs text-[#6B7494] flex items-center gap-2 truncate">
            <span>✉</span>
            <span className="truncate">{candidate.email || 'carlosporsiempre345@gmail.com'}</span>
          </div>

          {/* Gauge Circular de Adecuación (87%) */}
          <div className="flex flex-col items-center justify-center pt-3 space-y-3">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2FA58B]"
                  strokeDasharray={`${scoreVal}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-[#2FA58B] tracking-tight">
                  {scoreVal}%
                </span>
              </div>
            </div>

            {/* Barra de progreso horizontal de Competencias 87% */}
            <div className="w-full space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#161C3A] dark:text-white">Competencias</span>
                <span className="text-[#2FA58B]">{scoreVal}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#2FA58B]" 
                  style={{ width: `${scoreVal}%` }} 
                />
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* COLUMNA DERECHA: INFORME PSICOMÉTRICO DISC (EXACTA A CAPTURAS 2, 3, 4, 5) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-6 shadow-2xs space-y-6">
          
          {/* Tabs Superiores: DISC (con icono 4 colores) vs Competencias 🎓 */}
          <div className="flex items-center justify-between border-b border-[#DDE2EF] dark:border-[#2A3563] pb-3">
            <div className="flex items-center gap-8">
              
              {/* Tab 1: DISC */}
              <button
                type="button"
                onClick={() => setActiveMainTab('DISC')}
                className={`flex items-center gap-2 pb-2 -mb-3 border-b-2 font-bold text-sm cursor-pointer transition-colors ${
                  activeMainTab === 'DISC'
                    ? 'border-[#5844D8] text-[#5844D8] dark:text-[#8B7CFF]'
                    : 'border-transparent text-[#6B7494] hover:text-[#161C3A]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-linear-to-tr from-rose-500 via-amber-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-[7px] font-black text-white">D</span>
                </div>
                <span>DISC</span>
              </button>

              {/* Tab 2: Competencias */}
              <button
                type="button"
                onClick={() => setActiveMainTab('COMPETENCIAS')}
                className={`flex items-center gap-2 pb-2 -mb-3 border-b-2 font-bold text-sm cursor-pointer transition-colors ${
                  activeMainTab === 'COMPETENCIAS'
                    ? 'border-[#5844D8] text-[#5844D8] dark:text-[#8B7CFF]'
                    : 'border-transparent text-[#6B7494] hover:text-[#161C3A]'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Competencias</span>
              </button>

            </div>

            {/* Badge Beta */}
            <span className="px-2.5 py-0.5 rounded-full bg-[#5844D8]/10 text-[#5844D8] text-[11px] font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Beta</span>
            </span>
          </div>

          {activeMainTab === 'DISC' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Encabezado del Resultado: CONCILIADOR (IS)³ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white">
                    Resultado: <span className="text-[#84CC16]">CONCILIADOR (IS)³</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6B7494]">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#5844D8]" />
                    <span>Calificación: 10 octubre 2026</span>
                  </span>

                  <button type="button" className="p-1 rounded-md hover:bg-slate-100">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Párrafo explicativo del perfil Conciliador */}
              <p className="text-xs sm:text-sm text-[#4A5568] dark:text-[#CBD5E1] leading-relaxed">
                El Conciliador está orientado a las personas, tiende a ser el mediador del grupo y a buscar la calma
                en sus interacciones sociales. Le llena de energía estar rodeado de personas e interactuar con ellas.
                Busca mantener la estabilidad, evitando las confrontaciones y las críticas. Se muestra optimista y
                alegre. Le motiva aprender de otros y su conocimiento se alimenta de las historias de los demás, de lo
                que piensan o sienten ellos.
              </p>

              {/* Píldoras de rasgos: Optimista, Buena Escucha, Dispuesto */}
              <div className="flex flex-wrap items-center gap-2">
                {['Optimista', 'Buena Escucha', 'Dispuesto'].map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#F7FEE7] dark:bg-[#365314]/20 border border-[#D9F99D] text-[#65A30D] text-xs font-bold"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* ========================================================================= */}
              {/* RUEDA DISC INTERACTIVA (16 SEGMENTOS - EXACTA A CAPTURA 3) */}
              {/* ========================================================================= */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                  
                  {/* Etiquetas de los Ejes Cardinales */}
                  <span className="absolute top-0 text-xs font-bold text-[#6B7494]">Extrovertido</span>
                  <span className="absolute bottom-0 text-xs font-bold text-[#6B7494]">Introvertido</span>
                  <span className="absolute left-0 text-xs font-bold text-[#6B7494]">Tareas</span>
                  <span className="absolute right-0 text-xs font-bold text-[#6B7494]">Personas</span>

                  {/* Etiquetas de los Vértices */}
                  <span className="absolute top-6 left-6 text-[11px] font-semibold text-[#9AA5C4] -rotate-45">Dominante</span>
                  <span className="absolute top-6 right-6 text-[11px] font-semibold text-[#9AA5C4] rotate-45">Influyente</span>
                  <span className="absolute bottom-6 right-6 text-[11px] font-semibold text-[#9AA5C4] -rotate-45">Servicial</span>
                  <span className="absolute bottom-6 left-6 text-[11px] font-semibold text-[#9AA5C4] rotate-45">Cumplido</span>

                  {/* SVG de la Rueda Circular de 16 Segmentos DISC */}
                  <svg viewBox="0 0 300 300" className="w-64 h-64 sm:w-72 sm:h-72">
                    <defs>
                      <filter id="shadowDisc" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1" />
                      </filter>
                    </defs>

                    {/* Círculo base concéntrico */}
                    <circle cx="150" cy="150" r="130" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1.5" />
                    <circle cx="150" cy="150" r="85" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    <circle cx="150" cy="150" r="40" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Líneas divisorias de los 16 sectores */}
                    {Array.from({ length: 16 }).map((_, i) => {
                      const angle = (i * 360) / 16;
                      const rad = (angle * Math.PI) / 180;
                      const x2 = 150 + 130 * Math.cos(rad);
                      const y2 = 150 + 130 * Math.sin(rad);
                      return (
                        <line
                          key={i}
                          x1="150"
                          y1="150"
                          x2={x2}
                          y2={y2}
                          stroke="#E2E8F0"
                          strokeWidth="1.2"
                        />
                      );
                    })}

                    {/* Sector IS resaltado en VERDE LIMA (Exacto a captura 3) */}
                    {/* El sector IS está en el cuadrante inferior derecho (~22.5 grados de amplitud) */}
                    <path
                      d="M 150 150 L 270 150 A 130 130 0 0 1 261 199 Z"
                      fill="#84CC16"
                      opacity="0.9"
                    />

                    {/* Nombres de los sectores */}
                    <text x="145" y="45" fontSize="9" fontWeight="bold" fill="#DC2626">D</text>
                    <text x="175" y="55" fontSize="8" fontWeight="bold" fill="#EA580C">Di</text>
                    <text x="205" y="75" fontSize="8" fontWeight="bold" fill="#D97706">DI</text>
                    <text x="225" y="105" fontSize="8" fontWeight="bold" fill="#CA8A04">Id</text>
                    <text x="240" y="135" fontSize="9" fontWeight="bold" fill="#EAB308">I</text>
                    <text x="235" y="165" fontSize="8" fontWeight="bold" fill="#84CC16">Is</text>
                    
                    {/* Texto sector IS en blanco sobre el sector verde */}
                    <text x="230" y="185" fontSize="9" fontWeight="900" fill="#FFFFFF">IS</text>
                    
                    <text x="205" y="225" fontSize="8" fontWeight="bold" fill="#16A34A">Si</text>
                    <text x="175" y="245" fontSize="9" fontWeight="bold" fill="#10B981">S</text>
                    <text x="140" y="250" fontSize="8" fontWeight="bold" fill="#0D9488">Sc</text>
                    <text x="105" y="240" fontSize="8" fontWeight="bold" fill="#0D9488">SC</text>
                    <text x="75" y="220" fontSize="8" fontWeight="bold" fill="#0284C7">Cs</text>
                    <text x="55" y="190" fontSize="9" fontWeight="bold" fill="#2563EB">C</text>
                    <text x="50" y="155" fontSize="8" fontWeight="bold" fill="#4F46E5">Cd</text>
                    <text x="60" y="125" fontSize="8" fontWeight="bold" fill="#7C3AED">CD</text>
                    <text x="80" y="95" fontSize="8" fontWeight="bold" fill="#9333EA">Dc</text>

                    {/* Pin del postulante "JA 3" en el sector IS */}
                    <g transform="translate(195, 160)">
                      <circle cx="0" cy="0" r="14" fill="#1F2A5E" stroke="#FFFFFF" strokeWidth="2" filter="url(#shadowDisc)" />
                      <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">JA</text>
                      <circle cx="8" cy="8" r="5" fill="#84CC16" />
                      <text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF">3</text>
                    </g>
                  </svg>

                </div>
              </div>

              {/* Sub-pestañas: Arquetipo vs Perfil DISC (Exacto a Captura 4) */}
              <div className="flex items-center gap-4 border-b border-[#DDE2EF] dark:border-[#2A3563] pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDiscSubTab('ARQUETIPO')}
                  className={`pb-2 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                    activeDiscSubTab === 'ARQUETIPO'
                      ? 'border-[#5844D8] text-[#5844D8] dark:text-[#8B7CFF]'
                      : 'border-transparent text-[#6B7494]'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Arquetipo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDiscSubTab('PERFIL_DISC')}
                  className={`pb-2 px-3 border-b-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                    activeDiscSubTab === 'PERFIL_DISC'
                      ? 'border-[#5844D8] text-[#5844D8] dark:text-[#8B7CFF]'
                      : 'border-transparent text-[#6B7494]'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-current" />
                  <span>Perfil DISC</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* SECCIÓN: INTENSIDAD DEL ARQUETIPO (EXACTA A CAPTURA 4) */}
              {/* ========================================================================= */}
              <div className="bg-[#FAFAFA] dark:bg-[#151D3F] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 space-y-5">
                <h4 className="text-sm font-bold text-[#161C3A] dark:text-white">
                  Intensidad del Arquetipo
                </h4>

                {/* Regla de Intensidad 0 a 10 con barra magenta hasta el 3 */}
                <div className="space-y-2 pt-2">
                  <div className="relative h-6 flex items-center">
                    {/* Barra magenta hasta el valor 3 (30%) */}
                    <div className="absolute left-0 top-1 h-3 rounded-r-md bg-[#E11D48] w-[30%]" />
                    
                    {/* Punto final gris en el 10 */}
                    <div className="absolute right-0 top-1.5 w-2 h-2 rounded-full bg-slate-300" />
                  </div>

                  {/* Marcas de regla 0 a 10 */}
                  <div className="flex justify-between text-xs text-[#9AA5C4] font-medium px-0.5 border-t border-slate-200 dark:border-slate-700 pt-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <span key={num}>{num}</span>
                    ))}
                  </div>
                </div>

                {/* Tarjetas explicativas: Adaptable (< 5) vs Definido (> 5) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  
                  {/* Columna Izquierda: Valores menores que 5 */}
                  <div className="space-y-2 text-xs leading-relaxed text-[#6B7494] dark:text-[#9AA5C4]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#161C3A] dark:text-white">Valores menores que 5</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5844D8] font-bold text-[10px]">
                        Adaptable
                      </span>
                    </div>
                    <p>
                      La persona no presenta patrones de conducta muy definidos. Esto se puede presentar porque
                      es capaz de adaptar su comportamiento a diferentes tipos de trabajo y relaciones laborales,
                      o porque ha podido desarrollar aquellos comportamientos en su carrera que no corresponden
                      con su patrón natural.
                    </p>
                  </div>

                  {/* Columna Derecha: Valores mayores que 5 */}
                  <div className="space-y-2 text-xs leading-relaxed text-[#6B7494] dark:text-[#9AA5C4]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#161C3A] dark:text-white">Valores mayores que 5</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#6B7494] font-bold text-[10px]">
                        Definido
                      </span>
                    </div>
                    <p>
                      La persona presenta patrones de conducta muy definidos y constantes. Casi siempre sus
                      comportamientos corresponden con aquellos descritos en su arquetipo. Le puede resultar
                      difícil adaptarse a trabajos y relaciones laborales que requieran comportamientos diferentes
                      a sus patrones naturales.
                    </p>
                  </div>

                </div>

              </div>

              {/* ========================================================================= */}
              {/* SECCIÓN: DESCRIPCIÓN (9 PREGUNTAS ACORDEÓN - EXACTAS A CAPTURAS 4 Y 5) */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-2">
                <h4 className="text-base font-extrabold text-[#1F2A5E] dark:text-white">
                  Descripción
                </h4>

                <div className="divide-y divide-[#DDE2EF]/70 dark:divide-[#2A3563]/70 border border-[#DDE2EF] dark:border-[#2A3563] rounded-2xl overflow-hidden bg-white dark:bg-[#182044]">
                  {ACCORDION_QUESTIONS.map((item, idx) => {
                    const isOpen = openAccordions.has(idx);
                    return (
                      <div key={idx} className="transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleAccordion(idx)}
                          className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#161C3A] dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                        >
                          <span>{item.q}</span>
                          <div className="flex items-center gap-1.5 text-[#9AA5C4]">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-[#6B7494] dark:text-[#9AA5C4] leading-relaxed bg-[#F8FAFC]/50 dark:bg-[#151D3F]/50">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECCIÓN: SUBFACTORES DISC (BARRAS HORIZONTALES - EXACTAS A CAPTURA 1 PARTE 2) */}
              {/* ========================================================================= */}
              <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 space-y-4">
                <h4 className="text-base font-extrabold text-[#1F2A5E] dark:text-white">
                  Subfactores
                </h4>

                <div className="space-y-4 divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
                  {SUBFACTORES.map((sub, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1 max-w-xl">
                          <span className="text-xs font-bold text-[#161C3A] dark:text-white block">
                            {sub.code}
                          </span>
                          <p className="text-[11px] text-[#6B7494] dark:text-[#9AA5C4] leading-relaxed">
                            {sub.desc}
                          </p>
                        </div>

                        {/* Indicador numérico y barra horizontal */}
                        <div className="w-full sm:w-48 shrink-0 space-y-1">
                          <span className="text-xs font-bold text-[#161C3A] dark:text-white block text-right">
                            {sub.val} / 10
                          </span>
                          <div className={`w-full h-2 rounded-full ${sub.trackColor} overflow-hidden`}>
                            <div 
                              className={`h-full rounded-full ${sub.color}`} 
                              style={{ width: `${sub.val * 10}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TARJETA: COMPARACIÓN DE PERFILES LABORALES (EXACTA A CAPTURA 2 PARTE 2) */}
              {/* ========================================================================= */}
              <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs flex items-center justify-between gap-4">
                <span className="text-base font-bold text-[#1F2A5E] dark:text-white">
                  Comparación de perfiles laborales
                </span>

                <button
                  type="button"
                  onClick={() => setShowProfileComparisonDrawer(true)}
                  className="p-2.5 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] hover:border-[#5844D8] text-[#1F2A5E] dark:text-[#5B8AE0] hover:bg-[#EEF2FF] cursor-pointer transition-colors shadow-2xs"
                  title="Abrir comparación de perfiles laborales"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA COMPETENCIAS 🎓 */}
          {/* ========================================================================= */}
          {activeMainTab === 'COMPETENCIAS' && (
            <div className="space-y-5 animate-in fade-in">
              <h3 className="text-lg font-bold text-[#1F2A5E] dark:text-white">
                Evaluación de Competencias Laborales
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Comunicación Asertiva y Persuasión', score: 88, desc: 'Excelente articulación de argumentos comerciales y trato empático.' },
                  { name: 'Resolución de Casos de Atención al Cliente', score: 86, desc: 'Alta capacidad para destrabar objeciones y retener llamadas críticas.' },
                  { name: 'Autorregulación bajo Presión', score: 87, desc: 'Estabilidad emocional óptima en escenarios de alta demanda temporal.' }
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#151D3F] border border-[#DDE2EF] dark:border-[#2A3563] space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#161C3A] dark:text-white">{c.name}</span>
                      <span className="text-[#2FA58B]">{c.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-[#2FA58B]" style={{ width: `${c.score}%` }} />
                    </div>
                    <p className="text-[11px] text-[#6B7494]">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTÓN FLOTANTE LATERAL DERECHO: "💬 COMENTARIOS" (EXACTO A TODAS LAS CAPTURAS) */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white dark:bg-[#182044] border-l border-y border-[#DDE2EF] dark:border-[#2A3563] text-[#5844D8] px-2 py-4 rounded-l-2xl shadow-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:bg-slate-50 select-none writing-vertical [writing-mode:vertical-lr]"
        style={{ writingMode: 'vertical-rl' }}
      >
        <MessageCircle className="w-3.5 h-3.5 -rotate-90 inline" />
        <span className="rotate-180">Comentarios</span>
      </button>

      {/* ========================================================================= */}
      {/* DRAWER LATERAL: COMPARACIÓN DE PERFILES (EXACTO A CAPTURAS 3, 4 Y 5 PARTE 2) */}
      {/* ========================================================================= */}
      {showProfileComparisonDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#182044] h-full shadow-2xl flex flex-col border-l border-[#DDE2EF] dark:border-[#2A3563] animate-in slide-in-from-right duration-200">
            
            {/* Header del Drawer */}
            <div className="p-4 sm:p-5 border-b border-[#DDE2EF] dark:border-[#2A3563] flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#1F2A5E] dark:text-white">
                Comparación de perfiles
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileComparisonDrawer(false)}
                className="p-1 rounded-full text-[#6B7494] hover:text-[#161C3A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con scroll del Drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* 1. GRÁFICO: PERFIL PROFESIONAL (D=4, I=6, S=6, C=3) */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7494]">
                  <span>💼 Perfil Profesional</span>
                </div>

                <div className="h-44 w-full bg-[#FAFAFA] dark:bg-[#151D3F] rounded-xl p-3 relative">
                  <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
                    {/* Líneas horizontales de 1 a 10 */}
                    {[1, 3, 5, 7, 9].map(val => (
                      <line
                        key={val}
                        x1="20"
                        y1={120 - val * 11}
                        x2="190"
                        y2={120 - val * 11}
                        stroke="#E2E8F0"
                        strokeWidth="0.8"
                      />
                    ))}

                    {/* Línea morada conectora */}
                    <polyline
                      fill="none"
                      stroke="#5844D8"
                      strokeWidth="2.5"
                      points="35,76 85,54 135,54 185,87"
                    />

                    {/* Puntos circulares morados */}
                    {[
                      { x: 35, y: 76, val: 4, label: 'D' },
                      { x: 85, y: 54, val: 6, label: 'I' },
                      { x: 135, y: 54, val: 6, label: 'S' },
                      { x: 185, y: 87, val: 3, label: 'C' }
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#FFFFFF" stroke="#5844D8" strokeWidth="2.5" />
                        <text x={pt.x} y="115" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#6B7494">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* 2. GRÁFICO: PERFIL RELACIONAL (LINEA ROSA) */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7494]">
                  <span>👥 Perfil Relacional</span>
                </div>

                <div className="h-32 w-full bg-[#FAFAFA] dark:bg-[#151D3F] rounded-xl p-3 relative">
                  <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke="#E11D48"
                      strokeWidth="2.5"
                      points="35,60 85,30 135,45 185,55"
                    />
                    <circle cx="35" cy="60" r="3.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                    <circle cx="85" cy="30" r="3.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                    <circle cx="135" cy="45" r="3.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                    <circle cx="185" cy="55" r="3.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* 3. SIMILITUD (SEMI-GAUGE 8.5 / 10) */}
              <div className="pt-2 border-t border-[#DDE2EF]/60 space-y-3">
                <h4 className="text-xs font-bold text-[#161C3A] dark:text-white">
                  Similitud
                </h4>
                <p className="text-[11px] text-[#6B7494] leading-relaxed">
                  Representa la similitud de cómo se describe a sí mismo y cómo lo describen los compañeros.
                </p>

                <div className="flex items-center gap-4 pt-1">
                  {/* Semicírculo morado */}
                  <div className="relative w-24 h-14 flex items-end justify-center">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                      <path d="M 10 50 A 40 40 0 0 1 85 20" fill="none" stroke="#9370DB" strokeWidth="12" strokeLinecap="round" />
                    </svg>
                    <span className="absolute bottom-0 text-xs font-black text-[#1F2A5E] dark:text-white">
                      8.5 / 10
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#161C3A] dark:text-white block">
                      Similitud alta
                    </span>
                    <span className="text-[11px] text-[#6B7494] block">
                      Alta probabilidad de que las percepciones sean similares.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. ORIENTACIÓN DE LA ENERGÍA (Activo vs Reflexivo) */}
              <div className="pt-2 border-t border-[#DDE2EF]/60 space-y-2">
                <h4 className="text-xs font-bold text-[#161C3A] dark:text-white">
                  Orientación de la energía
                </h4>
                <p className="text-[11px] text-[#6B7494]">
                  Refleja la preferencia de la persona a trabajar más activo o reflexivo
                </p>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#6B7494] font-medium">
                    <span>Activo ❓</span>
                    <span>Reflexivo ❓</span>
                  </div>

                  {/* Escala 5 4 3 2 1 0 1 2 3 4 5 con barras azul y rosa */}
                  <div className="relative h-7 bg-[#FAFAFA] dark:bg-[#151D3F] rounded-lg border border-slate-100 flex items-center">
                    <div className="w-full flex justify-between px-1 text-[9px] text-slate-400">
                      <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
                      <span className="font-bold">0</span>
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>

                    {/* Barra morada hacia activo (1) */}
                    <div className="absolute left-[40%] top-1 h-2 rounded bg-[#5844D8] w-[10%]" />
                    {/* Barra rosa hacia reflexivo (2) */}
                    <div className="absolute left-[50%] top-4 h-2 rounded bg-[#E11D48] w-[18%]" />
                  </div>
                </div>
              </div>

              {/* 5. ORIENTACIÓN: PERSONAS O A LAS TAREAS */}
              <div className="pt-2 border-t border-[#DDE2EF]/60 space-y-2">
                <h4 className="text-xs font-bold text-[#161C3A] dark:text-white">
                  Orientación al trabajo
                </h4>
                <div className="flex justify-between text-[11px] text-[#6B7494] font-medium">
                  <span>Orientado a las tareas ❓</span>
                  <span>Orientado a las personas ❓</span>
                </div>

                <div className="relative h-7 bg-[#FAFAFA] dark:bg-[#151D3F] rounded-lg border border-slate-100 flex items-center">
                  <div className="w-full flex justify-between px-1 text-[9px] text-slate-400">
                    <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
                    <span className="font-bold">0</span>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>

                  {/* Barra morada hacia personas (3) */}
                  <div className="absolute left-[50%] top-1 h-2 rounded bg-[#5844D8] w-[28%]" />
                  {/* Barra rosa hacia personas (2) */}
                  <div className="absolute left-[50%] top-4 h-2 rounded bg-[#E11D48] w-[18%]" />
                </div>

                <div className="flex items-center gap-4 text-[10px] text-[#6B7494] pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#5844D8]" />
                    <span>Perfil profesional</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                    <span>Perfil relacional</span>
                  </span>
                </div>
              </div>

              {/* 6. RELACIÓN CON EL EQUIPO (Influyente vs Apoyador) */}
              <div className="pt-2 border-t border-[#DDE2EF]/60 space-y-2">
                <h4 className="text-xs font-bold text-[#161C3A] dark:text-white">
                  Relación con el equipo
                </h4>
                <p className="text-[11px] text-[#6B7494]">
                  Refleja el cómo se relaciona la persona con su equipo de trabajo, influyendo o apoyando
                </p>

                <div className="flex justify-between text-[11px] text-[#6B7494] font-medium pt-1">
                  <span>Influyente ❓</span>
                  <span>Apoyador ❓</span>
                </div>

                <div className="relative h-7 bg-[#FAFAFA] dark:bg-[#151D3F] rounded-lg border border-slate-100 flex items-center">
                  <div className="w-full flex justify-between px-1 text-[9px] text-slate-400">
                    <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
                    <span className="font-bold">0</span>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>

                  <div className="absolute left-[50%] top-2.5 h-2 rounded bg-[#E11D48] w-[12%]" />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER LATERAL: COMENTARIOS Y NOTAS DEL RECLUTADOR */}
      {/* ========================================================================= */}
      {showCommentsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#182044] h-full shadow-2xl flex flex-col border-l border-[#DDE2EF] dark:border-[#2A3563] animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#DDE2EF] dark:border-[#2A3563] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#161C3A] dark:text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#5844D8]" />
                <span>Comentarios & Notas</span>
              </h3>
              <button onClick={() => setShowCommentsDrawer(false)} className="p-1 text-[#6B7494]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 space-y-4 overflow-y-auto text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D3F] border border-slate-200 space-y-1">
                <span className="font-bold text-[#161C3A] dark:text-white">Tania León (Reclutadora):</span>
                <p className="text-[#6B7494]">Postulante con excelente calidez y dicción telefónica. Apto para el cierre en campaña Claro.</p>
                <span className="text-[10px] text-slate-400">10/10/2026 16:47 PM</span>
              </div>
            </div>

            <div className="p-3 border-t border-[#DDE2EF] flex gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
              />
              <button 
                type="button" 
                onClick={() => showToast('Comentario registrado')}
                className="p-2 rounded-xl bg-[#5844D8] text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
