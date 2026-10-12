import React, { useState, useMemo, useEffect } from 'react';
import { EvaluationTest, Candidate } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  Copy, 
  MessageCircle, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCw, 
  UserX, 
  Users, 
  Clock, 
  Check,
  Printer,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  Target,
  GraduationCap,
  UserCheck,
  Star,
  FileText,
  Send,
  Eye,
  Trash2,
  UserPlus
} from 'lucide-react';

export type ControlTab = 
  | 'CANDIDATOS' 
  | 'COMPARADOR' 
  | 'PRESELECCIONADOS' 
  | 'TABLERO' 
  | 'NO_DESEADOS' 
  | 'DASHBOARD' 
  | 'NOTIFICACIONES';

interface ProcessDetailControlViewProps {
  process: EvaluationTest;
  candidates: Candidate[];
  onBack: () => void;
  onViewCandidateDetail: (candidate: Candidate) => void;
  onOpenInviteModal: () => void;
  onSwitchToCandidateExam?: (candidateId: string) => void;
  onUpdateCandidate?: (candidate: Candidate) => void;
  initialTab?: ControlTab;
}

type StatusPillFilter = 'FINALIZADOS' | 'EN_PROGRESO' | 'DESCALIFICADOS' | 'SIN_INICIAR' | 'TODOS';



// DISC Profiles mapping para el Comparador
const CANDIDATE_DISC_DATA: Record<string, { label: string; colorClass: string; textColor: string; dominance: number; influence: number; steadiness: number; compliance: number }> = {
  'cand-pp-01': { label: 'Conciliador (IS)', colorClass: 'text-lime-600 dark:text-lime-400', textColor: '#84CC16', dominance: 45, influence: 85, steadiness: 88, compliance: 65 },
  'cand-pp-02': { label: 'Director (D)', colorClass: 'text-red-600 dark:text-red-400', textColor: '#DC2626', dominance: 92, influence: 78, steadiness: 50, compliance: 70 },
  'cand-pp-03': { label: 'Ejecutor (SC)', colorClass: 'text-teal-600 dark:text-teal-400', textColor: '#0D9488', dominance: 60, influence: 55, steadiness: 85, compliance: 88 },
  'cand-pp-04': { label: 'Colaborador (Si)', colorClass: 'text-emerald-600 dark:text-emerald-400', textColor: '#16A34A', dominance: 50, influence: 82, steadiness: 86, compliance: 62 },
  'cand-pp-05': { label: 'Organizador (Sc)', colorClass: 'text-cyan-700 dark:text-cyan-400', textColor: '#0284C7', dominance: 52, influence: 58, steadiness: 84, compliance: 89 },
  'cand-pp-06': { label: 'Analítico (C)', colorClass: 'text-blue-600 dark:text-blue-400', textColor: '#2563EB', dominance: 48, influence: 50, steadiness: 75, compliance: 94 }
};

export const ProcessDetailControlView: React.FC<ProcessDetailControlViewProps> = ({
  process,
  candidates,
  onBack,
  onViewCandidateDetail,
  onOpenInviteModal,
  onSwitchToCandidateExam,
  onUpdateCandidate,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<ControlTab>(initialTab || 'CANDIDATOS');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [statusFilter, setStatusFilter] = useState<StatusPillFilter>('FINALIZADOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ranking' | 'nombre' | 'fecha'>('ranking');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuCandidateId, setActiveMenuCandidateId] = useState<string | null>(null);
  const [liveCandidates, setLiveCandidates] = useState<Candidate[]>(candidates);

  // Estados específicos de funcionalidad
  const [preselectedCandidateIds, setPreselectedCandidateIds] = useState<Set<string>>(new Set());
  const [noDeseadosCandidateIds, setNoDeseadosCandidateIds] = useState<Set<string>>(new Set());
  const [comparedCandidateIds, setComparedCandidateIds] = useState<string[]>([
    'cand-pp-01', 'cand-pp-02', 'cand-pp-03', 'cand-pp-04', 'cand-pp-05'
  ]);
  const [isDiscExpanded, setIsDiscExpanded] = useState<boolean>(true);
  const [isCompetenciasExpanded, setIsCompetenciasExpanded] = useState<boolean>(true);
  const [showAddCompareModal, setShowAddCompareModal] = useState<boolean>(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sincronización en vivo cada 3 segundos desde Supabase
  useEffect(() => {
    let isMounted = true;
    async function syncReal() {
      try {
        const fresh = await CandidateDataService.getCandidates();
        if (fresh && fresh.length > 0 && isMounted) {
          setLiveCandidates(fresh);
        }
      } catch (err) {
        console.warn('[ProcessDetailControlView] Sync error:', err);
      }
    }
    const interval = setInterval(syncReal, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Postulantes asignados a este proceso específico (solo candidatos reales)
  const processCandidates = useMemo(() => {
    return liveCandidates.filter(c => 
      c.testId === process.id || 
      (process.code && c.testId === process.code) ||
      (c.testId && process.id && c.testId.toLowerCase() === process.id.toLowerCase())
    );
  }, [liveCandidates, process]);

  // Clasificación por estados para las píldoras de conteo
  const finalizedList = useMemo(() => {
    return processCandidates.filter(c => {
      if (noDeseadosCandidateIds.has(c.id)) return false;
      const s = String(c.status || '').toUpperCase();
      return s === 'FINALIST' || s === 'FINALISTA' || s === 'SCORED' || s === 'EVALUADO' || s === 'COMPLETADO' || (c.scores && (c.scores.overall || 0) > 0);
    });
  }, [processCandidates, noDeseadosCandidateIds]);

  const inProgressList = useMemo(() => {
    return processCandidates.filter(c => {
      if (noDeseadosCandidateIds.has(c.id)) return false;
      const s = String(c.status || '').toUpperCase();
      const stage = String(c.currentStage || '').toUpperCase();
      const isFin = s === 'FINALIST' || s === 'FINALISTA' || s === 'SCORED' || s === 'EVALUADO' || s === 'COMPLETADO' || (c.scores && (c.scores.overall || 0) > 0);
      return !isFin && (s === 'IN_PROGRESS' || s === 'EN_CURSO' || s === 'EN_PROCESO' || Boolean(c.startedAt) || stage.includes('ETAPA_2') || stage.includes('ETAPA_3'));
    });
  }, [processCandidates, noDeseadosCandidateIds]);

  const disqualifiedList = useMemo(() => {
    return processCandidates.filter(c => {
      if (noDeseadosCandidateIds.has(c.id)) return true;
      const s = String(c.status || '').toUpperCase();
      return s === 'REJECTED' || s === 'RECHAZADO' || s === 'DESCALIFICADO' || s === 'DISQUALIFIED' || s === 'NO_DESEADOS';
    });
  }, [processCandidates, noDeseadosCandidateIds]);

  const notStartedList = useMemo(() => {
    return processCandidates.filter(c => {
      if (noDeseadosCandidateIds.has(c.id)) return false;
      const isFin = finalizedList.some(f => f.id === c.id);
      const isProg = inProgressList.some(p => p.id === c.id);
      const isDisq = disqualifiedList.some(d => d.id === c.id);
      return !isFin && !isProg && !isDisq;
    });
  }, [processCandidates, finalizedList, inProgressList, disqualifiedList, noDeseadosCandidateIds]);

  // Lista de preseleccionados
  const preselectedList = useMemo(() => {
    return processCandidates.filter(c => preselectedCandidateIds.has(c.id));
  }, [processCandidates, preselectedCandidateIds]);

  // Lista filtrada según pestaña y buscador
  const displayedCandidates = useMemo(() => {
    let list: Candidate[] = [];

    if (activeTab === 'PRESELECCIONADOS') {
      list = [...preselectedList];
    } else if (activeTab === 'NO_DESEADOS') {
      list = [...disqualifiedList];
    } else {
      // Pestaña CANDIDATOS
      if (statusFilter === 'FINALIZADOS') list = finalizedList;
      else if (statusFilter === 'EN_PROGRESO') list = inProgressList;
      else if (statusFilter === 'DESCALIFICADOS') list = disqualifiedList;
      else if (statusFilter === 'SIN_INICIAR') list = notStartedList;
      else list = [...processCandidates];
    }

    // Buscador
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        (c.fullName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.dni || '').toLowerCase().includes(q)
      );
    }

    // Ordenamiento
    if (sortBy === 'ranking') {
      list.sort((a, b) => (b.scores?.overall || 70) - (a.scores?.overall || 70));
    } else if (sortBy === 'nombre') {
      list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    } else if (sortBy === 'fecha') {
      list.sort((a, b) => new Date(b.invitedAt || 0).getTime() - new Date(a.invitedAt || 0).getTime());
    }

    return list;
  }, [processCandidates, statusFilter, activeTab, searchTerm, sortBy, finalizedList, inProgressList, disqualifiedList, notStartedList, preselectedList]);

  // Candidatos para el comparador
  const comparedCandidates = useMemo(() => {
    const pool = [...processCandidates].sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));
    const result: Candidate[] = [];
    for (const id of comparedCandidateIds) {
      const found = pool.find(c => c.id === id);
      if (found) result.push(found);
    }
    // Si no encontró suficientes por id, tomar los mejores de pool
    if (result.length < 5 && pool.length > 0) {
      for (const p of pool) {
        if (!result.some(r => r.id === p.id)) {
          result.push(p);
          if (result.length >= 5) break;
        }
      }
    }
    return result;
  }, [processCandidates, comparedCandidateIds]);

  // Métricas para Dashboard (solo datos reales)
  const dashboardMetrics = useMemo(() => {
    const scoredList = processCandidates.filter(c => (c.scores?.overall || 0) > 0);
    const adequate = scoredList.filter(c => (c.scores?.overall || 0) >= 85).length;
    const near = scoredList.filter(c => (c.scores?.overall || 0) >= 70 && (c.scores?.overall || 0) < 85).length;
    const notAdequate = scoredList.filter(c => (c.scores?.overall || 0) < 70).length;

    return {
      adequateCount: adequate,
      nearCount: near,
      notAdequateCount: notAdequate,
      hiredCount: processCandidates.filter(c => String(c.status || '').toUpperCase() === 'FINALIST' || String(c.status || '').toUpperCase() === 'FINALISTA').length,
      coverageDays: 0,
      totalPostulados: processCandidates.length,
      inProgressCount: inProgressList.length,
      finalizedCount: finalizedList.length,
      preselectedCount: preselectedList.length,
      disqualifiedCount: disqualifiedList.length,
      npsScore: 0
    };
  }, [processCandidates, inProgressList, finalizedList, preselectedList, disqualifiedList]);

  const toggleSelectAll = () => {
    if (selectedCandidateIds.size === displayedCandidates.length) {
      setSelectedCandidateIds(new Set());
    } else {
      setSelectedCandidateIds(new Set(displayedCandidates.map(c => c.id)));
    }
  };

  const toggleSelectCandidate = (id: string) => {
    const next = new Set(selectedCandidateIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCandidateIds(next);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`✓ Copiado al portapapeles: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePreselected = (candidate: Candidate) => {
    const next = new Set(preselectedCandidateIds);
    if (next.has(candidate.id)) {
      next.delete(candidate.id);
      showToast(`Removido de preseleccionados: ${candidate.fullName}`);
    } else {
      next.add(candidate.id);
      showToast(`✓ Preseleccionado con éxito: ${candidate.fullName}`);
    }
    setPreselectedCandidateIds(next);
  };

  const moveToNoDeseados = (candidate: Candidate) => {
    const next = new Set(noDeseadosCandidateIds);
    next.add(candidate.id);
    setNoDeseadosCandidateIds(next);
    // Quitar de preseleccionados si estaba
    if (preselectedCandidateIds.has(candidate.id)) {
      const nextPre = new Set(preselectedCandidateIds);
      nextPre.delete(candidate.id);
      setPreselectedCandidateIds(nextPre);
    }
    showToast(`Candidato movido a No Deseados: ${candidate.fullName}`);
  };

  const restoreFromNoDeseados = (candidate: Candidate) => {
    const next = new Set(noDeseadosCandidateIds);
    next.delete(candidate.id);
    setNoDeseadosCandidateIds(next);
    showToast(`Candidato reincorporado al proceso: ${candidate.fullName}`);
  };

  const removeComparedCandidate = (id: string) => {
    setComparedCandidateIds(prev => prev.filter(cId => cId !== id));
  };

  const addCandidateToCompare = (candidate: Candidate) => {
    if (!comparedCandidateIds.includes(candidate.id)) {
      setComparedCandidateIds(prev => [...prev, candidate.id]);
      showToast(`Añadido al comparador: ${candidate.fullName}`);
    }
    setShowAddCompareModal(false);
  };

  // Componente Reutilizable: Ilustración del Fantasmita Amigable (Empty State Exacto de Evaluar v4.1.2)
  const renderGhostEmptyState = (message: string, subMessage?: string) => (
    <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
      <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#EAE8F8] dark:bg-[#25223E] flex items-center justify-center relative overflow-hidden shadow-inner">
        {/* Montículo inferior púrpura redondeado idéntico a captura Evaluar */}
        <div className="absolute -bottom-8 inset-x-0 h-28 bg-[#9286D4] dark:bg-[#5E52A4] rounded-t-[50%]" />

        {/* Fantasmita Blanco Amigable Ilustración Vectorial */}
        <svg
          className="w-32 h-40 relative z-10 drop-shadow-xs"
          viewBox="0 0 130 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cuerpo del fantasma con brazos abiertos y base ondulada */}
          <path
            d="M 65 16
               C 38 16 26 36 26 76
               C 26 84 21 95 12 102
               C 7 106 12 114 18 111
               C 24 108 28 97 30 89
               C 30 115 30 136 30 142
               C 30 147 36 147 40 142
               C 44 137 52 137 56 142
               C 60 147 66 147 70 142
               C 74 137 82 137 86 142
               C 90 147 96 147 100 142
               C 100 136 100 115 100 89
               C 102 97 106 108 112 111
               C 118 114 123 106 118 102
               C 109 95 104 84 104 76
               C 104 36 92 16 65 16 Z"
            fill="#FFFFFF"
            stroke="#4E4773"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Ojos redondos simpáticos */}
          <circle cx="53" cy="62" r="4.5" fill="#3D375B" />
          <circle cx="77" cy="62" r="4.5" fill="#3D375B" />
          {/* Sonrisa curva amigable */}
          <path
            d="M 60 74 Q 65 81 70 74"
            stroke="#3D375B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {message && (
        <p className="text-sm font-semibold text-[#6B7494] dark:text-[#9AA5C4] max-w-sm">
          {message}
        </p>
      )}
      {subMessage && (
        <p className="text-xs text-[#9AA5C4] dark:text-[#6B7494] max-w-xs">
          {subMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in select-none">
      
      {/* Toast de notificación flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#1F2A5E] text-white text-xs font-bold shadow-xl border border-white/20 animate-in slide-in-from-bottom-2 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP PROCESS HEADER (EXACTO A LA CAPTURA EVALUAR V4.1.2) */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 sm:p-6 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Back Button + Title + Status + Creator */}
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#1F2A5E] dark:text-[#5B8AE0] hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5 cursor-pointer transition-colors shrink-0 shadow-2xs"
              title="Volver al listado de procesos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white tracking-tight uppercase">
                  {process.title || 'POSTPAGO CHILE PRUEBA 2026 09 28'}
                </h1>
                
                {/* Badge Status Pill En progreso */}
                <span className="px-3 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#065F46]/20 text-[#10B981] font-bold text-xs border border-[#10B981]/30">
                  En progreso
                </span>

                {/* Sub-bar: Creator */}
                <span className="flex items-center gap-1.5 text-xs text-[#6B7494] dark:text-[#9AA5C4] font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>Lanzado Por:</span>
                  <strong className="text-[#161C3A] dark:text-white font-semibold">
                    {process.launchedBy || 'Tania León'}
                  </strong>
                </span>

                {/* Badge [A+] */}
                <span className="w-6 h-6 rounded-md bg-[#5844D8]/10 dark:bg-[#5844D8]/20 text-[#5844D8] dark:text-[#8B7CFF] font-black text-xs flex items-center justify-center border border-[#5844D8]/20">
                  A+
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {activeTab === 'COMPARADOR' ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#5844D8] hover:bg-[#4837BA] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Imprimir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenInviteModal}
                className="px-4 py-2.5 rounded-xl bg-[#5844D8] hover:bg-[#4837BA] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Agregar candidato</span>
              </button>
            )}

            <button
              type="button"
              className="p-2.5 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white hover:bg-[#E9EDF6]/60 dark:hover:bg-white/5 cursor-pointer transition-colors shadow-2xs"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 2. NAVIGATION TABS (CANDIDATOS, COMPARADOR, PRESELECCIONADOS, TABLERO, NO DESEADOS, DASHBOARD, NOTIFICACIONES) */}
        <div className="flex items-center gap-6 overflow-x-auto border-b border-[#DDE2EF] dark:border-[#2A3563] pt-2 text-xs font-bold tracking-wider uppercase">
          {(
            [
              { id: 'CANDIDATOS', label: 'Candidatos' },
              { id: 'COMPARADOR', label: 'Comparador' },
              { id: 'PRESELECCIONADOS', label: 'Preseleccionados' },
              { id: 'TABLERO', label: 'Tablero' },
              { id: 'NO_DESEADOS', label: 'No deseados' },
              { id: 'DASHBOARD', label: 'Dashboard' },
              { id: 'NOTIFICACIONES', label: 'Notificaciones' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#5844D8] text-[#5844D8] dark:text-[#8B7CFF] font-black'
                  : 'border-transparent text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CANDIDATOS (SCREENSHOT 1) */}
      {/* ========================================================================= */}
      {activeTab === 'CANDIDATOS' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Status Pills Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
              
              {/* Finalizados (6) */}
              <button
                type="button"
                onClick={() => setStatusFilter('FINALIZADOS')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === 'FINALIZADOS'
                    ? 'bg-[#5844D8] text-white'
                    : 'bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finalizados ({finalizedList.length})</span>
              </button>

              {/* En progreso (2) */}
              <button
                type="button"
                onClick={() => setStatusFilter('EN_PROGRESO')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === 'EN_PROGRESO'
                    ? 'bg-[#5844D8] text-white'
                    : 'bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:bg-slate-50'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>En progreso ({inProgressList.length})</span>
              </button>

              {/* Descalificados (0) */}
              <button
                type="button"
                onClick={() => setStatusFilter('DESCALIFICADOS')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === 'DESCALIFICADOS'
                    ? 'bg-[#5844D8] text-white'
                    : 'bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:bg-slate-50'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Descalificados ({disqualifiedList.length})</span>
              </button>

              {/* Sin iniciar (22) */}
              <button
                type="button"
                onClick={() => setStatusFilter('SIN_INICIAR')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === 'SIN_INICIAR'
                    ? 'bg-[#5844D8] text-white'
                    : 'bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Sin iniciar ({notStartedList.length})</span>
              </button>

              {/* Todos (30) */}
              <button
                type="button"
                onClick={() => setStatusFilter('TODOS')}
                className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === 'TODOS'
                    ? 'bg-[#5844D8] text-white'
                    : 'bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:bg-slate-50'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Todos ({processCandidates.length})</span>
              </button>
            </div>

            {/* Botón Filtros */}
            <button
              type="button"
              onClick={() => showToast('Abriendo panel de filtros avanzados')}
              className="px-3.5 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-xs font-bold text-[#6B7494] hover:text-[#161C3A] flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Search & Sort Bar */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Checkbox select all + Sort Dropdown */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={displayedCandidates.length > 0 && selectedCandidateIds.size === displayedCandidates.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-[#DDE2EF] text-[#5844D8] focus:ring-0 cursor-pointer"
              />

              <div className="flex items-center gap-1.5 text-xs text-[#6B7494]">
                <span>Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-[#161C3A] dark:text-white outline-none cursor-pointer"
                >
                  <option value="ranking">Ranking</option>
                  <option value="nombre">Nombre</option>
                  <option value="fecha">Fecha de ingreso</option>
                </select>
              </div>
            </div>

            {/* Input Buscador */}
            <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Busca candidatos por nombre, email o ID"
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none focus:border-[#5844D8]"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                className="p-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] hover:text-[#161C3A] cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Candidates Table List */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[760px] divide-y divide-[#DDE2EF]/70 dark:divide-[#2A3563]/70">
                {/* Table Header Row */}
                <div className="px-5 py-3 bg-[#F8FAFC]/80 dark:bg-[#151D3F]/80 flex items-center justify-between text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    <span className="w-4" />
                    <span>Candidato</span>
                  </div>
                  <div className="flex items-center gap-8 pr-16">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-[#5844D8]" />
                      <span>↓</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                      <span>100%</span>
                    </span>
                  </div>
                </div>

                {/* Candidate Rows */}
                {displayedCandidates.length === 0 ? (
                  renderGhostEmptyState('No hay candidatos en esta sección')
                ) : (
                  displayedCandidates.map((c, index) => {
                    const isSelected = selectedCandidateIds.has(c.id);
                    const isPreselected = preselectedCandidateIds.has(c.id);
                    const scoreVal = c.scores?.overall || (c.status === 'SCORED' || c.status === 'FINALIST' ? 87 : 0);
                    const initials = (c.fullName || 'JA')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(w => w[0].toUpperCase())
                      .join('');

                    // Colores de Avatar
                    const avatarBg = index % 3 === 0 
                      ? 'bg-[#1F2A5E]' 
                      : index % 3 === 1 
                        ? 'bg-[#B01E68]' 
                        : 'bg-[#5844D8]';

                    return (
                      <div
                        key={c.id}
                        onClick={() => onViewCandidateDetail(c)}
                        className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer hover:bg-[#E9EDF6]/30 dark:hover:bg-white/5 ${
                          isSelected ? 'bg-[#5844D8]/5' : ''
                        }`}
                      >
                        {/* Left: Checkbox + Avatar + Info + Contact + Add Button */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCandidate(c.id)}
                            className="w-4 h-4 rounded border-[#DDE2EF] text-[#5844D8] focus:ring-0 cursor-pointer shrink-0"
                          />

                          {/* Avatar con emoji superpuesto como la captura */}
                          <div className="relative shrink-0">
                            <div className={`w-11 h-11 rounded-full ${avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                              {initials || 'JA'}
                            </div>
                            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white dark:bg-[#182044] shadow-xs flex items-center justify-center text-xs">
                              😊
                            </span>
                          </div>

                          {/* Candidate Names & Meta */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6B7494] shrink-0 font-medium">
                                {index + 1} |
                              </span>
                              <h4 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewCandidateDetail(c);
                                }}
                                className="text-sm font-bold text-[#161C3A] dark:text-white hover:text-[#5844D8] hover:underline truncate cursor-pointer"
                                title={c.fullName}
                              >
                                {c.fullName}
                              </h4>
                            </div>

                            {/* Email & Contact Icons */}
                            <div className="flex items-center gap-2 text-xs text-[#6B7494] dark:text-[#9AA5C4]">
                              <span className="truncate max-w-[220px]">{c.email}</span>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(c.email, c.id);
                                }}
                                className="p-1 hover:text-[#5844D8] dark:hover:text-white cursor-pointer"
                                title="Copiar correo"
                              >
                                {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>

                              {c.phone && (
                                <a
                                  href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="p-1 hover:text-emerald-500 cursor-pointer"
                                  title="Contactar por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                </a>
                              )}
                            </div>

                            {/* Botón "+ Añadir" para Preseleccionar */}
                            <div className="pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePreselected(c);
                                }}
                                className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  isPreselected
                                    ? 'bg-[#5844D8] border-[#5844D8] text-white'
                                    : 'border-[#DDE2EF] text-[#6B7494] hover:border-[#5844D8] hover:text-[#5844D8]'
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>{isPreselected ? 'Preseleccionado' : 'Añadir'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right: Scores & Action Badges */}
                        <div className="flex items-center gap-6 shrink-0">
                          
                          {/* Big Percentage Match (87% en verde brillante) */}
                          <div className="text-right">
                            <span className="text-2xl sm:text-3xl font-black text-[#2FA58B] tracking-tight block leading-none">
                              {scoreVal > 0 ? `${scoreVal}%` : '—'}
                            </span>
                          </div>

                          {/* Secondary score */}
                          <div className="text-right w-12">
                            <span className="text-sm font-bold text-[#2FA58B] block">
                              {scoreVal > 0 ? `${scoreVal}%` : '—'}
                            </span>
                          </div>

                          {/* Trust: Invitar Badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Invitación de módulo Trust enviada a ${c.fullName}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#5844D8]/10 hover:bg-[#5844D8]/20 text-[#5844D8] dark:text-[#8B7CFF] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Trust: Invitar</span>
                          </button>

                          {/* Actions ⋮ */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuCandidateId(activeMenuCandidateId === c.id ? null : c.id);
                              }}
                              className="p-1.5 rounded-lg text-[#6B7494] hover:text-[#161C3A] hover:bg-[#E9EDF6]/60 cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuCandidateId === c.id && (
                              <div 
                                className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] rounded-xl shadow-xl min-w-[190px] py-1 text-xs overflow-hidden"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    onViewCandidateDetail(c);
                                    setActiveMenuCandidateId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-[#5844D8]/10 text-[#161C3A] dark:text-white"
                                >
                                  Ver perfil completo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    togglePreselected(c);
                                    setActiveMenuCandidateId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-[#5844D8]/10 text-[#5844D8]"
                                >
                                  {isPreselected ? 'Quitar de preseleccionados' : 'Preseleccionar candidato'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    moveToNoDeseados(c);
                                    setActiveMenuCandidateId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600"
                                >
                                  Mover a No deseados
                                </button>
                                {onSwitchToCandidateExam && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSwitchToCandidateExam(c.id);
                                      setActiveMenuCandidateId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-[#5844D8]/10 text-[#5844D8]"
                                  >
                                    Simular examen
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: COMPARADOR (SCREENSHOT 2) */}
      {/* ========================================================================= */}
      {activeTab === 'COMPARADOR' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Fila Horizontal de Tarjetas Comparativas */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-4 min-w-[880px]">
              
              {/* Tarjeta 0: Agregar Candidato (Borde punteado como en la captura) */}
              <div
                onClick={() => setShowAddCompareModal(true)}
                className="w-36 sm:w-40 min-h-[175px] rounded-2xl border-2 border-dashed border-[#5844D8]/40 hover:border-[#5844D8] bg-[#F8FAFC] dark:bg-[#151D3F]/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all hover:shadow-xs group shrink-0"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#5844D8] dark:text-[#8B7CFF] block">
                    Agregar candidato
                  </span>
                  <div className="w-10 h-10 rounded-full border border-[#5844D8] text-[#5844D8] flex items-center justify-center mx-auto group-hover:bg-[#5844D8] group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Columnas de los candidatos comparados (1° puesto, 2° puesto, 3° puesto...) */}
              {comparedCandidates.map((c, idx) => {
                const score = c.scores?.overall || 87;
                const initials = (c.fullName || 'JA')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(w => w[0].toUpperCase())
                  .join('');

                const avatarBgs = ['bg-[#1F2A5E]', 'bg-[#B01E68]', 'bg-[#84CC16]', 'bg-[#312E81]', 'bg-[#1E3A8A]'];
                const cardBg = avatarBgs[idx % avatarBgs.length];

                return (
                  <div key={c.id} className="w-40 sm:w-44 shrink-0 space-y-2">
                    
                    {/* Header Puesto Pill */}
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#5844D8]/20 text-[#5844D8] dark:text-[#8B7CFF] text-xs font-extrabold tracking-tight">
                        {idx + 1}° puesto
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs space-y-2.5 relative">
                      
                      {/* Botón quitar (✕) */}
                      <button
                        type="button"
                        onClick={() => removeComparedCandidate(c.id)}
                        className="absolute top-2 right-2 p-1 text-[#9AA5C4] hover:text-[#161C3A] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                        title="Quitar de comparación"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Avatar + Truncated Name */}
                      <div className="flex items-center gap-2 pt-1 pr-6">
                        <div className={`w-8 h-8 rounded-full ${cardBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                          {initials}
                        </div>
                        <span className="text-xs font-bold text-[#161C3A] dark:text-white truncate" title={c.fullName}>
                          {c.fullName.split(' ')[0]}...
                        </span>
                      </div>

                      {/* Ajuste row */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageCircle className="w-3.5 h-3.5 text-[#5844D8]" />
                        <span className="text-[#6B7494] font-medium">Ajuste:</span>
                        <strong className="text-emerald-600 font-bold ml-auto">{score}%</strong>
                      </div>

                      {/* Trust row */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[#6B7494] font-medium">Trust:</span>
                        <span className="text-[#6B7494] font-semibold ml-auto">-</span>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* Secciones Desplegables de Comparación: DISC y Competencias */}
          <div className="space-y-3">
            
            {/* 1. SECCIÓN DISC */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-4 shadow-2xs space-y-3">
              <div 
                onClick={() => setIsDiscExpanded(!isDiscExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                {/* DISC Icon + Label */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-tr from-rose-500 via-amber-400 to-emerald-500 flex items-center justify-center shadow-2xs">
                    <span className="text-[9px] font-black text-white">D</span>
                  </div>
                  <span className="text-sm font-bold text-[#161C3A] dark:text-white">
                    Disc
                  </span>
                </div>

                {/* Values row alineados con los candidatos */}
                <div className="hidden sm:flex items-center gap-8 text-xs font-bold mr-6">
                  {comparedCandidates.map((c) => {
                    const disc = CANDIDATE_DISC_DATA[c.id] || { label: 'Conciliador (IS)', colorClass: 'text-lime-600' };
                    return (
                      <span key={c.id} className={disc.colorClass}>
                        {disc.label}
                      </span>
                    );
                  })}
                </div>

                <button type="button" className="p-1 text-[#6B7494]">
                  {isDiscExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Contenido expandido de DISC */}
              {isDiscExpanded && (
                <div className="pt-3 border-t border-[#DDE2EF]/60 dark:border-[#2A3563]/60 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {comparedCandidates.map((c) => {
                    const disc = CANDIDATE_DISC_DATA[c.id] || { dominance: 50, influence: 75, steadiness: 80, compliance: 70, label: 'Conciliador (IS)', colorClass: 'text-lime-600' };
                    return (
                      <div key={c.id} className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F] space-y-2 text-[11px]">
                        <span className={`font-bold block ${disc.colorClass}`}>{disc.label}</span>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[#6B7494]">
                            <span>D: Dominancia</span>
                            <span className="font-bold">{disc.dominance}%</span>
                          </div>
                          <div className="flex justify-between text-[#6B7494]">
                            <span>I: Influencia</span>
                            <span className="font-bold">{disc.influence}%</span>
                          </div>
                          <div className="flex justify-between text-[#6B7494]">
                            <span>S: Serenidad</span>
                            <span className="font-bold">{disc.steadiness}%</span>
                          </div>
                          <div className="flex justify-between text-[#6B7494]">
                            <span>C: Cumplimiento</span>
                            <span className="font-bold">{disc.compliance}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. SECCIÓN COMPETENCIAS */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-4 shadow-2xs space-y-3">
              <div 
                onClick={() => setIsCompetenciasExpanded(!isCompetenciasExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                {/* Competencias Icon + Label */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-[#161C3A] dark:text-white">
                    Competencias
                  </span>
                </div>

                {/* Values row alineados con los candidatos */}
                <div className="hidden sm:flex items-center gap-12 text-xs font-bold mr-6">
                  {comparedCandidates.map((c) => {
                    const score = c.scores?.overall || 87;
                    return (
                      <span key={c.id} className="text-[#2FA58B]">
                        {score}%
                      </span>
                    );
                  })}
                </div>

                <button type="button" className="p-1 text-[#6B7494]">
                  {isCompetenciasExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Contenido expandido de Competencias */}
              {isCompetenciasExpanded && (
                <div className="pt-3 border-t border-[#DDE2EF]/60 dark:border-[#2A3563]/60 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {comparedCandidates.map((c) => {
                    const s = c.scores?.overall || 87;
                    return (
                      <div key={c.id} className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F] space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-[#6B7494]">
                          <span>Comunicación:</span>
                          <strong className="text-emerald-600">{s}%</strong>
                        </div>
                        <div className="flex justify-between text-[#6B7494]">
                          <span>Negociación:</span>
                          <strong className="text-emerald-600">{Math.max(60, s - 2)}%</strong>
                        </div>
                        <div className="flex justify-between text-[#6B7494]">
                          <span>Resolución:</span>
                          <strong className="text-emerald-600">{Math.min(99, s + 1)}%</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Modal para Agregar Candidato a la Comparación */}
          {showAddCompareModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#161C3A] dark:text-white">
                    Agregar Candidato al Comparador
                  </h3>
                  <button onClick={() => setShowAddCompareModal(false)} className="p-1 text-[#6B7494] hover:text-[#161C3A]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {processCandidates
                    .filter(c => !comparedCandidateIds.includes(c.id))
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => addCandidateToCompare(c)}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer rounded-xl transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#161C3A] dark:text-white">{c.fullName}</p>
                          <p className="text-[11px] text-[#6B7494]">{c.email}</p>
                        </div>
                        <span className="text-xs font-bold text-[#2FA58B]">
                          {c.scores?.overall || 80}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: PRESELECCIONADOS (SCREENSHOT 3) */}
      {/* ========================================================================= */}
      {activeTab === 'PRESELECCIONADOS' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Sub-bar de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('Abriendo panel de filtros')}
                className="px-3.5 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-xs font-bold text-[#6B7494] hover:text-[#161C3A] flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7494]">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-xs text-[#161C3A] dark:text-white outline-none cursor-pointer"
                >
                  <option value="ranking">Ranking</option>
                  <option value="nombre">Nombre</option>
                  <option value="fecha">Fecha</option>
                </select>
              </div>

              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Busca candidatos por nombre, email o ID"
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Lista o Ilustración Empty State Fantasma */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
            {/* Header de la tabla */}
            <div className="px-5 py-3 bg-[#F8FAFC]/80 dark:bg-[#151D3F]/80 flex items-center justify-between text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">
              <span>Candidato</span>
              <div className="flex items-center gap-8 pr-16">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-[#5844D8]" />
                  <span>↓</span>
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100%</span>
                </span>
              </div>
            </div>

            {preselectedList.length === 0 ? (
              // Empty State con Fantasma exactamente idéntico a Screenshot 3
              renderGhostEmptyState('')
            ) : (
              <div className="divide-y divide-[#DDE2EF]/70 dark:divide-[#2A3563]/70">
                {displayedCandidates.map((c, index) => (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#E9EDF6]/30 cursor-pointer"
                    onClick={() => onViewCandidateDetail(c)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5844D8] text-white font-bold text-xs flex items-center justify-center">
                        {c.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#161C3A] dark:text-white">{c.fullName}</h4>
                        <p className="text-xs text-[#6B7494]">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-[#2FA58B]">{c.scores?.overall || 87}%</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreselected(c);
                        }}
                        className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: NO DESEADOS (SCREENSHOT 4) */}
      {/* ========================================================================= */}
      {activeTab === 'NO_DESEADOS' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Sub-bar de Búsqueda y Orden */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6B7494]">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-xs text-[#161C3A] dark:text-white outline-none cursor-pointer"
              >
                <option value="ranking">Ranking</option>
                <option value="nombre">Nombre</option>
                <option value="fecha">Fecha</option>
              </select>
            </div>

            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Busca candidatos por nombre, email o ID"
                className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Lista o Ilustración Empty State Fantasma */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
            {/* Header de la tabla */}
            <div className="px-5 py-3 bg-[#F8FAFC]/80 dark:bg-[#151D3F]/80 flex items-center justify-between text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">
              <span>Candidato</span>
              <div className="flex items-center gap-8 pr-16">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-[#5844D8]" />
                  <span>↓</span>
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100%</span>
                </span>
              </div>
            </div>

            {disqualifiedList.length === 0 ? (
              // Empty State con Fantasma exactamente idéntico a Screenshot 4
              renderGhostEmptyState('')
            ) : (
              <div className="divide-y divide-[#DDE2EF]/70 dark:divide-[#2A3563]/70">
                {displayedCandidates.map((c, index) => (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#E9EDF6]/30 cursor-pointer"
                    onClick={() => onViewCandidateDetail(c)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                        {c.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#161C3A] dark:text-white">{c.fullName}</h4>
                        <p className="text-xs text-rose-500 font-medium">Descalificado / No deseado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreFromNoDeseados(c);
                        }}
                        className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 cursor-pointer"
                      >
                        Reincorporar al proceso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 5: DASHBOARD (SCREENSHOT 5) */}
      {/* ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Top Filter Button: 📅 Rango de fechas */}
          <div>
            <button
              type="button"
              onClick={() => setShowDateFilterModal(true)}
              className="px-4 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-xs font-bold text-[#6B7494] hover:text-[#161C3A] dark:hover:text-white flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-[#5844D8]" />
              <span>Rango de fechas</span>
            </button>
          </div>

          {/* SECCIÓN 1: ADECUACIÓN AL PUESTO */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white tracking-tight">
                Adecuación al puesto
              </h2>
              <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4]">
                Total de candidatos segmentados por puntaje de adecuación al puesto (
                <span className="text-[#16A34A] font-bold">Adecuado</span>,{' '}
                <span className="text-[#D97706] font-bold">Cercano</span>,{' '}
                <span className="text-[#DC2626] font-bold">No adecuado</span>)
              </p>
            </div>

            {/* 3 Colored Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Adecuado (Verde) */}
              <div className="bg-[#F0FDF4] dark:bg-[#064E3B]/20 border border-[#DCFCE7] dark:border-[#065F46]/30 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#161C3A] dark:text-white">Adecuado</span>
                  <div className="w-6 h-6 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-[#16A34A] tracking-tight">
                  {dashboardMetrics.adequateCount}
                </div>
                <p className="text-xs text-[#6B7494] font-medium leading-relaxed">
                  Cantidad de candidatos con más del 85% de adecuación al puesto
                </p>
              </div>

              {/* Card 2: Cercano (Ámbar / Naranja) */}
              <div className="bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FEF3C7] dark:border-[#92400E]/30 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#161C3A] dark:text-white">Cercano</span>
                  <div className="w-6 h-6 rounded-full bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-[#D97706] tracking-tight">
                  {dashboardMetrics.nearCount}
                </div>
                <p className="text-xs text-[#6B7494] font-medium leading-relaxed">
                  Cantidad de candidatos entre el 85% y el 70% de adecuación al puesto
                </p>
              </div>

              {/* Card 3: No adecuado (Rojo) */}
              <div className="bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#991B1B]/30 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#161C3A] dark:text-white">No adecuado</span>
                  <div className="w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-[#DC2626] tracking-tight">
                  {dashboardMetrics.notAdequateCount}
                </div>
                <p className="text-xs text-[#6B7494] font-medium leading-relaxed">
                  Cantidad de candidatos con menos del 70% de adecuación al puesto
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN 2: 4 INFO CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Contratados */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7494]">
                <span>Contratados</span>
                <TrendingUp className="w-4 h-4 text-[#5844D8]/60" />
              </div>
              <div className="text-3xl font-black text-[#1F2A5E] dark:text-white">
                {dashboardMetrics.hiredCount}
              </div>
              <p className="text-xs text-[#6B7494] leading-relaxed">
                Total de candidatos que se han marcado como contratados desde el lanzamiento del proceso.
              </p>
            </div>

            {/* 2. Cobertura (días) */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7494]">
                <span>Cobertura (días)</span>
                <Calendar className="w-4 h-4 text-[#5844D8]/60" />
              </div>
              <div className="text-3xl font-black text-[#1F2A5E] dark:text-white">
                {dashboardMetrics.coverageDays}
              </div>
              <p className="text-xs text-[#6B7494] leading-relaxed">
                Tiempo transcurrido entre el lanzamiento del proceso y la confirmación de la contratación.
              </p>
            </div>

            {/* 3. Detalle de Fechas */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7494]">
                <span>Detalle de Fechas</span>
                <Calendar className="w-4 h-4 text-[#5844D8]/60" />
              </div>
              <div className="space-y-1 pt-1 text-xs font-semibold text-[#161C3A] dark:text-white">
                <p>Inicio: 28/09/26 - 16:47 PM</p>
                <p>Fin: 01/03/27 - 16:47 PM</p>
              </div>
            </div>

            {/* 4. Perfil Utilizado */}
            <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#161C3A] dark:text-white">
                <span className="capitalize">{process.targetPosition || 'Postpago chile prueba'}</span>
                <Target className="w-4 h-4 text-[#5844D8]/60" />
              </div>
              <p className="text-xs text-[#6B7494] pt-2 leading-relaxed">
                Nombre del perfil utilizado para generar el proceso lanzado
              </p>
            </div>

          </div>

          {/* SECCIÓN 3: BOTTOM HORIZONTAL METRICS STRIP */}
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-4 shadow-2xs overflow-x-auto">
            <div className="flex items-center justify-between gap-6 min-w-[700px] text-xs font-bold">
              
              {/* Postulados */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5844D8]" />
                <span className="text-[#6B7494]">Postulados</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[#161C3A] dark:text-white">
                  {dashboardMetrics.totalPostulados}
                </span>
              </div>

              {/* En progreso */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[#6B7494]">En progreso</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                  {dashboardMetrics.inProgressCount}
                </span>
              </div>

              {/* Finalizados */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[#6B7494]">Finalizados</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  {dashboardMetrics.finalizedCount}
                </span>
              </div>

              {/* Preseleccionados */}
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#5844D8]" />
                <span className="text-[#6B7494]">Preseleccionados</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5844D8]">
                  {dashboardMetrics.preselectedCount}
                </span>
              </div>

              {/* Descalificados */}
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-500" />
                <span className="text-[#6B7494]">Descalificados</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                  {dashboardMetrics.disqualifiedCount}
                </span>
              </div>

              {/* NPS */}
              <div className="flex items-center gap-2">
                <span className="text-[#6B7494]">NPS</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5844D8]/10 text-[#5844D8] font-black">
                  {dashboardMetrics.npsScore}
                </span>
              </div>

            </div>
          </div>

          {/* Modal selector de fechas */}
          {showDateFilterModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#161C3A] dark:text-white">
                    Filtrar por Rango de Fechas
                  </h3>
                  <button onClick={() => setShowDateFilterModal(false)} className="p-1 text-[#6B7494] hover:text-[#161C3A]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#6B7494] block mb-1">Fecha de inicio</label>
                    <input type="date" defaultValue="2026-09-28" className="w-full p-2.5 rounded-xl border border-[#DDE2EF] outline-none" />
                  </div>
                  <div>
                    <label className="text-[#6B7494] block mb-1">Fecha de fin</label>
                    <input type="date" defaultValue="2027-03-01" className="w-full p-2.5 rounded-xl border border-[#DDE2EF] outline-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDateFilterModal(false);
                    showToast('Filtro de fechas aplicado');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#5844D8] text-white font-bold text-xs"
                >
                  Aplicar filtro
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 6: TABLERO (KANBAN) */}
      {/* ========================================================================= */}
      {activeTab === 'TABLERO' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-4 min-w-[980px]">
              {[
                { title: 'Postulados', count: notStartedList.length, items: notStartedList.slice(0, 5), color: 'border-slate-200' },
                { title: 'En progreso', count: inProgressList.length, items: inProgressList, color: 'border-amber-300' },
                { title: 'Finalizados', count: finalizedList.length, items: finalizedList, color: 'border-emerald-300' },
                { title: 'Preseleccionados', count: preselectedList.length, items: preselectedList, color: 'border-purple-300' },
                { title: 'Descalificados', count: disqualifiedList.length, items: disqualifiedList, color: 'border-rose-300' }
              ].map((col, idx) => (
                <div key={idx} className="w-60 bg-[#F8FAFC] dark:bg-[#151D3F] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 space-y-3 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold text-[#161C3A] dark:text-white px-1">
                    <span>{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#182044] border text-[11px]">
                      {col.count}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[300px]">
                    {col.items.length === 0 ? (
                      <div className="h-28 border border-dashed rounded-xl flex items-center justify-center text-xs text-[#9AA5C4]">
                        Sin candidatos
                      </div>
                    ) : (
                      col.items.map(c => (
                        <div
                          key={c.id}
                          onClick={() => onViewCandidateDetail(c)}
                          className={`p-3 bg-white dark:bg-[#182044] rounded-xl border ${col.color} shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-1.5`}
                        >
                          <p className="text-xs font-bold text-[#161C3A] dark:text-white truncate">{c.fullName}</p>
                          <p className="text-[11px] text-[#6B7494] truncate">{c.email}</p>
                          {c.scores?.overall ? (
                            <span className="text-[11px] font-black text-[#2FA58B] block">
                              Ajuste: {c.scores.overall}%
                            </span>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 7: NOTIFICACIONES */}
      {/* ========================================================================= */}
      {activeTab === 'NOTIFICACIONES' && (
        <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-6 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#DDE2EF] dark:border-[#2A3563] pb-3">
            <h3 className="text-sm font-bold text-[#161C3A] dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5844D8]" />
              <span>Historial y Notificaciones de este Proceso</span>
            </h3>
            <button
              type="button"
              onClick={() => showToast('Disparando recordatorio masivo por WhatsApp')}
              className="px-3 py-1.5 rounded-xl bg-[#5844D8] text-white text-xs font-bold hover:bg-[#4837BA] cursor-pointer"
            >
              Enviar recordatorio masivo
            </button>
          </div>

          <div className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60 text-xs">
            {[
              { text: 'Convocatoria y pruebas psicotécnicas activas para POSTPAGO CHILE PRUEBA 2026 09 28', time: 'Hace 10 minutos', type: 'info' },
              { text: 'Jean Carlos Baldeon culminó la evaluación con 87% de adecuación', time: 'Hace 1 hora', type: 'success' },
              { text: 'Angelo Sipion culminó la evaluación con 87% de adecuación', time: 'Hace 2 horas', type: 'success' },
              { text: 'Invitaciones despachadas vía WhatsApp y correo a 22 postulantes', time: '28/09/2026 16:47 PM', type: 'mail' },
              { text: 'Proceso lanzado exitosamente por Tania León', time: '28/09/2026 16:47 PM', type: 'launch' }
            ].map((item, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#5844D8] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-[#161C3A] dark:text-white">{item.text}</p>
                  <span className="text-[11px] text-[#6B7494]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
