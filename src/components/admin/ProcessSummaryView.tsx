import React from 'react';
import { EvaluationTest } from '../../types';
import { 
  ArrowLeft, 
  Calendar, 
  Info, 
  Mail, 
  Plus, 
  Rocket, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  ExternalLink,
  Laptop,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ProcessSummaryViewProps {
  process: EvaluationTest;
  onBack: () => void;
  onMonitorProcess: () => void;
  onInviteCandidates: () => void;
  onCustomizeInvitation?: () => void;
}

export const ProcessSummaryView: React.FC<ProcessSummaryViewProps> = ({
  process,
  onBack,
  onMonitorProcess,
  onInviteCandidates,
  onCustomizeInvitation
}) => {
  // Format dates for display
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '12/10/26';
    try {
      if (dateStr.includes('/')) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const startFormatted = formatDateDisplay(process.startDate);
  const endFormatted = formatDateDisplay(process.endDate);

  // Competencies list
  const competencies = (process.selectedCompetencies && process.selectedCompetencies.length > 0)
    ? process.selectedCompetencies
    : [
        'Motivación Laboral',
        'Liderazgo Ágil (Agile Leadership)',
        'Potencial de liderazgo',
        'Gestión operativa'
      ];

  const weightPerComp = Math.round(100 / competencies.length);

  // Tests list
  const testsList = [
    { name: 'Decisiones y Supervisión (TSD)', dotColor: 'bg-emerald-500' },
    { name: 'SER15 (Personalidad)', dotColor: 'bg-amber-400' },
    { name: 'Inteligencia Emocional (EQ-M)', dotColor: 'bg-amber-400' },
    { name: 'Conductas Laborales (TTC-M)', dotColor: 'bg-emerald-500' },
    { name: 'Intellectus (Habilidades Cognitivas)', dotColor: 'bg-amber-800' },
    { name: 'Lidera+ (Estilos de Liderazgo)', dotColor: 'bg-amber-800' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-6 py-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Volver a la lista de procesos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-normal">Resumen del proceso:</span>
              <span className="font-extrabold text-[#2F5BA8] dark:text-[#6EA0FA]">{process.title}</span>
            </h1>
            <div 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 cursor-pointer p-1"
              title="Información detallada de la convocatoria"
            >
              <Info className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={onCustomizeInvitation || onInviteCandidates}
            className="px-4 py-2.5 rounded-2xl border border-[#7C3AED]/40 bg-white dark:bg-zinc-900 text-[#7C3AED] dark:text-purple-400 font-bold text-xs sm:text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Mail className="w-4 h-4" />
            <span>Personalizar invitación</span>
          </button>

          <button
            type="button"
            onClick={onInviteCandidates}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Invitar candidatos</span>
          </button>
        </div>

      </div>

      {/* Date Range Subheader */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 pl-1">
        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Inicio {startFormatted}</span>
        <span className="text-zinc-400">→</span>
        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Fin {endFormatted}</span>
      </div>

      {/* Big Hero Banner: ¡Excelente! tu proceso se ha lanzado con éxito! */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF8FF] via-[#F4F0FF] to-[#ECE6FF] dark:from-purple-950/30 dark:via-zinc-900 dark:to-purple-900/20 border border-purple-200/80 dark:border-purple-800/40 p-6 sm:p-10 shadow-sm">
        
        {/* Decorative Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Hero Content (7 cols) */}
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6] dark:text-purple-300 tracking-tight">
              ¡Excelente! tu proceso se ha lanzado con éxito!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Activa las fuentes de reclutamiento para empezar a viralizar tu anuncio y evaluar candidatos con inteligencia situacional y pruebas oficiales.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onMonitorProcess}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#5B21B6] dark:hover:text-purple-300 hover:underline cursor-pointer group"
              >
                <span>Monitorear proceso</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Hero Illustration / Visual Graphic (4 cols) */}
          <div className="md:col-span-4 flex items-center justify-center relative">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xl text-white relative">
              <Rocket className="w-20 h-20 text-white animate-pulse" />
              <div className="absolute -bottom-2 -left-2 bg-white dark:bg-zinc-800 p-2.5 rounded-2xl shadow-md border border-purple-100 dark:border-purple-900 text-purple-600">
                <Laptop className="w-6 h-6" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 p-2 rounded-full shadow-md text-amber-950">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Card: Resumen de consumo */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300">
          Resumen de consumo
        </h3>
        
        {/* Full-width bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-5 rounded-full p-1 overflow-hidden">
          <div 
            className="bg-[#7C3AED] h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(8, (process.candidateCount || 1) * 3))}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
            <span>Créditos totales consumidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span>Plan contratado</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Competencias & Pruebas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Competencias en este proceso (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
            Competencias en este proceso
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 font-medium">
                  <th className="pb-3 font-normal">Competencias</th>
                  <th className="pb-3 text-center font-normal w-20">Peso</th>
                  <th className="pb-3 text-right font-normal w-24">Valor esperado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {competencies.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-2 font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="line-clamp-2">{comp}</span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-zinc-700 dark:text-zinc-300">
                      {weightPerComp}%
                    </td>
                    <td className="py-3.5 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      6
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Pruebas (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
            Pruebas
          </h3>

          <div className="space-y-2.5">
            {testsList.map((t, idx) => (
              <div
                key={idx}
                className="bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:border-purple-300 transition-colors"
              >
                <span>{t.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${t.dotColor} shrink-0 ml-3`} />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
