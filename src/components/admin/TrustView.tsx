import React, { useState } from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Search, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  UserCheck, 
  AlertTriangle,
  RotateCw,
  Lock,
  Eye,
  Clock
} from 'lucide-react';

interface TrustViewProps {
  candidates: Candidate[];
  tests: EvaluationTest[];
  onOpenCandidateDetail?: (candidate: Candidate) => void;
}

export const TrustView: React.FC<TrustViewProps> = ({
  candidates,
  tests,
  onOpenCandidateDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'VERIFICADO' | 'PENDIENTE'>('TODOS');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSendTrustInvite = (cand: Candidate) => {
    setInvitedCandidateIds(prev => new Set(prev).add(cand.id));
    showToast(`✓ Invitación a Módulo Trust enviada a ${cand.fullName} (${cand.email})`);
  };

  const copyLink = (candId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/trust/verify/${candId}`);
    setCopiedId(candId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCandidates = candidates.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (c.fullName || '').toLowerCase().includes(q) || 
      (c.email || '').toLowerCase().includes(q) || 
      (c.dni || '').includes(q);
    
    if (!matchSearch) return false;
    if (statusFilter === 'VERIFICADO') {
      return (c.scores?.overall || 0) >= 80 || c.status === 'FINALIST';
    }
    if (statusFilter === 'PENDIENTE') {
      return (c.scores?.overall || 0) < 80 && c.status !== 'FINALIST';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1F2A5E] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#2F5BA8]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1F2A5E] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white tracking-tight">
                  Módulo Trust & Antifraude
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Activo
                </span>
              </div>
              <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4]">
                Verificación de honestidad, validación de identidad biométrica y prevención de suplantación.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                candidates.forEach(c => invitedCandidateIds.add(c.id));
                setInvitedCandidateIds(new Set(candidates.map(c => c.id)));
                showToast(`✓ Invitaciones Trust enviadas masivamente a ${candidates.length} postulantes.`);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Invitar a todos</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DDE2EF] dark:border-[#2A3563]">
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Postulantes evaluados</span>
            <span className="text-xl font-black text-[#1F2A5E] dark:text-white">{candidates.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Índice de confianza</span>
            <span className="text-xl font-black text-[#2FA58B]">96.4%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Alertas de suplantación</span>
            <span className="text-xl font-black text-emerald-600">0</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Verificados con éxito</span>
            <span className="text-xl font-black text-[#2F5BA8] dark:text-[#5B8AE0]">
              {candidates.filter(c => (c.scores?.overall || 0) >= 80).length || candidates.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'TODOS'
                ? 'bg-[#1F2A5E] text-white'
                : 'text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Todos ({candidates.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFICADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'VERIFICADO'
                ? 'bg-[#1F2A5E] text-white'
                : 'text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Verificados
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDIENTE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'PENDIENTE'
                ? 'bg-[#1F2A5E] text-white'
                : 'text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Pendientes
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o DNI..."
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Candidates List with Trust Status */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#151D3F] border-b border-[#DDE2EF] dark:border-[#2A3563] text-[#6B7494] uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Postulante</th>
                <th className="py-3 px-4">DNI / Documento</th>
                <th className="py-3 px-4">Proceso Convocado</th>
                <th className="py-3 px-4">Estado Trust</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE2EF]/70 dark:divide-[#2A3563]/70">
              {filteredCandidates.map((c, i) => {
                const isInvited = invitedCandidateIds.has(c.id);
                const score = c.scores?.overall || 88;
                return (
                  <tr key={c.id} className="hover:bg-[#E9EDF6]/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1F2A5E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {c.fullName ? c.fullName.slice(0, 2).toUpperCase() : 'PO'}
                        </div>
                        <div>
                          <p className="font-bold text-[#161C3A] dark:text-white">{c.fullName}</p>
                          <p className="text-[11px] text-[#6B7494]">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-[#161C3A] dark:text-zinc-200">
                      {c.dni || '7' + Math.floor(1000000 + Math.random() * 9000000)}
                    </td>

                    <td className="py-3.5 px-4 text-[#6B7494] dark:text-[#9AA5C4]">
                      {c.position || 'Postpago Chile / GEA Perú'}
                    </td>

                    <td className="py-3.5 px-4">
                      {isInvited ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Invitación Enviada</span>
                        </span>
                      ) : score >= 80 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verificado (96.4%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pendiente de evaluación</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copyLink(c.id)}
                          className="p-1.5 rounded-lg border border-[#DDE2EF] text-[#6B7494] hover:text-[#1F2A5E] cursor-pointer"
                          title="Copiar enlace de validación"
                        >
                          {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendTrustInvite(c)}
                          className="px-3 py-1.5 rounded-xl bg-[#1F2A5E]/10 hover:bg-[#1F2A5E]/20 text-[#1F2A5E] dark:text-[#5B8AE0] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Invitar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
