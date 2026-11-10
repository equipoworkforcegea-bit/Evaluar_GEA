import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Candidate, EvaluationTest } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { EmailInvitationService } from '../../services/emailInvitationService';
import { NotificacionesService } from '../../services/notificacionesService';
import { supabase } from '../../services/supabaseClient';
import { 
  X, 
  UserPlus, 
  Upload, 
  Trash2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Loader2, 
  Download, 
  Copy, 
  CheckCircle2, 
  MessageCircle, 
  FileSpreadsheet, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface InviteCandidateModalProps {
  tests: EvaluationTest[];
  activeTestId: string;
  onClose: () => void;
  onAddCandidates: (newCandidates: Candidate[]) => void;
}

export interface StagedCandidateItem {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  dni?: string;
  phone?: string;
}

// Generador de contraseña alfanumérica única (letras mayúsculas, minúsculas y números, libre de ambigüedades)
function generateUniqueAlphanumericPassword(existingSet: Set<string>): string {
  const lettersUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lettersLower = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';

  let pass = '';
  let attempts = 0;
  do {
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

const COUNTRY_OPTIONS = [
  'Perú',
  'Chile',
  'Colombia',
  'México',
  'Ecuador',
  'Argentina',
  'España',
  'Bolivia',
  'Costa Rica',
  'Panamá',
  'Otro'
];

export const InviteCandidateModal: React.FC<InviteCandidateModalProps> = ({
  tests,
  activeTestId,
  onClose,
  onAddCandidates
}) => {
  useBodyScrollLock();

  const selectedTestId = activeTestId || tests[0]?.id || 'test-gea-001';
  const selectedTest = tests.find(t => t.id === selectedTestId) || tests[0];
  const customPosition = selectedTest?.targetPosition || 'Asesor de Operaciones';

  // Conjunto para evitar contraseñas repetidas en la misma tanda
  const generatedPasswordsSet = useRef<Set<string>>(new Set());

  // =========================================================================
  // LISTA DE CANDIDATOS EN TABLA (Modal Principal: Añadir evaluados / candidato)
  // =========================================================================
  const [candidateList, setCandidateList] = useState<StagedCandidateItem[]>([]);
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Input de archivo oculto para "Cargar archivo"
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // SUB-MODAL: Agregar nuevo candidato (Formulario con autocompletado por Correo)
  // =========================================================================
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCountry, setNewCountry] = useState<string>('Perú');
  const [newFirstName, setNewFirstName] = useState<string>('');
  const [newLastName, setNewLastName] = useState<string>('');
  const [foundDni, setFoundDni] = useState<string>('');
  const [foundPhone, setFoundPhone] = useState<string>('');
  const [isSearchingEmail, setIsSearchingEmail] = useState<boolean>(false);
  const [autoFilledNotice, setAutoFilledNotice] = useState<boolean>(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Timer para debounce de búsqueda por correo
  const searchTimeoutRef = useRef<any>(null);

  // =========================================================================
  // PANTALLA DE ÉXITO Y CREDENCIALES GENERADAS
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

  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [emailStatuses, setEmailStatuses] = useState<Record<string, 'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>>({});
  const [emailErrorDetails, setEmailErrorDetails] = useState<Record<string, string>>({});

  // =========================================================================
  // AUTOCOMPLETADO POR CORREO ELECTRÓNICO (Búsqueda en Supabase / Banco de datos)
  // =========================================================================
  const searchEmailInDatabase = async (emailToSearch: string) => {
    const clean = emailToSearch.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setIsSearchingEmail(false);
      return;
    }

    setIsSearchingEmail(true);
    try {
      // 1. Buscar en la tabla `candidatos` de Supabase
      const { data: foundCand } = await supabase
        .from('candidatos')
        .select('nombre_completo, dni, telefono, correo, whatsapp_user')
        .ilike('correo', clean)
        .order('actualizado_en', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (foundCand && foundCand.nombre_completo) {
        const rawName = foundCand.nombre_completo.trim();
        const parts = rawName.split(/\s+/);
        let fName = '';
        let lName = '';

        if (parts.length <= 1) {
          fName = rawName;
          lName = '';
        } else if (parts.length === 2) {
          fName = parts[0];
          lName = parts[1];
        } else if (parts.length === 3) {
          fName = `${parts[0]} ${parts[1]}`;
          lName = parts[2];
        } else {
          fName = parts.slice(0, 2).join(' ');
          lName = parts.slice(2).join(' ');
        }

        setNewFirstName(fName.toUpperCase());
        setNewLastName(lName.toUpperCase());
        setFoundDni(foundCand.dni || '');
        setFoundPhone(foundCand.telefono || foundCand.whatsapp_user || '');
        setAutoFilledNotice(true);
        return;
      }

      // 2. Fallback: buscar en tabla `postulantes` si existiera
      try {
        const { data: foundPost } = await supabase
          .from('postulantes')
          .select('nombre, apellido, dni, telefono, correo')
          .ilike('correo', clean)
          .limit(1)
          .maybeSingle();

        if (foundPost && (foundPost.nombre || foundPost.apellido)) {
          setNewFirstName((foundPost.nombre || '').toUpperCase());
          setNewLastName((foundPost.apellido || '').toUpperCase());
          setFoundDni(foundPost.dni || '');
          setFoundPhone(foundPost.telefono || '');
          setAutoFilledNotice(true);
          return;
        }
      } catch {}

      // 3. Fallback: buscar en caché local del navegador
      try {
        const localRaw = localStorage.getItem('evaluar_candidates_cache') || localStorage.getItem('evaluar_candidates');
        if (localRaw) {
          const list = JSON.parse(localRaw);
          if (Array.isArray(list)) {
            const match = list.find((c: any) => (c.email || c.correo || '').toLowerCase() === clean);
            if (match) {
              const fullName = (match.fullName || match.nombre_completo || `${match.firstName || ''} ${match.lastName || ''}`).trim();
              const parts = fullName.split(/\s+/);
              let fName = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
              let lName = parts.slice(Math.ceil(parts.length / 2)).join(' ');
              setNewFirstName(fName.toUpperCase());
              setNewLastName(lName.toUpperCase());
              setFoundDni(match.dni || '');
              setFoundPhone(match.phone || match.telefono || '');
              setAutoFilledNotice(true);
              return;
            }
          }
        }
      } catch {}

      // Si no se encontró en ninguna base de datos, desmarcar aviso
      setAutoFilledNotice(false);
    } catch (err) {
      console.warn('[InviteCandidateModal] Error buscando candidato por correo:', err);
    } finally {
      setIsSearchingEmail(false);
    }
  };

  const handleEmailInputChange = (val: string) => {
    setNewEmail(val);
    setAddModalError(null);
    setAutoFilledNotice(false);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.includes('@') && val.includes('.')) {
      searchTimeoutRef.current = setTimeout(() => {
        searchEmailInDatabase(val);
      }, 350);
    }
  };

  // =========================================================================
  // SUBMIT DEL SUB-MODAL: Agregar candidato a la lista
  // =========================================================================
  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError(null);

    const emailClean = newEmail.trim().toLowerCase();
    const fName = newFirstName.trim();
    const lName = newLastName.trim();

    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setAddModalError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!fName && !lName) {
      setAddModalError('Por favor ingresa el nombre o apellido del candidato.');
      return;
    }

    const fullName = `${fName} ${lName}`.trim().toUpperCase();

    // Comprobar si el correo ya está en la lista actual
    if (candidateList.some(c => c.email.toLowerCase() === emailClean)) {
      setAddModalError('Este correo electrónico ya está agregado en la lista.');
      return;
    }

    const newCandidateItem: StagedCandidateItem = {
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName,
      firstName: fName,
      lastName: lName,
      email: emailClean,
      country: newCountry || 'Perú',
      dni: foundDni || undefined,
      phone: foundPhone || undefined
    };

    setCandidateList(prev => [...prev, newCandidateItem]);

    // Limpiar formulario y cerrar sub-modal
    setNewEmail('');
    setNewFirstName('');
    setNewLastName('');
    setNewCountry('Perú');
    setFoundDni('');
    setFoundPhone('');
    setAutoFilledNotice(false);
    setAddModalError(null);
    setShowAddModal(false);
  };

  // =========================================================================
  // CARGA DE ARCHIVO EXCEL / CSV (Botón "Cargar archivo")
  // =========================================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          alert('El archivo no contiene filas con datos válidos.');
          return;
        }

        const newItems: StagedCandidateItem[] = [];
        data.forEach((row) => {
          const keys = Object.keys(row);
          const nameKey = keys.find(k => /candidato|nombre|apellidos/i.test(k));
          const emailKey = keys.find(k => /correo|email/i.test(k));
          const countryKey = keys.find(k => /pa[ií]s|country/i.test(k));
          const dniKey = keys.find(k => /dni|documento|id/i.test(k));
          const phoneKey = keys.find(k => /tel[eé]fono|phone|celular|whatsapp/i.test(k));

          const rawFullName = (nameKey ? String(row[nameKey]) : '').trim();
          const rawEmail = (emailKey ? String(row[emailKey]) : '').trim().toLowerCase();
          const rawCountry = (countryKey ? String(row[countryKey]) : '').trim() || 'Perú';
          const rawDni = (dniKey ? String(row[dniKey]) : '').replace(/\D/g, '');
          const rawPhone = (phoneKey ? String(row[phoneKey]) : '').trim();

          if (rawEmail && rawEmail.includes('@')) {
            const parts = rawFullName.split(/\s+/);
            newItems.push({
              id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              fullName: (rawFullName || rawEmail.split('@')[0]).toUpperCase(),
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || '',
              email: rawEmail,
              country: rawCountry,
              dni: rawDni || undefined,
              phone: rawPhone || undefined
            });
          }
        });

        if (newItems.length > 0) {
          setCandidateList(prev => {
            const existingEmails = new Set(prev.map(c => c.email.toLowerCase()));
            const uniqueIncoming = newItems.filter(item => !existingEmails.has(item.email.toLowerCase()));
            return [...prev, ...uniqueIncoming];
          });
        } else {
          alert('No se encontraron correos válidos en las columnas del archivo.');
        }
      } catch (err: any) {
        alert('Error al leer el archivo Excel: ' + (err?.message || 'Formato no soportado'));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Descarga de Plantilla Oficial
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Candidato': 'LUIS EDUARDO ZAPATA',
        'Correo': 'luiszap005@gmail.com',
        'País': 'Perú',
        'DNI': '78945612',
        'Teléfono': '+51 984 123 456'
      },
      {
        'Candidato': 'PAOLA JIMENA RUIZ SILVA',
        'Correo': 'paola.ruiz@ejemplo.pe',
        'País': 'Perú',
        'DNI': '46891234',
        'Teléfono': '+51 972 654 321'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'Plantilla_Candidatos_Evaluar.xlsx');
  };

  // Eliminar candidato de la lista
  const handleDeleteCandidate = (id: string) => {
    setCandidateList(prev => prev.filter(c => c.id !== id));
  };

  // =========================================================================
  // PROCESAMIENTO Y ENVÍO DE INVITACIONES (Botón "Aceptar" del modal principal)
  // =========================================================================
  const handleProcessInvitations = async () => {
    if (candidateList.length === 0) {
      alert('Por favor agrega al menos un candidato antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignedPosition = customPosition.trim() || selectedTest?.targetPosition || 'Asesor de Operaciones';

      const newCandidates: Candidate[] = candidateList.map((c, idx) => {
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const pass = generateUniqueAlphanumericPassword(generatedPasswordsSet.current);
        const dniFinal = c.dni && c.dni.replace(/\D/g, '').length >= 7
          ? c.dni.replace(/\D/g, '')
          : `${Math.floor(10000000 + Math.random() * 89999999)}`;
        const phoneFinal = c.phone || '+51 900 000 000';

        return {
          id: `cand-${Date.now()}-${idx}`,
          fullName: c.fullName.trim(),
          email: c.email.trim().toLowerCase(),
          password: pass,
          phone: phoneFinal,
          whatsappUser: phoneFinal,
          dni: dniFinal,
          position: assignedPosition,
          testId: selectedTest.id,
          invitationCode: `GEA-2026-${uniqueSuffix}`,
          invitedAt: new Date().toISOString(),
          status: 'INVITED',
          auditEventCount: 0,
          criticalFlags: 0,
          isConsentSigned: false
        };
      });

      // Guardar en la base de datos Supabase / Estado del cliente
      onAddCandidates(newCandidates);

      // Notificaciones en tiempo real
      newCandidates.forEach(cand => {
        NotificacionesService.crearNotificacion({
          tipo: 'CANDIDATO_REGISTRADO',
          titulo: 'Postulante invitado',
          mensaje: `${cand.fullName || cand.email} fue invitado al proceso "${selectedTest.title}".`,
          candidato_id: cand.id,
          proceso_id: selectedTest.id
        });
      });

      // Preparar resumen de credenciales
      setCreatedCredentials(newCandidates.map(c => ({
        name: c.fullName,
        dni: c.dni,
        email: c.email,
        phone: c.phone,
        whatsappUser: c.whatsappUser || c.phone,
        password: c.password || '',
        position: c.position
      })));

      // Envío de correos oficiales con enlace de producción
      const origin = 'https://evaluar-gea.vercel.app';
      const initialStatuses: Record<string, 'IDLE' | 'SENDING' | 'SENT' | 'ERROR'> = {};
      newCandidates.forEach(cand => {
        if (cand.email && cand.email.includes('@')) {
          initialStatuses[cand.dni] = 'SENDING';
        }
      });
      setEmailStatuses(initialStatuses);

      newCandidates.forEach(cand => {
        if (cand.email && cand.email.includes('@')) {
          const directLoginUrl = `${origin}/login?code=${encodeURIComponent(cand.invitationCode)}&dni=${encodeURIComponent(cand.dni)}&email=${encodeURIComponent(cand.email)}`;
          EmailInvitationService.sendInvitationEmail({
            to: cand.email,
            candidateName: cand.fullName,
            dni: cand.dni,
            processTitle: assignedPosition,
            accessCode: cand.invitationCode,
            password: cand.password,
            durationMinutes: selectedTest?.totalDurationMinutes || 45,
            customLoginUrl: directLoginUrl
          }).then(res => {
            setEmailStatuses(prev => ({
              ...prev,
              [cand.dni]: res.success ? 'SENT' : 'ERROR'
            }));
            if (!res.success && res.error) {
              setEmailErrorDetails(prev => ({ ...prev, [cand.dni]: res.error || 'Error de envío' }));
            }
          }).catch(err => {
            console.warn('[InviteCandidateModal] Error enviando correo:', err);
            setEmailStatuses(prev => ({
              ...prev,
              [cand.dni]: 'ERROR'
            }));
            setEmailErrorDetails(prev => ({ ...prev, [cand.dni]: err?.message || 'Error de conexión' }));
          });
        }
      });
    } catch (err: any) {
      console.error('[InviteCandidateModal] Error al procesar invitaciones:', err);
      alert('Ocurrió un error al procesar las invitaciones: ' + (err?.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar accesos para WhatsApp
  const handleCopyAllCredentials = () => {
    if (!createdCredentials) return;
    const origin = 'https://evaluar-gea.vercel.app';
    const lines = createdCredentials.map((c, i) => 
      `${i + 1}. *${c.name}*\n   DNI: ${c.dni}\n   WhatsApp: ${c.whatsappUser}\n   Correo: ${c.email}\n   Contraseña: ${c.password}\n   Puesto: ${c.position}\n   Acceso: ${origin}/login?dni=${c.dni}\n`
    ).join('\n');

    const text = `*INVITACIÓN OFICIAL A EVALUACIÓN LABORAL - GEA PERÚ*\nCargo: *${customPosition}*\n\n${lines}\n_Por favor ingrese al enlace e inicie sesión con su DNI o correo y su contraseña asignada._`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Descargar Excel con accesos
  const handleDownloadCredentialsExcel = () => {
    if (!createdCredentials) return;
    const origin = 'https://evaluar-gea.vercel.app';
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

  // Paginación de la tabla
  const totalItems = candidateList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentTableRows = candidateList.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      
      {/* ===================================================================== */}
      {/* MODAL PRINCIPAL: AÑADIR EVALUADOS / CANDIDATO (Imagen 1)              */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 sm:p-7 relative border border-slate-100 flex flex-col justify-between max-h-[92vh]">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <h3 className="font-bold text-lg sm:text-xl text-slate-800">
              Añadir evaluados / candidato
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtítulo con link de descarga de plantilla */}
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Descarga la plantilla para cargar candidatos desde{' '}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-[#6355A4] font-semibold underline hover:text-[#524493] cursor-pointer"
            >
              aquí
            </button>
          </p>

          {/* Botones de acción: Agregar Candidato y Cargar Archivo */}
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
                setAddModalError(null);
                setAutoFilledNotice(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#6355A4]" />
              <span>Agregar Candidato</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#6355A4]" />
              <span>Cargar archivo</span>
            </button>

            {/* Input de archivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>

          {/* Tabla de Candidatos (Imagen 1) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-700">
                    <th className="py-2.5 px-4 font-bold">Candidato</th>
                    <th className="py-2.5 px-4 font-bold">Correo</th>
                    <th className="py-2.5 px-4 font-bold">País</th>
                    <th className="py-2.5 px-4 font-bold w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentTableRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                        No hay candidatos en la lista. Haz clic en <strong>Agregar Candidato</strong> o <strong>Cargar archivo</strong> para añadirlos.
                      </td>
                    </tr>
                  ) : (
                    currentTableRows.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800 uppercase">
                          {item.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.email}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.country || 'Perú'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCandidate(item.id)}
                            className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar candidato"
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

          {/* Paginación de la tabla */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-1 mb-2">
            <div className="flex items-center gap-2">
              <span>Candidatos por página</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-md px-2 py-0.5 text-xs bg-white text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span>
                {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0-0 of 0'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-600"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal Principal */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={handleProcessInvitations}
            disabled={candidateList.length === 0 || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#6355A4] hover:bg-[#524493] text-white font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Enviando invitaciones...' : 'Aceptar'}
          </button>
        </div>

        {/* =================================================================== */}
        {/* SUB-MODAL FLOTANTE: AGREGAR NUEVO CANDIDATO (Imagen 2)               */}
        {/* =================================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-7 relative border border-slate-100 animate-in zoom-in-95 duration-200">
              
              {/* Header Sub-modal */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-base sm:text-lg text-slate-800">
                  Agregar nuevo candidato
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleAddCandidateSubmit} className="space-y-4 pt-4">
                
                {/* 1. Correo electrónico con Búsqueda Automática */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => handleEmailInputChange(e.target.value)}
                      placeholder="example@evaluar.com"
                      autoFocus
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200"
                    />
                    {isSearchingEmail && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#6355A4] absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {autoFilledNotice && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Encontrado en banco de datos (Nombre y Apellido autocompletados)</span>
                    </p>
                  )}
                </div>

                {/* 2. País */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    País
                  </label>
                  <div className="relative">
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 cursor-pointer appearance-none pr-9"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Nombre y Apellido (2 columnas) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="Nombre"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Apellido"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                {/* Error de validación si hubiera */}
                {addModalError && (
                  <p className="text-xs text-rose-600 font-medium">
                    {addModalError}
                  </p>
                )}

                {/* Footer Sub-modal */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#6355A4] hover:bg-[#524493] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Aceptar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL DE RESULTADO: CREDENCIALES EMITIDAS                           */}
        {/* =================================================================== */}
        {createdCredentials && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
              
              <div className="text-center p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="font-extrabold text-lg text-emerald-950">
                  ¡{createdCredentials.length} Postulante(s) Guardados e Invitados con Éxito!
                </h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-lg mx-auto">
                  Las credenciales han sido generadas y los correos oficiales han sido despachados.
                </p>
              </div>

              {/* Botones de acción rápida */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyAllCredentials}
                  className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{copiedAll ? '¡Copiado para WhatsApp!' : 'Copiar Todos (WhatsApp)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCredentialsExcel}
                  className="py-2.5 px-4 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Descargar Excel</span>
                </button>
              </div>

              {/* Lista de credenciales */}
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-3 bg-slate-50/60 divide-y divide-slate-100">
                {createdCredentials.map((cred, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 uppercase">{cred.name}</p>
                      <p className="text-slate-500">{cred.email} • DNI: {cred.dni}</p>
                    </div>
                    <span className="font-mono bg-purple-50 text-[#6355A4] px-2 py-1 rounded-lg border border-purple-200 font-bold text-[11px]">
                      {cred.password}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botón cerrar */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#6355A4] hover:bg-[#524493] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Finalizar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
