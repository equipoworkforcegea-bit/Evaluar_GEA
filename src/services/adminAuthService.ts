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

    try {
      // 1. Consultar en Supabase
      const { data, error } = await supabase
        .from('usuarios_admin')
        .select('*')
        .or(`email.ilike.${cleanId},username.ilike.${cleanId}`)
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
            role: (data.role as 'SUPER_ADMIN' | 'ADMIN') || 'SUPER_ADMIN',
            userId: data.id,
            fullName: data.full_name || 'Bryan • Super Admin',
            email: data.email,
            username: data.username,
            position: data.position || 'Super Administrador & Creador'
          };
        }
      }
    } catch (err) {
      console.warn('[AdminAuthService] Error querying usuarios_admin in Supabase:', err);
    }

    // 2. Respaldo de Creador / Super Admin en caso de que aún no haya corrido el SQL en Supabase
    const isCreatorLogin = 
      cleanId === 'equipoworkforcegea@gmail.com' ||
      cleanId === 'equipoworkforce' ||
      cleanId === 'bryan' ||
      cleanId === 'bryan@geaperu.pe' ||
      cleanId === 'superadmin' ||
      cleanId === 'admin' ||
      cleanId === 'admin@geaperu.pe' ||
      cleanId === 'seleccion@geaperu.pe';

    const isAuthorizedPass = 
      cleanPass === 'gea3953036' || 
      cleanPass === 'admin2026' || 
      cleanPass === 'Gea2026!';

    if (isCreatorLogin && isAuthorizedPass) {
      return {
        role: 'SUPER_ADMIN',
        userId: 'usr-superadmin-bryan',
        fullName: cleanId.includes('equipoworkforce') ? 'Bryan • Super Admin (Workforce GEA)' : 'Bryan • Super Admin (Creador)',
        email: cleanId.includes('@') ? cleanId : 'equipoworkforcegea@gmail.com',
        username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
        position: 'Super Administrador & Creador del Sistema'
      };
    }

    return null;
  }
};
