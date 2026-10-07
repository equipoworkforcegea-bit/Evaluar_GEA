import { CategoryDefinition, EvaluationTest } from '../types';

export const AVAILABLE_QUESTION_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'PSYCHOLOGICAL',
    name: 'Psicológicas & Psicométricas',
    badgeLabel: 'Psicología',
    description: 'Rasgos de personalidad ocupacional, estilo de razonamiento lógico, toma de decisiones y orientación a la tarea.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Razonamiento lógico y analítico',
      'Atención al detalle y rigor documental',
      'Pensamiento estructurado y metódico',
      'Orientación a la norma y cumplimiento'
    ]
  },
  {
    id: 'EMOTIONAL',
    name: 'Emocionales & Socioemocionales',
    badgeLabel: 'Emocional',
    description: 'Autorregulación bajo presión, tolerancia a la frustración, empatía intergrupal, madurez conductual y asertividad.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Autorregulación emocional bajo estrés',
      'Empatía y escucha activa con pares',
      'Tolerancia a la frustración y perseverancia',
      'Resolución constructiva de conflictos'
    ]
  },
  {
    id: 'EDUCATIONAL',
    name: 'Educativas & Psicopedagógicas',
    badgeLabel: 'Educativa',
    description: 'Agilidad de aprendizaje, asimilación autónoma de nuevas normativas/sistemas, hábitos de estudio y sistematización.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Agilidad de aprendizaje continuo (Learning Agility)',
      'Organización y gestión del tiempo de estudio/trabajo',
      'Sistematización y transferencia de conocimientos',
      'Adaptabilidad ante nuevas tecnologías'
    ]
  },
  {
    id: 'COMPETENCIES',
    name: 'Competencias Laborales Clave',
    badgeLabel: 'Competencias',
    description: 'Habilidades directivas e interpersonales: liderazgo situacional, trabajo en equipo, negociación y orientación a resultados.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Liderazgo e influencia positiva',
      'Trabajo colaborativo y sinergia',
      'Orientación a resultados medibles',
      'Comunicación persuasiva y asertiva'
    ]
  },
  {
    id: 'WORK_CASES',
    name: 'Situaciones Laborales & Casos Prácticos',
    badgeLabel: 'Situacional',
    description: 'Dilemas del día a día, contingencias operacionales, atención de usuarios molestos y priorización bajo incertidumbre.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Toma de decisiones operativas inmediatas',
      'Negociación de plazos y compromisos',
      'Manejo de reclamos e incidentes críticos',
      'Ética profesional y anticorrupción'
    ]
  },
  {
    id: 'TECHNICAL',
    name: 'Criterio Técnico & De Puesto',
    badgeLabel: 'Técnica',
    description: 'Conocimientos procedimentales, protocolos normativos del sector, gestión documental y mejores prácticas de la especialidad.',
    defaultDurationMinutes: 15,
    recommendedQuestions: 15,
    competencies: [
      'Criterio normativo institucional',
      'Control interno y prevención de riesgos',
      'Gestión documental y trazabilidad',
      'Uso eficiente de herramientas del puesto'
    ]
  }
];

export const INITIAL_EVALUATION_TESTS: EvaluationTest[] = [
  {
    id: 'test-gea-postpago-01',
    code: 'POSTPAGO CHILE PRUEBA',
    title: 'POSTPAGO CHILE PRUEBA',
    targetPosition: 'Postpago Chile Prueba',
    description: 'Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.sfgvtgrbfdsfghjgfdsfghgfdfghnjgfd...',
    instructions: 'Examen de avance unidireccional con cronómetro autoritativo en servidor.',
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-09-28T12:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Tania León',
    startDate: '28/09/2026',
    endDate: '01/03/2027',
    processStatus: 'LANZADO',
    profileName: 'Postpago Chile Prueba',
    candidateCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 0,
    stages: [
      {
        id: 'stg-pp-01',
        category: 'COMPETENCIES',
        name: 'Etapa de Habilidades Comerciales y Postpago',
        description: 'Capacidad de persuasión, negociación de planes y resolución ágil de reclamos.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'stg-pp-02',
        category: 'EMOTIONAL',
        name: 'Etapa Socioemocional & Manejo de Objeciones',
        description: 'Autocontrol bajo presión de llamadas, tolerancia a la frustración y escucha activa.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'stg-pp-03',
        category: 'WORK_CASES',
        name: 'Etapa de Casos Reales de Atención al Cliente',
        description: 'Incidentes frecuentes en servicios de telecomunicaciones y retención de usuarios.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Comunicación persuasiva y asertiva',
      'Autorregulación emocional bajo estrés',
      'Toma de decisiones operativas inmediatas',
      'Orientación a resultados medibles'
    ]
  },
  {
    id: 'test-gea-borrador-ty',
    code: 'BORRADOR TY',
    title: 'BORRADOR TY',
    targetPosition: 'Borrador TY',
    description: 'Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.Responsabilidades[Describe con p...',
    instructions: 'Examen en borrador.',
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-09-28T12:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Tania León',
    startDate: '28/09/2026',
    endDate: '01/03/2027',
    processStatus: 'BORRADOR',
    profileName: 'Borrador TY',
    candidateCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 0,
    stages: [],
    selectedCompetencies: []
  },
  {
    id: 'test-gea-claro-03',
    code: 'ASESOR POSTPAGO CLARO CHILE',
    title: 'ASESOR POSTPAGO CLARO CHILE',
    targetPosition: 'Asesor Postpago Claro Chile',
    description: '¡Buenos días! Te saludamos por parte de GEA. A continuación, realizarás una prueba psicológica como parte de nuestro proceso de evaluación.Antes de ...',
    instructions: 'Pruebas psicométricas validadas bajo perfil conductual de alto rendimiento.',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Tania León',
    startDate: '25/06/2026',
    endDate: '01/03/2027',
    processStatus: 'LANZADO',
    profileName: 'Asesor Postpago Claro Chile',
    candidateCount: 566,
    completedCount: 408,
    inProgressCount: 30,
    notStartedCount: 128,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 88,
    stages: [
      {
        id: 'stg-cl-01',
        category: 'EDUCATIONAL',
        name: 'Etapa de Aprendizaje de Nuevas Ofertas',
        description: 'Retención de promociones, reglas de portabilidad y beneficios vigentes.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      },
      {
        id: 'stg-cl-02',
        category: 'EMOTIONAL',
        name: 'Etapa de Resiliencia Telefónica',
        description: 'Energía y actitud positiva constante frente a alto volumen de llamadas.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'stg-cl-03',
        category: 'COMPETENCIES',
        name: 'Etapa de Negociación y Cierre',
        description: 'Detección de necesidades del usuario y persuasión ética con valor.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Agilidad de aprendizaje continuo (Learning Agility)',
      'Autorregulación emocional bajo estrés',
      'Negociación de plazos y compromisos',
      'Orientación a resultados medibles'
    ]
  },
  {
    id: 'test-gea-retencion-04',
    code: 'RETENCIONES FIJA',
    title: 'RETENCIONES FIJA',
    targetPosition: 'Retenciones Fija',
    description: 'Consejos: Haz un resumen del puesto, explica qué se necesita para triunfar en él y el lugar que ocupa en la empresa.Responsabilidades[Describe con p...',
    instructions: 'Evaluación psicométrica y casos de negociación de retención.',
    createdAt: '2026-06-05T08:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Cristina Vega',
    startDate: '05/06/2026',
    endDate: '05/06/2027',
    processStatus: 'LANZADO',
    profileName: 'Retenciones Fija',
    candidateCount: 1441,
    completedCount: 1200,
    inProgressCount: 44,
    notStartedCount: 197,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 91,
    stages: [],
    selectedCompetencies: [
      'Comunicación persuasiva y asertiva',
      'Autorregulación emocional bajo estrés',
      'Toma de decisiones operativas inmediatas'
    ]
  },
  {
    id: 'test-gea-hfc-02',
    code: 'ASESOR HFC MULTISKILL',
    title: 'ASESOR HFC MULTISKILL',
    targetPosition: 'Asesor HFC Multiskill',
    description: 'Proceso técnico-comercial para soporte y gestión multicanal de red fija y fibra.',
    instructions: 'Evaluación integral de criterio resolutivo y orientación al cliente.',
    createdAt: '2026-09-12T09:00:00Z',
    updatedAt: '2026-09-28T14:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Aldo Medina',
    startDate: '12/09/2026',
    endDate: '31/12/2026',
    processStatus: 'LANZADO',
    profileName: 'Asesor Postpago Claro Chile',
    candidateCount: 95,
    completedCount: 82,
    inProgressCount: 1,
    notStartedCount: 12,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 84,
    stages: [
      {
        id: 'stg-hfc-01',
        category: 'TECHNICAL',
        name: 'Etapa Técnica de Diagnóstico HFC',
        description: 'Conocimientos de red fija, conectividad y flujo de derivación a cuadrilla.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 40,
        isEnabled: true
      },
      {
        id: 'stg-hfc-02',
        category: 'EMOTIONAL',
        name: 'Etapa de Atención y Desescalamiento',
        description: 'Calma ante clientes insatisfechos por averías o demoras de reconexión.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      },
      {
        id: 'stg-hfc-03',
        category: 'WORK_CASES',
        name: 'Etapa de Casos Críticos de Soporte',
        description: 'Protocolos de atención, escalamientos y registro fidedigno en CRM.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Razonamiento lógico y analítico',
      'Atención al detalle y rigor documental',
      'Resolución constructiva de conflictos',
      'Manejo de reclamos e incidentes críticos'
    ]
  },
  {
    id: 'test-gea-001',
    code: 'ANALISTA DE OPERACIONES Y PROCESOS',
    title: 'ANALISTA DE OPERACIONES Y PROCESOS',
    targetPosition: 'Analista de Operaciones y Procesos',
    description: 'Batería oficial tripartita estructurada en tres etapas obligatorias de 15 minutos: psicopedagógica, socioemocional y casos laborales prácticos.',
    instructions: 'Examen de alta integridad de avance obligatorio unidireccional. 15 minutos exactos por etapa con cronómetro autoritativo en servidor.',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-28T09:00:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Tania León',
    startDate: '01/09/2026',
    endDate: '31/12/2026',
    processStatus: 'LANZADO',
    profileName: 'Analista de Operaciones',
    candidateCount: 10,
    completedCount: 6,
    inProgressCount: 2,
    notStartedCount: 2,
    disqualifiedCount: 0,
    hiredCount: 2,
    averageScore: 84,
    stages: [
      {
        id: 'stg-01',
        category: 'EDUCATIONAL',
        name: 'Etapa Psicopedagógica (Aprendizaje & Organización)',
        description: 'Mide capacidad de asimilación, organización autónoma y resolución heurística.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      },
      {
        id: 'stg-02',
        category: 'EMOTIONAL',
        name: 'Etapa Personal y Emocional (Manejo de Presión & Empatía)',
        description: 'Explora autocontrol, resiliencia ante la frustración y asertividad intergrupal.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'stg-03',
        category: 'WORK_CASES',
        name: 'Etapa de Situaciones Laborales (Casos Reales)',
        description: 'Presenta incidentes operacionales cotidianos y dilemas de priorización de clientes.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Razonamiento lógico y analítico',
      'Atención al detalle y rigor documental',
      'Autorregulación emocional bajo estrés',
      'Toma de decisiones operativas inmediatas',
      'Comunicación persuasiva y asertiva'
    ]
  },
  {
    id: 'test-gea-002',
    code: 'COORDINADOR DE TALENTO Y CULTURA',
    title: 'COORDINADOR DE TALENTO Y CULTURA',
    targetPosition: 'Coordinador de Talento y Cultura',
    description: 'Orientada a mandos medios y jefaturas. Combina inteligencia socioemocional, evaluación de competencias directivas y resolución de crisis de equipo.',
    instructions: 'Cada etapa cuenta con cronómetro independiente. Respuestas inmutables una vez confirmadas.',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-25T14:30:00Z',
    isActive: true,
    totalDurationMinutes: 45,
    launchedBy: 'Aldo Medina',
    startDate: '10/09/2026',
    endDate: '15/01/2027',
    processStatus: 'LANZADO',
    profileName: 'Jefatura de Talento',
    candidateCount: 4,
    completedCount: 2,
    inProgressCount: 1,
    notStartedCount: 1,
    disqualifiedCount: 0,
    hiredCount: 1,
    averageScore: 92,
    stages: [
      {
        id: 'stg-04',
        category: 'PSYCHOLOGICAL',
        name: 'Etapa Psicológica de Rasgos Directivos',
        description: 'Perfil de personalidad ocupacional, orientación al logro y estilo de toma de decisiones.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 30,
        isEnabled: true
      },
      {
        id: 'stg-05',
        category: 'EMOTIONAL',
        name: 'Etapa Socioemocional & Manejo de Equipos',
        description: 'Inteligencia intrapersonal, empatía ante situaciones de vulnerabilidad y resiliencia.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      },
      {
        id: 'stg-06',
        category: 'COMPETENCIES',
        name: 'Etapa de Competencias de Liderazgo',
        description: 'Capacidad de delegación, feedback formativo, negociación y motivación de colaboradores.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 35,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Liderazgo e influencia positiva',
      'Empatía y escucha activa con pares',
      'Resolución constructiva de conflictos',
      'Agilidad de aprendizaje continuo (Learning Agility)',
      'Trabajo colaborativo y sinergia'
    ]
  },
  {
    id: 'test-gea-003',
    code: 'ESPECIALISTA EN LOGÍSTICA Y COMPRAS',
    title: 'ESPECIALISTA EN LOGÍSTICA Y COMPRAS',
    targetPosition: 'Especialista en Logística y Compras',
    description: 'Especializada en procesos de almacén, compras de urgencia, negociación con proveedores y cumplimiento ético.',
    instructions: 'Reactivos de alta exigencia analítica y casos reales del sector logístico en Perú.',
    createdAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
    isActive: true,
    totalDurationMinutes: 30,
    launchedBy: 'Tania León',
    startDate: '15/09/2026',
    endDate: '28/02/2027',
    processStatus: 'LANZADO',
    profileName: 'Logística y Operaciones',
    candidateCount: 5,
    completedCount: 3,
    inProgressCount: 1,
    notStartedCount: 1,
    disqualifiedCount: 0,
    hiredCount: 0,
    averageScore: 78,
    stages: [
      {
        id: 'stg-07',
        category: 'WORK_CASES',
        name: 'Etapa de Casos Críticos de Abastecimiento',
        description: 'Dilemas de proveedores fallidos, quiebres de stock y despacho bajo presión horaria.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 50,
        isEnabled: true
      },
      {
        id: 'stg-08',
        category: 'TECHNICAL',
        name: 'Etapa de Criterio Técnico y Ética en Compras',
        description: 'Buenas prácticas de licitación, prevención de conflicto de interés y trazabilidad de activos.',
        durationMinutes: 15,
        questionCount: 15,
        weightPercent: 50,
        isEnabled: true
      }
    ],
    selectedCompetencies: [
      'Negociación de plazos y compromisos',
      'Control interno y prevención de riesgos',
      'Toma de decisiones operativas inmediatas',
      'Ética profesional y anticorrupción',
      'Tolerancia a la frustración y perseverancia'
    ]
  }
];
