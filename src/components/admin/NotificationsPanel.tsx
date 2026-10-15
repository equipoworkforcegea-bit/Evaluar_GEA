import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCheck, Trash2, UserCheck, ClipboardCheck, UserPlus, CheckCircle2, Info } from 'lucide-react';
import { NotificacionesService, Notificacion } from '../../services/notificacionesService';
import { supabase } from '../../services/supabaseClient';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

function NotifIcon({ tipo }: { tipo: Notificacion['tipo'] }) {
  if (tipo === 'CANDIDATO_INGRESO') return (
    <div className="w-9 h-9 rounded-xl bg-[#2F5BA8]/10 flex items-center justify-center shrink-0">
      <UserCheck className="w-4 h-4 text-[#2F5BA8]" />
    </div>
  );
  if (tipo === 'CANDIDATO_ETAPA') return (
    <div className="w-9 h-9 rounded-xl bg-[#E08A3C]/10 flex items-center justify-center shrink-0">
      <CheckCircle2 className="w-4 h-4 text-[#E08A3C]" />
    </div>
  );
  if (tipo === 'CANDIDATO_COMPLETO') return (
    <div className="w-9 h-9 rounded-xl bg-[#2FA58B]/10 flex items-center justify-center shrink-0">
      <ClipboardCheck className="w-4 h-4 text-[#2FA58B]" />
    </div>
  );
  if (tipo === 'CANDIDATO_REGISTRADO') return (
    <div className="w-9 h-9 rounded-xl bg-[#6355DE]/10 flex items-center justify-center shrink-0">
      <UserPlus className="w-4 h-4 text-[#6355DE]" />
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
      <Info className="w-4 h-4 text-[#6B7494]" />
    </div>
  );
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateUnread = useCallback((list: Notificacion[]) => {
    const count = list.filter(n => !n.leido).length;
    onUnreadCountChange?.(count);
  }, [onUnreadCountChange]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await NotificacionesService.getNotificaciones(60);
    setNotifications(data);
    updateUnread(data);
    setIsLoading(false);
  }, [updateUnread]);

  // Cargar al abrir
  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  // Suscripción Realtime — escuchar nuevas notificaciones aunque el panel esté cerrado
  useEffect(() => {
    const channel = NotificacionesService.subscribeToNew((newNotif) => {
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        updateUnread(updated);
        return updated;
      });
    });

    // Cargar también el conteo inicial (para el badge del sidebar)
    NotificacionesService.getUnreadCount().then(count => {
      onUnreadCountChange?.(count);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateUnread, onUnreadCountChange]);

  const handleMarkRead = async (id: string) => {
    await NotificacionesService.markAsRead(id);
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, leido: true } : n);
      updateUnread(updated);
      return updated;
    });
  };

  const handleMarkAllRead = async () => {
    await NotificacionesService.markAllAsRead();
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, leido: true }));
      updateUnread(updated);
      return updated;
    });
  };

  const handleDelete = async (id: string) => {
    await NotificacionesService.deleteNotificacion(id);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      updateUnread(updated);
      return updated;
    });
  };

  const unread = notifications.filter(n => !n.leido).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Panel deslizante */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white dark:bg-[#182044] border-l border-[#DDE2EF] dark:border-[#2A3563] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDE2EF] dark:border-[#2A3563] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F2A5E]/10 dark:bg-white/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#1F2A5E] dark:text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#161C3A] dark:text-white">Notificaciones</h2>
              <p className="text-[11px] text-[#6B7494]">
                {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Marcar todas como leídas"
                className="p-2 rounded-lg text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 border-2 border-[#1F2A5E] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#6B7494]">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#6B7494] dark:text-[#9AA5C4]">Sin notificaciones</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Los avisos de postulantes aparecerán aquí en tiempo real.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-5 py-4 group transition-colors ${
                    !notif.leido
                      ? 'bg-[#EEF2FF] dark:bg-[#1F2A5E]/20'
                      : 'hover:bg-slate-50/60 dark:hover:bg-white/5'
                  }`}
                >
                  <NotifIcon tipo={notif.tipo} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold leading-snug ${
                        !notif.leido
                          ? 'text-[#1F2A5E] dark:text-white'
                          : 'text-[#6B7494] dark:text-[#9AA5C4]'
                      }`}>
                        {notif.titulo}
                      </p>
                      {!notif.leido && (
                        <span className="w-2 h-2 rounded-full bg-[#2F5BA8] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7494] dark:text-[#9AA5C4] mt-0.5 leading-relaxed">
                      {notif.mensaje}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {timeAgo(notif.creado_en)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notif.leido && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        title="Marcar como leída"
                        className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#2F5BA8] hover:bg-[#2F5BA8]/10 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(notif.id)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-[#6B7494] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DDE2EF] dark:border-[#2A3563] shrink-0">
          <p className="text-[10px] text-center text-[#6B7494] dark:text-[#9AA5C4]">
            Las notificaciones se generan automáticamente cuando un postulante se registra, inicia o completa la evaluación.
          </p>
        </div>
      </div>
    </>
  );
};
