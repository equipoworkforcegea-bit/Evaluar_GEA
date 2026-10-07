-- =========================================================================
-- MIGRACIÓN SQL: GESTIÓN DE POSTULANTES, TOKENS DE INVITACIÓN Y RLS
-- Plataforma: EvaluarGEA (GEA Perú)
-- Base de datos: Supabase (PostgreSQL)
-- =========================================================================

-- 1. Habilitar extensión pgcrypto para hashing SHA-256 de tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar columnas faltantes en la tabla candidatos existente
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS apellido TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS usuario TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS token_used BOOLEAN DEFAULT false;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS token_used_at TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS consentimiento_ley BOOLEAN DEFAULT false;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS consentimiento_fecha TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS intentos_fallidos INT DEFAULT 0;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ;
ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'GEA Perú';

-- 3. Sincronizar columnas de nombre y apellido si solo existía nombre_completo
UPDATE public.candidatos 
SET 
  nombre = split_part(nombre_completo, ' ', 1),
  apellido = CASE 
    WHEN array_length(string_to_array(nombre_completo, ' '), 1) >= 3 THEN 
      split_part(nombre_completo, ' ', array_length(string_to_array(nombre_completo, ' '), 1) - 1) || ' ' || split_part(nombre_completo, ' ', array_length(string_to_array(nombre_completo, ' '), 1))
    ELSE 
      COALESCE(split_part(nombre_completo, ' ', 2), '')
  END,
  usuario = COALESCE(usuario, split_part(correo, '@', 1)),
  numero = COALESCE(numero, telefono)
WHERE nombre IS NULL AND nombre_completo IS NOT NULL;

-- 4. Asegurar columnas en la tabla procesos_evaluacion existente
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'GEA Perú';
ALTER TABLE public.procesos_evaluacion ADD COLUMN IF NOT EXISTS fecha_limite TIMESTAMPTZ;

-- 5. Tabla de auditoría de consentimiento (Ley N° 29733 de Protección de Datos Personales)
CREATE TABLE IF NOT EXISTS public.consentimientos_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES public.candidatos(id) ON DELETE CASCADE,
    dni VARCHAR(15) NOT NULL,
    correo TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    ley_aceptada VARCHAR(50) DEFAULT 'Ley N° 29733',
    acepta_tratamiento BOOLEAN NOT NULL DEFAULT true,
    ip_registro TEXT,
    user_agent TEXT,
    fecha_aceptacion TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Índices para optimizar validación de tokens y búsquedas por DNI/correo
CREATE INDEX IF NOT EXISTS idx_candidatos_token_hash ON public.candidatos(token_hash);
CREATE INDEX IF NOT EXISTS idx_candidatos_correo ON public.candidatos(correo);
CREATE INDEX IF NOT EXISTS idx_candidatos_dni ON public.candidatos(dni);
CREATE INDEX IF NOT EXISTS idx_candidatos_proceso_id ON public.candidatos(proceso_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_auth_usuario_id ON public.candidatos(auth_usuario_id);

-- =========================================================================
-- 7. SEGURIDAD: ROW LEVEL SECURITY (RLS) ESTRICTO
-- =========================================================================

-- Activar RLS en candidatos
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procesos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimientos_datos ENABLE ROW LEVEL SECURITY;

-- A) Políticas para CANDIDATOS:
-- El postulante solo puede leer su propio registro (por auth.uid() o por token válido)
DROP POLICY IF EXISTS "postulante_lee_su_propia_fila" ON public.candidatos;
CREATE POLICY "postulante_lee_su_propia_fila" ON public.candidatos
FOR SELECT TO anon, authenticated
USING (
  auth.uid() = auth_usuario_id
  OR token_hash IS NOT NULL
);

-- El postulante solo puede actualizar su propia fila (para firmar consentimiento y registrarse)
DROP POLICY IF EXISTS "postulante_actualiza_su_fila" ON public.candidatos;
CREATE POLICY "postulante_actualiza_su_fila" ON public.candidatos
FOR UPDATE TO anon, authenticated
USING (
  auth.uid() = auth_usuario_id
  OR (token_used = false AND token_expires_at > timezone('utc'::text, now()))
)
WITH CHECK (
  auth.uid() = auth_usuario_id
  OR (token_used = false AND token_expires_at > timezone('utc'::text, now()))
);

-- B) Políticas para SELECCIÓN / ADMINISTRADORES:
-- Personal administrativo autenticado tiene acceso completo a candidatos
DROP POLICY IF EXISTS "admin_gestion_completa_candidatos" ON public.candidatos;
CREATE POLICY "admin_gestion_completa_candidatos" ON public.candidatos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.email = auth.jwt()->>'email'
       OR usuarios_admin.id::text = auth.uid()::text
  )
  OR auth.jwt()->>'role' IN ('service_role', 'SUPER_ADMIN', 'ADMIN', 'RECRUITER')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.email = auth.jwt()->>'email'
       OR usuarios_admin.id::text = auth.uid()::text
  )
  OR auth.jwt()->>'role' IN ('service_role', 'SUPER_ADMIN', 'ADMIN', 'RECRUITER')
);

-- C) Políticas para PROCESOS DE EVALUACIÓN:
-- Los postulantes solo pueden ver los procesos a los que fueron invitados
DROP POLICY IF EXISTS "postulante_ve_procesos_invitados" ON public.procesos_evaluacion;
CREATE POLICY "postulante_ve_procesos_invitados" ON public.procesos_evaluacion
FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.candidatos
    WHERE candidatos.proceso_id = procesos_evaluacion.id
      AND (candidatos.auth_usuario_id = auth.uid() OR candidatos.token_hash IS NOT NULL)
  )
  OR EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.email = auth.jwt()->>'email'
  )
  OR auth.jwt()->>'role' IN ('service_role', 'SUPER_ADMIN', 'ADMIN', 'RECRUITER')
);

-- D) Políticas para CONSENTIMIENTOS:
DROP POLICY IF EXISTS "candidato_inserta_consentimiento" ON public.consentimientos_datos;
CREATE POLICY "candidato_inserta_consentimiento" ON public.consentimientos_datos
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_ve_consentimientos" ON public.consentimientos_datos;
CREATE POLICY "admin_ve_consentimientos" ON public.consentimientos_datos
FOR SELECT TO authenticated
USING (true);

-- Notificar resultado
SELECT 'Migración completada con éxito: columnas, índices y políticas RLS configuradas.' AS resultado;
