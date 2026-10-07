import { supabase } from './supabaseClient';
import { EvaluationTest, TestStageConfig } from '../types';
import { INITIAL_EVALUATION_TESTS } from '../data/testTemplates';

// Helper para validar o generar UUID v4
function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
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

      if (error) {
        console.warn('[ProcessDataService] Error cargando procesos de Supabase:', error.message);
        return INITIAL_EVALUATION_TESTS;
      }

      if (!data || data.length === 0) {
        return INITIAL_EVALUATION_TESTS;
      }

      return data.map(mapRowToProcess);
    } catch (err) {
      console.warn('[ProcessDataService] Excepción al cargar procesos:', err);
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
  async createProcess(process: EvaluationTest, profileId?: string): Promise<EvaluationTest | null> {
    try {
      const uuid = ensureUuid(process.id);
      const validProfileId = profileId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
        ? profileId
        : null;

      const payload = {
        id: uuid,
        codigo: process.code || `PROC-${Date.now().toString(36).toUpperCase()}`,
        perfil_puesto_id: validProfileId,
        titulo: process.title,
        puesto_objetivo: process.targetPosition,
        descripcion: process.description || '',
        instrucciones: process.instructions || '',
        duracion_total_minutos: process.totalDurationMinutes || 45,
        nivel_dificultad: process.difficultyLevel || 'MEDIO',
        estado: process.processStatus || 'LANZADO',
        activo: process.isActive !== false,
        lanzado_por: null, // Evita error de clave foránea con usuarios_admin
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('procesos_evaluacion')
        .upsert(payload)
        .select('*, perfiles_puesto(titulo, puesto_objetivo)')
        .single();

      if (error) {
        console.error('[ProcessDataService] Error guardando proceso en Supabase:', error.message);
        return { ...process, id: uuid };
      }

      return mapRowToProcess(data);
    } catch (err) {
      console.error('[ProcessDataService] Excepción al guardar proceso:', err);
      return process;
    }
  }
};
