-- =========================================================================
-- ESQUEMA COMPLETO Y DEFINITIVO: PLATAFORMA DE EVALUACIÓN GEA (EVALUAR)
-- Base de Datos: https://tipiorfjpdpiozwfhxfd.supabase.co
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE CANDIDATOS / POSTULANTES
CREATE TABLE IF NOT EXISTS public.candidatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT 'Gea2026!',
    phone TEXT,
    whatsapp_user TEXT,
    dni VARCHAR(15) NOT NULL UNIQUE,
    position TEXT NOT NULL DEFAULT 'Asesor de Operaciones',
    invitation_code VARCHAR(30) UNIQUE,
    invited_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) NOT NULL DEFAULT 'INVITED' CHECK (status IN ('INVITED', 'IN_PROGRESS', 'SCORED', 'FINALIST', 'REJECTED')),
    current_stage VARCHAR(30) DEFAULT 'STAGE_1_PSYCHO',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_duration_seconds INT DEFAULT 0,
    scores JSONB DEFAULT '{"overall": 0, "stage1Psycho": 0, "stage2Emotional": 0, "stage3WorkCases": 0, "percentile": 0}'::jsonb,
    detailed_report JSONB,
    audit_event_count INT DEFAULT 0,
    critical_flags INT DEFAULT 0,
    recruiter_notes TEXT,
    is_consent_signed BOOLEAN DEFAULT false,
    consent_signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Asegurar columnas si la tabla ya existía previamente
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'Gea2026!';
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS whatsapp_user TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Asesor de Operaciones';
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS invitation_code VARCHAR(30);
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'INVITED';
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS current_stage VARCHAR(30) DEFAULT 'STAGE_1_PSYCHO';
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS total_duration_seconds INT DEFAULT 0;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{"overall": 0, "stage1Psycho": 0, "stage2Emotional": 0, "stage3WorkCases": 0, "percentile": 0}'::jsonb;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS detailed_report JSONB;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS audit_event_count INT DEFAULT 0;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS critical_flags INT DEFAULT 0;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS recruiter_notes TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS is_consent_signed BOOLEAN DEFAULT false;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS consent_signed_at TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());


-- 2. TABLA DE BANCO DE PREGUNTAS
CREATE TABLE IF NOT EXISTS public.preguntas (
    id VARCHAR(50) PRIMARY KEY,
    stage_id VARCHAR(30) NOT NULL CHECK (stage_id IN ('STAGE_1_PSYCHO', 'STAGE_2_EMOTIONAL', 'STAGE_3_WORK_CASES')),
    order_number INT NOT NULL,
    statement TEXT NOT NULL,
    context TEXT,
    competency TEXT NOT NULL,
    options JSONB NOT NULL, -- Array de [{ id, code, text, weight }]
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE INTENTOS DE EVALUACIÓN
CREATE TABLE IF NOT EXISTS public.intentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    stage_id VARCHAR(30) NOT NULL DEFAULT 'STAGE_1_PSYCHO',
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    stage_started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    stage_expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + interval '15 minutes'),
    is_stage_completed BOOLEAN DEFAULT false,
    is_exam_submitted BOOLEAN DEFAULT false,
    status VARCHAR(30) DEFAULT 'EN_CURSO',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE RESPUESTAS INDIVIDUALES (IDEMPOTENTE Y SINCRONIZADA)
CREATE TABLE IF NOT EXISTS public.respuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.intentos(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    selected_option_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(30) NOT NULL,
    client_confirmed_at TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_intento_pregunta UNIQUE (attempt_id, question_id)
);

-- 5. TABLA DE AUDITORÍA Y TELEMETRÍA DE SEGURIDAD
CREATE TABLE IF NOT EXISTS public.eventos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES public.intentos(id) ON DELETE CASCADE,
    stage_id VARCHAR(30),
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    metadata JSONB
);

-- Compatibilidad de columnas en caso de tablas preexistentes
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS attempt_id UUID;
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS question_id VARCHAR(50);
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS selected_option_id VARCHAR(50);
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS stage_id VARCHAR(30);
ALTER TABLE public.respuestas ADD COLUMN IF NOT EXISTS client_confirmed_at TIMESTAMPTZ;

ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS attempt_id UUID;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS stage_id VARCHAR(30);
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'INFO';
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS metadata JSONB;


-- =========================================================================
-- HABILITACIÓN DE ROW LEVEL SECURITY (RLS) Y POLÍTICAS PERMISIVAS
-- =========================================================================
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_auditoria ENABLE ROW LEVEL SECURITY;

-- 6. TABLA DE USUARIOS ADMINISTRATIVOS (SUPER ADMIN / ADMIN / SELECCIÓN)
CREATE TABLE IF NOT EXISTS public.usuarios_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT 'admin2026',
    full_name TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER')),
    position TEXT DEFAULT 'Creador / Administrador General',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura y escritura desde la aplicación web (anon / authenticated)
DROP POLICY IF EXISTS "candidatos_anon_policy" ON public.candidatos;
CREATE POLICY "candidatos_anon_policy" ON public.candidatos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "preguntas_anon_policy" ON public.preguntas;
CREATE POLICY "preguntas_anon_policy" ON public.preguntas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "intentos_anon_policy" ON public.intentos;
CREATE POLICY "intentos_anon_policy" ON public.intentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "respuestas_anon_policy" ON public.respuestas;
CREATE POLICY "respuestas_anon_policy" ON public.respuestas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auditoria_anon_policy" ON public.eventos_auditoria;
CREATE POLICY "auditoria_anon_policy" ON public.eventos_auditoria FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "usuarios_admin_anon_policy" ON public.usuarios_admin;
CREATE POLICY "usuarios_admin_anon_policy" ON public.usuarios_admin FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- INSERCIÓN DE USUARIO SUPER ADMIN (CREADOR) Y ADMINISTRACIÓN
-- =========================================================================
INSERT INTO public.usuarios_admin (username, email, password, full_name, role, position)
VALUES 
  ('equipoworkforce', 'equipoworkforcegea@gmail.com', 'gea3953036', 'Bryan • Super Admin (Workforce GEA)', 'SUPER_ADMIN', 'Super Administrador & Creador del Sistema'),
  ('bryan', 'bryan@geaperu.pe', 'gea3953036', 'Bryan • Super Admin (Creador)', 'SUPER_ADMIN', 'Super Administrador & Creador del Sistema'),
  ('superadmin', 'admin@geaperu.pe', 'gea3953036', 'Super Administrador GEA', 'SUPER_ADMIN', 'Administrador General del Sistema')
ON CONFLICT (email) DO UPDATE 
SET 
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  position = EXCLUDED.position;

-- =========================================================================
-- LIMPIEZA DE DATOS MOCK DE PRUEBA EN CASO DE HABERLOS INSERTADO ANTERIORMENTE
-- =========================================================================
DELETE FROM public.candidatos 
WHERE dni IN ('72345678', '45678901', '78901234', '12345678', '87654321')
   OR email LIKE '%@geaperu.pe';

-- Notificar éxito
SELECT 'Tablas creadas y Super Admin registrado con éxito (sin postulantes mock)' AS resultado;

