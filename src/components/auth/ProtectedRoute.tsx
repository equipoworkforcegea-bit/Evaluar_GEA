import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthSession } from '../../types';

interface ProtectedRouteProps {
  session: AuthSession | null;
  allowedRoles?: ('SUPER_ADMIN' | 'ADMIN' | 'CANDIDATE')[];
  children: React.ReactElement;
}

/**
 * Blindaje de rutas (Route Guard) con control de acceso por rol (RBAC).
 * - Previene que usuarios no autenticados accedan a rutas protegidas.
 * - Previene que un postulante acceda a rutas administrativas de reclutadores.
 * - Utiliza `replace={true}` para evitar trampas en el historial de navegación (evitando loops con el botón atrás).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  session,
  allowedRoles,
  children
}) => {
  const location = useLocation();

  // 1. Si no hay sesión activa: Redirigir de inmediato al Login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si se especificaron roles permitidos y el usuario no cumple con el rol:
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Si un postulante intenta entrar al panel de administración: Redirigir a sus procesos invitados
    if (session.role === 'CANDIDATE') {
      return <Navigate to="/procesos-invitados" replace />;
    }
    // Si un rol no autorizado intenta ingresar: Enviar a la raíz segura
    return <Navigate to="/admin/procesos" replace />;
  }

  return children;
};
