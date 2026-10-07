import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, Building2, AlertCircle, ArrowRight } from 'lucide-react';

interface ConsentScreenProps {
  candidateName: string;
  candidateDni: string;
  position: string;
  onConsentAccepted: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  candidateName,
  candidateDni,
  position,
  onConsentAccepted
}) => {
  const [accepted, setAccepted] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-5 sm:mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4 sm:pb-5">
          <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Marco Legal y Privacidad (Perú)
            </span>
            <h1 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              Consentimiento Informado de Evaluación Laboral
            </h1>
          </div>
        </div>

        {/* Candidate & Position Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl mb-5 sm:mb-6 text-xs sm:text-sm">
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Postulante</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{candidateName}</span>
          </div>
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Documento de Identidad</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">DNI: {candidateDni}</span>
          </div>
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Convocatoria</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{position}</span>
          </div>
        </div>

        {/* Legal Text complying with Ley 29733 (compact scroll on mobile) */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 max-h-56 sm:max-h-96 overflow-y-auto pr-2.5 sm:pr-3 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">1. Marco normativo aplicable</h2>
              <p className="mt-1">
                En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su Reglamento aprobado por D.S. N° 003-2013-JUS, se le informa que los datos personales y respuestas conductuales recopilados durante esta prueba serán incorporados al Banco de Datos Personales "Postulantes y Procesos de Selección", de titularidad de <strong>GEA Perú</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">2. Naturaleza de los datos sensibles y finalidad</h2>
              <p className="mt-1">
                La evaluación contempla reactivos psicopedagógicos, de autorregulación emocional y casos prácticos situacionales considerados datos sensibles. Su tratamiento tiene como <strong>única finalidad evaluar la idoneidad y competencias laborales</strong> del postulante para el puesto señalado. En ningún caso serán empleados para fines discriminatorios ni comercializados a terceros.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">3. Confidencialidad y acceso restringido</h2>
              <p className="mt-1">
                El acceso a sus respuestas y reportes psicométricos está estrictamente restringido al personal colegiado de psicología organizacional y al comité de selección asignado (control de acceso RBAC). Todas las transferencias de información viajan con cifrado TLS 1.3 y se almacenan cifradas en reposo con estándares AES-256.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">4. Plazo de conservación y derechos ARCO</h2>
              <p className="mt-1">
                Sus datos serán conservados por un plazo máximo de <strong>12 meses</strong> a partir de la conclusión del proceso, transcurrido el cual serán anonimizados de forma irreversible. Usted podrá ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> enviando una solicitud formal al correo <code>privacidad@geaperu.pe</code> o en la mesa de partes institucional.
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox Section with large touchable target cards */}
        <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] touch-manipulation ${
            readConfirmed
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100/60'
          }`}>
            <input
              type="checkbox"
              checked={readConfirmed}
              onChange={(e) => setReadConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
              He leído detenidamente la política de privacidad y comprendo las condiciones de la evaluación bajo la Ley 29733 de Perú.
            </span>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] touch-manipulation ${
            accepted
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100/60'
          }`}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
              Otorgo mi consentimiento libre, previo, expreso e informado para el tratamiento de mis respuestas en el presente proceso de selección.
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            Paso 1 de 3: Conformidad de ingreso al sistema
          </span>
          <button
            type="button"
            onClick={onConsentAccepted}
            disabled={!accepted || !readConfirmed}
            className={`w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-xl font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all shadow-xs touch-manipulation ${
              accepted && readConfirmed
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98 shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>Iniciar evaluación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
