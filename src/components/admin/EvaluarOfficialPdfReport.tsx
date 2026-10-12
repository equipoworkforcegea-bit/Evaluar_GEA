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

export const EvaluarOfficialPdfReport: React.FC<EvaluarOfficialPdfReportProps> = ({
  candidate,
  process,
  onClose,
  hideSensitiveData = false
}) => {
  const candidateName = candidate.fullName || 'Javier Gutierrez';
  const positionTitle = (process?.targetPosition || process?.title || candidate.position || 'ASESOR POSTPAGO CLARO CHILE').toUpperCase();
  const evaluationDate = candidate.completedAt 
    ? new Date(candidate.completedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    : '13 julio 2026';

  const overallScore = candidate.scores?.overall || 100;
  const isOptimal = overallScore >= 70;

  // Radar chart helper points (Pentagon centered at 150, 150)
  const competenciesKeys = [
    { name: 'Orientación al Cliente', val: 6.0, exp: 6.0 },
    { name: 'Orientación y adaptabilidad a las ventas', val: 6.7, exp: 6.0 },
    { name: 'Comunicación efectiva', val: 7.4, exp: 6.0 },
    { name: 'Temple y Serenidad', val: 9.6, exp: 6.0 },
    { name: 'Integridad', val: 5.6, exp: 6.0 }
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center py-6 px-2 sm:px-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-[210] flex items-center gap-3 print:hidden bg-zinc-900/90 text-white px-5 py-2.5 rounded-2xl border border-zinc-700 shadow-2xl backdrop-blur-md">
        <span className="text-xs font-semibold text-zinc-300">Vista de impresión Oficial (15 págs.)</span>
        
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-[#6355DE] hover:bg-[#5244C9] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar en PDF</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Cerrar vista de impresión"
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

              {/* Header Portada: Logo Evaluar */}
              <div className="relative z-10 flex justify-end">
                <div className="flex items-center gap-1 font-bold text-lg tracking-tight">
                  <span className="text-white">e</span>
                  <span className="text-[#FF2A85]">v</span>
                  <span className="text-white">aluar</span>
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
                    <div className="inline-block px-3 py-1.5 rounded-full bg-white text-[11px] font-extrabold text-[#10B981] shadow-xs">
                      Adecuación: 100%
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

                {/* Recuadro de Empresa GEA Perú */}
                <div className="bg-white p-3 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-base font-black text-[#1F2A5E] tracking-wider block">GEA</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">GEA PIENSA EN TI</span>
                  </div>
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
                  <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    Interpretación: ADECUADO
                  </div>
                </div>

                {/* Gauge Circular 100% */}
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
                        stroke="#10B981"
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-2xl font-black text-zinc-900">100%</span>
                  </div>
                </div>

                {/* Ajuste General de Competencias Descripción */}
                <div className="space-y-2 text-center max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-zinc-800">
                    Ajuste General de Competencias
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                    De acuerdo al CAP el evaluado se encuentra en un nivel <strong className="text-zinc-900">ADECUADO</strong>. Es decir, que cuenta con las competencias requeridas para su contratación, el índice de dispersión respecto al nivel deseado es muy bajo.
                  </p>
                </div>

                {/* Barra Competencias 100% */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <GraduationCap className="w-4 h-4 text-zinc-400" />
                      <span className="uppercase text-[11px] tracking-wider">Competencias</span>
                    </div>
                    <span className="text-emerald-600 font-extrabold">100%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-full" />
                  </div>
                </div>

              </div>

              {/* Footer Página */}
              <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
                <div className="flex items-center gap-1">
                  <span>Powered by:</span>
                  <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
                </div>
              </div>

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
                  <span className="text-xs font-bold text-zinc-700">100%</span>
                  <div className="w-24 bg-[#E02485] h-52 rounded-t-lg shadow-sm" />
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
                    <td className="p-3 text-center text-zinc-600">100/100</td>
                    <td className="p-3 text-right text-zinc-900 font-bold">100/100</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>

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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>

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
                    <td className="p-2 text-center font-bold text-zinc-900">6.00</td>
                    <td className="p-2 text-center text-zinc-500">0</td>
                    <td className="p-2 text-right font-bold text-emerald-600">100%</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Orientación Y Adaptabilidad A Las Ventas</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">6.70</td>
                    <td className="p-2 text-center text-zinc-500">0</td>
                    <td className="p-2 text-right font-bold text-emerald-600">100%</td>
                  </tr>

                  {/* Categoría 2 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Comunicacionales</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Comunicación Efectiva</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">7.40</td>
                    <td className="p-2 text-center text-zinc-500">0</td>
                    <td className="p-2 text-right font-bold text-emerald-600">100%</td>
                  </tr>

                  {/* Categoría 3 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Emocionales</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Temple Y Serenidad</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">9.60</td>
                    <td className="p-2 text-center text-zinc-500">0</td>
                    <td className="p-2 text-right font-bold text-emerald-600">100%</td>
                  </tr>

                  {/* Categoría 4 */}
                  <tr className="bg-purple-50/40">
                    <td colSpan={5} className="p-2 font-bold text-[#6355DE] text-xs">Competencias Valores</td>
                  </tr>
                  <tr>
                    <td className="p-2 pl-4 text-zinc-700">Integridad</td>
                    <td className="p-2 text-center font-bold text-zinc-600">6</td>
                    <td className="p-2 text-center font-bold text-zinc-900">5.60</td>
                    <td className="p-2 text-center text-amber-600 font-bold">-0.4</td>
                    <td className="p-2 text-right font-bold text-emerald-600">96%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Barras Horizontales Verdes */}
            <div className="pt-4 space-y-3">
              {[
                { name: 'Orientación Al Cliente', val: 100 },
                { name: 'Orientación Y Adaptabilidad A Las Ventas', val: 100 },
                { name: 'Comunicación Efectiva', val: 100 },
                { name: 'Temple Y Serenidad', val: 100 },
                { name: 'Integridad', val: 96 }
              ].map((b, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>{b.name}</span>
                    <span className="font-bold text-emerald-700">{b.val}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${b.val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>

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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>

        </div>


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINAS 6 A 10: DETALLE INDIVIDUAL DE COMPETENCIAS                        */}
        {/* ------------------------------------------------------------------------- */}
        {[
          {
            category: 'Competencias Comerciales',
            title: 'Orientación Al Cliente',
            badge: 'Desarrollada',
            badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
            desc: 'Actitud genuina de comprender y atender al cliente, priorizando sus necesidades y buscando generar una experiencia positiva y de confianza en cada interacción.',
            result: '6 / 6',
            brecha: '0',
            interpretation: 'Atiende con amabilidad y resuelve problemas de manera oportuna. Entiende la mayoría de las necesidades y mantiene relaciones estables, generando buena experiencia de servicio.',
            recommendations: [
              'Reforzar mediante reconocimientos monetarios o no monetarios las prácticas que llevan a la excelencia en la atención a clientes.',
              'Asignarle como tarea, que periódicamente entregue una lista de prácticas que puedan mejorar la calidad de atención en la compañía.',
              'Transferirle la responsabilidad de encuestar la satisfacción del cliente.',
              'Responsabilizarlo de ser el mentor de algunos de sus compañeros en el desarrollo de la competencia.',
              'Capacitación en el manejo de los diferentes tipos de clientes y como tratarlos.',
              'Evaluar constantemente su nivel de orientación al servicio y retroalimentarlo en los aspectos que puede mejorar.',
              'Crear situaciones dramatizadas en las que la persona tenga que resolver conflictos con clientes y darle sugerencias de cómo podría mejorar su participación.'
            ]
          },
          {
            category: 'Competencias Comerciales',
            title: 'Orientación Y Adaptabilidad A Las Ventas',
            badge: 'Desarrollada',
            badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
            desc: 'Disposición flexible para desenvolverse con eficacia en distintos entornos comerciales, ajustando el estilo y el enfoque para conectar con el cliente y facilitar el logro de resultados.',
            result: '6.7 / 6',
            brecha: '0',
            interpretation: 'Se adapta a la mayoría de situaciones; interactúa con amabilidad y conserva estabilidad emocional. Responde bien a la presión y cierra ventas con buen desempeño.',
            recommendations: [
              'Ayudarle a descubrir los beneficios y puntos fuertes (de servicios o producto) que puede ofrecer a los clientes, con el objetivo de sacarles el máximo partido, para cerrar la venta.',
              'Entregarle la responsabilidad de realizar un estudio de mercado referente al producto y/o servicio a entrega.',
              'Establecer los objetivos de venta con la persona para determinar cuál es su nivel de ambición.',
              'Asignarle la responsabilidad de realizar encuesta a clientes actuales sobre su grado de satisfacción (de productos y servicios), así como el motivo por el que repiten su compra.',
              'Ubicarle en una posición de ventas junior, apoyado de un mentor de quien aprenderá las técnicas que le permitirán desarrollar la competencia.',
              'Fijar objetivos a mediano y corto plazo; una vez medidos, entregar feedback para motivar su cumplimiento y reforzar aquello que no se cumplió.'
            ]
          },
          {
            category: 'Competencias Comunicacionales',
            title: 'Comunicación Efectiva',
            badge: 'Desarrollada',
            badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
            desc: 'Capacidad para transmitir ideas con claridad y coherencia, ajustando el mensaje al contexto y asegurando una comprensión precisa que facilite interacciones fluidas y constructivas.',
            result: '7.4 / 6',
            brecha: '0',
            interpretation: 'Expresa sus ideas con claridad, escucha con atención y maneja la comunicación con respeto y seguridad. Su mensaje se comprende sin dificultad.',
            recommendations: [
              'Pedirle que realice una exposición sobre comunicación interna y su importancia dentro de las organizaciones.',
              'Diferenciar el "informar" del "comunicar" para la eficiencia de los procesos.',
              'Diferenciar los significados de la comunicación desde el emisor y desde las interpretaciones del receptor.',
              'Entrenar la confirmación del mensaje en la comunicación dentro de los trámites internos de la organización.',
              'Utilizar el lenguaje "generativo" en las reuniones de trabajo.'
            ]
          },
          {
            category: 'Competencias Emocionales',
            title: 'Temple Y Serenidad',
            badge: 'Muy Desarrollada',
            badgeColor: 'border-sky-300 text-sky-700 bg-sky-50',
            desc: 'Calma sostenida para enfrentar presión o incertidumbre, respondiendo con equilibrio emocional, claridad y objetividad, y transmitiendo estabilidad al abordar desafíos o conflictos.',
            result: '9.6 / 6',
            brecha: '0',
            interpretation: 'Se mantiene sereno ante situaciones críticas, controla sus emociones con gran solidez y actúa con claridad aún bajo alta presión. Su presencia estabiliza al equipo.',
            recommendations: [
              'Pedirle que detalle estrategias emocionales para mantener la seguridad y la calma ante situaciones adversas.',
              'Solicitarle que realice ejercicios para controlar las emociones antes de tomar decisiones.',
              'Capacitarle en técnicas de inteligencia emocional y su aplicación en el trabajo.',
              'Probar su temple y serenidad en diferentes actividades laborales.',
              'Incluirle en equipos de trabajo donde se requiera un componente que influya con su temple y tranquilidad.'
            ]
          },
          {
            category: 'Competencias Valores',
            title: 'Integridad',
            badge: 'Desarrollada',
            badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
            desc: 'Coherencia entre valores, principios éticos y acciones, expresándose con honestidad y responsabilidad y proyectando una conducta confiable que refuerza la credibilidad y la cultura ética de la organización.',
            result: '5.6 / 6',
            brecha: '-0.4',
            interpretation: 'Actúa con honestidad, respeta normas y mantiene coherencia entre lo que dice y hace. Es percibido como una persona confiable.',
            recommendations: [
              'Solicitarle que identifique situaciones en las relaciones empresariales que sean contrarias a la integridad.',
              'Pedirle que elabore un taller sobre integridad para sus compañeros.',
              'Pedirle que desarrolle un proyecto de Integridad organizacional y su efecto en el entorno social.',
              'Ocupar posiciones donde se requiera personal de confianza.',
              'Valorar los actos íntegros como refuerzo de este comportamiento.'
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

            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
              <div className="flex items-center gap-1">
                <span>Powered by:</span>
                <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
              </div>
            </div>

          </div>
        ))}


        {/* ------------------------------------------------------------------------- */}
        {/* PÁGINAS 11 A 14: RESULTADOS POR PRUEBAS                                   */}
        {/* ------------------------------------------------------------------------- */}
        
        {/* Página 11: Sales Profile */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          <div className="space-y-6">
            <div className="w-full py-2.5 rounded-xl bg-[#6355DE] text-white font-bold text-center text-xs tracking-wider">
              Resultados por pruebas
            </div>

            <h3 className="text-sm font-bold text-[#6355DE]">Sales Profile (Estilos de Ventas y Servicio)</h3>

            <div className="space-y-4">
              {[
                { title: 'Potencial Vendedor', score: '5/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Cumple con sus responsabilidades de manera correcta y responde a los objetivos planteados, aunque sin destacarse por una iniciativa especial. Puede adaptarse a contextos comerciales, pero no siempre impulsa nuevas oportunidades por sí mismo. Su estilo es más estable que desafiante.' },
                { title: 'Servicio Al Cliente', score: '6/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Atiende de manera funcional las solicitudes y cumple con lo necesario, aunque sin profundizar en la construcción de experiencias diferenciales. Su aporte es correcto, pero puede no generar un impacto duradero en la percepción de quienes interactúan con él.' },
                { title: 'Farmer', score: '5/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Conserva las relaciones de manera adecuada, aunque sin generar un fuerte impacto en términos de fidelidad o crecimiento. Su gestión es correcta, pero sin aportar un valor distintivo en la relación a largo plazo.' },
                { title: 'Transaccional', score: '7/10', level: 'Nivel: Alto', color: 'text-emerald-600', desc: 'Se orienta a lograr resultados ágiles y consistentes, trabajando con disciplina para cumplir objetivos en plazos definidos. Sus procesos son fluidos y prácticos, asegurando un buen nivel de productividad.' }
              ].map((sub, i) => (
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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>
        </div>

        {/* Página 12: SER15 & EQ-M Parte 1 */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#6355DE]">SER15 (Personalidad)</h3>

            <div className="space-y-3.5">
              {[
                { title: 'Estabilidad Emocional', score: '10/10', level: 'Nivel: Muy Alto', color: 'text-sky-600', desc: 'Se mantiene firme y equilibrado/a incluso en contextos laborales exigentes. Afronta errores, presiones o contratiempos con una actitud estable, sin que estos afecten de forma relevante su desempeño.' },
                { title: 'Atención A Las Normas', score: '8/10', level: 'Nivel: Alto', color: 'text-emerald-600', desc: 'Suele respetar las reglas y lineamientos establecidos en su trabajo. Es constante en el cumplimiento de políticas y actúa de acuerdo con lo que se espera en su rol profesional.' },
                { title: 'Cordialidad', score: '6/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Puede mostrarse cordial en algunas situaciones, aunque su actitud varía. Alterna momentos de amabilidad con otros en los que adopta una postura más neutral o reservada.' }
              ].map((sub, i) => (
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
              {[
                { title: 'Solución De Problemas', score: '7/10', level: 'Nivel: Alto', color: 'text-emerald-600', desc: 'Define bien el problema, contrasta opciones y selecciona soluciones viables; anticipa riesgos y verifica resultados.' },
                { title: 'Asertividad', score: '4/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Muestra disposición para manifestar lo que piensa, aunque en algunas ocasiones evita confrontar o ceder para no incomodar.' }
              ].map((sub, i) => (
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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>
        </div>

        {/* Página 13: SER15 Parte 2 */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#6355DE]">SER15 (Personalidad - Continuación)</h3>

            <div className="space-y-3.5">
              {[
                { title: 'Empatía', score: '8/10', level: 'Nivel: Alto', color: 'text-emerald-600', desc: 'Comprende los sentimientos de los demás y procura actuar con cuidado, mostrando consideración y apertura al apoyo.' },
                { title: 'Tolerancia Al Estrés', score: '9/10', level: 'Nivel: Muy Alto', color: 'text-sky-600', desc: 'Maneja con serenidad escenarios de alta presión, organiza prioridades con eficacia y confía plenamente en sus recursos para superar dificultades.' },
                { title: 'Responsabilidad Social', score: '6/10', level: 'Nivel: Medio', color: 'text-amber-600', desc: 'Cumple con lo básico en cuanto a normas y respeto, aunque su compromiso con los demás puede variar según la situación.' },
                { title: 'Autoconcepto', score: '1/10', level: 'Nivel: Muy Bajo', color: 'text-rose-600', desc: 'Tiende a desvalorizarse, carece de confianza en sus capacidades y se percibe con malestar en su identidad.' },
                { title: 'Impresión Positiva', score: '10/10', level: 'Nivel: Muy Alto', color: 'text-sky-600', desc: 'La persona se muestra completamente auténtica y honesta en sus respuestas, sin indicios de distorsión. Sus respuestas reflejan con precisión su verdadera personalidad y comportamiento.' }
              ].map((sub, i) => (
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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>
        </div>

        {/* Página 14: Conductas Laborales & Intellectus */}
        <div className="evaluar-page-sheet bg-white w-[210mm] h-[296mm] p-12 flex flex-col justify-between shadow-2xl print:shadow-none mx-auto">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#6355DE]">Conductas Laborales (TTC-M)</h3>
            <div className="space-y-3.5">
              {[
                { title: 'Comprensión', score: '7/10', level: 'Nivel: Alto', color: 'text-emerald-600', desc: 'Muestra apertura para conversar, comprende a los demás y utiliza un estilo comunicativo considerado y respetuoso.' },
                { title: 'Ecuanimidad', score: '10/10', level: 'Nivel: Muy Alto', color: 'text-sky-600', desc: 'Mantiene un control emocional sólido en cualquier circunstancia, responde con serenidad y transmite calma a quienes lo rodean.' }
              ].map((sub, i) => (
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
              {[
                { title: 'Aptitud Verbal', score: '10/10', level: 'Nivel: Muy Alto', color: 'text-sky-600', desc: 'Demuestra una capacidad sobresaliente para comprender, analizar y utilizar el lenguaje con precisión. Identifica matices de significado, razona verbalmente con fluidez y utiliza un vocabulario amplio y adecuado a distintos contextos.' }
              ].map((sub, i) => (
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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>
        </div>

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

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-bold text-zinc-600 uppercase">{candidateName}</span>
            <div className="flex items-center gap-1">
              <span>Powered by:</span>
              <span className="font-bold text-[#FF2A85]">e<span className="text-zinc-700">valuar</span></span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
