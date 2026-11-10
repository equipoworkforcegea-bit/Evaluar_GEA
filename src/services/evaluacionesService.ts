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

export interface CompetenciaResultadoPayload {
  candidatoId: string;
  procesoId: string;
  competencia: string;
  puntaje: number;
  puntajeMaximo?: number;
  nivel?: string;
  totalBloques?: number;
  respuestas?: any;
  tiempoSegundos?: number;
}

const LOCAL_STORAGE_KEY_CONOCIMIENTOS = 'gea_evaluaciones_conocimientos';
const LOCAL_STORAGE_KEY_DISC = 'gea_evaluaciones_disc';
const LOCAL_STORAGE_KEY_COMPETENCIAS = 'gea_evaluaciones_competencias';

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

      // Actualizar estado del candidato en Supabase a EVALUADO y registrar completado_en
      if (safeCandId && !safeCandId.startsWith('cand_')) {
        try {
          await supabase
            .from('candidatos')
            .update({
              estado: 'EVALUADO',
              completado_en: new Date().toISOString(),
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

      // Actualizar estado del candidato en Supabase a EVALUADO y registrar completado_en
      if (payload.candidatoId && !payload.candidatoId.startsWith('cand_')) {
        try {
          await supabase
            .from('candidatos')
            .update({
              estado: 'EVALUADO',
              completado_en: new Date().toISOString(),
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
  async obtenerResultadosConocimientos(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    try {
      // 1. Intentar por candidato_id exacto
      if (candidatoId) {
        let query = supabase.from('evaluaciones_conocimientos').select('*').eq('candidato_id', candidatoId);
        if (procesoId) query = query.eq('proceso_id', procesoId);
        const { data, error } = await query.order('completado_en', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      }

      // 2. Si no hubo resultados y tenemos email, buscar todos los candidato_id asociados a ese email
      if (email) {
        const { data: candList } = await supabase.from('candidatos').select('id').eq('correo', email);
        if (candList && candList.length > 0) {
          const ids = candList.map(c => c.id);
          const { data: dataByEmail, error: errByEmail } = await supabase
            .from('evaluaciones_conocimientos')
            .select('*')
            .in('candidato_id', ids)
            .order('completado_en', { ascending: false });
          if (!errByEmail && dataByEmail && dataByEmail.length > 0) {
            return dataByEmail;
          }
        }
      }

      // 3. Si no hay candidatoId pero hay procesoId
      if (procesoId && !candidatoId) {
        const { data } = await supabase.from('evaluaciones_conocimientos').select('*').eq('proceso_id', procesoId).order('completado_en', { ascending: false });
        if (data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando Supabase:', err);
    }

    // Fallback a LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS) || '[]');
      return stored.filter((item: any) => 
        (candidatoId && item.candidatoId === candidatoId) ||
        (procesoId && item.procesoId === procesoId) ||
        (email && item.email === email)
      );
    } catch {
      return [];
    }
  },

  /**
   * Obtiene el resultado DISC de un candidato
   */
  async obtenerResultadoDISC(candidatoId: string, procesoId?: string, email?: string): Promise<any | null> {
    try {
      // 1. Intentar por candidato_id exacto
      if (candidatoId) {
        let query = supabase.from('evaluaciones_disc').select('*').eq('candidato_id', candidatoId);
        if (procesoId) query = query.eq('proceso_id', procesoId);
        const { data, error } = await query.order('completado_en', { ascending: false }).limit(1);
        if (!error && data && data.length > 0) {
          return data[0];
        }
      }

      // 2. Si no hubo resultados y tenemos email, buscar todos los candidato_id asociados a ese email
      if (email) {
        const { data: candList } = await supabase.from('candidatos').select('id').eq('correo', email);
        if (candList && candList.length > 0) {
          const ids = candList.map(c => c.id);
          const { data: dataByEmail, error: errByEmail } = await supabase
            .from('evaluaciones_disc')
            .select('*')
            .in('candidato_id', ids)
            .order('completado_en', { ascending: false })
            .limit(1);
          if (!errByEmail && dataByEmail && dataByEmail.length > 0) {
            return dataByEmail[0];
          }
        }
      }

      // 3. Si no hay candidatoId pero hay procesoId
      if (procesoId && !candidatoId) {
        const { data } = await supabase.from('evaluaciones_disc').select('*').eq('proceso_id', procesoId).order('completado_en', { ascending: false }).limit(1);
        if (data && data.length > 0) return data[0];
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando DISC en Supabase:', err);
    }

    // Fallback a LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISC) || '[]');
      const matches = stored.filter((item: any) => 
        (candidatoId && item.candidatoId === candidatoId) ||
        (procesoId && item.procesoId === procesoId) ||
        (email && item.email === email)
      );
      return matches[matches.length - 1] || null;
    } catch {
      return null;
    }
  },

  /**
   * Guarda el resultado y las respuestas de una evaluación de competencia en la tabla oficial `evaluaciones_competencias`
   * con respaldo resiliente en LocalStorage y tabla secundaria si aplica.
   */
  async guardarResultadoCompetencia(payload: CompetenciaResultadoPayload): Promise<boolean> {
    // 1. Guardar primero en LocalStorage para disponibilidad inmediata
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_COMPETENCIAS) || '[]');
      stored.push({
        ...payload,
        completadoEn: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPETENCIAS, JSON.stringify(stored));
    } catch (e) {
      console.warn('[EvaluacionesService] Error guardando en LocalStorage de competencias:', e);
    }

    // 2. Guardar en Supabase en la tabla oficial: `evaluaciones_competencias`
    try {
      const safeCandId = payload.candidatoId || 'cand_oficial';
      const safeProcId = payload.procesoId || 'proc_oficial';
      const cleanCompName = payload.competencia.trim();
      const maxPts = payload.puntajeMaximo || 20;
      const pts = payload.puntaje ?? 0;
      const totalBlocks = payload.totalBloques || 10;

      // Inserción en tabla oficial `evaluaciones_competencias`
      const { error: compError } = await supabase
        .from('evaluaciones_competencias')
        .insert({
          candidato_id: safeCandId,
          proceso_id: safeProcId,
          competencia: cleanCompName,
          puntaje: pts,
          puntaje_maximo: maxPts,
          nivel: payload.nivel || 'Básico',
          total_bloques: totalBlocks,
          respuestas: payload.respuestas || {},
          tiempo_segundos: payload.tiempoSegundos || 0,
          completado_en: new Date().toISOString()
        });

      if (!compError) {
        console.log('✓ [EvaluacionesService] Guardado exitoso en tabla oficial evaluaciones_competencias:', cleanCompName);
      } else {
        console.warn('[EvaluacionesService] Error en evaluaciones_competencias (fallback a conocimientos):', compError.message);
        try {
          const aciertosCalc = Math.round((pts / maxPts) * totalBlocks);
          await supabase
            .from('evaluaciones_conocimientos')
            .insert({
              candidato_id: safeCandId,
              proceso_id: safeProcId,
              tema: `COMPETENCIA: ${cleanCompName}`,
              dificultad: payload.nivel || 'Media',
              puntaje: pts,
              puntaje_maximo: maxPts,
              total_preguntas: totalBlocks,
              aciertos: aciertosCalc,
              errores: Math.max(0, totalBlocks - aciertosCalc),
              respuestas: payload.respuestas || {},
              tiempo_empleado_segundos: payload.tiempoSegundos || 0,
              completado_en: new Date().toISOString()
            });
        } catch {}
      }

      // Actualizar estado del candidato a EVALUADO
      if (safeCandId && !safeCandId.startsWith('cand_') && safeCandId !== 'cand-fallback') {
        try {
          await supabase
            .from('candidatos')
            .update({
              estado: 'EVALUADO',
              completado_en: new Date().toISOString(),
              actualizado_en: new Date().toISOString()
            })
            .eq('id', safeCandId);
        } catch {}
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando competencia:', err);
      return true;
    }
  },

  /**
   * Obtiene los resultados de competencias completadas por un candidato
   */
  async obtenerResultadosCompetencias(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    const resultsMap = new Map<string, any>();

    // 1. Consultar tabla oficial `evaluaciones_competencias` en Supabase
    try {
      let query = supabase
        .from('evaluaciones_competencias')
        .select('*');

      if (candidatoId) {
        query = query.eq('candidato_id', candidatoId);
      }
      if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      }

      const { data, error } = await query.order('completado_en', { ascending: false });
      if (!error && data && data.length > 0) {
        data.forEach(item => {
          const rawName = (item.competencia || '').trim();
          if (rawName && !resultsMap.has(rawName.toLowerCase())) {
            resultsMap.set(rawName.toLowerCase(), {
              competencia: rawName,
              puntaje: item.puntaje,
              puntajeMaximo: item.puntaje_maximo,
              nivel: item.nivel,
              completadoEn: item.completado_en,
              tiempoSegundos: item.tiempo_segundos
            });
          }
        });
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando evaluaciones_competencias en Supabase:', err);
    }

    // 2. Fallback a evaluaciones_conocimientos para compatibilidad histórica
    try {
      let query = supabase
        .from('evaluaciones_conocimientos')
        .select('*')
        .ilike('tema', 'COMPETENCIA:%');

      if (candidatoId) {
        query = query.eq('candidato_id', candidatoId);
      }
      if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      }

      const { data, error } = await query.order('completado_en', { ascending: false });
      if (!error && data && data.length > 0) {
        data.forEach(item => {
          const rawName = item.tema.replace(/^COMPETENCIA:\s*/i, '').trim();
          if (rawName && !resultsMap.has(rawName.toLowerCase())) {
            resultsMap.set(rawName.toLowerCase(), {
              competencia: rawName,
              puntaje: item.puntaje,
              puntajeMaximo: item.puntaje_maximo,
              nivel: item.dificultad,
              completadoEn: item.completado_en,
              tiempoSegundos: item.tiempo_empleado_segundos
            });
          }
        });
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando competencias en Supabase:', err);
    }

    // 3. Complementar con LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_COMPETENCIAS) || '[]');
      stored.forEach((item: any) => {
        const matchCand = !candidatoId || item.candidatoId === candidatoId;
        const matchProc = !procesoId || item.procesoId === procesoId;
        const matchMail = !email || item.email === email;

        if (matchCand && matchProc && matchMail && item.competencia) {
          const key = item.competencia.trim().toLowerCase();
          if (!resultsMap.has(key)) {
            resultsMap.set(key, {
              competencia: item.competencia,
              puntaje: item.puntaje,
              puntajeMaximo: item.puntajeMaximo || 20,
              nivel: item.nivel,
              completadoEn: item.completadoEn,
              tiempoSegundos: item.tiempoSegundos
            });
          }
        }
      });
    } catch {}

    return Array.from(resultsMap.values());
  }
};

