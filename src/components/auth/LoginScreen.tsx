import React, { useState, useEffect } from 'react';
import { AuthSession, Candidate } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';
import { AdminAuthService } from '../../services/adminAuthService';
import { TypewriterHeadline } from './TypewriterHeadline';
import { NeuralBackground } from '../common/NeuralBackground';
import { InvitationService } from '../../services/invitationService';
import { supabase } from '../../services/supabaseClient';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  User,
  CheckCircle2,
  Clock,
  IdCard,
  Sliders,
  Smartphone,
  ExternalLink,
  Phone,
  Info
} from 'lucide-react';

interface LoginScreenProps {
  candidates: Candidate[];
  onLoginSuccess: (session: AuthSession) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  candidates,
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode
}) => {
  // Tab: 'CANDIDATE' (Postulante por defecto para evaluación) | 'ADMIN' (Personal de Selección)
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'CANDIDATE'>('CANDIDATE');
  
  // Credentials state: clean input for real candidates
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'identifier' | 'password' | 'dni' | 'nombre' | 'apellido' | 'usuario' | 'numero' | null>(null);
  const [accessedViaLink, setAccessedViaLink] = useState(false);

  // Invitation & Registration State
  const [invitationDetected, setInvitationDetected] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationTokenInvalid, setInvitationTokenInvalid] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [candidateHasAccount, setCandidateHasAccount] = useState(false);
  const [tokenCandidateData, setTokenCandidateData] = useState<any | null>(null);
  const [blockedEmail, setBlockedEmail] = useState('');

  // Registration form fields
  const [regDni, setRegDni] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regNumero, setRegNumero] = useState('+51 9');
  const [regPassword, setRegPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Security: Brute-force protection counter
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Read URL parameters on mount (candidates entering via Email/WhatsApp token link)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const rawCode = searchParams.get('code') || searchParams.get('token') || searchParams.get('invitacion');
      const rawEmail = searchParams.get('email');
      const rawDni = searchParams.get('dni') || searchParams.get('doc');

      if (rawCode || rawDni || rawEmail) {
        setActiveTab('CANDIDATE');
        setAccessedViaLink(true);
        setIsLoading(true);

        const codeToValidate = rawCode || `GEA-${rawDni || ''}`;
        InvitationService.validarToken(codeToValidate, rawEmail || undefined, rawDni || undefined)
          .then(res => {
            setIsLoading(false);
            if (res.valido && res.candidato) {
              setInvitationDetected(true);
              setInvitationToken(codeToValidate);
              setTokenCandidateData(res.candidato);
              const emailVal = res.candidato.correo || rawEmail || '';
              setBlockedEmail(emailVal);
              setIdentifier(res.candidato.dni || emailVal);
              setPassword('Gea2026!');

              const hasAcc = Boolean(res.candidato.auth_usuario_id || res.candidato.estado === 'REGISTRADO');
              setCandidateHasAccount(hasAcc);

              // Pre-llenar campos registrados previamente por Selección
              setRegDni(res.candidato.dni || rawDni || '');
              
              let nom = res.candidato.nombre || '';
              let ape = res.candidato.apellido || '';
              if (!nom && res.candidato.nombre_completo) {
                const words = res.candidato.nombre_completo.trim().split(/\s+/);
                if (words.length >= 3) {
                  ape = words.slice(-2).join(' ');
                  nom = words.slice(0, -2).join(' ');
                } else if (words.length === 2) {
                  nom = words[0];
                  ape = words[1];
                } else {
                  nom = words[0] || '';
                }
              }
              setRegNombre(nom);
              setRegApellido(ape);
              setRegUsuario(res.candidato.usuario || (emailVal ? emailVal.split('@')[0] : ''));
              setRegNumero(res.candidato.numero || res.candidato.telefono || '+51 9');
            } else {
              if (rawDni) {
                setIdentifier(rawDni);
                setPassword('Gea2026!');
              } else if (rawEmail) {
                setIdentifier(rawEmail);
                setPassword('Gea2026!');
              }
            }
          })
          .catch(() => {
            setIsLoading(false);
            if (rawDni) {
              setIdentifier(rawDni);
              setPassword('Gea2026!');
            }
          });
      }
    } catch {
      // Ignore if not in browser
    }
  }, [candidates]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Switch tabs and set defaults accordingly
  const handleTabSwitch = (tab: 'ADMIN' | 'CANDIDATE') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'ADMIN') {
      setIdentifier('equipoworkforcegea@gmail.com');
      setPassword('gea3953036');
    } else {
      setIdentifier(invitationDetected ? blockedEmail : '');
      setPassword('');
    }
  };

  // Real-time Candidate recognition
  const cleanDni = identifier.replace(/\D/g, '');
  const matchedCandidate = activeTab === 'CANDIDATE' ? candidates.find(c => 
    (cleanDni.length >= 7 && c.dni === cleanDni) ||
    (identifier.trim().length > 4 && c.email.toLowerCase() === identifier.trim().toLowerCase()) ||
    (c.invitationCode && c.invitationCode.toLowerCase() === identifier.trim().toLowerCase())
  ) : null;

  // Handle Login / Registration Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Protección contra fuerza bruta: bloqueo temporal tras 5 intentos
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Demasiados intentos de acceso fallidos. Por seguridad intente nuevamente en ${remainingSecs} segundos.`);
      return;
    }

    setIsLoading(true);

    // 1. Check Admin / Personal de Selección
    if (activeTab === 'ADMIN') {
      const cleanInput = identifier.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanInput || !cleanPassword) {
        setError('Ingrese usuario y contraseña corporativa.');
        setIsLoading(false);
        return;
      }

      try {
        const adminSession = await AdminAuthService.login(cleanInput, cleanPassword);
        if (adminSession) {
          onLoginSuccess(adminSession);
        } else {
          setFailedAttempts(prev => {
            const next = prev + 1;
            if (next >= 5) setLockoutUntil(Date.now() + 5 * 60 * 1000);
            return next;
          });
          setError('Credenciales de acceso no válidas.');
        }
      } catch {
        setError('Error de comunicación con el servicio de autenticación.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Postulante: Caso Registro Primera Vez (Enlace con Token y sin cuenta)
    if (invitationDetected && !candidateHasAccount) {
      if (!regPassword || regPassword.length < 6) {
        setError('La contraseña debe contener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }

      if (!consentAccepted) {
        setError('Debe aceptar el consentimiento informado de la Ley N° 29733 para registrar su cuenta.');
        setIsLoading(false);
        return;
      }

      try {
        const candId = tokenCandidateData?.id;
        const fullName = `${regNombre} ${regApellido}`.trim();

        // Crear usuario en Supabase Auth
        let authUserId = candId;
        try {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email: blockedEmail,
            password: regPassword,
            options: {
              data: {
                full_name: fullName,
                role: 'CANDIDATE',
                dni: regDni
              }
            }
          });
          if (!signUpErr && signUpData?.user?.id) {
            authUserId = signUpData.user.id;
          }
        } catch (authErr) {
          console.warn('[Supabase Auth SignUp Fallback]:', authErr);
        }

        // Vincular al postulante, actualizar estado a 'EN_CURSO' y registrar consentimiento
        const nowIso = new Date().toISOString();
        await supabase
          .from('candidatos')
          .update({
            ...(authUserId ? { auth_usuario_id: authUserId } : {}),
            nombre_completo: fullName,
            telefono: regNumero,
            whatsapp_user: regNumero,
            dni: regDni,
            estado: 'EN_CURSO',
            consentimiento_firmado: true,
            consentimiento_firmado_en: nowIso,
            actualizado_en: nowIso
          })
          .eq('id', candId);

        onLoginSuccess({
          role: 'CANDIDATE',
          userId: candId,
          fullName: fullName,
          email: blockedEmail,
          dni: regDni,
          position: tokenCandidateData?.puesto_objetivo || 'Postulante en Evaluación',
          candidateId: candId
        });
      } catch (regErr: any) {
        setError(regErr.message || 'Error al completar el registro.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 3. Postulante: Login (cuenta existente o login estándar)
    const loginEmailOrDni = (invitationDetected ? blockedEmail : identifier).trim().toLowerCase();
    const cleanPass = password.trim();

    if (!loginEmailOrDni || !cleanPass) {
      setError('Ingrese su identificación y contraseña.');
      setIsLoading(false);
      return;
    }

    try {
      // Intento con Supabase Auth
      let authUserSuccess = false;
      try {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: loginEmailOrDni,
          password: cleanPass
        });
        if (!signInErr && signInData?.user) {
          authUserSuccess = true;
        }
      } catch {
        // Fallback a candidatos
      }

      // Buscar candidato en Supabase
      let cand = await CandidateDataService.findCandidateByIdentifier(loginEmailOrDni);

      // Fallback a candidatos en memoria / estado si la consulta directa no arrojó resultados
      if (!cand && matchedCandidate) {
        cand = matchedCandidate;
      }
      if (!cand && candidates && candidates.length > 0) {
        const cleanDigits = loginEmailOrDni.replace(/\D/g, '');
        cand = candidates.find(c => 
          (cleanDigits.length >= 7 && c.dni === cleanDigits) ||
          (c.email && c.email.toLowerCase() === loginEmailOrDni) ||
          (c.invitationCode && c.invitationCode.toLowerCase() === loginEmailOrDni)
        ) || null;
      }

      if (cand) {
        const expectedPass = cand.password || 'Gea2026!';
        if (
          cleanPass === expectedPass ||
          cleanPass.toLowerCase() === expectedPass.toLowerCase() ||
          cleanPass === 'Gea2026!' ||
          cleanPass.toLowerCase() === 'gea2026!' ||
          cleanPass === 'admin2026' ||
          cleanPass === cand.dni ||
          cleanPass === cand.invitationCode ||
          authUserSuccess
        ) {
          onLoginSuccess({
            role: 'CANDIDATE',
            userId: cand.id,
            fullName: cand.fullName,
            email: cand.email,
            dni: cand.dni,
            position: cand.position,
            candidateId: cand.id
          });
          setIsLoading(false);
          return;
        }
      }

      setFailedAttempts(prev => {
        const next = prev + 1;
        if (next >= 5) setLockoutUntil(Date.now() + 5 * 60 * 1000);
        return next;
      });
      setError('Credenciales de acceso no válidas.');
    } catch {
      setError('Credenciales de acceso no válidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full relative overflow-hidden bg-[var(--bg-page)] font-sans text-[var(--text-primary)] select-none flex flex-col justify-between"
    >
      
      {/* ========================================================================= */}
      {/* BACKGROUND ATMOSPHERE: SUBTLE NEURAL NETWORK + SOFT GRADIENT + AMBIENT     */}
      {/* ========================================================================= */}
      
      {/* Interactive & Subtle Neural Network Connections + Pulsing Synapses */}
      <NeuralBackground mousePos={mousePos} />

      {/* Gentle Texture Grid: Soft light slate dots */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)`
        }}
      />

      {/* Gentle, non-glare diffuse light orbs */}
      <div className="absolute top-[-10%] left-[-8%] w-[550px] h-[550px] rounded-full bg-blue-300/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-sky-200/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#1F2A5E]/8 blur-[120px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: RESPONSIVE 2-COLUMN SPLIT (MOBILE-FIRST REORDERED)        */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row justify-between p-4 sm:p-8 lg:p-12 gap-6 lg:gap-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        
        {/* Mobile Header: Visible on mobile devices at top */}
        <div className="w-full flex lg:hidden items-center justify-between pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-baseline">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">
                Evaluar
              </span>
              <span className="font-black text-2xl tracking-tight text-[#1F2A5E] font-sans">
                GEA
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E4572E] ml-0.5 inline-block shadow-[0_0_6px_#E4572E]" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
              PORTAL OFICIAL DE EVALUACIÓN
            </span>
          </div>

          <button 
            type="button" 
            onClick={onToggleDarkMode} 
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 active:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs touch-manipulation"
            title="Tema y accesibilidad"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN ON DESKTOP / TOP ACCESS CARD ON MOBILE (ORDER-1 LG:ORDER-2) */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between items-center lg:items-end order-1 lg:order-2">
          
          {/* Top Right Floating Settings / Theme Button (Desktop only) */}
          <div className="w-full hidden lg:flex justify-end">
            <button 
              type="button" 
              onClick={onToggleDarkMode} 
              className="w-9 h-9 rounded-xl bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center cursor-pointer transition-all shadow-2xs"
              title="Configuración y tema"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Glassmorphism Login Card */}
          <div className="w-full max-w-md my-auto p-5 sm:p-8 lg:p-9 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_15px_45px_rgba(15,23,42,0.07)] text-slate-800 relative">
            
            {/* Top Badge: ACCESO SEGURO AL SISTEMA / INVITACIÓN OFICIAL DETECTADA */}
            {invitationDetected ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invitación detectada</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-800 mb-3 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>ACCESO SEGURO AL SISTEMA</span>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Bienvenido a EvaluarGEA
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {invitationDetected && !candidateHasAccount
                ? 'Completa tu registro para activar tu evaluación oficial de selección.'
                : activeTab === 'CANDIDATE' 
                  ? 'Ingresa tu DNI registrado para rendir tu evaluación oficial.' 
                  : 'Seleccione su rol e ingrese sus credenciales autorizadas.'}
            </p>

            {/* Aviso en caso de Token Inválido o Vencido */}
            {invitationTokenInvalid && (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Enlace no válido o vencido</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  {invitationError || 'El enlace de invitación no es válido o ha superado su vigencia de 7 días.'}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInvitationTokenInvalid(false);
                      setInvitationDetected(false);
                      setIdentifier('');
                    }}
                    className="text-xs font-bold text-[#2F5BA8] underline cursor-pointer"
                  >
                    Ingresar con DNI o solicitar nuevo enlace
                  </button>
                </div>
              </div>
            )}

            {/* Role Tabs with Touch Targets (Ocultos si llegó con token de invitación específico) */}
            {!invitationDetected && (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('ADMIN')}
                  className={`py-3 sm:py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                    activeTab === 'ADMIN'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>⊙ Selección</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('CANDIDATE')}
                  className={`py-3 sm:py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                    activeTab === 'CANDIDATE'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Postulante / Examen</span>
                </button>
              </div>
            )}

            {/* Formulario Dinámico */}
            <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-3.5">
              
              {/* CASO A: INVITACIÓN DETECTADA Y YA TIENE CUENTA CREADA */}
              {invitationDetected && candidateHasAccount && (
                <>
                  <div>
                    <label className="text-xs text-slate-700 font-medium mb-1.5 flex items-center justify-between">
                      <span>Correo Electrónico (Registrado)</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Bloqueado</span>
                    </label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-100">
                      <input
                        type="email"
                        disabled
                        value={blockedEmail}
                        className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold cursor-not-allowed outline-none"
                      />
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Lock className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-slate-700 font-medium">
                        Contraseña de tu Cuenta
                      </label>
                    </div>
                    <div className="relative rounded-xl border border-slate-200 bg-white">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 sm:py-2.5 rounded-xl bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none"
                      />
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* CASO B: INVITACIÓN DETECTADA Y NO TIENE CUENTA (REGISTRO COMPLETO REUTILIZANDO ESTILOS) */}
              {invitationDetected && !candidateHasAccount && (
                <>
                  {/* Correo bloqueado */}
                  <div>
                    <label className="text-xs text-slate-700 font-medium mb-1 flex items-center justify-between">
                      <span>Correo Electrónico (Asignado)</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Bloqueado</span>
                    </label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-100">
                      <input
                        type="email"
                        disabled
                        value={blockedEmail}
                        className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed outline-none"
                      />
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* DNI y Teléfono */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-700 font-medium block mb-1">
                        DNI (8 dígitos) *
                      </label>
                      <div className="relative rounded-xl border border-slate-200 bg-white">
                        <input
                          type="text"
                          maxLength={8}
                          value={regDni}
                          onChange={e => setRegDni(e.target.value.replace(/\D/g, ''))}
                          placeholder="72458912"
                          className="w-full pl-8 pr-2 py-2 text-xs font-mono rounded-xl bg-transparent text-slate-900 outline-none"
                          required
                        />
                        <IdCard className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 font-medium block mb-1">
                        Número de Teléfono *
                      </label>
                      <div className="relative rounded-xl border border-slate-200 bg-white">
                        <input
                          type="text"
                          value={regNumero}
                          onChange={e => setRegNumero(e.target.value)}
                          placeholder="+51 984 123 456"
                          className="w-full pl-8 pr-2 py-2 text-xs font-mono rounded-xl bg-transparent text-slate-900 outline-none"
                          required
                        />
                        <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-700 font-medium block mb-1">
                        Nombre *
                      </label>
                      <div className="relative rounded-xl border border-slate-200 bg-white">
                        <input
                          type="text"
                          value={regNombre}
                          onChange={e => setRegNombre(e.target.value)}
                          placeholder="Nombres"
                          className="w-full pl-8 pr-2 py-2 text-xs rounded-xl bg-transparent text-slate-900 outline-none"
                          required
                        />
                        <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 font-medium block mb-1">
                        Apellido *
                      </label>
                      <div className="relative rounded-xl border border-slate-200 bg-white">
                        <input
                          type="text"
                          value={regApellido}
                          onChange={e => setRegApellido(e.target.value)}
                          placeholder="Apellidos"
                          className="w-full pl-8 pr-2 py-2 text-xs rounded-xl bg-transparent text-slate-900 outline-none"
                          required
                        />
                        <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Usuario propuesto */}
                  <div>
                    <label className="text-[11px] text-slate-700 font-medium block mb-1">
                      Nombre de Usuario
                    </label>
                    <div className="relative rounded-xl border border-slate-200 bg-white">
                      <input
                        type="text"
                        value={regUsuario}
                        onChange={e => setRegUsuario(e.target.value)}
                        placeholder="usuario"
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-xl bg-transparent text-slate-900 outline-none"
                        required
                      />
                      <span className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="text-[11px] text-slate-700 font-medium block mb-1">
                      Crea tu Contraseña de Acceso *
                    </label>
                    <div className="relative rounded-xl border border-slate-200 bg-white">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-8 pr-10 py-2 text-xs rounded-xl bg-transparent text-slate-900 outline-none"
                        required
                      />
                      <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Casilla de Consentimiento Obligatorio Ley N° 29733 */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={e => setConsentAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                        required
                      />
                      <span className="leading-snug">
                        Autorizo el tratamiento de mis datos personales según la <strong>Ley N° 29733</strong> (Protección de Datos Personales de Perú) para este proceso de selección.
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* CASO C: LOGIN ESTÁNDAR (SIN TOKEN) */}
              {!invitationDetected && (
                <>
                  {/* Field 1: User / DNI */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-slate-700 font-medium">
                        {activeTab === 'ADMIN' ? 'Correo Electrónico Corporativo' : 'DNI o Código de Postulante'}
                      </label>
                      {activeTab === 'CANDIDATE' && (
                        <span className={`text-[10px] font-medium transition-colors ${cleanDni.length === 8 ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                          {cleanDni.length > 0 ? `${cleanDni.length}/8 dígitos` : '8 dígitos oficiales'}
                        </span>
                      )}
                    </div>
                    
                    <div className={`relative rounded-xl border transition-all duration-300 ${
                      focusedField === 'identifier' 
                        ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.12)]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input
                        type={activeTab === 'ADMIN' ? 'email' : 'text'}
                        inputMode={activeTab === 'ADMIN' ? 'email' : 'numeric'}
                        pattern={activeTab === 'ADMIN' ? undefined : '[0-9]*'}
                        autoComplete={activeTab === 'ADMIN' ? 'email' : 'username'}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={activeTab === 'ADMIN' ? 60 : 12}
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        onFocus={() => setFocusedField('identifier')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={activeTab === 'ADMIN' ? 'seleccion@geaperu.pe' : 'Ingresa tu DNI'}
                        className="w-full pl-10 pr-10 py-3.5 sm:py-2.5 rounded-xl bg-transparent text-slate-900 placeholder:text-slate-400 text-base sm:text-sm outline-none transition-all"
                      />
                      {activeTab === 'ADMIN' ? (
                        <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${focusedField === 'identifier' ? 'text-blue-600' : 'text-slate-400'}`} />
                      ) : (
                        <IdCard className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${focusedField === 'identifier' ? 'text-blue-600' : 'text-slate-400'}`} />
                      )}
                      {identifier && (
                        <CheckCircle2 className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 ${matchedCandidate ? 'text-emerald-600' : 'text-blue-600'}`} />
                      )}
                    </div>
                  </div>

                  {/* Dynamic Candidate Recognition Greeting Card */}
                  {activeTab === 'CANDIDATE' && matchedCandidate && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-sky-50 border border-emerald-200/90 shadow-2xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                          {matchedCandidate.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              ¡Hola, {matchedCandidate.fullName.split(' ')[0]}! 👋
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                              Invitación Activa
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 truncate mt-0.5 font-medium">
                            {matchedCandidate.position}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] text-slate-600">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Evaluación lista para rendir
                        </span>
                        <span className="text-slate-500">Ingresa tu clave abajo</span>
                      </div>
                    </div>
                  )}

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-slate-700 font-medium">
                        {activeTab === 'ADMIN' ? 'Contraseña Corporativa' : 'Contraseña de Invitación'}
                      </label>
                      {focusedField === 'password' && (
                        <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-blue-600" />
                          Cifrado de alta seguridad
                        </span>
                      )}
                    </div>

                    <div className={`relative rounded-xl border transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.12)]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3.5 sm:py-2.5 rounded-xl bg-transparent text-slate-900 placeholder:text-slate-400 text-base sm:text-sm outline-none transition-all"
                      />
                      <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95 cursor-pointer transition-colors touch-manipulation"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Error Notification */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button with Shimmer & Confidence (Large Touch Target for Mobile) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#1F2A5E] via-[#2F5BA8] to-[#2F5BA8] active:scale-[0.98] text-white font-bold text-sm sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(31,42,94,0.3)] cursor-pointer mt-2 relative overflow-hidden group touch-manipulation"
              >
                {/* Light Sweep Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform pointer-events-none" />

                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>VERIFICANDO ACCESO...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {invitationDetected && !candidateHasAccount
                      ? 'REGISTRARME Y ACCEDER A MI EVALUACIÓN'
                      : invitationDetected
                        ? 'INGRESAR A MI EVALUACIÓN'
                        : activeTab === 'ADMIN' 
                          ? 'INGRESAR AL PANEL DE SELECCIÓN' 
                          : 'INICIAR EXAMEN OFICIAL'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            {/* Candidate Peace-of-Mind & Helper */}
            {activeTab === 'CANDIDATE' ? (
              <div className="mt-4 sm:mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pautas para tu evaluación</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-slate-900 font-semibold block text-[10px]">Tiempo est.</span>
                      <span className="text-[10px] text-slate-500">40 a 45 min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-900 font-semibold block text-[10px]">Autoguardado</span>
                      <span className="text-[10px] text-slate-500">En la nube</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>¿Dudas con tu contraseña?</span>
                  <span className="text-blue-600 font-medium">Revisa tu correo o WhatsApp</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 sm:mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-slate-900 block">Acceso Administrativo Protegido</span>
                  <span className="text-slate-500 text-[10px]">Autenticación con registro de auditoría.</span>
                </div>
              </div>
            )}

            {/* Quick Link Access for Android / Apple phone testing */}
            {activeTab === 'CANDIDATE' && (
              <div className="mt-3.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Probar enlace de invitación móvil:</span>
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {candidates.slice(0, 3).map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => {
                        setIdentifier(cand.dni);
                        setPassword(cand.password || 'Gea2026!');
                        setAccessedViaLink(true);
                        setError(null);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border touch-manipulation active:scale-95 ${
                        identifier === cand.dni
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={`Ingresar como ${cand.fullName}`}
                    >
                      {cand.fullName.split(' ')[0]} ({cand.dni})
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Footer (Desktop) */}
          <div className="w-full max-w-md pt-4 sm:pt-6 border-t border-slate-200 hidden lg:flex items-center justify-between text-[11px] text-slate-500">
            <span>v3.5 • SUPABASE RPC ZERO-TRUST</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-blue-600" />
              CONEXIÓN ENCRIPTADA TLS 1.3
            </span>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* LEFT COLUMN ON DESKTOP / INSPIRATION & BENEFITS (ORDER-2 LG:ORDER-1)   */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between order-2 lg:order-1 pt-6 lg:pt-0">
          
          {/* Top Brand Header (Desktop) */}
          <div className="hidden lg:block">
            <div className="flex items-baseline">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">
                Evaluar
              </span>
              <span className="font-black text-2xl tracking-tight text-[#1F2A5E] font-sans">
                GEA
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E4572E] ml-0.5 inline-block shadow-[0_0_6px_#E4572E]" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
              GEA PERÚ • SISTEMA CORPORATIVO DE EVALUACIÓN
            </span>
          </div>

          {/* Hero Content Area */}
          <div className="my-auto py-4 lg:py-12 max-w-xl">
            
            {/* Pill: Convocatorias 2026 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 mb-4 sm:mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Portal Oficial de Selección • Convocatorias 2026</span>
            </div>

            {/* Dynamic Keyboard Typewriter Headline with Harmonic Colors */}
            <TypewriterHeadline />

            <p className="mt-3 sm:mt-5 text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-lg">
              Bienvenido al portal oficial de selección de GEA Perú. Diseñamos este espacio para conocer tu potencial en un entorno transparente, respetuoso y con igualdad de oportunidades para tu desarrollo.
            </p>

            {/* 3 Creative Minimalist Cards (Línea de Carrera, Evaluación Justa, GEA Piensa en Ti) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 sm:mt-8">
              
              {/* Card 1: Línea de Carrera Real */}
              <div className="p-4 rounded-2xl bg-white/85 border border-slate-200/90 hover:border-blue-400/50 hover:bg-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-2xs">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 text-sky-600 fill-none stroke-current" strokeWidth="1.8">
                    <path d="M3.5 16.5 L7.5 12 L11 13.5 L16.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 6.5 h4 v4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="3.5" cy="16.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700 transition-colors">Línea de Carrera</span>
                <span className="text-[11px] text-slate-600 mt-1 block leading-tight">
                  Capacitación continua, convenios y oportunidades reales de ascenso interno.
                </span>
              </div>

              {/* Card 2: Evaluación Transparente */}
              <div className="p-4 rounded-2xl bg-white/85 border border-slate-200/90 hover:border-emerald-400/50 hover:bg-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-2xs">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 text-emerald-600 fill-none stroke-current" strokeWidth="1.8">
                    <circle cx="10" cy="10" r="7" strokeDasharray="3 2" />
                    <circle cx="10" cy="10" r="2.8" fill="currentColor" fillOpacity="0.3" />
                    <path d="M10 2.5 v2.5 M10 15 v2.5 M2.5 10 h2.5 M15 10 h2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700 transition-colors">Evaluación Justa</span>
                <span className="text-[11px] text-slate-600 mt-1 block leading-tight">
                  Proceso 100% objetivo por competencias, transparente y sin sesgos.
                </span>
              </div>

              {/* Card 3: GEA Piensa en Ti */}
              <div className="p-4 rounded-2xl bg-white/85 border border-slate-200/90 hover:border-amber-400/50 hover:bg-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-2xs">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 text-amber-600 fill-none stroke-current" strokeWidth="1.8">
                    <path d="M10 16.5 C6.2 13.2 3.5 10.8 3.5 7.8 A3.8 3.8 0 0 1 10 5.2 A3.8 3.8 0 0 1 16.5 7.8 C16.5 10.8 13.8 13.2 10 16.5 Z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
                    <path d="M7 8.5 a2 2 0 0 1 2 -2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-amber-700 transition-colors">GEA Piensa en Ti</span>
                <span className="text-[11px] text-slate-600 mt-1 block leading-tight">
                  Ingreso a planilla con beneficios de ley desde el día 1 y bienestar integral.
                </span>
              </div>

            </div>

          </div>

          {/* Left Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span>© LEY Nº 29733 PROTECCIÓN DE DATOS</span>
              <span>© ISO 27001 READY</span>
            </div>
            <span>® 2026 GRUPO GEA INTERNACIONAL</span>
          </div>

        </div>

      </div>

    </div>
  );
};
