import React, { useState, useEffect, useMemo } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation, 
  useParams
} from 'react-router-dom';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/auth/LoginScreen';
import { ExamContainer } from './components/candidate/ExamContainer';
import { AdminDashboard, MainAdminTab } from './components/admin/AdminDashboard';
import { ArchitectureViewer } from './components/architecture/ArchitectureViewer';
import { ProcesosInvitadosView } from './components/candidate/ProcesosInvitadosView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CandidateDataService } from './services/candidateDataService';
import { AuthStorage } from './services/authStorage';
import { Candidate, AuthSession } from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Mapeo seguro y bidireccional de Pestañas Administrativas a URLs amigables
const TAB_TO_PATH: Record<MainAdminTab, string> = {
  PROCESOS: 'procesos',
  ANALITICA: 'analitica',
  PERFILES: 'perfiles',
  TALENT_POOL: 'talent-pool',
  DESARROLLO: 'desarrollo',
  POTENCIAL: 'potencial',
  POSTULANTES: 'postulantes'
};

const PATH_TO_TAB: Record<string, MainAdminTab> = {
  'procesos': 'PROCESOS',
  'analitica': 'ANALITICA',
  'perfiles': 'PERFILES',
  'talent-pool': 'TALENT_POOL',
  'desarrollo': 'DESARROLLO',
  'potencial': 'POTENCIAL',
  'postulantes': 'POSTULANTES'
};

interface AdminViewProps {
  session: AuthSession;
  candidates: Candidate[];
  selectedCandidateId: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectCandidate: (id: string) => void;
  onLogout: () => void;
  onUpdateCandidate: (c: Candidate) => void;
  onAddCandidates: (c: Candidate[]) => Promise<void>;
  onSwitchToCandidateView: (id?: string) => void;
}

// Componente de Vista Administrativa por Pestaña (Extraído como componente independiente)
function AdminView({
  session,
  candidates,
  selectedCandidateId,
  isDarkMode,
  onToggleDarkMode,
  onSelectCandidate,
  onLogout,
  onUpdateCandidate,
  onAddCandidates,
  onSwitchToCandidateView
}: AdminViewProps) {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Obtener pestaña activa a partir de la URL
  const activeTab: MainAdminTab = (tab && PATH_TO_TAB[tab.toLowerCase()]) || 'PROCESOS';

  const handleTabChange = (newTab: MainAdminTab) => {
    const pathSuffix = TAB_TO_PATH[newTab] || 'procesos';
    navigate(`/admin/${pathSuffix}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#1F2A5E] selection:text-white transition-colors">
      <Header
        authSession={session}
        currentView="ADMIN"
        onViewChange={(view) => {
          if (view === 'CANDIDATE') navigate('/examen');
          else if (view === 'ARCHITECTURE') navigate('/arquitectura');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
        onSelectCandidate={onSelectCandidate}
        onLogout={onLogout}
        activeAdminTab={activeTab}
        onSelectAdminTab={(tabName) => handleTabChange(tabName as MainAdminTab)}
      />

      <main className="focus:outline-hidden">
        <AdminDashboard
          candidates={candidates}
          onUpdateCandidate={onUpdateCandidate}
          onAddCandidates={onAddCandidates}
          onSwitchToCandidateView={onSwitchToCandidateView}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </main>
    </div>
  );
}

// Componente estable de Examen de Postulante
interface CandidateExamViewProps {
  session: AuthSession;
  candidates: Candidate[];
  candidate: Candidate;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateCandidate: (c: Candidate) => void;
  onLogout: () => void;
}

function CandidateExamView({
  session,
  candidates,
  candidate,
  isDarkMode,
  onToggleDarkMode,
  onUpdateCandidate,
  onLogout
}: CandidateExamViewProps) {
  const navigate = useNavigate();
  const isCandidate = session?.role === 'CANDIDATE';

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#1F2A5E] selection:text-white transition-colors">
      <Header
        authSession={session}
        currentView="CANDIDATE"
        onViewChange={() => {
          if (!isCandidate) navigate('/admin/procesos');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        candidates={candidates}
        selectedCandidateId={candidate.id}
        onSelectCandidate={() => {}}
        onLogout={onLogout}
      />

      <main className="focus:outline-hidden">
        <ExamContainer
          key={candidate.id}
          candidate={candidate}
          isCandidate={isCandidate}
          onLogout={onLogout}
          onViewProcesses={isCandidate ? () => navigate('/procesos-invitados') : undefined}
          onCandidateUpdated={onUpdateCandidate}
          onSwitchToAdmin={() => {
            if (isCandidate) {
              onLogout();
            } else {
              navigate('/admin/procesos');
            }
          }}
        />
      </main>
    </div>
  );
}

// Componente estable de Procesos Invitados
interface ProcesosInvitadosViewWrapperProps {
  session: AuthSession;
  candidates: Candidate[];
  candidate: Candidate;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

function ProcesosInvitadosViewWrapper({
  session,
  candidates,
  candidate,
  isDarkMode,
  onToggleDarkMode,
  onLogout
}: ProcesosInvitadosViewWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#1F2A5E] selection:text-white transition-colors">
      <Header
        authSession={session}
        currentView="CANDIDATE"
        onViewChange={() => {}}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        candidates={candidates}
        selectedCandidateId={candidate.id}
        onSelectCandidate={() => {}}
        onLogout={onLogout}
      />

      <main className="focus:outline-hidden">
        <ProcesosInvitadosView
          candidate={candidate}
          onStartExam={(_testId) => {
            navigate('/examen');
          }}
        />
      </main>
    </div>
  );
}

// Componente estable de Arquitectura Técnica
interface ArchitectureViewWrapperProps {
  session: AuthSession;
  candidates: Candidate[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

function ArchitectureViewWrapper({
  session,
  candidates,
  isDarkMode,
  onToggleDarkMode,
  onLogout
}: ArchitectureViewWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#1F2A5E] selection:text-white transition-colors">
      <Header
        authSession={session}
        currentView="ARCHITECTURE"
        onViewChange={(view) => {
          if (view === 'ADMIN') navigate('/admin/procesos');
          else if (view === 'CANDIDATE') navigate('/examen');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        candidates={candidates}
        selectedCandidateId=""
        onSelectCandidate={() => {}}
        onLogout={onLogout}
      />

      <main className="focus:outline-hidden">
        <ArchitectureViewer />
      </main>
    </div>
  );
}

export default function App() {
  // Inicialización de sesión desde almacenamiento de sesión seguro (anti-tampering)
  const [session, setSession] = useState<AuthSession | null>(() => AuthStorage.getSession());
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Cargar candidatos en tiempo real desde Supabase
  useEffect(() => {
    async function loadFromDb() {
      try {
        const dbCandidates = await CandidateDataService.getCandidates();
        if (dbCandidates && dbCandidates.length > 0) {
          setCandidates(dbCandidates);
          if (!selectedCandidateId && dbCandidates[0]) {
            setSelectedCandidateId(dbCandidates[0].id);
          }
        }
      } catch (err) {
        console.warn('[App] Error al conectar con Supabase:', err);
      }
    }
    loadFromDb();
  }, []);

  // 2. Control de modo oscuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 3. Manejo de Inicio de Sesión exitoso con redirección limpia (replace)
  const handleLoginSuccess = async (newSession: AuthSession) => {
    AuthStorage.saveSession(newSession);
    setSession(newSession);

    if (newSession.role === 'CANDIDATE') {
      if (newSession.candidateId) {
        setSelectedCandidateId(newSession.candidateId);
      }
      const searchTarget = newSession.candidateId || newSession.dni || newSession.email;
      const existing = candidates.find(c => 
        (newSession.candidateId && c.id === newSession.candidateId) ||
        (newSession.dni && c.dni === newSession.dni) ||
        (newSession.email && c.email.toLowerCase() === newSession.email.toLowerCase())
      );
      if (!existing && searchTarget) {
        const fresh = await CandidateDataService.findCandidateByIdentifier(searchTarget);
        if (fresh) {
          setCandidates(prev => [fresh, ...prev.filter(c => c.id !== fresh.id)]);
        }
      }
      navigate('/procesos-invitados', { replace: true });
    } else {
      const destination = location.state?.from?.pathname || '/admin/procesos';
      navigate(destination, { replace: true });
    }
  };

  // 4. Manejo de Cierre de Sesión seguro
  const handleLogout = () => {
    AuthStorage.clearSession();
    setSession(null);
    navigate('/login', { replace: true });
  };

  // Candidato activo para la prueba
  const currentCandidate = useMemo(() => {
    if (session?.role === 'CANDIDATE') {
      const match = candidates.find(c => 
        (session.candidateId && c.id === session.candidateId) ||
        (session.dni && c.dni === session.dni) ||
        (session.email && c.email && c.email.toLowerCase() === session.email.toLowerCase()) ||
        (session.fullName && c.fullName && c.fullName.toLowerCase() === session.fullName.toLowerCase())
      );
      if (match) {
        return {
          ...match,
          fullName: session.fullName || match.fullName,
          dni: session.dni || match.dni,
          email: session.email || match.email
        };
      }
      // NUNCA hacer fallback a candidates[0] para una sesión de tipo CANDIDATE
      return null;
    }
    return candidates.find(c => c.id === selectedCandidateId) || candidates[0] || null;
  }, [session, candidates, selectedCandidateId]);

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
    CandidateDataService.updateCandidate(updated);
  };

  const handleAddCandidates = async (newCandidates: Candidate[]) => {
    try {
      const saved = await CandidateDataService.createCandidatesBatch(newCandidates);
      if (saved && saved.length > 0) {
        setCandidates(prev => [...saved, ...prev.filter(p => !saved.some(s => s.id === p.id || s.dni === p.dni))]);
      } else {
        setCandidates(prev => [...newCandidates, ...prev]);
      }
    } catch {
      setCandidates(prev => [...newCandidates, ...prev]);
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleSwitchToCandidateView = async (candidateId?: string) => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
      const existing = candidates.find(c => c.id === candidateId);
      if (!existing) {
        const fresh = await CandidateDataService.findCandidateByIdentifier(candidateId);
        if (fresh) {
          setCandidates(prev => [fresh, ...prev.filter(c => c.id !== fresh.id)]);
        }
      }
    }
    navigate('/examen');
  };

  const candidateForRoute: Candidate = currentCandidate ? {
    ...currentCandidate,
    fullName: (session?.role === 'CANDIDATE' && session?.fullName) ? session.fullName : currentCandidate.fullName,
    dni: (session?.role === 'CANDIDATE' && session?.dni) ? session.dni : currentCandidate.dni,
    email: (session?.role === 'CANDIDATE' && session?.email) ? session.email : currentCandidate.email
  } : {
    id: session?.candidateId || session?.userId || 'cand-fallback',
    fullName: session?.fullName || 'Postulante en Evaluación',
    email: session?.email || '',
    dni: session?.dni || '',
    phone: '',
    position: session?.position || 'Postulante en Evaluación',
    invitationCode: `GEA-${session?.dni || session?.userId.slice(-6) || '2026'}`,
    invitedAt: new Date().toISOString(),
    status: 'IN_PROGRESS',
    currentStage: 'STAGE_1_PSYCHO',
    totalDurationSeconds: 0,
    scores: { overall: 0, stage1Psycho: 0, stage2Emotional: 0, stage3WorkCases: 0, percentile: 0 },
    auditEventCount: 0,
    criticalFlags: 0,
    isConsentSigned: false
  };

  return (
    <ErrorBoundary>
      <Routes>
      {/* 1. Ruta de Inicio de Sesión (/login) */}
      <Route
        path="/login"
        element={
          session ? (
            <Navigate 
              to={session.role === 'CANDIDATE' ? '/procesos-invitados' : '/admin/procesos'} 
              replace 
            />
          ) : (
            <LoginScreen
              candidates={candidates}
              onLoginSuccess={handleLoginSuccess}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )
        }
      />

      {/* 2. Redirección base de /admin hacia /admin/procesos */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute session={session} allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <Navigate to="/admin/procesos" replace />
          </ProtectedRoute>
        } 
      />

      {/* 3. Apartados Administrativos con URLs independientes (/admin/:tab) */}
      <Route
        path="/admin/:tab"
        element={
          <ProtectedRoute session={session} allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <AdminView
              session={session!}
              candidates={candidates}
              selectedCandidateId={selectedCandidateId}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onSelectCandidate={handleSelectCandidate}
              onLogout={handleLogout}
              onUpdateCandidate={handleUpdateCandidate}
              onAddCandidates={handleAddCandidates}
              onSwitchToCandidateView={handleSwitchToCandidateView}
            />
          </ProtectedRoute>
        }
      />

      {/* 4. Ruta Oficial de Procesos Invitados (/procesos-invitados) */}
      <Route
        path="/procesos-invitados"
        element={
          <ProtectedRoute session={session} allowedRoles={['CANDIDATE', 'SUPER_ADMIN', 'ADMIN']}>
            <ProcesosInvitadosViewWrapper
              session={session!}
              candidates={candidates}
              candidate={candidateForRoute}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* 5. Ruta Oficial de Examen (/examen) */}
      <Route
        path="/examen"
        element={
          <ProtectedRoute session={session} allowedRoles={['CANDIDATE', 'SUPER_ADMIN', 'ADMIN']}>
            <CandidateExamView
              session={session!}
              candidates={candidates}
              candidate={candidateForRoute}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onUpdateCandidate={handleUpdateCandidate}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* 6. Ruta Técnica de Arquitectura (/arquitectura) */}
      <Route
        path="/arquitectura"
        element={
          <ProtectedRoute session={session} allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <ArchitectureViewWrapper
              session={session!}
              candidates={candidates}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* 7. Redirección Inteligente de la Raíz (/) */}
      <Route
        path="/"
        element={
          session ? (
            <Navigate 
              to={session.role === 'CANDIDATE' ? '/procesos-invitados' : '/admin/procesos'} 
              replace 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 7. Comodín de Seguridad para URLs No Reconocidas (*) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
