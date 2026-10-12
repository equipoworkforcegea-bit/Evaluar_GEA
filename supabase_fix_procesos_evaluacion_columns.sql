-- =========================================================================
-- MIGRACIÓN DE COMPATIBILIDAD TOTAL: TABLA PROCESOS_EVALUACION
-- Asegura todas las columnas necesarias para el lanzamiento de convocatorias
-- Ejecutar en Supabase: SQL Editor -> New Query -> Run
-- =========================================================================

-- Asegurar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurar tabla base si no existiera
CREATE TABLE IF NOT EXISTS public.procesos_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT,
    titulo TEXT NOT NULL,
    puesto_objetivo TEXT DEFAULT 'Asesor Operativo',
    perfil_puesto_id UUID,
    descripcion TEXT,
    instrucciones TEXT,
    duracion_total_minutos INT DEFAULT 45,
    nivel_dificultad TEXT DEFAULT 'MEDIO',
    estado VARCHAR(30) DEFAULT 'LANZADO',
    activo BOOLEAN DEFAULT true,
    lanzado_por TEXT,
    fecha_inicio TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    fecha_fin TIMESTAMPTZ,
    fecha_limite TIMESTAMPTZ,
    empresa TEXT DEFAULT 'GEA Perú',
    creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Asegurar cada columna individualmente para esquemas preexistentes
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS puesto_objetivo TEXT DEFAULT 'Asesor Operativo';
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS perfil_puesto_id UUID;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS instrucciones TEXT;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS duracion_total_minutos INT DEFAULT 45;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS nivel_dificultad TEXT DEFAULT 'MEDIO';
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS estado VARCHAR(30) DEFAULT 'LANZADO';
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS lanzado_por TEXT;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS fecha_limite TIMESTAMPTZ;
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'GEA Perú';
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Asegurar políticas RLS permisivas para inserción y lectura
ALTER TABLE public.procesos_evaluacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "procesos_lectura_publica" ON public.procesos_evaluacion;
CREATE POLICY "procesos_lectura_publica" ON public.procesos_evaluacion
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "procesos_insercion_publica" ON public.procesos_evaluacion;
CREATE POLICY "procesos_insercion_publica" ON public.procesos_evaluacion
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "procesos_actualizacion_publica" ON public.procesos_evaluacion;
CREATE POLICY "procesos_actualizacion_publica" ON public.procesos_evaluacion
    FOR UPDATE TO public USING (true) WITH CHECK (true);
