import { supabase } from './supabaseClient';

export interface ConocimientoResultadoPayload {
  candidatoId: string;
  procesoId: string;
  email?: string;
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
  email?: string;
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
  email?: string;
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
   * Vinculado estrictamente al proceso correspondiente.
   */
  async guardarResultadoConocimientos(payload: ConocimientoResultadoPayload): Promise<boolean> {
    const nowIso = new Date().toISOString();

    // 1. Guardar siempre en LocalStorage como respaldo infalible
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS) || '[]');
      stored.push({
        ...payload,
        completadoEn: nowIso
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS, JSON.stringify(stored));
    } catch (e) {
      console.warn('[EvaluacionesService] Error guardando respaldo local de conocimientos:', e);
    }

    // 2. Guardar en Supabase tabla `evaluaciones_conocimientos`
    try {
      let safeCandId = payload.candidatoId || 'cand_oficial';
      const safeProcId = payload.procesoId || 'proc_oficial';

      // Resolver candidate_id específico para este proceso si tenemos email o procesoId
      if (safeProcId && /^[0-9a-f-]{36}$/i.test(safeProcId)) {
        try {
          const { data: candMatch } = await supabase
            .from('candidatos')
            .select('id')
            .eq('proceso_id', safeProcId)
            .or(`id.eq.${safeCandId}${payload.email ? `,correo.ilike.${payload.email.trim().toLowerCase()}` : ''}`)
            .limit(1)
            .maybeSingle();

          if (candMatch?.id) {
            safeCandId = candMatch.id;
          }
        } catch {}
      }

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
          completado_en: nowIso
        });

      if (error) {
        console.warn('[EvaluacionesService] Error guardando en Supabase evaluaciones_conocimientos:', error.message);
        return false;
      }
      console.log('✓ [EvaluacionesService] Respuestas de Conocimientos guardadas con éxito en Supabase:', payload.tema, 'para proceso:', safeProcId);

      // Actualizar estado del candidato en el proceso correspondiente
      if (safeCandId && !safeCandId.startsWith('cand_')) {
        await this.actualizarEstadoCandidatoTrasPrueba(safeCandId, safeProcId, payload.email);
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando conocimientos en Supabase:', err);
      return false;
    }
  },

  /**
   * Guarda el resultado y las respuestas de la prueba DISC en Supabase y LocalStorage
   * Vinculado estrictamente al proceso correspondiente.
   */
  async guardarResultadoDISC(payload: DISCResultadoPayload): Promise<boolean> {
    const nowIso = new Date().toISOString();

    // 1. Guardar siempre en LocalStorage como respaldo infalible
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISC) || '[]');
      stored.push({
        ...payload,
        completadoEn: nowIso
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_DISC, JSON.stringify(stored));
    } catch (e) {
      console.warn('[EvaluacionesService] Error guardando respaldo local de DISC:', e);
    }

    // 2. Guardar en Supabase tabla `evaluaciones_disc`
    try {
      let safeCandId = payload.candidatoId || 'cand_invitado';
      const safeProcId = payload.procesoId || 'proc_invitado';

      // Resolver candidate_id específico para este proceso si tenemos email o procesoId
      if (safeProcId && /^[0-9a-f-]{36}$/i.test(safeProcId)) {
        try {
          const { data: candMatch } = await supabase
            .from('candidatos')
            .select('id')
            .eq('proceso_id', safeProcId)
            .or(`id.eq.${safeCandId}${payload.email ? `,correo.ilike.${payload.email.trim().toLowerCase()}` : ''}`)
            .limit(1)
            .maybeSingle();

          if (candMatch?.id) {
            safeCandId = candMatch.id;
          }
        } catch {}
      }

      const { error } = await supabase
        .from('evaluaciones_disc')
        .insert({
          candidato_id: safeCandId,
          proceso_id: safeProcId,
          respuestas: payload.respuestas,
          conteo_d: payload.conteoD,
          conteo_i: payload.conteoI,
          conteo_s: payload.conteoS,
          conteo_c: payload.conteoC,
          perfil_dominante: payload.perfilDominante,
          completado_en: nowIso
        });

      if (error) {
        console.warn('[EvaluacionesService] Error guardando en Supabase evaluaciones_disc:', error.message);
        return false;
      }
      console.log('✓ [EvaluacionesService] Respuestas de DISC guardadas con éxito en Supabase para proceso:', safeProcId);

      // Actualizar estado del candidato en el proceso correspondiente
      if (safeCandId && !safeCandId.startsWith('cand_')) {
        await this.actualizarEstadoCandidatoTrasPrueba(safeCandId, safeProcId, payload.email);
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando DISC en Supabase:', err);
      return false;
    }
  },

  /**
   * Registra una marca de reinicio en localStorage para un candidato
   */
  recordActiveReset(candidatoId?: string, email?: string, segment: string = 'ALL', dateStr?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const nowIso = dateStr || new Date().toISOString();
      const raw = localStorage.getItem('evaluar_active_resets');
      const resets = raw ? JSON.parse(raw) : {};
      const keys = [candidatoId, email ? email.toLowerCase().trim() : null].filter(Boolean) as string[];
      for (const k of keys) {
        resets[k] = {
          ...(resets[k] || {}),
          [segment]: nowIso,
          resetAt: nowIso
        };
      }
      localStorage.setItem('evaluar_active_resets', JSON.stringify(resets));
    } catch {}
  },

  /**
   * Resuelve de forma asíncrona y sincronizada el timestamp de reinicio para un candidato y segmento/sub-evaluación.
   * Consulta localStorage y notificaciones/candidatos en Supabase para sincronización multi-dispositivo.
   */
  async resolveActiveResetTimestamp(
    candidatoId?: string, 
    email?: string, 
    segment?: string
  ): Promise<number | null> {
    // 1. Verificación rápida local
    const localTs = this.getActiveResetTimestamp(candidatoId, email, segment);
    if (localTs) return localTs;

    // 2. Verificación en base de datos Supabase
    try {
      if (candidatoId && !candidatoId.startsWith('cand_')) {
        const { data: notifs } = await supabase
          .from('notificaciones')
          .select('titulo, creado_en, mensaje')
          .eq('candidato_id', candidatoId)
          .eq('tipo', 'SISTEMA')
          .order('creado_en', { ascending: false })
          .limit(15);

        if (notifs && notifs.length > 0) {
          const segNorm = segment ? segment.toUpperCase() : '';
          const segAlt = segment ? segment.replace(':', '_').toUpperCase() : '';

          for (const n of notifs) {
            const tit = String(n.titulo || '').toUpperCase();
            let isMatch = tit === 'RESET_ALL';

            if (!isMatch && segment) {
              if (tit === `RESET_${segNorm}` || tit === `RESET_${segAlt}`) {
                isMatch = true;
              } else if (n.mensaje) {
                try {
                  const parsed = JSON.parse(n.mensaje);
                  if (parsed.segment && String(parsed.segment).toUpperCase() === segNorm) {
                    isMatch = true;
                  }
                } catch {}
              }
            }

            if (isMatch) {
              const ts = new Date(n.creado_en).getTime();
              this.recordActiveReset(candidatoId, email, segment || 'ALL', n.creado_en);
              return ts;
            }
          }
        }

        // Consultar candidato: si está en INVITADO o EN_CURSO con actualizado_en reciente
        const { data: cand } = await supabase
          .from('candidatos')
          .select('estado, actualizado_en, completado_en')
          .eq('id', candidatoId)
          .maybeSingle();

        if (cand?.estado === 'INVITADO' && cand.actualizado_en) {
          const ts = new Date(cand.actualizado_en).getTime();
          this.recordActiveReset(candidatoId, email, 'ALL', cand.actualizado_en);
          return ts;
        }
      }
    } catch {}

    return null;
  },

  /**
   * Determina si existe una orden de reinicio activa para el candidato y segmento/sub-evaluación.
   * Retorna el timestamp (ms) del reinicio si existe, o null.
   */
  getActiveResetTimestamp(
    candidatoId?: string, 
    email?: string, 
    segment?: string
  ): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('evaluar_active_resets');
      if (!raw) return null;
      const resets = JSON.parse(raw);
      const keys = [candidatoId, email ? email.toLowerCase().trim() : null].filter(Boolean) as string[];
      for (const k of keys) {
        const item = resets[k];
        if (item) {
          if (segment) {
            if (item[segment]) {
              return new Date(item[segment]).getTime();
            }
            // Búsqueda flexible para subevaluaciones tipo COMP: o KNOW:
            const segClean = segment.trim().toLowerCase();
            for (const key of Object.keys(item)) {
              if (key.trim().toLowerCase() === segClean) {
                return new Date(item[key]).getTime();
              }
            }
          }
          if (item.ALL) {
            return new Date(item.ALL).getTime();
          }
          if (item.resetAt) {
            return new Date(item.resetAt).getTime();
          }
        }
      }
    } catch {}
    return null;
  },

  /**
   * Obtiene el historial completo de todas las pruebas de conocimientos rendidas por un candidato (incluyendo intentos previos)
   * Filtrado estrictamente por proceso cuando se proporciona procesoId.
   */
  async obtenerHistorialConocimientos(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    let supabaseReachable = false;
    try {
      // 1. Si tenemos procesoId, aislar estrictamente por proceso
      if (procesoId) {
        let query = supabase.from('evaluaciones_conocimientos').select('*').eq('proceso_id', procesoId);
        if (candidatoId && !candidatoId.startsWith('cand_')) {
          query = query.eq('candidato_id', candidatoId);
        } else if (email) {
          const { data: candInProc } = await supabase.from('candidatos').select('id').eq('proceso_id', procesoId).ilike('correo', email);
          const pIds = (candInProc || []).map((c: any) => c.id);
          if (pIds.length > 0) {
            query = query.in('candidato_id', pIds);
          } else {
            return [];
          }
        }
        const { data, error } = await query.order('completado_en', { ascending: false });
        if (!error) {
          supabaseReachable = true;
          const filtered = (data || []).filter((r: any) => !String(r.tema || '').match(/^COMPETENCIA:/i));
          return filtered;
        }
      } else if (candidatoId) {
        // Fallback cuando no hay procesoId
        let query = supabase.from('evaluaciones_conocimientos').select('*').eq('candidato_id', candidatoId);
        const { data, error } = await query.order('completado_en', { ascending: false });
        if (!error) {
          supabaseReachable = true;
          const filtered = (data || []).filter((r: any) => !String(r.tema || '').match(/^COMPETENCIA:/i));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando Supabase:', err);
    }

    if (supabaseReachable) return [];

    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONOCIMIENTOS) || '[]');
      return stored.filter((item: any) => {
        if (procesoId && item.procesoId !== procesoId) return false;
        return (candidatoId && item.candidatoId === candidatoId) ||
               (email && item.email && item.email.toLowerCase() === email.toLowerCase());
      });
    } catch {
      return [];
    }
  },

  /**
   * Obtiene los resultados de conocimientos completados por un candidato para la oportunidad actual.
   * Si existe un reinicio activo global o de un cuestionario específico, solo devuelve los rendidos después del reinicio.
   */
  async obtenerResultadosConocimientos(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    const all = await this.obtenerHistorialConocimientos(candidatoId, procesoId, email);
    const globalResetTs = await this.resolveActiveResetTimestamp(candidatoId, email, 'CONOCIMIENTOS');

    return all.filter((item: any) => {
      const cDate = item.completado_en || item.completadoEn;
      if (!cDate) return false;
      const itemTs = new Date(cDate).getTime();

      // 1. Verificar si hay reinicio general de conocimientos
      if (globalResetTs && itemTs <= globalResetTs) {
        return false;
      }

      // 2. Verificar si hay reinicio específico para este cuestionario/tema
      const topicName = (item.tema || '').trim();
      if (topicName) {
        const specificResetTs = this.getActiveResetTimestamp(candidatoId, email, `KNOW:${topicName}`);
        if (specificResetTs && itemTs <= specificResetTs) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Obtiene el historial completo de DISC (incluyendo intentos previos)
   * Filtrado estrictamente por proceso cuando se proporciona procesoId.
   */
  async obtenerHistorialDISC(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    let supabaseReachable = false;
    try {
      // 1. Si tenemos procesoId, aislar estrictamente por proceso
      if (procesoId) {
        let query = supabase.from('evaluaciones_disc').select('*').eq('proceso_id', procesoId);
        if (candidatoId && !candidatoId.startsWith('cand_')) {
          query = query.eq('candidato_id', candidatoId);
        } else if (email) {
          const { data: candInProc } = await supabase.from('candidatos').select('id').eq('proceso_id', procesoId).ilike('correo', email);
          const pIds = (candInProc || []).map((c: any) => c.id);
          if (pIds.length > 0) {
            query = query.in('candidato_id', pIds);
          } else {
            return [];
          }
        }
        const { data, error } = await query.order('completado_en', { ascending: false });
        if (!error && data) {
          return data;
        }
      } else if (candidatoId) {
        // Fallback cuando no hay procesoId
        let query = supabase.from('evaluaciones_disc').select('*').eq('candidato_id', candidatoId);
        const { data, error } = await query.order('completado_en', { ascending: false });
        if (!error && data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando DISC en Supabase:', err);
    }

    if (supabaseReachable) return [];

    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISC) || '[]');
      return stored.filter((item: any) => {
        if (procesoId && item.procesoId !== procesoId) return false;
        return (candidatoId && item.candidatoId === candidatoId) ||
               (email && item.email && item.email.toLowerCase() === email.toLowerCase());
      });
    } catch {
      return [];
    }
  },

  /**
   * Obtiene el resultado DISC activo de un candidato para la oportunidad actual.
   * Si existe un reinicio activo de DISC, devuelve null para que el postulante rinda de nuevo.
   */
  async obtenerResultadoDISC(candidatoId: string, procesoId?: string, email?: string): Promise<any | null> {
    const list = await this.obtenerHistorialDISC(candidatoId, procesoId, email);
    if (!list || list.length === 0) return null;

    const latest = list[0];
    const resetTs = await this.resolveActiveResetTimestamp(candidatoId, email, 'DISC');
    if (!resetTs) return latest;

    const cDate = latest.completado_en || latest.completadoEn;
    if (!cDate || new Date(cDate).getTime() <= resetTs) {
      return null; // Oportunidad activa pendiente
    }

    return latest;
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
      let safeCandId = payload.candidatoId || 'cand_oficial';
      const safeProcId = payload.procesoId || 'proc_oficial';

      if (safeProcId && /^[0-9a-f-]{36}$/i.test(safeProcId)) {
        try {
          const { data: candMatch } = await supabase
            .from('candidatos')
            .select('id')
            .eq('proceso_id', safeProcId)
            .or(`id.eq.${safeCandId}${payload.email ? `,correo.ilike.${payload.email.trim().toLowerCase()}` : ''}`)
            .limit(1)
            .maybeSingle();

          if (candMatch?.id) {
            safeCandId = candMatch.id;
          }
        } catch {}
      }

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
        console.log('✓ [EvaluacionesService] Guardado exitoso en tabla oficial evaluaciones_competencias:', cleanCompName, 'para proceso:', safeProcId);
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

      // Actualizar estado del candidato en el proceso correspondiente
      if (safeCandId && !safeCandId.startsWith('cand_') && safeCandId !== 'cand-fallback') {
        await this.actualizarEstadoCandidatoTrasPrueba(safeCandId, safeProcId, payload.email);
      }

      return true;
    } catch (err) {
      console.warn('[EvaluacionesService] Excepción guardando competencia:', err);
      return true;
    }
  },

  /**
   * Obtiene el historial completo de todas las pruebas de competencias rendidas (incluyendo intentos previos)
   * Filtrado estrictamente por proceso cuando se proporciona procesoId.
   */
  async obtenerHistorialCompetencias(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    const allList: any[] = [];
    let supabaseReachable = false;

    // 1. Consultar tabla oficial `evaluaciones_competencias` en Supabase
    try {
      let query = supabase
        .from('evaluaciones_competencias')
        .select('*');

      if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      }
      if (candidatoId && !candidatoId.startsWith('cand_')) {
        query = query.eq('candidato_id', candidatoId);
      } else if (email && procesoId) {
        const { data: candInProc } = await supabase.from('candidatos').select('id').eq('proceso_id', procesoId).ilike('correo', email);
        const pIds = (candInProc || []).map((c: any) => c.id);
        if (pIds.length > 0) {
          query = query.in('candidato_id', pIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('completado_en', { ascending: false });
      if (!error) {
        supabaseReachable = true;
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const rawName = (item.competencia || '').trim();
            if (rawName) {
              allList.push({
                id: item.id,
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
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando evaluaciones_competencias en Supabase:', err);
    }

    // 2. Fallback a evaluaciones_conocimientos para compatibilidad histórica (estrictamente por procesoId)
    try {
      let query = supabase
        .from('evaluaciones_conocimientos')
        .select('*')
        .ilike('tema', 'COMPETENCIA:%');

      if (procesoId) {
        query = query.eq('proceso_id', procesoId);
      }
      if (candidatoId && !candidatoId.startsWith('cand_')) {
        query = query.eq('candidato_id', candidatoId);
      }

      const { data, error } = await query.order('completado_en', { ascending: false });
      if (!error) {
        supabaseReachable = true;
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const rawName = item.tema.replace(/^COMPETENCIA:\s*/i, '').trim();
            if (rawName && !allList.some(a => a.competencia.toLowerCase() === rawName.toLowerCase())) {
              allList.push({
                id: item.id,
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
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error consultando competencias en Supabase:', err);
    }

    // 3. Fallback a LocalStorage solo si Supabase no estuvo disponible
    if (!supabaseReachable) {
      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_COMPETENCIAS) || '[]');
        stored.forEach((item: any) => {
          if (procesoId && item.procesoId !== procesoId) return;
          const matchCand = !candidatoId || item.candidatoId === candidatoId;
          const matchMail = !email || (item.email && item.email.toLowerCase() === email.toLowerCase());

          if ((matchCand || matchMail) && item.competencia) {
            allList.push({
              competencia: item.competencia,
              puntaje: item.puntaje,
              puntajeMaximo: item.puntajeMaximo || 20,
              nivel: item.nivel,
              completadoEn: item.completadoEn,
              tiempoSegundos: item.tiempoSegundos
            });
          }
        });
      } catch {}
    }

    // Ordenar por fecha descendente
    allList.sort((a, b) => {
      const ta = a.completadoEn ? new Date(a.completadoEn).getTime() : 0;
      const tb = b.completadoEn ? new Date(b.completadoEn).getTime() : 0;
      return tb - ta;
    });

    return allList;
  },

  /**
   * Obtiene los resultados de competencias completadas por un candidato para la oportunidad actual.
   * Si la prueba fue reiniciada globalmente o por competencia individual, solo se consideran como completadas
   * las rendidas con posterioridad a la fecha del reinicio; los intentos previos se mantienen archivados en el histórico.
   */
  async obtenerResultadosCompetencias(candidatoId: string, procesoId?: string, email?: string): Promise<any[]> {
    const all = await this.obtenerHistorialCompetencias(candidatoId, procesoId, email);
    const globalResetTs = await this.resolveActiveResetTimestamp(candidatoId, email, 'COMPETENCIAS');

    // Filtrar: si hay reinicio activo global o individual, solo las completadas DESPUÉS del reinicio
    const activeList = all.filter((item: any) => {
      const cDate = item.completadoEn || item.completado_en;
      if (!cDate) return false;
      const itemTs = new Date(cDate).getTime();

      // 1. Verificar si hay reinicio general de competencias
      if (globalResetTs && itemTs <= globalResetTs) {
        return false;
      }

      // 2. Verificar si hay reinicio específico para esta competencia individual
      const compName = (item.competencia || '').trim();
      if (compName) {
        const specificResetTs = this.getActiveResetTimestamp(candidatoId, email, `COMP:${compName}`);
        if (specificResetTs && itemTs <= specificResetTs) {
          return false;
        }
      }

      return true;
    });

    // Mapear por nombre único de competencia para la oportunidad actual
    const resultsMap = new Map<string, any>();
    activeList.forEach((item: any) => {
      const rawName = (item.competencia || '').trim();
      if (rawName && !resultsMap.has(rawName.toLowerCase())) {
        resultsMap.set(rawName.toLowerCase(), item);
      }
    });

    return Array.from(resultsMap.values());
  },

  /**
   * Verifica si el candidato ha completado TODAS las pruebas requeridas para el proceso.
   * Si las completó todas: marca el estado como 'EVALUADO' y completado_en = now().
   * Si solo resolvió una o tiene pendientes: marca el estado como 'EN_CURSO' y completado_en = null.
   */
  async actualizarEstadoCandidatoTrasPrueba(candidatoId: string, procesoId?: string, email?: string): Promise<'EVALUADO' | 'EN_CURSO'> {
    if (!candidatoId || candidatoId.startsWith('cand_') || candidatoId === 'cand-fallback') {
      return 'EN_CURSO';
    }

    try {
      // 1. Obtener fila del candidato para saber su proceso y correo si no se enviaron
      let procId = procesoId;
      let candEmail = email;
      if (!procId || procId === 'proc_default' || !candEmail) {
        const { data: candRow } = await supabase
          .from('candidatos')
          .select('proceso_id, correo')
          .eq('id', candidatoId)
          .maybeSingle();
        procId = candRow?.proceso_id || procId;
        candEmail = candEmail || candRow?.correo;
      }

      const safeProcId = procId;

      if (!safeProcId || safeProcId === 'proc_default') {
        await supabase
          .from('candidatos')
          .update({
            estado: 'EN_CURSO',
            iniciado_en: new Date().toISOString(),
            completado_en: null,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', candidatoId);
        return 'EN_CURSO';
      }

      // 2. Obtener configuración del proceso y su perfil
      const { data: proc } = await supabase
        .from('procesos_evaluacion')
        .select('*, perfiles_puesto(*)')
        .eq('id', safeProcId)
        .maybeSingle();

      const perfil = proc?.perfiles_puesto;
      const meta = perfil?.competencias?._metadata || {};
      const stages: any[] = Array.isArray(meta.stages) ? meta.stages : (Array.isArray(proc?.etapas) ? proc.etapas : []);
      const hasCustomStages = stages.length > 0;

      // 2.1 Requerimiento DISC
      const hasDisc = hasCustomStages
        ? stages.some(s => s.isEnabled !== false && (s.id === 'STAGE_DISC' || s.id === 'STAGE_2_EMOTIONAL' || s.category === 'EMOTIONAL' || String(s.name || '').toLowerCase().includes('disc')))
        : true;

      // 2.2 Requerimiento Conocimientos
      let rawKnowledgeList: string[] = [];
      if (Array.isArray(meta.knowledgeQuestionnaires) && meta.knowledgeQuestionnaires.length > 0) {
        rawKnowledgeList = meta.knowledgeQuestionnaires;
      } else if (Array.isArray(meta.knowledgeItems) && meta.knowledgeItems.length > 0) {
        rawKnowledgeList = meta.knowledgeItems.map((k: any) => typeof k === 'string' ? k : k.name).filter(Boolean);
      } else if (hasCustomStages) {
        const knowStage = stages.find(s => s.isEnabled !== false && (s.id === 'STAGE_CONOCIMIENTOS' || s.category === 'PSYCHOLOGICAL'));
        if (knowStage?.description && knowStage.description.includes('Cuestionarios: ')) {
          rawKnowledgeList = knowStage.description
            .replace('Cuestionarios: ', '')
            .split(',')
            .map((x: string) => x.trim())
            .filter(Boolean);
        }
      }

      // 2.3 Requerimiento Competencias
      let compList: string[] = [];
      if (Array.isArray(meta.selectedList) && meta.selectedList.length > 0) {
        compList = meta.selectedList;
      } else if (perfil?.competencias && typeof perfil.competencias === 'object') {
        compList = Object.keys(perfil.competencias).filter(k => !k.startsWith('_'));
      }

      // 3. Consultar pruebas activas del candidato pertenecientes a la oportunidad actual (filtrando históricos)
      const [discRes, activeKnowList, activeCompList] = await Promise.all([
        this.obtenerResultadoDISC(candidatoId, safeProcId, candEmail),
        this.obtenerResultadosConocimientos(candidatoId, safeProcId, candEmail),
        this.obtenerResultadosCompetencias(candidatoId, safeProcId, candEmail)
      ]);

      const discDone = !hasDisc || Boolean(discRes);
      
      const completedKnowledgeTopics = (activeKnowList || []).map((k: any) => (k.tema || '').toLowerCase().trim());
      const knowDone = rawKnowledgeList.length === 0 || rawKnowledgeList.every(kReq => {
        const kClean = kReq.toLowerCase().trim();
        return completedKnowledgeTopics.some(done => done.includes(kClean) || kClean.includes(done));
      });

      const completedCompNames = (activeCompList || []).map((c: any) => (c.competencia || '').toLowerCase().trim());
      const compDone = compList.length === 0 || compList.every(cReq => {
        const cClean = cReq.toLowerCase().trim();
        return completedCompNames.some(done => done === cClean || done.includes(cClean) || cClean.includes(done));
      });

      // Total de requerimientos evaluados
      const allCompleted = discDone && knowDone && compDone;
      const anyActiveCompleted = Boolean(discRes) || (activeKnowList && activeKnowList.length > 0) || (activeCompList && activeCompList.length > 0);

      if (allCompleted) {
        await supabase
          .from('candidatos')
          .update({
            estado: 'EVALUADO',
            completado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
          })
          .eq('id', candidatoId);
        return 'EVALUADO';
      } else if (anyActiveCompleted) {
        // Tiene al menos una prueba completada que no fue reiniciada (en progreso)
        await supabase
          .from('candidatos')
          .update({
            estado: 'EN_CURSO',
            completado_en: null,
            iniciado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
          })
          .eq('id', candidatoId);
        return 'EN_CURSO';
      } else {
        // Todas las pruebas fueron reiniciadas o ninguna ha sido rendida aún -> Sin Iniciar / INVITADO
        await supabase
          .from('candidatos')
          .update({
            estado: 'INVITADO',
            completado_en: null,
            iniciado_en: null,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', candidatoId);

        // Limpiar nota de notas_candidato para no arrastrar puntajes históricos
        try {
          await supabase
            .from('notas_candidato')
            .update({ puntaje: null, notas: null })
            .eq('candidato_id', candidatoId);
        } catch {}

        return 'INVITADO' as any;
      }
    } catch (err) {
      console.warn('[EvaluacionesService] Error en actualizarEstadoCandidatoTrasPrueba:', err);
      return 'EN_CURSO';
    }
  }
};

