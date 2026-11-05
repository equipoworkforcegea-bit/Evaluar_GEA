import { supabase } from './supabaseClient';

export interface Notificacion {
  id: string;
  tipo: 'CANDIDATO_INGRESO' | 'CANDIDATO_COMPLETO' | 'CANDIDATO_ETAPA' | 'CANDIDATO_REGISTRADO' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  candidato_id?: string;
  proceso_id?: string;
  leido: boolean;
  creado_en: string;
}

export const NotificacionesService = {
  /**
   * Crea una nueva notificación en Supabase
   */
  async crearNotificacion(payload: {
    tipo: 'CANDIDATO_INGRESO' | 'CANDIDATO_COMPLETO' | 'CANDIDATO_ETAPA' | 'CANDIDATO_REGISTRADO' | 'SISTEMA';
    titulo: string;
    mensaje: string;
    candidato_id?: string;
    proceso_id?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from('notificaciones').insert({
        tipo: payload.tipo,
        titulo: payload.titulo,
        mensaje: payload.mensaje,
        candidato_id: payload.candidato_id,
        proceso_id: payload.proceso_id,
        leido: false,
        creado_en: new Date().toISOString()
      });
      if (error) {
        console.warn('[NotificacionesService] Error al insertar notificación:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[NotificacionesService] Excepción al crear notificación:', err);
      return false;
    }
  },

  /**
   * Obtiene las últimas notificaciones (máximo 50)
   */
  async getNotificaciones(limit = 50): Promise<Notificacion[]> {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Notificacion[];
    } catch (err) {
      console.warn('[NotificacionesService] Error al obtener notificaciones:', err);
      return [];
    }
  },

  /**
   * Cuenta las notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('leido', false);

      if (error) throw error;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('id', id);
    } catch (err) {
      console.warn('[NotificacionesService] Error al marcar como leída:', err);
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    try {
      await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('leido', false);
    } catch (err) {
      console.warn('[NotificacionesService] Error al marcar todas como leídas:', err);
    }
  },

  /**
   * Elimina una notificación
   */
  async deleteNotificacion(id: string): Promise<void> {
    try {
      await supabase.from('notificaciones').delete().eq('id', id);
    } catch (err) {
      console.warn('[NotificacionesService] Error al eliminar notificación:', err);
    }
  },

  /**
   * Suscripción Realtime — llama al callback cada vez que llega una nueva notificación
   */
  subscribeToNew(onNew: (n: Notificacion) => void) {
    const channel = supabase
      .channel('notificaciones-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones' },
        (payload) => {
          if (payload.new) {
            onNew(payload.new as Notificacion);
          }
        }
      )
      .subscribe();

    return channel;
  }
};
