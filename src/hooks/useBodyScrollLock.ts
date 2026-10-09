import { useEffect } from 'react';

let lockCount = 0;
let prevBodyOverflow = '';
let prevHtmlOverflow = '';

export function lockScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    prevBodyOverflow = document.body.style.overflow;
    prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = prevBodyOverflow;
    document.documentElement.style.overflow = prevHtmlOverflow;
  }
}

/**
 * Hook para bloquear el scroll del fondo (body y html) mientras un modal o diálogo esté abierto.
 * Es seguro para modales anidados gracias a un contador de referencias.
 */
export function useBodyScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
