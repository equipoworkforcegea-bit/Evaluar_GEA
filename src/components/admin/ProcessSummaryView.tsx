import React, { useState, useEffect } from 'react';
import { EvaluationTest } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { 
  ArrowLeft, 
  Calendar, 
  Info, 
  Mail, 
  Plus, 
  Rocket, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Laptop, 
  ChevronRight, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Check 
} from 'lucide-react';

interface ProcessSummaryViewProps {
  process: EvaluationTest;
  onBack: () => void;
  onMonitorProcess: () => void;
  onInviteCandidates: () => void;
  onCustomizeInvitation?: () => void;
}

export const ProcessSummaryView: React.FC<ProcessSummaryViewProps> = ({
  process,
  onBack,
  onMonitorProcess,
  onInviteCandidates,
  onCustomizeInvitation
}) => {
  const [resolvedProfile, setResolvedProfile] = useState<any>(null);

  // Cargar datos completos del perfil vinculado al proceso desde Supabase o localStorage
  useEffect(() => {
    async function loadProcessProfile() {
      try {
        // 1. Buscar en procesos_evaluacion con perfiles_puesto vinculado
        if (process.id) {
          const { data: procData } = await supabase
            .from('procesos_evaluacion')
            .select('*, perfiles_puesto(*)')
            .eq('id', process.id)
            .maybeSingle();

          if (procData?.perfiles_puesto) {
            setResolvedProfile(procData.perfiles_puesto);
            return;
          }
        }

        // 2. Si no vino el perfil_puesto_id, buscar por coincidencia en perfiles_puesto
        const targetClean = (process.profileName || process.targetPosition || process.title || '')
          .replace(/\s+\d{4}\s+\d{2}\s+\d{2}.*$/, '')
          .trim();

        if (targetClean) {
          const { data: matchedProfile } = await supabase
            .from('perfiles_puesto')
            .select('*')
            .or(`titulo.ilike.${targetClean},puesto_objetivo.ilike.${targetClean}`)
            .order('creado_en', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (matchedProfile) {
            setResolvedProfile(matchedProfile);
            return;
          }
        }

        // 3. Fallback a localStorage de perfiles
        if (typeof window !== 'undefined') {
          const customRaw = localStorage.getItem('evaluar_custom_profiles');
          if (customRaw) {
            const list = JSON.parse(customRaw);
            const found = list.find((p: any) => p.id === (process as any).profileId || p.title === targetClean);
            if (found) {
              setResolvedProfile(found);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('[ProcessSummaryView] Error al cargar perfil:', err);
      }
    }

    loadProcessProfile();
  }, [process.id, process.title, process.profileName]);

  // Formato de fechas
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '12/10/26';
    try {
      if (dateStr.includes('/')) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const startFormatted = formatDateDisplay(process.startDate);
  const endFormatted = formatDateDisplay(process.endDate);

  // Metadatos del perfil vinculado
  const rawComp = resolvedProfile?.competencias || (process as any).competencias;
  const meta = (rawComp && typeof rawComp === 'object' && !Array.isArray(rawComp))
    ? (rawComp._metadata || {})
    : {};

  const competencyLevels: Record<string, number> = meta.competencyLevels || (process as any).competencyLevels || {};

  // 1. Competencias reales del perfil seleccionado
  let rawComps: string[] = [];
  if (Array.isArray(meta.selectedList) && meta.selectedList.length > 0) {
    rawComps = meta.selectedList;
  } else if (process.selectedCompetencies && process.selectedCompetencies.length > 0) {
    rawComps = process.selectedCompetencies;
  } else if (rawComp && typeof rawComp === 'object') {
    rawComps = Object.keys(rawComp).filter(k => !k.startsWith('_'));
  }

  // Fallback seguro a competencias clave de Evaluar si no se han cargado aún
  if (rawComps.length === 0) {
    rawComps = [
      'Orientación al Cliente',
      'Integridad',
      'Temple y Serenidad'
    ];
  }

  const weightPerComp = Math.round(100 / rawComps.length);
  const competenciesList = rawComps.map((name) => {
    const rawVal = rawComp && typeof rawComp[name] === 'number' ? rawComp[name] : undefined;
    const levelVal = competencyLevels[name] ?? (rawVal && rawVal <= 10 ? rawVal : 7);
    return {
      name,
      peso: weightPerComp,
      valorEsperado: levelVal
    };
  });

  // 2. Cuestionarios de Conocimientos reales
  let knowledgeItemsList: Array<{ name: string; difficulty: string; questions: number; peso: number }> = [];
  if (Array.isArray(meta.knowledgeItems) && meta.knowledgeItems.length > 0) {
    knowledgeItemsList = meta.knowledgeItems.map((k: any) => ({
      name: typeof k === 'string' ? k : k.name,
      difficulty: k.difficulty || 'Media',
      questions: k.totalQuestions || 20,
      peso: k.weight || Math.round(100 / meta.knowledgeItems.length)
    }));
  } else if (Array.isArray(meta.knowledgeQuestionnaires) && meta.knowledgeQuestionnaires.length > 0) {
    const defaultWeight = Math.round(100 / meta.knowledgeQuestionnaires.length);
    knowledgeItemsList = meta.knowledgeQuestionnaires.map((name: string) => ({
      name,
      difficulty: 'Media',
      questions: 20,
      peso: defaultWeight
    }));
  } else if (process.knowledgeQuestionnaires && process.knowledgeQuestionnaires.length > 0) {
    const defaultWeight = Math.round(100 / process.knowledgeQuestionnaires.length);
    knowledgeItemsList = process.knowledgeQuestionnaires.map((name: string) => ({
      name,
      difficulty: 'Media',
      questions: 20,
      peso: defaultWeight
    }));
  } else {
    knowledgeItemsList = [
      { name: 'Planificación estratégica', difficulty: 'Media', questions: 20, peso: 25 },
      { name: 'Español nivel basico', difficulty: 'Media', questions: 20, peso: 25 },
      { name: 'Negociación', difficulty: 'Media', questions: 20, peso: 25 },
      { name: 'Psicometria', difficulty: 'Media', questions: 20, peso: 25 }
    ];
  }

  // 3. Verificación de prueba DISC
  const stages: any[] = Array.isArray(meta.stages) ? meta.stages : (process.stages || []);
  const hasDisc = stages.length > 0 
    ? stages.some(s => s.id === 'STAGE_DISC' || s.category === 'EMOTIONAL' || String(s.name || '').toLowerCase().includes('disc'))
    : true;

  // 4. Lista consolidada de todas las pruebas correspondientes del proceso
  const testsList: Array<{ name: string; dotColor: string; category: string }> = [];

  if (hasDisc) {
    testsList.push({
      name: 'Prueba DISC (Conducta y Estilo Laboral)',
      dotColor: 'bg-emerald-500',
      category: 'Conductual'
    });
  }

  knowledgeItemsList.forEach(k => {
    testsList.push({
      name: `Cuestionario: ${k.name} (${k.questions} preg.)`,
      dotColor: 'bg-purple-600',
      category: 'Conocimientos'
    });
  });

  competenciesList.forEach(c => {
    testsList.push({
      name: `Competencia: ${c.name} (Nivel ${c.valorEsperado}/10)`,
      dotColor: 'bg-teal-500',
      category: 'Competencias'
    });
  });

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-6 py-4 space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Volver a la lista de procesos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-normal">Resumen del proceso:</span>
              <span className="font-extrabold text-[#2F5BA8] dark:text-[#6EA0FA]">{process.title}</span>
            </h1>
            <div 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 cursor-pointer p-1"
              title="Información detallada de la convocatoria"
            >
              <Info className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={onCustomizeInvitation || onInviteCandidates}
            className="px-4 py-2.5 rounded-2xl border border-[#7C3AED]/40 bg-white dark:bg-zinc-900 text-[#7C3AED] dark:text-purple-400 font-bold text-xs sm:text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Mail className="w-4 h-4" />
            <span>Personalizar invitación</span>
          </button>

          <button
            type="button"
            onClick={onInviteCandidates}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Invitar candidatos</span>
          </button>
        </div>

      </div>

      {/* Date Range Subheader */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 pl-1">
        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Inicio {startFormatted}</span>
        <span className="text-zinc-400">→</span>
        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Fin {endFormatted}</span>
      </div>

      {/* Big Hero Banner: ¡Excelente! tu proceso se ha lanzado con éxito! */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF8FF] via-[#F4F0FF] to-[#ECE6FF] dark:from-purple-950/30 dark:via-zinc-900 dark:to-purple-900/20 border border-purple-200/80 dark:border-purple-800/40 p-6 sm:p-10 shadow-sm">
        
        {/* Decorative Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero Content (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6] dark:text-purple-300 tracking-tight">
              ¡Excelente! tu proceso se ha lanzado con éxito!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Activa las fuentes de reclutamiento para empezar a viralizar tu anuncio y evaluar candidatos con las pruebas oficiales configuradas para este puesto.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onMonitorProcess}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#5B21B6] dark:hover:text-purple-300 hover:underline cursor-pointer group"
              >
                <span>Monitorear proceso</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Hero Illustration / Visual Graphic (4 cols) */}
          <div className="md:col-span-4 flex items-center justify-center relative">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xl text-white relative">
              <Rocket className="w-20 h-20 text-white animate-pulse" />
              <div className="absolute -bottom-2 -left-2 bg-white dark:bg-zinc-800 p-2.5 rounded-2xl shadow-md border border-purple-100 dark:border-purple-900 text-purple-600">
                <Laptop className="w-6 h-6" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 p-2 rounded-full shadow-md text-amber-950">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Secciones de Configuración del Proceso: Competencias, Conocimientos, DISC y Pruebas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda (7 cols): Competencias, Conocimientos y DISC */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Competencias en este proceso */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    Competencias en este proceso
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Competencias laborales del perfil con su valor esperado asignado.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                {competenciesList.length} seleccionadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 font-medium">
                    <th className="pb-3 font-normal">Competencias</th>
                    <th className="pb-3 text-center font-normal w-20">Peso</th>
                    <th className="pb-3 text-right font-normal w-28">Nivel esperado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {competenciesList.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 pr-2 font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="line-clamp-2">{comp.name}</span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-zinc-700 dark:text-zinc-300">
                        {comp.peso}%
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-teal-700 dark:text-teal-300">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
                          {comp.valorEsperado} / 10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Conocimientos en este proceso */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    Conocimientos en este proceso
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Cuestionarios técnicos y especializados según la vacante.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                {knowledgeItemsList.length} cuestionarios
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 font-medium">
                    <th className="pb-3 font-normal">Cuestionario</th>
                    <th className="pb-3 text-center font-normal w-24">Preguntas</th>
                    <th className="pb-3 text-right font-normal w-20">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {knowledgeItemsList.map((k, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 pr-2 font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-semibold">{k.name}</span>
                          <span className="text-[11px] text-zinc-400">Dificultad: {k.difficulty}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        {k.questions} preg.
                      </td>
                      <td className="py-3.5 text-right font-bold text-purple-700 dark:text-purple-300">
                        {k.peso}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. DISC en este proceso */}
          {hasDisc && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-2xs shrink-0">
                    <div className="bg-[#F59E0B] flex items-center justify-center text-[7px] font-bold text-white leading-none">D</div>
                    <div className="bg-[#EF4444] flex items-center justify-center text-[7px] font-bold text-white leading-none">I</div>
                    <div className="bg-[#3B82F6] flex items-center justify-center text-[7px] font-bold text-white leading-none">S</div>
                    <div className="bg-[#10B981] flex items-center justify-center text-[7px] font-bold text-white leading-none">C</div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
                      Prueba DISC en este proceso
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Evaluación conductual y estilo laboral bajo presión.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Activo</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    Conducta y Perfil Laboral (D, I, S, C)
                  </span>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                    2 secciones de bloques conductuales ipsativos (24 reactivos de opción forzada).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold shrink-0">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>15 minutos</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Columna Derecha (5 cols): Pruebas correspondientes del proceso */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs sticky top-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
                Pruebas del proceso
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Todas las evaluaciones asignadas a este proceso.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              {testsList.length} pruebas
            </span>
          </div>

          <div className="space-y-2.5">
            {testsList.map((t, idx) => (
              <div
                key={idx}
                className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:border-purple-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${t.dotColor} shrink-0`} />
                  <span className="truncate">{t.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-700 shrink-0">
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
