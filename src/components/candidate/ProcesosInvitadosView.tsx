import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Candidate } from '../../types';
import { 
  Rocket, 
  Clock, 
  Calendar, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Hourglass, 
  RotateCw, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Check,
  AlertTriangle,
  Lock,
  X,
  FileCheck
} from 'lucide-react';
import { EvaluacionesService } from '../../services/evaluacionesService';
import { NotificacionesService } from '../../services/notificacionesService';

export interface StartExamPayload {
  type: 'DISC' | 'KNOWLEDGE' | 'COMPETENCIAS';
  testId?: string;
  candidateId?: string;
  topicName?: string;
  difficulty?: 'Personalizada' | 'Baja' | 'Media' | 'Alta';
  questionCount?: number;
  questionsLow?: number;
  questionsMed?: number;
  questionsHigh?: number;
}

interface ProcesosInvitadosViewProps {
  candidate: Candidate;
  onStartExam: (payload: StartExamPayload) => void;
}

export interface KnowledgeQuestionnaireItem {
  id: string;
  title: string;
  questionCount: number;
  difficulty: 'Personalizada' | 'Baja' | 'Media' | 'Alta';
  durationMinutes: number;
  score?: number;
  isCompleted: boolean;
  questionsLow?: number;
  questionsMed?: number;
  questionsHigh?: number;
}

interface InvitedProcessDetailed {
  id: string;
  candidateIdInProcess: string;
  codigo: string;
  titulo: string;
  empresa: string;
  puesto_objetivo: string;
  descripcion: string;
  duracion_minutos: number;
  fecha_limite: string;
  estado_postulante: 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';
  // Banderas de activación según configuración del perfil
  hasDisc: boolean;
  hasKnowledge: boolean;
  hasCompetencies: boolean;
  // 1. DISC
  discConfig: {
    title: string;
    description: string;
    durationMinutes: number;
    isCompleted: boolean;
  };
  // 2. Cuestionarios de Conocimientos individuales
  knowledgeQuestionnaires: KnowledgeQuestionnaireItem[];
  // 3. Competencias
  competenciesConfig: {
    title: string;
    description: string;
    items: string[];
    durationMinutes: number;
    isCompleted: boolean;
  };
}

const normalizeTopicString = (str: string) => {
  return (str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

export const ProcesosInvitadosView: React.FC<ProcesosInvitadosViewProps> = ({
  candidate,
  onStartExam
}) => {
  const [invitedProcesses, setInvitedProcesses] = useState<InvitedProcessDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realName, setRealName] = useState<string>(candidate.fullName);
  const [realDni, setRealDni] = useState<string>(candidate.dni);

  // Modal de Advertencia Previa Estricta antes de Iniciar la Prueba
  const [warningModalTarget, setWarningModalTarget] = useState<{
    processId: string;
    processTitle: string;
    payload: StartExamPayload;
    testTitle: string;
    questionCountDesc: string;
    durationMinutes: number;
  } | null>(null);

  const [hasAcknowledgedLockWarning, setHasAcknowledgedLockWarning] = useState(false);

  useEffect(() => {
    setRealName(candidate.fullName);
    setRealDni(candidate.dni);
  }, [candidate.fullName, candidate.dni]);

  const loadProcessAndResults = async () => {
    try {
      const dni = (candidate.dni || '').trim();
      const email = (candidate.email || '').trim().toLowerCase();
      const currentId = candidate.id;

      // 1. Consultar todos los registros de candidato asociados en Supabase
      let candRows: any[] = [];
      try {
        const orFilters: string[] = [];
        if (currentId && !currentId.startsWith('cand-')) orFilters.push(`id.eq.${currentId}`);
        if (dni) orFilters.push(`dni.eq.${dni}`);
        if (email) orFilters.push(`correo.eq.${email}`);

        if (orFilters.length > 0) {
          const { data } = await supabase
            .from('candidatos')
            .select('id, nombre_completo, dni, correo, proceso_id, estado, iniciado_en, completado_en')
            .or(orFilters.join(','));
          candRows = data || [];
        }
      } catch (e) {
        console.warn('[ProcesosInvitadosView] Error consultando filas de candidatos:', e);
      }

      // Si no encontró en Supabase pero tenemos candidate.testId
      if (candRows.length === 0 && candidate.testId) {
        candRows = [{
          id: candidate.id || 'cand_fallback',
          nombre_completo: candidate.fullName,
          dni: candidate.dni,
          correo: candidate.email,
          proceso_id: candidate.testId,
          estado: candidate.status || 'PENDIENTE'
        }];
      }

      // Actualizar nombre y DNI con el registro más completo
      const bestName = candRows.find(r => r.nombre_completo && r.nombre_completo.length > 2)?.nombre_completo || candidate.fullName;
      const bestDni = candRows.find(r => r.dni && r.dni.length >= 7)?.dni || candidate.dni;
      setRealName(bestName);
      setRealDni(bestDni);

      // 2. Extraer todos los proceso_id únicos (manteniendo la fila de candidato respectiva)
      const processCandMap = new Map<string, any>();
      candRows.forEach(r => {
        if (r.proceso_id && !processCandMap.has(r.proceso_id)) {
          processCandMap.set(r.proceso_id, r);
        }
      });

      const uniqueProcessIds = Array.from(processCandMap.keys());
      if (uniqueProcessIds.length === 0 && candidate.testId) {
        uniqueProcessIds.push(candidate.testId);
      }

      const builtProcessList: InvitedProcessDetailed[] = [];

      // 3. Procesar cada proceso al que fue invitado el candidato (uno debajo del otro)
      for (const procId of uniqueProcessIds) {
        const candRow = processCandMap.get(procId);
        const candIdForThisProcess = candRow?.id || candidate.id || 'cand_invitado';

        // Determinar estado en este proceso
        let status: 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO' = 'PENDIENTE';
        const candStatus = candRow?.estado || candidate.status;
        if (candStatus === 'SCORED' || candStatus === 'FINALIST' || candStatus === 'EVALUADO' || candStatus === 'FINALISTA') {
          status = 'FINALIZADO';
        } else if (candStatus === 'IN_PROGRESS' || candStatus === 'EN_CURSO' || candRow?.iniciado_en) {
          status = 'EN_PROGRESO';
        }

        // Consultar resultados DISC y Conocimientos para este proceso y candidato
        const [completedDisc, completedKnowledgeList] = await Promise.all([
          EvaluacionesService.obtenerResultadoDISC(candIdForThisProcess, procId),
          EvaluacionesService.obtenerResultadosConocimientos(candIdForThisProcess, procId)
        ]);

        const isDiscDone = Boolean(completedDisc);
        const knowledgeScoresMap: Record<string, number> = {};
        completedKnowledgeList.forEach((k: any) => {
          if (k.tema) {
            const raw = k.tema.trim().toLowerCase();
            const norm = normalizeTopicString(k.tema);
            const scoreNum = Number(k.puntaje ?? 0);
            knowledgeScoresMap[raw] = scoreNum;
            knowledgeScoresMap[norm] = scoreNum;
            const baseNorm = norm.replace(/\([^)]*\)/g, '').trim();
            if (baseNorm) knowledgeScoresMap[baseNorm] = scoreNum;
          }
        });

        // Consultar detalle del proceso y perfil en Supabase
        const { data: procData } = await supabase
          .from('procesos_evaluacion')
          .select('*, perfiles_puesto(*)')
          .eq('id', procId)
          .maybeSingle();

        let perfil = procData?.perfiles_puesto;

        // Fallback resiliente: Si no hay perfil_puesto_id vinculado o la relación vino nula,
        // buscar en perfiles_puesto por puesto_objetivo o título del proceso
        if (!perfil) {
          const searchClean = (procData?.puesto_objetivo || procData?.titulo || '')
            .replace(/\s+\d{4}\s+\d{2}\s+\d{2}.*$/, '')
            .trim();
          if (searchClean) {
            const { data: fallbackPerfil } = await supabase
              .from('perfiles_puesto')
              .select('*')
              .or(`titulo.ilike.${searchClean},puesto_objetivo.ilike.${searchClean}`)
              .order('creado_en', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (fallbackPerfil) {
              perfil = fallbackPerfil;
              // Auto-vincular en Supabase para futuras consultas
              if (!procData?.perfil_puesto_id && fallbackPerfil.id) {
                supabase
                  .from('procesos_evaluacion')
                  .update({ perfil_puesto_id: fallbackPerfil.id })
                  .eq('id', procId)
                  .then(() => {});
              }
            }
          }
        }

        const meta = perfil?.competencias?._metadata || {};
        const stages: any[] = Array.isArray(meta.stages) ? meta.stages : [];
        const hasCustomStages = stages.length > 0;

        // Determinar qué componentes fueron realmente activados en este perfil
        const hasDisc = hasCustomStages
          ? stages.some(s => s.id === 'STAGE_DISC' || s.category === 'EMOTIONAL' || String(s.name || '').toLowerCase().includes('disc'))
          : true;

        const hasKnowledge = hasCustomStages
          ? stages.some(s => s.id === 'STAGE_CONOCIMIENTOS' || s.category === 'PSYCHOLOGICAL' || String(s.name || '').toLowerCase().includes('conocimiento'))
          : true;

        // Competencias configuradas en el perfil
        let compList: string[] = [];
        if (Array.isArray(meta.selectedList)) {
          compList = meta.selectedList;
        } else if (perfil?.competencias && typeof perfil.competencias === 'object') {
          compList = Object.keys(perfil.competencias).filter(k => !k.startsWith('_'));
        }

        const hasCompetencies = hasCustomStages
          ? stages.some(s => s.id === 'STAGE_COMPETENCIAS' || s.category === 'COMPETENCIES' || String(s.name || '').toLowerCase().includes('competencia')) && compList.length > 0
          : compList.length > 0;

        // Cuestionarios específicos de conocimiento configurados en el perfil
        let rawKnowledgeList: string[] = [];
        if (Array.isArray(meta.knowledgeQuestionnaires) && meta.knowledgeQuestionnaires.length > 0) {
          rawKnowledgeList = meta.knowledgeQuestionnaires;
        } else if (Array.isArray(meta.knowledgeItems) && meta.knowledgeItems.length > 0) {
          rawKnowledgeList = meta.knowledgeItems.map((k: any) => typeof k === 'string' ? k : k.name).filter(Boolean);
        } else if (hasCustomStages) {
          const knowStage = stages.find(s => s.id === 'STAGE_CONOCIMIENTOS');
          if (knowStage?.description && knowStage.description.includes('Cuestionarios: ')) {
            rawKnowledgeList = knowStage.description
              .replace('Cuestionarios: ', '')
              .split(',')
              .map((x: string) => x.trim())
              .filter(Boolean);
          }
        }

        // Si no se especificaron cuestionarios personalizados y el componente está activo, fallback seguro
        if (rawKnowledgeList.length === 0 && hasKnowledge) {
          rawKnowledgeList = [
            'Planificación estratégica',
            'Español nivel basico',
            'Negociación',
            'Psicometria'
          ];
        }

        const configuredKnowledgeItems: KnowledgeQuestionnaireItem[] = hasKnowledge ? rawKnowledgeList.map((topicTitle, idx) => {
          const rawTitle = topicTitle.trim().toLowerCase();
          const normTitle = normalizeTopicString(topicTitle);
          const baseNormTitle = normTitle.replace(/\([^)]*\)/g, '').trim();
          
          let scoreVal = knowledgeScoresMap[normTitle] ?? knowledgeScoresMap[rawTitle] ?? knowledgeScoresMap[baseNormTitle];
          
          if (scoreVal === undefined) {
            const foundKey = Object.keys(knowledgeScoresMap).find(k => 
              k.includes(normTitle) || normTitle.includes(k) || (baseNormTitle && k.includes(baseNormTitle))
            );
            if (foundKey) scoreVal = knowledgeScoresMap[foundKey];
          }

          // Buscar configuración detallada guardada en el perfil para este tema
          const savedItem = Array.isArray(meta.knowledgeItems)
            ? meta.knowledgeItems.find((k: any) => typeof k === 'object' && k.name && k.name.trim().toLowerCase() === rawTitle)
            : null;

          const totalQ = savedItem?.totalQuestions || (
            (savedItem?.questionsLow !== undefined || savedItem?.questionsMed !== undefined || savedItem?.questionsHigh !== undefined)
              ? ((savedItem?.questionsLow || 0) + (savedItem?.questionsMed || 0) + (savedItem?.questionsHigh || 0))
              : 20
          );
          const diff = (savedItem?.difficulty as any) || 'Media';
          const durMins = savedItem?.timeControl ? (savedItem.minutes || 15) : 15;

          const isCompleted = scoreVal !== undefined;
          return {
            id: `k_${idx}_${normTitle}`,
            title: topicTitle,
            questionCount: totalQ || 20,
            difficulty: diff,
            durationMinutes: durMins,
            isCompleted,
            score: scoreVal,
            questionsLow: savedItem?.questionsLow,
            questionsMed: savedItem?.questionsMed,
            questionsHigh: savedItem?.questionsHigh
          };
        }) : [];

        builtProcessList.push({
          id: procId,
          candidateIdInProcess: candIdForThisProcess,
          codigo: procData?.codigo || `PROC-${procId.slice(0, 8).toUpperCase()}`,
          titulo: procData?.titulo || `Convocatoria ${procData?.puesto_objetivo || candidate.position || 'GEA Perú'}`,
          empresa: procData?.empresa || 'GEA Internacional SAC • GEA Perú',
          puesto_objetivo: procData?.puesto_objetivo || candidate.position || 'Asesor Operativo',
          descripcion: procData?.descripcion || 'Evaluación integral psicotécnica, clima emocional y resolución de casos reales.',
          duracion_minutos: procData?.duracion_total_minutos || 45,
          fecha_limite: procData?.fecha_fin ? new Date(procData.fecha_fin).toLocaleDateString('es-PE') : '31/12/2026',
          estado_postulante: status,
          hasDisc,
          hasKnowledge: hasKnowledge && configuredKnowledgeItems.length > 0,
          hasCompetencies,
          discConfig: {
            title: 'Prueba DISC (Conducta y Estilo Laboral)',
            description: 'Evalúa tu perfil conductual, estilo de comunicación y adaptación bajo presión.',
            durationMinutes: 15,
            isCompleted: isDiscDone
          },
          knowledgeQuestionnaires: configuredKnowledgeItems,
          competenciesConfig: {
            title: 'Evaluación de Competencias Clave',
            description: 'Medición de aptitudes y desempeño profesional orientadas a la vacante.',
            items: compList,
            durationMinutes: 10,
            isCompleted: false
          }
        });
      }

      setInvitedProcesses(builtProcessList);
    } catch (err) {
      console.warn('[ProcesosInvitadosView] Error al cargar procesos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcessAndResults();
  }, [candidate]);

  // Manejador del clic en iniciar una prueba específica: abre modal de advertencia previa
  const handleOpenWarningModal = (
    process: InvitedProcessDetailed,
    payload: StartExamPayload,
    testTitle: string,
    questionCountDesc: string,
    durationMinutes: number
  ) => {
    setHasAcknowledgedLockWarning(false);
    setWarningModalTarget({
      processId: process.id,
      processTitle: process.titulo,
      payload,
      testTitle,
      questionCountDesc,
      durationMinutes
    });
  };

  const handleConfirmStartExam = () => {
    if (!warningModalTarget) return;
    const { payload, testTitle, processTitle } = warningModalTarget;

    // Disparar notificación oficial: postulante inició la prueba
    NotificacionesService.crearNotificacion({
      tipo: 'CANDIDATO_INGRESO',
      titulo: 'Postulante inició evaluación',
      mensaje: `${realName || candidate.fullName || candidate.email} inició "${testTitle}" en el proceso "${processTitle}".`,
      candidato_id: payload.candidateId || candidate.id,
      proceso_id: payload.testId
    });

    setWarningModalTarget(null);
    onStartExam(payload);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-sans animate-in fade-in">
      
      {/* 1. TOP HEADER BANNER (GEA BRAND BANNER) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Convocatoria Oficial Activa • GEA Perú</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Procesos Invitados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hola, <strong className="text-slate-800 dark:text-slate-200">{realName || candidate.fullName}</strong> (DNI: {realDni || candidate.dni}). A continuación encuentras las evaluaciones asignadas a tu perfil.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#EEF1FA] dark:bg-[#151D3F] border border-[#DDE2EF]/80 dark:border-[#2A3563]/80 shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#2FA58B]" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-[#1F2A5E] dark:text-[#5B8AE0] block">Acceso Verificado</span>
              <span className="text-[#6B7494] block">Ley N° 29733 Protegido</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#2F5BA8]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. TARJETA ÚNICA DEL PROCESO CON EVALUACIONES UNA DEBAJO DE LA OTRA */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-zinc-400 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563]">
            <div className="w-6 h-6 border-2 border-[#1F2A5E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Cargando tus procesos de evaluación...</span>
          </div>
        ) : invitedProcesses.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563]">
            <Rocket className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              No tienes evaluaciones pendientes en este momento
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Si recibiste una nueva invitación por correo, verifica que hayas ingresado con el enlace provisto.
            </p>
          </div>
        ) : (
          invitedProcesses.map((proc) => {
            return (
              <div
                key={proc.id}
                className="p-6 sm:p-8 rounded-3xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] shadow-xs space-y-6"
              >
                {/* 2.1 CABECERA DE LA TARJETA: TÍTULO, METADATA Y DESCRIPCIÓN */}
                <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-extrabold text-lg sm:text-xl text-[#2F5BA8] dark:text-[#5B8AE0] tracking-tight">
                      {proc.titulo}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1F2A5E]/10 dark:bg-white/10 text-[#1F2A5E] dark:text-white font-mono font-bold text-xs">
                      {proc.codigo}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-y-2 gap-x-5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Empresa: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{proc.empresa}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Duración estimada total: <strong className="text-slate-700 dark:text-slate-300">{proc.duracion_minutos} minutos</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Fecha de vencimiento: <strong className="text-slate-700 dark:text-slate-300">{proc.fecha_limite}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px] flex items-center gap-1">
                        <Hourglass className="w-3 h-3" />
                        <span>Puesto: {proc.puesto_objetivo}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {proc.descripcion}
                  </p>
                </div>

                {/* 2.2 EVALUACIONES UNA DEBAJO DE LA OTRA (LISTA VERTICAL CON BOTÓN INDIVIDUAL) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Evaluaciones asignadas a tu proceso
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Rinde cada prueba de forma independiente. Recuerda que una vez iniciada cada prueba, no podrás salirte hasta completarla.
                      </p>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* PRUEBA 1: DISC (SOLO SI FUE CONFIGURADO EN EL PERFIL)          */}
                  {/* ============================================================== */}
                  {proc.hasDisc && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          DISC
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {proc.discConfig.title}
                            </h4>
                            {proc.discConfig.isCompleted && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Completada</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {proc.discConfig.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <span>⏱ {proc.discConfig.durationMinutes} minutos</span>
                            <span>•</span>
                            <span>2 secciones de bloques conductuales</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-end md:self-center">
                        {proc.discConfig.isCompleted ? (
                          <div className="px-5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Prueba Rendida</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenWarningModal(
                              proc,
                              { type: 'DISC', testId: proc.id, candidateId: proc.candidateIdInProcess },
                              proc.discConfig.title,
                              '2 secciones conductuales (10 preguntas)',
                              proc.discConfig.durationMinutes
                            )}
                            className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
                          >
                            <Rocket className="w-3.5 h-3.5 fill-white/20" />
                            <span>Iniciar Prueba DISC</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* PRUEBA 2: CUESTIONARIOS DE CONOCIMIENTOS (SOLO LOS CONFIGURADOS)*/}
                  {/* ============================================================== */}
                  {proc.hasKnowledge && proc.knowledgeQuestionnaires.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center shadow-xs shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              Prueba de Conocimientos ({proc.knowledgeQuestionnaires.length} {proc.knowledgeQuestionnaires.length === 1 ? 'tema configurado' : 'temas configurados'})
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Cada tema cuenta con 20 preguntas especializadas según la configuración de la vacante.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sub-lista vertical de temas de conocimiento */}
                      <div className="space-y-2.5 pt-1">
                        {proc.knowledgeQuestionnaires.map((kItem) => (
                          <div
                            key={kItem.id}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-purple-300 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                                  {kItem.title}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                                  {kItem.questionCount} preguntas
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                                  Dificultad: {kItem.difficulty}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span>⏱ Tiempo estimado: {kItem.durationMinutes} min</span>
                              </div>
                            </div>

                            <div className="shrink-0 self-end sm:self-center">
                              {kItem.isCompleted ? (
                                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Prueba Rendida</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenWarningModal(
                                    proc,
                                    {
                                      type: 'KNOWLEDGE',
                                      testId: proc.id,
                                      candidateId: proc.candidateIdInProcess,
                                      topicName: kItem.title,
                                      difficulty: kItem.difficulty,
                                      questionCount: kItem.questionCount,
                                      questionsLow: kItem.questionsLow,
                                      questionsMed: kItem.questionsMed,
                                      questionsHigh: kItem.questionsHigh
                                    },
                                    `Cuestionario: ${kItem.title}`,
                                    `${kItem.questionCount} preguntas obligatorias`,
                                    kItem.durationMinutes
                                  )}
                                  className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
                                >
                                  <Rocket className="w-3.5 h-3.5 fill-white/20" />
                                  <span>Iniciar Cuestionario</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* PRUEBA 3: COMPETENCIAS (SOLO SI FUE CONFIGURADA EN EL PERFIL)  */}
                  {/* ============================================================== */}
                  {proc.hasCompetencies && proc.competenciesConfig.items.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {proc.competenciesConfig.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {proc.competenciesConfig.description}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proc.competenciesConfig.items.map((comp, idx) => (
                              <span 
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenWarningModal(
                            proc,
                            {
                              type: 'COMPETENCIAS',
                              testId: proc.id,
                              candidateId: proc.candidateIdInProcess,
                              topicName: 'Evaluación de Competencias'
                            },
                            proc.competenciesConfig.title,
                            `${proc.competenciesConfig.items.length} competencias clave`,
                            proc.competenciesConfig.durationMinutes
                          )}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
                        >
                          <Rocket className="w-3.5 h-3.5 fill-white/20" />
                          <span>Iniciar Competencias</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 3. MODAL DE ADVERTENCIA PREVIA ESTRICTA: NO SE PERMITE SALIR DE LA PRUEBA */}
      {warningModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95 text-zinc-900 dark:text-zinc-100">
            
            {/* Header del Modal */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest block">
                  Aviso importante de seguridad
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ¿Listo para comenzar la evaluación?
                </h3>
              </div>
            </div>

            {/* Caja de Advertencia Estricta */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Salida Bloqueada durante el Examen</span>
              </div>
              <p className="leading-relaxed text-xs">
                Por políticas del proceso de selección oficial de <strong>GEA Perú</strong>, <strong>una vez iniciada la prueba NO se permite salir, pausar ni reiniciar el intento</strong>.
              </p>
              <p className="leading-relaxed text-xs">
                Si cierras la ventana, navegas a otra página o recargas el navegador, tu intento quedará registrado con las respuestas contestadas hasta ese momento.
              </p>
            </div>

            {/* Resumen de la prueba a iniciar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Evaluación:</span>
                <strong className="text-slate-800 dark:text-slate-200">{warningModalTarget.testTitle}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reactivos:</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">{warningModalTarget.questionCountDesc}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tiempo aproximado:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{warningModalTarget.durationMinutes} minutos</span>
              </div>
            </div>

            {/* Checkbox de Aceptación */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasAcknowledgedLockWarning}
                onChange={(e) => setHasAcknowledgedLockWarning(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#6D28D9] focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 select-none leading-normal">
                Comprendo que la prueba no se puede pausar ni abandonar, y confirmo que dispongo del tiempo y conexión requeridos.
              </span>
            </label>

            {/* Botones de Acción */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setWarningModalTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar y Volver
              </button>

              <button
                type="button"
                disabled={!hasAcknowledgedLockWarning}
                onClick={handleConfirmStartExam}
                className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5 fill-white/20" />
                <span>Comenzar Evaluación Ahora</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
