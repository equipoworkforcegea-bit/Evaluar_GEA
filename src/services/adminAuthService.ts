import { supabase } from './supabaseClient';
import { AuthSession } from '../types';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'RECRUITER';
  position: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export const AdminAuthService = {
  /**
   * Autentica un usuario administrativo directamente contra la tabla `usuarios_admin` en Supabase
   */
  async login(identifier: string, passwordInput: string): Promise<AuthSession | null> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // No permitir correo electrónico para inicio de sesión administrativo (únicamente con usuario)
    if (cleanId.includes('@')) {
      return null;
    }

    try {
      // 1. Consultar en Supabase exclusivamente por username
      const { data, error } = await supabase
        .from('usuarios_admin')
        .select('*')
        .ilike('username', cleanId)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        // Validar contraseña
        if (data.password === cleanPass) {
          // Registrar último inicio de sesión
          supabase
            .from('usuarios_admin')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.id)
            .then();

          return {
            role: (data.role as any) || 'SUPER_ADMIN',
            userId: data.id,
            fullName: data.full_name || 'Bryan • Super Admin',
            email: data.email || `${data.username}@geaperu.pe`,
            username: data.username,
            position: data.position || 'Super Administrador & Creador',
            isActive: data.is_active !== false,
            status: data.is_active !== false ? 'ACTIVO' : 'INACTIVO'
          };
        }
      }
    } catch (err) {
      console.warn('[AdminAuthService] Error querying usuarios_admin in Supabase:', err);
    }

    // 2. Respaldo de Creador / Super Admin por nombre de usuario
    const isCreatorLogin = 
      cleanId === 'equipoworkforce' ||
      cleanId === 'bryan' ||
      cleanId === 'bryan.ramos' ||
      cleanId === 'superadmin' ||
      cleanId === 'admin';

    const isAuthorizedPass = 
      cleanPass === 'gea3953036' || 
      cleanPass === 'admin2026' || 
      cleanPass === 'Gea2026!';

    if (isCreatorLogin && isAuthorizedPass) {
      return {
        role: 'SUPER_ADMIN',
        userId: 'usr-superadmin-bryan',
        fullName: cleanId.includes('equipoworkforce') ? 'Bryan • Super Admin (Workforce GEA)' : 'Bryan • Super Admin (Creador)',
        email: `${cleanId}@geaperu.pe`,
        username: cleanId,
        position: 'Super Administrador & Creador del Sistema',
        isActive: true,
        status: 'ACTIVO'
      };
    }

    return null;
  }
};
