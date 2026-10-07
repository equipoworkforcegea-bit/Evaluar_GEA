import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Candidate, EvaluationTest } from '../../types';
import { 
  Rocket, 
  Clock, 
  Calendar, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Hourglass, 
  RotateCw, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface ProcesosInvitadosViewProps {
  candidate: Candidate;
  onStartExam: (testId?: string) => void;
}

interface InvitedProcess {
  id: string;
  codigo: string;
  titulo: string;
  empresa: string;
  puesto_objetivo: string;
  descripcion: string;
  duracion_minutos: number;
  fecha_limite: string;
  estado_postulante: 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';
}

export const ProcesosInvitadosView: React.FC<ProcesosInvitadosViewProps> = ({
  candidate,
  onStartExam
}) => {
  const [invitedProcesses, setInvitedProcesses] = useState<InvitedProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realName, setRealName] = useState<string>(candidate.fullName);
  const [realDni, setRealDni] = useState<string>(candidate.dni);

  useEffect(() => {
    setRealName(candidate.fullName);
    setRealDni(candidate.dni);
  }, [candidate.fullName, candidate.dni]);

  useEffect(() => {
    async function loadInvitedProcesses() {
      try {
        let targetProcessId = candidate.testId;

        // 1. Si candidate.id existe, buscar el proceso_id real del candidato en Supabase
        if (candidate.id) {
          const { data: candDb } = await supabase
            .from('candidatos')
            .select('id, nombre_completo, dni, proceso_id, estado, iniciado_en, completado_en')
            .eq('id', candidate.id)
            .maybeSingle();

          if (candDb) {
            if (candDb.nombre_completo) setRealName(candDb.nombre_completo);
            if (candDb.dni) setRealDni(candDb.dni);
            if (candDb.proceso_id) {
              targetProcessId = candDb.proceso_id;
            }
          }
        }

        // 2. Determinar estado del postulante
        let status: 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO' = 'PENDIENTE';
        if (candidate.status === 'SCORED' || candidate.status === 'FINALIST' || candidate.status === 'EVALUADO' || candidate.status === 'FINALISTA') {
          status = 'FINALIZADO';
        } else if (candidate.status === 'IN_PROGRESS' || candidate.status === 'EN_CURSO' || candidate.startedAt) {
          status = 'EN_PROGRESO';
        }

        // 3. Consultar ÚNICAMENTE el proceso específico de este candidato
        if (targetProcessId) {
          const { data, error } = await supabase
            .from('procesos_evaluacion')
            .select('*')
            .eq('id', targetProcessId)
            .maybeSingle();

          if (!error && data) {
            setInvitedProcesses([{
              id: data.id,
              codigo: data.codigo || 'GEA-PROC-2026',
              titulo: data.titulo || `Convocatoria ${data.puesto_objetivo || candidate.position || 'GEA Perú'}`,
              empresa: data.empresa || 'GEA Internacional SAC • GEA Perú',
              puesto_objetivo: data.puesto_objetivo || candidate.position || 'Asesor Operativo',
              descripcion: data.descripcion || 'Evaluación integral psicotécnica, clima emocional y resolución de casos reales.',
              duracion_minutos: data.duracion_total_minutos || 45,
              fecha_limite: data.fecha_fin ? new Date(data.fecha_fin).toLocaleDateString('es-PE') : '31/12/2026',
              estado_postulante: status
            }]);
            return;
          }
        }

        // 4. Fallback seguro: exclusivamente la convocatoria para el puesto asignado del candidato
        setInvitedProcesses([
          {
            id: targetProcessId || candidate.testId || 'proc-gea',
            codigo: 'GEA-PROC-2026-01',
            titulo: `Convocatoria Oficial: ${candidate.position || 'Asesor Operativo'}`,
            empresa: 'GEA Internacional SAC • GEA Perú',
            puesto_objetivo: candidate.position || 'Asesor Operativo',
            descripcion: 'Evaluación integral psicotécnica, clima emocional y resolución de casos reales.',
            duracion_minutos: 45,
            fecha_limite: '31/12/2026',
            estado_postulante: status
          }
        ]);
      } catch (err) {
        console.warn('[ProcesosInvitadosView] Error al cargar proceso:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInvitedProcesses();
  }, [candidate]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-sans animate-in fade-in">
      
      {/* 1. TOP HEADER BANNER (REUSING GEA BRAND BANNER STYLE) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Convocatoria Oficial Activa • GEA Perú</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Procesos Invitados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hola, <strong className="text-slate-800 dark:text-slate-200">{realName || candidate.fullName}</strong> (DNI: {realDni || candidate.dni}). A continuación encuentras las evaluaciones asignadas a tu perfil.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#EEF1FA] dark:bg-[#151D3F] border border-[#DDE2EF]/80 dark:border-[#2A3563]/80 shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#2FA58B]" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-[#1F2A5E] dark:text-[#5B8AE0] block">Acceso Verificado</span>
              <span className="text-[#6B7494] block">Ley N° 29733 Protegido</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#2F5BA8]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. PROCESS CARDS LIST (EXACT PROCESS CARD STYLE FROM EVALUAR) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-zinc-400 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563]">
            <div className="w-6 h-6 border-2 border-[#1F2A5E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Cargando tus procesos de evaluación...</span>
          </div>
        ) : invitedProcesses.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563]">
            <Rocket className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              No tienes evaluaciones pendientes en este momento
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Si recibiste una nueva invitación por correo, verifica que hayas ingresado con el enlace provisto.
            </p>
          </div>
        ) : (
          invitedProcesses.map((proc) => {
            const isCompleted = proc.estado_postulante === 'FINALIZADO';
            const isInProgress = proc.estado_postulante === 'EN_PROGRESO';

            return (
              <div
                key={proc.id}
                className="p-5 sm:p-6 rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] bg-white dark:bg-[#182044] shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* LEFT: Process Info, Company, Metadata & Badges */}
                  <div className="space-y-2.5 max-w-2xl">
                    
                    {/* Title */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base sm:text-lg text-[#2F5BA8] dark:text-[#5B8AE0] tracking-wide">
                        {proc.titulo}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#1F2A5E]/10 dark:bg-white/10 text-[#1F2A5E] dark:text-white font-mono font-bold text-[10px]">
                        {proc.codigo}
                      </span>
                    </div>

                    {/* Company and Position */}
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Empresa: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{proc.empresa}</strong></span>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Duración estimada: <strong className="text-zinc-700 dark:text-zinc-300">{proc.duracion_minutos} minutos</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Fecha de vencimiento: <strong className="text-zinc-700 dark:text-zinc-300">{proc.fecha_limite}</strong></span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {proc.descripcion}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 pt-1">
                      {isCompleted ? (
                        <span className="px-3 py-1 rounded-full bg-[#2FA58B]/10 text-[#2FA58B] border border-[#2FA58B]/25 font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Evaluación Completada</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="px-3 py-1 rounded-full bg-[#F28C28]/15 text-[#F28C28] border border-[#F28C28]/35 font-bold text-xs flex items-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>En Progreso</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/25 font-bold text-xs flex items-center gap-1.5">
                          <Hourglass className="w-3.5 h-3.5" />
                          <span>Pendiente de Inicio</span>
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-400">
                        Puesto: {proc.puesto_objetivo}
                      </span>
                    </div>

                  </div>

                  {/* RIGHT: Action Button */}
                  <div className="shrink-0 self-start lg:self-center">
                    {isCompleted ? (
                      <button
                        type="button"
                        disabled
                        className="px-6 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-default shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completado</span>
                      </button>
                    ) : isInProgress ? (
                      <button
                        type="button"
                        onClick={() => onStartExam(proc.id)}
                        className="px-6 py-3 rounded-xl bg-[#2F5BA8] hover:bg-[#244988] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 transition-all"
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>Continuar Evaluación</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartExam(proc.id)}
                        className="px-6 py-3 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 transition-all"
                      >
                        <Rocket className="w-4 h-4 fill-white/20" />
                        <span>Iniciar Evaluación</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
