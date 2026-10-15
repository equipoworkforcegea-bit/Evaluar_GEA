import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tipiorfjpdpiozwfhxfd.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcGlvcmZqcGRwaW96d2ZoeGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjQ1ODMsImV4cCI6MjEwNjQ0MDU4M30.7gmibSRbkrYYRCZfoSGwUWo8yn3QkiSeV1lKAOswWhY';

export const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos adaptados al esquema en español
export type EtapaExamenId = 'ETAPA_1_PSICOTECNICA' | 'ETAPA_2_EMOCIONAL' | 'ETAPA_3_CASOS_TRABAJO';

export interface PreguntaExamen {
  pregunta_id: string;
  numero_orden: number;
  enunciado: string;
  contexto?: string;
  opciones: Array<{
    id: string;
    codigo: 'A' | 'B' | 'C' | 'D';
    texto: string;
  }>;
  vence_servidor: string;
}

export const SupabaseExamService = {
  /**
   * Vincula la sesión autenticada con el código de invitación
   */
  async canjearInvitacion(codigo: string): Promise<string> {
    const { data, error } = await supabase.rpc('canjear_invitacion', {
      p_codigo: codigo.trim()
    });
    if (error) throw new Error(error.message);
    return data as string; // devuelve candidato_id
  },

  /**
   * Registra la firma del consentimiento informado
   */
  async aceptarConsentimiento(candidatoId: string): Promise<void> {
    const { error } = await supabase.rpc('aceptar_consentimiento', {
      p_candidato_id: candidatoId
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Inicia el examen y abre la Etapa 1 en el servidor de forma idempotente
   */
  async iniciarIntento(candidatoId: string): Promise<string> {
    const { data, error } = await supabase.rpc('iniciar_intento', {
      p_candidato_id: candidatoId
    });
    if (error) throw new Error(error.message);
    return data as string; // devuelve intento_id
  },

  /**
   * Obtiene las preguntas de una etapa sin exponer los pesos, validando que el reloj del servidor esté activo
   */
  async obtenerPreguntasEtapa(intentoId: string, etapaId: EtapaExamenId): Promise<PreguntaExamen[]> {
    const { data, error } = await supabase.rpc('obtener_preguntas_etapa', {
      p_intento_id: intentoId,
      p_etapa: etapaId
    });
    if (error) throw new Error(error.message);
    return (data || []) as PreguntaExamen[];
  },

  /**
   * Envía una respuesta individual. El servidor valida la vigencia del tiempo y calcula el puntaje
   */
  async enviarRespuesta(
    intentoId: string,
    preguntaId: string,
    opcionId: string,
    confirmadoClienteEn?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('enviar_respuesta', {
      p_intento_id: intentoId,
      p_pregunta_id: preguntaId,
      p_opcion_id: opcionId,
      p_confirmada_cliente_en: confirmadoClienteEn || new Date().toISOString()
    });
    if (error) throw new Error(error.message);
    return data as string; // marca de tiempo del servidor
  },

  /**
   * Cierra una etapa. Si es la última, finaliza el examen y dispara la calificación
   */
  async cerrarEtapa(intentoId: string, etapaId: EtapaExamenId, motivo: string = 'NORMAL'): Promise<boolean> {
    const { data, error } = await supabase.rpc('cerrar_etapa', {
      p_intento_id: intentoId,
      p_etapa: etapaId,
      p_motivo: motivo
    });
    if (error) throw new Error(error.message);
    return Boolean(data); // true si el examen concluyó por completo
  },

  /**
   * Abre la siguiente etapa si la anterior ya fue cerrada
   */
  async iniciarEtapa(intentoId: string, etapaId: EtapaExamenId): Promise<string> {
    const { data, error } = await supabase.rpc('iniciar_etapa', {
      p_intento_id: intentoId,
      p_etapa: etapaId
    });
    if (error) throw new Error(error.message);
    return data as string; // timestamp de vencimiento en servidor
  },

  /**
   * Registra eventos de telemetría y auditoría antifraude
   */
  async registrarEventoAuditoria(
    intentoId: string,
    candidatoId: string,
    tipoEvento: string,
    descripcion: string,
    severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICO' = 'INFO',
    etapaId?: EtapaExamenId
  ): Promise<void> {
    const { error } = await supabase.from('eventos_auditoria').insert({
      intento_id: intentoId,
      candidato_id: candidatoId,
      etapa_id: etapaId,
      tipo_evento: tipoEvento,
      descripcion,
      severidad,
      marca_tiempo_cliente: new Date().toISOString()
    });
    if (error) {
      console.warn('[Auditoría Supabase Warning]:', error.message);
    }
  },

  /**
   * Consulta el informe ejecutivo y puntaje del candidato
   */
  async obtenerReporte(candidatoId: string) {
    const { data, error } = await supabase
      .from('reportes_candidato')
      .select('*')
      .eq('candidato_id', candidatoId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Lista los procesos activos para el panel de reclutamiento
   */
  async listarProcesos() {
    const { data, error } = await supabase
      .from('procesos_evaluacion')
      .select('*, perfiles_puesto(*)')
      .eq('activo', true)
      .order('creado_en', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Lista los postulantes de un proceso
   */
  async listarCandidatos(procesoId?: string) {
    let query = supabase
      .from('candidatos')
      .select('*, reportes_candidato(*)');

    if (procesoId) {
      query = query.eq('proceso_id', procesoId);
    }

    const { data, error } = await query.order('invitado_en', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
};
