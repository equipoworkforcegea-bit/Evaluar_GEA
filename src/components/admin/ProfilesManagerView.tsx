import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { EvaluationTest, Candidate } from '../../types';
import { 
  User, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Sliders, 
  Copy, 
  Check, 
  Rocket, 
  MoreVertical, 
  Star, 
  Download, 
  Eye, 
  Edit3, 
  Ban, 
  UserCheck, 
  Megaphone, 
  GraduationCap, 
  SlidersHorizontal,
  X,
  MinusCircle,
  CheckCircle2
} from 'lucide-react';

interface ProfilesManagerViewProps {
  tests: EvaluationTest[];
  candidates: Candidate[];
  onToggleActive: (testId: string) => void;
  onCreateNewProfile: () => void;
  onSelectTest: (testId: string) => void;
  onLaunchProcessForProfile?: (profileId: string) => void;
}

export const ProfilesManagerView: React.FC<ProfilesManagerViewProps> = ({
  tests: initialTests,
  candidates,
  onToggleActive,
  onCreateNewProfile,
  onSelectTest,
  onLaunchProcessForProfile
}) => {
  const [tests, setTests] = useState<EvaluationTest[]>(initialTests);

  useEffect(() => {
    setTests(initialTests);
  }, [initialTests]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnlyActive, setFilterOnlyActive] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [detailModalTest, setDetailModalTest] = useState<EvaluationTest | null>(null);
  const [editModalTest, setEditModalTest] = useState<EvaluationTest | null>(null);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (testId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Duplicate profile
  const handleDuplicate = (test: EvaluationTest) => {
    const copy: EvaluationTest = {
      ...test,
      id: `test-gea-${Date.now().toString(36)}`,
      code: `${test.code}-COPY`,
      title: `${test.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTests(prev => [copy, ...prev]);
    setActiveMenuId(null);
    showToast(`✓ Perfil duplicado: "${copy.title}"`);
  };

  // Save edited profile
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalTest) return;
    setTests(prev => prev.map(t => t.id === editModalTest.id ? editModalTest : t));
    showToast(`✓ Cambios guardados para: "${editModalTest.title}"`);
    setEditModalTest(null);
  };

  // CopilotAI profile generation
  const handleCopilotGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim()) return;

    const roleName = copilotPrompt.trim();
    const newTest: EvaluationTest = {
      id: `test-gea-copilot-${Date.now().toString(36)}`,
      code: `GEA-AI-${roleName.slice(0, 3).toUpperCase()}-2026`,
      title: roleName.toUpperCase(),
      targetPosition: roleName,
      description: `Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa. Responsabilidades para ${roleName}.`,
      instructions: 'Lea cuidadosamente cada sección. La prueba evalúa razonamiento y competencias laborales.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalDurationMinutes: 45,
      candidateCount: 0,
      completedCount: 0,
      averageScore: 0,
      launchedBy: 'CopilotAI • Tania León',
      startDate: new Date().toLocaleDateString('es-PE'),
      endDate: '31/12/2026',
      processStatus: 'LANZADO',
      profileName: roleName,
      hiredCount: 0,
      inProgressCount: 0,
      selectedCompetencies: [
        'Orientación a Resultados & Eficiencia',
        'Autorregulación Emocional bajo Presión',
        'Toma de Decisiones en Contingencias',
        'Atención al Cliente & Empatía'
      ],
      stages: [
        {
          id: 'STAGE_1',
          category: 'PSYCHOLOGICAL',
          name: 'Etapa 1: Razonamiento & Habilidad Cognitiva',
          description: 'Aptitud analítica y resolución de problemas',
          durationMinutes: 15,
          questionCount: 8,
          weightPercent: 35,
          isEnabled: true
        },
        {
          id: 'STAGE_2',
          category: 'EMOTIONAL',
          name: 'Etapa 2: Clima y Regulación Emocional',
          description: 'Manejo de frustración y resiliencia',
          durationMinutes: 15,
          questionCount: 8,
          weightPercent: 30,
          isEnabled: true
        },
        {
          id: 'STAGE_3',
          category: 'WORK_CASES',
          name: 'Etapa 3: Casos Simulados del Puesto',
          description: 'Criterio operativo en situaciones críticas',
          durationMinutes: 15,
          questionCount: 4,
          weightPercent: 35,
          isEnabled: true
        }
      ]
    };

    setTests(prev => [newTest, ...prev]);
    setShowCopilotModal(false);
    setCopilotPrompt('');
    showToast(`✓ Nuevo perfil generado con IA: "${newTest.title}"`);
  };

  // Export profiles to Excel
  const handleExportProfiles = () => {
    const data = filteredTests.map(t => ({
      'Código': t.code,
      'Nombre del Perfil': t.title,
      'Puesto Objetivo': t.targetPosition,
      'Descripción del Puesto': t.description,
      'Duración (Minutos)': t.totalDurationMinutes,
      'Cantidad de Etapas': t.stages.length,
      'Competencias': t.selectedCompetencies?.join(', ') || 'N/A',
      'Estado para Postulantes': t.isActive ? 'ACTIVO' : 'PAUSADO',
      'Lanzado Por': t.launchedBy || 'Tania León',
      'Vigencia': `${t.startDate || '28/09/2026'} al ${t.endDate || '01/03/2027'}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Perfiles');
    XLSX.writeFile(workbook, `Listado_Perfiles_GEA_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filter tests
  const filteredTests = tests.filter(test => {
    if (filterOnlyActive && !test.isActive) return false;
    if (filterFavorites && !favorites.includes(test.id)) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = test.title.toLowerCase().includes(q);
      const matchCode = test.code.toLowerCase().includes(q);
      const matchPos = test.targetPosition.toLowerCase().includes(q);
      const matchDesc = (test.description || '').toLowerCase().includes(q);
      return matchTitle || matchCode || matchPos || matchDesc;
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in text-zinc-900 dark:text-zinc-100 font-sans pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in border border-zinc-700 dark:border-zinc-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER (EXACT REPLICA FROM SCREENSHOT EVALUAR)                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-[#1F2A5E] stroke-[1.8]" />
            <h1 className="text-2xl font-bold text-[#242236] dark:text-white tracking-tight">
              Listado de perfiles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Aquí puedes verificar perfiles existentes, crearlos, editarlos y utilizarlos para lanzar procesos.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button: Exportar */}
          <button
            type="button"
            onClick={handleExportProfiles}
            className="px-4 py-2 rounded-xl border border-[#2F5BA8] text-[#2F5BA8] hover:bg-[#2F5BA8]/10 font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Exportar</span>
          </button>

          {/* Button: Crear con CopilotAi */}
          <button
            type="button"
            onClick={() => setShowCopilotModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2F5BA8] hover:bg-[#254A8A] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-98"
          >
            <Sparkles className="w-4 h-4 fill-white/20" />
            <span>Crear con CopilotAi</span>
          </button>

          {/* Button: Creación manual */}
          <button
            type="button"
            onClick={onCreateNewProfile}
            className="px-4 py-2 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-98"
          >
            <Sliders className="w-4 h-4 stroke-[2]" />
            <span>Creación manual</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-FILTERS ROW (Star button, Activo pill)                             */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 pt-1">
        {/* Star favorites filter */}
        <button
          type="button"
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`w-9 h-9 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
            filterFavorites
              ? 'border-amber-400 bg-amber-50 text-amber-500 shadow-2xs'
              : 'border-zinc-200 bg-white text-zinc-400 hover:text-amber-500 shadow-2xs'
          }`}
          title="Ver favoritos"
        >
          <Star className={`w-4 h-4 ${filterFavorites ? 'fill-amber-400 text-amber-400' : 'text-amber-400 stroke-[1.8]'}`} />
        </button>

        {/* Activo filter pill */}
        <button
          type="button"
          onClick={() => setFilterOnlyActive(!filterOnlyActive)}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-normal flex items-center gap-2 cursor-pointer transition-colors shadow-2xs ${
            filterOnlyActive
              ? 'border-[#1F2A5E] bg-[#1F2A5E] text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span>Activo</span>
          {filterOnlyActive && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL WIDTH SEARCH BAR                                                  */}
      {/* ========================================================================= */}
      <div className="relative">
        <div className="w-full flex items-center border border-zinc-200 rounded-xl bg-white px-3.5 py-2.5 shadow-2xs">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Busca por nombre del perfil..."
            className="w-full text-xs sm:text-sm text-zinc-700 placeholder:text-zinc-400 outline-hidden bg-transparent"
          />
          <div className="flex items-center gap-2.5 text-zinc-400 shrink-0 pl-2">
            <Search className="w-4 h-4 cursor-pointer hover:text-zinc-600" />
            <div className="w-[1px] h-4 bg-zinc-200" />
            <Filter className="w-4 h-4 cursor-pointer hover:text-zinc-600" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LISTADO DE PERFILES (CARDS MATCHING EXACT SCREENSHOT)                   */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {filteredTests.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <User className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              No se encontraron perfiles con el criterio seleccionado
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Prueba limpiando el buscador o los filtros de favoritos y estado activo.
            </p>
          </div>
        ) : (
          filteredTests.map((test) => {
            const isFav = favorites.includes(test.id);
            const isPending = test.processStatus === 'BORRADOR' || test.title.includes('BORRADOR');

            return (
              <div
                key={test.id}
                className="p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative"
              >
                {/* 1. TOP STATUS LINE (Completo | Modificado OR Pendiente + Megaphone) */}
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <span className="flex items-center gap-1.5 text-rose-500 font-normal text-xs">
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Pendiente</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-zinc-600 font-normal text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Completo | Modificado:</span>
                      </span>
                    )}
                  </div>

                  {/* Megaphone circular icon */}
                  <div 
                    className="w-7 h-7 rounded-full bg-[#E9EDF6] text-[#2F5BA8] flex items-center justify-center cursor-pointer hover:bg-[#DDE2EF] transition-colors"
                    title="Comunicados del perfil"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 2. TITLE LINE + RIGHT ACTIONS */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 
                      onClick={() => onSelectTest(test.id)}
                      className="font-bold text-base text-[#2F5BA8] tracking-tight hover:underline cursor-pointer"
                    >
                      {test.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(test.id, e)}
                      className="cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                      title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-amber-400 stroke-[1.8]'}`} />
                    </button>
                  </div>

                  {/* Right Actions: Lanzar proceso + Activar + Three dots */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => onToggleActive(test.id)}
                        className="px-4 py-1.5 rounded-xl border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Activar perfil</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onLaunchProcessForProfile ? onLaunchProcessForProfile(test.id) : onSelectTest(test.id)}
                        className="px-4 py-1.5 rounded-xl border border-[#2F5BA8] text-[#2F5BA8] hover:bg-[#2F5BA8]/5 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Rocket className="w-3.5 h-3.5 text-[#2F5BA8]" />
                        <span>Lanzar proceso</span>
                      </button>
                    )}

                    {/* Three dots button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === test.id ? null : test.id);
                        }}
                        className="w-8 h-8 rounded-xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                        title="Opciones de perfil"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === test.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-9 z-40 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 text-xs animate-in fade-in"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setDetailModalTest(test);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <Eye className="w-4 h-4 text-zinc-500" />
                            <span>Ver detalle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditModalTest(test);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <Edit3 className="w-4 h-4 text-zinc-500" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onToggleActive(test.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <Ban className="w-4 h-4 text-zinc-500" />
                            <span>{test.isActive ? 'Desactivar perfil' : 'Activar perfil'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`✓ Perfil "${test.title}" habilitado para Hiring Managers.`);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <UserCheck className="w-4 h-4 text-zinc-500" />
                            <span>Activar para HM</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(test)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <Copy className="w-4 h-4 text-zinc-500" />
                            <span>Duplicar perfil</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. DESCRIPTION LINE */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-1 mt-1">
                  {test.description || 'Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.'}
                </p>

                {/* 4. BADGES ROW (✓ Activo, Nivel: Medio, DISC wheel, Green icon) */}
                <div className="flex items-center gap-2 mt-3 pt-0.5 text-xs">
                  {/* Badge: Activo */}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] text-[11px] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Activo</span>
                  </span>

                  {/* Badge: Nivel: Medio */}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[11px] font-semibold">
                    Nivel: Medio
                  </span>

                  {/* DISC 4-Color wheel icon */}
                  <div 
                    className="w-4 h-4 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 border border-zinc-200 shadow-2xs shrink-0 cursor-help" 
                    title="Matriz Conductual DISC"
                  >
                    <span className="bg-[#EF4444]" />
                    <span className="bg-[#F59E0B]" />
                    <span className="bg-[#10B981]" />
                    <span className="bg-[#3B82F6]" />
                  </div>

                  {/* Green Graduation / Competencies icon */}
                  <div 
                    className="p-1 rounded bg-[#DCFCE7] text-[#16A34A] shrink-0 cursor-help"
                    title="Competencias laborales asociadas"
                  >
                    <GraduationCap className="w-3 h-3" />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VER DETALLE DEL PERFIL                                           */}
      {/* ========================================================================= */}
      {detailModalTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A5E]">
                  Ficha Técnica del Perfil
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {detailModalTest.title}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Código: {detailModalTest.code} • Puesto: {detailModalTest.targetPosition}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalTest(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Descripción del Puesto */}
              <div>
                <span className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                  Descripción del Puesto & Perfil
                </span>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {detailModalTest.description || 'Sin descripción detallada registrada.'}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 block">Duración Estimada</span>
                  <strong className="text-zinc-800 dark:text-zinc-200 text-sm font-mono">
                    {detailModalTest.totalDurationMinutes} minutos
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-400 block">Estado Actual</span>
                  <strong className={detailModalTest.isActive ? 'text-emerald-600' : 'text-zinc-500'}>
                    {detailModalTest.isActive ? '🟢 Activo para Postulantes' : '🔴 Pausado'}
                  </strong>
                </div>
              </div>

              {/* Competencias */}
              <div>
                <span className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                  Competencias a Evaluar ({detailModalTest.selectedCompetencies?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModalTest.selectedCompetencies?.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#1F2A5E]/10 text-[#1F2A5E] border border-[#1F2A5E]/20 text-xs font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Etapas configuradas */}
              <div>
                <span className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                  Etapas de Evaluación ({detailModalTest.stages.length})
                </span>
                <div className="space-y-2">
                  {detailModalTest.stages.map((stg) => (
                    <div key={stg.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{stg.name}</div>
                        <div className="text-[11px] text-zinc-400">{stg.description}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] shrink-0 pl-2">
                        <div>{stg.durationMinutes} min</div>
                        <div className="text-[#1F2A5E] font-bold">{stg.weightPercent}% peso</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalTest(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PERFIL                                                    */}
      {/* ========================================================================= */}
      {editModalTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            
            <form onSubmit={handleSaveEdit}>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A5E]">
                    Editar Perfil
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Modificar Información del Perfil
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalTest(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Título del Perfil *
                  </label>
                  <input
                    type="text"
                    required
                    value={editModalTest.title}
                    onChange={e => setEditModalTest({ ...editModalTest, title: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Puesto Objetivo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editModalTest.targetPosition}
                    onChange={e => setEditModalTest({ ...editModalTest, targetPosition: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Descripción del Puesto & Requisitos *
                  </label>
                  <textarea
                    rows={4}
                    value={editModalTest.description}
                    onChange={e => setEditModalTest({ ...editModalTest, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalTest(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREAR CON COPILOTAI                                              */}
      {/* ========================================================================= */}
      {showCopilotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            <form onSubmit={handleCopilotGenerate}>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-gradient-to-r from-[#1F2A5E]/10 to-[#2F5BA8]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#2F5BA8] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Crear Perfil con CopilotAi
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Indica el nombre del cargo o funciones clave para generar el perfil y competencias automáticamente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCopilotModal(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                    Puesto o Perfil a Crear *
                  </label>
                  <input
                    type="text"
                    required
                    value={copilotPrompt}
                    onChange={e => setCopilotPrompt(e.target.value)}
                    placeholder="Ej. Coordinador de Fidelización y Retención Postpago"
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#1F2A5E] outline-hidden font-medium"
                    autoFocus
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>La IA configurará automáticamente:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    <li>Descripción completa y responsabilidades del puesto</li>
                    <li>Competencias psicométricas sugeridas según el cargo</li>
                    <li>3 etapas calibradas (Cognitiva, Emocional y Casos Simulados)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCopilotModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2F5BA8] hover:bg-[#254A8A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-colors"
                >
                  <Sparkles className="w-4 h-4 fill-white/20" />
                  <span>Generar Perfil</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
