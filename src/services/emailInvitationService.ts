/**
 * Servicio frontend para el despacho automático de correos de invitación a postulantes
 * a través del endpoint /api/send-invitation conectado al Gmail de GEA Internacional.
 */

export interface CandidateInvitationEmailParams {
  to: string;
  candidateName?: string;
  dni?: string;
  processTitle?: string;
  accessCode?: string;
  durationMinutes?: number;
  customLoginUrl?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  loginUrl?: string;
  error?: string;
}

export const EmailInvitationService = {
  /**
   * Envía un correo formal de invitación a evaluación al postulante.
   */
  async sendInvitationEmail(params: CandidateInvitationEmailParams): Promise<EmailSendResult> {
    try {
      const emailClean = (params.to || '').trim().toLowerCase();
      if (!emailClean || !emailClean.includes('@')) {
        return { success: false, error: 'Dirección de correo electrónico inválida.' };
      }

      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailClean,
          candidateName: params.candidateName || 'Postulante',
          dni: params.dni || '',
          processTitle: params.processTitle || 'Convocatoria Laboral',
          accessCode: params.accessCode || `GEA-${params.dni || Math.floor(100000 + Math.random() * 900000)}`,
          durationMinutes: params.durationMinutes || 45,
          customLoginUrl: params.customLoginUrl
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        console.warn('[EmailInvitationService] Error de respuesta:', data.error || response.statusText);
        return {
          success: false,
          error: data.error || `Error en el servidor al enviar correo (${response.status})`
        };
      }

      console.log(`[EmailInvitationService] ✓ Invitación enviada a ${emailClean}`);
      return {
        success: true,
        messageId: data.messageId,
        loginUrl: data.loginUrl
      };
    } catch (err: any) {
      console.error('[EmailInvitationService] Error de conexión:', err);
      return {
        success: false,
        error: err?.message || 'Error de conexión al intentar enviar el correo de invitación.'
      };
    }
  }
};
