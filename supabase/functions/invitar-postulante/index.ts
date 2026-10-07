// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { generateInvitationEmailHtml } from "./emailTemplate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CandidateInvitePayload {
  correo: string;
  nombre: string;
  apellido: string;
  nombre_completo?: string;
  usuario?: string;
  dni: string;
  telefono: string;
  proceso_id: string;
  titulo_proceso?: string;
  duracion_minutos?: number;
  recordatorio_48h?: boolean;
  consentimiento_ley?: boolean;
}

// Generador de Hash SHA-256 en Deno Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Token aleatorio criptográficamente seguro
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: CandidateInvitePayload = await req.json();

    // 1. VALIDACIONES RIGUROSAS
    const cleanEmail = (payload.correo || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ error: "Correo electrónico no válido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanNombre = (payload.nombre || "").trim();
    const cleanApellido = (payload.apellido || "").trim();
    const fullName = `${cleanNombre} ${cleanApellido}`.trim();
    const words = fullName.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      return new Response(
        JSON.stringify({ error: "Debe ingresar al menos dos palabras (nombre y apellido)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanDni = (payload.dni || "").replace(/\D/g, "");
    if (cleanDni && cleanDni.length !== 8) {
      return new Response(
        JSON.stringify({ error: "El DNI debe tener exactamente 8 dígitos numéricos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let cleanPhone = (payload.telefono || "").replace(/\s+/g, "");
    if (cleanPhone) {
      if (!cleanPhone.startsWith("+51")) {
        const digits = cleanPhone.replace(/\D/g, "");
        if (digits.length === 9 && digits.startsWith("9")) {
          cleanPhone = `+51${digits}`;
        }
      }
      const phoneRegex = /^\+519\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return new Response(
          JSON.stringify({ error: "El teléfono debe cumplir el formato peruano (+519XXXXXXXX)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const cleanUsuario = (payload.usuario || cleanEmail.split("@")[0]).trim().toLowerCase();

    // 2. CLIENTE DE BASE DE DATOS CON SERVICE ROLE KEY (PRIVILEGIADO)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Evitar duplicados por correo en el mismo proceso
    const { data: existingCandidate } = await supabase
      .from("candidatos")
      .select("id, estado")
      .eq("correo", cleanEmail)
      .eq("proceso_id", payload.proceso_id)
      .maybeSingle();

    if (existingCandidate && existingCandidate.estado !== "INVITADO") {
      return new Response(
        JSON.stringify({ error: "Este postulante ya se encuentra registrado o en proceso." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. GENERAR TOKEN ÚNICO DE UN SOLO USO (VIGENCIA 7 DÍAS)
    const rawToken = generateSecureToken();
    const tokenHash = await sha256(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const candidateDataToSave = {
      proceso_id: payload.proceso_id,
      nombre_completo: fullName,
      nombre: cleanNombre,
      apellido: cleanApellido,
      usuario: cleanUsuario,
      correo: cleanEmail,
      telefono: cleanPhone || null,
      numero: cleanPhone || null,
      dni: cleanDni,
      codigo_invitacion: `GEA-${cleanDni || rawToken.slice(0, 6).toUpperCase()}`,
      token_hash: tokenHash,
      token_expires_at: expiresAt,
      token_used: false,
      estado: "INVITADO",
      consentimiento_firmado: false,
      consentimiento_ley: Boolean(payload.consentimiento_ley),
      invitado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };

    let savedCandidateId = existingCandidate?.id;

    if (savedCandidateId) {
      const { error: updateErr } = await supabase
        .from("candidatos")
        .update(candidateDataToSave)
        .eq("id", savedCandidateId);

      if (updateErr) throw updateErr;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("candidatos")
        .insert(candidateDataToSave)
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      savedCandidateId = inserted.id;
    }

    // 4. CONSTRUIR ENLACE SEGURO
    // El enlace lleva a la pantalla de acceso existente, con la pestaña "Postulante / Examen" activa
    const inviteUrl = `${siteUrl}/login?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // 5. ENVÍO DEL CORREO MEDIANTE RESEND O SMTP
    let emailSent = false;
    let emailProviderNotice = "Email generado con éxito";

    const emailHtml = generateInvitationEmailHtml({
      candidateName: cleanNombre || fullName.split(" ")[0],
      processTitle: payload.titulo_proceso || "Proceso de Selección GEA Perú",
      durationMinutes: payload.duracion_minutos || 45,
      inviteUrl,
      companyName: "GEA Perú"
    });

    if (resendApiKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "GEA Perú Selección <seleccion@geaperu.pe>",
            to: [cleanEmail],
            subject: `Invitación a Evaluación Oficial - ${payload.titulo_proceso || "GEA Perú"}`,
            html: emailHtml
          })
        });

        if (resendRes.ok) {
          emailSent = true;
          emailProviderNotice = "Despachado vía Resend API";
        } else {
          const errText = await resendRes.text();
          console.warn("[Resend Warning]:", errText);
          emailProviderNotice = `Resend no pudo despachar: ${errText}`;
        }
      } catch (mailErr) {
        console.warn("[Mail Exception]:", mailErr);
      }
    } else {
      emailProviderNotice = "RESEND_API_KEY no configurada. Token y enlace generados de forma segura.";
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidato_id: savedCandidateId,
        correo: cleanEmail,
        invite_url: inviteUrl,
        raw_token: rawToken,
        email_sent: emailSent,
        notice: emailProviderNotice
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al procesar la invitación" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
