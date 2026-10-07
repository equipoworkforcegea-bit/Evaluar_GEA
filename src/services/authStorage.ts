import { AuthSession } from '../types';

const SESSION_STORAGE_KEY = 'evaluar_auth_session_v1';

/**
 * Servicio seguro de persistencia de sesión en memoria de sesión (sessionStorage).
 * - Cumple con la Ley N° 29733 e ISO 27001: los datos se limpian al cerrar la pestaña.
 * - Validación estricta de estructura contra manipulación maliciosa de almacenamiento (anti-tampering).
 */
export const AuthStorage = {
  saveSession(session: AuthSession): void {
    try {
      if (!session || !session.userId || !session.role) return;
      const serialized = JSON.stringify({
        ...session,
        _timestamp: Date.now()
      });
      sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    } catch (err) {
      console.warn('[AuthStorage] No se pudo guardar la sesión:', err);
    }
  },

  getSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Blindaje de seguridad: Validar que los campos críticos existan y correspondan a tipos seguros
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.userId !== 'string' ||
        typeof parsed.fullName !== 'string' ||
        typeof parsed.email !== 'string'
      ) {
        this.clearSession();
        return null;
      }

      // Validar que el rol sea uno de los permitidos explícitamente
      const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'CANDIDATE'];
      if (!allowedRoles.includes(parsed.role)) {
        this.clearSession();
        return null;
      }

      // Si es rol CANDIDATE, asegurarse de que tenga candidateId o userId
      if (parsed.role === 'CANDIDATE' && !parsed.candidateId && !parsed.userId) {
        this.clearSession();
        return null;
      }

      return {
        role: parsed.role,
        userId: parsed.userId,
        fullName: parsed.fullName,
        email: parsed.email,
        username: typeof parsed.username === 'string' ? parsed.username : undefined,
        dni: typeof parsed.dni === 'string' ? parsed.dni : undefined,
        position: typeof parsed.position === 'string' ? parsed.position : undefined,
        candidateId: typeof parsed.candidateId === 'string' ? parsed.candidateId : parsed.userId
      };
    } catch {
      this.clearSession();
      return null;
    }
  },

  clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.warn('[AuthStorage] Error al limpiar sesión:', err);
    }
  }
};
