import { supabase } from './supabaseClient';

export interface ConocimientoResultadoPayload {
  candidatoId: string;
  procesoId: string;
  tema: string;
  dificultad: string;
  puntaje: number;
  puntajeMaximo?: number;
  totalPreguntas: number;
  aciertos: number;
  errores: number;
  respuestas: Array<{
    preguntaId: number;
    enunciado: string;
    respuestaSeleccionada: string;
    respuestaCorrecta: string;
    esCorrecta: boolean;
  }>;
  tiempoSegundos?: number;
}

export interface DISCResultadoPayload {
  candidatoId: string;
  procesoId: string;
  respuestas: Record<string, string[]>;
  conteoD: number;
  conteoI: number;
  conteoS: number;
  conteoC: number;
  perfilDominante: string;
}

const LOCAL_STORAGE_KEY_CONOCIMIENTOS = 'gea_evaluaciones_conocimientos';
const LOCAL_STORAGE_KEY_DISC = 'gea_evaluaciones_disc';

export const EvaluacionesService = {
  /**
   * Guarda el resultado y las respuestas de un cuestionario de conocimientos en Supabase y LocalStorage
   */
  async guardarResultadoConocimientos(payload: ConocimientoResultadoPayload): Promise<boolean> {
    // 1. Guardar siempre en LocalStorage como respaldo infalible
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS) || '[]');
      stored.push({
        ...payload,
        completadoEn: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS, JSON.stringify(stored));
    } catch (e) {
      console.warn('[EvaluacionesService] Error guardando respaldo local de conocimientos:', e);
    }

    // 2. Guardar en Supabase tabla `evaluaciones_conocimientos`
    try {
      const safeCandId = payload.candidatoId || 'cand_oficial';
      const safeProcId = payload.procesoId || 'proc_oficial';

      const { error } = await supabase
        .from('evaluaciones_conocimientos')
        .insert({
          candidato_id: safeCandId,
          proceso_id: safeProcId,
          tema: payload.tema,
          dificultad: payload.dificultad || 'Media',
          puntaje: payload.puntaje ?? 0,
          puntaje_maximo: payload.puntajeMaximo || 20,
          total_preguntas: payload.totalPreguntas || 20,
          aciertos: payload.aciertos ?? 0,
          errores: payload.errores ?? 0,
          respuestas: payload.respuestas || [],
          tiempo_empleado_segundos: payload.tiempoSegundos || 0,
          completado_en: new Date().toISOString()
        });

      if (error) {
        console.warn('[EvaluacionesService] Error guardando en Supabase evaluaciones_conocimientos:', error.message);
        return false;
      }
      console.log('✓ [EvaluacionesService] Respuestas de Conocimientos guardadas con éxito en Supabase:', payload.tema);

      // Actualizar estado del candidato en Supabase si tiene candidato_id válido
      if (safeCandId && !safeCandId.startsWith('cand_')) {
        try {
          await supabase
            .from('candidatos')
            .update({
              estado: 'EN_CURSO',
              actualizado_en: new Date().toISOString()
            })
            .eq('id', safeCandId);
        } catch {}
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando conocimientos en Supabase:', err);
      return false;
    }
  },

  /**
   * Guarda el resultado y las respuestas de la prueba DISC en Supabase y LocalStorage
   */
  async guardarResultadoDISC(payload: DISCResultadoPayload): Promise<boolean> {
    // 1. Guardar siempre en LocalStorage como respaldo infalible
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISC) || '[]');
      stored.push({
        ...payload,
        completadoEn: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_DISC, JSON.stringify(stored));
    } catch (e) {
      console.warn('[EvaluacionesService] Error guardando respaldo local de DISC:', e);
    }

    // 2. Guardar en Supabase tabla `evaluaciones_disc`
    try {
      const { error } = await supabase
        .from('evaluaciones_disc')
        .insert({
          candidato_id: payload.candidatoId,
          proceso_id: payload.procesoId,
          respuestas: payload.respuestas,
          conteo_d: payload.conteoD,
          conteo_i: payload.conteoI,
          conteo_s: payload.conteoS,
          conteo_c: payload.conteoC,
          perfil_dominante: payload.perfilDominante,
          completado_en: new Date().toISOString()
        });

      if (error) {
        console.warn('[EvaluacionesService] Error guardando en Supabase evaluaciones_disc:', error.message);
        return false;
      }
      console.log('✓ [EvaluacionesService] Respuestas de DISC guardadas con éxito en Supabase');

      // Actualizar estado del candidato en Supabase si tiene candidato_id válido
      if (payload.candidatoId && !payload.candidatoId.startsWith('cand_')) {
        try {
          await supabase
            .from('candidatos')
            .update({
              estado: 'EN_CURSO',
              actualizado_en: new Date().toISOString()
            })
            .eq('id', payload.candidatoId);
        } catch {}
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando DISC en Supabase:', err);
      return false;
    }
  },

  /**
   * Obtiene los resultados de conocimientos completados por un candidato
   */
  async obtenerResultadosConocimientos(candidatoId: string, procesoId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('evaluaciones_conocimientos')
        .select('*');

      if (candidatoId && procesoId) {
        query = query.or(`candidato_id.eq.${candidatoId},proceso_id.eq.${procesoId}`);
      } else if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      } else if (candidatoId) {
        query = query.eq('candidato_id', candidatoId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando Supabase:', err);
    }

    // Fallback a LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS) || '[]');
      return stored.filter((item: any) => 
        (procesoId && item.procesoId === procesoId) || (candidatoId && item.candidatoId === candidatoId)
      );
    } catch {
      return [];
    }
  },

  /**
   * Obtiene el resultado DISC de un candidato
   */
  async obtenerResultadoDISC(candidatoId: string, procesoId?: string): Promise<any | null> {
    try {
      let query = supabase
        .from('evaluaciones_disc')
        .select('*');

      if (candidatoId && procesoId) {
        query = query.or(`candidato_id.eq.${candidatoId},proceso_id.eq.${procesoId}`);
      } else if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      } else if (candidatoId) {
        query = query.eq('candidato_id', candidatoId);
      }

      const { data, error } = await query.order('completado_en', { ascending: false }).limit(1);
      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando DISC en Supabase:', err);
    }

    // Fallback a LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISC) || '[]');
      const matches = stored.filter((item: any) => 
        (procesoId && item.procesoId === procesoId) || (candidatoId && item.candidatoId === candidatoId)
      );
      return matches[matches.length - 1] || null;
    } catch {
      return null;
    }
  }
};

