import React, { useState } from 'react';
import { 
  Rocket, 
  BarChart2, 
  Users, 
  UserCheck, 
  Sparkles, 
  Search, 
  Bell, 
  LogOut, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  IdCard,
  FileText,
  ShieldAlert,
  UserX
} from 'lucide-react';
import { AuthSession } from '../../types';
import { MainAdminTab } from './AdminDashboard';
import { ProcessModuleFilter } from './EvaluarProcessListView';

interface AdminSidebarProps {
  activeTab: MainAdminTab;
  onSelectTab: (tab: MainAdminTab) => void;
  activeModuleFilter?: ProcessModuleFilter;
  onSelectModuleFilter?: (filter: ProcessModuleFilter) => void;
  session: AuthSession;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onOpenArchitecture?: () => void;
  onOpenCandidateView?: () => void;
  onResetProcessDetail?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  activeModuleFilter = 'TODOS',
  onSelectModuleFilter,
  session,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  onOpenArchitecture,
  onOpenCandidateView,
  onResetProcessDetail
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [procesosMenuOpen, setProcesosMenuOpen] = useState(true);
  const [analiticaMenuOpen, setAnaliticaMenuOpen] = useState(true);

  // Iniciales del usuario
  const userInitials = (session.fullName || 'Tania León')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'TL';

  return (
    <aside
      className={`h-screen sticky top-0 z-30 flex flex-col bg-white dark:bg-[#182044] border-r border-[#DDE2EF] dark:border-[#2A3563] transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. HEADER: BRAND + VERSION + COLLAPSE */}
      <div className="p-4 border-b border-[#DDE2EF]/70 dark:border-[#2A3563]/70 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-[#1F2A5E] dark:text-white font-sans">
              evaluar
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#1F2A5E]/10 dark:bg-white/10 text-[#2F5BA8] dark:text-[#5B8AE0]">
              v4.1.2
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5 cursor-pointer transition-colors"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. TENANT SELECTOR: GEA INTERNACIONAL */}
      <div className="p-3 border-b border-[#DDE2EF]/50 dark:border-[#2A3563]/50">
        <button
          type="button"
          className={`w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-[#E9EDF6]/50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title="GEA INTERNACIONAL PERÚ"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1F2A5E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              GI
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#161C3A] dark:text-white truncate leading-tight">
                  GEA INTERNACIONAL...
                </p>
                <p className="text-[10px] text-[#6B7494] dark:text-[#9AA5C4] truncate">
                  Sede Perú Oficial
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && <ExternalLink className="w-3.5 h-3.5 text-[#6B7494] shrink-0" />}
        </button>
      </div>

      {/* 3. QUICK ACTIONS: CTRL+K SEARCH & NOTIFICACIONES */}
      {!isCollapsed && (
        <div className="px-3 pt-3 space-y-1">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => {
              const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-xs text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8] hover:text-[#161C3A] dark:hover:text-white transition-all bg-[#F8FAFC] dark:bg-[#151D3F] cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span className="truncate">Navegación rápida</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-[#DDE2EF] dark:border-[#2A3563]">
              Ctrl K
            </kbd>
          </button>

          {/* Notificaciones */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2F5BA8]" />
              <span>Notificaciones</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#2FA58B]" />
          </button>
        </div>
      )}

      {/* 4. SCROLLABLE NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-medium">
        
        {/* GRUPO 1: SELECCIÓN */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-[#6B7494] uppercase tracking-wider mb-1">
              Selección
            </p>
          )}


          {/* Procesos (Principal) */}
          <div>
            <button
              type="button"
              onClick={() => {
                onSelectTab('PROCESOS');
                setProcesosMenuOpen(!procesosMenuOpen);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'PROCESOS' || activeTab === 'VIRALIZACION' || activeTab === 'TRUST' || activeTab === 'SEGURIDAD'
                  ? 'bg-[#1F2A5E]/10 dark:bg-white/10 text-[#1F2A5E] dark:text-white font-bold shadow-2xs'
                  : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title="Procesos"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Rocket className="w-4 h-4 shrink-0 text-[#1F2A5E] dark:text-[#5B8AE0]" />
                {!isCollapsed && <span className="truncate">Procesos</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${procesosMenuOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Submenú de Procesos (Exacto a Evaluar v4.1.2) */}
            {!isCollapsed && procesosMenuOpen && (
              <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-[#DDE2EF] dark:border-[#2A3563] ml-6 my-1">
                {/* Todos */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PROCESOS');
                    onSelectModuleFilter?.('TODOS');
                    onResetProcessDetail?.();
                  }}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    (activeTab === 'PROCESOS' && activeModuleFilter === 'TODOS')
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Todos
                </button>

                {/* Viralización */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PROCESOS');
                    onSelectModuleFilter?.('VIRALIZACION');
                    onResetProcessDetail?.();
                  }}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    (activeTab === 'PROCESOS' && activeModuleFilter === 'VIRALIZACION') || activeTab === 'VIRALIZACION'
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Viralización
                </button>

                {/* Modulo de evaluación */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PROCESOS');
                    onSelectModuleFilter?.('MODULO_EVALUACION');
                    onResetProcessDetail?.();
                  }}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    (activeTab === 'PROCESOS' && activeModuleFilter === 'MODULO_EVALUACION')
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Modulo de evaluación
                </button>

                {/* Trust */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PROCESOS');
                    onSelectModuleFilter?.('TRUST');
                    onResetProcessDetail?.();
                  }}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    (activeTab === 'PROCESOS' && activeModuleFilter === 'TRUST') || activeTab === 'TRUST'
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Trust
                </button>

                {/* Seguridad */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('PROCESOS');
                    onSelectModuleFilter?.('SEGURIDAD');
                    onResetProcessDetail?.();
                  }}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    (activeTab === 'PROCESOS' && activeModuleFilter === 'SEGURIDAD') || activeTab === 'SEGURIDAD'
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Seguridad
                </button>
              </div>
            )}
          </div>

          {/* Perfiles */}
          <button
            type="button"
            onClick={() => onSelectTab('PERFILES')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'PERFILES'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Perfiles"
          >
            <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'PERFILES' ? 'text-white' : 'text-[#2FA58B]'}`} />
            {!isCollapsed && <span>Perfiles</span>}
          </button>

          {/* Analítica (Con submenú Procesos / Etiquetas - Evaluar v4.1.2) */}
          <div>
            <button
              type="button"
              onClick={() => {
                onSelectTab('ANALITICA');
                setAnaliticaMenuOpen(!analiticaMenuOpen);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ANALITICA'
                  ? 'bg-[#1F2A5E]/10 dark:bg-white/10 text-[#1F2A5E] dark:text-white font-bold shadow-2xs'
                  : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title="Analítica"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BarChart2 className="w-4 h-4 shrink-0 text-[#2F5BA8] dark:text-[#5B8AE0]" />
                {!isCollapsed && <span className="truncate">Analítica</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${analiticaMenuOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {!isCollapsed && analiticaMenuOpen && (
              <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-[#DDE2EF] dark:border-[#2A3563] ml-6 my-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('ANALITICA')}
                  className={`w-full text-left py-1 px-2 text-xs transition-all cursor-pointer block ${
                    activeTab === 'ANALITICA'
                      ? 'border-l-2 border-[#1F2A5E] dark:border-[#5B8AE0] font-bold text-[#1F2A5E] dark:text-[#5B8AE0] -ml-[25px] pl-5'
                      : 'text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white'
                  }`}
                >
                  Procesos
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('ANALITICA')}
                  className="w-full text-left py-1 px-2 text-xs text-[#6B7494] dark:text-[#9AA5C4] hover:text-[#1F2A5E] dark:hover:text-white transition-all cursor-pointer block"
                >
                  Etiquetas
                </button>
              </div>
            )}
          </div>

          {/* Informes */}
          <button
            type="button"
            onClick={() => onSelectTab('INFORMES')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'INFORMES'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Informes"
          >
            <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'INFORMES' ? 'text-white' : 'text-[#2FA58B]'}`} />
            {!isCollapsed && <span>Informes</span>}
          </button>

          {/* Contratados */}
          <button
            type="button"
            onClick={() => onSelectTab('CONTRATADOS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'CONTRATADOS'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Contratados"
          >
            <IdCard className={`w-4 h-4 shrink-0 ${activeTab === 'CONTRATADOS' ? 'text-white' : 'text-[#2FA58B]'}`} />
            {!isCollapsed && <span>Contratados</span>}
          </button>

          {/* No deseados */}
          <button
            type="button"
            onClick={() => onSelectTab('NO_DESEADOS')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'NO_DESEADOS'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="No deseados"
          >
            <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'NO_DESEADOS' ? 'text-white' : 'text-rose-500'}`} />
            {!isCollapsed && <span>No deseados</span>}
          </button>


          {/* Talent Pool */}
          <button
            type="button"
            onClick={() => onSelectTab('TALENT_POOL')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'TALENT_POOL'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Talent Pool"
          >
            <Users className={`w-4 h-4 shrink-0 ${activeTab === 'TALENT_POOL' ? 'text-white' : 'text-[#E4572E]'}`} />
            {!isCollapsed && <span>Talent Pool</span>}
          </button>

          {/* Postulantes (Lista General) */}
          <button
            type="button"
            onClick={() => onSelectTab('POSTULANTES')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'POSTULANTES'
                ? 'bg-[#1F2A5E] text-white font-bold shadow-xs'
                : 'text-[#6B7494] dark:text-[#9AA5C4] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Postulantes"
          >
            <IdCard className={`w-4 h-4 shrink-0 ${activeTab === 'POSTULANTES' ? 'text-white' : 'text-[#2FA58B]'}`} />
            {!isCollapsed && <span>Postulantes</span>}
          </button>
        </div>
      </div>

      {/* 5. FOOTER: USER PROFILE & ACTIONS */}
      <div className="p-3 border-t border-[#DDE2EF] dark:border-[#2A3563] space-y-2 bg-[#F8FAFC] dark:bg-[#151D3F]">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* User Avatar with Characteristic Orange/Navy */}
            <div className="w-8 h-8 rounded-full bg-[#F28C28] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white dark:ring-[#182044]">
              {userInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#161C3A] dark:text-white truncate">
                  {session.fullName || 'Tania León'}
                </p>
                <p className="text-[10px] text-[#6B7494] truncate">
                  {session.role === 'SUPER_ADMIN' ? 'Super Administrador' : 'Líder Selección'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              {/* Dark mode button */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#1F2A5E] dark:hover:text-white hover:bg-[#E9EDF6]/60 dark:hover:bg-white/10 cursor-pointer"
                title={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#E4572E] hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
