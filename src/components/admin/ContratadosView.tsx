import React, { useState, useMemo } from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { 
  UserCheck, 
  Search, 
  Calendar, 
  Download, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  IdCard
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContratadosViewProps {
  candidates: Candidate[];
  tests: EvaluationTest[];
  onOpenCandidateDetail?: (candidate: Candidate) => void;
}

export const ContratadosView: React.FC<ContratadosViewProps> = ({
  candidates,
  tests,
  onOpenCandidateDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('TODOS');

  // Candidatos contratados o finalistas aprobados
  const hiredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const status = String(c.status || '').toUpperCase();
      const isHired = status === 'FINALIST' || status === 'FINALISTA' || status === 'CONTRATADO';
      if (!isHired) return false;

      if (selectedProcess !== 'TODOS' && c.testId !== selectedProcess) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = `${c.firstName} ${c.lastName}`.toLowerCase().includes(q);
        const matchDoc = (c.documentId || '').toLowerCase().includes(q);
        return matchName || matchDoc;
      }

      return true;
    });
  }, [candidates, selectedProcess, searchTerm]);

  const handleExportHired = () => {
    const data = hiredCandidates.map((c, i) => ({
      'N°': i + 1,
      'Nombres y Apellidos': `${c.firstName} ${c.lastName}`,
      'DNI / Cédula': c.documentId || 'S/D',
      'Email': c.email,
      'Teléfono': c.phone || 'S/T',
      'Proceso / Campaña': tests.find(t => t.id === c.testId)?.title || c.testId || 'Campaña General',
      'Puntaje Psicométrico': c.scores?.overall ? `${c.scores.overall}%` : 'Apto',
      'Estado': 'CONTRATADO',
      'Fecha Ingreso': c.completedAt ? new Date(c.completedAt).toLocaleDateString() : new Date().toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contratados');
    XLSX.writeFile(wb, `Contratados_GEA_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-in fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-[#2FA58B]/10 text-[#2FA58B]">
            <IdCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2A5E] dark:text-white tracking-tight">
              Bandeja de Contratados
            </h1>
            <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4] mt-0.5">
              Historial y control de postulantes que completaron con éxito las evaluaciones y fueron formalizados para ingreso en GEA Perú.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportHired}
          className="px-4 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Nómina ({hiredCandidates.length})</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs">
          <span className="text-xs text-[#6B7494] font-medium">Contratados Totales</span>
          <div className="text-2xl font-black text-[#2FA58B] mt-1">{hiredCandidates.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs">
          <span className="text-xs text-[#6B7494] font-medium">Campañas Activas con Altas</span>
          <div className="text-2xl font-black text-[#1F2A5E] dark:text-white mt-1">
            {new Set(hiredCandidates.map(c => c.testId)).size}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs">
          <span className="text-xs text-[#6B7494] font-medium">Tasa de Aprobación Final</span>
          <div className="text-2xl font-black text-[#F28C28] mt-1">
            {candidates.length > 0 ? `${Math.round((hiredCandidates.length / candidates.length) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar contratado por nombre o DNI..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8]"
          />
          <Search className="w-4 h-4 text-[#6B7494] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8] cursor-pointer"
        >
          <option value="TODOS">Todas las campañas</option>
          {tests.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Tabla de Contratados */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#151D3F] text-[#6B7494] dark:text-[#9AA5C4] font-bold uppercase tracking-wider border-b border-[#DDE2EF] dark:border-[#2A3563]">
              <tr>
                <th className="p-3.5 pl-5">Colaborador Contratado</th>
                <th className="p-3.5">DNI</th>
                <th className="p-3.5">Campaña / Cuenta</th>
                <th className="p-3.5 text-center">Calificación</th>
                <th className="p-3.5 text-center">Estado Laboral</th>
                <th className="p-3.5 pr-5 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
              {hiredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B7494]">
                    No hay postulantes formalizados como contratados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                hiredCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-[#161C3A] dark:text-white">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-[#6B7494] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#161C3A] dark:text-white">
                      {c.documentId || 'S/D'}
                    </td>
                    <td className="p-3.5 text-[#6B7494] dark:text-[#9AA5C4]">
                      {tests.find(t => t.id === c.testId)?.title || c.testId || 'Campaña General'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-[#2FA58B]/10 text-[#2FA58B]">
                        {c.scores?.overall ? `${c.scores.overall}%` : '100%'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>CONTRATADO</span>
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      {onOpenCandidateDetail && (
                        <button
                          type="button"
                          onClick={() => onOpenCandidateDetail(c)}
                          className="px-2.5 py-1 rounded-lg border border-[#2F5BA8] text-[#2F5BA8] hover:bg-[#2F5BA8]/5 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          Ver Perfil
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
