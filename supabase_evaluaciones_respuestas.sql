-- =========================================================================
-- TABLAS DE EVALUACIONES, RESPUESTAS Y PUNTAJES PARA POSTULANTES (GEA PERÚ)
-- =========================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: evaluaciones_conocimientos
-- Guarda las respuestas individuales, aciertos y puntaje obtenido por tema/cuestionario
CREATE TABLE IF NOT EXISTS public.evaluaciones_conocimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id TEXT NOT NULL,
    proceso_id TEXT NOT NULL,
    tema TEXT NOT NULL,
    dificultad TEXT DEFAULT 'Media',
    puntaje NUMERIC(5,2) NOT NULL DEFAULT 0,
    puntaje_maximo NUMERIC(5,2) NOT NULL DEFAULT 20,
    total_preguntas INT NOT NULL DEFAULT 20,
    aciertos INT NOT NULL DEFAULT 0,
    errores INT NOT NULL DEFAULT 0,
    respuestas JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de { questionId, questionText, selectedAnswer, correctAnswer, isCorrect }
    tiempo_empleado_segundos INT DEFAULT 0,
    completado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: evaluaciones_disc
-- Guarda las respuestas conductuales completas y los patrones D, I, S, C seleccionados
CREATE TABLE IF NOT EXISTS public.evaluaciones_disc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id TEXT NOT NULL,
    proceso_id TEXT NOT NULL,
    respuestas JSONB NOT NULL DEFAULT '{}'::jsonb, -- Objeto con bloques { s1_b1: [...], s1_b2: [...], ... }
    conteo_d INT NOT NULL DEFAULT 0,
    conteo_i INT NOT NULL DEFAULT 0,
    conteo_s INT NOT NULL DEFAULT 0,
    conteo_c INT NOT NULL DEFAULT 0,
    perfil_dominante TEXT DEFAULT 'Equilibrado',
    completado_en TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Asegurar columnas si las tablas ya existían
ALTER TABLE public.evaluaciones_conocimientos ADD COLUMN IF NOT EXISTS respuestas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.evaluaciones_conocimientos ADD COLUMN IF NOT EXISTS tiempo_empleado_segundos INT DEFAULT 0;
ALTER TABLE public.evaluaciones_disc ADD COLUMN IF NOT EXISTS respuestas JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.evaluaciones_disc ADD COLUMN IF NOT EXISTS perfil_dominante TEXT DEFAULT 'Equilibrado';

-- 3. ÍNDICES PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_eval_conocimientos_candidato ON public.evaluaciones_conocimientos(candidato_id);
CREATE INDEX IF NOT EXISTS idx_eval_conocimientos_proceso ON public.evaluaciones_conocimientos(proceso_id);
CREATE INDEX IF NOT EXISTS idx_eval_disc_candidato ON public.evaluaciones_disc(candidato_id);
CREATE INDEX IF NOT EXISTS idx_eval_disc_proceso ON public.evaluaciones_disc(proceso_id);

-- 4. POLÍTICAS RLS PERMISIVAS
ALTER TABLE public.evaluaciones_conocimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones_disc ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Permitir todo en evaluaciones_conocimientos" ON public.evaluaciones_conocimientos;
    CREATE POLICY "Permitir todo en evaluaciones_conocimientos" 
    ON public.evaluaciones_conocimientos 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo en evaluaciones_disc" ON public.evaluaciones_disc;
    CREATE POLICY "Permitir todo en evaluaciones_disc" 
    ON public.evaluaciones_disc 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
END $$;

