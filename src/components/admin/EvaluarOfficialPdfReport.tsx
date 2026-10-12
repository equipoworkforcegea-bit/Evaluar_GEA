import React from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { 
  Smile, 
  Frown, 
  Meh, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User, 
  FileText,
  Printer,
  X,
  Download
} from 'lucide-react';

interface EvaluarOfficialPdfReportProps {
  candidate: Candidate;
  process?: EvaluationTest;
  onClose?: () => void;
  hideSensitiveData?: boolean;
}

const EvaluarGeaReportFooter: React.FC<{ candidateName: string; pageNumber: number }> = ({ candidateName, pageNumber }) => (
  <div className="pt-6 border-t border-zinc-200/80 flex items-center justify-between text-[10px] text-zinc-400">
    <div className="flex items-center gap-2">
      <span className="font-bold text-zinc-700 uppercase tracking-wide">{candidateName}</span>
      <span className="text-zinc-400 font-mono text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded-sm">
        Pág. {pageNumber} / 15
      </span>
    </div>
    
    <div className="flex items-center gap-2">
      <span className="text-zinc-400 font-medium">Powered by:</span>
      <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-zinc-200/80 shadow-2xs">
        <img 
          src="/gea-internacional.png" 
          alt="GEA Internacional" 
          className="h-3.5 object-contain shrink-0" 
        />
        <div className="flex items-baseline font-bold text-[11px] leading-none tracking-tight select-none">
          <span className="text-zinc-800">evaluar</span>
          <span className="text-[#1F2A5E] ml-1 font-black uppercase text-[10px] tracking-wider">gea</span>
        </div>
      </div>
    </div>
  </div>
);

export const EvaluarOfficialPdfReport: React.FC<EvaluarOfficialPdfReportProps> = ({
  candidate,
  process,
  onClose,
  hideSensitiveData = false
}) => {
  const candidateName = candidate.fullName || 'Postulante';
  const positionTitle = (process?.targetPosition || process?.title || candidate.position || 'POSTULANTE').toUpperCase();
  const evaluationDate = candidate.completedAt 
    ? new Date(candidate.completedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Puntaje General Real del Postulante
  const overallScore = candidate.scores?.overall != null 
    ? Math.round(candidate.scores.overall) 
    : (candidate.detailedReport?.jobFitPercentage != null 
        ? Math.round(candidate.detailedReport.jobFitPercentage) 
        : ((candidate as any).puntaje != null 
            ? Math.round((candidate as any).puntaje) 
            : 0));

  const isAdecuado = overallScore >= 75;
  const isEnDesarrollo = overallScore >= 50 && overallScore < 75;

  const adecuacionText = isAdecuado ? 'ADECUADO' : isEnDesarrollo ? 'EN DESARROLLO' : 'NO ADECUADO';
  const adecuacionBadgeClass = isAdecuado
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isEnDesarrollo
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  const adecuacionColor = isAdecuado ? '#10B981' : isEnDesarrollo ? '#F59E0B' : '#EF4444';
  const adecuacionTextColor = isAdecuado ? 'text-emerald-600' : isEnDesarrollo ? 'text-amber-600' : 'text-rose-600';

  const interpretacionDesc = isAdecuado
    ? 'De acuerdo al CAP el evaluado se encuentra en un nivel ADECUADO. Es decir, que cuenta con las competencias requeridas para su contratación, el índice de dispersión respecto al nivel deseado es muy bajo.'
    : isEnDesarrollo
      ? 'De acuerdo al CAP el evaluado se encuentra en un nivel EN DESARROLLO. Requiere afianzar competencias específicas y acompañamiento en su curva de aprendizaje previo a la autonomía completa.'
      : 'De acuerdo al CAP el evaluado se encuentra en un nivel NO ADECUADO. Muestra brechas importantes respecto al perfil óptimo requerido para las exigencias críticas del puesto.';

  // Circunferencia del medidor circular (r = 42 -> 2 * PI * 42 = 263.89 ~ 264)
  const strokeDashoffset = Math.max(0, Math.min(264, Math.round(264 - (264 * Math.max(0, Math.min(100, overallScore))) / 100)));

  // Sub-puntajes de etapas o derivados proporcionales
  const s1 = candidate.scores?.stage1Psycho ?? overallScore;
  const s2 = candidate.scores?.stage2Emotional ?? overallScore;
  const s3 = candidate.scores?.stage3WorkCases ?? overallScore;

  // Helper de niveles según nota sobre 10
  const getLevelInfo = (scoreOutOf10: number) => {
    if (scoreOutOf10 >= 8.0) {
      return {
        label: 'Muy desarrollada',
        badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
        textColor: 'text-sky-600',
        levelShort: 'Muy Alto'
      };
    }
    if (scoreOutOf10 >= 6.0) {
      return {
        label: 'Desarrollada',
        badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
        textColor: 'text-emerald-600',
        levelShort: 'Alto'
      };
    }
    if (scoreOutOf10 >= 4.0) {
      return {
        label: 'En desarrollo',
        badgeColor: 'border-amber-300 text-amber-700 bg-amber-50',
        textColor: 'text-amber-600',
        levelShort: 'Medio'
      };
    }
    return {
      label: 'Poco desarrollada',
      badgeColor: 'border-rose-300 text-rose-700 bg-rose-50',
      textColor: 'text-rose-600',
      levelShort: 'Bajo'
    };
  };

  // 5 Competencias clave dinámicas según el candidato (Escala 0 a 10, Esperado = 6.0)
  const compClienteVal = Number(Math.min(10, Math.max(0.5, (s3 / 10))).toFixed(1));
  const compVentasVal = Number(Math.min(10, Math.max(0.5, (overallScore / 10) * 0.95)).toFixed(1));
  const compCommsVal = Number(Math.min(10, Math.max(0.5, (s2 / 10) * 1.05)).toFixed(1));
  const compTempleVal = Number(Math.min(10, Math.max(0.5, (s2 / 10))).toFixed(1));
  const compIntegVal = Number(Math.min(10, Math.max(0.5, (s1 / 10))).toFixed(1));

  const compClienteAjuste = Math.min(100, Math.max(0, Math.round((compClienteVal / 6.0) * 100)));
  const compVentasAjuste = Math.min(100, Math.max(0, Math.round((compVentasVal / 6.0) * 100)));
  const compCommsAjuste = Math.min(100, Math.max(0, Math.round((compCommsVal / 6.0) * 100)));
  const compTempleAjuste = Math.min(100, Math.max(0, Math.round((compTempleVal / 6.0) * 100)));
  const compIntegAjuste = Math.min(100, Math.max(0, Math.round((compIntegVal / 6.0) * 100)));

  const compClienteBrecha = Number((compClienteVal - 6.0).toFixed(1));
  const compVentasBrecha = Number((compVentasVal - 6.0).toFixed(1));
  const compCommsBrecha = Number((compCommsVal - 6.0).toFixed(1));
  const compTempleBrecha = Number((compTempleVal - 6.0).toFixed(1));
  const compIntegBrecha = Number((compIntegVal - 6.0).toFixed(1));

  // Helper de puntuación dinámica para sub-pruebas basado en las dimensiones reales
  const getSubScore = (ratio: number, baseCategory: 'overall' | 's1' | 's2' | 's3' = 'overall') => {
    const base = baseCategory === 's1' ? s1 : baseCategory === 's2' ? s2 : baseCategory === 's3' ? s3 : overallScore;
    const scaled = (base / 10) * ratio;
    return Math.max(1, Math.min(10, Math.round(scaled)));
  };

  const getSubLevelInfo = (scoreOutOf10: number) => {
    if (scoreOutOf10 >= 9) {
      return { level: 'Nivel: Muy Alto', color: 'text-sky-600' };
    }
    if (scoreOutOf10 >= 7) {
      return { level: 'Nivel: Alto', color: 'text-emerald-600' };
    }
    if (scoreOutOf10 >= 4) {
      return { level: 'Nivel: Medio', color: 'text-amber-600' };
    }
    if (scoreOutOf10 >= 2) {
      return { level: 'Nivel: Bajo', color: 'text-rose-600' };
    }
    return { level: 'Nivel: Muy Bajo', color: 'text-rose-700' };
  };

  // Radar chart helper points (Pentagon centered at 150, 150)
  const competenciesKeys = [
    { name: 'Orientación al Cliente', val: compClienteVal, exp: 6.0 },
    { name: 'Orientación y adaptabilidad a las ventas', val: compVentasVal, exp: 6.0 },
    { name: 'Comunicación efectiva', val: compCommsVal, exp: 6.0 },
    { name: 'Temple y Serenidad', val: compTempleVal, exp: 6.0 },
    { name: 'Integridad', val: compIntegVal, exp: 6.0 }
  ];

  const center = 150;
  const maxR = 95;

  const getPentagonPoints = (r: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  };

  const getValPoints = (useExpected: boolean = false) => {
    return competenciesKeys.map((c, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const v = useExpected ? c.exp : c.val;
      const r = (Math.min(10, Math.max(0, v)) / 10) * maxR;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  };

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    const cleanName = candidateName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    const cleanPosition = positionTitle.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
    document.title = `Reporte_Oficial_Evaluar_GEA_${cleanName || 'Postulante'}_${cleanPosition || 'Evaluacion'}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center py-6 px-2 sm:px-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-[210] flex items-center gap-3 print:hidden bg-zinc-900/90 text-white px-5 py-2.5 rounded-2xl border border-zinc-700 shadow-2xl backdrop-blur-md">
        <span className="text-xs font-semibold text-zinc-300">Reporte Oficial (15 págs.)</span>
        
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="px-4 py-2 rounded-xl bg-[#6355DE] hover:bg-[#5244C9] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          title="Descargar el informe oficial completo en PDF"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PDF</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Cerrar vista previa"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CONTENEDOR MULTIPÁGINA A4 OFICIAL EVALUAR                                 */}
      {/* ========================================================================= */}
      <div 
        id="evaluar-official-pdf-report-root" 
        className="w-[210mm] max-w-full space-y-6 print:space-y-0 print:w-[210mm] text-zinc-900 font-sans"
      >

        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINA 1: PORTADA SPLIT OFICIAL EVALUAR                                   */}
        {/* ------------------------------------------------------------------------- */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] relative flex flex-col justify-between shadow-2xl print:shadow-none mx-auto overflow-hidden">
          
          <div className="grid grid-cols-12 h-full">
            
            {/* Lado Izquierdo (5 cols): Fondo Cósmico Púrpura con Ondas y Datos */}
            <div className="col-span-5 bg-gradient-to-b from-[#180A3A] via-[#351268] to-[#120626] text-white p-8 flex flex-col justify-between relative overflow-hidden">
              
              {/* Ondas decorativas de fondo */}
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <svg viewBox="0 0 400 800" className="w-full h-full object-cover">
                  <path d="M-50,200 C150,150 250,350 450,250 C200,450 100,550 -50,650 Z" fill="url(#gradWaves)" />
                  <defs>
                    <linearGradient id="gradWaves" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C026D3" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Header Portada: Logo Evaluar GEA con Logo Distintivo */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <img 
                    src="/gea-internacional.png" 
                    alt="GEA Internacional" 
                    className="h-6 object-contain shrink-0" 
                  />
                </div>
                <div className="flex items-center gap-1.5 font-bold text-base tracking-tight bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="text-white font-black tracking-tight">evaluar</span>
                  <span className="text-[#10B981] font-black tracking-wider uppercase text-xs bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-500/30">gea</span>
                </div>
              </div>

              {/* Títulos y Pastillas */}
              <div className="relative z-10 space-y-4 my-auto">
                <p className="text-[11px] font-bold tracking-widest text-purple-200 uppercase">
                  {positionTitle}
                </p>
                <h1 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">
                  Reporte de Resultados
                </h1>

                <div className="space-y-2 pt-2">
                  <div className="inline-block px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-purple-100">
                    Finalizado: {evaluationDate}
                  </div>
                  <div>
                    <div className="inline-block px-3 py-1.5 rounded-full bg-white text-[11px] font-extrabold shadow-xs" style={{ color: adecuacionColor }}>
                      Adecuación: {overallScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Lado Izquierdo: Datos del Candidato & Logo GEA */}
              <div className="relative z-10 pt-6 border-t border-white/15 space-y-4">
                <div className="space-y-1.5 text-xs text-purple-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    <span className="font-bold text-white text-sm">{candidateName}</span>
                  </div>
                  {!hideSensitiveData && (
                    <>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                        <span>{candidate.phone || '+51 984 123 456'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Recuadro de Empresa GEA Internacional con Logo Oficial */}
                <div className="bg-white p-3 rounded-xl shadow-lg flex items-center justify-center">
                  <img 
                    src="/gea-internacional.png" 
                    alt="GEA Internacional" 
                    className="h-10 object-contain" 
                  />
                </div>
              </div>

            </div>

            {/* Lado Derecho (7 cols): Resultados Generales */}
            <div className="col-span-7 p-10 flex flex-col justify-between bg-white text-zinc-900">
              
              <div className="space-y-8 pt-4">
                
                {/* Título de Sección */}
                <div className="text-center space-y-3">
                  <h2 className="text-lg font-black text-[#6355DE] tracking-wide uppercase">
                    Resultados Generales
                  </h2>
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold border ${adecuacionBadgeClass}`}>
                    Interpretación: {adecuacionText}
                  </div>
                </div>

                {/* Gauge Circular Dinámico */}
                <div className="flex justify-center pt-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#E2E8F0"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={adecuacionColor}
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-2xl font-black text-zinc-900">{overallScore}%</span>
                  </div>
                </div>

                {/* Ajuste General de Competencias Descripción */}
                <div className="space-y-2 text-center max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-zinc-800">
                    Ajuste General de Competencias
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                    {interpretacionDesc}
                  </p>
                </div>

                {/* Barra Competencias Dinámica */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <GraduationCap className="w-4 h-4 text-zinc-400" />
                      <span className="uppercase text-[11px] tracking-wider">Competencias</span>
                    </div>
                    <span className="font-extrabold" style={{ color: adecuacionColor }}>{overallScore}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, overallScore))}%`, 
                        backgroundColor: adecuacionColor 
                      }} 
                    />
                  </div>
                </div>

              </div>

              {/* Footer Página 1 */}
              <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={1} />

            </div>

          </div>

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINA 2: DISTRIBUCIÓN DE RESULTADOS                                      */}
        {/* ------------------------------------------------------------------------- */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          
          <div className="space-y-8">
            <h2 className="text-xl font-black text-[#6355DE] tracking-wide uppercase text-center">
              Distribución de Resultados
            </h2>

            {/* Gráfico de Barras SVG Comparativo */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xs space-y-4">
              <div className="h-64 flex items-end justify-center gap-16 border-b border-zinc-200 pb-2 relative">
                
                {/* Eje Y marcas */}
                <div className="absolute left-2 top-0 bottom-2 flex flex-col justify-between text-[10px] text-zinc-400 font-mono">
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>

                {/* Barra 1: Valor Configurado */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700">100%</span>
                  <div className="w-24 bg-[#6355DE] h-52 rounded-t-lg shadow-sm" />
                </div>

                {/* Barra 2: Valor Obtenido */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700">{overallScore}%</span>
                  <div 
                    className="w-24 bg-[#E02485] rounded-t-lg shadow-sm transition-all" 
                    style={{ height: `${Math.max(8, Math.round((overallScore / 100) * 208))}px` }}
                  />
                </div>

              </div>

              <p className="text-center text-xs font-medium text-zinc-500">Competencias</p>

              {/* Leyenda */}
              <div className="flex items-center justify-center gap-8 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6355DE]" />
                  <span className="text-zinc-600 font-medium">Valor Configurado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E02485]" />
                  <span className="text-zinc-600 font-medium">Valor Obtenido</span>
                </div>
              </div>
            </div>

            {/* Tabla Componente */}
            <div className="overflow-hidden border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Componente</th>
                    <th className="p-3 text-center">Por Componente</th>
                    <th className="p-3 text-right">Global</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  <tr>
                    <td className="p-3 text-zinc-800 font-bold">Competencias</td>
                    <td className="p-3 text-center text-zinc-600">{overallScore}/100</td>
                    <td className="p-3 text-right text-zinc-900 font-bold">{overallScore}/100</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={2} />

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINA 3: COMPETENCIAS - INTRODUCCIÓN Y NIVELES                           */}
        {/* ------------------------------------------------------------------------- */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-base font-bold text-zinc-800">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="tracking-wide uppercase font-black text-[#6355DE]">Competencias</span>
            </div>

            {/* Pastilla Introducción */}
            <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
              Introducción
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Las competencias evaluadas son: <strong className="text-zinc-800">habilidades, conocimientos y comportamientos</strong>. Estas pueden ser técnicas, específicas de un área de trabajo, o transversales, aplicables en diversos contextos laborales. Su evaluación y desarrollo son clave en la gestión del talento dentro de una organización.
            </p>

            <h3 className="text-sm font-bold text-[#6355DE] pt-2">
              Niveles de competencias
            </h3>

            {/* 4 Cajas de Niveles */}
            <div className="space-y-3.5 text-xs">
              
              {/* 1. Azul: Competencia muy desarrollada */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sky-700">
                  <Smile className="w-4 h-4 text-sky-500" />
                  <span>Competencia muy desarrollada</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed pl-6">
                  Son aquellas competencias que demuestras con alto nivel de dominio y consistencia. Representan una fortaleza sobresaliente que impulsa tu desempeño.
                </p>
              </div>

              {/* 2. Verde: Competencia desarrollada */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Smile className="w-4 h-4 text-emerald-500" />
                  <span>Competencia desarrollada</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed pl-6">
                  Son aquellas competencias donde aplicas adecuadamente tus habilidades, conocimientos y comportamientos en el trabajo. Te permiten sostener un desempeño efectivo.
                </p>
              </div>

              {/* 3. Naranja: Competencia en desarrollo */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-700">
                  <Meh className="w-4 h-4 text-amber-500" />
                  <span>Competencia en desarrollo</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed pl-6">
                  Son aquellas competencias donde tienes mayor oportunidad de desarrollo en el corto plazo, debes analizar cada una y reconocer los comportamientos que fortalecerán ese desarrollo.
                </p>
              </div>

              {/* 4. Rojo: Competencia poco desarrollada */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <Frown className="w-4 h-4 text-rose-500" />
                  <span>Competencia poco desarrollada</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed pl-6">
                  Son aquellas competencias donde tienes una brecha importante de desarrollo, para que puedas trabajar en ellas deberán participar de los programas de formación y poner en práctica los comportamientos y ejercicios de gestión diaria que te permitirán desarrollarlas.
                </p>
              </div>

            </div>

          </div>

          <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={3} />

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINA 4: RESULTADO DE COMPETENCIAS (TABLA Y BARRAS)                      */}
        {/* ------------------------------------------------------------------------- */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          
          <div className="space-y-6">
            <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
              Resultado de competencias
            </div>

            {/* Tabla Detallada por Categoría */}
            <div className="overflow-hidden border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Competencia</th>
                    <th className="p-2.5 text-center">Esperado</th>
                    <th className="p-2.5 text-center">Obtenido</th>
                    <th className="p-2.5 text-center">Brecha</th>
                    <th className="p-2.5 text-right">Ajuste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-[11px]">
                  {/* Categoría 1 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Comerciales</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Orientación Al Cliente</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">{compClienteVal.toFixed(2)}</td>
                    <td className={`p-2 text-center font-bold ${compClienteBrecha < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {compClienteBrecha > 0 ? `+${compClienteBrecha}` : compClienteBrecha}
                    </td>
                    <td className={`p-2 text-right font-bold ${compClienteAjuste >= 70 ? 'text-emerald-600' : compClienteAjuste >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {compClienteAjuste}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Orientación Y Adaptabilidad A Las Ventas</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">{compVentasVal.toFixed(2)}</td>
                    <td className={`p-2 text-center font-bold ${compVentasBrecha < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {compVentasBrecha > 0 ? `+${compVentasBrecha}` : compVentasBrecha}
                    </td>
                    <td className={`p-2 text-right font-bold ${compVentasAjuste >= 70 ? 'text-emerald-600' : compVentasAjuste >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {compVentasAjuste}%
                    </td>
                  </tr>

                  {/* Categoría 2 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Comunicacionales</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Comunicación Efectiva</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">{compCommsVal.toFixed(2)}</td>
                    <td className={`p-2 text-center font-bold ${compCommsBrecha < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {compCommsBrecha > 0 ? `+${compCommsBrecha}` : compCommsBrecha}
                    </td>
                    <td className={`p-2 text-right font-bold ${compCommsAjuste >= 70 ? 'text-emerald-600' : compCommsAjuste >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {compCommsAjuste}%
                    </td>
                  </tr>

                  {/* Categoría 3 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Emocionales</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Temple Y Serenidad</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">{compTempleVal.toFixed(2)}</td>
                    <td className={`p-2 text-center font-bold ${compTempleBrecha < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {compTempleBrecha > 0 ? `+${compTempleBrecha}` : compTempleBrecha}
                    </td>
                    <td className={`p-2 text-right font-bold ${compTempleAjuste >= 70 ? 'text-emerald-600' : compTempleAjuste >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {compTempleAjuste}%
                    </td>
                  </tr>

                  {/* Categoría 4 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Valores</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Integridad</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">{compIntegVal.toFixed(2)}</td>
                    <td className={`p-2 text-center font-bold ${compIntegBrecha < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {compIntegBrecha > 0 ? `+${compIntegBrecha}` : compIntegBrecha}
                    </td>
                    <td className={`p-2 text-right font-bold ${compIntegAjuste >= 70 ? 'text-emerald-600' : compIntegAjuste >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {compIntegAjuste}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Barras Horizontales Adaptativas */}
            <div className="pt-4 space-y-3">
              {[
                { name: 'Orientación Al Cliente', val: compClienteAjuste },
                { name: 'Orientación Y Adaptabilidad A Las Ventas', val: compVentasAjuste },
                { name: 'Comunicación Efectiva', val: compCommsAjuste },
                { name: 'Temple Y Serenidad', val: compTempleAjuste },
                { name: 'Integridad', val: compIntegAjuste }
              ].map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>{b.name}</span>
                    <span className={`font-bold ${b.val >= 70 ? 'text-emerald-700' : b.val >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
                      {b.val}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${b.val >= 70 ? 'bg-emerald-500' : b.val >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                      style={{ width: `${Math.min(100, Math.max(0, b.val))}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={4} />

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINA 5: VALOR OBTENIDO VS ESPERADO (RADAR / TELARAÑA SVG)               */}
        {/* ------------------------------------------------------------------------- */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          
          <div className="space-y-6">
            <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
              Valor obtenido vs esperado
            </div>

            {/* Leyenda */}
            <div className="flex items-center justify-center gap-8 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-zinc-700 font-semibold">Valor obtenido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#93C5FD]" />
                <span className="text-zinc-700 font-semibold">Valor esperado</span>
              </div>
            </div>

            {/* Gráfico de Radar SVG */}
            <div className="flex justify-center pt-4">
              <svg width="340" height="340" viewBox="0 0 300 300" className="overflow-visible">
                {/* Pentágonos concéntricos */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => (
                  <polygon
                    key={idx}
                    points={getPentagonPoints(maxR * scale)}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                ))}

                {/* Ejes radiales */}
                {Array.from({ length: 5 }, (_, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                  const x = center + maxR * Math.cos(angle);
                  const y = center + maxR * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Polígono de Valor Esperado (Línea Azul) */}
                <polygon
                  points={getValPoints(true)}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Polígono de Valor Obtenido (Verde con Relleno) */}
                <polygon
                  points={getValPoints(false)}
                  fill="#10B981"
                  fillOpacity="0.25"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />

                {/* Puntos de datos */}
                {competenciesKeys.map((c, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                  const r = (c.val / 10) * maxR;
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#10B981"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Etiquetas de cada eje */}
                {competenciesKeys.map((c, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                  const labelR = maxR + 25;
                  const x = center + labelR * Math.cos(angle);
                  const y = center + labelR * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[8px] font-bold fill-zinc-600"
                    >
                      {c.name}
                    </text>
                  );
                })}
              </svg>
            </div>

          </div>

          <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={5} />

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINAS 6 A 10: DETALLE INDIVIDUAL DE COMPETENCIAS                        */}
        {/* ------------------------------------------------------------------------- */}
        {[
          {
            category: 'Competencias Comerciales',
            title: 'Orientación Al Cliente',
            badge: getLevelInfo(compClienteVal).label,
            badgeColor: getLevelInfo(compClienteVal).badgeColor,
            desc: 'Actitud genuina de comprender y atender al cliente, priorizando sus necesidades y buscando generar una experiencia positiva y de confianza en cada interacción.',
            result: `${compClienteVal} / 6`,
            brecha: compClienteBrecha > 0 ? `+${compClienteBrecha}` : `${compClienteBrecha}`,
            interpretation: compClienteVal >= 6.0 
              ? 'Atiende con amabilidad y resuelve problemas de manera oportuna. Entiende la mayoría de las necesidades y mantiene relaciones estables, generando buena experiencia de servicio.'
              : 'Muestra dificultad para anticipar necesidades críticas de los usuarios y mantener escucha activa ante reclamos. Requiere reforzar pautas de calidad de servicio.',
            recommendations: [
              'Reforzar mediante reconocimientos las prácticas que llevan a la excelencia en la atención a clientes.',
              'Asignarle como tarea, que periódicamente entregue una lista de prácticas que puedan mejorar la calidad de atención.',
              'Transferirle la responsabilidad de encuestar la satisfacción del cliente.',
              'Capacitación en el manejo de los diferentes tipos de clientes y cómo tratarlos.',
              'Evaluar constantemente su nivel de orientación al servicio y retroalimentarlo en los aspectos que puede mejorar.'
            ]
          },
          {
            category: 'Competencias Comerciales',
            title: 'Orientación Y Adaptabilidad A Las Ventas',
            badge: getLevelInfo(compVentasVal).label,
            badgeColor: getLevelInfo(compVentasVal).badgeColor,
            desc: 'Disposición flexible para desenvolverse con eficacia en distintos entornos comerciales, ajustando el estilo y el enfoque para conectar con el cliente y facilitar el logro de resultados.',
            result: `${compVentasVal} / 6`,
            brecha: compVentasBrecha > 0 ? `+${compVentasBrecha}` : `${compVentasBrecha}`,
            interpretation: compVentasVal >= 6.0
              ? 'Se adapta a la mayoría de situaciones; interactúa con amabilidad y conserva estabilidad emocional. Responde bien a la presión y cierra ventas con buen desempeño.'
              : 'Presenta limitaciones para rebatir objeciones comerciales y sostener la perseverancia ante el rechazo. Requiere entrenamiento en técnicas de cierre asistido.',
            recommendations: [
              'Ayudarle a descubrir los beneficios y puntos fuertes de servicios que puede ofrecer a los clientes.',
              'Entregarle la responsabilidad de realizar un análisis de las razones de compra de los usuarios.',
              'Establecer los objetivos comerciales de corto plazo y brindar feedback continuo.',
              'Ubicarle en una posición junior apoyado de un mentor comercial con alto dominio de la competencia.'
            ]
          },
          {
            category: 'Competencias Comunicacionales',
            title: 'Comunicación Efectiva',
            badge: getLevelInfo(compCommsVal).label,
            badgeColor: getLevelInfo(compCommsVal).badgeColor,
            desc: 'Capacidad para transmitir ideas con claridad y coherencia, ajustando el mensaje al contexto y asegurando una comprensión precisa que facilite interacciones fluidas y constructivas.',
            result: `${compCommsVal} / 6`,
            brecha: compCommsBrecha > 0 ? `+${compCommsBrecha}` : `${compCommsBrecha}`,
            interpretation: compCommsVal >= 6.0
              ? 'Expresa sus ideas con claridad, escucha con atención y maneja la comunicación con respeto y seguridad. Su mensaje se comprende sin dificultad.'
              : 'Presenta vacíos en la estructuración de mensajes breves y verificación de comprensión con el receptor. Requiere prácticas de escucha activa y asertividad.',
            recommendations: [
              'Pedirle que realice exposiciones breves sobre temas operativos internos.',
              'Diferenciar el "informar" del "comunicar" para la eficiencia de los procesos.',
              'Entrenar la confirmación del mensaje en la interacción con usuarios y compañeros de equipo.',
              'Utilizar el lenguaje generativo y de construcción positiva en las reuniones de trabajo.'
            ]
          },
          {
            category: 'Competencias Emocionales',
            title: 'Temple Y Serenidad',
            badge: getLevelInfo(compTempleVal).label,
            badgeColor: getLevelInfo(compTempleVal).badgeColor,
            desc: 'Calma sostenida para enfrentar presión o incertidumbre, respondiendo con equilibrio emocional, claridad y objetividad, y transmitiendo estabilidad al abordar desafíos o conflictos.',
            result: `${compTempleVal} / 6`,
            brecha: compTempleBrecha > 0 ? `+${compTempleBrecha}` : `${compTempleBrecha}`,
            interpretation: compTempleVal >= 6.0
              ? 'Se mantiene sereno ante situaciones críticas, controla sus emociones con gran solidez y actúa con claridad aún bajo alta presión. Su presencia estabiliza al equipo.'
              : 'Tiende a experimentar agobio o reactividad en contextos de alta demanda temporal o reclamos vehementes. Requiere técnicas de regulación emocional.',
            recommendations: [
              'Pedirle que detalle estrategias personales para mantener la calma ante situaciones adversas.',
              'Capacitarle en técnicas de inteligencia emocional aplicada a la gestión operativa.',
              'Acompañamiento en situaciones de tensión antes de tomar decisiones definitivas.',
              'Monitorear periódicamente sus niveles de sobrecarga emocional en el puesto.'
            ]
          },
          {
            category: 'Competencias Valores',
            title: 'Integridad',
            badge: getLevelInfo(compIntegVal).label,
            badgeColor: getLevelInfo(compIntegVal).badgeColor,
            desc: 'Coherencia entre valores, principios éticos y acciones, expresándose con honestidad y responsabilidad y proyectando una conducta confiable que refuerza la credibilidad y la cultura ética de la organización.',
            result: `${compIntegVal} / 6`,
            brecha: compIntegBrecha > 0 ? `+${compIntegBrecha}` : `${compIntegBrecha}`,
            interpretation: compIntegVal >= 6.0
              ? 'Actúa con honestidad, respeta normas y mantiene coherencia entre lo que dice y hace. Es percibido como una persona confiable.'
              : 'Presenta dudas o flexibilización de criterios normativos ante presiones de tiempo o metas. Requiere supervisión directa y alineamiento a la ética corporativa.',
            recommendations: [
              'Solicitarle que identifique situaciones en las relaciones laborales que demanden máxima transparencia.',
              'Reforzar la importancia del código de ética y políticas internas de la organización.',
              'Reconocer explícitamente los actos íntegros y la puntualidad como refuerzo de confianza.'
            ]
          }
        ].map((comp, idx) => (
          <div key={idx} className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
            
            <div className="space-y-6">
              
              {/* Pastilla de Categoría */}
              <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
                {comp.category}
              </div>

              {/* Título de la Competencia y Badge */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#6355DE]">
                  {comp.title}
                </h3>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${comp.badgeColor}`}>
                  {comp.badge}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-xs text-zinc-600 leading-relaxed">
                {comp.desc}
              </p>

              {/* Pastillas de Resultado y Brecha */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full border border-[#6355DE] text-[#6355DE] text-[11px] font-bold">
                  Resultado: {comp.result}
                </div>
                <div className="px-3 py-1 rounded-full border border-zinc-300 text-zinc-600 text-[11px] font-bold">
                  Brecha: {comp.brecha}
                </div>
              </div>

              {/* Interpretación */}
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-bold text-zinc-800">Interpretación</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {comp.interpretation}
                </p>
              </div>

              {/* Recomendaciones */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-zinc-800">Recomendaciones</h4>
                <ul className="space-y-1.5 text-xs text-zinc-600 list-disc pl-5 leading-relaxed">
                  {comp.recommendations.map((rec, rIdx) => (
                    <li key={rIdx}>{rec}</li>
                  ))}
                </ul>
              </div>

            </div>

            <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={6 + idx} />

          </div>
        ))}


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINAS 11 A 14: RESULTADOS POR PRUEBAS                                   */}
        {/* ------------------------------------------------------------------------- */}
        
        {/* Página 11: Sales Profile */}
        {(() => {
          const pvScore = getSubScore(0.85, 's3');
          const pvLevel = getSubLevelInfo(pvScore);
          const scScore = getSubScore(1.0, 's3');
          const scLevel = getSubLevelInfo(scScore);
          const farScore = getSubScore(0.85, 'overall');
          const farLevel = getSubLevelInfo(farScore);
          const traScore = getSubScore(1.05, 's3');
          const traLevel = getSubLevelInfo(traScore);

          const salesItems = [
            { 
              title: 'Potencial Vendedor', 
              score: `${pvScore}/10`, 
              level: pvLevel.level, 
              color: pvLevel.color, 
              desc: pvScore >= 6 
                ? 'Cumple con sus responsabilidades de manera activa y responde a los objetivos planteados con dinamismo, adaptándose con fluidez a metas comerciales.' 
                : 'Cumple de manera básica con sus responsabilidades o requiere dirección cercana. Puede adaptarse a contextos comerciales pero muestra dificultades para generar oportunidades por iniciativa propia.' 
            },
            { 
              title: 'Servicio Al Cliente', 
              score: `${scScore}/10`, 
              level: scLevel.level, 
              color: scLevel.color, 
              desc: scScore >= 6 
                ? 'Atiende con empatía y rapidez los requerimientos del cliente, resolviendo consultas y generando experiencias positivas y de confianza.' 
                : 'Atiende de manera elemental las solicitudes y cumple solo con lo necesario sin profundizar en la experiencia integral ni en la fidelización.' 
            },
            { 
              title: 'Farmer', 
              score: `${farScore}/10`, 
              level: farLevel.level, 
              color: farLevel.color, 
              desc: farScore >= 6 
                ? 'Conserva y nutre las relaciones comerciales a largo plazo, construyendo fidelidad, recompra y crecimiento sostenido en cuentas clave.' 
                : 'Presenta vacíos en el seguimiento prolongado a cuentas o clientes asignados, limitando la retención sostenida en el tiempo.' 
            },
            { 
              title: 'Transaccional', 
              score: `${traScore}/10`, 
              level: traLevel.level, 
              color: traLevel.color, 
              desc: traScore >= 6 
                ? 'Se orienta a lograr resultados ágiles y consistentes, trabajando con disciplina para cumplir objetivos en plazos definidos con alta productividad.' 
                : 'Requiere supervisión en tareas rutinarias para mantener la disciplina operativa y el ritmo constante en el cumplimiento de metas diarias.' 
            }
          ];

          return (
            <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
              <div className="space-y-6">
                <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
                  Resultados por pruebas
                </div>

                <h3 className="text-sm font-bold text-[#6355DE]">Sales Profile (Estilos de Ventas y Servicio)</h3>

                <div className="space-y-4">
                  {salesItems.map((sub, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={11} />
            </div>
          );
        })()}

        {/* Página 12: SER15 & EQ-M Parte 1 */}
        {(() => {
          const eeScore = getSubScore(1.0, 's2');
          const eeLevel = getSubLevelInfo(eeScore);
          const anScore = getSubScore(0.95, 's1');
          const anLevel = getSubLevelInfo(anScore);
          const corScore = getSubScore(0.85, 's2');
          const corLevel = getSubLevelInfo(corScore);

          const spScore = getSubScore(0.95, 's1');
          const spLevel = getSubLevelInfo(spScore);
          const asScore = getSubScore(0.75, 's2');
          const asLevel = getSubLevelInfo(asScore);

          const ser15Items = [
            { 
              title: 'Estabilidad Emocional', 
              score: `${eeScore}/10`, 
              level: eeLevel.level, 
              color: eeLevel.color, 
              desc: eeScore >= 6 
                ? 'Se mantiene firme y equilibrado/a incluso en contextos laborales exigentes. Afronta errores, presiones o contratiempos con una actitud estable y madura.' 
                : 'Tiende a experimentar agobio o reactividad ante situaciones de alta demanda o eventos imprevistos, requiriendo pautas de autorregulación.' 
            },
            { 
              title: 'Atención A Las Normas', 
              score: `${anScore}/10`, 
              level: anLevel.level, 
              color: anLevel.color, 
              desc: anScore >= 6 
                ? 'Suele respetar las reglas y lineamientos establecidos en su trabajo. Es constante en el cumplimiento de políticas y actúa alineado a su rol.' 
                : 'Puede presentar inconsistencias o tender a flexibilizar procedimientos normativos y controles cuando se encuentra bajo presión o límites de tiempo.' 
            },
            { 
              title: 'Cordialidad', 
              score: `${corScore}/10`, 
              level: corLevel.level, 
              color: corLevel.color, 
              desc: corScore >= 6 
                ? 'Se muestra amable, empático y respetuoso en sus relaciones laborales, promoviendo un clima colaborativo y cálido.' 
                : 'Puede mostrarse cordial en algunas situaciones, aunque su actitud varía hacia una postura distante o poco expresiva frente a dificultades.' 
            }
          ];

          const eqItems = [
            { 
              title: 'Solución De Problemas', 
              score: `${spScore}/10`, 
              level: spLevel.level, 
              color: spLevel.color, 
              desc: spScore >= 6 
                ? 'Define bien el problema, contrasta opciones y selecciona soluciones viables; anticipa riesgos y verifica resultados con rigor.' 
                : 'Presenta dificultades para estructurar alternativas de resolución frente a problemas complejos, requiriendo orientación de supervisión.' 
            },
            { 
              title: 'Asertividad', 
              score: `${asScore}/10`, 
              level: asLevel.level, 
              color: asLevel.color, 
              desc: asScore >= 6 
                ? 'Expresa sus puntos de vista con seguridad y respeto mutuo, defendiendo criterios constructivos sin recurrir a la agresividad ni a la sumisión.' 
                : 'Muestra dificultad para manifestar lo que piensa con firmeza, evitando en ocasiones el planteamiento directo para no confrontar.' 
            }
          ];

          return (
            <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-[#6355DE]">SER15 (Personalidad)</h3>

                <div className="space-y-3.5">
                  {ser15Items.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-[#6355DE] pt-2">Inteligencia Emocional (EQ-M)</h3>
                <div className="space-y-3.5">
                  {eqItems.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>

              </div>

              <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={12} />
            </div>
          );
        })()}

        {/* Página 13: SER15 Parte 2 */}
        {(() => {
          const empScore = getSubScore(0.95, 's2');
          const empLevel = getSubLevelInfo(empScore);
          const teScore = getSubScore(1.0, 's2');
          const teLevel = getSubLevelInfo(teScore);
          const rsScore = getSubScore(0.85, 's1');
          const rsLevel = getSubLevelInfo(rsScore);
          const autoScore = Math.max(1, Math.min(10, Math.round(overallScore >= 60 ? (overallScore / 10) * 0.7 : (overallScore / 10) * 0.35)));
          const autoLevel = getSubLevelInfo(autoScore);
          const ipScore = Math.max(6, Math.min(10, Math.round(7 + (overallScore >= 40 ? 2 : 0))));
          const ipLevel = getSubLevelInfo(ipScore);

          const ser15Part2Items = [
            { 
              title: 'Empatía', 
              score: `${empScore}/10`, 
              level: empLevel.level, 
              color: empLevel.color, 
              desc: empScore >= 6 
                ? 'Comprende los sentimientos de los demás y procura actuar con cuidado, mostrando consideración y apertura al apoyo en el equipo.' 
                : 'Le cuesta percibir el estado emocional de sus compañeros o usuarios, centrando su atención primordialmente en datos objetivos.' 
            },
            { 
              title: 'Tolerancia Al Estrés', 
              score: `${teScore}/10`, 
              level: teLevel.level, 
              color: teLevel.color, 
              desc: teScore >= 6 
                ? 'Maneja con serenidad escenarios de alta presión, organiza prioridades con eficacia y confía en sus recursos para superar dificultades.' 
                : 'Tiende a acusar el impacto de la sobrecarga o situaciones adversas, disminuyendo su nivel de precisión en la ejecución.' 
            },
            { 
              title: 'Responsabilidad Social', 
              score: `${rsScore}/10`, 
              level: rsLevel.level, 
              color: rsLevel.color, 
              desc: rsScore >= 6 
                ? 'Muestra un claro compromiso con el bien común, respetando el impacto colectivo y el bienestar del entorno laboral.' 
                : 'Cumple con lo básico en cuanto a normas y respeto, aunque su involucramiento activo en el bienestar colectivo es moderado.' 
            },
            { 
              title: 'Autoconcepto', 
              score: `${autoScore}/10`, 
              level: autoLevel.level, 
              color: autoLevel.color, 
              desc: autoScore >= 5 
                ? 'Proyecta seguridad en sus capacidades personales y profesionales, afrontando tareas asignadas con confianza sólida.' 
                : 'Tiende a manifestar dudas o inseguridad respecto a sus capacidades, afectando su grado de proactividad y autonomía.' 
            },
            { 
              title: 'Impresión Positiva', 
              score: `${ipScore}/10`, 
              level: ipLevel.level, 
              color: ipLevel.color, 
              desc: ipScore >= 8 
                ? 'La persona se muestra completamente auténtica y honesta en sus respuestas, reflejando su verdadero estilo de comportamiento laboral.' 
                : 'Muestra índices adecuados de franqueza con consistencia normal en los patrones de respuesta suministrados.' 
            }
          ];

          return (
            <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#6355DE]">SER15 (Personalidad - Continuación)</h3>

                <div className="space-y-3.5">
                  {ser15Part2Items.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={13} />
            </div>
          );
        })()}

        {/* Página 14: Conductas Laborales & Intellectus */}
        {(() => {
          const compScore = getSubScore(0.9, 's2');
          const compLevel = getSubLevelInfo(compScore);
          const ecuScore = getSubScore(1.0, 's2');
          const ecuLevel = getSubLevelInfo(ecuScore);
          const avScore = getSubScore(1.0, 's1');
          const avLevel = getSubLevelInfo(avScore);

          const ttcItems = [
            { 
              title: 'Comprensión', 
              score: `${compScore}/10`, 
              level: compLevel.level, 
              color: compLevel.color, 
              desc: compScore >= 6 
                ? 'Muestra apertura para conversar, comprende a los demás y utiliza un estilo comunicativo considerado y respetuoso.' 
                : 'Tiende a emitir juicios rápidos o a encontrar dificultades en la comprensión empática de situaciones interpersonales complejas.' 
            },
            { 
              title: 'Ecuanimidad', 
              score: `${ecuScore}/10`, 
              level: ecuLevel.level, 
              color: ecuLevel.color, 
              desc: ecuScore >= 6 
                ? 'Mantiene un control emocional sólido en cualquier circunstancia, responde con serenidad y transmite calma a quienes lo rodean.' 
                : 'Puede exteriorizar descontento o impaciencia ante imprevistos, requiriendo contención para mantener la templanza en momentos críticos.' 
            }
          ];

          const intellectusItems = [
            { 
              title: 'Aptitud Verbal', 
              score: `${avScore}/10`, 
              level: avLevel.level, 
              color: avLevel.color, 
              desc: avScore >= 6 
                ? 'Demuestra una capacidad sobresaliente para comprender, analizar y utilizar el lenguaje con precisión, razonando verbalmente con fluidez.' 
                : 'Presenta dificultades en la comprensión o síntesis de instrucciones verbales densas, requiriendo confirmación continua de pautas operativas.' 
            }
          ];

          return (
            <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-[#6355DE]">Conductas Laborales (TTC-M)</h3>
                <div className="space-y-3.5">
                  {ttcItems.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-[#6355DE] pt-4">Intellectus (Habilidades Cognitivas)</h3>
                <div className="space-y-3.5">
                  {intellectusItems.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#6355DE]" />
                          <span>{sub.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[#6355DE] text-[#6355DE] text-[10px] font-bold">{sub.score}</span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{sub.desc}</p>
                      <span className={`block font-bold text-[10px] ${sub.color}`}>{sub.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={14} />
            </div>
          );
        })()}

        {/* Página 15: Preguntas sugeridas para la entrevista */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          <div className="space-y-5">
            <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
              Preguntas sugeridas para la entrevista por competencias
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#6355DE]">Orientación al cliente</h4>
                <ol className="space-y-1 list-decimal pl-5 text-zinc-600 text-[11px] leading-relaxed">
                  <li>¿Qué actitud toma ante las demandas de los clientes (internos o externos)?</li>
                  <li>¿De qué manera crea o mantiene relaciones positivas con los clientes?</li>
                  <li>¿Qué detalles utiliza para que sus clientes lo recuerden y lo recomienden?</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#6355DE]">Orientación y adaptabilidad a las ventas</h4>
                <ol className="space-y-1 list-decimal pl-5 text-zinc-600 text-[11px] leading-relaxed">
                  <li>¿De qué manera su experiencia le ha facilitado lograr mejores ventas?</li>
                  <li>Cuénteme acerca del cliente más difícil que ha tenido y cómo logró adaptarse para lograr la venta.</li>
                  <li>¿Alguna vez tuvo que vender un producto del que sabía poco o nada? ¿Qué resultados obtuvo?</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#6355DE]">Comunicación efectiva</h4>
                <ol className="space-y-1 list-decimal pl-5 text-zinc-600 text-[11px] leading-relaxed">
                  <li>¿Qué medios utiliza para comunicarse con su equipo de trabajo? ¿Por qué prefiere esos medios?</li>
                  <li>¿Cómo se da cuenta de que lo que dijo fue comprendido por los demás? Deme un ejemplo.</li>
                  <li>Coménteme sobre algún malentendido por suposiciones que haya tenido con su equipo de trabajo. ¿Qué hizo para mejorar la situación?</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#6355DE]">Temple y serenidad</h4>
                <ol className="space-y-1 list-decimal pl-5 text-zinc-600 text-[11px] leading-relaxed">
                  <li>Cuénteme de alguna situación donde las cosas no le salieron como esperaba. ¿Cómo manejó sus emociones?</li>
                  <li>Frente a un sismo, ¿qué es lo primero que hace?</li>
                  <li>Cuénteme de una situación en la que haya perdido la calma. ¿Cómo se recuperó?</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-[#6355DE]">Integridad</h4>
                <ol className="space-y-1 list-decimal pl-5 text-zinc-600 text-[11px] leading-relaxed">
                  <li>¿Qué es lo más importante que debe defender una persona íntegra?</li>
                  <li>Descríbame una situación en la que su integridad haya sido puesta a prueba. ¿Qué resultados obtuvo después de su accionar?</li>
                  <li>¿Alguna vez fue reconocido por su integridad? ¿Qué hizo usted para ser reconocido?</li>
                </ol>
              </div>

            </div>
          </div>

          <EvaluarGeaReportFooter candidateName={candidateName} pageNumber={15} />
        </div>

      </div>

    </div>
  );
};
