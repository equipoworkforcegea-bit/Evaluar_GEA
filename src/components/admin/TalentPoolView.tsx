import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  ChevronDown, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Send,
  Plus
} from 'lucide-react';
import { MainAdminTab } from './AdminDashboard';
import { Candidate } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';

export interface CandidateProfile {
  id: string;
  name: string;
  age: number;
  initials: string;
  profileType: 'Servicial' | 'Resolutivo' | 'Influenciador';
  currentRole: string;
  company: string;
  dates: string;
  degree: string;
  university: string;
  studyStatus: 'TERMINADO' | 'CURSANDO';
  location: string;
  salaryExpectation: string;
  phone: string;
  isSelected?: boolean;
}

function mapCandidateToProfile(c: Candidate, index: number): CandidateProfile {
  const parts = (c.fullName || 'Postulante').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : ((c.fullName || 'CP').slice(0, 2).toUpperCase());

  const profileTypes: ('Servicial' | 'Resolutivo' | 'Influenciador')[] = ['Servicial', 'Resolutivo', 'Influenciador'];
  const profileType = profileTypes[index % profileTypes.length];

  const dniNum = parseInt(c.dni?.slice(-2) || '0', 10);
  const age = 21 + (isNaN(dniNum) ? (index % 12) : (dniNum % 16));

  return {
    id: c.id,
    name: c.fullName,
    age,
    initials,
    profileType,
    currentRole: c.position || 'Asesor de Operaciones',
    company: 'GEA Perú',
    dates: c.invitedAt 
      ? `${new Date(c.invitedAt).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })} - presente` 
      : 'ene 2026 - presente',
    degree: 'Administración y Gestión',
    university: 'Universidad de Lima',
    studyStatus: 'TERMINADO',
    location: 'Lima, Perú',
    salaryExpectation: `$ ${1100 + (index % 5) * 120}`,
    phone: c.phone || '+51 987 654 321'
  };
}

const INITIAL_TALENT_CANDIDATES: CandidateProfile[] = [
  {
    id: 'talent-1',
    name: 'Shirley briggitte Olivera rojas',
    age: 23,
    initials: 'SB',
    profileType: 'Servicial',
    currentRole: 'Asesora de Telecomunicaciones',
    company: 'Claro',
    dates: 'jul 2026 - sep 2026',
    degree: 'Administración',
    university: 'Universidad Señor de Sipán',
    studyStatus: 'TERMINADO',
    location: 'Chiclayo, Perú',
    salaryExpectation: '$ 1,230',
    phone: '+51 987 654 321'
  },
  {
    id: 'talent-2',
    name: 'Erick daniel Galarza aliaga',
    age: 34,
    initials: 'EG',
    profileType: 'Resolutivo',
    currentRole: 'Asesor de Ventas & Retenciones',
    company: 'Selcoin',
    dates: 'ene 2024 - presente',
    degree: 'Ciencias de la Comunicación',
    university: 'Universidad de Lima',
    studyStatus: 'TERMINADO',
    location: 'Lima, Perú',
    salaryExpectation: '$ 1,100',
    phone: '+51 912 345 678'
  },
  {
    id: 'talent-3',
    name: 'Mariana Paredes Castro',
    age: 26,
    initials: 'MP',
    profileType: 'Influenciador',
    currentRole: 'Coordinadora de BPO & Atención',
    company: 'Entel',
    dates: 'feb 2025 - presente',
    degree: 'Ingeniería Industrial',
    university: 'UPC',
    studyStatus: 'TERMINADO',
    location: 'Lima, Perú',
    salaryExpectation: '$ 1,450',
    phone: '+51 934 567 890'
  },
  {
    id: 'talent-4',
    name: 'Carlos Mendoza Quispe',
    age: 22,
    initials: 'CM',
    profileType: 'Servicial',
    currentRole: 'Teleoperador de Soporte',
    company: 'Telefónica',
    dates: 'ago 2025 - dic 2025',
    degree: 'Computación e Informática',
    university: 'Cibertec',
    studyStatus: 'CURSANDO',
    location: 'Chiclayo, Perú',
    salaryExpectation: '$ 980',
    phone: '+51 945 678 123'
  },
  {
    id: 'talent-5',
    name: 'Valeria Chumpitaz Flores',
    age: 29,
    initials: 'VC',
    profileType: 'Resolutivo',
    currentRole: 'Supervisora de Atención al Cliente',
    company: 'Claro',
    dates: 'mar 2023 - presente',
    degree: 'Psicología Organizacional',
    university: 'Universidad San Martín de Porres',
    studyStatus: 'TERMINADO',
    location: 'Lima, Perú',
    salaryExpectation: '$ 1,600',
    phone: '+51 965 432 109'
  }
];

interface TalentPoolViewProps {
  candidates?: Candidate[];
  onTabChange: (tab: MainAdminTab) => void;
  onOpenSimulator?: () => void;
  onCreateProcess?: () => void;
}

export const TalentPoolView: React.FC<TalentPoolViewProps> = ({
  candidates: candidatesProp,
  onTabChange,
  onOpenSimulator,
  onCreateProcess
}) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    if (candidatesProp && candidatesProp.length > 0) {
      return candidatesProp.map((c, i) => mapCandidateToProfile(c, i));
    }
    return INITIAL_TALENT_CANDIDATES;
  });

  // Sincronizar candidatos reales desde la base de datos o prop
  useEffect(() => {
    if (candidatesProp && candidatesProp.length > 0) {
      setCandidates(candidatesProp.map((c, i) => mapCandidateToProfile(c, i)));
    } else {
      CandidateDataService.getCandidates().then(dbList => {
        if (dbList && dbList.length > 0) {
          setCandidates(dbList.map((c, i) => mapCandidateToProfile(c, i)));
        }
      }).catch(err => {
        console.warn('[TalentPoolView] No se pudo cargar candidatos de Supabase:', err);
      });
    }
  }, [candidatesProp]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [baseMode, setBaseMode] = useState<'MI_BASE' | 'TALENT_POOL'>('TALENT_POOL');
  const [sortOrder, setSortOrder] = useState('Relevancia');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleFilter = (filterLabel: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterLabel)
        ? prev.filter(f => f !== filterLabel)
        : [...prev, filterLabel]
    );
  };

  const handleToggleSelectCandidate = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c.id));
    }
  };

  const handleInviteCandidate = (c: CandidateProfile) => {
    showToast(`✓ Invitación despachada a ${c.name} para "Postpago Chile Prueba".`);
  };

  const handleWhatsApp = (c: CandidateProfile) => {
    const text = encodeURIComponent(`Hola ${c.name}, te saludamos de GEA Perú para convocarte al proceso de selección.`);
    window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return candidates;
    const q = searchTerm.toLowerCase();
    return candidates.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.currentRole.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.degree.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }, [candidates, searchTerm]);

  return (
    <div className="space-y-5 font-sans text-[#161C3A] dark:text-[#F0F4FF] pb-12 animate-in fade-in">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1F2A5E] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 border border-[#2F5BA8]/40 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2FA58B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* a) ENCABEZADO OFICIAL TALENT POOL                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          {/* Top Line & Convocatoria Tag */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold text-[#1F2A5E] dark:text-blue-300 uppercase tracking-wider">
              EVALUARGEA • PANEL DE SELECCIÓN Y RECLUTAMIENTO
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF1FA] dark:bg-[#151D3F] text-[#2F5BA8] dark:text-blue-300 border border-[#DDE2EF] dark:border-[#2A3563]">
              Convocatoria Activa: POSTPAGO CHILE PRUEBA 2026 09 28
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2A5E] dark:text-white tracking-tight">
            Gestión de Evaluaciones y Candidatos
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#6B7494] dark:text-[#9AA5C4]">
            Puesto: <strong className="text-[#161C3A] dark:text-zinc-200">Postpago Chile Prueba</strong> • 3 etapas (45 min) • Capacidad 1.000 concurrentes
          </p>
        </div>

        {/* Right Buttons: + Generar Proceso & Simular Examen › */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCreateProcess || (() => showToast('Abriendo asistente de creación de proceso...'))}
            className="px-4 py-2.5 rounded-xl bg-[#2F5BA8] hover:bg-[#254A8C] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Generar Proceso</span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulator || (() => onTabChange('PROCESOS'))}
            className="px-4 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#161E42] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-98"
          >
            <span>Simular Examen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* b) TARJETA DE MÓDULOS (Analítica, Perfiles, Procesos, Talent Pool)          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 items-center">
          
          {/* 1. Analítica */}
          <button
            type="button"
            onClick={() => onTabChange('ANALITICA')}
            className="p-2.5 sm:p-3 rounded-xl border border-transparent hover:border-[#DDE2EF] dark:hover:border-[#2A3563] hover:bg-[#EEF1FA]/60 dark:hover:bg-white/5 flex items-center justify-between text-left cursor-pointer transition-all"
          >
            <span className="text-xs sm:text-sm font-bold text-[#161C3A] dark:text-zinc-200">
              Analítica
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EEF1FA] dark:bg-[#151D3F] text-[#2F5BA8] dark:text-blue-300 font-semibold border border-[#DDE2EF]/60">
              Dashboards & Tablas
            </span>
          </button>

          {/* 2. Perfiles */}
          <button
            type="button"
            onClick={() => onTabChange('PERFILES')}
            className="p-2.5 sm:p-3 rounded-xl border border-transparent hover:border-[#DDE2EF] dark:hover:border-[#2A3563] hover:bg-[#EEF1FA]/60 dark:hover:bg-white/5 flex items-center justify-between text-left cursor-pointer transition-all"
          >
            <span className="text-xs sm:text-sm font-bold text-[#161C3A] dark:text-zinc-200">
              Perfiles
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EEF1FA] dark:bg-[#151D3F] text-[#2F5BA8] dark:text-blue-300 font-semibold border border-[#DDE2EF]/60">
              6 perfiles
            </span>
          </button>

          {/* 3. Procesos */}
          <button
            type="button"
            onClick={() => onTabChange('PROCESOS')}
            className="p-2.5 sm:p-3 rounded-xl border border-transparent hover:border-[#DDE2EF] dark:hover:border-[#2A3563] hover:bg-[#EEF1FA]/60 dark:hover:bg-white/5 flex items-center justify-between text-left cursor-pointer transition-all"
          >
            <span className="text-xs sm:text-sm font-bold text-[#161C3A] dark:text-zinc-200">
              Procesos
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EEF1FA] dark:bg-[#151D3F] text-[#2F5BA8] dark:text-blue-300 font-semibold border border-[#DDE2EF]/60">
              6 activos
            </span>
          </button>

          {/* 4. Talent Pool (ACTIVE HIGHLIGHT) */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#1F2A5E] text-white flex items-center justify-between shadow-2xs border border-[#1F2A5E]">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <span className="text-amber-400">✦</span>
              <span>Talent Pool</span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold tracking-wide">
              6M+ CVs
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* c) BANNER CON DEGRADADO AZUL MARINO → AZUL MEDIO                          */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-4 sm:p-5 text-center text-white bg-gradient-to-r from-[#1F2A5E] via-[#243572] to-[#2F5BA8] shadow-xs">
        <p className="text-sm sm:text-base font-semibold">
          Encuentra a tu candidato ideal entre más de <strong className="font-extrabold underline decoration-[#2FA58B] decoration-2 underline-offset-4">6 millones de CVs.</strong>
        </p>
      </div>

      {/* ========================================================================= */}
      {/* d) BARRA DE FILTROS APLICADOS                                             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] px-4 py-3 text-xs text-[#6B7494] dark:text-[#9AA5C4] shadow-2xs flex flex-wrap items-center gap-2">
        {selectedFilters.length === 0 ? (
          <span>Aquí se mostrarán todos los filtros que apliques en tu búsqueda</span>
        ) : (
          <>
            <span className="font-semibold text-[#1F2A5E] dark:text-white">Filtros activos:</span>
            {selectedFilters.map(f => (
              <span 
                key={f} 
                className="px-2.5 py-1 rounded-lg bg-[#EEF1FA] dark:bg-[#151D3F] text-[#2F5BA8] dark:text-blue-300 font-semibold flex items-center gap-1 border border-[#DDE2EF] dark:border-[#2A3563]"
              >
                <span>{f}</span>
                <button 
                  type="button" 
                  onClick={() => handleToggleFilter(f)} 
                  className="hover:text-[#E4572E] ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setSelectedFilters([])}
              className="text-[11px] text-[#E4572E] hover:underline font-semibold ml-2 cursor-pointer"
            >
              Limpiar filtros
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* e) DOS COLUMNAS: IZQUIERDA (~330px) + DERECHA (CVs)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ================== COLUMNA IZQUIERDA: FILTROS (~330px) ================== */}
        <aside className="w-full lg:w-[330px] shrink-0 space-y-4">
          
          {/* 1. Selector: Mi Base | Talent Pool */}
          <div className="bg-white dark:bg-[#182044] p-1.5 rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setBaseMode('MI_BASE')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                baseMode === 'MI_BASE'
                  ? 'bg-[#EEF1FA] dark:bg-[#151D3F] text-[#1F2A5E] dark:text-white shadow-2xs font-bold border border-[#DDE2EF] dark:border-[#2A3563]'
                  : 'text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white'
              }`}
            >
              Mi Base
            </button>
            <button
              type="button"
              onClick={() => setBaseMode('TALENT_POOL')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                baseMode === 'TALENT_POOL'
                  ? 'bg-[#EEF1FA] dark:bg-[#151D3F] text-[#1F2A5E] dark:text-white shadow-2xs font-bold border border-[#DDE2EF] dark:border-[#2A3563]'
                  : 'text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white font-semibold'
              }`}
            >
              <span className="text-[#2FA58B] font-bold">✦</span>
              <span>Talent Pool</span>
            </button>
          </div>

          {/* 2. Buscador */}
          <div className="bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-2xl px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Busca a tu candidato ideal"
              className="w-full text-xs text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none bg-transparent"
            />
            <span className="text-[#2F5BA8] text-sm shrink-0 pl-2">🔍</span>
          </div>

          {/* 3. Tarjeta de Filtros con Casillas y Contadores */}
          <div className="bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-2xl p-5 shadow-2xs space-y-6">
            
            {/* Grupo 1: Cargo (Función Laboral) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#161C3A] dark:text-white">
                Cargo (Función Laboral)
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Atención al cliente', count: 88 },
                  { label: 'Cajera', count: 26 },
                  { label: 'Teleoperadora', count: 18 },
                  { label: 'Asesor de ventas', count: 17 },
                  { label: 'Teleoperador', count: 15 }
                ].map(item => {
                  const isChecked = selectedFilters.includes(item.label);
                  return (
                    <label 
                      key={item.label}
                      className="flex items-center justify-between cursor-pointer hover:text-[#1F2A5E] dark:hover:text-white group select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFilter(item.label)}
                          className="w-4 h-4 rounded-md border-[#DDE2EF] text-[#1F2A5E] focus:ring-[#2F5BA8] cursor-pointer"
                        />
                        <span className={`text-xs ${isChecked ? 'font-bold text-[#1F2A5E] dark:text-white' : 'text-[#161C3A] dark:text-zinc-300'}`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7494] font-medium">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Grupo 2: Área de Experiencia */}
            <div className="space-y-3 pt-4 border-t border-[#DDE2EF]/80 dark:border-[#2A3563]/80">
              <h3 className="text-xs font-bold text-[#161C3A] dark:text-white">
                Área de Experiencia
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Telecomunicaciones & BPO', count: 42 },
                  { label: 'Ventas y Comercial', count: 31 },
                  { label: 'Atención al Cliente', count: 29 },
                  { label: 'Operaciones & Logística', count: 18 }
                ].map(item => {
                  const isChecked = selectedFilters.includes(item.label);
                  return (
                    <label 
                      key={item.label}
                      className="flex items-center justify-between cursor-pointer hover:text-[#1F2A5E] dark:hover:text-white group select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFilter(item.label)}
                          className="w-4 h-4 rounded-md border-[#DDE2EF] text-[#1F2A5E] focus:ring-[#2F5BA8] cursor-pointer"
                        />
                        <span className={`text-xs ${isChecked ? 'font-bold text-[#1F2A5E] dark:text-white' : 'text-[#161C3A] dark:text-zinc-300'}`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7494] font-medium">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Grupo 3: Ubicación/Ciudad */}
            <div className="space-y-3 pt-4 border-t border-[#DDE2EF]/80 dark:border-[#2A3563]/80">
              <h3 className="text-xs font-bold text-[#161C3A] dark:text-white">
                Ubicación/Ciudad
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Chiclayo', count: 18 },
                  { label: 'Lima', count: 52 },
                  { label: 'Arequipa', count: 14 },
                  { label: 'Trujillo', count: 9 }
                ].map(item => {
                  const isChecked = selectedFilters.includes(item.label);
                  return (
                    <label 
                      key={item.label}
                      className="flex items-center justify-between cursor-pointer hover:text-[#1F2A5E] dark:hover:text-white group select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFilter(item.label)}
                          className="w-4 h-4 rounded-md border-[#DDE2EF] text-[#1F2A5E] focus:ring-[#2F5BA8] cursor-pointer"
                        />
                        <span className={`text-xs ${isChecked ? 'font-bold text-[#1F2A5E] dark:text-white' : 'text-[#161C3A] dark:text-zinc-300'}`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7494] font-medium">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

        </aside>

        {/* ================== COLUMNA DERECHA: RESULTADOS & CVs ================== */}
        <section className="flex-1 min-w-0 space-y-3.5 w-full">
          
          {/* Barra de Herramientas */}
          <div className="bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            
            {/* Left side tools */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === candidates.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded-md border-[#DDE2EF] text-[#1F2A5E] focus:ring-[#2F5BA8] cursor-pointer"
                title="Seleccionar todos"
              />

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Seleccionar</span>
                <ChevronDown className="w-3 h-3 text-[#6B7494]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    showToast('Selecciona al menos un candidato para aplicar.');
                  } else {
                    showToast(`✓ Aplicando acción sobre ${selectedIds.length} candidatos seleccionados.`);
                  }
                }}
                className="px-3.5 py-1 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white font-medium cursor-pointer transition-colors"
              >
                Aplicar
              </button>

              <span className="font-bold text-[#161C3A] dark:text-white pl-2">
                4,377 CVs encontrados
              </span>
            </div>

            {/* Right side: Ordenar */}
            <div className="flex items-center gap-1.5 text-xs text-[#6B7494]">
              <span>Ordenar:</span>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'Relevancia' ? 'Fecha' : 'Relevancia')}
                className="px-3 py-1 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#161C3A] dark:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>{sortOrder}</span>
                <ChevronDown className="w-3 h-3 text-[#6B7494]" />
              </button>
            </div>

          </div>

          {/* ================== LISTADO DE TARJETAS DE CANDIDATOS ================== */}
          <div className="space-y-3">
            {filteredCandidates.map((candidate) => {
              const isSelected = selectedIds.includes(candidate.id);

              return (
                <div
                  key={candidate.id}
                  className={`bg-white dark:bg-[#182044] border rounded-2xl p-4 sm:p-5 shadow-2xs transition-all ${
                    isSelected 
                      ? 'border-[#2F5BA8] ring-1 ring-[#2F5BA8]/20 bg-[#EEF1FA]/20' 
                      : 'border-[#DDE2EF] dark:border-[#2A3563] hover:border-[#2F5BA8]/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    
                    {/* 1. Casilla de selección */}
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectCandidate(candidate.id)}
                        className="w-4 h-4 rounded-md border-[#DDE2EF] text-[#1F2A5E] focus:ring-[#2F5BA8] cursor-pointer"
                      />
                    </div>

                    {/* 2. Avatar circular verde con iniciales + Indicador de perfil */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#2FA58B] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-2xs">
                        {candidate.initials}
                      </div>

                      {/* Indicador de perfil con punto multicolor y etiqueta subrayada en verde */}
                      <div className="mt-1.5 flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#E4572E] via-[#F28C28] to-[#2FA58B] inline-block shadow-2xs" />
                          <span className="text-[10px] font-bold text-[#1F2A5E] dark:text-zinc-200">
                            {candidate.profileType}
                          </span>
                        </div>
                        <div className="w-full h-[2px] bg-[#2FA58B] mt-0.5 rounded-full" />
                      </div>
                    </div>

                    {/* 3. Datos del candidato */}
                    <div className="flex-1 min-w-0 space-y-1">
                      
                      {/* Nombre y Edad */}
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-[#161C3A] dark:text-white capitalize">
                          {candidate.name}
                        </h4>
                        <span className="text-xs text-[#6B7494] font-medium">
                          | {candidate.age} años
                        </span>
                      </div>

                      {/* Cargo | Empresa (link azul) | Fechas */}
                      <p className="text-xs text-[#161C3A] dark:text-zinc-300">
                        <strong className="font-semibold">{candidate.currentRole}</strong>
                        {' '}|{' '}
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); showToast(`Empresa: ${candidate.company}`); }}
                          className="text-[#2F5BA8] hover:underline font-semibold"
                        >
                          {candidate.company}
                        </a>
                        {' '}|{' '}
                        <span className="text-[#6B7494]">{candidate.dates}</span>
                      </p>

                      {/* Carrera | Universidad (link azul) | Estado */}
                      <p className="text-xs text-[#161C3A] dark:text-zinc-300">
                        <span>{candidate.degree}</span>
                        {' '}|{' '}
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); showToast(`Centro de estudios: ${candidate.university}`); }}
                          className="text-[#2F5BA8] hover:underline font-semibold"
                        >
                          {candidate.university}
                        </a>
                        {' '}|{' '}
                        <span className="text-[#6B7494] font-bold text-[11px]">
                          {candidate.studyStatus}
                        </span>
                      </p>

                      {/* Ubicación */}
                      <p className="text-xs text-[#6B7494]">
                        {candidate.location}
                      </p>

                      {/* Pretensión Salarial ($) */}
                      <div className="pt-1.5">
                        <span className="font-extrabold text-sm sm:text-base text-[#161C3A] dark:text-white">
                          {candidate.salaryExpectation}
                        </span>
                      </div>

                    </div>

                    {/* 4. Botones de Acción (WhatsApp verde suave + Invitar azul marino) */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 self-center sm:self-end">
                      
                      {/* Botón WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(candidate)}
                        className="w-9 h-9 rounded-xl bg-[#2FA58B]/15 hover:bg-[#2FA58B]/25 text-[#2FA58B] flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                        title="Contactar vía WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 fill-[#2FA58B]" />
                      </button>

                      {/* Botón Invitar a Proceso */}
                      <button
                        type="button"
                        onClick={() => handleInviteCandidate(candidate)}
                        className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#161E42] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors active:scale-98"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Invitar a Proceso</span>
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </section>

      </div>

    </div>
  );
};
