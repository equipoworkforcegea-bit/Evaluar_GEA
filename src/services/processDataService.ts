import { supabase } from './supabaseClient';
import { EvaluationTest, TestStageConfig } from '../types';
import { INITIAL_EVALUATION_TESTS } from '../data/testTemplates';

// Helper para validar o generar UUID v4 de forma segura (sin fallar en contextos HTTP sin crypto.randomUUID)
export function generateSafeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return generateSafeUuid();
}

// Mapeo de fila Supabase `procesos_evaluacion` a `EvaluationTest`
function mapRowToProcess(row: any): EvaluationTest {
  return {
    id: row.id,
    code: row.codigo || 'PROC-GEA',
    title: row.titulo || 'Proceso de Selección',
    targetPosition: row.puesto_objetivo || 'Asesor Operativo',
    profileName: row.perfiles_puesto?.titulo || row.puesto_objetivo || 'Perfil General',
    description: row.descripcion || '',
    instructions: row.instrucciones || 'Examen de evaluación psicométrica y situacional.',
    totalDurationMinutes: row.duracion_total_minutos || 45,
    difficultyLevel: row.nivel_dificultad || 'MEDIO',
    processStatus: (row.estado as any) || 'LANZADO',
    isActive: row.activo !== false,
    startDate: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : 'Hoy',
    endDate: row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-PE') : '31/12/2026',
    launchedBy: 'Tania León (Selección)',
    createdAt: row.creado_en || new Date().toISOString(),
    updatedAt: row.actualizado_en || new Date().toISOString(),
    candidateCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    hiredCount: 0,
    averageScore: 0,
    selectedCompetencies: [
      'Orientación a Resultados & Eficiencia',
      'Autorregulación Emocional bajo Presión',
      'Toma de Decisiones en Contingencias'
    ],
    stages: [
      {
        id: 'STAGE_1_PSYCHO',
        category: 'PSYCHOLOGICAL',
        name: 'Etapa 1: Prueba Psicopedagógica & Lógica',
        description: 'Evaluación psicométrica y razonamiento lógico-deductivo',
        durationMinutes: 15,
        questionCount: 8,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'STAGE_2_EMOTIONAL',
        category: 'EMOTIONAL',
        name: 'Etapa 2: Clima y Regulación Emocional',
        description: 'Inteligencia emocional, resiliencia y tolerancia bajo presión',
        durationMinutes: 15,
        questionCount: 8,
        weightPercent: 30,
        isEnabled: true
      },
      {
        id: 'STAGE_3_WORK_CASES',
        category: 'WORK_CASES',
        name: 'Etapa 3: Casos Laborales Simulados',
        description: 'Resolución de situaciones reales, criterio operativo y toma de decisiones',
        durationMinutes: 15,
        questionCount: 4,
        weightPercent: 35,
        isEnabled: true
      }
    ]
  };
}

// Mapeo de fila Supabase `perfiles_puesto` a `EvaluationTest` (catálogo)
function mapRowToProfile(row: any): EvaluationTest {
  const compKeys = row.competencias 
    ? Object.keys(row.competencias).filter(k => !k.startsWith('_')) 
    : [];
  const metadata = row.competencias?._metadata || {};

  return {
    id: row.id,
    code: row.codigo || 'PERF-GEA',
    title: row.titulo || 'Perfil de Puesto',
    targetPosition: row.puesto_objetivo || 'Asesor Operativo',
    profileName: row.titulo,
    description: row.descripcion || '',
    instructions: 'Perfil de puesto y batería psicométrica asociada.',
    totalDurationMinutes: metadata.duration || 45,
    difficultyLevel: metadata.difficulty || 'MEDIO',
    processStatus: row.activo !== false ? 'LANZADO' : 'BORRADOR',
    isActive: row.activo !== false,
    startDate: new Date(row.creado_en || Date.now()).toLocaleDateString('es-PE'),
    endDate: '31/12/2026',
    launchedBy: 'Tania León (Líder)',
    createdAt: row.creado_en || new Date().toISOString(),
    updatedAt: row.actualizado_en || new Date().toISOString(),
    candidateCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    hiredCount: 0,
    averageScore: 0,
    selectedCompetencies: compKeys.length > 0 ? compKeys : [
      'Comunicación Persuasiva',
      'Autorregulación Emocional',
      'Orientación a Resultados'
    ],
    stages: metadata.stages || []
  };
}

export const ProcessDataService = {
  /**
   * Carga todos los procesos desde la tabla `procesos_evaluacion` en Supabase
   */
  async getProcesses(): Promise<EvaluationTest[]> {
    try {
      const { data, error } = await supabase
        .from('procesos_evaluacion')
        .select('*, perfiles_puesto(titulo, puesto_objetivo, competencias)')
        .order('creado_en', { ascending: false });

      let mapped = data && data.length > 0 ? data.map(mapRowToProcess) : INITIAL_EVALUATION_TESTS;

      // Fusionar procesos creados para disponibilidad inmediata
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('evaluar_custom_processes');
          if (raw) {
            const locals: EvaluationTest[] = JSON.parse(raw);
            const combined = [...locals];
            for (const m of mapped) {
              if (!combined.some(c => c.id === m.id)) {
                combined.push(m);
              }
            }
            return combined;
          }
        }
      } catch {}

      return mapped;
    } catch (err) {
      console.warn('[ProcessDataService] Excepción al cargar procesos:', err);
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('evaluar_custom_processes');
          if (raw) {
            const locals: EvaluationTest[] = JSON.parse(raw);
            return [...locals, ...INITIAL_EVALUATION_TESTS];
          }
        }
      } catch {}
      return INITIAL_EVALUATION_TESTS;
    }
  },

  /**
   * Carga todos los perfiles de puesto desde la tabla `perfiles_puesto` en Supabase
   */
  async getProfiles(): Promise<EvaluationTest[]> {
    try {
      const { data, error } = await supabase
        .from('perfiles_puesto')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) {
        console.warn('[ProcessDataService] Error cargando perfiles de Supabase:', error.message);
        return [];
      }

      return (data || []).map(mapRowToProfile);
    } catch (err) {
      console.warn('[ProcessDataService] Excepción al cargar perfiles:', err);
      return [];
    }
  },

  /**
   * Guarda un nuevo perfil en la base de datos Supabase (`perfiles_puesto`)
   */
  async createProfile(profile: EvaluationTest): Promise<EvaluationTest | null> {
    try {
      const uuid = ensureUuid(profile.id);
      
      const compMap: Record<string, any> = {};
      (profile.selectedCompetencies || []).forEach(c => {
        compMap[c] = 85;
      });

      // Guardar etapas, dificultad y duración en _metadata dentro de competencias (jsonb)
      compMap._metadata = {
        difficulty: profile.difficultyLevel || 'MEDIO',
        duration: profile.totalDurationMinutes || 45,
        stages: profile.stages || []
      };

      const targetPosClean = (profile.targetPosition || profile.title || 'GEN')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase() || 'POS';

      let baseCode = profile.code?.trim() || `PRF-${targetPosClean}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      // Comprobar colisión de código con perfiles_puesto existentes
      const { data: existing } = await supabase
        .from('perfiles_puesto')
        .select('id')
        .eq('codigo', baseCode)
        .maybeSingle();

      let finalCode = baseCode;
      if (existing && existing.id !== uuid) {
        finalCode = `${baseCode}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const payload = {
        id: uuid,
        codigo: finalCode,
        titulo: profile.title,
        puesto_objetivo: profile.targetPosition || profile.title,
        descripcion: profile.description || '',
        competencias: compMap,
        activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      let { data, error } = await supabase
        .from('perfiles_puesto')
        .upsert(payload)
        .select()
        .single();

      // Si aún hubo colisión de código único (código 23505), reintentar con sufijo único garantizado
      if (error && (error.code === '23505' || error.message?.includes('codigo'))) {
        payload.codigo = `PRF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const retry = await supabase
          .from('perfiles_puesto')
          .upsert(payload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('[ProcessDataService] Error guardando perfil en Supabase:', error.message);
        return null;
      }

      return mapRowToProfile(data);
    } catch (err) {
      console.error('[ProcessDataService] Excepción al guardar perfil:', err);
      return null;
    }
  },

  /**
   * Actualiza el campo `activo` de un perfil de puesto en Supabase
   */
  async updateProfileActive(profileId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('perfiles_puesto')
        .update({ activo: isActive, actualizado_en: new Date().toISOString() })
        .eq('id', profileId);
      if (error) {
        console.error('[ProcessDataService] Error actualizando activo del perfil:', error.message);
      }
    } catch (err) {
      console.error('[ProcessDataService] Excepción al actualizar activo del perfil:', err);
    }
  },

  /**
   * Guarda un nuevo proceso en la base de datos Supabase (`procesos_evaluacion`)
   */
  /**
   * Actualiza el estado (estado / activo) de un proceso en Supabase
   */
  async updateProcessStatus(
    processId: string,
    newStatus: 'LANZADO' | 'EN_PROCESO' | 'CERRADO' | 'BORRADOR'
  ): Promise<void> {
    try {
      const isActive = newStatus === 'LANZADO' || newStatus === 'EN_PROCESO';
      const { error } = await supabase
        .from('procesos_evaluacion')
        .update({
          estado: newStatus,
          activo: isActive,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', processId);
      if (error) {
        console.error('[ProcessDataService] Error actualizando estado del proceso:', error.message);
      }
    } catch (err) {
      console.error('[ProcessDataService] Excepción al actualizar estado del proceso:', err);
    }
  },

  /**
   * Elimina permanentemente un proceso de Supabase
   */
  async deleteProcess(processId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('procesos_evaluacion')
        .delete()
        .eq('id', processId);
      if (error) {
        console.error('[ProcessDataService] Error eliminando proceso:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[ProcessDataService] Excepción al eliminar proceso:', err);
      return false;
    }
  },

  async createProcess(process: EvaluationTest, profileId?: string): Promise<EvaluationTest | null> {
    const uuid = ensureUuid(process.id);
    try {
      const validProfileId = profileId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
        ? profileId
        : null;

      let payload: any = {
        id: uuid,
        codigo: process.code || `PROC-${Date.now().toString(36).toUpperCase()}`,
        perfil_puesto_id: validProfileId,
        titulo: process.title,
        puesto_objetivo: process.targetPosition || 'Asesor Operativo',
        descripcion: process.description || '',
        instrucciones: process.instructions || '',
        duracion_total_minutos: process.totalDurationMinutes || 45,
        nivel_dificultad: process.difficultyLevel || 'MEDIO',
        estado: process.processStatus || 'LANZADO',
        activo: process.isActive !== false,
        lanzado_por: null,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      if (process.startDate) {
        try {
          const d = new Date(process.startDate);
          if (!isNaN(d.getTime())) payload.fecha_inicio = d.toISOString();
        } catch {}
      }
      if (process.endDate) {
        try {
          const d = new Date(process.endDate);
          if (!isNaN(d.getTime())) payload.fecha_fin = d.toISOString();
        } catch {}
      }

      // Bucle de inserción con tolerancia a esquemas variables y columnas faltantes
      let res: any = null;
      let attempts = 0;
      const maxAttempts = 6;

      while (attempts < maxAttempts) {
        attempts++;
        res = await supabase
          .from('procesos_evaluacion')
          .upsert(payload)
          .select('*')
          .single();

        if (!res.error) {
          break; // Inserción exitosa
        }

        const errMsg = String(res.error.message || '').toLowerCase();
        const errCode = String(res.error.code || '');

        // 1. Error de clave foránea en perfil_puesto_id (23503)
        if (errCode === '23503' || errMsg.includes('foreign key') || errMsg.includes('perfil_puesto_id')) {
          payload.perfil_puesto_id = null;
          continue;
        }

        // 2. Colisión de código único (23505)
        if (errCode === '23505' || errMsg.includes('codigo') || errMsg.includes('unique')) {
          payload.codigo = `PROC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
          continue;
        }

        // 3. Columna inexistente en la tabla de Supabase (42703 o PGRST204)
        if (errCode === '42703' || errCode === 'PGRST204' || errMsg.includes('column') || errMsg.includes('does not exist') || errMsg.includes('schema cache')) {
          const matchCol = res.error.message.match(/column\s+"([^"]+)"/i) ||
                           res.error.message.match(/column\s+'([^']+)'/i) ||
                           res.error.message.match(/Could not find the '([^']+)' column/i);
          if (matchCol && matchCol[1]) {
            const badCol = matchCol[1];
            delete payload[badCol];
            continue;
          }

          // Si no se pudo aislar el nombre exacto, eliminar campos secundarios progresivamente
          if ('fecha_inicio' in payload || 'fecha_fin' in payload) {
            delete payload.fecha_inicio;
            delete payload.fecha_fin;
            continue;
          }
          if ('nivel_dificultad' in payload || 'instrucciones' in payload) {
            delete payload.nivel_dificultad;
            delete payload.instrucciones;
            continue;
          }
          if ('lanzado_por' in payload) {
            delete payload.lanzado_por;
            continue;
          }
          if ('perfil_puesto_id' in payload) {
            delete payload.perfil_puesto_id;
            continue;
          }
        }

        // Otro error no corregible automáticamente
        break;
      }

      // Respaldar permanentemente en almacenamiento local para acceso inmediato
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('evaluar_custom_processes');
          const localList: EvaluationTest[] = raw ? JSON.parse(raw) : [];
          const updated = [{ ...process, id: uuid }, ...localList.filter(p => p.id !== uuid)];
          localStorage.setItem('evaluar_custom_processes', JSON.stringify(updated));
        }
      } catch {}

      if (res && res.error) {
        console.warn('[ProcessDataService] Alerta Supabase al crear proceso (respaldo local activo):', res.error.message);
        return { ...process, id: uuid };
      }

      return res?.data ? mapRowToProcess(res.data) : { ...process, id: uuid };
    } catch (err) {
      console.warn('[ProcessDataService] Excepción capturada en createProcess:', err);
      return { ...process, id: uuid };
    }
  }
};
