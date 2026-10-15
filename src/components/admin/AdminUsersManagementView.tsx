import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  UserCog, 
  Plus, 
  Search, 
  RefreshCw, 
  Download, 
  Trash2, 
  KeyRound, 
  Pencil, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Shield, 
  Mail, 
  AtSign, 
  Briefcase, 
  X, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { 
  AdminUserService, 
  AdminUserRecord, 
  AdminRole, 
  CreateAdminUserPayload, 
  UpdateAdminUserPayload 
} from '../../services/adminUserService';
import { AuthSession } from '../../types';

interface AdminUsersManagementViewProps {
  session?: AuthSession;
  onBackToProcesses?: () => void;
}

const ROLE_LABELS: Record<AdminRole, { label: string; badgeClass: string }> = {
  SUPER_ADMIN: {
    label: 'Super Administrador',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  ADMIN: {
    label: 'Administrador',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  ANALISTA_RECLT: {
    label: 'Analista de Reclutamiento',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  RECLUTADOR: {
    label: 'Reclutador',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  }
};

const SUGGESTED_POSITIONS = [
  'Super Administrador & Creador del Sistema',
  'Administrador General del Sistema',
  'Líder de Selección & Talento',
  'Analista Senior de Reclutamiento y Selección',
  'Analista de Selección y Evaluación',
  'Reclutador de Operaciones & BPO',
  'Especialista en Evaluación Psicotécnica'
];

function generateSecureRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'Gea';
  for (let i = 0; i < 7; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass + '!';
}

export const AdminUsersManagementView: React.FC<AdminUsersManagementViewProps> = ({
  session
}) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserRecord | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUserRecord | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);

  // Formulario Crear Usuario
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState(() => generateSecureRandomPassword());
  const [createRole, setCreateRole] = useState<AdminRole>('ANALISTA_RECLT');
  const [createPosition, setCreatePosition] = useState('Analista de Reclutamiento y Selección');
  const [showCreatePassword, setShowCreatePassword] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Formulario Editar Usuario
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('ADMIN');
  const [editPosition, setEditPosition] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Formulario Recuperar Contraseña
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [copiedNewPassword, setCopiedNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Toast de notificación
  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Cargar usuarios desde Supabase
  const loadUsers = async () => {
    try {
      const data = await AdminUserService.listUsers();
      setUsers(data);
    } catch (err: any) {
      console.warn('[AdminUsersManagementView] Error cargando usuarios:', err);
      showToast('⚠️ No se pudieron cargar los usuarios de Supabase.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // Suscripción Realtime para la tabla usuarios_admin
    const channel = supabase
      .channel('usuarios_admin_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usuarios_admin' },
        () => {
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Filtro de estado
      if (statusFilter === 'ACTIVOS' && !u.is_active) return false;
      if (statusFilter === 'INACTIVOS' && u.is_active) return false;

      // Filtro de rol
      if (roleFilter !== 'TODOS' && u.role !== roleFilter) return false;

      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (u.full_name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchUsername = (u.username || '').toLowerCase().includes(q);
        const matchPosition = (u.position || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchUsername || matchPosition;
      }

      return true;
    });
  }, [users, statusFilter, roleFilter, searchTerm]);

  // Métricas
  const totalCount = users.length;
  const activeCount = users.filter(u => u.is_active).length;
  const superAdminCount = users.filter(u => u.role === 'SUPER_ADMIN').length;
  const recruiterCount = users.filter(u => u.role === 'RECLUTADOR' || u.role === 'ANALISTA_RECLT').length;

  // Manejador Cambiar Estado Activo / Inactivo
  const handleToggleUserActive = async (user: AdminUserRecord) => {
    const nextState = !user.is_active;
    try {
      // Actualización optimista local
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: nextState } : u));
      await AdminUserService.toggleActive(user.id, nextState);
      showToast(`✓ Estado de ${user.full_name} cambiado a ${nextState ? 'ACTIVO' : 'INACTIVO'}.`);
    } catch (err: any) {
      // Revertir en caso de error
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: user.is_active } : u));
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (user: AdminUserRecord) => {
    setUserToEdit(user);
    setEditFullName(user.full_name || '');
    setEditEmail(user.email || '');
    setEditUsername(user.username || '');
    setEditRole(user.role || 'ADMIN');
    setEditPosition(user.position || '');
    setEditIsActive(user.is_active ?? true);
    setEditError(null);
  };

  // Guardar Edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setEditError(null);

    if (!editFullName.trim()) {
      setEditError('El nombre completo es obligatorio.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditError('Ingrese un correo electrónico válido.');
      return;
    }
    if (!editUsername.trim()) {
      setEditError('El nombre de usuario es obligatorio.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const updated = await AdminUserService.updateUser(userToEdit.id, {
        full_name: editFullName,
        email: editEmail,
        username: editUsername,
        role: editRole,
        position: editPosition,
        is_active: editIsActive
      });

      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setUserToEdit(null);
      showToast(`✓ Usuario ${updated.full_name} actualizado exitosamente.`);
    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar el usuario.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Abrir modal Recuperar / Restablecer Contraseña
  const handleOpenResetPassword = (user: AdminUserRecord) => {
    setUserToResetPassword(user);
    setNewPasswordInput(generateSecureRandomPassword());
    setResetError(null);
    setCopiedNewPassword(false);
  };

  // Guardar Nueva Contraseña
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword) return;
    setResetError(null);

    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      await AdminUserService.updatePassword(userToResetPassword.id, newPasswordInput);
      setUserToResetPassword(null);
      showToast(`✓ Contraseña restablecida con éxito para ${userToResetPassword.full_name}.`);
    } catch (err: any) {
      setResetError(err.message || 'Error al restablecer contraseña.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  // Abrir modal Crear Usuario
  const handleOpenCreateModal = () => {
    setCreateFullName('');
    setCreateEmail('');
    setCreateUsername('');
    setCreatePassword(generateSecureRandomPassword());
    setCreateRole('ANALISTA_RECLT');
    setCreatePosition('Analista de Reclutamiento y Selección');
    setCreateError(null);
    setShowCreateModal(true);
  };

  // Auto-sugerir username al escribir correo
  const handleEmailChange = (val: string) => {
    setCreateEmail(val);
    if (!createUsername || createUsername === createEmail.split('@')[0]) {
      const suggested = val.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
      setCreateUsername(suggested);
    }
  };

  // Submit Crear Nuevo Usuario
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const cleanFullName = createFullName.trim();
    const cleanEmail = createEmail.trim().toLowerCase();
    const cleanUsername = createUsername.trim().toLowerCase();
    const cleanPassword = createPassword.trim();

    if (!cleanFullName || cleanFullName.split(/\s+/).length < 2) {
      setCreateError('Ingrese al menos dos palabras (nombre y apellido).');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCreateError('Ingrese un correo electrónico válido.');
      return;
    }
    if (!cleanUsername) {
      setCreateError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const newUser = await AdminUserService.createUser({
        full_name: cleanFullName,
        email: cleanEmail,
        username: cleanUsername,
        password: cleanPassword,
        role: createRole,
        position: createPosition || 'Especialista de Selección',
        is_active: true
      });

      setUsers(prev => [newUser, ...prev]);
      setShowCreateModal(false);
      showToast(`✓ Usuario ${newUser.full_name} creado con éxito en Supabase.`);
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear usuario en la base de datos.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Confirmar Eliminación de Usuario
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await AdminUserService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      showToast(`✓ Usuario ${userToDelete.full_name} eliminado permanentemente.`);
    } catch (err: any) {
      alert('Error al eliminar usuario: ' + err.message);
    } finally {
      setUserToDelete(null);
    }
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const dataToExport = filteredUsers.map(u => ({
      'ID': u.id,
      'Nombre Completo': u.full_name,
      'Usuario': u.username,
      'Correo Electrónico': u.email,
      'Rol': ROLE_LABELS[u.role]?.label || u.role,
      'Posición / Cargo': u.position,
      'Estado': u.is_active ? 'Activo' : 'Inactivo',
      'Último Inicio de Sesión': u.last_login_at ? new Date(u.last_login_at).toLocaleString('es-PE') : 'Nunca',
      'Fecha Creación': u.created_at ? new Date(u.created_at).toLocaleString('es-PE') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios_Admin');
    XLSX.writeFile(workbook, `GEA_Usuarios_Admin_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('✓ Nómina de usuarios exportada a Excel.');
  };

  return (
    <div className="space-y-5 animate-in fade-in font-sans">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1F2A5E] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#2F5BA8]">
          <CheckCircle2 className="w-4 h-4 text-[#2FA58B]" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* TOP HEADER: Icon + Title + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-[#1F2A5E] text-white shadow-xs">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1F2A5E] dark:text-zinc-100 tracking-tight font-sans">
              Administrar Usuarios
            </h1>
            <p className="text-xs text-[#6B7494] dark:text-zinc-400 mt-0.5">
              Control de accesos, roles, estados y credenciales en la tabla <code className="font-mono bg-[#E9EDF6] dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px] text-[#1F2A5E] dark:text-[#7DA4FF]">usuarios_admin</code> de Supabase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              loadUsers();
            }}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#1F2A5E] dark:text-zinc-300 hover:bg-[#F8FAFC] cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refrescar usuarios"
          >
            <RefreshCw className={`w-4 h-4 text-[#2F5BA8] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-800 text-[#1F2A5E] dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-[#F8FAFC] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#2FA58B]" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          {/* Create User Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1F2A5E] to-[#2F5BA8] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Usuarios */}
        <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">Total Usuarios</p>
            <p className="text-2xl font-black text-[#1F2A5E] dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E9EDF6] dark:bg-zinc-800 flex items-center justify-center text-[#1F2A5E] dark:text-[#7DA4FF]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Activos */}
        <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">Usuarios Activos</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Super Administradores */}
        <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">Super Administradores</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{superAdminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Reclutadores / Analistas */}
        <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">Reclutadores & Analistas</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{recruiterCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7494] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo, usuario o posición..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-800/60 text-xs text-[#161C3A] dark:text-zinc-200 placeholder:text-[#6B7494] focus:outline-none focus:border-[#2F5BA8] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter & Status Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-800 text-xs font-semibold text-[#1F2A5E] dark:text-zinc-200 cursor-pointer focus:outline-none focus:border-[#2F5BA8]"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="SUPER_ADMIN">Super Administrador</option>
            <option value="ADMIN">Administrador</option>
            <option value="ANALISTA_RECLT">Analista de Reclutamiento</option>
            <option value="RECLUTADOR">Reclutador</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] dark:bg-zinc-800 border border-[#DDE2EF] dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setStatusFilter('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'TODOS'
                  ? 'bg-white dark:bg-zinc-900 text-[#1F2A5E] dark:text-white shadow-2xs'
                  : 'text-[#6B7494] hover:text-[#161C3A]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ACTIVOS'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-2xs'
                  : 'text-[#6B7494] hover:text-[#161C3A]'
              }`}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('INACTIVOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'INACTIVOS'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 shadow-2xs'
                  : 'text-[#6B7494] hover:text-[#161C3A]'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* USERS TABLE & LIST */}
      <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-[#2F5BA8] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1F2A5E] dark:text-white">Cargando usuarios de Supabase...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center px-4">
            <UserX className="w-12 h-12 text-[#9AA5C4] mx-auto mb-3 opacity-60" />
            <p className="text-base font-bold text-[#1F2A5E] dark:text-white">No se encontraron usuarios</p>
            <p className="text-xs text-[#6B7494] mt-1 max-w-sm mx-auto">
              {searchTerm || roleFilter !== 'TODOS' || statusFilter !== 'TODOS'
                ? 'Intenta ajustar los filtros o el término de búsqueda.'
                : 'Aún no hay usuarios creados en la tabla usuarios_admin.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('TODOS');
                  setStatusFilter('TODOS');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-[#2F5BA8] hover:bg-[#E9EDF6] cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDE2EF] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-800/40 text-[11px] font-bold text-[#6B7494] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Usuario & Nombre</th>
                  <th className="py-3.5 px-4">Correo</th>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Posición / Cargo</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Último Acceso</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2EF]/70 dark:divide-zinc-800/70 text-xs">
                {filteredUsers.map((user) => {
                  const roleConfig = ROLE_LABELS[user.role] || {
                    label: user.role,
                    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  };

                  const initials = (user.full_name || 'U')
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(w => w[0]?.toUpperCase() || '')
                    .join('') || 'U';

                  return (
                    <tr 
                      key={user.id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Usuario & Nombre */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1F2A5E] to-[#2F5BA8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#161C3A] dark:text-white truncate">
                              {user.full_name}
                            </p>
                            <p className="text-[11px] font-mono text-[#6B7494] dark:text-[#9AA5C4] truncate flex items-center gap-1">
                              <AtSign className="w-3 h-3 text-[#2F5BA8]" />
                              <span>{user.username}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#161C3A] dark:text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-[#6B7494] shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleConfig.badgeClass}`}>
                          <Shield className="w-3 h-3 shrink-0" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      {/* Posición / Cargo */}
                      <td className="py-3.5 px-4">
                        <span className="text-[#6B7494] dark:text-zinc-300 font-medium">
                          {user.position || '—'}
                        </span>
                      </td>

                      {/* Estado (Toggle interactivo) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUserActive(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all active:scale-95 ${
                            user.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                          }`}
                          title={`Click para ${user.is_active ? 'desactivar' : 'activar'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          <span>{user.is_active ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>

                      {/* Último Acceso */}
                      <td className="py-3.5 px-4 text-center text-[#6B7494] dark:text-zinc-400 text-[11px]">
                        {user.last_login_at ? (
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-[#2F5BA8]" />
                            <span>{new Date(user.last_login_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Recuperar / Cambiar Contraseña */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(user)}
                            className="p-1.5 rounded-lg text-[#2F5BA8] hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                            title="Recuperar / Cambiar contraseña"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Editar Usuario */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-[#1F2A5E] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                            title="Editar información de usuario"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Eliminar Usuario */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREAR NUEVO USUARIO                                              */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="px-6 py-4.5 bg-[#1F2A5E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Crear Nuevo Usuario Administrativo</h3>
                  <p className="text-[11px] text-white/70">Guardado directo en tabla <code className="font-mono">usuarios_admin</code></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1.5">
                  <span>Nombre Completo *</span>
                  <span className="text-[10px] font-normal text-[#6B7494]">(columna: full_name)</span>
                </label>
                <input
                  type="text"
                  required
                  value={createFullName}
                  onChange={(e) => setCreateFullName(e.target.value)}
                  placeholder="Ej. Bryan Steve Ramos Medina"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                />
              </div>

              {/* Correo y Usuario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1">
                    <span>Correo Electrónico *</span>
                    <span className="text-[10px] font-normal text-[#6B7494]">(email)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="bryan@geaperu.pe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1">
                    <span>Usuario *</span>
                    <span className="text-[10px] font-normal text-[#6B7494]">(username)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="bryan.ramos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>
              </div>

              {/* Contraseña con Generador */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1">
                    <span>Contraseña de Acceso *</span>
                    <span className="text-[10px] font-normal text-[#6B7494]">(password)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateSecureRandomPassword())}
                    className="text-[11px] font-bold text-[#2F5BA8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar segura</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 font-mono text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createPassword);
                        showToast('✓ Contraseña copiada al portapapeles');
                      }}
                      className="p-1 text-zinc-400 hover:text-[#2F5BA8] cursor-pointer"
                      title="Copiar contraseña"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rol y Posición */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rol */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1">
                    <span>Rol del Usuario *</span>
                    <span className="text-[10px] font-normal text-[#6B7494]">(role)</span>
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as AdminRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs font-semibold bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrador)</option>
                    <option value="ADMIN">ADMIN (Administrador)</option>
                    <option value="ANALISTA_RECLT">ANALISTA_RECLT (Analista)</option>
                    <option value="RECLUTADOR">RECLUTADOR (Reclutador)</option>
                  </select>
                </div>

                {/* Posición */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200 flex items-center gap-1">
                    <span>Posición / Cargo</span>
                    <span className="text-[10px] font-normal text-[#6B7494]">(position)</span>
                  </label>
                  <input
                    type="text"
                    value={createPosition}
                    onChange={(e) => setCreatePosition(e.target.value)}
                    placeholder="Ej. Líder de Selección"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>
              </div>

              {/* Sugerencias de posición */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-[#6B7494] uppercase tracking-wider block mb-1.5">Sugerencias rápidas de posición:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_POSITIONS.slice(0, 4).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setCreatePosition(pos)}
                      className="px-2 py-0.5 rounded-md bg-[#E9EDF6] dark:bg-zinc-800 text-[10px] font-semibold text-[#1F2A5E] dark:text-zinc-300 hover:bg-[#2F5BA8] hover:text-white transition-colors cursor-pointer"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#DDE2EF] dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F2A5E] to-[#2F5BA8] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingCreate ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Crear Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR INFORMACIÓN DE USUARIO                                   */}
      {/* ========================================================================= */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4.5 bg-[#1F2A5E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Editar Usuario</h3>
                  <p className="text-[11px] text-white/70">{userToEdit.full_name} • @{userToEdit.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                />
              </div>

              {/* Correo y Usuario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>
              </div>

              {/* Rol y Posición */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                    Rol asignado *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs font-semibold bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrador)</option>
                    <option value="ADMIN">ADMIN (Administrador)</option>
                    <option value="ANALISTA_RECLT">ANALISTA_RECLT (Analista)</option>
                    <option value="RECLUTADOR">RECLUTADOR (Reclutador)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                    Posición / Cargo
                  </label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                </div>
              </div>

              {/* Estado Activo */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-800/60 border border-[#DDE2EF] dark:border-zinc-700">
                <div>
                  <span className="text-xs font-bold text-[#1F2A5E] dark:text-white block">Estado del Usuario</span>
                  <span className="text-[11px] text-[#6B7494]">{editIsActive ? 'El usuario tiene acceso al panel administrativo' : 'El acceso está suspendido'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    editIsActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {editIsActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Botones */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#DDE2EF] dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F2A5E] to-[#2F5BA8] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECUPERAR / CAMBIAR CONTRASEÑA                                   */}
      {/* ========================================================================= */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4.5 bg-[#1F2A5E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Recuperar / Cambiar Contraseña</h3>
                  <p className="text-[11px] text-white/70">Usuario: @{userToResetPassword.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToResetPassword(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewPassword} className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-800/60 border border-[#DDE2EF] dark:border-zinc-700 text-xs">
                <p className="font-bold text-[#1F2A5E] dark:text-white">{userToResetPassword.full_name}</p>
                <p className="text-[11px] text-[#6B7494]">{userToResetPassword.email}</p>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F2A5E] dark:text-zinc-200">
                    Nueva Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPasswordInput(generateSecureRandomPassword());
                      setCopiedNewPassword(false);
                    }}
                    className="text-[11px] font-bold text-[#2F5BA8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar nueva</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-[#DDE2EF] dark:border-zinc-700 font-mono text-xs bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#2F5BA8]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(newPasswordInput);
                        setCopiedNewPassword(true);
                        setTimeout(() => setCopiedNewPassword(false), 2000);
                      }}
                      className="p-1 text-zinc-400 hover:text-[#2F5BA8] cursor-pointer"
                      title="Copiar contraseña"
                    >
                      {copiedNewPassword ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {copiedNewPassword && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Contraseña copiada al portapapeles</span>
                </p>
              )}

              {/* Botones */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#DDE2EF] dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B7494] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F2A5E] to-[#2F5BA8] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingReset ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMAR ELIMINACIÓN DE USUARIO                                 */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-[#DDE2EF] dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-[#161C3A] dark:text-white">
              ¿Eliminar usuario administrativo?
            </h3>
            
            <p className="text-xs text-[#6B7494] dark:text-zinc-300 mt-2">
              Estás a punto de eliminar permanentemente a <strong className="text-[#161C3A] dark:text-white font-bold">{userToDelete.full_name}</strong> (<code className="font-mono">@{userToDelete.username}</code>) de la base de datos de Supabase.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 text-left">
              ⚠️ Esta acción no se puede deshacer. El usuario perderá acceso inmediato a la plataforma.
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, eliminar usuario</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
