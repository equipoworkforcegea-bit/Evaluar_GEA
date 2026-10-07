import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationTest, Candidate } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';
import { TestManagerView } from './TestManagerView';
import { ProcessCandidateActivityModal } from './ProcessCandidateActivityModal';
import { CandidateDetailModal } from './CandidateDetailModal';
import { 
  Rocket, 
  Users, 
  Plus, 
  SlidersHorizontal, 
  Search, 
  Clock, 
  User, 
  MoreVertical, 
  FileText, 
  RotateCw, 
  Hourglass, 
  UserX, 
  Check, 
  ChevronDown, 
  Sliders, 
  ArrowLeft,
  Activity,
  Edit3,
  Archive,
  Target,
  Trash2,
  Armchair
} from 'lucide-react';

interface EvaluarProcessListViewProps {
  tests: EvaluationTest[];
  candidates: Candidate[];
  activeTestId: string;
  onSelectActiveTest: (testId: string) => void;
  onOpenInviteForTest: (testId: string) => void;
  onCreateNewProcess: () => void;
  onViewReportsForTest?: (testId: string) => void;
  onCreateTest?: (test: EvaluationTest) => void;
  onViewCandidateDetail?: (candidate: Candidate) => void;
  onSwitchToCandidateExam?: (candidateId: string) => void;
  onViewAssignedCandidates?: () => void;
}

export const EvaluarProcessListView: React.FC<EvaluarProcessListViewProps> = ({
  tests,
  candidates,
  activeTestId,
  onSelectActiveTest,
  onOpenInviteForTest,
  onCreateNewProcess,
  onViewReportsForTest,
  onCreateTest,
  onViewCandidateDetail,
  onSwitchToCandidateExam,
  onViewAssignedCandidates
}) => {
  const [subView, setSubView] = useState<'LIST' | 'CONFIG_PRUEBAS'>('LIST');
  const [activeStatusTab, setActiveStatusTab] = useState<'LANZADO' | 'BORRADOR' | 'CERRADO' | 'ARCHIVADO' | 'TODOS'>('LANZADO');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'created_desc' | 'created_asc' | 'title_asc' | 'title_desc'>('created_desc');
  const [openSubDropdown, setOpenSubDropdown] = useState<'sort' | 'status' | null>(null);
  const [activeMenuTestId, setActiveMenuTestId] = useState<string | null>(null);
  const [activityModalTest, setActivityModalTest] = useState<EvaluationTest | null>(null);
  const [localDetailCandidate, setLocalDetailCandidate] = useState<Candidate | null>(null);
  const [liveCandidates, setLiveCandidates] = useState<Candidate[]>(candidates);

  // Carga y sincronización periódica con Supabase para reflejar los datos reales
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      try {
        const fresh = await CandidateDataService.getCandidates();
        if (isMounted && fresh && fresh.length > 0) {
          setLiveCandidates(fresh);
        }
      } catch {}
    };
    fetchFresh();
    const interval = setInterval(fetchFresh, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter and sort tests based on status, search and sort order
  const filteredTests = useMemo(() => {
    let list = tests.filter(test => {
      const status = test.processStatus || 'LANZADO';
      if (activeStatusTab !== 'TODOS' && status !== activeStatusTab) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(q);
        const matchProfile = (test.profileName || '').toLowerCase().includes(q);
        const matchCode = test.code.toLowerCase().includes(q);
        return matchTitle || matchProfile || matchCode;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortOrder === 'created_desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortOrder === 'created_asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortOrder === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortOrder === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return list;
  }, [tests, activeStatusTab, searchTerm, sortOrder]);

  const launchedCount = tests.filter(t => (t.processStatus || 'LANZADO') === 'LANZADO').length;
  const draftCount = tests.filter(t => t.processStatus === 'BORRADOR').length;
  const closedCount = tests.filter(t => t.processStatus === 'CERRADO').length;
  const archivedCount = tests.filter(t => t.processStatus === 'ARCHIVADO').length;

  // SUBVIEW 1: CONFIGURAR PRUEBAS
  if (subView === 'CONFIG_PRUEBAS') {
    return (
      <div className="space-y-4 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSubView('LIST')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 cursor-pointer transition-colors"
              title="Volver a lista de procesos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1F2A5E]" />
                <span>Configuración de Pruebas & Baterías de Selección</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Diseña etapas, tiempos, número de reactivos y ponderaciones para los procesos de selección.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubView('LIST')}
              className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              ← Volver a Procesos
            </button>
          </div>
        </div>

        <TestManagerView
          tests={tests}
          activeTestId={activeTestId}
          onSelectActiveTest={onSelectActiveTest}
          onCreateTest={onCreateTest || (() => {})}
        />
      </div>
    );
  }

  // DEFAULT VIEW: EXACT EVALUAR.COM INTERFACE
  return (
    <div className="space-y-4 animate-in fade-in font-sans">
      
      {/* 1. TOP HEADER ROW: Icon + Title "Procesos" + Subtitle + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Rocket className="w-7 h-7 text-[#1F2A5E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans">
              Procesos
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Administra y monitorea tus procesos de selección.
            </p>
          </div>
        </div>

        {/* Buttons on Right: Postulantes asignados + Entrevistas (outline) + + Nuevo proceso (solid navy) */}
        <div className="flex items-center gap-2.5">
          {onViewAssignedCandidates && (
            <button
              type="button"
              onClick={onViewAssignedCandidates}
              className="px-4 py-2 rounded-xl border border-[#2F5BA8] text-[#2F5BA8] bg-white dark:bg-zinc-900 hover:bg-[#2F5BA8]/5 font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              title="Gestión de postulantes, asignación y derechos ARCO Ley N° 29733"
            >
              <Users className="w-4 h-4" />
              <span>Postulantes asignados</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => alert('Módulo de video-entrevistas asíncronas.')}
            className="px-4 py-2 rounded-xl border border-[#2F5BA8] text-[#2F5BA8] bg-white dark:bg-zinc-900 hover:bg-[#2F5BA8]/5 font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4" />
            <span>Entrevistas</span>
          </button>

          <button
            type="button"
            onClick={onCreateNewProcess}
            className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo proceso</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-FILTERS PILLS ROW: "Por creación ∨"  "Lanzado ∨"  [Red filter icon] */}
      <div className="flex items-center gap-2 text-xs" onClick={(e) => { if ((e.target as HTMLElement).closest('[data-dropdown]') === null) setOpenSubDropdown(null); }}>
        
        {/* Sort: Por creación */}
        <div className="relative" data-dropdown>
          <button
            type="button"
            onClick={() => setOpenSubDropdown(openSubDropdown === 'sort' ? null : 'sort')}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
              sortOrder !== 'created_desc'
                ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
            }`}
          >
            <span>{sortOrder.startsWith('created') ? 'Por creación' : 'Por nombre'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${openSubDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          {openSubDropdown === 'sort' && (
            <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl min-w-[200px] py-1 overflow-hidden">
              <button
                type="button"
                onClick={() => { setSortOrder('created_desc'); setOpenSubDropdown(null); }}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${
                  sortOrder === 'created_desc' ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                Por creación (Más recientes)
              </button>
              <button
                type="button"
                onClick={() => { setSortOrder('created_asc'); setOpenSubDropdown(null); }}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${
                  sortOrder === 'created_asc' ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                Por creación (Más antiguos)
              </button>
              <button
                type="button"
                onClick={() => { setSortOrder('title_asc'); setOpenSubDropdown(null); }}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${
                  sortOrder === 'title_asc' ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                Nombre del proceso (A-Z)
              </button>
              <button
                type="button"
                onClick={() => { setSortOrder('title_desc'); setOpenSubDropdown(null); }}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${
                  sortOrder === 'title_desc' ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                Nombre del proceso (Z-A)
              </button>
            </div>
          )}
        </div>

        {/* Filter: Estado (Lanzado, Borrador, etc.) */}
        <div className="relative" data-dropdown>
          <button
            type="button"
            onClick={() => setOpenSubDropdown(openSubDropdown === 'status' ? null : 'status')}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
              activeStatusTab !== 'TODOS'
                ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
            }`}
          >
            <span>{activeStatusTab === 'TODOS' ? 'Todos los estados' : activeStatusTab === 'LANZADO' ? 'Lanzado' : activeStatusTab === 'BORRADOR' ? 'Borrador' : activeStatusTab === 'CERRADO' ? 'Cerrado' : 'Archivado'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${openSubDropdown === 'status' ? 'rotate-180' : ''}`} />
          </button>
          {openSubDropdown === 'status' && (
            <div className="absolute top-full left-0 mt-1.5 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl min-w-[170px] py-1 overflow-hidden">
              {(['LANZADO', 'BORRADOR', 'CERRADO', 'ARCHIVADO', 'TODOS'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveStatusTab(tab); setOpenSubDropdown(null); }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#2F5BA8]/8 transition-colors ${
                    activeStatusTab === tab ? 'font-bold text-[#2F5BA8] bg-[#2F5BA8]/6' : 'text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {tab === 'LANZADO' ? 'Lanzado' : tab === 'BORRADOR' ? 'Borrador' : tab === 'CERRADO' ? 'Cerrado' : tab === 'ARCHIVADO' ? 'Archivado' : 'Todos los estados'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Reset Filter */}
        <button
          type="button"
          onClick={() => {
            setActiveStatusTab('TODOS');
            setSortOrder('created_desc');
            setSearchTerm('');
            setOpenSubDropdown(null);
          }}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
            activeStatusTab !== 'TODOS' || sortOrder !== 'created_desc' || searchTerm.trim() !== ''
              ? 'border-[#E1005A] bg-[#E1005A]/10 text-[#E1005A] hover:bg-[#E1005A]/20'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#E1005A] hover:bg-rose-50'
          }`}
          title="Restablecer filtros y orden"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. STATUS TABS BAR: Lanzado (7), Borrador, Cerrado (1), Archivado, Todos + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          
          {/* Lanzado (7) */}
          <button
            type="button"
            onClick={() => setActiveStatusTab('LANZADO')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'LANZADO'
                ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Lanzado ({launchedCount})</span>
          </button>

          {/* Borrador */}
          <button
            type="button"
            onClick={() => setActiveStatusTab('BORRADOR')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'BORRADOR'
                ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Borrador{draftCount > 0 ? ` (${draftCount})` : ''}</span>
          </button>

          {/* Cerrado */}
          <button
            type="button"
            onClick={() => setActiveStatusTab('CERRADO')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'CERRADO'
                ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cerrado{closedCount > 0 ? ` (${closedCount})` : ''}</span>
          </button>

          {/* Archivado */}
          <button
            type="button"
            onClick={() => setActiveStatusTab('ARCHIVADO')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'ARCHIVADO'
                ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-zinc-400" />
            <span>Archivado{archivedCount > 0 ? ` (${archivedCount})` : ''}</span>
          </button>

          {/* Todos */}
          <button
            type="button"
            onClick={() => setActiveStatusTab('TODOS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'TODOS'
                ? 'bg-[#1F2A5E] text-white shadow-2xs font-bold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            <span>Todos</span>
          </button>

        </div>

        {/* Right side: Filtros button */}
        <button
          type="button"
          className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-zinc-300"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros</span>
        </button>
      </div>

      {/* 4. SEARCH BAR ROW */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de proceso o perfil"
            className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-2xs focus:ring-1 focus:ring-[#1F2A5E] outline-none"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="button"
          className="p-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 cursor-pointer shadow-2xs"
          title="Filtros avanzados"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 5. PROCESS CARDS LIST (EXACT EVALUAR SCREENSHOT STYLE) */}
      <div className="space-y-4">
        {filteredTests.map((test) => {
          const isSelected = test.id === activeTestId;
          
          // Candidatos reales asociados a este proceso desde Supabase
          const processCandidates = liveCandidates.filter(c => 
            c.testId === test.id || 
            (test.code && c.testId === test.code) ||
            (c.testId && test.id && c.testId.toLowerCase() === test.id.toLowerCase())
          );

          const isFinalistOrScored = (c: Candidate) => {
            const raw = String(c.status || '').toUpperCase();
            return raw === 'FINALIST' || raw === 'FINALISTA' || raw === 'SCORED' || raw === 'EVALUADO' || raw === 'COMPLETADO';
          };
          const isInProgress = (c: Candidate) => {
            if (isFinalistOrScored(c)) return false;
            const raw = String(c.status || '').toUpperCase();
            const rawStage = String(c.currentStage || '').toUpperCase();
            return raw === 'IN_PROGRESS' || raw === 'EN_CURSO' || raw === 'EN_PROCESO' ||
              rawStage.includes('ETAPA_2') || rawStage.includes('STAGE_2') ||
              rawStage.includes('ETAPA_3') || rawStage.includes('STAGE_3') ||
              Boolean(c.isConsentSigned) || Boolean(c.startedAt);
          };
          const isRejected = (c: Candidate) => {
            const raw = String(c.status || '').toUpperCase();
            return raw === 'REJECTED' || raw === 'RECHAZADO' || raw === 'DISQUALIFIED';
          };

          const finalized = processCandidates.length > 0 
            ? processCandidates.filter(isFinalistOrScored).length 
            : (test.completedCount ?? 0);
          const inProgress = processCandidates.length > 0 
            ? processCandidates.filter(isInProgress).length 
            : (test.inProgressCount ?? 0);
          const disqualified = processCandidates.length > 0 
            ? processCandidates.filter(isRejected).length 
            : (test.disqualifiedCount ?? 0);
          const notStarted = processCandidates.length > 0 
            ? processCandidates.filter(c => !isFinalistOrScored(c) && !isInProgress(c) && !isRejected(c)).length 
            : (test.notStartedCount ?? 0);
          const totalCand = processCandidates.length > 0 
            ? processCandidates.length 
            : (test.candidateCount ?? 0);
          const hired = processCandidates.length > 0 
            ? processCandidates.filter(c => String(c.status || '').toUpperCase() === 'FINALIST' || String(c.status || '').toUpperCase() === 'FINALISTA').length 
            : (test.hiredCount ?? 0);

          return (
            <div
              key={test.id}
              onClick={() => {
                onSelectActiveTest(test.id);
                setActivityModalTest(test);
              }}
              className="p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* LEFT COLUMN: TITLE & PROCESS METADATA */}
                <div className="space-y-2 max-w-xl">
                  
                  {/* Title & Badge */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#2F5BA8] dark:text-[#5B8AE0] hover:underline flex items-center gap-1.5 tracking-wide">
                      <span>{test.title}</span>
                    </h3>
                    <div className="w-5 h-5 rounded-md bg-[#1F2A5E]/10 text-[#1F2A5E] dark:text-[#5B8AE0] flex items-center justify-center font-bold text-[10px]">
                      A+
                    </div>
                  </div>

                  {/* Recruiter info */}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Lanzado por: <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{test.launchedBy || 'Tania León'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        Duración: Inicio {test.startDate || '28/09/2026'} - Fin {test.endDate || '01/03/2027'}
                      </span>
                    </div>
                  </div>

                  {/* Badges: En Progreso & Perfil + Icons */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-0.5 rounded-full bg-[#F28C28]/10 text-[#F28C28] dark:bg-[#F28C28]/15 dark:text-[#F28C28] font-semibold text-xs border border-[#F28C28]/25">
                      En Progreso
                    </span>

                    <span className="px-3 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs flex items-center gap-1.5">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>Perfil: {test.profileName || test.targetPosition}</span>
                    </span>

                    {/* Small color circle icon (pie chart / 4 colors) */}
                    <div className="w-4 h-4 rounded-full bg-conic from-[#E4572E] via-[#F28C28] via-[#2FA58B] to-[#2F5BA8] shrink-0 shadow-2xs" title="Competencias asignadas" />

                    {/* Small trash icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Proceso "${test.title}" archivado.`);
                      }}
                      className="text-zinc-300 hover:text-[#E4572E] p-0.5 cursor-pointer transition-colors"
                      title="Archivar proceso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* RIGHT COLUMN: 4 EXACT WHITE METRIC BOXES + THREE DOTS BUTTON */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  
                  {/* The 4 Individual Metric Boxes */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    
                    {/* 1. Finalizado (Green) */}
                    <div className="py-2.5 px-3 min-w-[76px] sm:min-w-[84px] bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200/90 dark:border-zinc-700 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#2FA58B] flex items-center justify-center gap-1">
                        <Target className="w-3.5 h-3.5 opacity-80" />
                        <span>{finalized}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 block leading-tight mt-0.5">
                        Finalizado
                      </span>
                    </div>

                    {/* 2. En progreso (Orange) */}
                    <div className="py-2.5 px-3 min-w-[76px] sm:min-w-[84px] bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200/90 dark:border-zinc-700 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#F28C28] flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 opacity-80" />
                        <span>{inProgress}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 block leading-tight mt-0.5">
                        En progreso
                      </span>
                    </div>

                    {/* 3. Sin iniciar (Gray) */}
                    <div className="py-2.5 px-3 min-w-[76px] sm:min-w-[84px] bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200/90 dark:border-zinc-700 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#6B7280] dark:text-zinc-300 flex items-center justify-center gap-1">
                        <Hourglass className="w-3.5 h-3.5 opacity-80" />
                        <span>{notStarted}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 block leading-tight mt-0.5">
                        Sin iniciar
                      </span>
                    </div>

                    {/* 4. Descalificado (Red) */}
                    <div className="py-2.5 px-3 min-w-[76px] sm:min-w-[84px] bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200/90 dark:border-zinc-700 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#E4572E] flex items-center justify-center gap-1">
                        <UserX className="w-3.5 h-3.5 opacity-80" />
                        <span>{disqualified}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 block leading-tight mt-0.5">
                        Descalificado
                      </span>
                    </div>

                  </div>

                  {/* Actions Dropdown ⋮ (Rounded box with border) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTestId(activeMenuTestId === test.id ? null : test.id);
                      }}
                      className="p-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shadow-2xs"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuTestId === test.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-11 z-50 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 text-xs animate-in fade-in"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectActiveTest(test.id);
                            setActivityModalTest(test);
                            setActiveMenuTestId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 flex items-center gap-2 cursor-pointer font-bold text-emerald-800 dark:text-emerald-300 transition-colors"
                        >
                          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Ver Actividad de Postulantes</span>
                        </button>

                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                        <button
                          type="button"
                          onClick={() => {
                            onSelectActiveTest(test.id);
                            setSubView('CONFIG_PRUEBAS');
                            setActiveMenuTestId(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-semibold text-[#1F2A5E]"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>Configurar Batería de Prueba</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* CARD FOOTER ROW: Exactly "Contratados: X" (green) and "Candidatos: Y" (purple) on the right */}
              <div className="mt-3 pt-2 flex items-center justify-end gap-5 text-xs font-medium">
                <span className="text-[#2FA58B] flex items-center gap-1.5 font-semibold">
                  <Armchair className="w-3.5 h-3.5" />
                  <span>Contratados: {hired}</span>
                </span>

                <span className="text-[#2F5BA8] dark:text-[#5B8AE0] flex items-center gap-1.5 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Candidatos: {totalCand}</span>
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL DE ACTIVIDAD DE POSTULANTES DEL PROCESO */}
      {activityModalTest && (
        <ProcessCandidateActivityModal
          process={activityModalTest}
          candidates={liveCandidates}
          onClose={() => setActivityModalTest(null)}
          onViewCandidateDetail={(cand) => {
            if (onViewCandidateDetail) {
              onViewCandidateDetail(cand);
            } else {
              setLocalDetailCandidate(cand);
            }
          }}
          onSwitchToCandidateExam={onSwitchToCandidateExam}
        />
      )}

      {/* MODAL DE DETALLE INDIVIDUAL DE POSTULANTE (AUDITORÍA & RESPUESTAS) */}
      {localDetailCandidate && (
        <CandidateDetailModal
          candidate={localDetailCandidate}
          onClose={() => setLocalDetailCandidate(null)}
          onPromoteToFinalist={(_id) => {
            setLocalDetailCandidate(null);
          }}
          onResendInvitation={(_id) => {}}
        />
      )}

    </div>
  );
};
