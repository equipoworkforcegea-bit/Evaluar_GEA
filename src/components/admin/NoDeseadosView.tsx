import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  FileText,
  X
} from 'lucide-react';

interface BlockedPerson {
  id: string;
  documentId: string;
  fullName: string;
  reason: 'ABANDONO_PUESTO' | 'SUPLANTACION_FRAUDE' | 'FALTA_DISCIPLINARIA' | 'DESCALIFICACION_ETICA';
  blockedAt: string;
  blockedBy: string;
  notes: string;
}

const INITIAL_BLOCKED: BlockedPerson[] = [
  {
    id: 'block-1',
    documentId: '47891234',
    fullName: 'Carlos Mendoza Paredes',
    reason: 'SUPLANTACION_FRAUDE',
    blockedAt: '2026-08-15',
    blockedBy: 'Tania León (Reclutamiento)',
    notes: 'Detección de doble rostro e intento de suplantación en prueba biométrica Trust.'
  },
  {
    id: 'block-2',
    documentId: '72341908',
    fullName: 'Jhojan Salazar Gómez',
    reason: 'ABANDONO_PUESTO',
    blockedAt: '2026-09-02',
    blockedBy: 'Admin GEA',
    notes: 'Abandono intempestivo en periodo de inducción Campaña Ventas.'
  }
];

export const NoDeseadosView: React.FC = () => {
  const [blockedList, setBlockedList] = useState<BlockedPerson[]>(INITIAL_BLOCKED);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkDni, setCheckDni] = useState('');
  const [checkResult, setCheckResult] = useState<'FOUND' | 'NOT_FOUND' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo
  const [newDni, setNewDni] = useState('');
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState<BlockedPerson['reason']>('ABANDONO_PUESTO');
  const [newNotes, setNewNotes] = useState('');

  const filtered = blockedList.filter(b => {
    const q = searchTerm.toLowerCase();
    return b.fullName.toLowerCase().includes(q) || b.documentId.includes(q);
  });

  const handleCheckDni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDni.trim()) return;
    const exists = blockedList.some(b => b.documentId.trim() === checkDni.trim());
    setCheckResult(exists ? 'FOUND' : 'NOT_FOUND');
  };

  const handleAddBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDni.trim() || !newName.trim()) return;

    const newItem: BlockedPerson = {
      id: `block-${Date.now()}`,
      documentId: newDni.trim(),
      fullName: newName.trim(),
      reason: newReason,
      blockedAt: new Date().toISOString().slice(0, 10),
      blockedBy: 'Tania León',
      notes: newNotes.trim() || 'Bloqueo registrado manualmente por reclutamiento.'
    };

    setBlockedList([newItem, ...blockedList]);
    setShowAddModal(false);
    setNewDni('');
    setNewName('');
    setNewNotes('');
  };

  const handleRemove = (id: string) => {
    if (window.confirm('¿Deseas desbloquear a esta persona del registro?')) {
      setBlockedList(prev => prev.filter(b => b.id !== id));
    }
  };

  const reasonLabels: Record<BlockedPerson['reason'], string> = {
    'ABANDONO_PUESTO': 'Abandono Intempestivo de Campaña',
    'SUPLANTACION_FRAUDE': 'Intento de Fraude / Suplantación',
    'FALTA_DISCIPLINARIA': 'Falta Disciplinaria Grave',
    'DESCALIFICACION_ETICA': 'Descalificación Ética / Baremo Crítico'
  };

  return (
    <div className="space-y-5 animate-in fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2A5E] dark:text-white tracking-tight">
              No Deseados & Prevención de Fraude
            </h1>
            <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4] mt-0.5">
              Registro preventivo de postulantes no recontratables por suplantación, abandono o faltas graves en GEA Perú.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar en Lista de Bloqueo</span>
        </button>
      </div>

      {/* Verificador Rápido de DNI */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-[#161C3A] dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#2F5BA8]" />
          <span>Verificación Inmediata de DNI / Candidato</span>
        </h3>
        <form onSubmit={handleCheckDni} className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={checkDni}
            onChange={(e) => { setCheckDni(e.target.value); setCheckResult(null); }}
            placeholder="Ingrese número de DNI para validar si está vetado..."
            className="flex-1 min-w-[260px] px-4 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
          >
            Consultar Estado
          </button>
        </form>

        {checkResult === 'FOUND' && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="font-bold">¡ALERTA! El DNI se encuentra en la lista de NO DESEADOS de GEA.</strong>
              <p className="text-[11px] mt-0.5">Este postulante tiene restricciones activas para recontratación.</p>
            </div>
          </div>
        )}

        {checkResult === 'NOT_FOUND' && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-bold">Postulante Habilitado</strong>
              <p className="text-[11px] mt-0.5">No registra antecedentes ni bloqueos activos en el sistema.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Registrados */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#DDE2EF] dark:border-[#2A3563] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en lista por DNI o nombre..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#6B7494] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs text-[#6B7494]">
            Total bloqueados: <strong>{filtered.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#151D3F] text-[#6B7494] dark:text-[#9AA5C4] font-bold uppercase tracking-wider border-b border-[#DDE2EF] dark:border-[#2A3563]">
              <tr>
                <th className="p-3.5 pl-5">Persona Bloqueada</th>
                <th className="p-3.5">DNI</th>
                <th className="p-3.5">Motivo del Bloqueo</th>
                <th className="p-3.5">Fecha y Registrado Por</th>
                <th className="p-3.5">Observación</th>
                <th className="p-3.5 pr-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#6B7494]">
                    No se encontraron registros de bloqueo.
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-rose-50/20 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-[#161C3A] dark:text-white">
                      {b.fullName}
                    </td>
                    <td className="p-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {b.documentId}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {reasonLabels[b.reason]}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#6B7494] dark:text-[#9AA5C4]">
                      <div>{b.blockedAt}</div>
                      <div className="text-[10px] text-zinc-400">{b.blockedBy}</div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[#6B7494]" title={b.notes}>
                      {b.notes}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(b.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                        title="Desbloquear"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2EF] dark:border-[#2A3563]">
              <h3 className="text-base font-bold text-[#1F2A5E] dark:text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                <span>Registrar en Lista No Deseados</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlocked} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">DNI / Documento Identidad</label>
                <input
                  type="text"
                  required
                  value={newDni}
                  onChange={e => setNewDni(e.target.value)}
                  placeholder="Ej: 47891234"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Juan Pérez Morales"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Motivo del Bloqueo</label>
                <select
                  value={newReason}
                  onChange={e => setNewReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] outline-none"
                >
                  <option value="ABANDONO_PUESTO">Abandono Intempestivo de Campaña</option>
                  <option value="SUPLANTACION_FRAUDE">Intento de Fraude / Suplantación en Pruebas</option>
                  <option value="FALTA_DISCIPLINARIA">Falta Disciplinaria Grave</option>
                  <option value="DESCALIFICACION_ETICA">Descalificación Ética</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Detalle u Observación</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Indique antecedentes para el equipo de selección..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors"
                >
                  Guardar Bloqueo
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
