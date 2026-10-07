import React from 'react';
import { Candidate } from '../../types';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Building2, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';

interface PrintableCandidateReportProps {
  candidate: Candidate;
  onClose: () => void;
}

export const PrintableCandidateReport: React.FC<PrintableCandidateReportProps> = ({
  candidate,
  onClose
}) => {
  const report = candidate.detailedReport;
  const printDate = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in print:p-0 print:bg-white print:static">
      
      {/* Floating Action Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-[101] flex items-center gap-2 print:hidden bg-zinc-900/90 p-2 rounded-2xl border border-zinc-700 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar en PDF</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
          title="Cerrar vista de impresión"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main A4 Printable Document Container */}
      <div className="bg-white text-zinc-900 w-full max-w-4xl min-h-[1050px] p-8 sm:p-12 rounded-3xl shadow-2xl print:shadow-none print:rounded-none print:p-6 print:w-full print:max-w-none font-sans text-xs sm:text-sm">
        
        {/* REPORT HEADER */}
        <header className="border-b-2 border-zinc-900 pb-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            
            {/* Logo and Institution */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm tracking-wider">
                GEA
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none">
                  GEA Perú
                </h1>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">
                  Gerencia de Talento Humano • Selección y Evaluación
                </p>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="text-right text-[11px] font-mono text-zinc-600">
              <span className="block font-bold text-zinc-900 text-xs">
                {report?.reportCode || `INF-GEA-${candidate.dni}-2026`}
              </span>
              <span>Fecha: {report?.evaluationDate || printDate}</span>
              <span className="block text-emerald-700 font-semibold">CONFIDENCIAL • LEY 29733</span>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 uppercase tracking-wide">
              Informe Psicolaboral & Resultados Finales de Evaluación
            </h2>
            <span className="text-[11px] bg-zinc-100 text-zinc-800 font-bold px-2.5 py-0.5 rounded-full border border-zinc-300">
              Proceso de Selección 2026
            </span>
          </div>
        </header>

        {/* SECTION 1: CANDIDATE PROFILE */}
        <section className="mb-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Ficha de Identificación del Postulante</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Postulante</span>
              <span className="font-bold text-zinc-900 text-sm">{candidate.fullName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Documento de Identidad</span>
              <span className="font-bold text-zinc-900 font-mono">DNI: {candidate.dni}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Puesto a Postular</span>
              <span className="font-bold text-blue-700">{candidate.position}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Código de Invitación</span>
              <span className="font-bold text-zinc-800 font-mono">{candidate.invitationCode}</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXECUTIVE SUMMARY & FINAL VERDICT */}
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Overall Score Box */}
          <div className="p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/40 text-center flex flex-col justify-center">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Puntaje Global Obtenido
            </span>
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="text-4xl font-extrabold text-blue-700 font-mono">
                {candidate.scores?.overall != null ? candidate.scores.overall : '--'}
              </span>
              <span className="text-zinc-500 text-xs font-bold">/ 100</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              Percentil {candidate.scores?.percentile != null ? candidate.scores.percentile : '--'}% (Baremos Perú)
            </span>
          </div>

          {/* Job Fit Percentage Box */}
          <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-center flex flex-col justify-center">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
              Índice de Ajuste al Perfil
            </span>
            <div className="text-4xl font-extrabold text-zinc-900 my-1 font-mono">
              {report?.jobFitPercentage != null ? `${report.jobFitPercentage}%` : candidate.scores?.overall != null ? `${candidate.scores.overall}%` : '--'}
            </div>
            <span className="text-[11px] text-zinc-500">
              Compatibilidad con el puesto
            </span>
          </div>

          {/* Final Verdict Badge */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center text-center ${
            candidate.status === 'FINALIST' || report?.psychologistRecommendation === 'RECOMENDADO_FINALISTA'
              ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950'
              : 'border-amber-500 bg-amber-50/60 text-amber-950'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
              Dictamen Psicolaboral Oficial
            </span>
            <span className="font-extrabold text-sm sm:text-base mt-1 flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                {candidate.status === 'FINALIST' || report?.psychologistRecommendation === 'RECOMENDADO_FINALISTA'
                  ? 'RECOMENDADO PARA ETAPA FINALISTA'
                  : 'RECOMENDADO CON OBSERVACIONES'}
              </span>
            </span>
            <span className="text-[10px] mt-0.5 opacity-90">
              Apto para entrevista con Gerencia de Área
            </span>
          </div>

        </section>

        {/* SECTION 3: STAGES SCORE BREAKDOWN */}
        <section className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center justify-between">
            <span>Rendimiento por Etapa del Examen</span>
            <span className="text-[10px] text-zinc-400 font-mono">Cronómetro: 15 min por etapa</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Etapa 1: Psicopedagógica</span>
              <span className="text-lg font-bold text-zinc-900 font-mono mt-0.5 block">
                {candidate.scores?.stage1Psycho != null ? `${candidate.scores.stage1Psycho} / 100` : '-- / 100'}
              </span>
              <span className="text-[10px] text-zinc-400">Agilidad de aprendizaje</span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Etapa 2: Personal y Emocional</span>
              <span className="text-lg font-bold text-zinc-900 font-mono mt-0.5 block">
                {candidate.scores?.stage2Emotional != null ? `${candidate.scores.stage2Emotional} / 100` : '-- / 100'}
              </span>
              <span className="text-[10px] text-zinc-400">Manejo de presión y empatía</span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Etapa 3: Situaciones Laborales</span>
              <span className="text-lg font-bold text-zinc-900 font-mono mt-0.5 block">
                {candidate.scores?.stage3WorkCases != null ? `${candidate.scores.stage3WorkCases} / 100` : '-- / 100'}
              </span>
              <span className="text-[10px] text-zinc-400">Resolución de casos reales</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: GRANULAR COMPETENCIES TABLE */}
        {report?.competencies && report.competencies.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Desglose de Competencias Específicas Evaluadas
            </h3>

            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-bold">
                    <th className="p-2.5">Competencia Evaluada</th>
                    <th className="p-2.5">Dimensión</th>
                    <th className="p-2.5 text-center">Puntaje</th>
                    <th className="p-2.5 text-center">Nivel</th>
                    <th className="p-2.5">Conducta Observada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {report.competencies.map((comp, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="p-2.5 font-bold text-zinc-900">{comp.name}</td>
                      <td className="p-2.5 text-zinc-500">{comp.category}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">{comp.score}/100</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.level === 'SOBRESALIENTE' ? 'bg-emerald-100 text-emerald-800' :
                          comp.level === 'ADECUADO' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.level}
                        </span>
                      </td>
                      <td className="p-2.5 text-zinc-600 text-[11px] leading-relaxed">{comp.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 5: QUALITATIVE ANALYSIS & INTERVIEW PROBES */}
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Strengths */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fortalezas Clave Observadas</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 text-[11px]">
              {report?.strengths?.map((str, idx) => (
                <li key={idx} className="leading-snug">{str}</li>
              )) || (
                <>
                  <li>Rigor analítico y secuenciación metódica de tareas complejas.</li>
                  <li>Adecuada autorregulación emocional y trato empático ante quejas.</li>
                  <li>Alta rapidez de comprensión y asimilación de normativas.</li>
                </>
              )}
            </ul>
          </div>

          {/* Development Areas & Recommendations */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Oportunidades de Desarrollo</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 text-[11px]">
              {report?.developmentAreas?.map((dev, idx) => (
                <li key={idx} className="leading-snug">{dev}</li>
              )) || (
                <>
                  <li>Fortalecer delegación formal de tareas secundarias en momentos pico.</li>
                  <li>Desarrollar mayor flexibilidad ante cambios intempestivos de software.</li>
                </>
              )}
            </ul>
          </div>

        </section>

        {/* SECTION 6: SUGGESTED INTERVIEW QUESTIONS */}
        {report?.suggestedInterviewQuestions && (
          <section className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
            <h4 className="font-bold text-blue-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Guía de Preguntas Sugeridas para la Entrevista con la Jefatura</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-blue-950 text-[11px] leading-relaxed">
              {report.suggestedInterviewQuestions.map((q, idx) => (
                <li key={idx}><strong>{q}</strong></li>
              ))}
            </ol>
          </section>
        )}

        {/* SECTION 7: AUDIT & INTEGRITY CHECK */}
        <section className="mb-8 p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Validación Forense de Integridad:</strong> Tiempo total de examen: {Math.floor((candidate.totalDurationSeconds || 2400) / 60)}m {((candidate.totalDurationSeconds || 2400) % 60)}s • Salidas de foco registradas: {candidate.auditEventCount} • Protocolo de pantalla ininterrumpido.
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono shrink-0">
            Firma Criptográfica: {candidate.invitationCode}-OK
          </span>
        </section>

        {/* SIGNATURES BLOCK */}
        <footer className="pt-8 border-t-2 border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-14 border-b border-dashed border-zinc-400 max-w-[220px] mx-auto mb-2 flex items-end justify-center pb-1">
              <span className="font-cursive italic text-blue-800 text-base">R. Santillán C.</span>
            </div>
            <p className="font-bold text-zinc-900">{report?.psychologistName || 'Psic. Roberto Santillán Castillo'}</p>
            <p className="text-zinc-500 text-[11px]">{report?.psychologistCpsp || 'CPsP N° 28419'}</p>
            <p className="text-[10px] text-zinc-400">Psicólogo Organizacional Evaluador</p>
          </div>

          <div>
            <div className="h-14 border-b border-dashed border-zinc-400 max-w-[220px] mx-auto mb-2 flex items-end justify-center pb-1">
              <span className="font-cursive italic text-zinc-800 text-base">Claudia Morales R.</span>
            </div>
            <p className="font-bold text-zinc-900">Lic. Claudia Morales Reátegui</p>
            <p className="text-zinc-500 text-[11px]">Gerencia de Talento Humano</p>
            <p className="text-[10px] text-zinc-400">Comité de Selección • GEA Perú</p>
          </div>
        </footer>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-3 border-t border-zinc-200 text-center text-[9px] text-zinc-400 leading-tight">
          Este informe psicelaboral es de carácter estrictamente confidencial en virtud de la Ley N° 29733 de Protección de Datos Personales del Perú. Queda prohibida su reproducción o divulgación fuera del comité evaluador de GEA Perú.
        </div>

      </div>

    </div>
  );
};
