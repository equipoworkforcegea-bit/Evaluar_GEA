import React, { useState, useEffect } from 'react';
import { Candidate, EvaluationTest, AuthSession } from '../../types';
import { ExportReportModal } from './ExportReportModal';
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
import { CreateProfileView } from './CreateProfileView';
import { ProcessSummaryView } from './ProcessSummaryView';
import { AssignedCandidatesView } from './AssignedCandidatesView';
import { InformesView } from './InformesView';
import { ContratadosView } from './ContratadosView';
import { NoDeseadosView } from './NoDeseadosView';
import { AdminUsersManagementView } from './AdminUsersManagementView';
import { ProcessDataService } from '../../services/processDataService';
import { CandidateDataService } from '../../services/candidateDataService';
import { EmailInvitationService } from '../../services/emailInvitationService';
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
  | 'NO_DESEADOS'
  | 'USUARIOS';

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
  session?: AuthSession;
  resetProfilesTrigger?: number;
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
  onSelectModuleFilter: onSelectModuleFilterProp,
  session,
  resetProfilesTrigger
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [reportCandidate, setReportCandidate] = useState<Candidate | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState<boolean>(false);
  const [selectedEditingProfile, setSelectedEditingProfile] = useState<EvaluationTest | null>(null);
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

  // Sync prop changes, reset selected candidate, and close create-process modal when navigating via sidebar
  useEffect(() => {
    if (activeTabProp) {
      setInternalTab(activeTabProp);
      if (activeTabProp !== 'PROCESOS') {
        setSelectedCandidate(null);
      }
      // Close the "Lanzamiento de proceso" overlay whenever the user navigates to a different tab
      if (showCreateProcessModal) {
        setShowCreateProcessModal(false);
        setCreateProcessPreselectedProfileId(null);
      }
    }
  }, [activeTabProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset profile creation and return to main profiles list when clicking Perfiles in sidebar
  useEffect(() => {
    if (resetProfilesTrigger && resetProfilesTrigger > 0) {
      setShowCreateProfileModal(false);
      setSelectedEditingProfile(null);
    }
  }, [resetProfilesTrigger]);

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
  const [summaryProcess, setSummaryProcess] = useState<EvaluationTest | null>(null);
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
        scores: undefined,
        detailedReport: undefined
      });

      // Despachar correo de invitación por Gmail
      const codeToUse = cand.accessCode || `GEA-${cand.dni || cand.id.slice(0, 6)}`;
      const emailResult = await EmailInvitationService.sendInvitationEmail({
        to: cand.email,
        candidateName: cand.fullName,
        dni: cand.dni,
        processTitle: cand.position || 'Evaluación de Selección',
        accessCode: codeToUse,
        password: cand.password || 'Gea2026!'
      });

      if (emailResult.success) {
        showToast(`✉ Invitación enviada exitosamente al correo ${cand.email}.`);
      } else {
        showToast(`✉ Invitación actualizada en el sistema para ${cand.email}.`);
      }
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

  const handleCreateProfile = async (newProfile: EvaluationTest): Promise<EvaluationTest | null> => {
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
        showToast(`✓ Perfil "${saved.title}" guardado en la base de datos.`);
        return saved;
      } else {
        showToast(`⚠️ No se pudo guardar el perfil en la base de datos.`);
        return null;
      }
    } catch (err) {
      console.error('[AdminDashboard] Error al crear perfil:', err);
      showToast(`⚠️ Error al guardar el perfil en la base de datos.`);
      return null;
    }
  };

  const handleLaunchProcess = async (newProcess: EvaluationTest, newCandidates: Candidate[], explicitProfileId?: string) => {
    try {
      const resolvedProfileId = explicitProfileId || createProcessPreselectedProfileId || (newProcess as any).profileId || undefined;
      const saved = await ProcessDataService.createProcess(newProcess, resolvedProfileId);
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
      setShowCreateProcessModal(false);
      setCreateProcessPreselectedProfileId(null);
      setSummaryProcess(processToUse);
      setActiveTab('PROCESOS');
      setFilterByActiveProcess(true);
      showToast(`🚀 Proceso "${processToUse.title}" guardado en base de datos y lanzado con éxito (${newCandidates.length} candidatos convocados).`);
    } catch (err) {
      console.error('[AdminDashboard] Error al lanzar proceso:', err);
      // Respaldo de seguridad en estado local
      setProcesses(prev => [newProcess, ...prev.filter(t => t.id !== newProcess.id)]);
      setActiveTestId(newProcess.id);
      setShowCreateProcessModal(false);
      setCreateProcessPreselectedProfileId(null);
      setSummaryProcess(newProcess);
      setActiveTab('PROCESOS');
      showToast(`🚀 Proceso "${newProcess.title}" disponible.`);
    }
  };

  if (showCreateProcessModal) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FC] dark:bg-zinc-950">
        <CreateProcessModal
          tests={profiles.length > 0 ? profiles : processes}
          preselectedProfileId={createProcessPreselectedProfileId || undefined}
          session={session}
          onClose={() => {
            setShowCreateProcessModal(false);
            setCreateProcessPreselectedProfileId(null);
            setActiveTab('PROCESOS');
          }}
          onLaunchProcess={handleLaunchProcess}
        />
      </div>
    );
  }

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

      {/* 2. PERFILES: CREACIÓN DE PERFIL (VISTA SEGÚN IMÁGENES 3 Y 5) O LISTADO DE PERFILES */}
      {activeTab === 'PERFILES' && (
        showCreateProfileModal ? (
          <CreateProfileView
            initialProfile={selectedEditingProfile}
            initialStep={selectedEditingProfile ? 2 : 1}
            onBack={() => {
              setShowCreateProfileModal(false);
              setSelectedEditingProfile(null);
            }}
            onCreateProfile={handleCreateProfile}
            onLaunchProcess={(profileId) => {
              setShowCreateProfileModal(false);
              setSelectedEditingProfile(null);
              setCreateProcessPreselectedProfileId(profileId);
              setShowCreateProcessModal(true);
            }}
          />
        ) : (
          <ProfilesManagerView
            tests={profiles}
            candidates={candidates}
            onToggleActive={handleToggleActive}
            onCreateNewProfile={() => {
              setSelectedEditingProfile(null);
              setShowCreateProfileModal(true);
            }}
            onSelectProfile={(profile) => {
              setSelectedEditingProfile(profile);
              setShowCreateProfileModal(true);
            }}
            onLaunchProcessForProfile={(profileId) => {
              setCreateProcessPreselectedProfileId(profileId);
              setShowCreateProcessModal(true);
            }}
            onSelectTest={(testId) => {
              const prof = profiles.find(t => t.id === testId);
              if (prof) {
                setSelectedEditingProfile(prof);
                setShowCreateProfileModal(true);
              }
            }}
          />
        )
      )}

      {/* 3. PROCESOS: RESUMEN DE PROCESO RECIÉN LANZADO O VISTA DE CONTROL O FICHA DE CANDIDATO O LISTADO */}
      {activeTab === 'PROCESOS' && (
        summaryProcess ? (
          <ProcessSummaryView
            process={summaryProcess}
            onBack={() => setSummaryProcess(null)}
            onMonitorProcess={() => {
              handleOpenProcessDetail(summaryProcess);
              setSummaryProcess(null);
            }}
            onInviteCandidates={() => {
              setInviteTargetTestId(summaryProcess.id);
              setShowInviteModal(true);
            }}
            onCustomizeInvitation={() => {
              setInviteTargetTestId(summaryProcess.id);
              setShowInviteModal(true);
            }}
          />
        ) : selectedCandidate ? (
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
          onSelectCandidate={async (candidateId) => {
            // Buscar candidato en estado local primero
            let found = candidates.find(c => c.id === candidateId);
            if (!found) {
              // Si no está, buscarlo en Supabase
              try {
                const fetched = await CandidateDataService.findCandidateByIdentifier(candidateId);
                if (fetched) {
                  found = fetched;
                  onAddCandidates([fetched]);
                }
              } catch (err) {
                console.warn('[AdminDashboard] Error al cargar candidato:', err);
              }
            }
            if (found) {
              setSelectedCandidate(found);
              setActiveTab('PROCESOS');
            } else {
              showToast('⚠️ No se encontró el perfil completo del postulante.');
            }
          }}
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

      {/* 11. GESTIÓN Y ADMINISTRACIÓN DE USUARIOS (usuarios_admin) */}
      {activeTab === 'USUARIOS' && (
        <AdminUsersManagementView 
          session={session} 
          onBackToProcesses={() => setActiveTab('PROCESOS')} 
        />
      )}

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}



      {/* Modal oficial de exportación de reporte a PDF */}
      {reportCandidate && (
        <ExportReportModal
          candidate={reportCandidate}
          process={processes.find(p => p.id === reportCandidate.testId)}
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

    </div>
  );
};
