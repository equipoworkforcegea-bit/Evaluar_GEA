import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { EvaluationTest, Candidate } from '../../types';
import { 
  X, 
  Rocket, 
  User, 
  Briefcase, 
  Mail, 
  Calendar, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  FileText,
  Key,
  ShieldCheck,
  Phone,
  CreditCard,
  Send,
  HelpCircle,
  Copy,
  ArrowLeft,
  ArrowRight,
  Star,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Shield,
  HardHat,
  Users,
  CheckCircle,
  RotateCw
} from 'lucide-react';

import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { generateSafeUuid } from '../../services/processDataService';

interface CreateProcessModalProps {
  tests: EvaluationTest[];
  preselectedProfileId?: string;
  onClose: () => void;
  onLaunchProcess: (newProcess: EvaluationTest, newCandidates: Candidate[]) => void | Promise<void>;
}

interface StagedCandidate {
  id: string;
  fullName: string;
  nombre?: string;
  apellido?: string;
  usuario?: string;
  email: string;
  dni: string;
  phone: string;
  password: string;
}

export const CreateProcessModal: React.FC<CreateProcessModalProps> = ({
  tests,
  preselectedProfileId,
  onClose,
  onLaunchProcess
}) => {
  useBodyScrollLock();

  // 1. WIZARD STEP CONTROLLER: 1 = Producto, 2 = Perfiles, 3 = Lanzamiento
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(preselectedProfileId ? 3 : 1);

  // STEP 1: PRODUCT SELECTION
  const [selectedProduct, setSelectedProduct] = useState<'MODULO_EVALUACION' | 'TRUST' | 'SEGURIDAD'>(
    'MODULO_EVALUACION'
  );

  // STEP 2: PROFILE SELECTION
  const [selectedProfileId, setSelectedProfileId] = useState<string>(preselectedProfileId || tests[0]?.id || '');
  const [profileSearchTerm, setProfileSearchTerm] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  const selectedProfile = tests.find(t => t.id === selectedProfileId) || tests[0];

  // Helper date generators
  const getTodayFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year} ${month} ${day}`;
  };

  const getNowDateTimeString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const getEndDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // STEP 3: PROCESS METADATA
  const [processTitle, setProcessTitle] = useState<string>(
    selectedProfile ? `${selectedProfile.title.toUpperCase()} ${getTodayFormatted()}` : ''
  );
  const [startDateTime, setStartDateTime] = useState<string>(getNowDateTimeString());
  const [endDateTime, setEndDateTime] = useState<string>(getEndDateString());
  const [enableTrustTest, setEnableTrustTest] = useState<boolean>(true);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);

  // Advanced Config state
  const [durationMinutes, setDurationMinutes] = useState<number>(selectedProfile?.totalDurationMinutes || 45);
  const [launchedBy, setLaunchedBy] = useState<string>('Tania León (Selección)');

  // Staged Candidates (in advanced config or optional bulk invite)
  const [stagedCandidates, setStagedCandidates] = useState<StagedCandidate[]>([]);
  const [candEmail, setCandEmail] = useState('');
  const [candFullName, setCandFullName] = useState('');
  const [candDni, setCandDni] = useState('');
  const [candPhone, setCandPhone] = useState('+51 9');
  const [pastedEmails, setPastedEmails] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'MANUAL' | 'PASTE_EMAILS' | 'EXCEL'>('MANUAL');
  const [excelError, setExcelError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Confirmation Modal
  const [launchedSuccess, setLaunchedSuccess] = useState<{
    process: EvaluationTest;
    candidates: StagedCandidate[];
    isDraft?: boolean;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgress, setSubmitProgress] = useState<number>(20);

  // Filter available profiles for Step 2
  const filteredProfiles = useMemo(() => {
    return tests.filter(p => {
      if (onlyActive && p.isActive === false) return false;
      if (profileSearchTerm.trim()) {
        const q = profileSearchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.profileName && p.profileName.toLowerCase().includes(q)) ||
          (p.targetPosition && p.targetPosition.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tests, onlyActive, profileSearchTerm]);

  // When selecting a profile in Step 2:
  const handleSelectProfile = (profile: EvaluationTest) => {
    setSelectedProfileId(profile.id);
    setProcessTitle(`${profile.title.toUpperCase()} ${getTodayFormatted()}`);
    setDurationMinutes(profile.totalDurationMinutes || 45);
    setCurrentStep(3);
  };

  // Helper candidate addition
  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candEmail.trim() || !candEmail.includes('@')) {
      alert('Ingresa un correo electrónico válido');
      return;
    }
    const cleanDni = candDni.replace(/\D/g, '').slice(0, 8) || `${70000000 + stagedCandidates.length}`;
    const newCand: StagedCandidate = {
      id: `cand-${Date.now()}`,
      fullName: candFullName.trim() || candEmail.split('@')[0],
      email: candEmail.trim().toLowerCase(),
      dni: cleanDni,
      phone: candPhone.trim(),
      password: 'Gea2026!'
    };
    setStagedCandidates(prev => [...prev, newCand]);
    setCandEmail('');
    setCandFullName('');
    setCandDni('');
    setCandPhone('+51 9');
  };

  // Submit / Launch Process Action
  const handleSubmitProcess = async (isDraft: boolean = false) => {
    if (isSubmitting) return;

    if (!processTitle.trim()) {
      alert('Por favor ingresa un nombre para el proceso.');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(25);
    const progressTimer = setTimeout(() => {
      setSubmitProgress(75);
    }, 250);

    try {
      const uniqueProcessId = generateSafeUuid();
      const targetPos = selectedProfile?.targetPosition || selectedProfile?.title || 'Asesor Operativo';
      const code = `${selectedProfile?.code || 'PROC'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      const newTest: EvaluationTest = {
        id: uniqueProcessId,
        code,
        title: processTitle.trim(),
        targetPosition: targetPos,
        description: selectedProfile?.description || `Proceso de evaluación psicopedagógica y casos reales para ${targetPos}.`,
        instructions: 'Examen de evaluación psicométrica y situacional oficial de Evaluar GEA.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: !isDraft,
        totalDurationMinutes: durationMinutes,
        candidateCount: stagedCandidates.length,
        completedCount: 0,
        averageScore: 0,
        launchedBy,
        startDate: startDateTime.split('T')[0] || new Date().toLocaleDateString('es-PE'),
        endDate: endDateTime.split('T')[0] || '31/12/2026',
        processStatus: isDraft ? 'BORRADOR' : 'LANZADO',
        profileName: selectedProfile?.title || targetPos,
        hiredCount: 0,
        inProgressCount: 0,
        selectedCompetencies: selectedProfile?.selectedCompetencies || [
          'Orientación a Resultados & Eficiencia',
          'Autorregulación Emocional bajo Presión',
          'Toma de Decisiones en Contingencias'
        ],
        stages: selectedProfile?.stages || [
          {
            id: 'STAGE_1_PSYCHO',
            category: 'PSYCHOLOGICAL',
            name: 'Etapa 1: Prueba Psicopedagógica & Lógica',
            description: 'Evaluación psicométrica y razonamiento lógico-deductivo',
            durationMinutes: Math.round(durationMinutes * 0.33),
            questionCount: 8,
            weightPercent: 35,
            isEnabled: true
          },
          {
            id: 'STAGE_2_EMOTIONAL',
            category: 'EMOTIONAL',
            name: 'Etapa 2: Clima y Regulación Emocional',
            description: 'Inteligencia emocional, resiliencia y tolerancia bajo presión',
            durationMinutes: Math.round(durationMinutes * 0.33),
            questionCount: 8,
            weightPercent: 30,
            isEnabled: true
          },
          {
            id: 'STAGE_3_WORK_CASES',
            category: 'WORK_CASES',
            name: 'Etapa 3: Casos Laborales Simulados',
            description: 'Resolución de situaciones reales, criterio operativo y toma de decisiones',
            durationMinutes: Math.round(durationMinutes * 0.34),
            questionCount: 4,
            weightPercent: 35,
            isEnabled: true
          }
        ]
      };

      const newCandidates: Candidate[] = stagedCandidates.map((c) => ({
        id: generateSafeUuid(),
        fullName: c.fullName,
        email: c.email,
        password: c.password,
        phone: c.phone,
        dni: c.dni,
        position: targetPos,
        testId: uniqueProcessId,
        invitationCode: `GEA-${c.dni}`,
        invitedAt: new Date().toISOString(),
        status: 'INVITED',
        auditEventCount: 0,
        criticalFlags: 0,
        isConsentSigned: false
      }));

      await onLaunchProcess(newTest, newCandidates);
      clearTimeout(progressTimer);
      setSubmitProgress(100);

      if (isDraft) {
        setLaunchedSuccess({
          process: newTest,
          candidates: stagedCandidates,
          isDraft
        });
      } else {
        // Pausa breve para completar visualmente la barra y pasar a Resumen del proceso
        await new Promise(res => setTimeout(res, 600));
        onClose();
      }
    } catch (err: any) {
      clearTimeout(progressTimer);
      console.error('[CreateProcessModal] Error al procesar convocatoria:', err);
      alert('Ocurrió un problema al lanzar el proceso: ' + (err?.message || 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION MODAL
  if (launchedSuccess) {
    const isDraft = launchedSuccess.isDraft;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            isDraft
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isDraft ? <FileText className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>
          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDraft ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
            }`}>
              {isDraft ? 'Proceso Guardado en Borrador' : '¡Proceso Lanzado Exitosamente!'}
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {launchedSuccess.process.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              {isDraft
                ? 'El proceso quedó guardado en estado Borrador. Puedes activarlo o editarlo en cualquier momento desde la sección de Procesos.'
                : 'La convocatoria se encuentra activa y disponible en la plataforma Evaluar GEA.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-bold text-sm cursor-pointer transition-colors shadow-md"
            >
              Ir a Procesos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8F9FC] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col p-4 sm:p-8 animate-in fade-in">
      
      {/* Modal flotante de lanzamiento: 'Por favor espere...' (Evaluar v4.1.2) */}
      {isSubmitting && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#7C3AED] text-white px-7 py-5 rounded-2xl shadow-2xl flex flex-col gap-3 w-80 sm:w-96 animate-in zoom-in-95">
            <span className="text-sm font-semibold tracking-wide">Por favor espere...</span>
            <div className="w-full bg-white/25 h-2.5 rounded-full overflow-hidden p-0.5 relative">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${submitProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full space-y-6">

        {/* ========================================================================= */}
        {/* PASO 1: SELECCIONA TU PRODUCTO                                            */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cerrar y volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F5BA8] dark:text-[#5B8AE0] flex items-center gap-2">
                  <span>Selecciona tu producto</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Selecciona un producto para el lanzamiento de tu proceso
                </p>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Radio cards & Continuar button (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. Módulo de evaluación */}
                <div
                  onClick={() => setSelectedProduct('MODULO_EVALUACION')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedProduct === 'MODULO_EVALUACION'
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white dark:bg-zinc-900 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold text-xs shrink-0">
                      A+
                    </div>
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      Módulo de evaluación
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedProduct === 'MODULO_EVALUACION'
                      ? 'border-[#7C3AED] bg-white dark:bg-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}>
                    {selectedProduct === 'MODULO_EVALUACION' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                    )}
                  </div>
                </div>

                {/* 2. Trust */}
                <div
                  onClick={() => setSelectedProduct('TRUST')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedProduct === 'TRUST'
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white dark:bg-zinc-900 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                          Trust
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                        <span>Demo disponible</span>
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedProduct === 'TRUST'
                      ? 'border-[#7C3AED] bg-white dark:bg-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}>
                    {selectedProduct === 'TRUST' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                    )}
                  </div>
                </div>

                {/* 3. Seguridad Laboral */}
                <div
                  onClick={() => setSelectedProduct('SEGURIDAD')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedProduct === 'SEGURIDAD'
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white dark:bg-zinc-900 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center shrink-0">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                          Seguridad Laboral
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                        <span>Demo disponible</span>
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedProduct === 'SEGURIDAD'
                      ? 'border-[#7C3AED] bg-white dark:bg-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}>
                    {selectedProduct === 'SEGURIDAD' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                    )}
                  </div>
                </div>

                {/* Continuar button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-99"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Right Column: ¿Qué incluye? Card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-zinc-800 dark:text-zinc-100">
                  ¿Qué incluye?
                </h3>
                
                <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Procesos:</strong> Pequeños, referidos, internos o ya filtrados.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">JobBoard:</strong> No incluye.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Send className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Publicación en E-talent jobs:</strong> No incluye.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Invitación a Candidatos:</strong> Manual o mediante base previamente filtrada.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Layers className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Filtrado Automático:</strong> No incluye. Todos los candidatos miden todos los componentes configurados.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Duración del proceso:</strong> Máximo 90 días.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">Cobro:</strong> Por persona evaluada.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: LISTADO DE PERFILES DISPONIBLES                                    */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Volver al Paso 1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F5BA8] dark:text-[#5B8AE0] flex items-center gap-2">
                  <User className="w-6 h-6" />
                  <span>Listado de perfiles disponibles</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Aquí puedes verificar perfiles existentes, crearlos, editarlos y utilizarlos para lanzar procesos.
                </p>
              </div>
            </div>

            {/* Filter Row: Favoritos, Activo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyFavorites(prev => !prev)}
                className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  onlyFavorites
                    ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-zinc-300'
                }`}
                title="Filtrar por favoritos"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setOnlyActive(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  onlyActive
                    ? 'border-[#2F5BA8] bg-[#2F5BA8]/10 text-[#2F5BA8] dark:text-[#5B8AE0]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Activo</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={profileSearchTerm}
                  onChange={(e) => setProfileSearchTerm(e.target.value)}
                  placeholder="Busca tus perfiles"
                  className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-2xs focus:ring-1 focus:ring-[#7C3AED] outline-none"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                className="p-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 cursor-pointer shadow-2xs"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Profiles Cards List */}
            <div className="space-y-3">
              {filteredProfiles.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  No se encontraron perfiles que coincidan con la búsqueda.
                </div>
              ) : (
                filteredProfiles.map((prof) => {
                  return (
                    <div
                      key={prof.id}
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                    >
                      {/* Left side: Profile Info */}
                      <div className="space-y-1.5 max-w-2xl">
                        
                        {/* Estado: Completo | Modificado */}
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completo | Modificado: {prof.startDate || '28/09/26 - 16:46'}</span>
                        </div>

                        {/* Title & Star */}
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-[#2F5BA8] dark:text-[#5B8AE0] tracking-tight">
                            {prof.title.toUpperCase()}
                          </h3>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {prof.description || 'Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.'}
                        </p>

                        {/* Badges */}
                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Activo</span>
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 font-semibold">
                            Nivel Medio
                          </span>

                          {/* Color competencies wheel icon */}
                          <div className="w-3.5 h-3.5 rounded-full bg-conic from-rose-500 via-amber-400 via-emerald-500 to-blue-500 shrink-0" title="Competencias configuradas" />
                        </div>
                      </div>

                      {/* Right side: Seleccionar Button */}
                      <div className="shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleSelectProfile(prof)}
                          className="px-5 py-2.5 rounded-xl border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 dark:hover:bg-[#7C3AED]/20 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-2xs active:scale-98"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Seleccionar</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: LANZAMIENTO DE PROCESO                                            */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Volver a seleccionar perfil"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F5BA8] dark:text-[#5B8AE0] flex items-center gap-2">
                  <span>Lanzamiento de proceso</span>
                  <span className="w-6 h-6 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold text-[11px]">
                    A+
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Configura los detalles de la vacante que pretendes cubrir, es fácil y rápido
                </p>
              </div>
            </div>

            {/* Main Config Card: Configuración del proceso */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-5">
              
              <div className="flex items-center gap-2 text-[#2F5BA8] dark:text-[#5B8AE0] font-bold text-sm sm:text-base">
                <User className="w-4 h-4" />
                <span>Configuración del proceso</span>
              </div>

              {/* 3 Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Nombre del proceso */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Nombre del proceso *
                  </label>
                  <input
                    type="text"
                    value={processTitle}
                    onChange={(e) => setProcessTitle(e.target.value)}
                    placeholder="Ej. POSTPAGO CHILE PRUEBA 2026 10 12"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-[#7C3AED] outline-none"
                    required
                  />
                </div>

                {/* 2. Fecha y hora de inicio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Fecha y hora de inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>

                {/* 3. Fecha y hora de fin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Fecha y hora de fin
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-[#7C3AED] outline-none"
                  />
                </div>

              </div>

              {/* Toggle switch: Activar evaluación de prueba Trust */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEnableTrustTest(prev => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    enableTrustTest ? 'bg-[#7C3AED]' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      enableTrustTest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-500" />
                  <span>Activar evaluación de prueba Trust</span>
                </span>
              </div>

            </div>

            {/* Collapsible: Configuración avanzada ∨ */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowAdvancedConfig(prev => !prev)}
                className="w-full p-5 text-left font-bold text-xs sm:text-sm text-[#2F5BA8] dark:text-[#5B8AE0] flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Configuración avanzada</span>
                </div>
                {showAdvancedConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedConfig && (
                <div className="p-6 pt-0 space-y-6 border-t border-zinc-100 dark:border-zinc-800 text-xs animate-in fade-in">
                  
                  {/* Reclutador y Duración */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-600 dark:text-zinc-300">
                        Líder / Reclutador a cargo:
                      </label>
                      <input
                        type="text"
                        value={launchedBy}
                        onChange={(e) => setLaunchedBy(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-600 dark:text-zinc-300">
                        Duración total (minutos):
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Pre-registro opcional de postulantes */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Pre-registro de candidatos para esta convocatoria (Opcional):</span>
                      </span>
                      <span className="text-zinc-400 font-medium">{stagedCandidates.length} cargado(s)</span>
                    </div>

                    {/* Formulario rápido para agregar postulante */}
                    <form onSubmit={handleAddCandidate} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={candFullName}
                        onChange={(e) => setCandFullName(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="DNI (8 dígitos)"
                        value={candDni}
                        onChange={(e) => setCandDni(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Correo electrónico *"
                        value={candEmail}
                        onChange={(e) => setCandEmail(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#2F5BA8] hover:bg-[#1F2A5E] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </form>

                    {/* Staged candidates list preview */}
                    {stagedCandidates.length > 0 && (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {stagedCandidates.map((c, idx) => (
                          <div key={c.id || idx} className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{c.fullName}</span>
                            <span className="text-zinc-500 font-mono text-[11px] truncate">{c.dni} • {c.email}</span>
                            <button
                              type="button"
                              onClick={() => setStagedCandidates(prev => prev.filter(cand => cand.id !== c.id))}
                              className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>

            {/* Bottom Actions Row: Guardar como borrador & Lanzar Proceso */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitProcess(true)}
                className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:underline cursor-pointer px-3 py-2 disabled:opacity-50"
              >
                Guardar como borrador
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitProcess(false)}
                className="px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Lanzando proceso...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Lanzar Proceso</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
