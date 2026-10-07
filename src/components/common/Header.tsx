import React, { useState, useEffect, useRef } from 'react';
import { 
  User,
  Sun, 
  Moon, 
  LogOut, 
  Bell, 
  HelpCircle, 
  BarChart2, 
  Users, 
  Rocket, 
  ChevronDown,
  Building2
} from 'lucide-react';
import { Candidate, AuthSession } from '../../types';

interface HeaderProps {
  authSession: AuthSession;
  currentView: 'CANDIDATE' | 'ADMIN' | 'ARCHITECTURE';
  onViewChange: (view: 'CANDIDATE' | 'ADMIN' | 'ARCHITECTURE') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  candidates: Candidate[];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
  onLogout: () => void;
  activeAdminTab?: string;
  onSelectAdminTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  authSession,
  currentView,
  onViewChange,
  isDarkMode,
  onToggleDarkMode,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onLogout,
  activeAdminTab = 'PROCESOS',
  onSelectAdminTab
}) => {
  const isAdmin = authSession.role === 'ADMIN' || authSession.role === 'SUPER_ADMIN';
  const isSuperAdmin = authSession.role === 'SUPER_ADMIN';

  const [showSessionPanel, setShowSessionPanel] = useState(false);
  const sessionPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sessionPanelRef.current && !sessionPanelRef.current.contains(e.target as Node)) {
        setShowSessionPanel(false);
      }
    };
    if (showSessionPanel) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSessionPanel]);

  const handleTabClick = (tab: string) => {
    onSelectAdminTab?.(tab);
    if (currentView !== 'ADMIN') {
      onViewChange('ADMIN');
    }
  };

  return (
    <header className={`w-full bg-white dark:bg-[#182044] border-b border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs transition-colors ${isAdmin ? 'sticky top-0 z-40' : 'relative z-20'}`}>
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
          
          {/* BRAND LOGO: EXACT GEA PERÚ + EvaluarGEA */}
          <div className="flex items-center gap-7">
            <div 
              onClick={() => isAdmin && handleTabClick('PROCESOS')}
              className={`flex items-center select-none ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ gap: '10px' }}
            >
              {/* GEA Perú Logo: ~46x46px, object-fit: contain, rounded corners, white background */}
              <img 
                src="/gea-logo.svg" 
                alt="Logo GEA Perú" 
                className="w-[46px] h-[46px] object-contain rounded-md bg-white p-0.5 shadow-2xs shrink-0"
                style={{ objectFit: 'contain' }}
              />

              {/* Brand Text: EvaluarGEA (~21px bold, Evaluar navy #1F2A5E, GEA medium blue #2F5BA8) */}
              <div className="flex items-baseline font-bold text-[21px] leading-none tracking-tight select-none">
                <span className="text-[#1F2A5E] dark:text-white">
                  Evaluar
                </span>
                <span className="text-[#2F5BA8] dark:text-[#5B8AE0]">
                  GEA
                </span>
                {!isAdmin && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EDF6] text-[#1F2A5E] border border-[#DDE2EF] hidden sm:inline-block">
                    Evaluación Oficial
                  </span>
                )}
              </div>
            </div>

            {/* RECRUITER NAVIGATION TABS MATCHING TARGET DESIGN */}
            {isAdmin ? (
              <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-semibold">
                
                {/* 1. Analítica */}
                <button
                  type="button"
                  onClick={() => handleTabClick('ANALITICA')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeAdminTab === 'ANALITICA'
                      ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                      : 'text-[#6B7494] hover:text-[#1F2A5E] hover:bg-[#E9EDF6]/60 dark:text-[#9AA5C4] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <BarChart2 className={`w-4 h-4 ${activeAdminTab === 'ANALITICA' ? 'text-white' : 'text-[#6B7494]'}`} />
                  <span>Analítica</span>
                </button>

                {/* 2. Perfiles */}
                <button
                  type="button"
                  onClick={() => handleTabClick('PERFILES')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeAdminTab === 'PERFILES'
                      ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                      : 'text-[#6B7494] hover:text-[#1F2A5E] hover:bg-[#E9EDF6]/60 dark:text-[#9AA5C4] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <User className={`w-4 h-4 ${activeAdminTab === 'PERFILES' ? 'text-white' : 'text-[#6B7494]'}`} />
                  <span>Perfiles</span>
                </button>

                {/* 3. Procesos */}
                <button
                  type="button"
                  onClick={() => handleTabClick('PROCESOS')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeAdminTab === 'PROCESOS'
                      ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                      : 'text-[#6B7494] hover:text-[#1F2A5E] hover:bg-[#E9EDF6]/60 dark:text-[#9AA5C4] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <Rocket className={`w-4 h-4 ${activeAdminTab === 'PROCESOS' ? 'text-white' : 'text-[#6B7494]'}`} />
                  <span>Procesos</span>
                </button>

                {/* 4. Talent Pool */}
                <button
                  type="button"
                  onClick={() => handleTabClick('TALENT_POOL')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeAdminTab === 'TALENT_POOL'
                      ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                      : 'text-[#6B7494] hover:text-[#1F2A5E] hover:bg-[#E9EDF6]/60 dark:text-[#9AA5C4] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  <Users className={`w-4 h-4 ${activeAdminTab === 'TALENT_POOL' ? 'text-white' : 'text-[#6B7494]'}`} />
                  <span>Talent Pool</span>
                </button>
              </nav>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1F2A5E] dark:text-[#7DA4FF] px-3 py-1.5 rounded-lg bg-[#E9EDF6] dark:bg-white/10">
                  Procesos invitados
                </span>
              </div>
            )}
          </div>

          {/* RIGHT UTILITIES: Bell, Question, Organization Pill, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {isAdmin ? (
              <>
                {/* Notification Bell with accent dot */}
                <button
                  type="button"
                  className="p-2 text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white cursor-pointer relative"
                  title="Notificaciones"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-1.5 h-1.5 bg-[#2F5BA8] rounded-full absolute top-2 right-2" />
                </button>

                {/* Help Question Icon in round circle */}
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-[#E9EDF6] dark:bg-zinc-800 text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Ayuda"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>

                {/* Session Trigger & Dropdown Container */}
                <div className="relative flex items-center gap-2">
                  
                  {/* Tenant Pill: Bienvenido a: GEA INTERNACIONAL... */}
                  <div 
                    onClick={() => setShowSessionPanel(prev => !prev)}
                    className="hidden md:flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] hover:border-[#2F5BA8]/40 rounded-xl text-xs shadow-2xs cursor-pointer select-none transition-colors"
                  >
                    <div className="w-6 h-5 rounded-md bg-[#2F5BA8]/10 text-[#2F5BA8] flex items-center justify-center font-bold text-[10px]">
                      ⚙️
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-[#6B7494] block font-normal">Bienvenido a:</span>
                      <span className="font-extrabold text-[#1F2A5E] dark:text-[#5B8AE0] truncate max-w-[130px] block">
                        GEA INTERNACION...
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#6B7494] ml-0.5" />
                  </div>

                  {/* Avatar LT (coral) */}
                  <div 
                    onClick={() => setShowSessionPanel(prev => !prev)}
                    className="flex items-center gap-1.5 cursor-pointer select-none group"
                  >
                    <div 
                      className="w-8 h-8 rounded-full bg-[#E4572E] hover:opacity-90 text-white flex items-center justify-center font-bold text-xs select-none shadow-2xs transition-opacity"
                      title="Lic. Tania León • Selección y Talento Humano (LT)"
                    >
                      LT
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#6B7494] group-hover:text-[#1F2A5E]" />
                  </div>

                  {/* PANEL DE SESIÓN DESPLEGABLE (Ancho ~370px, esquinas redondeadas 20px, sombra suave) */}
                  {showSessionPanel && (
                    <div 
                      ref={sessionPanelRef}
                      className="absolute right-0 top-11 sm:top-12 z-50 w-[370px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-[20px] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 font-sans"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Avatar LT grande + Información del usuario */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-[#E4572E] text-white flex items-center justify-center font-extrabold text-base tracking-wide shrink-0 shadow-xs">
                          LT
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-bold text-sm text-[#161C3A] dark:text-white truncate">
                            Lic. Tania León • Selección y …
                          </h4>
                          <p className="text-xs text-[#6B7494] truncate">
                            seleccion@geaperu.pe
                          </p>
                          <p className="text-xs font-semibold text-[#2F5BA8] dark:text-blue-300 truncate">
                            Líder de Selección y Talento Humano
                          </p>
                        </div>
                      </div>

                      {/* Tarjeta Empresa asignada */}
                      <div className="bg-[#EEF1FA] dark:bg-[#151D3F] rounded-2xl p-3.5 border border-[#DDE2EF]/80 dark:border-[#2A3563]/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#6B7494] font-medium">
                          <span>Empresa asignada:</span>
                          <span className="font-mono">RUC 20512849182</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#161C3A] dark:text-white">
                          <span className="text-base">🏢</span>
                          <span>GEA INTERNACIONAL SAC</span>
                        </div>
                      </div>


                      {/* Opción 2: Cierre de sesión */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowSessionPanel(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#E4572E]">
                              Cierre de sesión
                            </div>
                            <div className="text-[11px] text-[#6B7494]">
                              Salir del sistema de forma segura
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                </div>
              </>
            ) : (
              /* CANDIDATE AVATAR & INFO CON PANEL DE SESIÓN */
              <div className="relative flex items-center gap-2">
                <div 
                  onClick={() => setShowSessionPanel(prev => !prev)}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div 
                    className="w-8 h-8 rounded-full bg-[#1F2A5E] text-white flex items-center justify-center font-bold text-xs select-none shadow-2xs group-hover:opacity-90 transition-opacity"
                    title={authSession.fullName}
                  >
                    {authSession.fullName ? authSession.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'P'}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <span className="font-semibold text-[#161C3A] dark:text-zinc-200 block truncate max-w-[140px]">
                      {authSession.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#6B7494] block">Postulante</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#6B7494] group-hover:text-[#1F2A5E]" />
                </div>

                {/* PANEL DE SESIÓN DESPLEGABLE DEL POSTULANTE */}
                {showSessionPanel && (
                  <div 
                    ref={sessionPanelRef}
                    className="absolute right-0 top-11 sm:top-12 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-[20px] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 font-sans"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#1F2A5E] text-white flex items-center justify-center font-extrabold text-base tracking-wide shrink-0 shadow-xs">
                        {authSession.fullName ? authSession.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'P'}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-sm text-[#161C3A] dark:text-white truncate">
                          {authSession.fullName}
                        </h4>
                        <p className="text-xs text-[#6B7494] truncate">
                          {authSession.email || 'Postulante registrado'}
                        </p>
                        <p className="text-xs font-semibold text-[#2FA58B] truncate">
                          DNI: {authSession.dni || '-'} • Postulante Oficial
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#EEF1FA] dark:bg-[#151D3F] rounded-2xl p-3.5 border border-[#DDE2EF]/80 dark:border-[#2A3563]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#6B7494] font-medium">
                        <span>Convocado por:</span>
                        <span className="font-mono">GEA Perú</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#161C3A] dark:text-white">
                        <span className="text-base">🏢</span>
                        <span>GEA INTERNACIONAL SAC</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSessionPanel(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#E4572E]">
                            Cierre de sesión
                          </div>
                          <div className="text-[11px] text-[#6B7494]">
                            Salir de la evaluación de forma segura
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Demo Utilities: Simulator, Dark Mode, Logout */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#DDE2EF] dark:border-[#2A3563]">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onViewChange(currentView === 'ADMIN' ? 'CANDIDATE' : 'ADMIN')}
                  className="hidden xl:flex px-2 py-1 rounded-lg text-xs font-semibold text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white hover:bg-[#E9EDF6]/60 cursor-pointer"
                >
                  <span>{currentView === 'CANDIDATE' ? 'Ver Admin' : 'Simulador'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white cursor-pointer"
                title="Modo Oscuro"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#F28C28]" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#E4572E] cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* GRADIENT LINE UNDER NAVBAR: azul → verde → naranja → rojo */}
      <div className="gea-gradient-line" />
    </header>
  );
};
