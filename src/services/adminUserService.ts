import { supabase } from './supabaseClient';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'ANALISTA_RECLT' | 'RECLUTADOR';

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  password?: string;
  full_name: string;
  role: AdminRole;
  position: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminUserPayload {
  full_name: string;
  email: string;
  username: string;
  password?: string;
  role: AdminRole;
  position: string;
  is_active?: boolean;
}

export interface UpdateAdminUserPayload {
  full_name?: string;
  email?: string;
  username?: string;
  role?: AdminRole;
  position?: string;
  is_active?: boolean;
}

export const AdminUserService = {
  /**
   * Obtiene la lista completa de usuarios administrativos de Supabase
   */
  async listUsers(): Promise<AdminUserRecord[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminUserService] Error al listar usuarios:', error.message);
        throw new Error(error.message);
      }

      return (data || []) as AdminUserRecord[];
    } catch (err: any) {
      console.warn('[AdminUserService] Excepción en listUsers:', err);
      throw err;
    }
  },

  /**
   * Crea un nuevo usuario administrativo en la tabla `usuarios_admin`
   */
  async createUser(payload: CreateAdminUserPayload): Promise<AdminUserRecord> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanUsername = (payload.username || cleanEmail.split('@')[0]).trim().toLowerCase();
    const cleanFullName = payload.full_name.trim();
    const cleanPosition = (payload.position || 'Especialista de Selección').trim();
    const password = payload.password?.trim() || 'Gea2026!';

    const insertData = {
      full_name: cleanFullName,
      email: cleanEmail,
      username: cleanUsername,
      password,
      role: payload.role,
      position: cleanPosition,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('usuarios_admin')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[AdminUserService] Error creando usuario:', error.message);
      throw new Error(error.message);
    }

    return data as AdminUserRecord;
  },

  /**
   * Actualiza información de un usuario administrativo
   */
  async updateUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserRecord> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (payload.full_name !== undefined) updateData.full_name = payload.full_name.trim();
    if (payload.email !== undefined) updateData.email = payload.email.trim().toLowerCase();
    if (payload.username !== undefined) updateData.username = payload.username.trim().toLowerCase();
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.position !== undefined) updateData.position = payload.position.trim();
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

    const { data, error } = await supabase
      .from('usuarios_admin')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[AdminUserService] Error actualizando usuario:', error.message);
      throw new Error(error.message);
    }

    return data as AdminUserRecord;
  },

  /**
   * Cambia el estado activo / inactivo de un usuario
   */
  async toggleActive(id: string, is_active: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('usuarios_admin')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[AdminUserService] Error cambiando estado activo:', error.message);
      throw new Error(error.message);
    }

    return true;
  },

  /**
   * Restablece / recupera la contraseña de un usuario
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const cleanPassword = newPassword.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const { error } = await supabase
      .from('usuarios_admin')
      .update({
        password: cleanPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[AdminUserService] Error actualizando contraseña:', error.message);
      throw new Error(error.message);
    }

    return true;
  },

  /**
   * Elimina un usuario de la tabla `usuarios_admin`
   */
  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('usuarios_admin')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[AdminUserService] Error eliminando usuario:', error.message);
      throw new Error(error.message);
    }

    return true;
  }
};
