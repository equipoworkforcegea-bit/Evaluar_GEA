import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import * as XLSX from 'xlsx';
import { Candidate, EvaluationTest } from '../../types';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  User,
  ArrowDownToLine,
  FileSpreadsheet
} from 'lucide-react';

interface InformesViewProps {
  candidates: Candidate[];
  tests: EvaluationTest[];
  onOpenReport?: (candidate: Candidate) => void;
}

export const InformesView: React.FC<InformesViewProps> = ({
  candidates,
  tests,
  onOpenReport
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [candidateScores, setCandidateScores] = useState<Record<string, number>>({});
  const [liveCandidates, setLiveCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadLiveData = async () => {
      try {
        const [cRes, kRes, compRes, notifRes] = await Promise.all([
          supabase
            .from('candidatos')
            .select('*, procesos_evaluacion(titulo, puesto_objetivo)')
            .order('invitado_en', { ascending: false }),
          supabase
            .from('evaluaciones_conocimientos')
            .select('candidato_id, puntaje, puntaje_maximo, completado_en, tema'),
          supabase
            .from('evaluaciones_competencias')
            .select('candidato_id, puntaje, puntaje_maximo, completado_en, competencia'),
          supabase
            .from('notificaciones')
            .select('candidato_id, titulo, creado_en')
            .eq('tipo', 'SISTEMA')
            .ilike('titulo', 'RESET%')
            .order('creado_en', { ascending: false })
        ]);

        if (!cRes.data || !isMounted) return;

        const notifs = notifRes.data || [];
        const getResetTs = (candId: string) => {
          const list = notifs.filter((n: any) => n.candidato_id === candId);
          if (!list.length) return 0;
          return Math.max(...list.map((n: any) => new Date(n.creado_en).getTime()));
        };

        const kMap = new Map<string, { score: number; max: number }>();
        (kRes.data || []).forEach((k: any) => {
          if (!k.candidato_id || !k.completado_en) return;
          const rTs = getResetTs(k.candidato_id);
          if (rTs && new Date(k.completado_en).getTime() <= rTs) return;
          const sc = Number(k.puntaje || 0);
          const mx = Number(k.puntaje_maximo || 20);
          const cur = kMap.get(k.candidato_id) || { score: 0, max: 0 };
          kMap.set(k.candidato_id, { score: cur.score + sc, max: cur.max + mx });
        });

        const compMap = new Map<string, { score: number; count: number }>();
        (compRes.data || []).forEach((c: any) => {
          if (!c.candidato_id || !c.completado_en) return;
          const rTs = getResetTs(c.candidato_id);
          if (rTs && new Date(c.completado_en).getTime() <= rTs) return;
          const sc = Number(c.puntaje || 0);
          const maxP = Number(c.puntaje_maximo || 100);
          const pct = maxP === 20 ? Math.round((sc / 20) * 100) : sc;
          const cur = compMap.get(c.candidato_id) || { score: 0, count: 0 };
          compMap.set(c.candidato_id, { score: cur.score + pct, count: cur.count + 1 });
        });

        const scoresMap: Record<string, number> = {};
        const builtCandidates: Candidate[] = cRes.data.map((row: any) => {
          const kInfo = kMap.get(row.id);
          const cInfo = compMap.get(row.id);

          const kAvg = kInfo && kInfo.max > 0 ? Math.round((kInfo.score / kInfo.max) * 100) : null;
          const cAvg = cInfo && cInfo.count > 0 ? Math.round(cInfo.score / cInfo.count) : null;

          let finalPct: number | null = null;
          if (kAvg !== null && cAvg !== null) finalPct = Math.round((kAvg + cAvg) / 2);
          else if (cAvg !== null) finalPct = cAvg;
          else if (kAvg !== null) finalPct = kAvg;

          if (finalPct !== null) {
            scoresMap[row.id] = finalPct;
          }

          const rawFullName = row.nombre_completo || row.full_name || 'Postulante';
          const nameParts = rawFullName.trim().split(/\s+/);
          const fName = nameParts[0] || 'Postulante';
          const lName = nameParts.slice(1).join(' ') || '';
          const dniVal = row.dni || '';

          const rawStatus = String(row.estado || '').toUpperCase();
          const isEvaluated = rawStatus === 'EVALUADO' || Boolean(row.completado_en);
          const isInProgress = !isEvaluated && finalPct !== null;
          const computedStatus = isEvaluated ? 'SCORED' : (isInProgress ? 'IN_PROGRESS' : 'INVITED');

          return {
            id: row.id,
            fullName: rawFullName,
            firstName: fName,
            lastName: lName,
            dni: dniVal,
            documentId: dniVal,
            email: row.correo || '',
            phone: row.telefono || '',
            position: row.procesos_evaluacion?.puesto_objetivo || 'Asesor',
            testId: row.proceso_id || '',
            invitationCode: row.codigo_invitacion || `GEA-${dniVal}`,
            invitedAt: row.invitado_en || new Date().toISOString(),
            status: computedStatus as any,
            startedAt: row.iniciado_en,
            completedAt: row.completado_en,
            scores: finalPct !== null ? {
              overall: finalPct,
              stage1Psycho: finalPct,
              stage2Emotional: finalPct,
              stage3WorkCases: finalPct,
              percentile: Math.min(99, Math.max(1, finalPct + 2))
            } : undefined,
            puntaje: finalPct,
            isConsentSigned: Boolean(row.consentimiento_firmado)
          } as Candidate;
        });

        if (isMounted) {
          setCandidateScores(scoresMap);
          setLiveCandidates(builtCandidates);
        }
      } catch (err) {
        console.warn('[InformesView] Error cargando datos en vivo:', err);
      }
    };

    loadLiveData();
    const interval = setInterval(loadLiveData, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Candidatos fuente (priorizar los datos en vivo)
  const sourceCandidates = liveCandidates.length > 0 ? liveCandidates : candidates;

  // Filtrado de candidatos
  const filteredCandidates = useMemo(() => {
    return sourceCandidates.filter(c => {
      if (selectedTestId !== 'TODOS') {
        const matchesTest = c.testId === selectedTestId || 
          (c.testId && tests.some(t => t.id === selectedTestId && (t.code === c.testId || t.title.toLowerCase().includes(c.testId.toLowerCase()))));
        if (!matchesTest) return false;
      }

      if (statusFilter !== 'TODOS') {
        const rawStatus = String(c.status || '').toUpperCase();
        if (statusFilter === 'COMPLETADOS') {
          if (rawStatus !== 'SCORED' && rawStatus !== 'EVALUADO' && rawStatus !== 'FINALIST' && rawStatus !== 'FINALISTA') return false;
        } else if (statusFilter === 'EN_PROCESO') {
          if (rawStatus !== 'IN_PROGRESS' && rawStatus !== 'EN_CURSO') return false;
        } else if (statusFilter === 'CONTRATADOS') {
          if (rawStatus !== 'FINALIST' && rawStatus !== 'FINALISTA') return false;
        }
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (c.fullName || `${c.firstName || ''} ${c.lastName || ''}`).toLowerCase().includes(q);
        const matchDni = (c.dni || (c as any).documentId || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        if (!matchName && !matchDni && !matchEmail) return false;
      }

      return true;
    });
  }, [sourceCandidates, tests, selectedTestId, statusFilter, searchTerm]);

  // Exportar a Excel (con datos activos y resultados reales)
  const handleExportExcel = () => {
    const dataToExport = filteredCandidates.map((c, idx) => {
      const rawStatus = String(c.status || '').toUpperCase();
      const score = c.scores?.overall ?? (c as any).puntaje ?? candidateScores[c.id];
      const isEvaluated = rawStatus === 'SCORED' || rawStatus === 'EVALUADO' || rawStatus === 'FINALIST' || rawStatus === 'FINALISTA';
      const isInProgress = !isEvaluated && score != null;
      const displayStatus = isEvaluated ? 'EVALUADO' : (isInProgress ? 'EN_CURSO' : 'INVITADO');

      return {
        'N°': idx + 1,
        'Postulante': c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Postulante',
        'DNI / Documento': c.dni || (c as any).documentId || 'S/D',
        'Email': c.email,
        'Teléfono': c.phone || 'S/T',
        'Campaña / Proceso': tests.find(t => t.id === c.testId)?.title || c.testId || 'Proceso General',
        'Estado': displayStatus,
        'Puntaje General': score != null ? `${score}%` : 'Pendiente',
        'Consentimiento Datos (Ley 29733)': c.isConsentSigned ? 'Aceptado' : 'Pendiente',
        'Fecha Invitación': c.invitedAt ? new Date(c.invitedAt).toLocaleDateString() : 'N/A',
        'Fecha Finalización': isEvaluated && c.completedAt ? new Date(c.completedAt).toLocaleDateString() : 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Postulantes');
    XLSX.writeFile(workbook, `Informe_GEA_Seleccion_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-in fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1F2A5E]/10 dark:bg-white/10 text-[#1F2A5E] dark:text-[#5B8AE0]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2A5E] dark:text-white tracking-tight">
              Informes & Consolidado de Selección
            </h1>
            <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4] mt-0.5">
              Genera, audita y descarga reportes detallados en Excel de postulantes evaluados para operaciones y gerencia de GEA Perú.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-4 py-2.5 rounded-xl bg-[#2FA58B] hover:bg-[#258771] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar a Excel ({filteredCandidates.length})</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs flex flex-wrap gap-3 items-center">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por postulante, DNI o email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8]"
          />
          <Search className="w-4 h-4 text-[#6B7494] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filtro por Proceso */}
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8] cursor-pointer"
        >
          <option value="TODOS">Todos los procesos</option>
          {tests.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        {/* Filtro por Estado */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] text-[#161C3A] dark:text-white outline-none focus:border-[#2F5BA8] cursor-pointer"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="COMPLETADOS">Completados / Evaluados</option>
          <option value="EN_PROCESO">En curso</option>
          <option value="CONTRATADOS">Finalistas / Contratados</option>
        </select>
      </div>

      {/* Tabla de Postulantes para el Informe */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#151D3F] text-[#6B7494] dark:text-[#9AA5C4] font-bold uppercase tracking-wider border-b border-[#DDE2EF] dark:border-[#2A3563]">
              <tr>
                <th className="p-3.5 pl-5">Postulante</th>
                <th className="p-3.5">DNI</th>
                <th className="p-3.5">Campaña / Proceso</th>
                <th className="p-3.5 text-center">Puntaje</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Ley 29733</th>
                <th className="p-3.5 pr-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE2EF]/60 dark:divide-[#2A3563]/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7494]">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(c => {
                  const testTitle = tests.find(t => t.id === c.testId)?.title || c.testId || 'Proceso General';
                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-[#161C3A] dark:text-white">
                          {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Postulante'}
                        </div>
                        <div className="text-[11px] text-[#6B7494]">{c.email}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[#161C3A] dark:text-white">
                        {c.dni || (c as any).documentId || 'S/D'}
                      </td>
                      <td className="p-3.5 text-[#6B7494] dark:text-[#9AA5C4]">
                        {testTitle}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        {(() => {
                          const score = c.scores?.overall ?? (c as any).puntaje ?? candidateScores[c.id];
                          return (score != null && score > 0) ? (
                            <span className={`px-2 py-0.5 rounded-md ${
                              score >= 80 ? 'bg-[#2FA58B]/10 text-[#2FA58B]' : score >= 60 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {score}%
                            </span>
                          ) : (
                            <span className="text-[#6B7494]">—</span>
                          );
                        })()}
                      </td>
                      <td className="p-3.5 text-center">
                        {(() => {
                          const rawStatus = String(c.status || '').toUpperCase();
                          const hasScore = (c.scores?.overall ?? (c as any).puntaje ?? candidateScores[c.id]) != null;
                          const isEvaluated = rawStatus === 'SCORED' || rawStatus === 'EVALUADO' || rawStatus === 'FINALIST' || rawStatus === 'FINALISTA';
                          const isInProgress = !isEvaluated && (hasScore || rawStatus === 'IN_PROGRESS' || rawStatus === 'EN_CURSO');
                          
                          const effectiveStatus = isEvaluated ? 'EVALUADO' : (isInProgress ? 'EN_CURSO' : 'INVITADO');
                          return (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              effectiveStatus === 'EVALUADO' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                : effectiveStatus === 'EN_CURSO'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                  : 'bg-[#1F2A5E]/10 text-[#1F2A5E] dark:text-[#5B8AE0]'
                            }`}>
                              {effectiveStatus}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2FA58B]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Conforme</span>
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        {onOpenReport && (
                          <button
                            type="button"
                            onClick={() => onOpenReport(c)}
                            className="px-2.5 py-1 rounded-lg border border-[#2F5BA8] text-[#2F5BA8] hover:bg-[#2F5BA8]/5 font-semibold text-xs cursor-pointer transition-colors"
                          >
                            Ver Ficha
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
