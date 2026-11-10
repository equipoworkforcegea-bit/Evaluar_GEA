import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationTest, TestStageConfig } from '../../types';
import { generateSafeUuid, ProcessDataService } from '../../services/processDataService';
import { 
  QUESTIONNAIRE_CATALOG, 
  getQuestionsForTopic, 
  QuestionData, 
  QuestionnaireOption 
} from '../../data/questionnairesData';
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Clock, 
  Search, 
  CheckCircle2, 
  RotateCw, 
  MoreVertical, 
  X, 
  AlertCircle,
  Settings,
  FileText,
  Users,
  Award,
  Zap,
  Rocket,
  Crown,
  GraduationCap,
  MessageSquare,
  Globe,
  Heart,
  Banknote,
  BookOpen,
  ChevronRight,
  Edit3,
  Layers,
  Star
} from 'lucide-react';

export type DifficultyLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export type ComponentType = 
  | 'DISC' 
  | 'PREGUNTAS_FILTRO' 
  | 'CV' 
  | 'CONOCIMIENTOS' 
  | 'COMPETENCIAS' 
  | 'VIDEO_ENTREVISTA';

export interface ComponentItem {
  id: string;
  type: ComponentType;
  title: string;
  isComplete: boolean;
  selectedItems?: string[];
  durationMinutes: number;
  weightPercent: number;
}

export interface KnowledgeItemConfig {
  id: string;
  name: string;
  isConfigured: boolean;
  weight: number;
  difficulty: 'Personalizada' | 'Baja' | 'Media' | 'Alta';
  totalQuestions: number;
  questionsLow: number;
  maxLow: number;
  questionsMed: number;
  maxMed: number;
  questionsHigh: number;
  maxHigh: number;
  timeControl: boolean;
  minutes: number;
  scoreScale: number;
  questionOrder: 'Predefinido' | 'Aleatorio' | 'Por dificultad';
  instructions: string;
}

export interface CompetencyCategory {
  name: string;
  count: number;
  iconName: string;
  color: string;
  items: string[];
}

const DEFAULT_KNOWLEDGE_ITEMS: KnowledgeItemConfig[] = [
  {
    id: 'k1',
    name: 'Planificación estratégica',
    isConfigured: false,
    weight: 25,
    difficulty: 'Personalizada',
    totalQuestions: 20,
    questionsLow: 5,
    maxLow: 37,
    questionsMed: 10,
    maxMed: 28,
    questionsHigh: 5,
    maxHigh: 14,
    timeControl: true,
    minutes: 2,
    scoreScale: 20,
    questionOrder: 'Predefinido',
    instructions: ''
  },
  {
    id: 'k2',
    name: 'Español nivel basico',
    isConfigured: false,
    weight: 25,
    difficulty: 'Personalizada',
    totalQuestions: 20,
    questionsLow: 6,
    maxLow: 25,
    questionsMed: 10,
    maxMed: 20,
    questionsHigh: 4,
    maxHigh: 10,
    timeControl: true,
    minutes: 3,
    scoreScale: 20,
    questionOrder: 'Aleatorio',
    instructions: ''
  },
  {
    id: 'k3',
    name: 'Negociación',
    isConfigured: false,
    weight: 25,
    difficulty: 'Personalizada',
    totalQuestions: 20,
    questionsLow: 5,
    maxLow: 20,
    questionsMed: 10,
    maxMed: 30,
    questionsHigh: 5,
    maxHigh: 15,
    timeControl: true,
    minutes: 2,
    scoreScale: 20,
    questionOrder: 'Predefinido',
    instructions: ''
  },
  {
    id: 'k4',
    name: 'Psicometría',
    isConfigured: true,
    weight: 25,
    difficulty: 'Personalizada',
    totalQuestions: 20,
    questionsLow: 5,
    maxLow: 10,
    questionsMed: 10,
    maxMed: 15,
    questionsHigh: 5,
    maxHigh: 8,
    timeControl: true,
    minutes: 4,
    scoreScale: 20,
    questionOrder: 'Por dificultad',
    instructions: ''
  }
];

export const COMPETENCY_DESCRIPTIONS: Record<string, string> = {
  'Orientación al Cliente': 'Actitud genuina de comprender y atender al cliente, priorizando sus necesidades y buscando generar una experiencia positiva y de confianza en cada interacción.',
  'Integridad': 'Coherencia entre valores, principios éticos y acciones, expresándose con honestidad y responsabilidad y proyectando una conducta confiable que refuerza la credibilidad y la cultura ética de la organización.',
  'Temple y Serenidad': 'Calma sostenida para enfrentar presión o incertidumbre, respondiendo con equilibrio emocional, claridad y objetividad, y transmitiendo estabilidad al abordar desafíos o conflictos.',
  'Orientación y adaptabilidad a las ventas': 'Disposición flexible para desenvolverse con eficacia en distintos entornos comerciales, ajustando el estilo y el enfoque para conectar con el cliente y facilitar el logro de resultados.',
  'Comunicación efectiva': 'Capacidad para transmitir ideas con claridad y coherencia, ajustando el mensaje al contexto y asegurando una comprensión precisa que facilite interacciones fluidas y constructivas.'
};

export const DEFAULT_FAVORITE_COMPETENCIES = [
  'Orientación al Cliente',
  'Integridad',
  'Temple y Serenidad',
  'Orientación y adaptabilidad a las ventas',
  'Comunicación efectiva'
];

const BASE_COMPETENCY_CATEGORIES: CompetencyCategory[] = [
  {
    name: 'Relacionales',
    count: 12,
    iconName: 'Users',
    color: '#64748B',
    items: [
      'Orientación al Cliente',
      'Trabajo en equipo y colaboración',
      'Orientación a las relaciones interpersonales',
      'Establecimiento de redes de contacto (Networking)',
      'Construcción de confianza',
      'Empatía y sensibilidad social',
      'Manejo de relaciones conflictivas',
      'Colaboración interdepartamental',
      'Trabajo en entornos multiculturales',
      'Escucha activa relacional',
      'Diplomacia y tacto',
      'Fidelización de relaciones'
    ]
  },
  {
    name: 'Liderazgo',
    count: 35,
    iconName: 'Award',
    color: '#854D0E',
    items: [
      'Liderazgo de equipos',
      'Toma de decisiones estratégicas',
      'Delegación y empoderamiento',
      'Gestión del cambio organizacional',
      'Desarrollo y mentoría de talento',
      'Visión estratégica y propósito',
      'Resolución de conflictos de equipo',
      'Inspiración y motivación',
      'Conducción de reuniones eficaces',
      'Rendición de cuentas (Accountability)',
      'Liderazgo transformacional',
      'Liderazgo situacional',
      'Gestión del desempeño del equipo',
      'Capacidad de persuasión e influencia',
      'Modelado de valores y cultura',
      'Establecimiento de metas y objetivos',
      'Gestión de crisis y contingencias',
      'Desarrollo del compromiso laboral',
      'Facilitación de consenso',
      'Promoción de la innovación',
      'Supervisión de operaciones',
      'Formación de líderes sucesores',
      'Dirección por objetivos',
      'Orientación al crecimiento conjunto',
      'Evaluación del potencial humano',
      'Coaching directivo',
      'Gestión del clima laboral',
      'Autonomía en la conducción',
      'Definición de prioridades estratégicas',
      'Negociación de recursos de equipo',
      'Reconocimiento y retención de talento',
      'Protección de la equidad interna',
      'Gestión de proyectos interdisciplinarios',
      'Liderazgo remoto y virtual',
      'Integridad en el ejercicio del mando'
    ]
  },
  {
    name: 'Actitudinales',
    count: 19,
    iconName: 'Zap',
    color: '#D97706',
    items: [
      'Temple y Serenidad',
      'Proactividad e iniciativa',
      'Resiliencia y tolerancia a la frustración',
      'Compromiso organizacional',
      'Orientación al logro y superación',
      'Flexibilidad y adaptabilidad al cambio',
      'Optimismo y actitud constructiva',
      'Responsabilidad y puntualidad',
      'Ética e integridad profesional',
      'Autocontrol ante el estrés',
      'Perseverancia en metas desafiantes',
      'Curiosidad intelectual y dinamismo',
      'Disposición al servicio',
      'Apertura a nuevas ideas',
      'Energía y entusiasmo laboral',
      'Autocrítica y mejora continua',
      'Disciplina en la ejecución',
      'Humildad en el aprendizaje',
      'Consistencia de ánimo bajo presión'
    ]
  },
  {
    name: 'Valores',
    count: 10,
    iconName: 'Rocket',
    color: '#0891B2',
    items: [
      'Integridad',
      'Honestidad y transparencia',
      'Lealtad institucional',
      'Respeto por la diversidad e inclusión',
      'Sentido de justicia e imparcialidad',
      'Responsabilidad social y comunitaria',
      'Confidencialidad y discreción',
      'Excelencia y rigor profesional',
      'Equidad de trato',
      'Solidaridad y compañerismo'
    ]
  },
  {
    name: 'Administrativas',
    count: 14,
    iconName: 'Crown',
    color: '#EA580C',
    items: [
      'Planificación y organización del trabajo',
      'Gestión del tiempo y priorización',
      'Control y seguimiento de procesos',
      'Manejo de presupuesto y recursos',
      'Cumplimiento de políticas y normativas',
      'Documentación y archivo riguroso',
      'Optimización de procedimientos administrativos',
      'Gestión de compras y proveedores',
      'Elaboración de informes de gestión',
      'Auditoría y control interno',
      'Gestión de inventarios y suministros',
      'Coordinación logística y de agenda',
      'Supervisión de contratos',
      'Atención a requerimientos regulatorios'
    ]
  },
  {
    name: 'Educacional',
    count: 5,
    iconName: 'GraduationCap',
    color: '#4F46E5',
    items: [
      'Formación continua y autoaprendizaje',
      'Diseño y facilitación de capacitaciones',
      'Transferencia metodológica de conocimientos',
      'Evaluación del aprendizaje y competencias',
      'Asesoría pedagógica y acompañamiento'
    ]
  },
  {
    name: 'Cognitivas',
    count: 20,
    iconName: 'Sparkles',
    color: '#7C3AED',
    items: [
      'Razonamiento lógico y deductivo',
      'Pensamiento analítico y resolución de problemas',
      'Pensamiento crítico y discernimiento',
      'Atención al detalle y minuciosidad',
      'Síntesis y abstracción de información',
      'Creatividad e innovación aplicada',
      'Juicio cuantitativo y numérico',
      'Memoria de trabajo y concentración',
      'Pensamiento sistémico e integrado',
      'Capacidad de investigación exhaustiva',
      'Interpretación de gráficos y métricas',
      'Identificación de causas raíz',
      'Pensamiento lateral no convencional',
      'Evaluación de riesgos y escenarios',
      'Inferencia y formulación de hipótesis',
      'Agilidad mental en situaciones complejas',
      'Orientación conceptual y teórica',
      'Comprensión lectora avanzada',
      'Detección de patrones y anomalías',
      'Toma de decisiones basada en datos'
    ]
  },
  {
    name: 'Comunicacionales',
    count: 10,
    iconName: 'MessageSquare',
    color: '#16A34A',
    items: [
      'Comunicación efectiva',
      'Comunicación asertiva y clara',
      'Oratoria y presentación ejecutiva',
      'Redacción profesional estructurada',
      'Escucha activa empática',
      'Capacidad de síntesis oral',
      'Comunicación no verbal congruente',
      'Manejo de preguntas difíciles y objeciones',
      'Feedback oportuno y constructivo',
      'Comunicación en entornos de crisis'
    ]
  },
  {
    name: 'Digital',
    count: 6,
    iconName: 'Globe',
    color: '#2563EB',
    items: [
      'Alfabetización digital y herramientas ofimáticas',
      'Manejo de plataformas CRM y ERP',
      'Análisis de datos y Business Intelligence',
      'Ciberseguridad y protección de datos',
      'Trabajo colaborativo en la nube',
      'Adopción de herramientas de Inteligencia Artificial'
    ]
  },
  {
    name: 'Emocionales',
    count: 10,
    iconName: 'Heart',
    color: '#DB2777',
    items: [
      'Temple y Serenidad',
      'Inteligencia emocional y autoconocimiento',
      'Autorregulación emocional bajo presión',
      'Gestión del estrés y la ansiedad laboral',
      'Automotivación intrínseca',
      'Empatía situacional y compasión',
      'Tolerancia a la incertidumbre y ambigüedad',
      'Madurez emocional en el trato',
      'Equilibrio vida-trabajo',
      'Asertividad emocional'
    ]
  },
  {
    name: 'Comerciales',
    count: 11,
    iconName: 'Banknote',
    color: '#059669',
    items: [
      'Orientación y adaptabilidad a las ventas',
      'Orientación al Cliente',
      'Prospección y captación de nuevos clientes',
      'Cierre de ventas y persuasión comercial',
      'Atención al cliente y vocación de servicio',
      'Negociación de acuerdos comerciales',
      'Detección y diagnóstico de necesidades',
      'Venta consultiva de soluciones',
      'Manejo de quejas y resolución de reclamos',
      'Fidelización de cartera y post-venta',
      'Mapeo del Customer Journey'
    ]
  }
];



const FILTER_QUESTIONS_CATALOG = [
  '¿Cuentas con disponibilidad para turnos completos y rotativos?',
  '¿Tienes al menos 6 meses de experiencia previa en el área?',
  '¿Cuentas con DNI vigente o permiso de trabajo oficial?',
  '¿Tienes disponibilidad inmediata para iniciar capacitación?'
];

const DEFAULT_DESCRIPTION = `Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.

Responsabilidades
[Describe con precisión todas las responsabilidades. Usa un lenguaje inclusivo.]
Ejemplo: Definir y desarrollar los requisitos para los sistemas en fase de producción para garantizar la máxima facilidad de uso.

Requisitos
[Algunos requisitos que podrías incluir: aptitudes, estudios, experiencia o certificados.]`;

interface CreateProfileViewProps {
  onBack: () => void;
  onCreateProfile: (profile: EvaluationTest) => Promise<EvaluationTest | null | void>;
  onLaunchProcess?: (profileId: string) => void;
  initialProfile?: EvaluationTest | null;
  initialStep?: 1 | 2;
}

export const CreateProfileView: React.FC<CreateProfileViewProps> = ({
  onBack,
  onCreateProfile,
  onLaunchProcess,
  initialProfile,
  initialStep = 1
}) => {
  // Navigation Steps: 1 = "Detalles del perfil", 2 = "Componentes del perfil"
  const [step, setStep] = useState<1 | 2>(initialStep);

  // Step 1 State
  const [profileName, setProfileName] = useState(initialProfile?.title || '');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(
    (initialProfile?.difficultyLevel as DifficultyLevel) || 'MEDIO'
  );
  const [description, setDescription] = useState(initialProfile?.description || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCopilotGenerating, setIsCopilotGenerating] = useState(false);

  // Helper para mapear components iniciales
  const buildInitialComponents = (prof?: EvaluationTest | null): ComponentItem[] => {
    // Si es un perfil nuevo, empezar completamente vacío para que el reclutador lo configure desde cero
    if (!prof) {
      return [];
    }

    const comps = prof?.selectedCompetencies || [];
    const savedStages = prof?.stages || [];

    // Si tiene stages configuradas, reconstruir los componentes correspondientes
    if (savedStages.length > 0) {
      return savedStages.map((stage, idx) => {
        let type: ComponentType = 'CONOCIMIENTOS';
        if (stage.id.includes('DISC') || stage.category === 'EMOTIONAL') type = 'DISC';
        else if (stage.id.includes('COMPETENCIAS') || stage.category === 'COMPETENCIES') type = 'COMPETENCIAS';
        else if (stage.id.includes('PREGUNTAS') || stage.id.includes('FILTRO')) type = 'PREGUNTAS_FILTRO';
        else if (stage.id.includes('CV')) type = 'CV';
        else if (stage.id.includes('VIDEO')) type = 'VIDEO_ENTREVISTA';

        return {
          id: `comp_${type.toLowerCase()}_${idx}`,
          type,
          title: stage.name,
          isComplete: true,
          durationMinutes: stage.durationMinutes || 15,
          weightPercent: stage.weightPercent || 20,
          selectedItems: type === 'COMPETENCIAS' ? comps : undefined
        };
      });
    }

    // Perfil existente sin stages personalizadas
    return [
      {
        id: 'comp_disc',
        type: 'DISC',
        title: 'Disc',
        isComplete: true,
        durationMinutes: 10,
        weightPercent: 20
      },
      {
        id: 'comp_conocimiento',
        type: 'CONOCIMIENTOS',
        title: 'Conocimiento',
        isComplete: false,
        durationMinutes: 15,
        weightPercent: 40
      },
      {
        id: 'comp_competencias',
        type: 'COMPETENCIAS',
        title: 'Competencias',
        isComplete: comps.length > 0,
        selectedItems: comps,
        durationMinutes: 15,
        weightPercent: 40
      }
    ];
  };

  // Step 2 State
  const [components, setComponents] = useState<ComponentItem[]>(() => buildInitialComponents(initialProfile));
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<ComponentType | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Conocimiento State & Items (si es perfil nuevo, arranca vacío)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItemConfig[]>(() => {
    if (!initialProfile) return [];
    if (initialProfile.knowledgeQuestionnaires && initialProfile.knowledgeQuestionnaires.length > 0) {
      const qWeight = Math.round(100 / initialProfile.knowledgeQuestionnaires.length);
      return initialProfile.knowledgeQuestionnaires.map((qName, idx) => ({
        id: `k_${idx + 1}`,
        name: qName,
        weight: idx === initialProfile.knowledgeQuestionnaires!.length - 1 
          ? (100 - qWeight * (initialProfile.knowledgeQuestionnaires!.length - 1)) 
          : qWeight,
        isConfigured: true,
        difficulty: 'MEDIO',
        totalQuestions: 20
      }));
    }
    return DEFAULT_KNOWLEDGE_ITEMS;
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openSectionMenuId, setOpenSectionMenuId] = useState<string | null>(null);
  const [activeConfigItem, setActiveConfigItem] = useState<KnowledgeItemConfig | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<KnowledgeItemConfig | null>(null);

  // Competencias State (Inicializado con las competencias reales guardadas en el perfil)
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(() => {
    return initialProfile?.selectedCompetencies || [];
  });

  // Niveles de desarrollo esperados para cada competencia (1 al 10, por defecto 7)
  const [competencyLevels, setCompetencyLevels] = useState<Record<string, number>>(() => {
    const levels: Record<string, number> = {};
    const rawComp = (initialProfile as any)?.competencias;
    const metaLevels = rawComp?._metadata?.competencyLevels || {};
    
    (initialProfile?.selectedCompetencies || []).forEach(comp => {
      if (metaLevels[comp]) {
        levels[comp] = metaLevels[comp];
      } else if (rawComp && typeof rawComp[comp] === 'number') {
        const val = rawComp[comp];
        levels[comp] = val > 10 ? 7 : Math.max(1, Math.min(10, val));
      } else {
        levels[comp] = 7;
      }
    });
    return levels;
  });

  const [openCompetencyMenuId, setOpenCompetencyMenuId] = useState<string | null>(null);
  const [activeDetailsCompetency, setActiveDetailsCompetency] = useState<{ name: string; description: string } | null>(null);

  const handleAdjustCompetencyLevel = (compName: string, delta: number) => {
    setCompetencyLevels(prev => {
      const current = prev[compName] ?? 7;
      const next = Math.max(1, Math.min(10, current + delta));
      const updated = {
        ...prev,
        [compName]: next
      };
      if (initialProfile?.id) {
        ProcessDataService.updateProfileCompetencies(initialProfile.id, selectedCompetencies, updated);
      }
      return updated;
    });
  };

  const [showCompetenciesDrawer, setShowCompetenciesDrawer] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favoritos']);
  const [searchCompetency, setSearchCompetency] = useState('');

  // Competencias Favoritas (persisten en localStorage)
  const [favoriteCompetencies, setFavoriteCompetencies] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('evaluar_favorite_competencies');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return DEFAULT_FAVORITE_COMPETENCIES;
  });

  const handleToggleFavorite = (compName: string) => {
    setFavoriteCompetencies(prev => {
      const next = prev.includes(compName)
        ? prev.filter(c => c !== compName)
        : [...prev, compName];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('evaluar_favorite_competencies', JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  };

  const displayedCompetencyCategories = useMemo<CompetencyCategory[]>(() => {
    const favCat: CompetencyCategory = {
      name: 'Favoritos',
      count: favoriteCompetencies.length,
      iconName: 'Star',
      color: '#EAB308',
      items: favoriteCompetencies
    };
    return [favCat, ...BASE_COMPETENCY_CATEGORIES];
  }, [favoriteCompetencies]);

  // Questionnaire catalogue drawer state
  const [searchQuestionnaire, setSearchQuestionnaire] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-sync si initialProfile o initialStep cambian
  useEffect(() => {
    if (initialProfile) {
      setProfileName(initialProfile.title || '');
      setDifficultyLevel((initialProfile.difficultyLevel as DifficultyLevel) || 'MEDIO');
      setDescription(initialProfile.description || '');
      setStep(initialStep || 2);
      setComponents(buildInitialComponents(initialProfile));

      if (initialProfile.selectedCompetencies) {
        setSelectedCompetencies(initialProfile.selectedCompetencies);
      }

      if (initialProfile.knowledgeQuestionnaires && initialProfile.knowledgeQuestionnaires.length > 0) {
        const qWeight = Math.round(100 / initialProfile.knowledgeQuestionnaires.length);
        setKnowledgeItems(initialProfile.knowledgeQuestionnaires.map((qName, idx) => ({
          id: `k_${idx + 1}`,
          name: qName,
          weight: idx === initialProfile.knowledgeQuestionnaires!.length - 1 
            ? (100 - qWeight * (initialProfile.knowledgeQuestionnaires!.length - 1)) 
            : qWeight,
          isConfigured: true,
          difficulty: 'MEDIO',
          totalQuestions: 20
        })));
      }
    }
  }, [initialProfile, initialStep]);

  // Cerrar menú flotante si se hace clic fuera
  useEffect(() => {
    const handleDocumentClick = () => {
      if (openMenuId) setOpenMenuId(null);
      if (openSectionMenuId) setOpenSectionMenuId(null);
      if (openCompetencyMenuId) setOpenCompetencyMenuId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [openMenuId, openSectionMenuId, openCompetencyMenuId]);

  // Generador de descripción con CopilotAI
  const handleCopilotGenerate = () => {
    setIsCopilotGenerating(true);
    const pos = profileName.trim() || 'Asesor de Servicio y Operaciones';
    setTimeout(() => {
      setDescription(`Resumen del Puesto:
Como ${pos} en GEA Internacional, liderarás la interacción con clientes y usuarios, asegurando soluciones eficaces, satisfacción operativa y cumplimiento riguroso de indicadores de calidad.

Responsabilidades:
• Gestionar y resolver consultas y requerimientos con excelente dicción, empatía y velocidad.
• Registrar cada caso en el sistema corporativo con apego a las políticas de seguridad y confidencialidad.
• Superar las metas individuales y de equipo en calidad, tiempos de resolución y satisfacción.

Requisitos:
• Nivel de exigencia requerido: ${difficultyLevel}.
• Orientación comprobada al cliente y comunicación asertiva.
• Capacidad de adaptación a sistemas digitales y trabajo bajo presión.`);
      setIsCopilotGenerating(false);
    }, 550);
  };

  const handleFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);
    const replacement = `${prefix}${selected || 'texto'}${suffix}`;
    setDescription(current.substring(0, start) + replacement + current.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 50);
  };

  const handleProceedToStep2 = () => {
    if (!profileName.trim()) {
      setValidationError('Por favor ingresa el nombre que tendrá el perfil.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  // Añadir componente desde el modal
  const handleAddComponent = (type: ComponentType) => {
    if (components.some(c => c.type === type)) return;
    setShowAddComponentModal(false);

    let title = '';
    let isComplete = false;
    let duration = 15;

    switch (type) {
      case 'DISC':
        title = 'Disc';
        isComplete = true;
        duration = 10;
        break;
      case 'PREGUNTAS_FILTRO':
        title = 'Preguntas filtro';
        isComplete = false;
        duration = 5;
        break;
      case 'CV':
        title = 'Cv';
        isComplete = true;
        duration = 5;
        break;
      case 'CONOCIMIENTOS':
        title = 'Conocimiento';
        isComplete = false;
        duration = 15;
        break;
      case 'COMPETENCIAS':
        title = 'Competencias';
        isComplete = selectedCompetencies.length > 0;
        duration = 15;
        break;
      case 'VIDEO_ENTREVISTA':
        title = 'Video entrevista';
        isComplete = false;
        duration = 10;
        break;
    }

    const newComp: ComponentItem = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      isComplete,
      durationMinutes: duration,
      weightPercent: 20
    };

    setComponents(prev => [...prev, newComp]);

    if (type === 'COMPETENCIAS') {
      setShowCompetenciesDrawer(true);
    } else if (type === 'CONOCIMIENTOS') {
      setActiveDrawer('CONOCIMIENTOS');
    }
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  // Ajustar peso de un item de conocimiento (NUNCA superará el 100%)
  const handleAdjustWeight = (itemId: string, delta: number) => {
    setKnowledgeItems(prev => {
      const currentTotal = prev.reduce((sum, it) => sum + it.weight, 0);
      return prev.map(item => {
        if (item.id === itemId) {
          if (delta > 0) {
            const maxAllowed = Math.max(0, 100 - currentTotal);
            const actualDelta = Math.min(delta, maxAllowed);
            return { ...item, weight: item.weight + actualDelta };
          } else {
            const next = Math.max(0, item.weight + delta);
            return { ...item, weight: next };
          }
        }
        return item;
      });
    });
  };

  // Guardar configuración del item de conocimiento
  const handleSaveConfigItem = () => {
    if (!activeConfigItem) return;
    setKnowledgeItems(prev => prev.map(it => {
      if (it.id === activeConfigItem.id) {
        return {
          ...activeConfigItem,
          isConfigured: true
        };
      }
      return it;
    }));
    setActiveConfigItem(null);
  };

  // Eliminar item de conocimiento y redistribuir equitativamente para mantener siempre el 100%
  const handleDeleteKnowledgeItem = (itemId: string) => {
    setKnowledgeItems(prev => {
      const remaining = prev.filter(it => it.id !== itemId);
      if (remaining.length === 0) return [];
      const count = remaining.length;
      const baseWeight = Math.floor(100 / count);
      const remainder = 100 % count;
      return remaining.map((it, idx) => ({
        ...it,
        weight: baseWeight + (idx < remainder ? 1 : 0)
      }));
    });
    setOpenMenuId(null);
  };

  // Añadir o remover cuestionario desde el catálogo distribuyendo equitativamente sin superar el 100%
  const handleToggleQuestionnaireFromCatalog = (qTitle: string) => {
    const existing = knowledgeItems.find(k => k.name.toLowerCase() === qTitle.toLowerCase());
    if (existing) {
      // Si ya está seleccionado, removerlo y redistribuir el 100%
      handleDeleteKnowledgeItem(existing.id);
      return;
    }

    const newCount = knowledgeItems.length + 1;
    const baseWeight = Math.floor(100 / newCount);
    const remainder = 100 % newCount;

    const newItem: KnowledgeItemConfig = {
      id: `k_${Date.now()}`,
      name: qTitle,
      isConfigured: false,
      weight: baseWeight,
      difficulty: 'Personalizada',
      totalQuestions: 20,
      questionsLow: 5,
      maxLow: 30,
      questionsMed: 10,
      maxMed: 25,
      questionsHigh: 5,
      maxHigh: 15,
      timeControl: true,
      minutes: 2,
      scoreScale: 20,
      questionOrder: 'Predefinido',
      instructions: ''
    };

    const rebalanced = [...knowledgeItems, newItem].map((item, idx) => ({
      ...item,
      weight: baseWeight + (idx < remainder ? 1 : 0)
    }));

    setKnowledgeItems(rebalanced);
  };

  // Toggle competencia individual con guardado automático en perfiles_puesto
  const handleToggleCompetency = (compName: string) => {
    setSelectedCompetencies(prev => {
      const isRemoving = prev.includes(compName);
      const next = isRemoving
        ? prev.filter(c => c !== compName)
        : [...prev, compName];

      if (!isRemoving) {
        setCompetencyLevels(curr => ({
          ...curr,
          [compName]: curr[compName] ?? 7
        }));
      }

      setComponents(currentComps => currentComps.map(c => {
        if (c.type === 'COMPETENCIAS') {
          return {
            ...c,
            isComplete: next.length > 0,
            selectedItems: next
          };
        }
        return c;
      }));

      if (initialProfile?.id) {
        ProcessDataService.updateProfileCompetencies(initialProfile.id, next, {
          ...competencyLevels,
          [compName]: competencyLevels[compName] ?? 7
        });
      }
      return next;
    });
  };

  const handleDeleteCompetency = (compName: string) => {
    handleToggleCompetency(compName);
    setOpenCompetencyMenuId(null);
  };

  // Toggle categoría desplegable
  const handleToggleCategory = (catName: string) => {
    setExpandedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  // Helper para verificar si un componente ya está agregado
  const isComponentAlreadyAdded = (type: ComponentType) => {
    return components.some(c => c.type === type);
  };

  // Guardar perfil general persistiendo competencias en perfiles_puesto
  const handleSaveProfile = async () => {
    if (components.length === 0) {
      setSubmitError('Por favor añade al menos un componente al perfil para continuar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const uniqueId = initialProfile?.id || generateSafeUuid();
    const cleanPos = profileName.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'POS';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = initialProfile?.code || `PRF-${cleanPos}-${new Date().getFullYear()}-${randomSuffix}`;
    const totalDuration = components.reduce((acc, c) => acc + c.durationMinutes, 0) || 45;
    const baseWeight = Math.round(100 / components.length);

    const stages: TestStageConfig[] = components.map((c, index) => {
      let desc = `Componente ${c.title} para evaluación de ${profileName}`;
      if (c.type === 'CONOCIMIENTOS' && knowledgeItems.length > 0) {
        desc = `Cuestionarios: ${knowledgeItems.map(k => k.name).join(', ')}`;
      } else if (c.type === 'COMPETENCIAS' && selectedCompetencies.length > 0) {
        desc = `Competencias: ${selectedCompetencies.slice(0, 4).join(', ')}`;
      }
      return {
        id: `STAGE_${c.type}`,
        category: c.type === 'DISC' ? 'EMOTIONAL' : (c.type === 'CONOCIMIENTOS' ? 'PSYCHOLOGICAL' : 'COMPETENCIES'),
        name: c.title,
        description: desc,
        durationMinutes: c.durationMinutes,
        questionCount: c.type === 'CONOCIMIENTOS' ? knowledgeItems.reduce((acc, k) => acc + (k.totalQuestions || 20), 0) : 10,
        weightPercent: index === components.length - 1 ? (100 - baseWeight * (components.length - 1)) : baseWeight,
        isEnabled: true
      };
    });

    const newProfile: EvaluationTest = {
      id: uniqueId,
      code,
      title: profileName.trim(),
      targetPosition: profileName.trim(),
      description: description.trim(),
      instructions: `Evaluación oficial de perfil para ${profileName.trim()}. Nivel: ${difficultyLevel}.`,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalDurationMinutes: totalDuration,
      candidateCount: initialProfile?.candidateCount || 0,
      completedCount: initialProfile?.completedCount || 0,
      averageScore: initialProfile?.averageScore || 0,
      launchedBy: initialProfile?.launchedBy || 'Tania León (Líder)',
      startDate: initialProfile?.startDate || new Date().toLocaleDateString('es-PE'),
      endDate: initialProfile?.endDate || '31/12/2026',
      processStatus: 'LANZADO',
      profileName: profileName.trim(),
      hiredCount: initialProfile?.hiredCount || 0,
      inProgressCount: initialProfile?.inProgressCount || 0,
      difficultyLevel,
      selectedCompetencies,
      knowledgeQuestionnaires: knowledgeItems.map(k => k.name),
      knowledgeItems: knowledgeItems,
      stages
    } as any;

    try {
      const saved = await onCreateProfile(newProfile);
      const resultingId = (saved as any)?.id || uniqueId;
      
      // Actualizar explícitamente competencias y _metadata completo en perfiles_puesto
      try {
        const compMap: Record<string, any> = {};
        selectedCompetencies.forEach(c => {
          compMap[c] = competencyLevels[c] || 7;
        });
        compMap._metadata = {
          difficulty: difficultyLevel,
          duration: totalDuration,
          stages,
          knowledgeQuestionnaires: knowledgeItems.map(k => k.name),
          knowledgeItems,
          selectedList: selectedCompetencies,
          competencyLevels
        };

        await supabase
          .from('perfiles_puesto')
          .update({
            competencias: compMap,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', resultingId);
      } catch (e) {
        console.warn('Error syncing profile metadata:', e);
      }

      setSavedProfileId(resultingId);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al guardar el perfil.');
      setIsSubmitting(false);
    }
  };

  const renderOfficialIcon = (type: ComponentType) => {
    switch (type) {
      case 'DISC':
        return (
          <div className="w-7 h-7 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-2xs shrink-0">
            <div className="bg-[#F59E0B] flex items-center justify-center text-[7px] font-bold text-white leading-none">D</div>
            <div className="bg-[#EF4444] flex items-center justify-center text-[7px] font-bold text-white leading-none">I</div>
            <div className="bg-[#3B82F6] flex items-center justify-center text-[7px] font-bold text-white leading-none">S</div>
            <div className="bg-[#10B981] flex items-center justify-center text-[7px] font-bold text-white leading-none">C</div>
          </div>
        );
      case 'PREGUNTAS_FILTRO':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <span className="text-xs">📑</span>
          </div>
        );
      case 'CV':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-rose-500">CV</span>
          </div>
        );
      case 'CONOCIMIENTOS':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#7C3AED]" />
          </div>
        );
      case 'COMPETENCIAS':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-[#059669]" />
          </div>
        );
      case 'VIDEO_ENTREVISTA':
        return (
          <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center shrink-0">
            <span className="text-xs">📹</span>
          </div>
        );
    }
  };

  const renderCategoryIcon = (iconName: string, color: string) => {
    const iconProps = { className: 'w-4 h-4 shrink-0', style: { color } };
    switch (iconName) {
      case 'Star': return <Star {...iconProps} className="w-4 h-4 shrink-0 fill-amber-400 text-amber-500" />;
      case 'Users': return <Users {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Rocket': return <Rocket {...iconProps} />;
      case 'Crown': return <Crown {...iconProps} />;
      case 'GraduationCap': return <GraduationCap {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'MessageSquare': return <MessageSquare {...iconProps} />;
      case 'Globe': return <Globe {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Banknote': return <Banknote {...iconProps} />;
      default: return <Sparkles {...iconProps} />;
    }
  };

  const totalKnowledgeWeight = knowledgeItems.reduce((acc, it) => acc + it.weight, 0);

  // =========================================================================
  // PASO 1: DETALLES DEL PERFIL
  // =========================================================================
  if (step === 1) {
    return (
      <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6 font-sans animate-in fade-in">
        <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div className="relative mb-3 flex items-center justify-center">
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <circle cx="48" cy="18" r="4.5" fill="#8B5CF6" />
              <circle cx="34" cy="36" r="24" fill="white" stroke="#6D28D9" strokeWidth="6" />
              <circle cx="28" cy="34" r="3" fill="#6D28D9" />
              <circle cx="40" cy="34" r="3" fill="#6D28D9" />
              <path d="M30 40C31.5 42 36.5 42 38 40" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-[#3B1F8E]">CREACIÓN </span>
            <span className="text-[#8B3D9D]">DE PERFIL</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1 font-normal">
            Crea tu perfil para lanzar procesos
          </p>
        </div>

        {validationError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-9 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Detalles del perfil
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Coloca la información básica de tu perfil
            </p>
          </div>

          <div className="pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                Nombre
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Nombre que tendrá el perfil"
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800">
              Descripción (objetivos, funciones, responsabilidades)
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-1 text-slate-600">
                <button
                  type="button"
                  onClick={() => handleFormat('**', '**')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Negrita"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('\n\n')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Párrafo"
                >
                  P
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('*', '*')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs italic cursor-pointer"
                  title="Cursiva"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('<u>', '</u>')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs underline cursor-pointer"
                  title="Subrayado"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('\n• ')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Viñetas"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('\n1. ')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Numeración"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('[', '](https://)')}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Enlace"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopilotGenerate}
                disabled={isCopilotGenerating}
                className="px-4 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isCopilotGenerating ? 'animate-spin' : ''}`} />
                <span>{isCopilotGenerating ? 'Generando...' : 'Generar con CopilotAI'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <textarea
                id="description-textarea"
                rows={9}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={DEFAULT_DESCRIPTION}
                className="w-full p-4 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 placeholder:leading-relaxed leading-relaxed font-normal bg-white focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Atrás
          </button>
          
          <button
            type="button"
            onClick={handleProceedToStep2}
            className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
          >
            <span>Siguiente: Componentes</span>
            <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PASO 2: COMPONENTES DEL PERFIL (Imágenes 1 a 5)
  // =========================================================================
  const filteredQuestionnaires = QUESTIONNAIRE_CATALOG.filter(q => 
    q.title.toLowerCase().includes(searchQuestionnaire.toLowerCase()) ||
    (q.category && q.category.toLowerCase().includes(searchQuestionnaire.toLowerCase()))
  );
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestionnaires.length / ITEMS_PER_PAGE));
  const paginatedQuestionnaires = filteredQuestionnaires.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6 font-sans animate-in fade-in space-y-5 relative">
      
      {/* Barra superior con botón regresar y acción */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-2xs transition-colors cursor-pointer"
            title="Volver a Detalles del perfil"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Componentes del perfil
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAddComponentModal(true)}
          className="px-4 py-2 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Agregar componentes</span>
        </button>
      </div>

      {/* Ficha Resumen del Perfil (Acordeón) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6D28D9]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Perfil {profileName.trim().toUpperCase() || 'NUEVO PERFIL'}
              </h3>
              <p className="text-xs text-slate-500">
                Detalles de la vacante {profileName.trim().toUpperCase() || 'NUEVO PERFIL'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
            title={isAccordionOpen ? 'Ocultar detalles' : 'Ver detalles'}
          >
            {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isAccordionOpen && (
          <div className="pt-4 mt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-2 animate-in fade-in">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">Descripción:</span>
              <p className="whitespace-pre-line text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs leading-relaxed max-h-36 overflow-y-auto">
                {description || 'Sin descripción detallada especificada.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Componentes del Perfil */}
      <div className="space-y-4">
        {components.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#5235E8]/10 text-[#5235E8] flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No hay componentes configurados en este perfil
              </h3>
              <p className="text-xs text-slate-500">
                Comienza agregando las evaluaciones que formarán este perfil (como DISC, Pruebas de Conocimiento o Competencias laborales).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddComponentModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#5235E8] hover:bg-[#432bc4] shadow-md shadow-[#5235E8]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar componentes ahora</span>
            </button>
          </div>
        )}

        {components.map((comp) => {
          const isDisc = comp.type === 'DISC';
          const isConocimiento = comp.type === 'CONOCIMIENTOS';
          const isCompetencias = comp.type === 'COMPETENCIAS';

          return (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-visible transition-all"
            >
              {/* Encabezado de la Tarjeta del Componente */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/20 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon(comp.type)}
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    {comp.title}
                  </span>
                  {(isConocimiento || isCompetencias) && (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Badge de estado */}
                  {isDisc && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Completo</span>
                    </span>
                  )}

                  {isConocimiento && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      knowledgeItems.length > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {knowledgeItems.length > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Completo</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Sin configurar</span>
                        </>
                      )}
                    </span>
                  )}

                  {isCompetencias && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      selectedCompetencies.length > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selectedCompetencies.length > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Completo</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Incompleto</span>
                        </>
                      )}
                    </span>
                  )}

                  {/* Icono de recargar/reset */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompetencias) setShowCompetenciesDrawer(true);
                      else if (isConocimiento) setActiveDrawer('CONOCIMIENTOS');
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Actualizar / Configurar"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Menú de 3 puntos del componente principal */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSectionMenuId(openSectionMenuId === comp.id ? null : comp.id);
                      }}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title="Opciones de sección"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openSectionMenuId === comp.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenSectionMenuId(null);
                            if (isCompetencias) {
                              setShowCompetenciesDrawer(true);
                            } else if (isConocimiento) {
                              setActiveDrawer('CONOCIMIENTOS');
                            } else if (isDisc) {
                              setActiveDrawer('DISC');
                            } else {
                              setActiveDrawer(comp.type);
                            }
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6355A4] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#6355A4]" />
                          <span>Editar sección</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenSectionMenuId(null);
                            handleRemoveComponent(comp.id);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar sección</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CUERPO DEL COMPONENTE: CONOCIMIENTO (Imágenes 1 y 2) */}
              {isConocimiento && (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Barra: Sumatoria de pesos */}
                  <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-[#6355A4]">
                        <RotateCw className="w-3 h-3" />
                      </div>
                      <span>Sumatoria de pesos</span>
                    </div>

                    <div className="flex-1 max-w-xl h-2.5 bg-slate-200/90 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, totalKnowledgeWeight)}%` }}
                      />
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-emerald-600 shrink-0">
                      {totalKnowledgeWeight}%
                    </span>
                  </div>

                  {/* Lista de temas de conocimiento */}
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-visible">
                    {knowledgeItems.length === 0 && (
                      <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-400 stroke-[1.5]" />
                        <p className="font-medium text-slate-700">No hay cuestionarios añadidos aún</p>
                        <p className="text-[11px] text-slate-400">Haz clic en "+ Añadir cuestionarios" abajo para seleccionar temas del catálogo.</p>
                      </div>
                    )}
                    {knowledgeItems.map((kItem) => (
                      <div
                        key={kItem.id}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors relative"
                      >
                        {/* Izquierda: Icono + Título + Badge */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {kItem.name}
                          </span>
                          {!kItem.isConfigured && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2]/80 text-[#EF4444] border border-[#FECACA]/60 shrink-0">
                              Sin configurar
                            </span>
                          )}
                        </div>

                        {/* Derecha: Control de Peso (-) 25% (+) + Info + Menú 3 puntos */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Control de porcentaje */}
                          <div className="flex items-center border border-slate-200 rounded-full px-1.5 py-0.5 bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(kItem.id, -5)}
                              className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                              title="Reducir peso"
                            >
                              -
                            </button>
                            <span className="text-xs font-semibold text-slate-700 px-2 min-w-[38px] text-center">
                              {kItem.weight}%
                            </span>
                            <button
                              type="button"
                              disabled={totalKnowledgeWeight >= 100}
                              onClick={() => handleAdjustWeight(kItem.id, 5)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                totalKnowledgeWeight >= 100
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer'
                              }`}
                              title={totalKnowledgeWeight >= 100 ? "La sumatoria ya alcanzó el 100%" : "Aumentar peso"}
                            >
                              +
                            </button>
                          </div>

                          {/* Info Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewItem(kItem);
                            }}
                            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                            title="Información"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón de 3 puntos con mini menú flotante (Imagen 2) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === kItem.id ? null : kItem.id);
                              }}
                              className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                              title="Opciones del tema"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Mini Menú Flotante */}
                            {openMenuId === kItem.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setActivePreviewItem(kItem);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-[#6355A4] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>Ver cuestionario</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setActiveConfigItem({ ...kItem });
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-[#6355A4] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>Configuración</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKnowledgeItem(kItem.id)}
                                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón Añadir tema (Imagen 2) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveDrawer('CONOCIMIENTOS')}
                      className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#6355A4] text-slate-700 hover:text-[#6355A4] text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer bg-white transition-all shadow-2xs"
                    >
                      <Plus className="w-4 h-4 stroke-[2]" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CUERPO DEL COMPONENTE: COMPETENCIAS (Listado idéntico a conocimientos sin sumatoria de pesos) */}
              {isCompetencias && (
                <div className="p-5 sm:p-8 space-y-4">
                  {selectedCompetencies.length === 0 ? (
                    <div className="py-2 text-center">
                      <p className="text-slate-500 text-xs sm:text-sm font-normal">
                        No se han seleccionado competencias
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCompetenciesDrawer(true)}
                        className="mt-4 px-5 py-2 rounded-xl border border-slate-300 hover:border-[#6355A4] text-slate-700 hover:text-[#6355A4] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer bg-white transition-all shadow-2xs"
                      >
                        <Plus className="w-4 h-4 stroke-[2]" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      {/* Lista de competencias en formato idéntico a conocimientos */}
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-visible">
                        {selectedCompetencies.map((compName) => (
                          <div
                            key={compName}
                            className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors relative"
                          >
                            {/* Izquierda: Icono + Título de Competencia */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-slate-800 truncate" title={compName}>
                                {compName}
                              </span>
                            </div>

                            {/* Derecha: Botón Nivel de desarrollo [- 7 +] (1 al 10) + Botón 3 puntos */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Control del nivel de desarrollo de la prueba (1 al 10, default 7) */}
                              <div 
                                className="flex items-center border border-slate-200 rounded-full px-1.5 py-0.5 bg-white shadow-2xs"
                                title="Nivel de desarrollo de la prueba (1 al 10)"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleAdjustCompetencyLevel(compName, -1)}
                                  disabled={(competencyLevels[compName] ?? 7) <= 1}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    (competencyLevels[compName] ?? 7) <= 1
                                      ? 'text-slate-200 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer'
                                  }`}
                                  title="Reducir nivel de desarrollo"
                                >
                                  -
                                </button>
                                <span className="text-xs font-semibold text-slate-700 px-2 min-w-[28px] text-center">
                                  {competencyLevels[compName] ?? 7}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustCompetencyLevel(compName, 1)}
                                  disabled={(competencyLevels[compName] ?? 7) >= 10}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    (competencyLevels[compName] ?? 7) >= 10
                                      ? 'text-slate-200 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer'
                                  }`}
                                  title="Aumentar nivel de desarrollo"
                                >
                                  +
                                </button>
                              </div>

                              {/* Menú de 3 puntos */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenCompetencyMenuId(openCompetencyMenuId === compName ? null : compName);
                                  }}
                                  className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                                  title="Opciones de la competencia"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {/* Menú Flotante */}
                                {openCompetencyMenuId === compName && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenCompetencyMenuId(null);
                                        setActiveDetailsCompetency({
                                          name: compName,
                                          description: COMPETENCY_DESCRIPTIONS[compName] || `Habilidad demostrada para aplicar ${compName.toLowerCase()} con solvencia, criterio y efectividad en situaciones laborales reales.`
                                        });
                                      }}
                                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <span>Ver más detalles</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteCompetency(compName);
                                      }}
                                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón Añadir abajo (idéntico al de Conocimientos) */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCompetenciesDrawer(true)}
                          className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#6355A4] text-slate-700 hover:text-[#6355A4] text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer bg-white transition-all shadow-2xs"
                        >
                          <Plus className="w-4 h-4 stroke-[2]" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuración avanzada (Imagen 5) */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
          className="text-xs sm:text-sm font-semibold text-[#6355A4] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Configuración avanzada</span>
          {showAdvancedConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedConfig && (
          <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-600 space-y-2 animate-in fade-in">
            <p className="font-semibold text-slate-800">Parámetros avanzados de evaluación:</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#6355A4] focus:ring-[#6355A4]" />
              <span>Permitir reintentos en caso de desconexión de red</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#6355A4] focus:ring-[#6355A4]" />
              <span>Notificar al postulante vía correo electrónico al completar</span>
            </label>
          </div>
        )}
      </div>

      {/* Botones de Navegación Inferior (Imagen 5) */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={components.length === 0 || isSubmitting}
          className={`px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 ${
            components.length > 0 && !isSubmitting
              ? 'bg-[#6355A4] hover:bg-[#534493] text-white cursor-pointer active:scale-98'
              : 'bg-[#C4B5FD] text-white cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <span>Guardar Perfil</span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AÑADIR COMPONENTE                                                */}
      {/* ========================================================================= */}
      {showAddComponentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Añadir componente
              </h3>
              <button
                type="button"
                onClick={() => setShowAddComponentModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Disc */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('DISC')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Disc</span>
                </div>
                {isComponentAlreadyAdded('DISC') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('DISC')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>

              {/* Conocimientos */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('CONOCIMIENTOS')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Conocimientos</span>
                </div>
                {isComponentAlreadyAdded('CONOCIMIENTOS') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('CONOCIMIENTOS')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>

              {/* Competencias */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('COMPETENCIAS')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Competencias</span>
                </div>
                {isComponentAlreadyAdded('COMPETENCIAS') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('COMPETENCIAS')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>

              {/* Preguntas filtro */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('PREGUNTAS_FILTRO')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Preguntas filtro</span>
                </div>
                {isComponentAlreadyAdded('PREGUNTAS_FILTRO') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('PREGUNTAS_FILTRO')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>

              {/* Cv */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('CV')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Cv</span>
                </div>
                {isComponentAlreadyAdded('CV') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('CV')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>

              {/* Video entrevista */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {renderOfficialIcon('VIDEO_ENTREVISTA')}
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Video entrevista</span>
                </div>
                {isComponentAlreadyAdded('VIDEO_ENTREVISTA') ? (
                  <button type="button" disabled className="px-4 py-1.5 rounded-xl bg-[#DDD6FE] text-white text-xs font-semibold cursor-default">
                    <span>Añadir</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => handleAddComponent('VIDEO_ENTREVISTA')} className="px-4 py-1.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 1: CONFIGURACIÓN DEL CUESTIONARIO (Imagen 3 + Requerimientos User) */}
      {/* ========================================================================= */}
      {activeConfigItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveConfigItem(null)} />
          <div className="relative z-10 w-full sm:w-[500px] h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#6355A4]" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  Configuración
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveConfigItem(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-slate-700">
              {/* Nombre del cuestionario */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Nombre del cuestionario
                </label>
                <input
                  type="text"
                  value={activeConfigItem.name}
                  onChange={(e) => setActiveConfigItem({ ...activeConfigItem, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white uppercase font-medium"
                />
              </div>

              {/* Dificultad */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Dificultad
                </label>
                <div className="relative">
                  <select
                    value={activeConfigItem.difficulty}
                    onChange={(e) => {
                      const newDiff = e.target.value as 'Personalizada' | 'Baja' | 'Media' | 'Alta';
                      const total = activeConfigItem.totalQuestions || 20;
                      let low = activeConfigItem.questionsLow;
                      let med = activeConfigItem.questionsMed;
                      let high = activeConfigItem.questionsHigh;

                      if (newDiff === 'Baja') {
                        low = Math.max(1, Math.round(total * 0.7));
                        med = Math.max(1, Math.round(total * 0.2));
                        high = Math.max(0, total - low - med);
                      } else if (newDiff === 'Media') {
                        low = Math.max(1, Math.round(total * 0.25));
                        med = Math.max(1, Math.round(total * 0.5));
                        high = Math.max(1, total - low - med);
                      } else if (newDiff === 'Alta') {
                        low = Math.max(0, Math.round(total * 0.1));
                        med = Math.max(1, Math.round(total * 0.3));
                        high = Math.max(1, total - low - med);
                      }

                      setActiveConfigItem({
                        ...activeConfigItem,
                        difficulty: newDiff,
                        questionsLow: low,
                        questionsMed: med,
                        questionsHigh: high
                      });
                    }}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white cursor-pointer pr-10"
                  >
                    <option value="Personalizada">Personalizada</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Cantidad de preguntas a evaluar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                    Cantidad de preguntas a evaluar
                  </label>
                  <span className="text-[11px] font-semibold text-[#6355A4] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Mínimo 20 por cuestionario
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={activeConfigItem.totalQuestions || 20}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value) || 20);
                      let low = activeConfigItem.questionsLow;
                      let med = activeConfigItem.questionsMed;
                      let high = activeConfigItem.questionsHigh;
                      if (activeConfigItem.difficulty === 'Baja') {
                        low = Math.max(1, Math.round(val * 0.7));
                        med = Math.max(1, Math.round(val * 0.2));
                        high = Math.max(0, val - low - med);
                      } else if (activeConfigItem.difficulty === 'Media') {
                        low = Math.max(1, Math.round(val * 0.25));
                        med = Math.max(1, Math.round(val * 0.5));
                        high = Math.max(1, val - low - med);
                      } else if (activeConfigItem.difficulty === 'Alta') {
                        low = Math.max(0, Math.round(val * 0.1));
                        med = Math.max(1, Math.round(val * 0.3));
                        high = Math.max(1, val - low - med);
                      } else {
                        const currentSum = low + med + high || 1;
                        low = Math.round((low / currentSum) * val);
                        med = Math.round((med / currentSum) * val);
                        high = Math.max(0, val - low - med);
                      }
                      setActiveConfigItem({
                        ...activeConfigItem,
                        totalQuestions: val,
                        questionsLow: low,
                        questionsMed: med,
                        questionsHigh: high
                      });
                    }}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-center text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white"
                  />

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[10, 15, 20, 25].map(qNum => (
                      <button
                        key={qNum}
                        type="button"
                        onClick={() => {
                          const val = qNum;
                          let low = activeConfigItem.questionsLow;
                          let med = activeConfigItem.questionsMed;
                          let high = activeConfigItem.questionsHigh;
                          if (activeConfigItem.difficulty === 'Baja') {
                            low = Math.max(1, Math.round(val * 0.7));
                            med = Math.max(1, Math.round(val * 0.2));
                            high = Math.max(0, val - low - med);
                          } else if (activeConfigItem.difficulty === 'Media') {
                            low = Math.max(1, Math.round(val * 0.25));
                            med = Math.max(1, Math.round(val * 0.5));
                            high = Math.max(1, val - low - med);
                          } else if (activeConfigItem.difficulty === 'Alta') {
                            low = Math.max(0, Math.round(val * 0.1));
                            med = Math.max(1, Math.round(val * 0.3));
                            high = Math.max(1, val - low - med);
                          } else {
                            const currentSum = low + med + high || 1;
                            low = Math.round((low / currentSum) * val);
                            med = Math.round((med / currentSum) * val);
                            high = Math.max(0, val - low - med);
                          }
                          setActiveConfigItem({
                            ...activeConfigItem,
                            totalQuestions: val,
                            questionsLow: low,
                            questionsMed: med,
                            questionsHigh: high
                          });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          (activeConfigItem.totalQuestions || 20) === qNum
                            ? 'bg-[#6355A4] text-white border-[#6355A4]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {qNum} preg.
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total de preguntas que el postulante visualizará y responderá en esta prueba técnica.
                </p>
              </div>

              {/* Preguntas y dificultad */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Desglose de preguntas por dificultad
                </label>

                {/* Bajas */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-emerald-600 w-20">
                    Bajas
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={activeConfigItem.maxLow}
                      value={activeConfigItem.questionsLow}
                      onChange={(e) => {
                        const lowVal = Math.max(0, Number(e.target.value));
                        setActiveConfigItem({
                          ...activeConfigItem,
                          questionsLow: lowVal,
                          totalQuestions: lowVal + activeConfigItem.questionsMed + activeConfigItem.questionsHigh
                        });
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-center text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 min-w-[36px] text-right font-medium">
                      {activeConfigItem.questionsLow}/{activeConfigItem.maxLow}
                    </span>
                  </div>
                </div>

                {/* Medias */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-amber-500 w-20">
                    Medias
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={activeConfigItem.maxMed}
                      value={activeConfigItem.questionsMed}
                      onChange={(e) => {
                        const medVal = Math.max(0, Number(e.target.value));
                        setActiveConfigItem({
                          ...activeConfigItem,
                          questionsMed: medVal,
                          totalQuestions: activeConfigItem.questionsLow + medVal + activeConfigItem.questionsHigh
                        });
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-center text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400 min-w-[36px] text-right font-medium">
                      {activeConfigItem.questionsMed}/{activeConfigItem.maxMed}
                    </span>
                  </div>
                </div>

                {/* Altas */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-rose-500 w-20">
                    Altas
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={activeConfigItem.maxHigh}
                      value={activeConfigItem.questionsHigh}
                      onChange={(e) => {
                        const highVal = Math.max(0, Number(e.target.value));
                        setActiveConfigItem({
                          ...activeConfigItem,
                          questionsHigh: highVal,
                          totalQuestions: activeConfigItem.questionsLow + activeConfigItem.questionsMed + highVal
                        });
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-center text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-xs text-slate-400 min-w-[36px] text-right font-medium">
                      {activeConfigItem.questionsHigh}/{activeConfigItem.maxHigh}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control de tiempo */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Control de tiempo
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfigItem.timeControl}
                      onChange={(e) => setActiveConfigItem({ ...activeConfigItem, timeControl: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6355A4]" />
                  </label>
                </div>

                {activeConfigItem.timeControl && (
                  <div className="space-y-1.5 pl-0.5">
                    <label className="block text-xs font-medium text-slate-600">
                      Minutos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={activeConfigItem.minutes}
                      onChange={(e) => setActiveConfigItem({ ...activeConfigItem, minutes: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4]"
                    />
                  </div>
                )}
              </div>

              {/* OPCIÓN REQUERIDA: Escala de puntuación */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                    Escala de puntuación
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Puntaje máximo
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={activeConfigItem.scoreScale}
                  onChange={(e) => setActiveConfigItem({ ...activeConfigItem, scoreScale: Math.max(1, Number(e.target.value)) })}
                  placeholder="Ejemplo: 20 o 100"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white"
                />
              </div>

              {/* OPCIÓN REQUERIDA: Orden de las preguntas (3 opciones) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Orden de las preguntas
                </label>
                <div className="relative">
                  <select
                    value={activeConfigItem.questionOrder}
                    onChange={(e) => setActiveConfigItem({ ...activeConfigItem, questionOrder: e.target.value as any })}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white cursor-pointer pr-10 font-medium"
                  >
                    <option value="Predefinido">Predefinido</option>
                    <option value="Aleatorio">Aleatorio</option>
                    <option value="Por dificultad">Por dificultad</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Instrucciones (opcional) con barra de formato */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Instrucciones (opcional)
                </label>

                {/* Barra de formato estilizada (Imagen 3) */}
                <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600">
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-xs hover:bg-slate-100">B</button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-xs hover:bg-slate-100">P</button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-xs italic hover:bg-slate-100">I</button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-xs underline hover:bg-slate-100">U</button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs hover:bg-slate-100"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs hover:bg-slate-100"><ListOrdered className="w-3.5 h-3.5" /></button>
                  <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs hover:bg-slate-100"><LinkIcon className="w-3.5 h-3.5" /></button>
                </div>

                <textarea
                  rows={4}
                  value={activeConfigItem.instructions}
                  onChange={(e) => setActiveConfigItem({ ...activeConfigItem, instructions: e.target.value })}
                  placeholder="Escribe instrucciones adicionales para el candidato..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-[#6355A4] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveConfigItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveConfigItem}
                className="px-6 py-2 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer active:scale-98"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 2: VER CUESTIONARIO (Imagen 4)                                     */}
      {/* ========================================================================= */}
      {activePreviewItem && (() => {
        const targetTotal = (activePreviewItem.questionsLow !== undefined || activePreviewItem.questionsMed !== undefined || activePreviewItem.questionsHigh !== undefined)
          ? ((activePreviewItem.questionsLow || 0) + (activePreviewItem.questionsMed || 0) + (activePreviewItem.questionsHigh || 0))
          : (activePreviewItem.totalQuestions || 20);

        const previewQuestions = getQuestionsForTopic(
          activePreviewItem.name,
          activePreviewItem.difficulty,
          targetTotal || 20,
          {
            low: activePreviewItem.questionsLow,
            med: activePreviewItem.questionsMed,
            high: activePreviewItem.questionsHigh
          }
        );

        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setActivePreviewItem(null)} />
            <div className="relative z-10 w-full sm:w-[580px] h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#6355A4]" />
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">
                      Ver cuestionario
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePreviewItem(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-base"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 space-y-1.5">
                  <p className="text-xs text-slate-500">
                    Previsualiza las preguntas y respuestas configuradas para <strong className="text-slate-800">{activePreviewItem.name}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-[#6355A4] border border-purple-200">
                      Dificultad: {activePreviewItem.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {previewQuestions.length} preguntas configuradas
                    </span>
                    {activePreviewItem.questionsLow !== undefined && (
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {activePreviewItem.questionsLow} bajas
                      </span>
                    )}
                    {activePreviewItem.questionsMed !== undefined && (
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {activePreviewItem.questionsMed} medias
                      </span>
                    )}
                    {activePreviewItem.questionsHigh !== undefined && (
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {activePreviewItem.questionsHigh} altas
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Escala: {activePreviewItem.scoreScale} pts
                    </span>
                    {activePreviewItem.timeControl && (
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {activePreviewItem.minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Questions List (Imagen 4) */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-700 divide-y divide-slate-100">
                {previewQuestions.map((q, idx) => (
                  <div key={q.id} className={`${idx > 0 ? 'pt-6' : ''} space-y-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-800 leading-relaxed text-xs sm:text-sm">
                        {q.question}
                      </p>
                      {q.difficulty && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border ${
                          q.difficulty === 'Baja'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : q.difficulty === 'Media'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 pt-1 pl-1">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                            opt.isCorrect 
                              ? 'border-[#6355A4] bg-white' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            {opt.isCorrect && (
                              <div className="w-2 h-2 rounded-full bg-[#6355A4]" />
                            )}
                          </div>
                          <span className={`${opt.isCorrect ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                            {opt.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePreviewItem(null)}
                  className="px-6 py-2 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* DRAWER 3: LISTADO DE COMPETENCIAS (Imagen 5)                              */}
      {/* ========================================================================= */}
      {showCompetenciesDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowCompetenciesDrawer(false)} />
          <div className="relative z-10 w-full sm:w-[480px] h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div>
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  Listado De Competencias
                </h3>
                <button
                  type="button"
                  onClick={async () => {
                    setShowCompetenciesDrawer(false);
                    if (initialProfile?.id) {
                      await ProcessDataService.updateProfileCompetencies(initialProfile.id, selectedCompetencies);
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-base"
                >
                  ✕
                </button>
              </div>

              {/* Buscador */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    value={searchCompetency}
                    onChange={(e) => setSearchCompetency(e.target.value)}
                    placeholder="Busca una competencia por su nombre..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6355A4] focus:ring-1 focus:ring-purple-200 bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Categorías y Competencias Desplegables (Imagen 5) */}
            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100">
              {displayedCompetencyCategories.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.name) || searchCompetency.trim().length > 0;
                const filteredItems = cat.items.filter(it => 
                  it.toLowerCase().includes(searchCompetency.toLowerCase())
                );

                if (searchCompetency.trim().length > 0 && filteredItems.length === 0) {
                  return null;
                }

                return (
                  <div key={cat.name} className="py-2.5">
                    {/* Header de Categoría */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.name)}
                      className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        {renderCategoryIcon(cat.iconName, cat.color)}
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {cat.name} ({cat.items.length})
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Lista de items al expandir */}
                    {isExpanded && (
                      <div className="pl-6 pr-2 pt-1 pb-1 space-y-1 animate-in fade-in">
                        {filteredItems.length === 0 && cat.name === 'Favoritos' ? (
                          <div className="py-2.5 pl-3 text-xs text-slate-400 italic">
                            No tienes competencias favoritas aún. Haz clic en la estrella de cualquier competencia para añadirla aquí.
                          </div>
                        ) : (
                          filteredItems.map((compItem) => {
                            const isSelected = selectedCompetencies.includes(compItem);
                            const isFav = favoriteCompetencies.includes(compItem);
                            return (
                              <div
                                key={compItem}
                                onClick={() => handleToggleCompetency(compItem)}
                                className={`flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm group ${
                                  isSelected ? 'bg-purple-50/70 text-[#6355A4] font-medium' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(compItem);
                                    }}
                                    className="p-1 -ml-1 rounded hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer shrink-0"
                                    title={isFav ? "Quitar de favoritos" : "Marcar como favorito"}
                                  >
                                    <Star
                                      className={`w-4 h-4 transition-all ${
                                        isFav
                                          ? "fill-amber-400 text-amber-500 scale-110"
                                          : "text-slate-300 group-hover:text-amber-400"
                                      }`}
                                    />
                                  </button>
                                  <span className="truncate pr-2 font-normal">
                                    {compItem}
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleCompetency(compItem)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded text-[#6355A4] focus:ring-[#6355A4] border-slate-300 cursor-pointer shrink-0"
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer de Competencias (Imagen 5) */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600 shrink-0 bg-slate-50/30">
              <span className="font-bold text-slate-800">
                {new Set(BASE_COMPETENCY_CATEGORIES.flatMap(c => c.items)).size} Competencias Totales en Evaluar
              </span>
              <button
                type="button"
                onClick={async () => {
                  setShowCompetenciesDrawer(false);
                  if (initialProfile?.id) {
                    await ProcessDataService.updateProfileCompetencies(initialProfile.id, selectedCompetencies);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Listo ({selectedCompetencies.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 4: AÑADIR CUESTIONARIOS DESDE CATÁLOGO                             */}
      {/* ========================================================================= */}
      {activeDrawer === 'CONOCIMIENTOS' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveDrawer(null)} />
          <div className="relative z-10 w-full sm:w-[460px] h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <BookOpen className="w-5 h-5 text-[#6355A4]" />
                  <h3 className="font-bold text-base text-slate-900">
                    Añadir cuestionarios
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Buscador */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuestionnaire}
                    onChange={(e) => setSearchQuestionnaire(e.target.value)}
                    placeholder="Busca un cuestionario por su nombre..."
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#6355A4] bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lista con paginación real */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-4">
              {paginatedQuestionnaires.map((q) => {
                const isSelected = knowledgeItems.some(k => k.name.toLowerCase() === q.title.toLowerCase());
                return (
                  <div key={q.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-3 h-3 text-pink-600 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                            {q.title}
                          </h4>
                          {q.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 text-[#6355A4] font-medium border border-purple-100 shrink-0">
                              {q.category}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium mt-1 space-x-1.5">
                          <span className="text-rose-500 font-semibold">{q.alta} alta,</span>
                          <span className="text-amber-500 font-semibold">{q.media} media,</span>
                          <span className="text-emerald-600 font-semibold">{q.baja} baja</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleQuestionnaireFromCatalog(q.title)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#6355A4] border-[#6355A4] text-white shadow-2xs hover:bg-[#4E3F8D]'
                          : 'border-[#6355A4] text-[#6355A4] hover:bg-purple-50'
                      }`}
                      title={isSelected ? 'Quitar cuestionario' : 'Añadir cuestionario'}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer con paginación dinámica completa */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 hover:text-slate-800 disabled:opacity-30 cursor-pointer font-bold"
                title="Página anterior"
              >
                ⟨
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded-md font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-purple-100 text-[#6355A4]'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 hover:text-slate-800 disabled:opacity-30 cursor-pointer font-bold"
                title="Página siguiente"
              >
                ⟩
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 5: CONFIGURACIÓN DE DISC                                           */}
      {/* ========================================================================= */}
      {activeDrawer === 'DISC' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveDrawer(null)} />
          <div className="relative z-10 w-full sm:w-[480px] h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Configuración de Prueba DISC
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluación conductual y estilos de personalidad
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <span className="text-xs font-bold text-[#6355A4]">Perfil DISC Activo</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evalúa los 4 factores conductuales: Dominancia (D), Influencia (I), Estabilidad (S) y Cumplimiento (C).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                    Duración recomendada (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    defaultValue={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4]"
                  />
                  <span className="text-[11px] text-slate-400">
                    Tiempo sugerido: 10 minutos (24 reactivos conductuales de 4 opciones cada uno).
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                    Enfoque del perfil objetivo
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6355A4] bg-white">
                    <option value="COMERCIAL">Comercial y Atención al Cliente (Alta I y S)</option>
                    <option value="OPERATIVO">Operaciones y Soporte (Alta S y C)</option>
                    <option value="LIDERAZGO">Liderazgo y Supervisión (Alta D e I)</option>
                    <option value="ANALITICO">Análisis y Auditoría (Alta C y S)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Estado del componente</span>
                    <span className="text-emerald-600 font-bold">Activo y calibrado</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Genera automáticamente los gráficos de perfil Natural vs. Perfil Adaptado con informe psicológico para el reclutador.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="px-5 py-2 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ALERTA DE PERFIL GUARDADO CON ÉXITO                             */}
      {/* ========================================================================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                onBack();
              }}
              className="absolute top-5 right-5 w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ¡Perfil guardado con éxito!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 pl-10">
              ¿Qué deseas hacer a continuación?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Listado de perfiles
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onLaunchProcess && savedProfileId) {
                    onLaunchProcess(savedProfileId);
                  } else {
                    onBack();
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Lanzar proceso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VER MÁS DETALLES DE COMPETENCIA                                  */}
      {/* ========================================================================= */}
      {activeDetailsCompetency && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveDetailsCompetency(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 relative text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Detalle de Competencia
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {activeDetailsCompetency.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailsCompetency(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Descripción conductual:</span>
              </div>
              <p className="pl-5 text-slate-600">
                {activeDetailsCompetency.description}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Nivel de desarrollo de la prueba:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {competencyLevels[activeDetailsCompetency.name] ?? 7} / 10
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveDetailsCompetency(null)}
                className="w-full py-2.5 rounded-xl bg-[#6355A4] hover:bg-[#534493] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
