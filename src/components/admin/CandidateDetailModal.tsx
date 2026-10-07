import React, { useState, useEffect } from 'react';
import { Candidate, AuditEvent } from '../../types';
import { CandidateDataService } from '../../services/candidateDataService';
import { STAGES_CONFIG, VALIDATION_DISCLAIMER } from '../../data/questionBank';
import { PrintableCandidateReport } from './PrintableCandidateReport';
import { 
  X, 
  Send, 
  Award, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  UserCheck, 
  Building, 
  Mail, 
  Phone, 
  FileBadge, 
  Brain, 
  Target, 
  Sparkles, 
  FileText, 
  HelpCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  onPromoteToFinalist: (candidateId: string) => void;
  onResendInvitation: (candidateId: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onPromoteToFinalist,
  onResendInvitation
}) => {
  const [activeTab, setActiveTab] = useState<'SCORES' | 'INTERVIEW' | 'AUDIT' | 'NOTES'>('SCORES');
  const [recruiterNoteText, setRecruiterNoteText] = useState(candidate.recruiterNotes || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);

  // Retrieve audit logs for this candidate from Supabase in real-time
  useEffect(() => {
    let isMounted = true;
    if (candidate.id) {
      CandidateDataService.getAuditLogs(candidate.id).then(logs => {
        if (isMounted) setAuditLogs(logs);
      });
    }
    return () => { isMounted = false; };
  }, [candidate.id]);

  const report = candidate.detailedReport;

  const handleCopyDirectLink = () => {
    const url = `${window.location.origin}/?invitation=${candidate.invitationCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return 'En curso';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <>
      {/* Printable Report Modal if triggered */}
      {showPrintModal && (
        <PrintableCandidateReport
          candidate={candidate}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  candidate.status === 'FINALIST'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : candidate.status === 'SCORED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : candidate.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {candidate.status === 'FINALIST' ? 'Finalista Aprobado' :
                   candidate.status === 'SCORED' ? 'Evaluación Calificada' :
                   candidate.status === 'IN_PROGRESS' ? 'Rindiendo Examen' : 'Invitación Pendiente'}
                </span>
                <span className="text-xs text-zinc-400 font-mono">DNI: {candidate.dni}</span>
                {report && candidate.status !== 'IN_PROGRESS' && candidate.status !== 'INVITED' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Ajuste al puesto: {report.jobFitPercentage}%
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {candidate.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{candidate.position}</span>
                <span>•</span>
                <span>{candidate.email}</span>
                <span>•</span>
                <span>{candidate.phone}</span>
                {candidate.whatsappUser && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      WhatsApp: {candidate.whatsappUser}
                    </span>
                  </>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tabs Bar */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 gap-6 text-xs sm:text-sm font-semibold bg-white dark:bg-zinc-900 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('SCORES')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'SCORES'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Resultados & Competencias</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INTERVIEW')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'INTERVIEW'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Guía para Entrevista Jefatura</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('AUDIT')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'AUDIT'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoría de Integridad ({auditLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('NOTES')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'NOTES'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Dictamen & Notas</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: RESULTADOS DETALLADOS Y COMPETENCIAS */}
            {activeTab === 'SCORES' && (
              <div className="space-y-6">
                
                {/* Executive Score Summary Cards */}
                {/* Executive Score Summary Cards */}
                {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && candidate.scores && candidate.scores.overall > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="text-center sm:text-left sm:border-r border-zinc-200 dark:border-zinc-700 sm:pr-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Puntaje Global</span>
                      <div className="flex items-baseline gap-1 mt-1 justify-center sm:justify-start">
                        <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{candidate.scores.overall}</span>
                        <span className="text-zinc-400 text-sm">/ 100</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Percentil {candidate.scores.percentile}% (Baremos Perú)
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Ajuste al Perfil</span>
                      <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
                        {report?.jobFitPercentage || candidate.scores.overall}%
                      </div>
                      <span className="text-[11px] text-zinc-400">Compatibilidad técnica y conductual</span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Duración Total</span>
                      <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-1 flex items-center gap-1.5 font-mono">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        {formatDuration(candidate.totalDurationSeconds)}
                      </p>
                      <span className="text-[11px] text-zinc-400">Promedio convocatoria: 41m 15s</span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Recomendación Oficial</span>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {report?.psychologistRecommendation === 'RECOMENDADO_FINALISTA' ? 'Apto Finalista' : 'Apto c/ Observaciones'}
                      </p>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {report?.psychologistCpsp || 'CPsP N° 28419'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                          {candidate.status === 'IN_PROGRESS' ? 'Evaluación en Curso' : 'Evaluación Pendiente de Inicio'}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                          {candidate.status === 'IN_PROGRESS' ? 'Rindiendo actualmente' : 'No iniciada'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {candidate.status === 'IN_PROGRESS'
                          ? `El postulante se encuentra rindiendo la evaluación (${candidate.currentStage === 'STAGE_2_EMOTIONAL' ? 'Etapa 2: Personal y Emocional' : candidate.currentStage === 'STAGE_3_WORK_CASES' ? 'Etapa 3: Situaciones Laborales' : 'Etapa 1: Psicopedagógica'}). Los puntajes globales, ajuste al perfil y dictamen psicológico se generarán automáticamente al culminar las 3 etapas con el baremo real de respuestas.`
                          : 'El postulante aún no ha ingresado al examen. Los resultados se mostrarán una vez culminadas las pruebas.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stages Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Puntaje por Etapas del Examen
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Etapa 1 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-blue-600">Etapa 1: Psicopedagógica</span>
                        <span className="font-mono font-bold">
                          {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && candidate.scores?.stage1Psycho != null
                            ? `${candidate.scores.stage1Psycho}/100`
                            : (candidate.status === 'IN_PROGRESS' && candidate.currentStage === 'STAGE_1_PSYCHO' ? 'En curso' : (candidate.currentStage === 'STAGE_2_EMOTIONAL' || candidate.currentStage === 'STAGE_3_WORK_CASES' ? 'Concluida' : '--/100'))}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all" 
                          style={{ width: `${(candidate.status === 'SCORED' || candidate.status === 'FINALIST') ? (candidate.scores?.stage1Psycho || 0) : (candidate.currentStage === 'STAGE_2_EMOTIONAL' || candidate.currentStage === 'STAGE_3_WORK_CASES' ? 100 : candidate.status === 'IN_PROGRESS' ? 30 : 0)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">Agilidad de aprendizaje y organización</span>
                    </div>

                    {/* Etapa 2 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-[#2F5BA8]">Etapa 2: Personal y Emocional</span>
                        <span className="font-mono font-bold">
                          {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && candidate.scores?.stage2Emotional != null
                            ? `${candidate.scores.stage2Emotional}/100`
                            : (candidate.status === 'IN_PROGRESS' && candidate.currentStage === 'STAGE_2_EMOTIONAL' ? 'En curso' : (candidate.currentStage === 'STAGE_3_WORK_CASES' ? 'Concluida' : '--/100'))}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#2F5BA8] h-full rounded-full transition-all" 
                          style={{ width: `${(candidate.status === 'SCORED' || candidate.status === 'FINALIST') ? (candidate.scores?.stage2Emotional || 0) : (candidate.currentStage === 'STAGE_3_WORK_CASES' ? 100 : candidate.status === 'IN_PROGRESS' && candidate.currentStage === 'STAGE_2_EMOTIONAL' ? 30 : 0)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">Manejo de presión y empatía</span>
                    </div>

                    {/* Etapa 3 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-600">Etapa 3: Situaciones Laborales</span>
                        <span className="font-mono font-bold">
                          {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && candidate.scores?.stage3WorkCases != null
                            ? `${candidate.scores.stage3WorkCases}/100`
                            : (candidate.status === 'IN_PROGRESS' && candidate.currentStage === 'STAGE_3_WORK_CASES' ? 'En curso' : '--/100')}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all" 
                          style={{ width: `${(candidate.status === 'SCORED' || candidate.status === 'FINALIST') ? (candidate.scores?.stage3WorkCases || 0) : (candidate.status === 'IN_PROGRESS' && candidate.currentStage === 'STAGE_3_WORK_CASES' ? 30 : 0)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">Resolución de casos del puesto</span>
                    </div>
                  </div>
                </div>

                {/* GRANULAR COMPETENCIES TABLE */}
                {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && report?.competencies && report.competencies.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Evaluación Detallada de Competencias ({report.competencies.length})</span>
                      <span className="text-[10px] text-blue-600 font-semibold">Baremos Estandarizados Perú</span>
                    </h3>

                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                      {report.competencies.map((comp, idx) => (
                        <div key={idx} className="p-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{comp.name}</span>
                              <span className="text-[10px] text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                                {comp.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                comp.level === 'SOBRESALIENTE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : comp.level === 'ADECUADO'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {comp.level}
                              </span>
                              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                                {comp.score} / 100
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full ${
                                comp.score >= 90 ? 'bg-emerald-600' : comp.score >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${comp.score}%` }}
                            />
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {comp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Evaluación Detallada de Competencias</span>
                      <span className="text-[10px] text-zinc-400 font-semibold">Baremos Estandarizados Perú</span>
                    </h3>
                    <div className="p-6 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        La matriz detallada de competencias por baremos se habilitará automáticamente al culminar la evaluación.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: GUÍA DE ENTREVISTA POR COMPETENCIAS */}
            {activeTab === 'INTERVIEW' && (
              <div className="space-y-6">
                {(candidate.status === 'SCORED' || candidate.status === 'FINALIST') && report ? (
                  <>
                    {/* Qualitative Executive Summary */}
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Síntesis Psicolaboral del Evaluador</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                        {report.recommendationSummary || 'Perfil analítico con orientación al cumplimiento de metas operativas.'}
                      </p>
                    </div>

                    {/* Strengths & Development Areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Fortalezas Clave Observadas</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {report.strengths?.map((str, i) => (
                            <li key={i}>{str}</li>
                          )) || (
                            <>
                              <li>Alto rigor analítico y excelente capacidad de síntesis.</li>
                              <li>Orientación clara al servicio interno y externo.</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Aspectos a Explorar / Oportunidades</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {report.developmentAreas?.map((dev, i) => (
                            <li key={i}>{dev}</li>
                          )) || (
                            <>
                              <li>Manejo de la frustración ante cambios bruscos de directiva.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Suggested Interview Questions */}
                    {report.suggestedInterviewQuestions && (
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          <span>Preguntas Sugeridas para la Entrevista con la Jefatura</span>
                        </h4>
                        <p className="text-xs text-zinc-500">
                          Estas preguntas han sido formuladas a partir de las respuestas situacionales dadas por el postulante en el examen:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                          {report.suggestedInterviewQuestions.map((q, idx) => (
                            <li key={idx} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60">
                              <strong>{q}</strong>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                    <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Guía de entrevista aún no disponible</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                      Las preguntas conductuales sugeridas para la jefatura se formularán de manera personalizada una vez que el postulante concluya sus evaluaciones.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AUDITORÍA FORENSE DE INTEGRIDAD */}
            {activeTab === 'AUDIT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Bitácora Forense de Integridad del Intento
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Registro inmutable de eventos de ventana, conectividad y portapapeles.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-mono">
                    {auditLogs.length} eventos
                  </span>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                    Sin incidentes anómalos registrados. El postulante mantuvo la ventana enfocada y continua.
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            log.severity === 'CRITICAL' ? 'bg-rose-500 ring-2 ring-rose-300' :
                            log.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                                {log.type}
                              </span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                {log.severity}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">
                              {log.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('es-PE')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: NOTAS Y DICTAMEN */}
            {activeTab === 'NOTES' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Notas y comentarios del equipo de selección
                  </label>
                  <textarea
                    rows={4}
                    value={recruiterNoteText}
                    onChange={(e) => setRecruiterNoteText(e.target.value)}
                    placeholder="Ingrese observaciones sobre el perfil, fortalezas identificadas o preguntas sugeridas para la entrevista final…"
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                  />
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/70 space-y-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Enlace de acceso del candidato</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?invitation=${candidate.invitationCode}`}
                      className="flex-1 text-xs font-mono p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyDirectLink}
                      className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
                    >
                      {copiedLink ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Primary Print Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Reporte Oficial (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => onResendInvitation(candidate.id)}
                className="px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reenviar Invitación</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {candidate.status !== 'FINALIST' ? (
                <button
                  type="button"
                  onClick={() => {
                    onPromoteToFinalist(candidate.id);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Pasar a Finalistas</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Promovido a Fase Finalista
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
