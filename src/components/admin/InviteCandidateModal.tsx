import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Candidate, EvaluationTest } from '../../types';
import { 
  X, 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Mail, 
  Phone, 
  CreditCard, 
  User, 
  Briefcase,
  Copy,
  Sparkles,
  Check,
  Zap,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

interface InviteCandidateModalProps {
  tests: EvaluationTest[];
  activeTestId: string;
  onClose: () => void;
  onAddCandidates: (newCandidates: Candidate[]) => void;
}

interface ParsedCandidateRow {
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  whatsappUser: string;
  password: string;
  isValid: boolean;
  error?: string;
}

// Generador de contraseña alfanumérica única (letras mayúsculas, minúsculas y números, libre de ambigüedades)
function generateUniqueAlphanumericPassword(existingSet: Set<string>): string {
  const lettersUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lettersLower = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';

  let pass = '';
  let attempts = 0;
  do {
    // 3 mayúsculas, 3 minúsculas, 3 números (longitud 9)
    let u = '';
    let l = '';
    let n = '';
    for (let i = 0; i < 3; i++) u += lettersUpper.charAt(Math.floor(Math.random() * lettersUpper.length));
    for (let i = 0; i < 3; i++) l += lettersLower.charAt(Math.floor(Math.random() * lettersLower.length));
    for (let i = 0; i < 3; i++) n += numbers.charAt(Math.floor(Math.random() * numbers.length));
    
    pass = (u + l + n).split('').sort(() => Math.random() - 0.5).join('');
    attempts++;
  } while (existingSet.has(pass) && attempts < 50);

  existingSet.add(pass);
  return pass;
}

export const InviteCandidateModal: React.FC<InviteCandidateModalProps> = ({
  tests,
  activeTestId,
  onClose,
  onAddCandidates
}) => {
  // Pestañas: 'RAPIDO' (Pegar texto masivo) | 'EXCEL' (Subir .xlsx/.csv) | 'MANUAL' (Formulario individual)
  const [activeTab, setActiveTab] = useState<'RAPIDO' | 'EXCEL' | 'MANUAL'>('RAPIDO');
  const [selectedTestId, setSelectedTestId] = useState<string>(activeTestId || tests[0]?.id || 'test-gea-001');

  const selectedTest = tests.find(t => t.id === selectedTestId) || tests[0];

  // Puesto / Cargo editable que se guardará en la base de datos
  const [customPosition, setCustomPosition] = useState<string>(selectedTest?.targetPosition || 'Asesor de Operaciones');

  // Sincronizar posición predeterminada al cambiar de proceso
  useEffect(() => {
    if (selectedTest?.targetPosition) {
      setCustomPosition(selectedTest.targetPosition);
    }
  }, [selectedTestId]);

  // Conjunto para evitar contraseñas repetidas en la misma tanda
  const generatedPasswordsSet = useRef<Set<string>>(new Set());

  // =========================================================================
  // ESTADOS: MODO RÁPIDO (PEGAR TEXTO)
  // =========================================================================
  const [quickInputText, setQuickInputText] = useState<string>('');
  const [quickParsedRows, setQuickParsedRows] = useState<ParsedCandidateRow[]>([]);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Parsear texto del modo rápido en tiempo real
  const handleQuickTextChange = (text: string) => {
    setQuickInputText(text);
    setQuickError(null);

    if (!text.trim()) {
      setQuickParsedRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rows: ParsedCandidateRow[] = [];
    const usedDnis = new Set<string>();

    lines.forEach((line) => {
      // Soporta separadores: tabulaciones (\t), comas (,), punto y coma (;) o barras (|)
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else {
        parts = line.split(',');
      }

      parts = parts.map(p => p.trim());

      const rawDni = (parts[0] || '').replace(/\D/g, '');
      const rawName = parts[1] || '';
      const rawEmail = (parts[2] || '').toLowerCase();
      const rawPhone = parts[3] || '+51 900 000 000';
      const rawWhatsapp = parts[4] || rawPhone; // Si no se indica quinta columna, usa el teléfono como WhatsApp

      let isValid = true;
      let error = '';

      if (rawDni.length !== 8) {
        isValid = false;
        error = 'El DNI debe tener 8 dígitos.';
      } else if (usedDnis.has(rawDni)) {
        isValid = false;
        error = 'DNI duplicado en la lista.';
      } else if (!rawName || rawName.length < 3) {
        isValid = false;
        error = 'Falta el nombre completo.';
      } else if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
        isValid = false;
        error = 'Correo electrónico no válido.';
      }

      if (isValid) {
        usedDnis.add(rawDni);
      }

      const pass = generateUniqueAlphanumericPassword(generatedPasswordsSet.current);

      rows.push({
        dni: rawDni,
        fullName: rawName,
        email: rawEmail,
        phone: rawPhone,
        whatsappUser: rawWhatsapp,
        password: pass,
        isValid,
        error
      });
    });

    setQuickParsedRows(rows);
  };

  // Cargar ejemplo en modo rápido con WhatsApp
  const handleLoadQuickExample = () => {
    const example = `72458912, Juan Carlos Ramos Medina, juan.ramos@gmail.com, 984123456, +51 984 123 456\n46891234, Paola Jimena Ruiz Silva, paola.ruiz@hotmail.com, 972654321, +51 972 654 321\n71567890, Miguel Ángel Chávez Flores, miguel.chavez@gmail.com, 951890123, +51 951 890 123`;
    handleQuickTextChange(example);
  };

  // =========================================================================
  // ESTADOS: MODO EXCEL Y CSV
  // =========================================================================
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelParsedRows, setExcelParsedRows] = useState<ParsedCandidateRow[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Descargar Plantilla Oficial Excel con columna Usuario WhatsApp
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'DNI': '72458912',
        'Nombres y Apellidos': 'Juan Carlos Ramos Medina',
        'Correo': 'juan.ramos@ejemplo.pe',
        'Telefono': '+51 984 123 456',
        'Usuario WhatsApp': '+51 984 123 456'
      },
      {
        'DNI': '46891234',
        'Nombres y Apellidos': 'Paola Jimena Ruiz Silva',
        'Correo': 'paola.ruiz@ejemplo.pe',
        'Telefono': '+51 972 654 321',
        'Usuario WhatsApp': '+51 972 654 321'
      },
      {
        'DNI': '71567890',
        'Nombres y Apellidos': 'Miguel Ángel Chávez Flores',
        'Correo': 'miguel.chavez@ejemplo.pe',
        'Telefono': '+51 951 890 123',
        'Usuario WhatsApp': '+51 951 890 123'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Postulantes');

    const cleanPos = customPosition.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    XLSX.writeFile(workbook, `Plantilla_Postulantes_${cleanPos}.xlsx`);
  };

  // Subir y leer archivo Excel o CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setExcelError('El archivo no contiene filas con postulantes.');
          setExcelParsedRows([]);
          return;
        }

        const usedDnis = new Set<string>();
        const parsed: ParsedCandidateRow[] = rawJson.map((row: any) => {
          const rawDni = String(row['DNI'] || row['Documento'] || row['Dni'] || row['dni'] || '').trim().replace(/\D/g, '');
          const name = String(row['Nombres y Apellidos'] || row['Nombre'] || row['Nombres'] || row['Full Name'] || row['nombre'] || '').trim();
          const mail = String(row['Correo'] || row['Email'] || row['Correo Electrónico'] || row['email'] || '').trim().toLowerCase();
          const cel = String(row['Telefono'] || row['Teléfono'] || row['Celular'] || row['Phone'] || row['celular'] || '+51 900 000 000').trim();
          const waUser = String(row['Usuario WhatsApp'] || row['Usuario Whatsapp'] || row['WhatsApp'] || row['Whatsapp'] || row['whatsapp'] || cel).trim();

          let isValid = true;
          let err = '';

          if (rawDni.length !== 8) {
            isValid = false;
            err = 'DNI debe tener 8 dígitos.';
          } else if (usedDnis.has(rawDni)) {
            isValid = false;
            err = 'DNI duplicado en el archivo.';
          } else if (!name || name.length < 3) {
            isValid = false;
            err = 'Falta nombre completo.';
          } else if (!mail || !mail.includes('@')) {
            isValid = false;
            err = 'Correo electrónico inválido.';
          }

          if (isValid) {
            usedDnis.add(rawDni);
          }

          const pass = generateUniqueAlphanumericPassword(generatedPasswordsSet.current);

          return {
            dni: rawDni,
            fullName: name,
            email: mail,
            phone: cel,
            whatsappUser: waUser,
            password: pass,
            isValid,
            error: err
          };
        });

        setExcelParsedRows(parsed);
      } catch {
        setExcelError('Error al leer el archivo. Asegúrese de que sea formato .xlsx, .xls o .csv válido.');
        setExcelParsedRows([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  // =========================================================================
  // ESTADOS: MODO MANUAL (INDIVIDUAL)
  // =========================================================================
  const [manualFullName, setManualFullName] = useState('');
  const [manualDni, setManualDni] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('+51 9');
  const [manualWhatsappUser, setManualWhatsappUser] = useState('+51 9');
  const [manualPassword, setManualPassword] = useState(() => generateUniqueAlphanumericPassword(generatedPasswordsSet.current));
  const [manualError, setManualError] = useState<string | null>(null);

  const handleRegenerateManualPassword = () => {
    setManualPassword(generateUniqueAlphanumericPassword(generatedPasswordsSet.current));
  };

  // Sincronizar número de WhatsApp al cambiar teléfono en manual si tienen el mismo prefijo
  const handleManualPhoneChange = (val: string) => {
    setManualPhone(val);
    if (manualWhatsappUser === '+51 9' || manualWhatsappUser === manualPhone) {
      setManualWhatsappUser(val);
    }
  };

  // =========================================================================
  // RESULTADOS Y CREDENCIALES GENERADAS
  // =========================================================================
  const [createdCredentials, setCreatedCredentials] = useState<Array<{
    name: string;
    dni: string;
    email: string;
    phone: string;
    whatsappUser: string;
    password: string;
    position: string;
  }> | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Guardar postulantes procesados
  const handleSaveCandidates = (rowsToSave: ParsedCandidateRow[]) => {
    const validRows = rowsToSave.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const assignedPosition = customPosition.trim() || selectedTest?.targetPosition || 'Asesor de Operaciones';

    const newCandidates: Candidate[] = validRows.map((row, idx) => {
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      return {
        id: `cand-${Date.now()}-${idx}`,
        fullName: row.fullName.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password, // Contraseña alfanumérica única generada
        phone: row.phone.trim() || '+51 900 000 000',
        whatsappUser: row.whatsappUser.trim() || row.phone.trim() || '+51 900 000 000', // Campo usuario whatsapp
        dni: row.dni.trim(),
        position: assignedPosition, // Cargo editable guardado en BD
        testId: selectedTest.id,
        invitationCode: `GEA-2026-${uniqueSuffix}`,
        invitedAt: new Date().toISOString(),
        status: 'INVITED',
        auditEventCount: 0,
        criticalFlags: 0,
        isConsentSigned: false
      };
    });

    onAddCandidates(newCandidates);

    setCreatedCredentials(newCandidates.map(c => ({
      name: c.fullName,
      dni: c.dni,
      email: c.email,
      phone: c.phone,
      whatsappUser: c.whatsappUser || c.phone,
      password: c.password || '',
      position: c.position
    })));
  };

  // Submit Modo Manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const cleanDni = manualDni.trim().replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      setManualError('El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    if (!manualFullName.trim()) {
      setManualError('Ingrese los nombres y apellidos completos.');
      return;
    }

    if (!manualEmail.trim() || !manualEmail.includes('@')) {
      setManualError('Ingrese un correo electrónico válido.');
      return;
    }

    handleSaveCandidates([{
      fullName: manualFullName,
      dni: cleanDni,
      email: manualEmail,
      phone: manualPhone,
      whatsappUser: manualWhatsappUser.trim() || manualPhone.trim() || '+51 900 000 000',
      password: manualPassword,
      isValid: true
    }]);
  };

  // Copiar todas las credenciales al portapapeles (optimizadas para WhatsApp)
  const handleCopyAllCredentials = () => {
    if (!createdCredentials) return;
    const origin = window.location.origin;
    const lines = createdCredentials.map((c, i) => 
      `${i + 1}. *${c.name}*\n   DNI: ${c.dni}\n   WhatsApp: ${c.whatsappUser}\n   Correo: ${c.email}\n   Contraseña: ${c.password}\n   Puesto: ${c.position}\n   Acceso: ${origin}/login?dni=${c.dni}\n`
    ).join('\n');

    const text = `*INVITACIÓN OFICIAL A EVALUACIÓN LABORAL - GEA PERÚ*\nCargo: *${customPosition}*\n\n${lines}\n_Por favor ingrese al enlace e inicie sesión con su DNI o correo y su contraseña asignada._`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Descargar Excel con las Credenciales Generadas (incluye Usuario WhatsApp)
  const handleDownloadCredentialsExcel = () => {
    if (!createdCredentials) return;
    const origin = window.location.origin;
    const data = createdCredentials.map(c => ({
      'Nombres y Apellidos': c.name,
      'DNI': c.dni,
      'Usuario WhatsApp': c.whatsappUser,
      'Teléfono': c.phone,
      'Correo Electrónico': c.email,
      'Contraseña Asignada': c.password,
      'Cargo / Puesto': c.position,
      'Enlace Directo': `${origin}/login?dni=${c.dni}`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Credenciales');
    XLSX.writeFile(wb, `Accesos_Postulantes_${customPosition.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // Copiar credencial individual con WhatsApp
  const handleCopySingle = (cred: { dni: string; email: string; password: string; whatsappUser: string }, idx: number) => {
    const text = `*Acceso a Evaluación GEA Perú*\nPostulante: ${cred.dni}\nWhatsApp: ${cred.whatsappUser}\nCorreo: ${cred.email}\nContraseña: ${cred.password}\nLink: ${window.location.origin}/login?dni=${cred.dni}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Encabezado del Modal */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60">
                Jefatura de Reclutamiento & Selección
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                Modalidad WhatsApp Activa
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Claves Únicas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight">
              Carga e Invitación de Postulantes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Carga los postulantes con su DNI, Correo y Usuario WhatsApp. El sistema generará contraseñas alfanuméricas únicas e irrepetibles para cada uno.
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

        {/* Vista Posterior: Pantalla de Éxito y Credenciales Emitidas */}
        {createdCredentials ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="text-center p-5 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xs">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                ¡{createdCredentials.length} Postulante(s) Guardados e Invitados con Éxito!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 max-w-lg mx-auto">
                Los registros se guardaron en la base de datos con el puesto <strong>{customPosition}</strong>, usuario WhatsApp y contraseñas alfanuméricas únicas.
              </p>
            </div>

            {/* Acciones Rápidas de Compartir */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Todos los Accesos Copiados con Formato WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Copiar Todos los Accesos (Formato WhatsApp)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadCredentialsExcel}
                className="py-3 px-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-800 dark:text-blue-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Descargar Excel con Accesos</span>
              </button>
            </div>

            {/* Listado de Credenciales Emitidas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <span>Credenciales Emitidas ({createdCredentials.length}):</span>
                <span className="text-zinc-400 text-[11px] font-normal">Puesto: {customPosition}</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 bg-zinc-50 dark:bg-zinc-950/40">
                {createdCredentials.map((cred, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{cred.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">
                          DNI: {cred.dni}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 flex items-center gap-1">
                          <MessageCircle className="w-2.5 h-2.5" />
                          WA: {cred.whatsappUser}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-zinc-500 font-mono mt-1 text-[11px]">
                        <span>Correo: <strong>{cred.email}</strong></span>
                        <span>•</span>
                        <span>Contraseña: <strong className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 rounded">{cred.password}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySingle(cred, idx)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          /* Vista Principal de Formulario / Carga */
          <div className="p-6 space-y-5 overflow-y-auto">
            
            {/* SECCIÓN 1: PROCESO Y CARGO / POSITION EDITABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
              
              {/* Selector de Convocatoria */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  1. Convocatoria / Batería de Pruebas:
                </label>
                <select
                  value={selectedTestId}
                  onChange={e => setSelectedTestId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer shadow-2xs"
                >
                  {tests.map(test => (
                    <option key={test.id} value={test.id}>
                      {test.title} ({test.stages.length} etapas • {test.totalDurationMinutes} min)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Define las competencias psicométricas y de casos asignadas.
                </span>
              </div>

              {/* Cargo / Position Editable para la Base de Datos */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span>2. Cargo a Guardar en Base de Datos:</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Editable</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-3 text-blue-600 dark:text-blue-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={customPosition}
                    onChange={e => setCustomPosition(e.target.value)}
                    placeholder="Ej. Asesor de Ventas Postpago / Atención al Cliente"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  La jefa puede escribir el puesto exacto; se guardará en la columna <code className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">position</code>.
                </span>
              </div>

            </div>

            {/* SECCIÓN 2: PESTAÑAS DE MODALIDAD */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
              
              {/* Tab 1: Modo Rápido (Pegar lista) */}
              <button
                type="button"
                onClick={() => setActiveTab('RAPIDO')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'RAPIDO'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>⚡ Modo Rápido (Texto / WhatsApp)</span>
              </button>

              {/* Tab 2: Modo Excel / CSV */}
              <button
                type="button"
                onClick={() => setActiveTab('EXCEL')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'EXCEL'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📊 Modo Excel y CSV (.xlsx / .csv)</span>
              </button>

              {/* Tab 3: Modo Manual Individual */}
              <button
                type="button"
                onClick={() => setActiveTab('MANUAL')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'MANUAL'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <User className="w-4 h-4 text-blue-500" />
                <span>✍️ Individual</span>
              </button>

            </div>

            {/* =============================================================== */}
            {/* PESTAÑA 1: MODO RÁPIDO (PEGAR TEXTO / LISTA)                   */}
            {/* =============================================================== */}
            {activeTab === 'RAPIDO' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    <span>Pega una o varias filas con: </span>
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">DNI, Nombres, Correo, Celular, Usuario WhatsApp</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadQuickExample}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Pegar ejemplo con WhatsApp
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={quickInputText}
                    onChange={e => handleQuickTextChange(e.target.value)}
                    placeholder={`Pega aquí filas copiadas de Excel, Sheets o WhatsApp. Ejemplo:\n72458912, Juan Carlos Ramos, juan.ramos@gmail.com, 984123456, +51 984 123 456\n46891234, Paola Ruiz Silva, paola.ruiz@hotmail.com, 972654321, +51 972 654 321`}
                    className="w-full p-3.5 font-mono text-xs rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 outline-hidden resize-y shadow-2xs"
                  />
                </div>

                {quickError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{quickError}</span>
                  </div>
                )}

                {/* Previsualización en Tiempo Real */}
                {quickParsedRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        Previsualización ({quickParsedRows.filter(r => r.isValid).length} válidos de {quickParsedRows.length})
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Cargo: <strong className="text-blue-600">{customPosition}</strong>
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-[11px] font-sans">
                        <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">DNI</th>
                            <th className="p-2">Nombres</th>
                            <th className="p-2">Usuario WhatsApp</th>
                            <th className="p-2">Correo</th>
                            <th className="p-2">Contraseña Única</th>
                            <th className="p-2 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 font-mono">
                          {quickParsedRows.map((row, i) => (
                            <tr key={i} className={row.isValid ? 'hover:bg-blue-50/30' : 'bg-rose-50/50 text-rose-800'}>
                              <td className="p-2 font-bold">{row.dni || '—'}</td>
                              <td className="p-2 font-sans truncate max-w-[130px]">{row.fullName || '—'}</td>
                              <td className="p-2 text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[110px]">{row.whatsappUser || '—'}</td>
                              <td className="p-2 truncate max-w-[120px]">{row.email || '—'}</td>
                              <td className="p-2 text-blue-600 dark:text-blue-400 font-bold">{row.password}</td>
                              <td className="p-2 text-right font-sans">
                                {row.isValid ? (
                                  <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold">{row.error}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Botón de Confirmación para Modo Rápido */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveCandidates(quickParsedRows)}
                        disabled={quickParsedRows.filter(r => r.isValid).length === 0}
                        className="py-3 px-5 rounded-xl bg-gradient-to-r from-[#1F2A5E] to-[#2F5BA8] hover:from-[#182348] hover:to-[#254A8A] text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all active:scale-[0.99]"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Guardar e Invitar {quickParsedRows.filter(r => r.isValid).length} Postulante(s)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* PESTAÑA 2: MODO EXCEL Y CSV (.XLSX / .CSV)                     */}
            {/* =============================================================== */}
            {activeTab === 'EXCEL' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Zona de Descarga de Plantilla Oficial */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                        Plantilla Oficial con Usuario WhatsApp (.xlsx)
                      </span>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-400 block">
                        Columnas: <strong>DNI</strong>, <strong>Nombres y Apellidos</strong>, <strong>Correo</strong>, <strong>Telefono</strong>, <strong>Usuario WhatsApp</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="py-2 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>

                {/* Zona de Subida de Archivo */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 rounded-3xl text-center cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                    {excelFile ? excelFile.name : 'Haz clic para seleccionar o arrastra tu archivo Excel o CSV aquí'}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Formatos admitidos: .xlsx, .xls, .csv (Se generarán contraseñas aleatorias únicas automáticamente)
                  </span>
                </div>

                {excelError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{excelError}</span>
                  </div>
                )}

                {/* Previsualización del Excel */}
                {excelParsedRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {excelParsedRows.filter(r => r.isValid).length} postulantes listos de {excelParsedRows.length} filas
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Puesto a registrar: <strong className="text-blue-600">{customPosition}</strong>
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-[11px] font-sans">
                        <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">DNI</th>
                            <th className="p-2">Nombres</th>
                            <th className="p-2">WhatsApp</th>
                            <th className="p-2">Correo</th>
                            <th className="p-2">Contraseña Asignada</th>
                            <th className="p-2 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 font-mono">
                          {excelParsedRows.map((row, i) => (
                            <tr key={i} className={row.isValid ? 'hover:bg-blue-50/30' : 'bg-rose-50/50 text-rose-800'}>
                              <td className="p-2 font-bold">{row.dni || '—'}</td>
                              <td className="p-2 font-sans truncate max-w-[130px]">{row.fullName || '—'}</td>
                              <td className="p-2 text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[110px]">{row.whatsappUser || '—'}</td>
                              <td className="p-2 truncate max-w-[120px]">{row.email || '—'}</td>
                              <td className="p-2 text-blue-600 dark:text-blue-400 font-bold">{row.password}</td>
                              <td className="p-2 text-right font-sans">
                                {row.isValid ? (
                                  <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Listo
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold">{row.error}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Botón de Confirmación para Excel */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveCandidates(excelParsedRows)}
                        disabled={excelParsedRows.filter(r => r.isValid).length === 0}
                        className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all active:scale-[0.99]"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Guardar e Invitar {excelParsedRows.filter(r => r.isValid).length} desde Excel/CSV</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* PESTAÑA 3: FORMULARIO INDIVIDUAL MANUAL                        */}
            {/* =============================================================== */}
            {activeTab === 'MANUAL' && (
              <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in">
                {manualError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{manualError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Nombres y Apellidos Completos *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={manualFullName}
                        onChange={e => setManualFullName(e.target.value)}
                        placeholder="Ej. Carmen Rosa Mendoza Morales"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Documento de Identidad (DNI) *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={manualDni}
                        onChange={e => setManualDni(e.target.value.replace(/\D/g, ''))}
                        placeholder="8 dígitos oficiales"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Correo Electrónico (Acceso Único) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={manualEmail}
                        onChange={e => setManualEmail(e.target.value)}
                        placeholder="ejemplo@correo.pe"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Usuario / Teléfono WhatsApp *</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
                      <input
                        type="text"
                        required
                        value={manualWhatsappUser}
                        onChange={e => setManualWhatsappUser(e.target.value)}
                        placeholder="+51 987 654 321"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-hidden font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Teléfono y Contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      Teléfono Celular
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="tel"
                        value={manualPhone}
                        onChange={e => handleManualPhoneChange(e.target.value)}
                        placeholder="+51 987 654 321"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                        Contraseña Única Alfanumérica *
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateManualPassword}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerar
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-blue-600 dark:text-blue-400" />
                      <input
                        type="text"
                        required
                        value={manualPassword}
                        onChange={e => setManualPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Guardar Postulante e Invitar</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
