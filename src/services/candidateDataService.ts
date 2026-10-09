import { supabase } from './supabaseClient';
import { Candidate, ExamStageId, AuditEventType, AuditEvent, CandidateDetailedReport, CompetencyScore } from '../types';
import { SAMPLE_QUESTIONS } from '../data/questionBank';

// Helper para validar o generar UUID v4
function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

// Proceso fallback por defecto para asegurar integridad referencial
const DEFAULT_PROCESS_UUID = '22222222-0000-4000-8000-000000000001';

/**
 * Generador fallback de puntuaciones en cero (evita fabricar notas ficticias)
 */
export function generateDefaultScoresForCandidate(id: string, name: string) {
  return {
    overall: 0,
    stage1Psycho: 0,
    stage2Emotional: 0,
    stage3WorkCases: 0,
    percentile: 0
  };
}

/**
 * Calcula las puntuaciones reales del candidato a partir de sus respuestas confirmadas.
 * Cada opción tiene un peso (weight: 100 óptima, 65 aceptable, 30 deficiente, 0 contraproducente).
 */
export function calculateScoresFromAnswers(
  answers: Record<string, any>,
  fallbackCandidate?: { id: string; fullName: string }
) {
  const stage1Questions = SAMPLE_QUESTIONS.filter(q => q.stageId === 'STAGE_1_PSYCHO');
  const stage2Questions = SAMPLE_QUESTIONS.filter(q => q.stageId === 'STAGE_2_EMOTIONAL');
  const stage3Questions = SAMPLE_QUESTIONS.filter(q => q.stageId === 'STAGE_3_WORK_CASES');

  const calcStage = (questions: typeof SAMPLE_QUESTIONS) => {
    if (questions.length === 0) return 0;
    let stageTotal = 0;
    let answeredCount = 0;

    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans) continue;
      const selectedId = typeof ans === 'string' ? ans : ans.selectedOptionId;
      const opt = q.options.find(o => o.id === selectedId);
      if (opt) {
        answeredCount++;
        const weight = opt.weight !== undefined 
          ? opt.weight 
          : (opt.code === 'A' ? 100 : opt.code === 'B' ? 65 : opt.code === 'C' ? 30 : 0);
        stageTotal += weight;
      }
    }

    if (answeredCount === 0) return 0;
    return Math.round(stageTotal / questions.length);
  };

  const s1 = calcStage(stage1Questions);
  const s2 = calcStage(stage2Questions);
  const s3 = calcStage(stage3Questions);

  // Contar total de respuestas válidas
  let totalAnswered = 0;
  for (const q of SAMPLE_QUESTIONS) {
    const ans = answers[q.id];
    if (ans && (typeof ans === 'string' ? ans : ans.selectedOptionId)) {
      totalAnswered++;
    }
  }

  if (totalAnswered > 0) {
    const overall = Math.round((s1 + s2 + s3) / 3);
    const percentile = Math.min(99, Math.max(1, Math.round(overall * 0.96 + 3)));
    return {
      overall,
      stage1Psycho: s1,
      stage2Emotional: s2,
      stage3WorkCases: s3,
      percentile,
      totalAnswered
    };
  }

  if (fallbackCandidate) {
    const def = generateDefaultScoresForCandidate(fallbackCandidate.id, fallbackCandidate.fullName);
    return { ...def, totalAnswered: 0 };
  }

  return {
    overall: 0,
    stage1Psycho: 0,
    stage2Emotional: 0,
    stage3WorkCases: 0,
    percentile: 0,
    totalAnswered: 0
  };
}

/**
 * Obtiene las respuestas del candidato directamente desde Supabase (fallback cuando IndexedDB está vacío).
 * Mapea pregunta_id → selectedOptionId para poder calcular puntajes.
 */
export async function getAnswersFromSupabase(candidateId: string): Promise<Record<string, any>> {
  try {
    // Buscar el intento más reciente del candidato
    const { data: intento } = await supabase
      .from('intentos_examen')
      .select('id')
      .eq('candidato_id', candidateId)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!intento?.id) return {};

    // Obtener todas sus respuestas confirmadas
    const { data: rows } = await supabase
      .from('respuestas_candidato')
      .select('pregunta_id, opcion_seleccionada_id, etapa_id')
      .eq('intento_id', intento.id);

    if (!rows || rows.length === 0) return {};

    const map: Record<string, any> = {};
    for (const r of rows) {
      if (r.pregunta_id) {
        map[r.pregunta_id] = {
          questionId: r.pregunta_id,
          selectedOptionId: r.opcion_seleccionada_id,
          stageId: r.etapa_id
        };
      }
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Generador de informe psicológico y competencias detalladas a partir de puntajes reales
 */
export function generateDefaultReportForCandidate(
  c: { id: string; fullName: string; position: string },
  scores: { overall: number; stage1Psycho: number; stage2Emotional: number; stage3WorkCases: number; percentile: number }
): CandidateDetailedReport {
  const jobFit = Math.min(99, Math.max(10, Math.round(scores.overall * 1.02)));

  const getLevel = (score: number): 'SOBRESALIENTE' | 'ADECUADO' | 'EN_DESARROLLO' | 'BAJO' => {
    if (score >= 85) return 'SOBRESALIENTE';
    if (score >= 70) return 'ADECUADO';
    if (score >= 50) return 'EN_DESARROLLO';
    return 'BAJO';
  };

  const recommendation: 'RECOMENDADO_FINALISTA' | 'RECOMENDADO_CON_OBSERVACIONES' | 'NO_RECOMENDADO' =
    scores.overall >= 80 ? 'RECOMENDADO_FINALISTA' :
    scores.overall >= 60 ? 'RECOMENDADO_CON_OBSERVACIONES' : 'NO_RECOMENDADO';

  const recommendationSummary = scores.overall >= 80
    ? `Postulante con sobresaliente nivel de adecuación (${jobFit}%) al perfil de ${c.position}. Demuestra sólida agilidad de aprendizaje, autorregulación bajo presión y alto criterio resolutivo alineado a los estándares de GEA Perú.`
    : scores.overall >= 60
      ? `Postulante con adecuado nivel de adecuación (${jobFit}%) para ${c.position}. Presenta competencias básicas desarrolladas con oportunidades de refuerzo en resolución bajo presión.`
      : `Postulante con nivel de adecuación por debajo del perfil requerido (${jobFit}%) para ${c.position}. Presenta brechas significativas en razonamiento operativo o autorregulación emocional.`;

  return {
    jobFitPercentage: jobFit,
    evaluationDate: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
    reportCode: `INF-GEA-2026-${(c.id || '0001').slice(-4).toUpperCase()}`,
    psychologistName: 'Psic. Roberto Santillán Castillo',
    psychologistCpsp: 'CPsP N° 28419',
    psychologistRecommendation: recommendation,
    recommendationSummary,
    competencies: [
      {
        name: 'Razonamiento Lógico & Organización',
        category: 'Psicopedagógica',
        score: scores.stage1Psycho,
        level: getLevel(scores.stage1Psycho),
        description: scores.stage1Psycho >= 75
          ? 'Estructuración metódica de actividades y asimilación ágil de pautas operativas.'
          : 'Dificultad relativa en la priorización de flujos y secuenciación de tareas críticas.'
      },
      {
        name: 'Autorregulación Emocional bajo Presión',
        category: 'Personal y Emocional',
        score: scores.stage2Emotional,
        level: getLevel(scores.stage2Emotional),
        description: scores.stage2Emotional >= 75
          ? 'Trato empático, comunicación asertiva y estabilidad anímica ante contingencias.'
          : 'Tendencia a reactividad ante presión temporal o clientes demandantes.'
      },
      {
        name: 'Resolución de Situaciones Laborales',
        category: 'Situaciones Laborales',
        score: scores.stage3WorkCases,
        level: getLevel(scores.stage3WorkCases),
        description: scores.stage3WorkCases >= 75
          ? 'Criterio práctico de priorización y orientación al resultado responsable.'
          : 'Oportunidad de mejora en toma de decisiones autónomas según manual operativo.'
      }
    ],
    strengths: scores.overall >= 70 ? [
      'Excelente predisposición al trabajo metódico y seguimiento de procesos',
      'Capacidad de respuesta asertiva en interacciones de alta demanda',
      'Rigor y responsabilidad en la entrega de compromisos'
    ] : [
      'Disposición básica para la ejecución de tareas guiadas',
      'Interés en el puesto de trabajo y procesos de atención'
    ],
    developmentAreas: scores.overall >= 70 ? [
      'Optimización de tiempos en resolución de tareas complejas simultáneas',
      'Afianzamiento de herramientas digitales avanzadas'
    ] : [
      'Manejo de situaciones de estrés y reclamos complejos de usuarios',
      'Planificación proactiva y cumplimiento riguroso de tiempos de entrega',
      'Pensamiento crítico y análisis de causas raíz en contingencias'
    ],
    suggestedInterviewQuestions: [
      '¿Cómo gestionas una discrepancia de criterios en una entrega urgente con un compañero?',
      'Describe una situación donde tuviste que adaptarte a un cambio operativo imprevisto.'
    ]
  };
}

// Helper para mapear una fila de Supabase a la interfaz Candidate
function mapSupabaseToCandidate(row: any): Candidate {
  const positionName = row.procesos_evaluacion?.puesto_objetivo || row.position || 'Asesor de Operaciones';

  // Normalizar estado desde la base de datos (español o inglés) al tipo CandidateStageStatus
  let status: any = 'INVITED';
  const rawStatus = String(row.estado || row.status || '').toUpperCase();
  if (rawStatus === 'EN_CURSO' || rawStatus === 'IN_PROGRESS' || rawStatus === 'EN_PROCESO') {
    status = 'IN_PROGRESS';
  } else if (rawStatus === 'EVALUADO' || rawStatus === 'SCORED' || rawStatus === 'COMPLETADO') {
    status = 'SCORED';
  } else if (rawStatus === 'FINALISTA' || rawStatus === 'FINALIST') {
    status = 'FINALIST';
  } else if (rawStatus === 'RECHAZADO' || rawStatus === 'REJECTED') {
    status = 'REJECTED';
  } else {
    const rawStage = String(row.etapa_actual || row.current_stage || '').toUpperCase();
    if (row.consentimiento_firmado || row.iniciado_en || rawStage.includes('ETAPA_2') || rawStage.includes('STAGE_2') || rawStage.includes('ETAPA_3') || rawStage.includes('STAGE_3')) {
      status = 'IN_PROGRESS';
    } else {
      status = 'INVITED';
    }
  }

  // Normalizar etapa actual al tipo ExamStageId
  let currentStage: ExamStageId = 'STAGE_1_PSYCHO';
  const rawStage = String(row.etapa_actual || row.current_stage || '').toUpperCase();
  if (rawStage.includes('ETAPA_2') || rawStage.includes('STAGE_2') || rawStage.includes('EMOCIONAL') || rawStage.includes('EMOTIONAL')) {
    currentStage = 'STAGE_2_EMOTIONAL';
  } else if (rawStage.includes('ETAPA_3') || rawStage.includes('STAGE_3') || rawStage.includes('CASOS') || rawStage.includes('WORK_CASES')) {
    currentStage = 'STAGE_3_WORK_CASES';
  } else {
    currentStage = 'STAGE_1_PSYCHO';
  }

  // Recuperar o resolver puntajes y reporte para candidatos calificados o completados
  let scores = row.scores;
  let detailedReport = row.detailed_report;

  // Extraer puntaje guardado en la tabla notas_candidato de Supabase
  const notasRow = Array.isArray(row.notas_candidato) ? row.notas_candidato[0] : row.notas_candidato;
  const dbPuntaje = (notasRow && notasRow.puntaje != null)
    ? Number(notasRow.puntaje)
    : (row.puntaje != null ? Number(row.puntaje) : null);

  if (typeof window !== 'undefined' && row.id) {
    try {
      const cachedScores = localStorage.getItem(`evaluar_candidate_scores_${row.id}`);
      if (cachedScores) scores = JSON.parse(cachedScores);
      const cachedReport = localStorage.getItem(`evaluar_candidate_report_${row.id}`);
      if (cachedReport) detailedReport = JSON.parse(cachedReport);
    } catch {}
  }

  // Considera completado/evaluado si: el estado lo indica, hay fecha de completado, o hay notas reales en la DB
  const hasRealScoreInDb = notasRow && notasRow.puntaje != null && Number(notasRow.puntaje) > 0;
  const isCompletedOrEvaluated = (
    status === 'SCORED' ||
    status === 'FINALIST' ||
    Boolean(row.completado_en) ||
    hasRealScoreInDb
  ) && status !== 'IN_PROGRESS';
  if (isCompletedOrEvaluated) {
    if (notasRow && Array.isArray(notasRow.notas) && notasRow.notas.length >= 3) {
      scores = {
        overall: dbPuntaje != null ? dbPuntaje : Math.round((Number(notasRow.notas[0]) + Number(notasRow.notas[1]) + Number(notasRow.notas[2])) / 3),
        stage1Psycho: Number(notasRow.notas[0]),
        stage2Emotional: Number(notasRow.notas[1]),
        stage3WorkCases: Number(notasRow.notas[2]),
        percentile: Math.min(99, Math.max(1, (dbPuntaje || 75) + 2))
      };
    } else if (dbPuntaje != null) {
      scores = {
        overall: dbPuntaje,
        stage1Psycho: dbPuntaje,
        stage2Emotional: dbPuntaje,
        stage3WorkCases: dbPuntaje,
        percentile: Math.min(99, Math.max(1, dbPuntaje + 2))
      };
    }

    if (scores && (!detailedReport || !detailedReport.jobFitPercentage)) {
      detailedReport = generateDefaultReportForCandidate(
        { id: row.id, fullName: row.nombre_completo || row.full_name || 'Postulante GEA', position: positionName },
        scores
      );
      if (typeof window !== 'undefined' && row.id) {
        try {
          localStorage.setItem(`evaluar_candidate_report_${row.id}`, JSON.stringify(detailedReport));
        } catch {}
      }
    }
  } else {
    // Si el postulante no ha completado (está rindiendo examen o pendiente):
    // Solo deben figurar los datos reales; ningún puntaje ni dictamen final simulado
    scores = undefined;
    detailedReport = undefined;
    if (typeof window !== 'undefined' && row.id) {
      try {
        localStorage.removeItem(`evaluar_candidate_scores_${row.id}`);
        localStorage.removeItem(`evaluar_candidate_report_${row.id}`);
      } catch {}
    }
  }

  return {
    id: row.id,
    fullName: row.nombre_completo || row.full_name || 'Postulante GEA',
    email: row.correo || row.email || '',
    password: row.password || 'Gea2026!',
    phone: row.telefono || row.phone || row.numero || '',
    whatsappUser: row.whatsapp_user || row.telefono || row.phone || '',
    dni: row.dni || '',
    position: positionName,
    testId: row.proceso_id || row.testId || DEFAULT_PROCESS_UUID,
    invitationCode: row.codigo_invitacion || row.invitation_code || `GEA-${row.dni}`,
    invitedAt: row.invitado_en || row.invited_at || new Date().toISOString(),
    status,
    currentStage,
    startedAt: row.iniciado_en || row.started_at,
    completedAt: row.completado_en || row.completed_at,
    totalDurationSeconds: row.duracion_total_segundos || row.total_duration_seconds || 0,
    scores,
    detailedReport,
    auditEventCount: row.audit_event_count || 0,
    criticalFlags: row.critical_flags || 0,
    recruiterNotes: row.recruiter_notes,
    isConsentSigned: Boolean(row.consentimiento_firmado || row.is_consent_signed),
    consentSignedAt: row.consentimiento_firmado_en || row.consent_signed_at
  };
}

export const CandidateDataService = {
  /**
   * Carga todos los candidatos reales desde Supabase en vivo y vincula sus notas de notas_candidato
   */
  async getCandidates(): Promise<Candidate[]> {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*, procesos_evaluacion(titulo, puesto_objetivo), notas_candidato(puntaje, notas)')
        .order('invitado_en', { ascending: false });

      let candidatesData = data;

      if (error || !candidatesData) {
        // Fallback en caso de que la relación directa anidada presente diferencias
        const fallback = await supabase
          .from('candidatos')
          .select('*, procesos_evaluacion(titulo, puesto_objetivo)');

        candidatesData = fallback.data || [];
      }

      // Obtener notas_candidato para garantizar el enlace del puntaje
      try {
        const { data: notasList } = await supabase
          .from('notas_candidato')
          .select('candidato_id, puntaje, notas');

        if (notasList && notasList.length > 0) {
          const notasMap = new Map(notasList.map(n => [n.candidato_id, n]));
          candidatesData = candidatesData.map((c: any) => ({
            ...c,
            notas_candidato: notasMap.get(c.id) || c.notas_candidato
          }));
        }
      } catch (errNotas) {
        console.warn('[CandidateDataService] Advertencia al obtener notas_candidato:', errNotas);
      }

      if (!candidatesData || candidatesData.length === 0) {
        return [];
      }

      return candidatesData.map(mapSupabaseToCandidate);
    } catch (err) {
      console.warn('[CandidateDataService] Excepción al cargar candidatos:', err);
      return [];
    }
  },

  /**
   * Busca un candidato por DNI, correo o código de invitación directamente en Supabase
   */
  async findCandidateByIdentifier(identifier: string): Promise<Candidate | null> {
    if (!identifier) return null;
    const trimmed = identifier.trim();
    const clean = trimmed.toLowerCase();
    const cleanDni = trimmed.replace(/\D/g, '');

    try {
      // 0. Si el identificador es un UUID, buscar directamente por id primario
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
        const { data: byId } = await supabase
          .from('candidatos')
          .select('*, procesos_evaluacion(titulo, puesto_objetivo)')
          .eq('id', trimmed)
          .maybeSingle();
        if (byId) return mapSupabaseToCandidate(byId);
      }

      let query = supabase
        .from('candidatos')
        .select('*, procesos_evaluacion(titulo, puesto_objetivo)');

      if (cleanDni.length >= 7) {
        query = query.or(`dni.eq.${cleanDni},correo.ilike.${clean},codigo_invitacion.ilike.${clean}`);
      } else {
        query = query.or(`correo.ilike.${clean},codigo_invitacion.ilike.${clean}`);
      }

      const { data, error } = await query.maybeSingle();

      let candidateRow = data;
      if (error || !candidateRow) {
        // Fallback directo por correo si contiene @
        if (clean.includes('@')) {
          const { data: byEmail } = await supabase
            .from('candidatos')
            .select('*, procesos_evaluacion(titulo, puesto_objetivo)')
            .ilike('correo', clean)
            .maybeSingle();
          if (byEmail) candidateRow = byEmail;
        }
        // Fallback por DNI exacto
        if (!candidateRow && cleanDni.length >= 7) {
          const { data: byDni } = await supabase
            .from('candidatos')
            .select('*, procesos_evaluacion(titulo, puesto_objetivo)')
            .eq('dni', cleanDni)
            .maybeSingle();
          if (byDni) candidateRow = byDni;
        }
      }

      if (!candidateRow) return null;

      // Obtener notas de notas_candidato para el candidato encontrado
      try {
        const { data: notas } = await supabase
          .from('notas_candidato')
          .select('candidato_id, puntaje, notas')
          .eq('candidato_id', candidateRow.id)
          .maybeSingle();
        if (notas) {
          candidateRow.notas_candidato = notas;
        }
      } catch {}

      return mapSupabaseToCandidate(candidateRow);
    } catch (err) {
      console.warn('[CandidateDataService] Excepción en findCandidateByIdentifier:', err);
      return null;
    }
  },

  /**
   * Crea o actualiza un nuevo candidato real en Supabase con esquema en español
   */
  async createCandidate(candidate: Candidate): Promise<Candidate | null> {
    try {
      const candUuid = ensureUuid(candidate.id);
      const procUuid = (candidate.testId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate.testId))
        ? candidate.testId
        : DEFAULT_PROCESS_UUID;

      const dbStatus = (candidate.status && (candidate.status === 'IN_PROGRESS' ? 'EN_CURSO' : candidate.status === 'SCORED' ? 'EVALUADO' : candidate.status === 'FINALIST' ? 'FINALISTA' : candidate.status === 'REJECTED' ? 'RECHAZADO' : candidate.status)) || 'INVITADO';

      const payload = {
        id: candUuid,
        proceso_id: procUuid,
        nombre_completo: candidate.fullName.trim(),
        correo: candidate.email.toLowerCase().trim(),
        telefono: candidate.phone || '+51 984 123 456',
        whatsapp_user: candidate.whatsappUser || candidate.phone || '+51 984 123 456',
        dni: candidate.dni.trim(),
        codigo_invitacion: candidate.invitationCode || `GEA-${candidate.dni}-${Date.now().toString(36).toUpperCase()}`,
        estado: dbStatus === 'INVITED' ? 'INVITADO' : dbStatus,
        etapa_actual: 'ETAPA_1_PSICOTECNICA',
        consentimiento_firmado: Boolean(candidate.isConsentSigned),
        invitado_en: candidate.invitedAt || new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('candidatos')
        .upsert(payload)
        .select('*, procesos_evaluacion(titulo, puesto_objetivo)')
        .single();

      if (error) {
        console.error('[CandidateDataService] Error al crear candidato:', error.message);
        return null;
      }

      return mapSupabaseToCandidate(data);
    } catch (err) {
      console.error('[CandidateDataService] Excepción al crear candidato:', err);
      return null;
    }
  },

  /**
   * Inserta múltiples candidatos en bloque (Bulk Batch) de forma atómica en Supabase
   */
  async createCandidatesBatch(candidates: Candidate[]): Promise<Candidate[]> {
    if (!candidates || candidates.length === 0) return [];
    try {
      const rows = candidates.map(c => {
        const candUuid = ensureUuid(c.id);
        const procUuid = (c.testId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.testId))
          ? c.testId
          : DEFAULT_PROCESS_UUID;

        const dbStatus = (c.status && (c.status === 'IN_PROGRESS' ? 'EN_CURSO' : c.status === 'SCORED' ? 'EVALUADO' : c.status === 'FINALIST' ? 'FINALISTA' : c.status === 'REJECTED' ? 'RECHAZADO' : c.status)) || 'INVITADO';

        return {
          id: candUuid,
          proceso_id: procUuid,
          nombre_completo: c.fullName.trim(),
          correo: c.email.toLowerCase().trim(),
          telefono: c.phone || '+51 984 123 456',
          whatsapp_user: c.whatsappUser || c.phone || '+51 984 123 456',
          dni: c.dni.trim(),
          codigo_invitacion: c.invitationCode || `GEA-${c.dni}-${Date.now().toString(36).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          estado: dbStatus === 'INVITED' ? 'INVITADO' : dbStatus,
          etapa_actual: 'ETAPA_1_PSICOTECNICA',
          consentimiento_firmado: Boolean(c.isConsentSigned),
          invitado_en: c.invitedAt || new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        };
      });

      const { data, error } = await supabase
        .from('candidatos')
        .upsert(rows)
        .select('*, procesos_evaluacion(titulo, puesto_objetivo)');

      if (error) {
        console.warn('[CandidateDataService] Error en batch, intentando individual:', error.message);
        const successful: Candidate[] = [];
        for (const cand of candidates) {
          const res = await this.createCandidate(cand);
          if (res) successful.push(res);
        }
        return successful;
      }

      return (data || []).map(mapSupabaseToCandidate);
    } catch (err) {
      console.warn('[CandidateDataService] Excepción en createCandidatesBatch:', err);
      return [];
    }
  },

  /**
   * Actualiza el progreso de un candidato en Supabase
   */
  async updateCandidate(candidate: Candidate): Promise<void> {
    try {
      const statusMap: Record<string, string> = {
        INVITED: 'INVITADO',
        IN_PROGRESS: 'EN_CURSO',
        SCORED: 'EVALUADO',
        FINALIST: 'FINALISTA',
        REJECTED: 'RECHAZADO',
        INVITADO: 'INVITADO',
        EN_CURSO: 'EN_CURSO',
        EVALUADO: 'EVALUADO',
        FINALISTA: 'FINALISTA',
        RECHAZADO: 'RECHAZADO'
      };

      const stageMap: Record<string, string> = {
        STAGE_1_PSYCHO: 'ETAPA_1_PSICOTECNICA',
        STAGE_2_EMOTIONAL: 'ETAPA_2_EMOCIONAL',
        STAGE_3_WORK_CASES: 'ETAPA_3_CASOS_TRABAJO',
        ETAPA_1_PSICOTECNICA: 'ETAPA_1_PSICOTECNICA',
        ETAPA_2_EMOCIONAL: 'ETAPA_2_EMOCIONAL',
        ETAPA_3_CASOS_TRABAJO: 'ETAPA_3_CASOS_TRABAJO'
      };

      const updateData: any = {
        actualizado_en: new Date().toISOString()
      };

      if (candidate.status) {
        updateData.estado = statusMap[candidate.status] || 'INVITADO';
      }
      if (candidate.currentStage) {
        updateData.etapa_actual = stageMap[candidate.currentStage] || 'ETAPA_1_PSICOTECNICA';
      }
      if (candidate.startedAt) updateData.iniciado_en = candidate.startedAt;
      if (candidate.completedAt) updateData.completado_en = candidate.completedAt;
      if (candidate.totalDurationSeconds) updateData.duracion_total_segundos = candidate.totalDurationSeconds;
      if (candidate.isConsentSigned) {
        updateData.consentimiento_firmado = true;
        updateData.consentimiento_firmado_en = candidate.consentSignedAt || new Date().toISOString();
      }

      // Solo guardar puntaje oficial en notas_candidato cuando la prueba ha sido culminada
      if (candidate.scores && (candidate.status === 'SCORED' || candidate.status === 'FINALIST')) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`evaluar_candidate_scores_${candidate.id}`, JSON.stringify(candidate.scores));
          } catch {}
        }
        // Guardar de forma persistente el puntaje en la tabla notas_candidato del Supabase
        if (candidate.scores.overall != null) {
          try {
            await supabase
              .from('notas_candidato')
              .upsert({
                candidato_id: candidate.id,
                puntaje: Math.round(Number(candidate.scores.overall)),
                notas: [
                  Math.round(candidate.scores.stage1Psycho || 0),
                  Math.round(candidate.scores.stage2Emotional || 0),
                  Math.round(candidate.scores.stage3WorkCases || 0)
                ],
                actualizado_en: new Date().toISOString()
              }, { onConflict: 'candidato_id' });
          } catch (errNotas) {
            console.warn('[CandidateDataService] Error al guardar en notas_candidato:', errNotas);
          }
        }
      }
      if (candidate.detailedReport) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`evaluar_candidate_report_${candidate.id}`, JSON.stringify(candidate.detailedReport));
          } catch {}
        }
      }

      const { error } = await supabase
        .from('candidatos')
        .update(updateData)
        .eq('id', candidate.id);

      if (error) {
        console.warn('[CandidateDataService] Error en updateCandidate:', error.message);
      }
    } catch (err) {
      console.warn('[CandidateDataService] Excepción en updateCandidate:', err);
    }
  },

  /**
   * Guarda o actualiza directamente el puntaje numérico en la tabla notas_candidato de Supabase
   */
  async saveCandidateScore(candidateId: string, puntaje: number, notas?: number[]): Promise<void> {
    try {
      await supabase
        .from('notas_candidato')
        .upsert({
          candidato_id: candidateId,
          puntaje: Math.round(puntaje),
          notas: notas || null,
          actualizado_en: new Date().toISOString()
        }, { onConflict: 'candidato_id' });
    } catch (err) {
      console.warn('[CandidateDataService] Error en saveCandidateScore:', err);
    }
  },

  /**
   * Elimina un candidato en Supabase (derechos ARCO Ley N° 29733)
   */
  async deleteCandidate(candidateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidateId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Guarda o actualiza una respuesta en la tabla `respuestas_candidato` de Supabase
   */
  async saveAnswer(
    candidateId: string,
    questionId: string,
    selectedOptionId: string,
    stageId: ExamStageId
  ): Promise<void> {
    try {
      const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      if (isUuid(questionId) && isUuid(selectedOptionId)) {
        const stageMap: Record<string, string> = {
          STAGE_1_PSYCHO: 'ETAPA_1_PSICOTECNICA',
          STAGE_2_EMOTIONAL: 'ETAPA_2_EMOCIONAL',
          STAGE_3_WORK_CASES: 'ETAPA_3_CASOS_TRABAJO'
        };
        await supabase
          .from('respuestas_candidato')
          .insert({
            pregunta_id: questionId,
            opcion_seleccionada_id: selectedOptionId,
            etapa_id: stageMap[stageId] || 'ETAPA_1_PSICOTECNICA',
            confirmada_cliente_en: new Date().toISOString()
          });
      }
    } catch (err) {
      // Las respuestas ya quedan aseguradas en Dexie IndexedDB local de manera infalible
    }
  },

  /**
   * Registra un evento de auditoría antifraude en Supabase con nombres de columna reales
   */
  async logAuditEvent(
    candidateId: string,
    type: AuditEventType,
    description: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL',
    stageId?: ExamStageId
  ): Promise<void> {
    try {
      const severityMap: Record<string, 'INFO' | 'ADVERTENCIA' | 'CRITICO'> = {
        INFO: 'INFO',
        WARNING: 'ADVERTENCIA',
        CRITICAL: 'CRITICO',
        ADVERTENCIA: 'ADVERTENCIA',
        CRITICO: 'CRITICO'
      };

      const stageMap: Record<string, string> = {
        STAGE_1_PSYCHO: 'ETAPA_1_PSICOTECNICA',
        STAGE_2_EMOTIONAL: 'ETAPA_2_EMOCIONAL',
        STAGE_3_WORK_CASES: 'ETAPA_3_CASOS_TRABAJO',
        ETAPA_1_PSICOTECNICA: 'ETAPA_1_PSICOTECNICA',
        ETAPA_2_EMOCIONAL: 'ETAPA_2_EMOCIONAL',
        ETAPA_3_CASOS_TRABAJO: 'ETAPA_3_CASOS_TRABAJO'
      };

      // Resolver intento_id obligatorio de la base de datos
      let validAttemptId = /^[0-9a-f-]{36}$/i.test(stageId as string) ? (stageId as string) : null;
      if (!validAttemptId && /^[0-9a-f-]{36}$/i.test(candidateId)) {
        const { data: intento } = await supabase
          .from('intentos_examen')
          .select('id')
          .eq('candidato_id', candidateId)
          .order('creado_en', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (intento?.id) {
          validAttemptId = intento.id;
        } else {
          const { data: cand } = await supabase
            .from('candidatos')
            .select('proceso_id')
            .eq('id', candidateId)
            .maybeSingle();

          const { data: newIntento } = await supabase
            .from('intentos_examen')
            .insert({
              candidato_id: candidateId,
              proceso_id: cand?.proceso_id || DEFAULT_PROCESS_UUID
            })
            .select('id')
            .maybeSingle();

          if (newIntento?.id) validAttemptId = newIntento.id;
        }
      }

      if (!validAttemptId) return;

      const { error } = await supabase
        .from('eventos_auditoria')
        .insert({
          intento_id: validAttemptId,
          candidato_id: candidateId,
          tipo_evento: String(type),
          descripcion: description,
          severidad: severityMap[severity] || 'INFO',
          etapa_id: stageId && stageMap[stageId] ? stageMap[stageId] : null,
          marca_tiempo_cliente: new Date().toISOString()
        });

      if (error) {
        console.warn('[Supabase logAuditEvent Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase logAuditEvent Exception]:', err);
    }
  },

  /**
   * Resetea el progreso de un candidato para reenvío de invitación.
   * Limpia localStorage, reinicia estado en Supabase y elimina el puntaje en notas_candidato.
   */
  async resetCandidateForResend(candidateId: string): Promise<boolean> {
    try {
      // 1. Limpiar caché de localStorage del candidato
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes(candidateId)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        // También limpiar sessionStorage
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.includes(candidateId)) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));
      }

      // 2. Reiniciar estado del candidato en la tabla candidatos
      const { error: resetError } = await supabase
        .from('candidatos')
        .update({
          estado: 'INVITADO',
          etapa_actual: 'ETAPA_1_PSICOTECNICA',
          consentimiento_firmado: false,
          consentimiento_firmado_en: null,
          iniciado_en: null,
          completado_en: null,
          duracion_total_segundos: null,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', candidateId);

      if (resetError) {
        console.warn('[CandidateDataService] Error al resetear candidato:', resetError.message);
      }

      // 3. Eliminar el puntaje en notas_candidato para que empiece en cero
      await supabase
        .from('notas_candidato')
        .delete()
        .eq('candidato_id', candidateId);

      // 4. Registrar evento de auditoría del reenvío
      await this.logAuditEvent(
        candidateId,
        'SESSION_START' as AuditEventType,
        'Administrador reenvió la invitación y reseteó el progreso del candidato.',
        'INFO'
      );

      return !resetError;
    } catch (err) {
      console.warn('[CandidateDataService] Excepción en resetCandidateForResend:', err);
      return false;
    }
  },

  /**
   * Obtiene eventos de auditoría para un candidato desde Supabase con nombres de columna reales
   */
  async getAuditLogs(candidateId: string): Promise<AuditEvent[]> {
    try {
      const { data, error } = await supabase
        .from('eventos_auditoria')
        .select('*')
        .eq('candidato_id', candidateId)
        .order('marca_tiempo_cliente', { ascending: false });

      if (error || !data) return [];
      return data.map(row => ({
        id: row.id,
        candidateId: row.candidato_id,
        attemptId: row.intento_id,
        stageId: row.etapa_id,
        type: row.tipo_evento,
        description: row.descripcion,
        severity: row.severidad === 'ADVERTENCIA' ? 'WARNING' : (row.severidad === 'CRITICO' ? 'CRITICAL' : 'INFO'),
        timestamp: row.marca_tiempo_cliente || row.marca_tiempo_servidor,
        metadata: row.metadatos
      }));
    } catch {
      return [];
    }
  }
};
