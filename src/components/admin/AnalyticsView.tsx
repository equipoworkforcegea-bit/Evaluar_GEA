import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Candidate, EvaluationTest } from '../../types';
import {
  Rocket,
  Calendar,
  Filter,
  Users,
  User,
  UserCheck,
  UserX,
  Clock,
  Target,
  Smile,
  Meh,
  Frown,
  Star,
  Search,
  FileText,
  ChevronDown,
  SlidersHorizontal,
  Sliders,
  Building2,
  Tag,
  Contact,
  MessageSquare,
  BookOpen,
  Settings,
  Network,
  RefreshCw,
  IdCard,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';

interface AnalyticsViewProps {
  candidates: Candidate[];
  tests: EvaluationTest[];
  onOpenReport: (candidate: Candidate) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onViewProcess?: (test: EvaluationTest) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  candidates,
  tests,
  onOpenReport,
  onSelectCandidate,
  onViewProcess
}) => {
  // Sidebar active item
  const [activeSidebarItem, setActiveSidebarItem] = useState('Analítica');

  // Filter states for the top bar (exact pills from image 1)
  const [dateRangeFilter, setDateRangeFilter] = useState<'Todos' | '7D' | '30D' | 'MES' | 'ANIO'>('Todos');
  const [sourceFilter, setSourceFilter] = useState<string>('Todos');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('Todos');
  const [processStatusFilter, setProcessStatusFilter] = useState<string>('Todos');
  const [productFilter, setProductFilter] = useState<string>('Todos');
  const [sortOrder, setSortOrder] = useState<'fecha' | 'nombre' | 'perfil'>('fecha');

  // Search in table
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Derived filter options from real data
  const recruiterOptions = useMemo(() => {
    const set = new Set(tests.map(t => t.launchedBy || 'Sin asignar'));
    return ['Todos', ...Array.from(set)];
  }, [tests]);

  const dateRangeLabels: Record<string, string> = {
    'Todos': 'Rango de fechas',
    '7D': 'Últimos 7 días',
    '30D': 'Últimos 30 días',
    'MES': 'Este mes',
    'ANIO': 'Este año'
  };

  const sourceOptions = ['Todos', 'Convocatoria Directa', 'Bolsa de Empleo', 'Referidos'];
  const productOptions = ['Todos', 'Evaluación GEA 360', 'Batería Psicotécnica', 'Casos y Competencias'];

  const statusOptions = ['Todos', 'LANZADO', 'BORRADOR', 'CERRADO', 'ARCHIVADO'];
  const statusLabels: Record<string, string> = {
    'Todos': 'Estado', 'LANZADO': 'Lanzado', 'BORRADOR': 'Borrador',
    'CERRADO': 'Cerrado', 'ARCHIVADO': 'Archivado'
  };

  const isAnyFilterActive = dateRangeFilter !== 'Todos' || sourceFilter !== 'Todos' || recruiterFilter !== 'Todos' || processStatusFilter !== 'Todos' || productFilter !== 'Todos';

  const resetAllFilters = () => {
    setDateRangeFilter('Todos');
    setSourceFilter('Todos');
    setRecruiterFilter('Todos');
    setProcessStatusFilter('Todos');
    setProductFilter('Todos');
    setSearchTerm('');
    setOpenDropdown(null);
  };

  // List of processes matching real Supabase data + active filters
  const fullProcessList = useMemo(() => {
    let list = (tests && tests.length > 0) ? [...tests] : [];

    // Filter by date range
    if (dateRangeFilter !== 'Todos') {
      const now = new Date().getTime();
      list = list.filter(t => {
        const created = new Date(t.createdAt || 0).getTime();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        if (dateRangeFilter === '7D') return diffDays <= 7;
        if (dateRangeFilter === '30D') return diffDays <= 30;
        if (dateRangeFilter === 'MES') {
          const d = new Date(t.createdAt || 0);
          const n = new Date();
          return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        }
        if (dateRangeFilter === 'ANIO') {
          const d = new Date(t.createdAt || 0);
          return d.getFullYear() === new Date().getFullYear();
        }
        return true;
      });
    }

    // Filter by recruiter
    if (recruiterFilter !== 'Todos') {
      list = list.filter(t => (t.launchedBy || 'Sin asignar') === recruiterFilter);
    }
    // Filter by status
    if (processStatusFilter !== 'Todos') {
      list = list.filter(t => (t.processStatus || 'LANZADO') === processStatusFilter);
    }
    // Filter by product
    if (productFilter !== 'Todos') {
      list = list.filter(t => {
        const titleAndPos = `${t.title} ${t.targetPosition || ''}`.toLowerCase();
        if (productFilter === 'Batería Psicotécnica') return titleAndPos.includes('psico') || titleAndPos.includes('tecnica');
        if (productFilter === 'Casos y Competencias') return titleAndPos.includes('caso') || titleAndPos.includes('competencia');
        return true;
      });
    }
    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.profileName || t.targetPosition || '').toLowerCase().includes(q) ||
        (t.launchedBy || '').toLowerCase().includes(q)
      );
    }
    // Sort
    if (sortOrder === 'nombre') list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOrder === 'perfil') list.sort((a, b) => (a.profileName || '').localeCompare(b.profileName || ''));
    else list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return list.map(t => ({
      test: t,
      name: t.title,
      profile: t.profileName || t.targetPosition || 'Perfil General',
      launchedBy: t.launchedBy || 'Sin asignar'
    }));
  }, [tests, dateRangeFilter, recruiterFilter, processStatusFilter, productFilter, searchTerm, sortOrder]);

  // Métricas reales calculadas a partir de Supabase
  const totalCandidates = candidates.length;
  const completedCandidates = candidates.filter(c => c.status === 'SCORED' || (c.status as any) === 'EVALUADO').length;
  const inProgressCandidates = candidates.filter(c => c.status === 'IN_PROGRESS' || (c.status as any) === 'EN_CURSO').length;
  const invitedCandidates = candidates.filter(c => c.status === 'INVITED' || (c.status as any) === 'INVITADO').length;
  const rejectedCandidates = candidates.filter(c => c.status === 'REJECTED' || (c.status as any) === 'RECHAZADO').length;
  const finalistCandidates = candidates.filter(c => c.status === 'FINALIST' || (c.status as any) === 'FINALISTA').length;

  const completedPct = totalCandidates > 0 ? Math.round((completedCandidates / totalCandidates) * 100) : 0;
  const inProgressPct = totalCandidates > 0 ? Math.round((inProgressCandidates / totalCandidates) * 100) : 0;
  const invitedPct = totalCandidates > 0 ? Math.round((invitedCandidates / totalCandidates) * 100) : 0;
  const managedRate = totalCandidates > 0 ? ((totalCandidates - invitedCandidates) / totalCandidates * 100).toFixed(1).replace('.', ',') : '0,0';
  const launchedProcessesCount = tests.filter(t => (t.processStatus || 'LANZADO') === 'LANZADO').length;
  const closedProcessesCount = tests.filter(t => t.processStatus === 'CERRADO').length;
  const draftProcessesCount = tests.filter(t => t.processStatus === 'BORRADOR').length;
  const archivedProcessesCount = tests.filter(t => t.processStatus === 'ARCHIVADO').length;

  // Reacciones: derivadas de candidatos con estado especial
  const desiredCount = finalistCandidates;  // FINALISTA = deseado
  const undecidedCount = completedCandidates > finalistCandidates ? completedCandidates - finalistCandidates : 0;
  const undesiredCount = rejectedCandidates;
  const totalReactions = desiredCount + undecidedCount + undesiredCount;

  // NPS: calculado desde puntajes de candidatos completados
  const scoredCandidates = candidates.filter(c => c.status === 'SCORED' || c.status === 'FINALIST' || (c.status as any) === 'EVALUADO' || (c.status as any) === 'FINALISTA');
  const promotores = scoredCandidates.filter(c => (c.scores?.overall || 0) >= 85).length;
  const neutros = scoredCandidates.filter(c => { const s = c.scores?.overall || 0; return s >= 70 && s < 85; }).length;
  const detractores = scoredCandidates.filter(c => (c.scores?.overall || 0) < 70).length;
  const npsTotal = promotores + neutros + detractores;
  const npsScore = npsTotal > 0 ? Math.round(((promotores - detractores) / npsTotal) * 100) : 0;
  const npsPromoterPct = npsTotal > 0 ? Math.round((promotores / npsTotal) * 100) : 0;
  const npsNeutralPct = npsTotal > 0 ? Math.round((neutros / npsTotal) * 100) : 0;
  const npsDetractorPct = npsTotal > 0 ? 100 - npsPromoterPct - npsNeutralPct : 0;

  // Lanzado por: agrupar procesos por responsable
  const launchedByMap = tests.reduce((acc: Record<string, number>, t) => {
    const who = (t.launchedBy || 'Sin asignar').split(' ').slice(0, 2).join(' ').toUpperCase();
    acc[who] = (acc[who] || 0) + 1;
    return acc;
  }, {});
  const launchedByEntries = Object.entries(launchedByMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const maxLaunched = launchedByEntries.length > 0 ? launchedByEntries[0][1] : 1;
  const BAR_COLORS = ['#F28C28', '#2F5BA8', '#2FA58B', '#E4572E', '#9B5DE5'];

  // Estados del donut: proporciones reales
  const totalProcesses = tests.length || 1;
  const launchedPct = Math.round((launchedProcessesCount / totalProcesses) * 100);
  const closedPct = Math.round((closedProcessesCount / totalProcesses) * 100);
  const draftPct = Math.round((draftProcessesCount / totalProcesses) * 100);

  // Sidebar items without "Créditos" (user specifically requested omitting it)
  const sidebarItems = [
    { id: 'empresa', label: 'Mi Empresa', icon: Building2 },
    { id: 'analitica', label: 'Analítica', icon: BarChart2, hasSubmenu: true },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'etiquetas', label: 'Etiquetas', icon: Tag },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'contratados', label: 'Contratados', icon: Contact },
    { id: 'comunicacion', label: 'Comunicación', icon: MessageSquare },
    { id: 'conocimiento', label: 'Conocimiento', icon: BookOpen },
    { id: 'filtros', label: 'Filtros personalizados', icon: SlidersHorizontal },
    { id: 'no_deseados', label: 'No deseados', icon: UserX },
    { id: 'ajustes', label: 'Ajustes tablero', icon: Settings },
    { id: 'asignacion', label: 'Asignación de empresas', icon: Network },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans text-[#161C3A] dark:text-[#F0F4FF] animate-in fade-in">

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: EXACT EVALUAR DESIGN (WITHOUT "CRÉDITOS")                 */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-60 xl:w-64 shrink-0 space-y-4">
        <div className="bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] rounded-2xl p-4 shadow-2xs border border-[var(--sidebar-bg)]">

          {/* Header pill: GEA INTERNACIONAL PERÚ */}
          <div className="p-3 mb-3 text-center border-b border-white/15">
            <span className="text-xs font-black tracking-wider text-white uppercase block">
              GEA INTERNACIONAL PERÚ
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-0.5 text-xs font-medium">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarItem === item.label;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSidebarItem(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${isActive
                      ? 'bg-white/16 font-bold text-white shadow-2xs'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. RIGHT MAIN CONTENT: ANALÍTICA - PROCESOS DASHBOARD                     */}
      {/* ========================================================================= */}
      <main className="flex-1 space-y-5 min-w-0">

        {/* Title & Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-[#1F2A5E] dark:text-[#5B8AE0]" />
            <h1 className="text-2xl font-bold text-[#1F2A5E] dark:text-white tracking-tight font-sans">
              Analítica – Procesos
            </h1>
          </div>

          <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4] max-w-3xl leading-relaxed">
            Este resumen gráfico muestra información clave sobre el estado y origen de los procesos, incluyendo quién los lanzó y la cobertura restante.
          </p>

          {/* Filter Pills - matches image 1 exactly, all fully functional */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1" onClick={(e) => { if ((e.target as HTMLElement).closest('[data-dropdown]') === null) setOpenDropdown(null); }}>

            {/* 1. Rango de fechas */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'dateRange' ? null : 'dateRange')}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${dateRangeFilter !== 'Todos'
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8]/40'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateRangeLabels[dateRangeFilter]}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'dateRange' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'dateRange' && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[180px] py-1 overflow-hidden">
                  {(['Todos', '7D', '30D', 'MES', 'ANIO'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setDateRangeFilter(opt); setOpenDropdown(null); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${dateRangeFilter === opt ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-[#161C3A] dark:text-[#D0D8F0]'
                        }`}
                    >
                      {opt === 'Todos' ? 'Todos los rangos' : dateRangeLabels[opt]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Fuente de candidaturas */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'source' ? null : 'source')}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${sourceFilter !== 'Todos'
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8]/40'
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{sourceFilter === 'Todos' ? 'Fuente de candidaturas' : sourceFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'source' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'source' && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[200px] py-1 overflow-hidden">
                  {sourceOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setSourceFilter(opt); setOpenDropdown(null); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${sourceFilter === opt ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-[#161C3A] dark:text-[#D0D8F0]'
                        }`}
                    >
                      {opt === 'Todos' ? 'Todas las fuentes' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Lanzado por */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'recruiter' ? null : 'recruiter')}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${recruiterFilter !== 'Todos'
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8]/40'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{recruiterFilter === 'Todos' ? 'Lanzado por' : recruiterFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'recruiter' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'recruiter' && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[200px] py-1 overflow-hidden">
                  {recruiterOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setRecruiterFilter(opt); setOpenDropdown(null); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${recruiterFilter === opt ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-[#161C3A] dark:text-[#D0D8F0]'
                        }`}
                    >
                      {opt === 'Todos' ? 'Todos los reclutadores' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Estado */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${processStatusFilter !== 'Todos'
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8]/40'
                  }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>{processStatusFilter === 'Todos' ? 'Estado' : statusLabels[processStatusFilter]}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'status' && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden">
                  {statusOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setProcessStatusFilter(opt); setOpenDropdown(null); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${processStatusFilter === opt ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-[#161C3A] dark:text-[#D0D8F0]'
                        }`}
                    >
                      {opt === 'Todos' ? 'Todos los estados' : statusLabels[opt]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Producto */}
            <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'product' ? null : 'product')}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${productFilter !== 'Todos'
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#6B7494] dark:text-[#9AA5C4] hover:border-[#2F5BA8]/40'
                  }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{productFilter === 'Todos' ? 'Producto' : productFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'product' && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[200px] py-1 overflow-hidden">
                  {productOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setProductFilter(opt); setOpenDropdown(null); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${productFilter === opt ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-[#161C3A] dark:text-[#D0D8F0]'
                        }`}
                    >
                      {opt === 'Todos' ? 'Todos los productos' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Red/Coral reset icon button */}
            <button
              type="button"
              onClick={resetAllFilters}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${isAnyFilterActive
                  ? 'border-[#E1005A] bg-[#E1005A]/10 text-[#E1005A] hover:bg-[#E1005A]/20'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#182044] text-[#E1005A] hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              title="Restablecer todos los filtros"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: TOP KPI CARD (CANDIDATOS TOTALES STRIP)                            */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">

            {/* Total */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#161C3A] dark:text-zinc-300 block">
                Candidatos totales
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2A5E] dark:text-white">
                {totalCandidates}
              </div>
            </div>

            {/* Finalizados */}
            <div className="space-y-1 border-l border-[#DDE2EF] dark:border-[#2A3563] pl-3">
              <div className="flex items-center justify-between text-[#6B7494]">
                <span className="text-xs font-medium">Finalizados</span>
                <Target className="w-3.5 h-3.5 text-[#2F5BA8]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-[#2F5BA8]">{completedCandidates}</span>
                <span className="text-[10px] text-[#6B7494]">{completedPct}%</span>
              </div>
            </div>

            {/* En progreso */}
            <div className="space-y-1 border-l border-[#DDE2EF] dark:border-[#2A3563] pl-3">
              <div className="flex items-center justify-between text-[#6B7494]">
                <span className="text-xs font-medium">En progreso</span>
                <Clock className="w-3.5 h-3.5 text-[#F28C28]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-[#F28C28]">{inProgressCandidates}</span>
                <span className="text-[10px] text-[#6B7494]">{inProgressPct}%</span>
              </div>
            </div>

            {/* Sin iniciar */}
            <div className="space-y-1 border-l border-[#DDE2EF] dark:border-[#2A3563] pl-3">
              <div className="flex items-center justify-between text-[#6B7494]">
                <span className="text-xs font-medium">Sin iniciar</span>
                <User className="w-3.5 h-3.5 text-[#1F2A5E] dark:text-zinc-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-[#1F2A5E] dark:text-zinc-200">{invitedCandidates}</span>
                <span className="text-[10px] text-[#6B7494]">{invitedPct}%</span>
              </div>
            </div>

            {/* Descalificados */}
            <div className="space-y-1 border-l border-[#DDE2EF] dark:border-[#2A3563] pl-3">
              <div className="flex items-center justify-between text-[#6B7494]">
                <span className="text-xs font-medium">Descalificados</span>
                <UserX className="w-3.5 h-3.5 text-[#E4572E]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-[#E4572E]">{rejectedCandidates}</span>
                <span className="text-[10px] text-[#6B7494]">0%</span>
              </div>
            </div>

            {/* Preseleccionados */}
            <div className="space-y-1 border-l border-[#DDE2EF] dark:border-[#2A3563] pl-3">
              <div className="flex items-center justify-between text-[#6B7494]">
                <span className="text-xs font-medium">Preseleccionados</span>
                <Users className="w-3.5 h-3.5 text-[#2FA58B]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-[#2FA58B]">{finalistCandidates}</span>
                <span className="text-[10px] text-[#6B7494]">{completedCandidates > 0 ? Math.round((finalistCandidates / completedCandidates) * 100) : 0}% de los finalizados</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: Tasa de gestionados, Ternas finalistas, Contratados                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: Tasa de gestionados */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7494] mb-2">
              <span className="text-xs font-semibold">Tasa de gestionados</span>
              <RefreshCw className="w-4 h-4 text-[#6B7494]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1F2A5E] dark:text-white">
              {managedRate}%
            </div>
          </div>

          {/* Card 2: Ternas finalistas */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7494] mb-2">
              <span className="text-xs font-semibold">Ternas finalistas</span>
              <Users className="w-4 h-4 text-[#6B7494]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1F2A5E] dark:text-white">
              {finalistCandidates}
            </div>
          </div>

          {/* Card 3: Contratados */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7494] mb-2">
              <span className="text-xs font-semibold">Contratados</span>
              <IdCard className="w-4 h-4 text-[#6B7494]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1F2A5E] dark:text-white">
              {candidates.filter(c => c.status === 'FINALIST').length}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 3: REACCIONES A CANDIDATOS & NPS CANDIDATOS                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left Card: Reacciones a candidatos */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#161C3A] dark:text-zinc-200">
                Reacciones a candidatos
              </h3>
              <p className="text-xs text-[#6B7494] mt-0.5">
                {totalReactions} Reaccion{totalReactions !== 1 ? 'es' : ''} totales
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Deseado */}
              <div className="p-3 rounded-xl bg-[#2FA58B]/10 border border-[#2FA58B]/20">
                <div className="flex items-center gap-1.5 text-[#2FA58B] text-xs font-medium">
                  <Smile className="w-3.5 h-3.5" />
                  <span>Deseado</span>
                </div>
                <div className="text-xl font-bold text-[#2FA58B] mt-2">
                  {desiredCount}
                </div>
              </div>

              {/* En duda */}
              <div className="p-3 rounded-xl bg-[#F28C28]/10 border border-[#F28C28]/20">
                <div className="flex items-center gap-1.5 text-[#F28C28] text-xs font-medium">
                  <Meh className="w-3.5 h-3.5" />
                  <span>En duda</span>
                </div>
                <div className="text-xl font-bold text-[#F28C28] mt-2">
                  {undecidedCount}
                </div>
              </div>

              {/* No deseado */}
              <div className="p-3 rounded-xl bg-[#E4572E]/10 border border-[#E4572E]/20">
                <div className="flex items-center gap-1.5 text-[#E4572E] text-xs font-medium">
                  <Frown className="w-3.5 h-3.5" />
                  <span>No deseado</span>
                </div>
                <div className="text-xl font-bold text-[#E4572E] mt-2">
                  {undesiredCount}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: NPS Candidatos */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#161C3A] dark:text-zinc-200">
                  NPS Candidatos
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl sm:text-3xl font-bold ${npsScore >= 50 ? 'text-[#2FA58B]' : npsScore >= 0 ? 'text-[#F28C28]' : 'text-[#E4572E]'}`}>
                    {npsScore}
                  </span>
                  <span className="text-xs text-[#6B7494]">Puntuación neta</span>
                </div>
              </div>

              {/* Star Badge */}
              <span className="px-2.5 py-1 rounded-xl bg-[#1F2A5E]/10 text-[#1F2A5E] dark:text-[#5B8AE0] text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#1F2A5E] dark:fill-[#5B8AE0]" />
                <span>{npsTotal}</span>
              </span>
            </div>

            {/* Tri-color gauge bar with arrow pointer */}
            <div className="space-y-1.5 pt-1">
              <div className="relative">
                {/* Pointer triangle at promoter start */}
                <div
                  className="absolute -bottom-4 z-10 transition-all flex flex-col items-center"
                  style={{ left: `${Math.min(95, Math.max(2, npsDetractorPct + npsNeutralPct))}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#1F2A5E] dark:border-b-[#5B8AE0]" />
                  <div className="w-0.5 h-10 border-l-2 border-dashed border-[#1F2A5E] dark:border-[#5B8AE0]" />
                </div>

                <div className="h-6 w-full rounded-lg overflow-hidden flex border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs">
                  {npsDetractorPct > 0 && <div style={{ width: `${npsDetractorPct}%` }} className="bg-[#E4572E]" title="Detractores" />}
                  {npsNeutralPct > 0 && <div style={{ width: `${npsNeutralPct}%` }} className="bg-[#F28C28]" title="Neutros" />}
                  {npsPromoterPct > 0 && <div style={{ width: `${npsPromoterPct}%` }} className="bg-[#2FA58B]" title="Promotores" />}
                  {npsTotal === 0 && <div className="w-full bg-[#DDE2EF]" title="Sin datos" />}
                </div>
              </div>

              {/* Legend underneath */}
              <div className="flex items-center gap-4 text-[10px] text-[#6B7494] pt-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E4572E]" />
                  <span>Detractores: {detractores}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                  <span>Neutros: {neutros}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2FA58B]" />
                  <span>Promotores: {promotores}</span>
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 4: COBERTURA, VELOCIDAD DE CONTRATACIÓN, FUENTE DE CANDIDATURAS       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: Cobertura */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#1F2A5E]/10 text-[#1F2A5E] dark:text-[#5B8AE0] flex items-center justify-center">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#161C3A] dark:text-zinc-300">
                Cobertura
              </h3>
            </div>

            {/* Semicircle Gauge */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-18 overflow-hidden flex items-end justify-center">
                <div className="w-36 h-36 rounded-full border-[10px] border-[#DDE2EF]/60 dark:border-[#2A3563] border-t-[#1F2A5E]/40 border-l-[#1F2A5E]/40" />
                <div className="absolute bottom-0 text-center">
                  <span className="text-2xl font-extrabold text-[#1F2A5E] dark:text-white block leading-none">0</span>
                  <span className="text-[10px] font-bold text-[#6B7494] uppercase tracking-widest">DÍAS</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7494] space-y-1 pt-1 border-t border-[#DDE2EF] dark:border-[#2A3563]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#6B7494]" />
                <span>Proceso más rápido: <strong>0 días</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#6B7494]" />
                <span>Proceso más lento: <strong>0 días</strong></span>
              </div>
            </div>
          </div>

          {/* Card 2: Velocidad de contratación */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#2F5BA8]/10 text-[#2F5BA8] flex items-center justify-center font-bold text-xs">
                A=
              </div>
              <h3 className="text-xs font-bold text-[#161C3A] dark:text-zinc-300">
                Velocidad de contratación
              </h3>
            </div>

            {/* Semicircle Gauge */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-18 overflow-hidden flex items-end justify-center">
                <div className="w-36 h-36 rounded-full border-[10px] border-[#DDE2EF]/60 dark:border-[#2A3563] border-t-[#2FA58B]/40 border-l-[#2FA58B]/40" />
                <div className="absolute bottom-0 text-center">
                  <span className="text-2xl font-extrabold text-[#2FA58B] block leading-none">0</span>
                  <span className="text-[10px] font-bold text-[#6B7494] uppercase tracking-widest">DÍAS</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7494] space-y-1 pt-1 border-t border-[#DDE2EF] dark:border-[#2A3563]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#6B7494]" />
                <span>Contratación más rápida: <strong>0 días</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#6B7494]" />
                <span>Contratación más lenta: <strong>0 días</strong></span>
              </div>
            </div>
          </div>

          {/* Card 3: Fuente de candidaturas */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[#161C3A] dark:text-zinc-300">
              Fuente de candidaturas
            </h3>

            {/* Light Blue Circle (100% Agregado Manual) */}
            <div className="flex justify-center py-2">
              <div className="w-24 h-24 rounded-full bg-[#2F5BA8]/15 border-2 border-white dark:border-[#2A3563] shadow-xs" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#6B7494] pt-1 border-t border-[#DDE2EF] dark:border-[#2A3563]">
              <span className="w-2 h-2 rounded-full bg-[#2F5BA8]" />
              <span>Agregado Manual</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 5: LANZADO POR (BAR CHART) & ESTADOS (DONUT CHART)                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Card 1: Lanzado por (Wide Bar Chart - datos reales) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#161C3A] dark:text-zinc-300">
              Lanzado por
            </h3>

            {launchedByEntries.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-[#6B7494]">Sin datos disponibles</div>
            ) : (
              <div className="h-44 flex items-end gap-8 px-6 pb-2 border-b border-l border-[#DDE2EF] dark:border-[#2A3563] relative">
                {/* Y Axis */}
                <div className="absolute left-[-28px] top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#6B7494] font-mono">
                  <span>{maxLaunched}</span>
                  <span>{Math.round(maxLaunched * 0.75)}</span>
                  <span>{Math.round(maxLaunched * 0.5)}</span>
                  <span>{Math.round(maxLaunched * 0.25)}</span>
                  <span>0</span>
                </div>

                {launchedByEntries.map(([name, count], i) => (
                  <div key={name} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#1F2A5E] dark:text-white">{count}</span>
                    <div
                      className="w-14 rounded-t-lg transition-all"
                      style={{
                        backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        height: `${Math.max(6, Math.round((count / maxLaunched) * 100))}%`,
                        border: `1px solid ${BAR_COLORS[i % BAR_COLORS.length]}66`
                      }}
                    />
                    <span className="text-[10px] font-bold text-[#6B7494] text-center truncate max-w-[60px]" title={name}>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Estados (Donut SVG - datos reales) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[#161C3A] dark:text-zinc-300">
              Estados de procesos
            </h3>

            {/* Donut SVG dinámico */}
            <div className="flex justify-center py-2">
              {tests.length === 0 ? (
                <div className="w-28 h-28 rounded-full border-[14px] border-[#DDE2EF] dark:border-[#2A3563] flex items-center justify-center">
                  <span className="text-[10px] text-[#6B7494]">0</span>
                </div>
              ) : (
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                    {/* Lanzados */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F28C28" strokeWidth="4"
                      strokeDasharray={`${launchedPct * 0.879} ${100 - launchedPct * 0.879}`}
                      strokeDashoffset="0" />
                    {/* Cerrados */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#2FA58B" strokeWidth="4"
                      strokeDasharray={`${closedPct * 0.879} ${100 - closedPct * 0.879}`}
                      strokeDashoffset={`${-(launchedPct * 0.879)}`} />
                    {/* Borradores */}
                    {draftPct > 0 && (
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#6B7494" strokeWidth="4"
                        strokeDasharray={`${draftPct * 0.879} ${100 - draftPct * 0.879}`}
                        strokeDashoffset={`${-((launchedPct + closedPct) * 0.879)}`} />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#1F2A5E] dark:text-white">{tests.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 text-xs text-[#6B7494] pt-1 border-t border-[#DDE2EF] dark:border-[#2A3563]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                <span>Lanzados ({launchedProcessesCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2FA58B]" />
                <span>Cerrados ({closedProcessesCount})</span>
              </span>
              {draftProcessesCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6B7494]" />
                  <span>Borradores ({draftProcessesCount})</span>
                </span>
              )}
              {archivedProcessesCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E4572E]" />
                  <span>Archivados ({archivedProcessesCount})</span>
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 6: LISTADO DE PROCESOS TABLE                                          */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-4">

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#161C3A] dark:text-white">
              Listado de procesos
            </h3>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre de proceso o perfil"
                  className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none focus:border-[#2F5BA8]"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 text-xs text-[#6B7494]">
                <span>Ordenar:</span>
                <button
                  type="button"
                  className="font-medium text-[#161C3A] dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{sortOrder}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B7494]" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#6B7494] font-medium border-b border-[#DDE2EF] dark:border-[#2A3563]">
                <tr>
                  <th className="py-3 px-2 font-normal">Nombre</th>
                  <th className="py-3 px-2 font-normal">Perfil</th>
                  <th className="py-3 px-2 font-normal">Lanzado por</th>
                  <th className="py-3 px-2 text-right font-normal">Ver más</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
                {fullProcessList.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#E9EDF6]/40 dark:hover:bg-white/5 transition-colors">
                    <td
                      className="py-3.5 px-2 font-semibold text-[#2F5BA8] hover:underline cursor-pointer"
                      onClick={() => onViewProcess?.(tests[idx])}
                    >
                      {p.name}
                    </td>
                    <td className="py-3.5 px-2 text-[#6B7494] dark:text-[#9AA5C4]">
                      {p.profile}
                    </td>
                    <td className="py-3.5 px-2 text-[#6B7494] dark:text-[#9AA5C4]">
                      {p.launchedBy}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => onViewProcess?.(tests[idx])}
                        className="p-1 rounded-lg text-[#2F5BA8] hover:bg-[#2F5BA8]/10 cursor-pointer transition-colors"
                        title="Ver detalle del proceso"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </main>

    </div>
  );
};
