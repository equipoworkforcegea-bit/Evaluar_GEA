import React, { useState, useEffect } from 'react';
import { Candidate, EvaluationTest } from '../../types';
import { CandidateDetailModal } from './CandidateDetailModal';
import { PrintableCandidateReport } from './PrintableCandidateReport';
import { InviteCandidateModal } from './InviteCandidateModal';
import { EvaluarProcessListView, ProcessModuleFilter } from './EvaluarProcessListView';
import { ProcessDetailControlView } from './ProcessDetailControlView';
import { CandidateFullReportView } from './CandidateFullReportView';
import { AnalyticsView } from './AnalyticsView';
import { ProfilesManagerView } from './ProfilesManagerView';
import { TalentPoolView } from './TalentPoolView';
import { TrustView } from './TrustView';
import { ViralizacionView } from './ViralizacionView';
import { CreateProcessModal } from './CreateProcessModal';
import { CreateProfileModal } from './CreateProfileModal';
import { AssignedCandidatesView } from './AssignedCandidatesView';
import { InformesView } from './InformesView';
import { ContratadosView } from './ContratadosView';
import { NoDeseadosView } from './NoDeseadosView';
import { ProcessDataService } from '../../services/processDataService';
import { CandidateDataService } from '../../services/candidateDataService';
import { INITIAL_EVALUATION_TESTS } from '../../data/testTemplates';
import { 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  UserPlus, 
  FileText, 
  Rocket, 
  BarChart2, 
  User, 
  Plus 
} from 'lucide-react';

export type MainAdminTab = 
  | 'ANALITICA' 
  | 'PERFILES' 
  | 'PROCESOS' 
  | 'TALENT_POOL' 
  | 'DESARROLLO' 
  | 'POTENCIAL'
  | 'POSTULANTES'
  | 'VIRALIZACION'
  | 'TRUST'
  | 'SEGURIDAD'
  | 'INFORMES'
  | 'CONTRATADOS'
  | 'NO_DESEADOS';

interface AdminDashboardProps {
  candidates: Candidate[];
  onUpdateCandidate: (candidate: Candidate) => void;
  onAddCandidates: (newCandidates: Candidate[]) => void;
  onSwitchToCandidateView: (candidateId?: string) => void;
  activeTab?: MainAdminTab;
  onTabChange?: (tab: MainAdminTab) => void;
  activeProcessId?: string;
  onSelectProcess?: (id: string | null) => void;
  activeModuleFilter?: ProcessModuleFilter;
  onSelectModuleFilter?: (filter: ProcessModuleFilter) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  candidates,
  onUpdateCandidate,
  onAddCandidates,
  onSwitchToCandidateView,
  activeTab: activeTabProp = 'PROCESOS',
  onTabChange,
  activeProcessId,
  onSelectProcess,
  activeModuleFilter: activeModuleFilterProp,
  onSelectModuleFilter: onSelectModuleFilterProp
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [reportCandidate, setReportCandidate] = useState<Candidate | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState<boolean>(false);
  const [showCreateProcessModal, setShowCreateProcessModal] = useState<boolean>(false);
  const [createProcessPreselectedProfileId, setCreateProcessPreselectedProfileId] = useState<string | null>(null);
  const [inviteTargetTestId, setInviteTargetTestId] = useState<string | null>(null);
  const [internalTab, setInternalTab] = useState<MainAdminTab>(activeTabProp);
  const [filterByActiveProcess, setFilterByActiveProcess] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [internalModuleFilter, setInternalModuleFilter] = useState<ProcessModuleFilter>(
    activeTabProp === 'VIRALIZACION' ? 'VIRALIZACION' :
    activeTabProp === 'TRUST' ? 'TRUST' :
    activeTabProp === 'SEGURIDAD' ? 'SEGURIDAD' : 'TODOS'
  );
  const activeModuleFilter = activeModuleFilterProp || internalModuleFilter;
  const setActiveModuleFilter = (filter: ProcessModuleFilter) => {
    setInternalModuleFilter(filter);
    onSelectModuleFilterProp?.(filter);
  };

  // Sync prop changes
  useEffect(() => {
    if (activeTabProp) {
      setInternalTab(activeTabProp);
    }
  }, [activeTabProp]);

  const activeTab: MainAdminTab = activeTabProp || internalTab;
  const setActiveTab = (tab: MainAdminTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  // Tests and profiles management state (Separados limpiamente para reflejar datos reales de Supabase)
  const [processes, setProcesses] = useState<EvaluationTest[]>([]);
  const [profiles, setProfiles] = useState<EvaluationTest[]>([]);
  const [activeTestId, setActiveTestId] = useState<string>('');
  const [selectedProcessForControl, setSelectedProcessForControl] = useState<EvaluationTest | null>(null);
  const [controlInitialTab, setControlInitialTab] = useState<'CANDIDATOS' | 'COMPARADOR' | 'PRESELECCIONADOS' | 'TABLERO' | 'NO_DESEADOS' | 'DASHBOARD' | 'NOTIFICACIONES'>('CANDIDATOS');

  // Cargar procesos y perfiles reales desde Supabase al iniciar
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        const [dbProcesses, dbProfiles] = await Promise.all([
          ProcessDataService.getProcesses(),
          ProcessDataService.getProfiles()
        ]);

        if (dbProcesses && dbProcesses.length > 0) {
          setProcesses(dbProcesses);
          setActiveTestId(dbProcesses[0].id);
        } else {
          setProcesses(INITIAL_EVALUATION_TESTS);
          if (INITIAL_EVALUATION_TESTS[0]) {
            setActiveTestId(INITIAL_EVALUATION_TESTS[0].id);
          }
        }

        if (dbProfiles && dbProfiles.length > 0) {
          setProfiles(dbProfiles);
        }
      } catch (err) {
        console.warn('[AdminDashboard] Error al sincronizar con Supabase:', err);
      }
    }
    loadDataFromSupabase();
  }, []);

  // Sincronizar proceso específico seleccionado para la vista de control (URL o interactivo)
  useEffect(() => {
    if (activeProcessId && processes.length > 0) {
      const found = processes.find(p => 
        p.id === activeProcessId || 
        (p.code && p.code === activeProcessId) ||
        (p.id && activeProcessId && p.id.toLowerCase() === activeProcessId.toLowerCase())
      );
      if (found) {
        setSelectedProcessForControl(found);
      }
    } else if (!activeProcessId) {
      setSelectedProcessForControl(null);
    }
  }, [activeProcessId, processes]);

  const handleOpenProcessDetail = (test: EvaluationTest) => {
    setSelectedProcessForControl(test);
    setActiveTestId(test.id);
    setControlInitialTab('CANDIDATOS');
    onSelectProcess?.(test.id);
  };

  const handleBackFromProcessDetail = () => {
    setSelectedProcessForControl(null);
    onSelectProcess?.(null);
  };

  const currentActiveTest = processes.find(t => t.id === activeTestId) || processes[0] || INITIAL_EVALUATION_TESTS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleActive = async (testId: string) => {
    let toastMsg = '';
    setProfiles(prev => prev.map(t => {
      if (t.id === testId) {
        const nextState = !t.isActive;
        toastMsg = `✓ Perfil "${t.title}" ahora está ${nextState ? 'ACTIVO' : 'PAUSADO'}.`;
        return { ...t, isActive: nextState, processStatus: nextState ? 'LANZADO' : 'BORRADOR' };
      }
      return t;
    }));
    setProcesses(prev => prev.map(t => {
      if (t.id === testId) {
        const nextState = !t.isActive;
        return { ...t, isActive: nextState, processStatus: nextState ? 'LANZADO' : 'BORRADOR' };
      }
      return t;
    }));
    // Persist to Supabase
    try {
      const profile = profiles.find(p => p.id === testId);
      const nextActive = profile ? !profile.isActive : true;
      await ProcessDataService.updateProfileActive(testId, nextActive);
    } catch (err) {
      console.warn('[AdminDashboard] No se pudo persistir activo en Supabase:', err);
    }
    if (toastMsg) showToast(toastMsg);
  };

  // Candidates filtered by selected process
  const displayedCandidates = filterByActiveProcess && currentActiveTest
    ? candidates.filter(c => c.position === currentActiveTest.targetPosition || c.testId === currentActiveTest.id)
    : candidates;

  const handlePromoteCandidate = (candidateId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;
    const updated: Candidate = { ...cand, status: 'FINALIST' };
    onUpdateCandidate(updated);
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(updated);
    }
    showToast(`✓ Postulante ${cand.fullName} promovido a la lista de Finalistas.`);
  };

  const handleResendInvitation = async (candidateId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    showToast(`⏳ Reseteando progreso de ${cand.fullName || cand.email}...`);

    const success = await CandidateDataService.resetCandidateForResend(candidateId);

    if (success) {
      // Actualizar el candidato en el estado local con status INVITED
      onUpdateCandidate({
        ...cand,
        status: 'INVITED',
        currentStage: 'STAGE_1_PSYCHO',
        isConsentSigned: false,
        startedAt: undefined,
        completedAt: undefined,
        totalDurationSeconds: undefined,
        scores: undefined,
        detailedReport: undefined
      });
      showToast(`✉ Invitación reenviada a ${cand.email}. Progreso del candidato reiniciado.`);
    } else {
      showToast(`⚠️ No se pudo resetear el progreso de ${cand.fullName || cand.email}.`);
    }
  };

  const handleCreateTest = async (newTest: EvaluationTest) => {
    const saved = await ProcessDataService.createProcess(newTest);
    const testToUse = saved || newTest;
    setProcesses(prev => [testToUse, ...prev.filter(t => t.id !== testToUse.id)]);
    setActiveTestId(testToUse.id);
    showToast(`✓ Nueva convocatoria "${testToUse.title}" guardada en la base de datos.`);
  };

  const handleUpdateProcessStatus = async (
    testId: string,
    newStatus: 'LANZADO' | 'EN_PROCESO' | 'CERRADO' | 'BORRADOR'
  ) => {
    setProcesses(prev => prev.map(t =>
      t.id === testId
        ? { ...t, processStatus: newStatus, isActive: newStatus === 'LANZADO' || newStatus === 'EN_PROCESO' }
        : t
    ));
    try {
      await ProcessDataService.updateProcessStatus(testId, newStatus);
      showToast(`✓ Estado del proceso actualizado a "${newStatus}".`);
    } catch {
      showToast(`⚠️ No se pudo actualizar el estado en la base de datos.`);
    }
  };

  const handleDeleteProcess = async (testId: string) => {
    const proc = processes.find(t => t.id === testId);
    const ok = await ProcessDataService.deleteProcess(testId);
    if (ok) {
      setProcesses(prev => prev.filter(t => t.id !== testId));
      showToast(`✓ Proceso "${proc?.title}" eliminado correctamente.`);
    } else {
      showToast(`⚠️ No se pudo eliminar el proceso.`);
    }
  };

  const handleCreateProfile = async (newProfile: EvaluationTest) => {
    try {
      const saved = await ProcessDataService.createProfile(newProfile);
      if (saved) {
        // Recargar la lista fresca directamente de Supabase
        const freshProfiles = await ProcessDataService.getProfiles();
        if (freshProfiles && freshProfiles.length > 0) {
          setProfiles(freshProfiles);
        } else {
          setProfiles(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
        }
        setShowCreateProfileModal(false);
        showToast(`✓ Nuevo perfil "${saved.title}" guardado en la base de datos.`);
      } else {
        showToast(`⚠️ No se pudo guardar el perfil en la base de datos.`);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error al crear perfil:', err);
      showToast(`⚠️ Error al guardar el perfil en la base de datos.`);
    }
  };

  const handleLaunchProcess = async (newProcess: EvaluationTest, newCandidates: Candidate[]) => {
    try {
      const saved = await ProcessDataService.createProcess(newProcess, createProcessPreselectedProfileId || undefined);
      const processToUse = saved || newProcess;
      setProcesses(prev => [processToUse, ...prev.filter(t => t.id !== processToUse.id)]);
      setActiveTestId(processToUse.id);
      if (newCandidates.length > 0) {
        const candidatesWithProcId = newCandidates.map(c => ({
          ...c,
          testId: processToUse.id
        }));
        onAddCandidates(candidatesWithProcId);
      }
      setActiveTab('PROCESOS');
      setFilterByActiveProcess(true);
      showToast(`🚀 Proceso "${processToUse.title}" guardado en base de datos y lanzado con éxito (${newCandidates.length} candidatos convocados).`);
    } catch (err) {
      console.error('[AdminDashboard] Error al lanzar proceso:', err);
      // Respaldo de seguridad en estado local
      setProcesses(prev => [newProcess, ...prev.filter(t => t.id !== newProcess.id)]);
      setActiveTestId(newProcess.id);
      setActiveTab('PROCESOS');
      showToast(`🚀 Proceso "${newProcess.title}" disponible.`);
    }
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-zinc-700 dark:border-zinc-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* ========================================================================= */}
      {/* VISTAS SEGÚN LA PESTAÑA ACTIVA                                            */}
      {/* ========================================================================= */}

      {/* 1. ANALÍTICA: DASHBOARDS Y TABLAS DEL RESUMEN GENERAL DEL REPORTE */}
      {activeTab === 'ANALITICA' && (
        <AnalyticsView
          candidates={candidates}
          tests={processes}
          onOpenReport={(cand) => setReportCandidate(cand)}
          onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          onViewProcess={(test) => {
            handleOpenProcessDetail(test);
            setFilterByActiveProcess(true);
            setActiveTab('PROCESOS');
            showToast(`→ Abriendo proceso: ${test.title}`);
          }}
        />
      )}

      {/* 2. PERFILES: LISTADO DE PERFILES DE PUESTO Y DESCRIPCIÓN DE CARGO */}
      {activeTab === 'PERFILES' && (
        <ProfilesManagerView
          tests={profiles}
          candidates={candidates}
          onToggleActive={handleToggleActive}
          onCreateNewProfile={() => setShowCreateProfileModal(true)}
          onLaunchProcessForProfile={(profileId) => {
            setCreateProcessPreselectedProfileId(profileId);
            setShowCreateProcessModal(true);
          }}
          onSelectTest={(testId) => {
            setActiveTestId(testId);
            setFilterByActiveProcess(true);
            setActiveTab('PROCESOS');
            showToast(`✓ Convocatoria activa: ${processes.find(t => t.id === testId)?.title || profiles.find(t => t.id === testId)?.title}`);
          }}
        />
      )}

      {/* 3. PROCESOS: VISTA DE CONTROL DE PROCESO (EVALUAR V4.1.2) O FICHA DE CANDIDATO O LISTADO DE PROCESOS */}
      {activeTab === 'PROCESOS' && (
        selectedCandidate ? (
          <CandidateFullReportView
            candidate={selectedCandidate}
            process={selectedProcessForControl || processes.find(p => p.id === selectedCandidate.testId) || processes[0]}
            allProcesses={processes}
            onBack={() => setSelectedCandidate(null)}
            onHireCandidate={handlePromoteCandidate}
            onNavigateToTab={(tab) => {
              setSelectedCandidate(null);
              setControlInitialTab(tab);
            }}
            onMoveToNoDeseados={(candidateId) => {
              const cand = candidates.find(c => c.id === candidateId);
              if (cand) {
                const updated: Candidate = { ...cand, status: 'DISQUALIFIED' };
                onUpdateCandidate(updated);
              }
            }}
            onInviteToProcess={(candidateId, targetProcessId) => {
              const targetProc = processes.find(p => p.id === targetProcessId);
              const cand = candidates.find(c => c.id === candidateId);
              showToast(`✓ Invitación despachada a ${cand?.fullName || 'candidato'} para el proceso "${targetProc?.title || targetProcessId}"`);
            }}
          />
        ) : selectedProcessForControl ? (
          <ProcessDetailControlView
            process={selectedProcessForControl}
            candidates={candidates}
            initialTab={controlInitialTab}
            onBack={handleBackFromProcessDetail}
            onViewCandidateDetail={(cand) => setSelectedCandidate(cand)}
            onOpenInviteModal={() => {
              setInviteTargetTestId(selectedProcessForControl.id);
              setShowInviteModal(true);
            }}
            onSwitchToCandidateExam={onSwitchToCandidateView}
            onUpdateCandidate={onUpdateCandidate}
          />
        ) : (
          <EvaluarProcessListView
            tests={processes}
            candidates={candidates}
            activeTestId={activeTestId}
            activeModuleFilter={activeModuleFilter}
            onSelectModuleFilter={setActiveModuleFilter}
            onSelectActiveTest={(testId) => {
              setActiveTestId(testId);
              setFilterByActiveProcess(true);
              showToast(`✓ Convocatoria activa: ${processes.find(t => t.id === testId)?.title}`);
            }}
            onOpenProcessDetail={handleOpenProcessDetail}
            onOpenInviteForTest={(testId) => {
              setInviteTargetTestId(testId);
              setShowInviteModal(true);
            }}
            onCreateNewProcess={() => {
              setCreateProcessPreselectedProfileId(null);
              setShowCreateProcessModal(true);
            }}
            onViewReportsForTest={(testId) => {
              setActiveTestId(testId);
              setFilterByActiveProcess(true);
              setActiveTab('ANALITICA');
            }}
            onCreateTest={handleCreateTest}
            onUpdateProcessStatus={handleUpdateProcessStatus}
            onDeleteProcess={handleDeleteProcess}
            onViewCandidateDetail={(cand) => setSelectedCandidate(cand)}
            onSwitchToCandidateExam={onSwitchToCandidateView}
            onViewAssignedCandidates={() => setActiveTab('POSTULANTES')}
          />
        )
      )}

      {/* 4. POSTULANTES ASIGNADOS (Gestión de postulantes convocados, estados y derechos ARCO) */}
      {activeTab === 'POSTULANTES' && (
        <AssignedCandidatesView
          tests={processes}
          onBackToProcesses={() => setActiveTab('PROCESOS')}
        />
      )}

      {/* 5. VIRALIZACIÓN & DIFUSIÓN (Convocatorias con viralización y filtrado - Evaluar v4.1.2) */}
      {activeTab === 'VIRALIZACION' && (
        <EvaluarProcessListView
          tests={processes}
          candidates={candidates}
          activeTestId={activeTestId}
          activeModuleFilter="VIRALIZACION"
          onSelectModuleFilter={setActiveModuleFilter}
          onSelectActiveTest={setActiveTestId}
          onOpenProcessDetail={handleOpenProcessDetail}
          onOpenInviteForTest={(testId) => {
            setInviteTargetTestId(testId);
            setShowInviteModal(true);
          }}
          onCreateNewProcess={() => {
            setCreateProcessPreselectedProfileId(null);
            setShowCreateProcessModal(true);
          }}
          onViewCandidateDetail={(cand) => setSelectedCandidate(cand)}
          onSwitchToCandidateExam={onSwitchToCandidateView}
          onViewAssignedCandidates={() => setActiveTab('POSTULANTES')}
        />
      )}

      {/* 6. TRUST & ANTIFRAUDE (Filtro Trust - Evaluar v4.1.2) */}
      {activeTab === 'TRUST' && (
        <EvaluarProcessListView
          tests={processes}
          candidates={candidates}
          activeTestId={activeTestId}
          activeModuleFilter="TRUST"
          onSelectModuleFilter={setActiveModuleFilter}
          onSelectActiveTest={setActiveTestId}
          onOpenProcessDetail={handleOpenProcessDetail}
          onOpenInviteForTest={(testId) => {
            setInviteTargetTestId(testId);
            setShowInviteModal(true);
          }}
          onCreateNewProcess={() => {
            setCreateProcessPreselectedProfileId(null);
            setShowCreateProcessModal(true);
          }}
          onViewCandidateDetail={(cand) => setSelectedCandidate(cand)}
          onSwitchToCandidateExam={onSwitchToCandidateView}
          onViewAssignedCandidates={() => setActiveTab('POSTULANTES')}
        />
      )}

      {/* 7. SEGURIDAD & AUDITORÍA (Filtro SAFER - Evaluar v4.1.2) */}
      {activeTab === 'SEGURIDAD' && (
        <EvaluarProcessListView
          tests={processes}
          candidates={candidates}
          activeTestId={activeTestId}
          activeModuleFilter="SEGURIDAD"
          onSelectModuleFilter={setActiveModuleFilter}
          onSelectActiveTest={setActiveTestId}
          onOpenProcessDetail={handleOpenProcessDetail}
          onOpenInviteForTest={(testId) => {
            setInviteTargetTestId(testId);
            setShowInviteModal(true);
          }}
          onCreateNewProcess={() => {
            setCreateProcessPreselectedProfileId(null);
            setShowCreateProcessModal(true);
          }}
          onViewCandidateDetail={(cand) => setSelectedCandidate(cand)}
          onSwitchToCandidateExam={onSwitchToCandidateView}
          onViewAssignedCandidates={() => setActiveTab('POSTULANTES')}
        />
      )}

      {/* 5. TALENT POOL (Gestión de Evaluaciones y Candidatos) */}
      {activeTab === 'TALENT_POOL' && (
        <TalentPoolView
          candidates={candidates}
          onTabChange={setActiveTab}
          onOpenSimulator={() => onSwitchToCandidateView()}
          onCreateProcess={() => {
            setCreateProcessPreselectedProfileId(null);
            setShowCreateProcessModal(true);
          }}
        />
      )}

      {/* 5. DESARROLLO / POTENCIAL (Renders Analytics Overview) */}
      {(activeTab === 'DESARROLLO' || activeTab === 'POTENCIAL') && (
        <AnalyticsView
          candidates={candidates}
          tests={processes}
          onOpenReport={(cand) => setReportCandidate(cand)}
          onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          onViewProcess={(test) => {
            setActiveTestId(test.id);
            setFilterByActiveProcess(true);
            setActiveTab('PROCESOS');
          }}
        />
      )}

      {/* 8. INFORMES CONSOLIDADOS & EXCEL (GEA Selección) */}
      {activeTab === 'INFORMES' && (
        <InformesView
          candidates={candidates}
          tests={processes}
          onOpenReport={(cand) => setReportCandidate(cand)}
        />
      )}

      {/* 9. BANDEJA DE CONTRATADOS */}
      {activeTab === 'CONTRATADOS' && (
        <ContratadosView
          candidates={candidates}
          tests={processes}
          onOpenCandidateDetail={(cand) => setSelectedCandidate(cand)}
        />
      )}

      {/* 10. LISTA NO DESEADOS & PREVENCIÓN DE FRAUDE */}
      {activeTab === 'NO_DESEADOS' && (
        <NoDeseadosView />
      )}

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}

      {/* Candidate Detail Modal for other tabs */}
      {selectedCandidate && activeTab !== 'PROCESOS' && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onPromoteToFinalist={handlePromoteCandidate}
          onResendInvitation={handleResendInvitation}
        />
      )}

      {/* Printable Candidate Executive Report Modal */}
      {reportCandidate && (
        <PrintableCandidateReport
          candidate={reportCandidate}
          onClose={() => setReportCandidate(null)}
        />
      )}

      {/* Invite Candidate Modal (Manual & Excel upload) */}
      {showInviteModal && (
        <InviteCandidateModal
          tests={processes}
          activeTestId={inviteTargetTestId || activeTestId}
          onClose={() => {
            setShowInviteModal(false);
            setInviteTargetTestId(null);
          }}
          onAddCandidates={(newCands) => {
            onAddCandidates(newCands);
            showToast(`✓ ${newCands.length} postulante(s) invitados con credenciales provisorias.`);
          }}
        />
      )}

      {/* Create New Profile Modal (Con espacio dedicado para descripción del puesto) */}
      {showCreateProfileModal && (
        <CreateProfileModal
          onClose={() => setShowCreateProfileModal(false)}
          onCreateProfile={handleCreateProfile}
        />
      )}

      {/* Launch / Create New Process Modal (Con selección de perfil, correo de candidatos y lanzamiento) */}
      {showCreateProcessModal && (
        <CreateProcessModal
          tests={profiles.length > 0 ? profiles : processes}
          preselectedProfileId={createProcessPreselectedProfileId || undefined}
          onClose={() => {
            setShowCreateProcessModal(false);
            setCreateProcessPreselectedProfileId(null);
            setActiveTab('PROCESOS');
          }}
          onLaunchProcess={handleLaunchProcess}
        />
      )}

    </div>
  );
};
