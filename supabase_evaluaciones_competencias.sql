-- =========================================================================
-- TABLA: evaluaciones_competencias
-- Guarda los resultados psicométricos e ipsativos por competencia evaluada
-- =========================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.evaluaciones_competencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id TEXT NOT NULL,
    proceso_id TEXT NOT NULL,
    competencia TEXT NOT NULL,
    puntaje NUMERIC(5,2) NOT NULL DEFAULT 0,
    puntaje_maximo NUMERIC(5,2) NOT NULL DEFAULT 20,
    nivel TEXT NOT NULL DEFAULT 'Básico',
    total_bloques INT NOT NULL DEFAULT 10,
    respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
    tiempo_segundos INT DEFAULT 0,
    completado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Políticas RLS para lectura y escritura
ALTER TABLE public.evaluaciones_competencias ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Permitir insercion evaluaciones_competencias" ON public.evaluaciones_competencias;
    CREATE POLICY "Permitir insercion evaluaciones_competencias" 
    ON public.evaluaciones_competencias FOR INSERT 
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir lectura evaluaciones_competencias" ON public.evaluaciones_competencias;
    CREATE POLICY "Permitir lectura evaluaciones_competencias" 
    ON public.evaluaciones_competencias FOR SELECT 
    USING (true);

    DROP POLICY IF EXISTS "Permitir actualizacion evaluaciones_competencias" ON public.evaluaciones_competencias;
    CREATE POLICY "Permitir actualizacion evaluaciones_competencias" 
    ON public.evaluaciones_competencias FOR UPDATE 
    USING (true);
END $$;

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_eval_competencias_candidato ON public.evaluaciones_competencias(candidato_id);
CREATE INDEX IF NOT EXISTS idx_eval_competencias_proceso ON public.evaluaciones_competencias(proceso_id);
CREATE INDEX IF NOT EXISTS idx_eval_competencias_competencia ON public.evaluaciones_competencias(competencia);

