import React, { useState } from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  Download, 
  RotateCw,
  Globe,
  Sliders,
  Check
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { EvaluarOfficialPdfReport } from './EvaluarOfficialPdfReport';

interface ExportReportModalProps {
  candidate: Candidate;
  process?: EvaluationTest;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  candidate,
  process,
  onClose
}) => {
  useBodyScrollLock();

  // Wizard Steps: 'CONFIG' (Paso 1: Exportar reporte a PDF) | 'GENERATED' (Paso 2: Reporte generado)
  const [step, setStep] = useState<'CONFIG' | 'GENERATED'>('CONFIG');
  const [format, setFormat] = useState<'PDF' | 'WORD'>('PDF');
  const [template, setTemplate] = useState<string>('Evaluar GEA - General');
  const [language, setLanguage] = useState<string>('es');
  const [hideSensitiveData, setHideSensitiveData] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Secciones
  const [sections, setSections] = useState({
    executiveSummary: true,
    competencies: true,
    gaps: true,
    evaluations: true
  });

  // State to trigger the full 15-page official printable view
  const [showFullPdfView, setShowFullPdfView] = useState<boolean>(false);

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulación fluida de compilación del reporte oficial
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsGenerating(false);
    setStep('GENERATED');
  };

  const handleDownload = () => {
    setShowFullPdfView(true);
  };

  return (
    <>
      {/* Visualizador de reporte oficial multipágina de 15 páginas */}
      {showFullPdfView && (
        <EvaluarOfficialPdfReport
          candidate={candidate}
          process={process}
          hideSensitiveData={hideSensitiveData}
          onClose={() => setShowFullPdfView(false)}
        />
      )}

      {/* Modal flotante (Oculto al imprimir) */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in print:hidden">
        
        {/* ========================================================================= */}
        {/* PASO 1: EXPORTAR REPORTE A PDF (CONFIGURACIÓN)                            */}
        {/* ========================================================================= */}
        {step === 'CONFIG' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-zinc-900 dark:text-zinc-100">
            
            {/* Header con Logo Oficial GEA Internacional */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/gea-internacional.png" 
                  alt="GEA Internacional" 
                  className="h-7 object-contain shrink-0" 
                />
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                    Exportar reporte a PDF
                  </h2>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Evaluar GEA • Generador Oficial
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-5 text-xs sm:text-sm">
              
              {/* Formato: Radio buttons PDF / WORD */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Elige el formato a descargar
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="radio"
                      name="format"
                      checked={format === 'PDF'}
                      onChange={() => setFormat('PDF')}
                      className="w-4 h-4 text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>PDF</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900">
                    <input
                      type="radio"
                      name="format"
                      checked={format === 'WORD'}
                      onChange={() => setFormat('WORD')}
                      className="w-4 h-4 text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>WORD</span>
                  </label>
                </div>
              </div>

              {/* Plantilla: Select dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Elige la plantilla
                </label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#6355DE]/30 text-xs sm:text-sm"
                >
                  <option value="Evaluar GEA - General">Evaluar GEA - General</option>
                  <option value="Evaluar GEA - Comercial">Evaluar GEA - Comercial</option>
                  <option value="Evaluar GEA - Liderazgo">Evaluar GEA - Liderazgo</option>
                </select>
              </div>

              {/* Idioma: Select dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Elige el idioma
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#6355DE]/30 text-xs sm:text-sm"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="pt">🇧🇷 Português</option>
                </select>
              </div>

              {/* Toggle: Ocultar datos sensibles */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Ocultar datos sensibles
                </span>
                <button
                  type="button"
                  onClick={() => setHideSensitiveData(!hideSensitiveData)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    hideSensitiveData ? 'bg-[#6355DE]' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      hideSensitiveData ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Checkboxes: Secciones del reporte */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Elige las secciones del reporte que deseas exportar
                </label>

                <div className="space-y-2 pl-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sections.executiveSummary}
                      onChange={() => toggleSection('executiveSummary')}
                      className="w-4 h-4 rounded-md text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>Resumen ejecutivo/CAP</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sections.competencies}
                      onChange={() => toggleSection('competencies')}
                      className="w-4 h-4 rounded-md text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>Competencias</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sections.gaps}
                      onChange={() => toggleSection('gaps')}
                      className="w-4 h-4 rounded-md text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>Brechas</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sections.evaluations}
                      onChange={() => toggleSection('evaluations')}
                      className="w-4 h-4 rounded-md text-[#6355DE] focus:ring-[#6355DE] accent-[#6355DE]"
                    />
                    <span>Evaluaciones</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateReport}
                className="px-6 py-2.5 rounded-2xl bg-[#6355DE] hover:bg-[#5244C9] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <span>Generar Reporte</span>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: REPORTE GENERADO (CONFIRMACIÓN & DESCARGA)                         */}
        {/* ========================================================================= */}
        {step === 'GENERATED' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-zinc-900 dark:text-zinc-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Reporte generado
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensaje de éxito central con check verde */}
            <div className="py-8 flex items-center justify-center gap-3 text-center">
              <span className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                El reporte fue generado con éxito
              </span>
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            </div>

            {/* Botones inferiores: Eliminar / Cancelar / Descargar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('CONFIG')}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Eliminar
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-2xl bg-[#6355DE] hover:bg-[#5244C9] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </>
  );
};
