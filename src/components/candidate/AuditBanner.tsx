import React from 'react';
import { EyeOff, AlertTriangle, X } from 'lucide-react';

interface AuditBannerProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export const AuditBanner: React.FC<AuditBannerProps> = ({
  message,
  isVisible,
  onDismiss
}) => {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-50 max-w-md bg-zinc-900/95 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-700/50 dark:border-zinc-300/50 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 dark:text-amber-600 shrink-0">
          <EyeOff className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 dark:text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Aviso de integridad en pantalla
            </h4>
            <button
              type="button"
              onClick={onDismiss}
              className="text-zinc-400 hover:text-zinc-200 dark:text-zinc-500 dark:hover:text-zinc-800 p-0.5 rounded cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            {message}
          </p>
          <span className="block mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
            Bitácora de auditoría actualizada • Registro confidencial
          </span>
        </div>
      </div>
    </div>
  );
};
