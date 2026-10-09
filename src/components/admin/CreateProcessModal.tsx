import React, { useState, useRef } from 'react';
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
  Copy
} from 'lucide-react';

import { InvitationService } from '../../services/invitationService';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface CreateProcessModalProps {
  tests: EvaluationTest[];
  preselectedProfileId?: string;
  onClose: () => void;
  onLaunchProcess: (newProcess: EvaluationTest, newCandidates: Candidate[]) => void;
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

  // Step 1: Profile Selection
  const defaultProfileId = preselectedProfileId || tests[0]?.id || '';
  const [selectedProfileId, setSelectedProfileId] = useState<string>(defaultProfileId);

  const selectedProfile = tests.find(t => t.id === selectedProfileId) || tests[0];

  // Step 2: Process Metadata
  const [processTitle, setProcessTitle] = useState(
    selectedProfile ? `Convocatoria ${selectedProfile.targetPosition} - ${new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }).toUpperCase()}` : ''
  );
  const [launchedBy, setLaunchedBy] = useState('Tania León (Líder)');
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('es-PE'));
  const [endDate, setEndDate] = useState('31/12/2026');
  const [durationMinutes, setDurationMinutes] = useState(selectedProfile?.totalDurationMinutes || 45);

  // Step 3: Candidate Email Invitation Settings & Inputs
  const [inviteMethod, setInviteMethod] = useState<'MANUAL' | 'PASTE_EMAILS' | 'EXCEL'>('MANUAL');
  
  // Single Candidate Form
  const [candEmail, setCandEmail] = useState('');
  const [candFullName, setCandFullName] = useState('');
  const [candNombre, setCandNombre] = useState('');
  const [candApellido, setCandApellido] = useState('');
  const [candUsuario, setCandUsuario] = useState('');
  const [isManualUsuario, setIsManualUsuario] = useState(false);
  const [candDni, setCandDni] = useState('');
  const [candPhone, setCandPhone] = useState('+51 9');
  const [candPassword, setCandPassword] = useState('Gea2026!');
  const [formError, setFormError] = useState<string | null>(null);

  // División inteligente: si >= 3 palabras, los dos últimos son apellido; los previos son nombre
  const splitFullName = (fullName: string): { nombre: string; apellido: string } => {
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return { nombre: words[0] || '', apellido: '' };
    if (words.length === 2) return { nombre: words[0], apellido: words[1] };
    const apellido = words.slice(-2).join(' ');
    const nombre = words.slice(0, -2).join(' ');
    return { nombre, apellido };
  };

  const handleFullNameChange = (val: string) => {
    setCandFullName(val);
    const { nombre, apellido } = splitFullName(val);
    setCandNombre(nombre);
    setCandApellido(apellido);
  };

  const handleEmailChange = (val: string) => {
    setCandEmail(val);
    if (!isManualUsuario) {
      const userPart = val.split('@')[0] || '';
      setCandUsuario(userPart.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
    }
  };

  // Bulk Emails Pasted
  const [pastedEmails, setPastedEmails] = useState('');

  // Bulk Excel File
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelError, setExcelError] = useState<string | null>(null);

  // Email Notification Options
  const [sendImmediateEmail, setSendImmediateEmail] = useState(true);
  const [sendReminder48h, setSendReminder48h] = useState(true);
  const [requireConsentLaw, setRequireConsentLaw] = useState(true);
  const [emailSubject, setEmailSubject] = useState(
    `Invitación a Evaluación Psicolaboral GEA Perú - ${selectedProfile?.targetPosition || 'Selección'}`
  );
  const [emailCustomMessage, setEmailCustomMessage] = useState(
    'Estimado postulante, has sido convocado a la etapa de evaluación psicológica y técnica. Ingresa con tu DNI y la contraseña provisoria adjunta.'
  );

  // Staged Candidates List
  const [stagedCandidates, setStagedCandidates] = useState<StagedCandidate[]>([]);

  // Post-Launch / Draft Success Modal
  const [launchedSuccess, setLaunchedSuccess] = useState<{
    process: EvaluationTest;
    candidates: StagedCandidate[];
    isDraft?: boolean;
  } | null>(null);

  // When profile selection changes, update defaults
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const prof = tests.find(t => t.id === profileId);
    if (prof) {
      setProcessTitle(`Convocatoria ${prof.targetPosition} - ${new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }).toUpperCase()}`);
      setDurationMinutes(prof.totalDurationMinutes || 45);
      setEmailSubject(`Invitación a Evaluación Psicolaboral GEA Perú - ${prof.targetPosition}`);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Gea!';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCandPassword(pass);
  };

  // Add Single Candidate con validaciones requeridas
  const handleAddSingleCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailTrimmed = candEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setFormError('Por favor ingresa un correo electrónico válido (ej. usuario@geaperu.pe).');
      return;
    }

    const words = candFullName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      setFormError('Por favor ingresa al menos dos palabras en Nombres y Apellidos Completos.');
      return;
    }

    const cleanDni = candDni.trim().replace(/\D/g, '');
    if (cleanDni && cleanDni.length !== 8) {
      setFormError('El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    let cleanPhone = candPhone.trim().replace(/\s+/g, '');
    if (cleanPhone) {
      if (!cleanPhone.startsWith('+51')) {
        const digits = cleanPhone.replace(/\D/g, '');
        if (digits.length === 9 && digits.startsWith('9')) {
          cleanPhone = `+51${digits}`;
        }
      }
      const phoneRegex = /^\+519\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setFormError('El teléfono móvil debe tener formato peruano válido (+519XXXXXXXX).');
        return;
      }
    }

    if (stagedCandidates.some(c => c.email === emailTrimmed)) {
      setFormError('Este correo electrónico ya se encuentra en la lista de invitados para este proceso.');
      return;
    }

    const finalNombre = candNombre.trim() || words[0];
    const finalApellido = candApellido.trim() || words.slice(1).join(' ');
    const finalUsuario = candUsuario.trim() || emailTrimmed.split('@')[0];

    const newStaged: StagedCandidate = {
      id: `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fullName: `${finalNombre} ${finalApellido}`.trim(),
      nombre: finalNombre,
      apellido: finalApellido,
      usuario: finalUsuario,
      email: emailTrimmed,
      dni: cleanDni || Math.floor(10000000 + Math.random() * 90000000).toString(),
      phone: cleanPhone || '+51 984 123 456',
      password: candPassword.trim() || 'Gea2026!'
    };

    setStagedCandidates(prev => [...prev, newStaged]);
    // Reset form
    setCandEmail('');
    setCandFullName('');
    setCandNombre('');
    setCandApellido('');
    setCandUsuario('');
    setIsManualUsuario(false);
    setCandDni('');
    setCandPhone('+51 9');
    setCandPassword('Gea2026!');
  };

  // Add Pasted Emails
  const handleProcessPastedEmails = () => {
    setFormError(null);
    if (!pastedEmails.trim()) return;

    const emails = pastedEmails
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 3 && e.includes('@'));

    if (emails.length === 0) {
      setFormError('No se encontraron correos electrónicos válidos en el texto pegado.');
      return;
    }

    const newCandidates: StagedCandidate[] = [];
    emails.forEach((email, idx) => {
      if (!stagedCandidates.some(c => c.email === email) && !newCandidates.some(c => c.email === email)) {
        const username = email.split('@')[0].replace(/[._-]/g, ' ');
        const nameCapitalized = username.charAt(0).toUpperCase() + username.slice(1);
        const randomDni = (70000000 + stagedCandidates.length + idx + Math.floor(Math.random() * 99999)).toString().slice(0, 8);
        
        newCandidates.push({
          id: `cand-${Date.now()}-${idx}`,
          fullName: nameCapitalized,
          email,
          dni: randomDni,
          phone: '+51 984 ' + Math.floor(100000 + Math.random() * 900000),
          password: 'Gea' + Math.floor(1000 + Math.random() * 9000) + '!'
        });
      }
    });

    setStagedCandidates(prev => [...prev, ...newCandidates]);
    setPastedEmails('');
  };

  // Download Sample Excel
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Nombres y Apellidos': 'Carlos Alberto Quispe Romero',
        'Correo Electronico': 'carlos.quispe@ejemplo.com',
        'DNI': '73948512',
        'Telefono': '+51 984 123 456'
      },
      {
        'Nombres y Apellidos': 'Mariana Lucía Benavides Soler',
        'Correo Electronico': 'mariana.benavides@ejemplo.com',
        'DNI': '48291045',
        'Telefono': '+51 951 890 234'
      },
      {
        'Nombres y Apellidos': 'Rodrigo Esteban Morales Paz',
        'Correo Electronico': 'rodrigo.morales@ejemplo.com',
        'DNI': '71829304',
        'Telefono': '+51 972 345 678'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Postulantes');
    XLSX.writeFile(wb, `Plantilla_Invitacion_Postulantes_GEA.xlsx`);
  };

  // Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!data || data.length === 0) {
          setExcelError('El archivo está vacío o no contiene filas con datos válidos.');
          return;
        }

        const parsed: StagedCandidate[] = [];
        data.forEach((row, i) => {
          const email = (row['Correo Electronico'] || row['Correo'] || row['Email'] || row['email'] || '').toString().trim().toLowerCase();
          const fullName = (row['Nombres y Apellidos'] || row['Nombre'] || row['Postulante'] || 'Postulante Convocado').toString().trim();
          const dni = (row['DNI'] || row['Documento'] || `${70000000 + i}`).toString().replace(/\D/g, '').slice(0, 8);
          const phone = (row['Telefono'] || row['Celular'] || '+51 900 000 000').toString().trim();

          if (email && email.includes('@')) {
            parsed.push({
              id: `cand-excel-${Date.now()}-${i}`,
              fullName,
              email,
              dni: dni.length === 8 ? dni : `${70000000 + i}`,
              phone,
              password: 'Gea' + Math.floor(1000 + Math.random() * 9000) + '!'
            });
          }
        });

        if (parsed.length === 0) {
          setExcelError('No se identificaron correos válidos en las columnas "Correo" o "Email".');
          return;
        }

        setStagedCandidates(prev => [...prev, ...parsed]);
      } catch (err) {
        setExcelError('Error al leer el archivo Excel. Verifica el formato e intenta nuevamente.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Remove candidate from staged list
  const handleRemoveCandidate = (id: string) => {
    setStagedCandidates(prev => prev.filter(c => c.id !== id));
  };

  // Final Action: Launch Process
  const handleFinalLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processTitle.trim()) {
      alert('Por favor ingresa un título para el proceso.');
      return;
    }

    const uniqueProcessId = crypto.randomUUID();
    const targetPos = selectedProfile?.targetPosition || 'Asesor Operativo';
    const code = `PROC-${targetPos.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTest: EvaluationTest = {
      id: uniqueProcessId,
      code,
      title: processTitle.trim(),
      targetPosition: targetPos,
      description: selectedProfile?.description || `Proceso de evaluación psicopedagógica y casos reales para el perfil de ${targetPos}.`,
      instructions: 'Examen de evaluación psicométrica y situacional. Cuenta con auditoría y supervisión de foco.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalDurationMinutes: durationMinutes,
      candidateCount: stagedCandidates.length,
      completedCount: 0,
      averageScore: 0,
      launchedBy,
      startDate,
      endDate,
      processStatus: 'LANZADO',
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

    // Convert staged candidates to real Candidate objects
    const newCandidates: Candidate[] = stagedCandidates.map((c) => ({
      id: crypto.randomUUID(),
      fullName: c.fullName,
      email: c.email,
      password: c.password,
      phone: c.phone,
      dni: c.dni,
      position: targetPos,
      testId: uniqueProcessId,
      invitationCode: `GEA-${c.dni || Math.floor(100000 + Math.random() * 900000)}`,
      invitedAt: new Date().toISOString(),
      status: 'INVITED',
      auditEventCount: 0,
      criticalFlags: 0,
      isConsentSigned: false
    }));

    // Despachar invitaciones oficiales con token único y hashing mediante InvitationService
    stagedCandidates.forEach(async (c) => {
      try {
        await InvitationService.invitarPostulante({
          correo: c.email,
          nombre: c.nombre || c.fullName.split(' ')[0],
          apellido: c.apellido || c.fullName.split(' ').slice(1).join(' '),
          nombreCompleto: c.fullName,
          usuario: c.usuario || c.email.split('@')[0],
          dni: c.dni,
          telefono: c.phone,
          procesoId: uniqueProcessId,
          tituloProceso: processTitle.trim(),
          duracionMinutos: durationMinutes,
          sendImmediate: sendImmediateEmail,
          sendReminder48h: sendReminder48h,
          requireConsentLaw: requireConsentLaw
        });
      } catch (err) {
        console.warn('[CreateProcessModal] Error despachando invitación:', err);
      }
    });

    // Trigger parent callback
    onLaunchProcess(newTest, newCandidates);
    setLaunchedSuccess({
      process: newTest,
      candidates: stagedCandidates,
      isDraft: false
    });
  };

  // HANDLE SAVE AS DRAFT
  const handleSaveDraft = () => {
    const uniqueProcessId = crypto.randomUUID();
    const targetPos = selectedProfile?.targetPosition || 'Asesor Operativo';
    const code = `BORR-${targetPos.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTest: EvaluationTest = {
      id: uniqueProcessId,
      code,
      title: processTitle.trim() || `Borrador: Convocatoria ${targetPos}`,
      targetPosition: targetPos,
      description: selectedProfile?.description || `Proceso de evaluación en preparación para ${targetPos}.`,
      instructions: 'Examen de evaluación psicométrica y situacional guardado en borrador.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      totalDurationMinutes: durationMinutes,
      candidateCount: stagedCandidates.length,
      completedCount: 0,
      averageScore: 0,
      launchedBy,
      startDate,
      endDate,
      processStatus: 'BORRADOR',
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
      id: crypto.randomUUID(),
      fullName: c.fullName,
      email: c.email,
      password: c.password,
      phone: c.phone,
      dni: c.dni,
      position: targetPos,
      testId: uniqueProcessId,
      invitationCode: `GEA-${c.dni || Math.floor(100000 + Math.random() * 900000)}`,
      invitedAt: new Date().toISOString(),
      status: 'INVITED',
      auditEventCount: 0,
      criticalFlags: 0,
      isConsentSigned: false
    }));

    onLaunchProcess(newTest, newCandidates);
    setLaunchedSuccess({
      process: newTest,
      candidates: stagedCandidates,
      isDraft: true
    });
  };

  // SUCCESS / DRAFT CONFIRMATION MODAL
  if (launchedSuccess) {
    const isDraft = launchedSuccess.isDraft;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            isDraft
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isDraft ? (
              <FileText className="w-8 h-8 stroke-[2.2]" />
            ) : (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            )}
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
                ? `El proceso quedó guardado en estado Borrador con ${launchedSuccess.candidates.length} postulantes pre-cargados. Puedes editarlo o lanzarlo cuando desees desde la sección de Procesos.`
                : `El proceso de evaluación se encuentra activo y disponible en el panel. ${
                    launchedSuccess.candidates.length > 0
                      ? `Se enviaron las invitaciones y credenciales por correo electrónico a los ${launchedSuccess.candidates.length} candidatos registrados.`
                      : 'Puedes compartir el enlace de autoinscripción o convocar postulantes en cualquier momento.'
                  }`}
            </p>
          </div>

          {/* Process specs badge */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Estado:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isDraft ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {isDraft ? 'BORRADOR' : 'LANZADO ACTIVO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Perfil Asociado:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{launchedSuccess.process.profileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Código de Convocatoria:</span>
              <span className="font-mono font-bold text-[#1F2A5E] dark:text-blue-400">{launchedSuccess.process.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Reclutador Responsable:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{launchedSuccess.process.launchedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Postulantes en Lista:</span>
              <span className="font-bold text-[#1F2A5E] dark:text-blue-400">{launchedSuccess.candidates.length} postulantes</span>
            </div>
          </div>

          {/* Enlaces de acceso directo y WhatsApp para postulantes convocados */}
          {launchedSuccess.candidates.length > 0 && (
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Enlaces de Acceso para Postulantes (Móvil y Web):
              </span>
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {launchedSuccess.candidates.map((cand, idx) => {
                  const phoneDigits = (cand.phone || '').replace(/\D/g, '');
                  const phoneForWa = phoneDigits.startsWith('51') ? phoneDigits : (phoneDigits.length === 9 ? `51${phoneDigits}` : phoneDigits);
                  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                  const candidateLink = `${origin}/login?code=GEA-${cand.dni}&dni=${cand.dni}&email=${encodeURIComponent(cand.email)}`;
                  const waMsg = `Estimado/a ${cand.fullName}, te saludamos de Selección GEA Perú. Has sido convocado/a al proceso de selección: ${launchedSuccess.process.title}.\n\n📌 Accede aquí desde tu móvil o PC:\n${candidateLink}\n\nUsuario: ${cand.dni}\nContraseña inicial: Gea2026!\n\n¡Muchos éxitos!`;
                  const waUrl = `https://wa.me/${phoneForWa}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <div key={cand.id || idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{cand.fullName}</div>
                        <div className="text-[11px] text-zinc-500 truncate">DNI: {cand.dni} • {cand.email}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(candidateLink);
                            alert(`✓ Enlace móvil copiado para ${cand.fullName}:\n\n${candidateLink}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold text-[11px] hover:bg-zinc-100 cursor-pointer flex items-center gap-1"
                          title="Copiar enlace"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Enviar por WhatsApp"
                        >
                          <span>📲 WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-bold text-sm cursor-pointer transition-colors shadow-md"
            >
              Ver Procesos
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F2A5E]">
                Evaluación & Convocatoria • GEA Internacional
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nuevo Proceso</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#1F2A5E]" />
              <span>Generar Nuevo Proceso de Evaluación</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Selecciona un perfil existente, configura los parámetros del proceso e invita a candidatos mediante su correo electrónico.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">
          
          {/* ========================================================================= */}
          {/* SECCIÓN 1: SELECCIONAR UN PERFIL                                         */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#1F2A5E]" />
                <span>1. Seleccionar Perfil de Puesto para este Proceso *</span>
              </label>
              <span className="text-[11px] text-[#1F2A5E] font-bold">
                {tests.length} perfiles disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedProfileId}
                onChange={e => handleProfileChange(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden shadow-2xs"
              >
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.title} ({test.targetPosition}) — Código: {test.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Profile Card Preview */}
            {selectedProfile && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1F2A5E] dark:text-blue-300">
                      {selectedProfile.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1F2A5E]/10 text-[#1F2A5E] dark:bg-[#1F2A5E]/30 dark:text-blue-200 text-[10px] font-mono">
                      {selectedProfile.code}
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    Duración: <strong>{selectedProfile.totalDurationMinutes} min</strong> • {selectedProfile.stages?.length || 3} etapas
                  </span>
                </div>

                {/* Job Description from Profile */}
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                  <strong className="text-zinc-700 dark:text-zinc-200">Descripción del puesto:</strong> {selectedProfile.description || 'Perfil estandarizado con pruebas psicométricas y situacionales.'}
                </p>

                {/* Profile Competencies Preview */}
                {selectedProfile.selectedCompetencies && selectedProfile.selectedCompetencies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedProfile.selectedCompetencies.slice(0, 4).map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                        {c}
                      </span>
                    ))}
                    {selectedProfile.selectedCompetencies.length > 4 && (
                      <span className="text-[10px] text-zinc-400 self-center">
                        +{selectedProfile.selectedCompetencies.length - 4} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: CONFIGURACIÓN DE LA CONVOCATORIA / PROCESO                     */}
          {/* ========================================================================= */}
          <div className="space-y-3.5">
            <label className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#1F2A5E]" />
              <span>2. Datos del Proceso de Evaluación</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nombre de la Convocatoria */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre del Proceso / Convocatoria *
                </label>
                <input
                  type="text"
                  required
                  value={processTitle}
                  onChange={e => setProcessTitle(e.target.value)}
                  placeholder="Ej. Convocatoria Masiva 2026 - Asesores de Ventas y Retención"
                  className="w-full px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                />
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Lanzado por (Reclutador)
                </label>
                <input
                  type="text"
                  value={launchedBy}
                  onChange={e => setLaunchedBy(e.target.value)}
                  placeholder="Tania León (Líder)"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    placeholder="29/09/2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Fecha Límite
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    placeholder="31/12/2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 3: INVITAR A CANDIDATOS A TRAVÉS DE SU CORREO                     */}
          {/* ========================================================================= */}
          <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#1F2A5E]" />
                  <span>3. Invitar Postulantes al Proceso por Correo</span>
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Agrega los correos de los candidatos que recibirán el enlace de examen y credenciales de acceso.
                </p>
              </div>

              {/* Badges of staged count */}
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs self-start sm:self-auto border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stagedCandidates.length} postulantes listos</span>
              </span>
            </div>

            {/* Methods Tab: Individual, Pegar Correos, Excel */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold gap-2">
              <button
                type="button"
                onClick={() => setInviteMethod('MANUAL')}
                className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inviteMethod === 'MANUAL'
                    ? 'border-[#1F2A5E] text-[#1F2A5E] font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingreso por Correo</span>
              </button>

              <button
                type="button"
                onClick={() => setInviteMethod('PASTE_EMAILS')}
                className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inviteMethod === 'PASTE_EMAILS'
                    ? 'border-[#1F2A5E] text-[#1F2A5E] font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Pegar Lista de Correos</span>
              </button>

              <button
                type="button"
                onClick={() => setInviteMethod('EXCEL')}
                className={`pb-2 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inviteMethod === 'EXCEL'
                    ? 'border-[#1F2A5E] text-[#1F2A5E] font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Cargar Excel / CSV</span>
              </button>
            </div>

            {/* SUB-TAB 1: INGRESO MANUAL POR CORREO */}
            {inviteMethod === 'MANUAL' && (
              <div className="space-y-3 pt-1">
                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Correo Electrónico del Postulante *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="email"
                        value={candEmail}
                        onChange={e => handleEmailChange(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nombres y Apellidos Completos *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={candFullName}
                        onChange={e => handleFullNameChange(e.target.value)}
                        placeholder="Ej. Juan Carlos Ramos Quispe"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Campos desglosados y editables: Nombre y Apellido */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nombre (editable)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={candNombre}
                        onChange={e => setCandNombre(e.target.value)}
                        placeholder="Nombre(s)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Apellido (editable)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={candApellido}
                        onChange={e => setCandApellido(e.target.value)}
                        placeholder="Apellido(s)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Usuario propuesto desde el correo */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Usuario propuesto (editable)
                    </label>
                    <div className="relative">
                      <span className="w-4 h-4 absolute left-3 top-2 text-zinc-400 font-mono text-xs">@</span>
                      <input
                        type="text"
                        value={candUsuario}
                        onChange={e => {
                          setCandUsuario(e.target.value);
                          setIsManualUsuario(true);
                        }}
                        placeholder="usuario"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      DNI (8 dígitos)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        maxLength={8}
                        value={candDni}
                        onChange={e => setCandDni(e.target.value.replace(/\D/g, ''))}
                        placeholder="72458912"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Teléfono Móvil */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Teléfono Móvil (+519XXXXXXXX)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={candPhone}
                        onChange={e => setCandPhone(e.target.value)}
                        placeholder="+51 984 123 456"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSingleCandidate}
                    className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Añadir a Lista de Invitados</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PEGAR LISTA DE CORREOS */}
            {inviteMethod === 'PASTE_EMAILS' && (
              <div className="space-y-3 pt-1">
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Pega los correos electrónicos separados por comas o saltos de línea:
                </label>
                <textarea
                  rows={3}
                  value={pastedEmails}
                  onChange={e => setPastedEmails(e.target.value)}
                  placeholder="ejemplo1@gmail.com, ejemplo2@hotmail.com&#10;ejemplo3@outlook.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleProcessPastedEmails}
                    className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Procesar e Incorporar Correos</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: EXCEL / CSV BULK */}
            {inviteMethod === 'EXCEL' && (
              <div className="space-y-3 pt-1">
                {excelError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{excelError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Plantilla oficial para carga masiva
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Incluye columnas: Nombres y Apellidos, Correo Electrónico, DNI, Teléfono.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-lg border border-[#1F2A5E]/30 bg-[#1F2A5E]/10 text-[#1F2A5E] dark:bg-[#1F2A5E]/30 dark:text-blue-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-[#1F2A5E]/20 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla Excel</span>
                  </button>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#1F2A5E] rounded-2xl p-6 text-center cursor-pointer bg-white dark:bg-zinc-800/60 transition-colors"
                >
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Haz clic aquí para seleccionar el archivo Excel (.xlsx / .csv)
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Se procesarán automáticamente los correos y postulantes para la convocatoria.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* LIST OF STAGED CANDIDATES */}
            {stagedCandidates.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    Postulantes que recibirán correo de invitación ({stagedCandidates.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setStagedCandidates([])}
                    className="text-rose-500 hover:underline cursor-pointer text-[11px]"
                  >
                    Limpiar lista
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {stagedCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>{cand.fullName}</span>
                          <span className="text-[10px] font-mono text-zinc-400 font-normal">
                            DNI: {cand.dni}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#1F2A5E] dark:text-blue-300 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{cand.email}</span>
                          <span className="text-zinc-400">• Clave provisoria: {cand.password}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(cand.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 rounded-lg cursor-pointer"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Notification & Policy Options */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
              <span className="block font-bold text-zinc-800 dark:text-zinc-200">
                Opciones del despacho de invitaciones por correo:
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={sendImmediateEmail}
                  onChange={e => setSendImmediateEmail(e.target.checked)}
                  className="rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                />
                <span>Enviar correo de invitación inmediato con credenciales y enlace único al examen</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={sendReminder48h}
                  onChange={e => setSendReminder48h(e.target.checked)}
                  className="rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                />
                <span>Programar recordatorio automático por correo a las 48h para candidatos sin iniciar</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={requireConsentLaw}
                  onChange={e => setRequireConsentLaw(e.target.checked)}
                  className="rounded text-[#1F2A5E] focus:ring-[#1F2A5E]"
                />
                <span>Requerir consentimiento informado Ley N° 29733 (Protección de Datos Personales) al ingresar</span>
              </label>
            </div>

          </div>

        </div>

        {/* Modal Footer with "Lanzar Proceso" Button */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Perfil: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProfile?.title}</strong> • Convocados: <strong className="text-emerald-600 font-bold">{stagedCandidates.length}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-medium"
            >
              Cancelar
            </button>

            {/* BOTÓN: GUARDAR EN BORRADOR */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98"
            >
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Guardar en borrador</span>
            </button>

            {/* BOTÓN: LANZAR PROCESO */}
            <button
              type="button"
              onClick={handleFinalLaunch}
              className="px-6 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 transition-all"
            >
              <Rocket className="w-4 h-4 fill-white/20" />
              <span>Lanzar Proceso</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
