import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabaseClient';
import { Candidate, EvaluationTest } from '../../types';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowLeft,
  Filter,
  AlertTriangle
} from 'lucide-react';

interface AssignedCandidatesViewProps {
  tests: EvaluationTest[];
  onBackToProcesses?: () => void;
}

interface AssignedCandidateRecord {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  usuario: string;
  numero: string;
  correo: string;
  proceso_id: string;
  proceso_titulo?: string;
  estado: 'INVITADO' | 'REGISTRADO' | 'IN_PROGRESS' | 'COMPLETADO' | 'FINALISTA';
  consentimiento_firmado: boolean;
  consentimiento_fecha?: string;
  invitado_en?: string;
}

export const AssignedCandidatesView: React.FC<AssignedCandidatesViewProps> = ({
  tests,
  onBackToProcesses
}) => {
  const [candidatesList, setCandidatesList] = useState<AssignedCandidateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidateToDelete, setCandidateToDelete] = useState<AssignedCandidateRecord | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Cargar postulantes desde Supabase con compatibilidad total de columnas
  const fetchAssignedCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('invitado_en', { ascending: false });

      if (!error && data) {
        const mapped: AssignedCandidateRecord[] = data.map((row: any) => {
          // Extraer nombre y apellido si no vienen en columnas separadas
          let nom = row.nombre || '';
          let ape = row.apellido || '';
          if (!nom && row.nombre_completo) {
            const parts = row.nombre_completo.trim().split(/\s+/);
            if (parts.length >= 3) {
              ape = parts.slice(-2).join(' ');
              nom = parts.slice(0, -2).join(' ');
            } else if (parts.length === 2) {
              nom = parts[0];
              ape = parts[1];
            } else {
              nom = parts[0] || '';
            }
          }

          const matchedTest = tests.find(t => t.id === row.proceso_id);
          const rawState = (row.estado || 'INVITADO').toUpperCase();
          const cleanState = (rawState === 'REGISTRADO' || row.consentimiento_firmado || row.auth_usuario_id) 
            ? 'REGISTRADO' 
            : 'INVITADO';

          return {
            id: row.id,
            dni: row.dni || '',
            nombre: nom || 'Postulante',
            apellido: ape || '',
            nombre_completo: row.nombre_completo || `${nom} ${ape}`.trim(),
            usuario: row.usuario || (row.correo ? row.correo.split('@')[0] : 'usuario'),
            numero: row.numero || row.telefono || '-',
            correo: row.correo || '',
            proceso_id: row.proceso_id || '',
            proceso_titulo: matchedTest?.title || 'Convocatoria Masiva 2026',
            estado: cleanState,
            consentimiento_firmado: Boolean(row.consentimiento_firmado || row.consentimiento_ley),
            consentimiento_fecha: row.consentimiento_firmado_en || row.consentimiento_fecha,
            invitado_en: row.invitado_en
          };
        });

        setCandidatesList(mapped);
      }
    } catch (err) {
      console.warn('[AssignedCandidatesView] Error cargando candidatos:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedCandidates();

    // Suscripción Realtime para actualizar la tabla inmediatamente al registrarse un postulante
    const channel = supabase
      .channel('candidatos-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidatos' },
        () => {
          fetchAssignedCandidates();
          showNotification('✓ Registro de postulantes actualizado en tiempo real.');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tests]);

  // Filtrado por proceso y por término de búsqueda (DNI, Nombre, Apellido, Usuario, Número)
  const filteredCandidates = candidatesList.filter(c => {
    if (selectedProcessFilter !== 'TODOS' && c.proceso_id !== selectedProcessFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDni = c.dni.toLowerCase().includes(q);
      const matchNom = c.nombre.toLowerCase().includes(q);
      const matchApe = c.apellido.toLowerCase().includes(q);
      const matchUser = c.usuario.toLowerCase().includes(q);
      const matchNum = c.numero.toLowerCase().includes(q);
      const matchProc = (c.proceso_titulo || '').toLowerCase().includes(q);
      return matchDni || matchNom || matchApe || matchUser || matchNum || matchProc;
    }
    return true;
  });

  // Exportar a Excel con formato institucional GEA
  const handleExportExcel = () => {
    const dataToExport = filteredCandidates.map(c => ({
      'DNI': c.dni,
      'Nombre': c.nombre,
      'Apellido': c.apellido,
      'Nombre Completo': c.nombre_completo,
      'Usuario': c.usuario,
      'Número de Teléfono': c.numero,
      'Correo Electrónico': c.correo,
      'Proceso Asignado': c.proceso_titulo,
      'Estado': c.estado,
      'Consentimiento Ley 29733': c.consentimiento_firmado ? 'Firmado' : 'Pendiente',
      'Fecha Consentimiento': c.consentimiento_fecha ? new Date(c.consentimiento_fecha).toLocaleString('es-PE') : '-',
      'Fecha Invitación': c.invitado_en ? new Date(c.invitado_en).toLocaleString('es-PE') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Postulantes_Asignados');
    XLSX.writeFile(workbook, `GEA_Postulantes_Asignados_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showNotification('✓ Archivo Excel generado y descargado exitosamente.');
  };

  // Eliminación de datos conforme a la Ley N° 29733 (Derechos ARCO - Cancelación/Supresión)
  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidateToDelete.id);

      if (!error) {
        setCandidatesList(prev => prev.filter(c => c.id !== candidateToDelete.id));
        showNotification(`✓ Registro y datos del postulante ${candidateToDelete.nombre_completo} eliminados conforme a Ley N° 29733.`);
      } else {
        alert('Error al eliminar registro: ' + error.message);
      }
    } catch (err: any) {
      alert('Error en la operación: ' + err.message);
    } finally {
      setCandidateToDelete(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in font-sans">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1F2A5E] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#2F5BA8]">
          <CheckCircle2 className="w-4 h-4 text-[#2FA58B]" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* TOP HEADER ROW: Icon + Title + Subtitle + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          {onBackToProcesses && (
            <button
              type="button"
              onClick={onBackToProcesses}
              className="mt-1 p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer shadow-2xs transition-colors"
              title="Volver a Procesos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="mt-0.5">
            <Users className="w-7 h-7 text-[#1F2A5E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans">
              Postulantes y Procesos Asignados
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Control general de candidatos convocados, estado de registro y cumplimiento de la Ley N° 29733.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              fetchAssignedCandidates();
            }}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-4 h-4 text-[#2F5BA8] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          {/* Export to Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl border border-[#2F5BA8] text-[#2F5BA8] bg-white dark:bg-zinc-900 hover:bg-[#2F5BA8]/5 font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por DNI, Nombre, Apellido, Usuario o Teléfono..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white focus:ring-1 focus:ring-[#1F2A5E] outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter by Process Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-500 font-medium">Proceso:</span>
            <select
              value={selectedProcessFilter}
              onChange={e => setSelectedProcessFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-[#1F2A5E] cursor-pointer"
            >
              <option value="TODOS">Todos los procesos convocados</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Counter strip */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span>Mostrando <strong>{filteredCandidates.length}</strong> de <strong>{candidatesList.length}</strong> postulantes convocados</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]" />
              <span>Invitados: <strong>{candidatesList.filter(c => c.estado === 'INVITADO').length}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2FA58B]" />
              <span>Registrados: <strong>{candidatesList.filter(c => c.estado === 'REGISTRADO').length}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* CANDIDATES TABLE (REUSING EXISTING TABLE STYLES) */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Apellido</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Número</th>
                <th className="py-3.5 px-4">Proceso Asignado</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-[#1F2A5E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Cargando postulantes desde Supabase...</span>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300 text-xs">
                      No se encontraron postulantes con los criterios de búsqueda.
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Lanza un proceso con invitación por correo para ver postulantes registrados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr 
                    key={cand.id} 
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* DNI */}
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {cand.dni || '-'}
                    </td>

                    {/* Nombre */}
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {cand.nombre}
                    </td>

                    {/* Apellido */}
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {cand.apellido || '-'}
                    </td>

                    {/* Usuario */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      @{cand.usuario}
                    </td>

                    {/* Número */}
                    <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                      {cand.numero}
                    </td>

                    {/* Proceso Asignado */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="truncate block font-semibold text-[#2F5BA8] dark:text-[#5B8AE0]" title={cand.proceso_titulo}>
                        {cand.proceso_titulo}
                      </span>
                    </td>

                    {/* Estado: Invitado / Registrado */}
                    <td className="py-3.5 px-4 text-center">
                      {cand.estado === 'REGISTRADO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-[#2FA58B]" />
                          <span>Registrado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-[#F28C28]" />
                          <span>Invitado</span>
                        </span>
                      )}
                    </td>

                    {/* Acciones: Ley 29733 (Eliminar datos del postulante / Derecho de Supresión) */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setCandidateToDelete(cand)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-[#E4572E] hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                        title="Eliminar datos del postulante (Ley N° 29733)"
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN - LEY N° 29733 */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#E4572E]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Eliminar Datos Personales
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Cumplimiento Ley N° 29733 (Protección de Datos)
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              ¿Estás seguro de eliminar el registro y los datos del postulante <strong>{candidateToDelete.nombre_completo}</strong> (DNI: {candidateToDelete.dni})? Esta acción revocará su acceso y suprimirá de forma definitiva sus datos según los derechos ARCO.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCandidateToDelete(null)}
                className="px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCandidate}
                className="px-4 py-2 text-xs rounded-xl bg-[#E4572E] hover:bg-[#d04620] text-white font-bold cursor-pointer shadow-xs"
              >
                Sí, Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
