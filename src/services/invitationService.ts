import { supabase } from './supabaseClient';

export interface PostulanteInviteData {
  correo: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  usuario: string;
  dni: string;
  telefono: string;
  procesoId: string;
  tituloProceso: string;
  duracionMinutos: number;
  sendImmediate: boolean;
  sendReminder48h: boolean;
  requireConsentLaw: boolean;
}

export interface InviteResult {
  success: boolean;
  candidatoId?: string;
  inviteUrl?: string;
  whatsappUrl?: string;
  token?: string;
  codigoInvitacion?: string;
  error?: string;
}

const DEFAULT_PROCESS_UUID = '22222222-0000-4000-8000-000000000001';

function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

export const InvitationService = {
  /**
   * Registra la invitación en la base de datos Supabase y genera los enlaces de acceso móvil y WhatsApp.
   */
  async invitarPostulante(data: PostulanteInviteData): Promise<InviteResult> {
    try {
      const emailClean = data.correo.toLowerCase().trim();
      const dniClean = data.dni.replace(/\D/g, '').trim();
      const phoneDigits = data.telefono.replace(/\D/g, '');
      const phoneForWhatsapp = phoneDigits.startsWith('51') ? phoneDigits : (phoneDigits.length === 9 ? `51${phoneDigits}` : phoneDigits);

      // Código de invitación amigable y seguro para móviles
      const codigoInvitacion = `GEA-${dniClean || Math.floor(100000 + Math.random() * 900000)}`;
      const procUuid = (data.procesoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.procesoId))
        ? data.procesoId
        : DEFAULT_PROCESS_UUID;

      // Buscar si el postulante ya existe por correo o DNI en Supabase
      const { data: existing } = await supabase
        .from('candidatos')
        .select('id, codigo_invitacion')
        .or(`correo.ilike.${emailClean},dni.eq.${dniClean}`)
        .maybeSingle();

      const candUuid = existing?.id || ensureUuid();
      const codigoFinal = existing?.codigo_invitacion || codigoInvitacion;

      const candidatePayload = {
        id: candUuid,
        proceso_id: procUuid,
        nombre_completo: (data.nombreCompleto || `${data.nombre} ${data.apellido}`).trim(),
        correo: emailClean,
        telefono: data.telefono.trim(),
        whatsapp_user: data.telefono.trim(),
        dni: dniClean,
        codigo_invitacion: codigoFinal,
        estado: 'INVITADO',
        etapa_actual: 'ETAPA_1_PSICOTECNICA',
        consentimiento_firmado: false,
        invitado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      const { data: savedRow, error: saveErr } = await supabase
        .from('candidatos')
        .upsert(candidatePayload)
        .select()
        .single();

      if (saveErr) {
        console.error('[InvitationService] Error guardando candidato en Supabase:', saveErr.message);
      }

      // Enlace de invitación oficial compatible con móvil y desktop
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const inviteUrl = `${origin}/login?code=${encodeURIComponent(codigoFinal)}&dni=${encodeURIComponent(dniClean)}&email=${encodeURIComponent(emailClean)}`;

      // Mensaje corporativo optimizado para WhatsApp
      const candidateFirstName = data.nombre || data.nombreCompleto.split(' ')[0] || 'Postulante';
      const processName = data.tituloProceso || 'Asesor Operativo';
      const whatsappMsg = `Estimado/a *${candidateFirstName}*, te saludamos de Selección y Talento Humano de *GEA Perú*.\n\nHas sido convocado/a al proceso de selección: *${processName}*.\n\n📌 *Ingresa a tu evaluación aquí:*\n${inviteUrl}\n\n🔑 *Tus credenciales de acceso:*\n- Usuario: Tu DNI (${dniClean})\n- Contraseña temporal: *Gea2026!*\n\n⏱ La prueba dura aprox. ${data.duracionMinutos || 45} minutos. ¡Muchos éxitos!`;
      
      const whatsappUrl = `https://wa.me/${phoneForWhatsapp}?text=${encodeURIComponent(whatsappMsg)}`;

      // Intentar despacho por Edge Function de Supabase en segundo plano si está disponible
      try {
        supabase.functions.invoke('invitar-postulante', {
          body: {
            correo: emailClean,
            nombre: data.nombre,
            apellido: data.apellido,
            nombre_completo: data.nombreCompleto,
            dni: dniClean,
            telefono: data.telefono,
            proceso_id: procUuid,
            titulo_proceso: processName,
            duracion_minutos: data.duracionMinutos,
            invite_url: inviteUrl
          }
        }).catch(() => {});
      } catch {
        // No bloqueante
      }

      return {
        success: true,
        candidatoId: savedRow?.id || candUuid,
        inviteUrl,
        whatsappUrl,
        token: codigoFinal,
        codigoInvitacion: codigoFinal
      };
    } catch (err: any) {
      console.error('[InvitationService] Excepción al invitar postulante:', err);
      return {
        success: false,
        error: err.message || 'Error al generar la invitación'
      };
    }
  },

  /**
   * Valida un código o token de invitación contra la base de datos Supabase
   */
  async validarToken(rawToken: string, emailHint?: string, dniHint?: string): Promise<{
    valido: boolean;
    candidato?: any;
    error?: string;
  }> {
    try {
      const cleanToken = rawToken.trim();
      const cleanDni = dniHint ? dniHint.replace(/\D/g, '') : (cleanToken.replace(/\D/g, '').length >= 7 ? cleanToken.replace(/\D/g, '') : '');
      const cleanEmail = emailHint ? emailHint.trim().toLowerCase() : (cleanToken.includes('@') ? cleanToken.toLowerCase() : '');

      let query = supabase
        .from('candidatos')
        .select('*, procesos_evaluacion(titulo, puesto_objetivo, duracion_total_minutos)');

      const orConditions: string[] = [];
      if (cleanToken) {
        orConditions.push(`codigo_invitacion.ilike.${cleanToken}`);
      }
      if (cleanDni) {
        orConditions.push(`dni.eq.${cleanDni}`);
      }
      if (cleanEmail) {
        orConditions.push(`correo.ilike.${cleanEmail}`);
      }

      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','));
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        // Intento directo por DNI si tiene formato numérico
        if (cleanDni) {
          const { data: byDni } = await supabase
            .from('candidatos')
            .select('*, procesos_evaluacion(titulo, puesto_objetivo, duracion_total_minutos)')
            .eq('dni', cleanDni)
            .maybeSingle();

          if (byDni) {
            return { valido: true, candidato: byDni };
          }
        }

        // Intento directo por correo
        if (cleanEmail) {
          const { data: byEmail } = await supabase
            .from('candidatos')
            .select('*, procesos_evaluacion(titulo, puesto_objetivo, duracion_total_minutos)')
            .ilike('correo', cleanEmail)
            .maybeSingle();

          if (byEmail) {
            return { valido: true, candidato: byEmail };
          }
        }

        return {
          valido: false,
          error: 'Código de invitación no encontrado en el sistema. Puedes ingresar directamente con tu DNI.'
        };
      }

      return { valido: true, candidato: data };
    } catch (err: any) {
      console.warn('[InvitationService] Excepción en validarToken:', err);
      return { valido: false, error: err.message || 'Error al validar la invitación' };
    }
  },

  /**
   * Alias de conveniencia para generar invitaciones
   */
  async generarInvitacion(data: Partial<PostulanteInviteData> & { correo: string; dni: string; procesoId: string }) {
    const fullData: PostulanteInviteData = {
      correo: data.correo,
      nombre: data.nombre || data.nombreCompleto?.split(' ')[0] || 'Postulante',
      apellido: data.apellido || data.nombreCompleto?.split(' ').slice(1).join(' ') || '',
      nombreCompleto: data.nombreCompleto || `${data.nombre || 'Postulante'} ${data.apellido || ''}`.trim(),
      usuario: data.usuario || data.correo.split('@')[0],
      dni: data.dni,
      telefono: data.telefono || '',
      procesoId: data.procesoId,
      tituloProceso: data.tituloProceso || 'Proceso de Selección GEA',
      duracionMinutos: data.duracionMinutos || 45,
      sendImmediate: data.sendImmediate ?? true,
      sendReminder48h: data.sendReminder48h ?? true,
      requireConsentLaw: data.requireConsentLaw ?? true
    };
    return this.invitarPostulante(fullData);
  }
};
