import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { EvaluationTest, Candidate } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { 
  X, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  Download, 
  FileText, 
  Eye, 
  ShieldCheck, 
  Play, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ProcessCandidateActivityModalProps {
  process: EvaluationTest;
  candidates: Candidate[];
  onClose: () => void;
  onViewCandidateDetail: (candidate: Candidate) => void;
  onSwitchToCandidateExam?: (candidateId: string) => void;
}

// Función robusta para calcular estados, avance porcentual y etiquetas legibles
function getCandidateStatusFlags(c: Candidate) {
  const rawStatus = String(c.status || '').toUpperCase();
  const rawStage = String(c.currentStage || '').toUpperCase();

  const isFinalist = rawStatus === 'FINALIST' || rawStatus === 'FINALISTA';
  const isScored = isFinalist || rawStatus === 'SCORED' || rawStatus === 'EVALUADO' || rawStatus === 'COMPLETADO';
  const isInProgress = !isScored && (
    rawStatus === 'IN_PROGRESS' || 
    rawStatus === 'EN_CURSO' || 
    rawStatus === 'EN_PROCESO' || 
    rawStage.includes('ETAPA_2') || 
    rawStage.includes('STAGE_2') || 
    rawStage.includes('ETAPA_3') || 
    rawStage.includes('STAGE_3') ||
    Boolean(c.isConsentSigned) ||
    Boolean(c.startedAt)
  );
  const isInvited = !isScored && !isInProgress;

  // Porcentaje de avance real
  let progressPercent = 0;
  if (isScored) {
    progressPercent = 100;
  } else if (isInProgress) {
    if (rawStage.includes('3') || rawStage.includes('CASOS') || rawStage.includes('WORK_CASES')) {
      progressPercent = 85;
    } else if (rawStage.includes('2') || rawStage.includes('EMOCIONAL') || rawStage.includes('EMOTIONAL')) {
      progressPercent = 65;
    } else {
      progressPercent = 33;
    }
  }

  // Nombre de etapa amigable
  let stageLabel = 'Inicio';
  if (rawStage.includes('3') || rawStage.includes('CASOS') || rawStage.includes('WORK_CASES')) {
    stageLabel = 'Etapa 3: Situaciones Laborales';
  } else if (rawStage.includes('2') || rawStage.includes('EMOCIONAL') || rawStage.includes('EMOTIONAL')) {
    stageLabel = 'Etapa 2: Personal y Emocional';
  } else if (rawStage.includes('1') || rawStage.includes('PSICO') || rawStage.includes('PSICOTECNICA')) {
    stageLabel = 'Etapa 1: Psicopedagógica';
  } else if (c.currentStage) {
    stageLabel = c.currentStage;
  }

  return { isFinalist, isScored, isInProgress, isInvited, progressPercent, stageLabel };
}

export const ProcessCandidateActivityModal: React.FC<ProcessCandidateActivityModalProps> = ({
  process,
  candidates,
  onClose,
  onViewCandidateDetail,
  onSwitchToCandidateExam
}) => {
  useBodyScrollLock();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'SCORED' | 'INVITED' | 'WITH_ALERTS'>('ALL');
  const [liveCandidates, setLiveCandidates] = useState<Candidate[]>(candidates);

  // Sincronización en vivo cada 3 segundos con Supabase para reflejar el avance de todos los participantes
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      try {
        const fresh = await CandidateDataService.getCandidates();
        if (isMounted && fresh && fresh.length > 0) {
          setLiveCandidates(fresh);
        }
      } catch {
        // mantener lista previa
      }
    };

    fetchFresh();
    const interval = setInterval(fetchFresh, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [process.id]);

  // Filter candidates specifically related to this process (solo los invitados a este proceso)
  const processCandidates = useMemo(() => {
    return liveCandidates.filter(c => 
      c.testId === process.id || 
      (process.code && c.testId === process.code) ||
      (c.testId && process.id && c.testId.toLowerCase() === process.id.toLowerCase())
    );
  }, [liveCandidates, process.id, process.code]);

  // Apply search and status filters
  const filteredCandidates = useMemo(() => {
    return processCandidates.filter(c => {
      const flags = getCandidateStatusFlags(c);
      if (statusFilter === 'IN_PROGRESS' && !flags.isInProgress) return false;
      if (statusFilter === 'SCORED' && !flags.isScored) return false;
      if (statusFilter === 'INVITED' && !flags.isInvited) return false;
      if (statusFilter === 'WITH_ALERTS' && (c.criticalFlags || 0) === 0 && (c.auditEventCount || 0) === 0) return false;

      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = c.fullName.toLowerCase().includes(query);
        const matchDni = c.dni.toLowerCase().includes(query);
        const matchEmail = c.email.toLowerCase().includes(query);
        return matchName || matchDni || matchEmail;
      }
      return true;
    });
  }, [processCandidates, statusFilter, searchTerm]);

  // Metrics computation
  const totalCount = processCandidates.length;
  const inProgressCount = processCandidates.filter(c => getCandidateStatusFlags(c).isInProgress).length;
  const completedCount = processCandidates.filter(c => getCandidateStatusFlags(c).isScored).length;
  const invitedCount = processCandidates.filter(c => getCandidateStatusFlags(c).isInvited).length;
  
  // Postulantes evaluados / completados con porcentaje de ajuste
  const scoredList = processCandidates.filter(c => {
    const flags = getCandidateStatusFlags(c);
    if (!flags.isScored) return false;
    const val = c.detailedReport?.jobFitPercentage ?? c.scores?.overall;
    return typeof val === 'number' && !isNaN(val) && val > 0;
  });
  const avgScore = (completedCount > 0 && scoredList.length > 0)
    ? Math.round(scoredList.reduce((acc, c) => acc + (c.detailedReport?.jobFitPercentage ?? c.scores?.overall ?? 0), 0) / scoredList.length)
    : null;

  const totalAlerts = processCandidates.reduce((acc, c) => acc + (c.criticalFlags || 0) + (c.auditEventCount || 0), 0);

  // Export activity to Excel
  const handleExportExcel = () => {
    const rows = filteredCandidates.map(c => ({
      'Postulante': c.fullName,
      'DNI': c.dni,
      'Correo': c.email,
      'Teléfono': c.phone || 'N/A',
      'Convocatoria': process.title,
      'Puesto': process.targetPosition,
      'Estado': c.status === 'FINALIST' ? 'Finalista Aprobado' :
                c.status === 'SCORED' ? 'Evaluación Finalizada' :
                c.status === 'IN_PROGRESS' ? 'En Curso (Rindiendo)' : 'Invitado',
      'Etapa Actual': c.currentStage || 'Inicio',
      'Puntaje Global (%)': c.scores?.overall ? `${c.scores.overall}%` : 'Pendiente',
      'Ajuste al Perfil': c.detailedReport?.jobFitPercentage ? `${c.detailedReport.jobFitPercentage}%` : 'N/A',
      'Tiempo Invertido': c.totalDurationSeconds ? `${Math.round(c.totalDurationSeconds / 60)} min` : 'En curso',
      'Alertas de Foco / Integridad': c.criticalFlags || 0,
      'Eventos de Auditoría': c.auditEventCount || 0,
      'Fecha Inicio': c.startedAt ? new Date(c.startedAt).toLocaleString('es-PE') : 'No iniciada',
      'Fecha Fin': c.completedAt ? new Date(c.completedAt).toLocaleString('es-PE') : 'En curso'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Actividad_Postulantes');
    XLSX.writeFile(wb, `Actividad_Postulantes_${process.code}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* ========================================================================= */}
        {/* 1. HEADER                                                                 */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F2A5E] dark:text-blue-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Actividad de Postulantes en Tiempo Real</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#1F2A5E]/10 text-[#1F2A5E] dark:bg-[#1F2A5E]/30 dark:text-blue-200 font-bold">
                {process.code}
              </span>
              {process.isActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Proceso Activo</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {process.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Puesto: <strong className="text-zinc-800 dark:text-zinc-200">{process.targetPosition}</strong> • Duración prueba: <strong>{process.totalDurationMinutes} min</strong> • Fechas: {process.startDate || '28/09/2026'} al {process.endDate || '31/12/2026'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#1F2A5E] text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Descargar actividad en formato Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. KPI METRICS CARDS                                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 sm:p-6 bg-zinc-50/40 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {/* Card 1: Total */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Convocados</span>
              <Users className="w-4 h-4 text-[#1F2A5E]" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {totalCount}
            </div>
            <span className="text-[10px] text-zinc-400">Postulantes registrados</span>
          </div>

          {/* Card 2: En Examen / Activos Ahora */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">En Examen</span>
              <Clock className="w-4 h-4 animate-spin text-amber-600" style={{ animationDuration: '6s' }} />
            </div>
            <div className="text-xl font-black text-amber-800 dark:text-amber-300">
              {inProgressCount}
            </div>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Rindiendo en vivo</span>
          </div>

          {/* Card 3: Finalizados / Calificados */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              {completedCount}
            </div>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Evaluados con nota</span>
          </div>

          {/* Card 4: Promedio de Ajuste */}
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 shadow-2xs">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Ajuste Medio</span>
              <TrendingUp className="w-4 h-4 text-[#1F2A5E]" />
            </div>
            <div className="text-xl font-black text-[#1F2A5E] dark:text-blue-300">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </div>
            <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
              {scoredList.length > 0 ? `${scoredList.length} evaluado${scoredList.length > 1 ? 's' : ''}` : 'Sin evaluaciones'}
            </span>
          </div>

          {/* Card 5: Alertas de Foco */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Alertas Foco</span>
              <ShieldCheck className="w-4 h-4 text-[#E4572E]" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{totalAlerts}</span>
              {totalAlerts === 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">Limpio</span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400">Incidentes de auditoría</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FILTERS & SEARCH BAR                                                   */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-[#1F2A5E] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Todos ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>En Examen ({inProgressCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('SCORED')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'SCORED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Completados ({completedCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('INVITED')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'INVITED'
                  ? 'bg-zinc-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Invitados ({invitedCount})
            </button>

            {totalAlerts > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('WITH_ALERTS')}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  statusFilter === 'WITH_ALERTS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Con Alertas</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar postulante por nombre o DNI…"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CANDIDATES ACTIVITY TABLE / LIST                                       */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-3">
          {filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  No se encontraron postulantes con el criterio seleccionado
                </p>
                <p className="text-xs max-w-md mx-auto">
                  {processCandidates.length === 0
                    ? 'Este proceso no cuenta con postulantes convocados aún. Puedes agregarlos desde el botón "+ Generar nuevo proceso" o invitar candidatos.'
                    : 'Intenta modificar el término de búsqueda o el filtro de estado.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCandidates.map((cand) => {
                const { isFinalist, isScored, isInProgress, isInvited, progressPercent, stageLabel } = getCandidateStatusFlags(cand);
                const alertsCount = (cand.criticalFlags || 0) + (cand.auditEventCount || 0);

                return (
                  <div
                    key={cand.id}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/80 transition-all shadow-2xs hover:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Candidate Identity */}
                    <div className="space-y-1.5 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {cand.fullName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold">
                          DNI: {cand.dni}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{cand.email}</span>
                        </span>
                        {cand.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{cand.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Progress */}
                    <div className="space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                          isFinalist
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : isScored
                            ? 'bg-blue-100 text-[#1F2A5E] dark:bg-blue-950/70 dark:text-blue-300'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-300'
                        }`}>
                          {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                          <span>
                            {isFinalist ? 'Finalista Aprobado' :
                             isScored ? 'Evaluación Calificada' :
                             isInProgress ? 'Rindiendo Examen' : 'Invitación Enviada'}
                          </span>
                        </span>

                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 font-mono">
                          {progressPercent}% completado
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            progressPercent === 100 ? 'bg-emerald-500' :
                            progressPercent > 0 ? 'bg-amber-500' : 'bg-transparent'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{stageLabel}</span>
                        {cand.totalDurationSeconds && (
                          <span>Tiempo: {Math.round(cand.totalDurationSeconds / 60)} min</span>
                        )}
                      </div>
                    </div>

                    {/* Scores & Proctoring Alerts */}
                    <div className="flex items-center gap-4 text-xs shrink-0">
                      {/* Overall Score */}
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 min-w-[70px]">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Puntaje</span>
                        <span className="font-extrabold text-sm text-[#1F2A5E] dark:text-blue-300">
                          {(isScored && cand.scores?.overall != null) ? `${cand.scores.overall}%` : '—'}
                        </span>
                      </div>

                      {/* Job Fit */}
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 min-w-[70px]">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Ajuste</span>
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {(() => {
                            const fitVal = cand.detailedReport?.jobFitPercentage ?? cand.scores?.overall;
                            return (isScored && fitVal != null) ? `${fitVal}%` : '—';
                          })()}
                        </span>
                      </div>

                      {/* Integrity / Focus alerts */}
                      <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 min-w-[70px]">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Foco</span>
                        {alertsCount > 0 ? (
                          <span className="font-extrabold text-xs text-rose-600 flex items-center justify-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{alertsCount}</span>
                          </span>
                        ) : (
                          <span className="font-extrabold text-xs text-emerald-600 flex items-center justify-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>0</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onViewCandidateDetail(cand)}
                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#1F2A5E] hover:bg-blue-50/50 text-[#1F2A5E] dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Auditoría</span>
                      </button>

                      {onSwitchToCandidateExam && (
                        <button
                          type="button"
                          onClick={() => onSwitchToCandidateExam(cand.id)}
                          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 text-xs cursor-pointer transition-colors"
                          title="Simular examen con este candidato"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. FOOTER                                                                 */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0 text-xs">
          <span className="text-zinc-500">
            Mostrando <strong>{filteredCandidates.length}</strong> de <strong>{processCandidates.length}</strong> postulantes en este proceso
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Cerrar Actividad
          </button>
        </div>

      </div>
    </div>
  );
};
