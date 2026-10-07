import React, { useState, useMemo, useEffect } from 'react';
import { Candidate, CandidateStageStatus } from '../../types';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Award, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertTriangle,
  Send,
  LayoutGrid,
  ListOrdered,
  ArrowUpDown,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Printer
} from 'lucide-react';

interface CandidatePipelineProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onPromoteCandidate: (candidateId: string) => void;
  onResendInvitation: (candidateId: string) => void;
  onOpenReport?: (candidate: Candidate) => void;
}

type SortField = 'SCORE' | 'NAME' | 'STATUS' | 'AUDIT';
type SortOrder = 'ASC' | 'DESC';

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  candidates,
  onSelectCandidate,
  onPromoteCandidate,
  onResendInvitation,
  onOpenReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
  const [sortField, setSortField] = useState<SortField>('SCORE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // Filter positions list
  const positions = useMemo(() => Array.from(new Set(candidates.map(c => c.position))), [candidates]);

  // Sync positionFilter when candidate list updates dynamically
  useEffect(() => {
    if (positionFilter !== 'ALL' && !positions.includes(positionFilter)) {
      setPositionFilter('ALL');
    }
  }, [positions, positionFilter]);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let list = candidates.filter(c => {
      const matchesSearch = 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dni.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'ALL' || c.position === positionFilter;
      return matchesSearch && matchesPosition;
    });

    // Sort
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'SCORE') {
        const scoreA = a.scores?.overall ?? -1;
        const scoreB = b.scores?.overall ?? -1;
        comparison = scoreB - scoreA;
      } else if (sortField === 'NAME') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortField === 'AUDIT') {
        comparison = (b.auditEventCount || 0) - (a.auditEventCount || 0);
      } else if (sortField === 'STATUS') {
        const orderMap: Record<CandidateStageStatus, number> = {
          'FINALIST': 4,
          'SCORED': 3,
          'IN_PROGRESS': 2,
          'INVITED': 1,
          'REJECTED': 0
        };
        comparison = orderMap[b.status] - orderMap[a.status];
      }

      return sortOrder === 'ASC' ? -comparison : comparison;
    });
  }, [candidates, searchTerm, positionFilter, sortField, sortOrder]);

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  // Pipeline columns definition in exact sequential flow
  const columns: { 
    status: CandidateStageStatus; 
    stepNumber: number;
    label: string; 
    subtitle: string;
    count: number; 
    borderClass: string;
    headerBg: string;
    badgeBg: string;
    icon: any;
  }[] = [
    {
      status: 'INVITED',
      stepNumber: 1,
      label: 'Invitados',
      subtitle: 'Acceso emitido, pendiente de inicio',
      count: filteredAndSortedCandidates.filter(c => c.status === 'INVITED').length,
      borderClass: 'border-zinc-300 dark:border-zinc-700',
      headerBg: 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200',
      badgeBg: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200',
      icon: Users
    },
    {
      status: 'IN_PROGRESS',
      stepNumber: 2,
      label: 'Rindiendo',
      subtitle: 'En examen con cronómetro activo',
      count: filteredAndSortedCandidates.filter(c => c.status === 'IN_PROGRESS').length,
      borderClass: 'border-amber-300 dark:border-amber-800',
      headerBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200',
      badgeBg: 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200',
      icon: Clock
    },
    {
      status: 'SCORED',
      stepNumber: 3,
      label: 'Calificados',
      subtitle: '3 etapas culminadas con puntaje',
      count: filteredAndSortedCandidates.filter(c => c.status === 'SCORED').length,
      borderClass: 'border-blue-300 dark:border-blue-800',
      headerBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200',
      badgeBg: 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200',
      icon: CheckCircle
    },
    {
      status: 'FINALIST',
      stepNumber: 4,
      label: 'Finalistas',
      subtitle: 'Aprobados para entrevista de área',
      count: filteredAndSortedCandidates.filter(c => c.status === 'FINALIST').length,
      borderClass: 'border-emerald-300 dark:border-emerald-800',
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200',
      badgeBg: 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200',
      icon: Award
    }
  ];

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI o correo del postulante…"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Position Filter & View Switcher */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          
          {/* Position Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas las convocatorias ({candidates.length})</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* View Toggle: Board vs Sorted List */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === 'BOARD'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablero Pipeline</span>
              <span className="sm:hidden">Tablero</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista Ordenada</span>
              <span className="sm:hidden">Lista</span>
            </button>
          </div>

        </div>

      </div>

      {/* VIEW 1: STRICT HORIZONTAL SEQUENTIAL KANBAN PIPELINE */}
      {viewMode === 'BOARD' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1080px] items-stretch">
            {columns.map((col) => {
              const colCandidates = filteredAndSortedCandidates.filter(c => c.status === col.status);
              const ColIcon = col.icon;

              return (
                <div
                  key={col.status}
                  className={`flex-1 min-w-[260px] bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border ${col.borderClass} flex flex-col shadow-xs overflow-hidden`}
                >
                  {/* Column Header */}
                  <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 ${col.headerBg}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white dark:bg-zinc-900 text-[11px] font-bold flex items-center justify-center font-mono">
                          {col.stepNumber}
                        </span>
                        <h3 className="font-bold text-sm tracking-tight">{col.label}</h3>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                        {col.count}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-tight">
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Cards List in this Column */}
                  <div className="p-3 space-y-3 overflow-y-auto max-h-[640px] flex-1">
                    {colCandidates.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                        Sin postulantes en esta fase
                      </div>
                    ) : (
                      colCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => onSelectCandidate(cand)}
                          className="group bg-white dark:bg-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          {/* Name & DNI */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {cand.fullName}
                            </h4>
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                              DNI {cand.dni}
                            </span>
                          </div>

                          {/* Position */}
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">
                            {cand.position}
                          </p>

                          {/* Score and Percentile Display */}
                          <div className="p-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs mb-3">
                            {cand.scores ? (
                              <div>
                                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Puntaje</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-base">
                                    {cand.scores.overall}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">/ 100</span>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                                    (P{cand.scores.percentile})
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Estado</span>
                                <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                                  {cand.status === 'IN_PROGRESS' ? 'Etapa 2 / 3 en curso' : 'Pendiente de inicio'}
                                </span>
                              </div>
                            )}

                            {/* Integrity Audit Indicator */}
                            {cand.auditEventCount > 0 ? (
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Auditoría</span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{cand.auditEventCount} eventos</span>
                                </span>
                              </div>
                            ) : (
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Integridad</span>
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Óptima</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Action Button & Details Link */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700/60 text-xs">
                            {cand.status === 'INVITED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onResendInvitation(cand.id);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reenviar invitación</span>
                              </button>
                            )}

                            {cand.status === 'SCORED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPromoteCandidate(cand.id);
                                }}
                                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Pasar a Finalistas</span>
                              </button>
                            )}

                            {cand.status === 'FINALIST' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Terna Aprobada</span>
                              </span>
                            )}

                            {cand.status === 'IN_PROGRESS' && (
                              <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span>Rindiendo en vivo</span>
                              </span>
                            )}

                            <span className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-0.5 ml-auto">
                              <span>Ficha</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: HIGH-DENSITY SORTABLE CANDIDATE TABLE (VISTA LISTA ORDENADA) */}
      {viewMode === 'LIST' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th 
                    className="p-3.5 cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleToggleSort('NAME')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Postulante</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Convocatoria</th>
                  <th 
                    className="p-3.5 cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleToggleSort('STATUS')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Estado</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:text-blue-600 select-none text-right"
                    onClick={() => handleToggleSort('SCORE')}
                  >
                    <div className="flex items-center gap-1 justify-end">
                      <span>Puntaje Global</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">Etapa 1 / 2 / 3</th>
                  <th 
                    className="p-3.5 cursor-pointer hover:text-blue-600 select-none text-center"
                    onClick={() => handleToggleSort('AUDIT')}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      <span>Integridad</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSortedCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand)}
                    className="hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    {/* Candidate Name & DNI */}
                    <td className="p-3.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {cand.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        DNI {cand.dni} • {cand.email}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="p-3.5 text-zinc-600 dark:text-zinc-300">
                      {cand.position}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cand.status === 'FINALIST'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : cand.status === 'SCORED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : cand.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {cand.status === 'FINALIST' ? 'Finalista' :
                         cand.status === 'SCORED' ? 'Calificado' :
                         cand.status === 'IN_PROGRESS' ? 'Rindiendo' : 'Invitado'}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="p-3.5 text-right font-mono">
                      {cand.scores ? (
                        <div>
                          <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                            {cand.scores.overall}
                          </span>
                          <span className="text-zinc-400 text-xs">/100</span>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Percentil {cand.scores.percentile}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-xs">--</span>
                      )}
                    </td>

                    {/* Stages breakdown */}
                    <td className="p-3.5 text-center font-mono text-xs">
                      {cand.scores ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300" title="Psicopedagógica">
                            {cand.scores.stage1Psycho}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#2F5BA8]/10 dark:bg-[#2F5BA8]/20 text-[#2F5BA8] dark:text-[#5B8AE0]" title="Personal y Emocional">
                            {cand.scores.stage2Emotional}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" title="Situaciones Laborales">
                            {cand.scores.stage3WorkCases}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">En progreso</span>
                      )}
                    </td>

                    {/* Integrity / Audit Events */}
                    <td className="p-3.5 text-center">
                      {cand.auditEventCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{cand.auditEventCount}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                          ✓ Limpio
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(cand.status === 'SCORED' || cand.status === 'FINALIST') && onOpenReport && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReport(cand);
                            }}
                            className="px-2.5 py-1.5 border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Imprimir informe oficial de resultados en PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Informe</span>
                          </button>
                        )}

                        {cand.status === 'SCORED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPromoteCandidate(cand.id);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                          >
                            Promover
                          </button>
                        )}
                        {cand.status === 'INVITED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onResendInvitation(cand.id);
                            }}
                            className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                          >
                            Reenviar invitación
                          </button>
                        )}
                        {cand.status === 'FINALIST' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            Finalista
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
