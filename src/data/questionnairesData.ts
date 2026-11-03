export interface QuestionData {
  id: number;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  difficulty: 'Baja' | 'Media' | 'Alta';
  topic?: string;
}

export interface QuestionnaireOption {
  id: string;
  title: string;
  category: 'Comercial' | 'Idiomas' | 'Matemáticas' | 'Tecnología' | 'Gestión' | 'Operaciones';
  alta: number;
  media: number;
  baja: number;
}

// Catálogo completo de 36 cuestionarios (6 páginas exactas con 6 cuestionarios por página)
export const QUESTIONNAIRE_CATALOG: QuestionnaireOption[] = [
  // PÁGINA 1: Comercial y Negocios
  { id: 'q1', title: 'Mercadeo', category: 'Comercial', alta: 42, media: 42, baja: 20 },
  { id: 'q2', title: 'Merchandising', category: 'Comercial', alta: 27, media: 50, baja: 107 },
  { id: 'q3', title: 'Negociación', category: 'Comercial', alta: 25, media: 100, baja: 30 },
  { id: 'q4', title: 'Psicometría', category: 'Gestión', alta: 20, media: 25, baja: 20 },
  { id: 'q5', title: 'Planificación Estratégica', category: 'Gestión', alta: 14, media: 28, baja: 37 },
  { id: 'q6', title: 'Ventas', category: 'Comercial', alta: 20, media: 35, baja: 25 },

  // PÁGINA 2: Servicio, Liderazgo e Idiomas
  { id: 'q7', title: 'Atención al Cliente', category: 'Comercial', alta: 15, media: 40, baja: 25 },
  { id: 'q8', title: 'Liderazgo & Supervisión', category: 'Gestión', alta: 18, media: 30, baja: 15 },
  { id: 'q9', title: 'Español nivel basico', category: 'Idiomas', alta: 15, media: 25, baja: 20 },
  { id: 'q10', title: 'Español corporativo y redacción', category: 'Idiomas', alta: 18, media: 22, baja: 20 },
  { id: 'q11', title: 'Inglés nivel básico (A2)', category: 'Idiomas', alta: 15, media: 20, baja: 25 },
  { id: 'q12', title: 'Inglés intermedio (B1/B2)', category: 'Idiomas', alta: 20, media: 30, baja: 15 },

  // PÁGINA 3: Idiomas y Matemáticas
  { id: 'q13', title: 'Inglés comercial y negocios', category: 'Idiomas', alta: 22, media: 28, baja: 18 },
  { id: 'q14', title: 'Portugués para atención al cliente', category: 'Idiomas', alta: 12, media: 20, baja: 24 },
  { id: 'q15', title: 'Razonamiento Matemático', category: 'Matemáticas', alta: 25, media: 30, baja: 20 },
  { id: 'q16', title: 'Aritmética comercial y porcentajes', category: 'Matemáticas', alta: 20, media: 25, baja: 25 },
  { id: 'q17', title: 'Estadística básica y análisis', category: 'Matemáticas', alta: 18, media: 24, baja: 18 },
  { id: 'q18', title: 'Lógica y resolución de problemas', category: 'Matemáticas', alta: 22, media: 35, baja: 20 },

  // PÁGINA 4: Tecnología y Herramientas Digitales
  { id: 'q19', title: 'Excel intermedio y avanzado', category: 'Tecnología', alta: 25, media: 35, baja: 20 },
  { id: 'q20', title: 'Contabilidad general básica', category: 'Operaciones', alta: 18, media: 26, baja: 20 },
  { id: 'q21', title: 'Facturación y cobranzas', category: 'Operaciones', alta: 16, media: 30, baja: 22 },
  { id: 'q22', title: 'Ciberseguridad y protección de datos', category: 'Tecnología', alta: 20, media: 25, baja: 20 },
  { id: 'q23', title: 'Gestión de proyectos ágiles', category: 'Tecnología', alta: 18, media: 28, baja: 20 },
  { id: 'q24', title: 'Herramientas colaborativas digitales', category: 'Tecnología', alta: 12, media: 25, baja: 28 },

  // PÁGINA 5: Productividad, Comunicación y Calidad
  { id: 'q25', title: 'Gestión del tiempo y productividad', category: 'Gestión', alta: 14, media: 26, baja: 22 },
  { id: 'q26', title: 'Comunicación asertiva corporativa', category: 'Gestión', alta: 16, media: 30, baja: 24 },
  { id: 'q27', title: 'Calidad de servicio y métricas CX', category: 'Operaciones', alta: 15, media: 28, baja: 22 },
  { id: 'q28', title: 'Recursos Humanos y selección', category: 'Gestión', alta: 18, media: 24, baja: 20 },
  { id: 'q29', title: 'Prevención de riesgos laborales (SST)', category: 'Operaciones', alta: 14, media: 25, baja: 25 },
  { id: 'q30', title: 'Ética y cumplimiento normativo', category: 'Gestión', alta: 15, media: 25, baja: 20 },

  // PÁGINA 6: Operaciones, Contact Center y Finanzas
  { id: 'q31', title: 'Telemarketing y ventas outbound', category: 'Comercial', alta: 16, media: 30, baja: 22 },
  { id: 'q32', title: 'Marketing digital y redes sociales', category: 'Comercial', alta: 20, media: 28, baja: 20 },
  { id: 'q33', title: 'Análisis de crédito y riesgo', category: 'Operaciones', alta: 22, media: 25, baja: 18 },
  { id: 'q34', title: 'Operaciones de Contact Center', category: 'Operaciones', alta: 18, media: 32, baja: 24 },
  { id: 'q35', title: 'Inteligencia emocional laboral', category: 'Gestión', alta: 14, media: 28, baja: 24 },
  { id: 'q36', title: 'Gestión de inventarios y logística', category: 'Operaciones', alta: 16, media: 26, baja: 20 }
];

// BANCOS DE PREGUNTAS (Al menos 20 preguntas por materia con dificultad Baja, Media y Alta)
export const QUESTIONS_BY_TOPIC: Record<string, QuestionData[]> = {
  'Planificación estratégica': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. Como proceso, la Planificación Estratégica permite no sólo establecer los objetivos de la organización, sino también, definir los procedimientos adecuados que la organización deberá emprender para alcanzarlos.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Media',
      question: '2. ¿Cuál de las siguientes alternativas corresponde a las fases principales del proceso de Planificación Estratégica?',
      options: [
        { text: 'Normativa, táctico-situacional, operativa y estratégica', isCorrect: false },
        { text: 'Filosófica, explicativa, analítica, operativa y situacional', isCorrect: false },
        { text: 'Filosófica, analítica, programática, operativa y cuantitativa', isCorrect: true },
        { text: 'Diagnóstica, presupuestaria, punitiva y retrospectiva', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Baja',
      question: '3. A nivel conceptual no existen diferencias entre lo que se entiende por Planificación Estratégica como proceso y Planificación Estratégica como instrumento.',
      options: [
        { text: 'VERDADERO', isCorrect: false },
        { text: 'FALSO', isCorrect: true }
      ]
    },
    {
      id: 4,
      difficulty: 'Baja',
      question: '4. ¿Qué elemento de la Planificación Estratégica define el rumbo y la aspiración futura de la organización a largo plazo?',
      options: [
        { text: 'Visión', isCorrect: true },
        { text: 'Misión', isCorrect: false },
        { text: 'Presupuesto anual', isCorrect: false },
        { text: 'Reglamento interno', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Baja',
      question: '5. En el análisis FODA, ¿cuáles representan factores provenientes del entorno externo a la organización?',
      options: [
        { text: 'Fortalezas y Debilidades', isCorrect: false },
        { text: 'Oportunidades y Amenazas', isCorrect: true },
        { text: 'Objetivos y Políticas', isCorrect: false },
        { text: 'Recursos Humanos y Financieros', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Media',
      question: '6. ¿Cuál es el propósito central del Cuadro de Mando Integral (Balanced Scorecard)?',
      options: [
        { text: 'Monitorear únicamente los estados financieros a final del ejercicio contable', isCorrect: false },
        { text: 'Traducir la estrategia en objetivos e indicadores medibles en 4 perspectivas interrelacionadas', isCorrect: true },
        { text: 'Sancionar a las áreas que no logren el 100% de cumplimiento presupuestario', isCorrect: false },
        { text: 'Reemplazar el organigrama funcional de la empresa', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Media',
      question: '7. Las perspectivas clásicas del Balanced Scorecard desarrollado por Kaplan y Norton son:',
      options: [
        { text: 'Financiera, Clientes, Procesos Internos, Aprendizaje y Crecimiento', isCorrect: true },
        { text: 'Ventas, Marketing, Logística y Contabilidad', isCorrect: false },
        { text: 'Dirección, Operaciones, Legal y Auditoría', isCorrect: false },
        { text: 'Económica, Social, Ambiental y Gubernamental', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Media',
      question: '8. En la matriz de las 5 Fuerzas de Michael Porter, ¿cuál de los siguientes NO es una fuerza competitiva del sector?',
      options: [
        { text: 'Poder de negociación de los proveedores', isCorrect: false },
        { text: 'Amenaza de productos sustitutos', isCorrect: false },
        { text: 'Rivalidad entre competidores existentes', isCorrect: false },
        { text: 'Poder de intervención de los accionistas internos', isCorrect: true }
      ]
    },
    {
      id: 9,
      difficulty: 'Baja',
      question: '9. Un objetivo formulado bajo la metodología SMART debe ser:',
      options: [
        { text: 'Específico, Medible, Alcanzable, Relevante y con Límite de Tiempo', isCorrect: true },
        { text: 'Simple, Monetario, Auditable, Rápido y Táctico', isCorrect: false },
        { text: 'Sistemático, Mayoritario, Amplio, Redituable y Total', isCorrect: false },
        { text: 'Secreto, Moderado, Aceptado, Real y Teórico', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Alta',
      question: '10. En la Matriz BCG, una Unidad Estratégica de Negocio clasificada como "Vaca Lechera" se caracteriza por:',
      options: [
        { text: 'Alta participación en un mercado de bajo crecimiento, generando flujos constantes de efectivo', isCorrect: true },
        { text: 'Baja participación en un mercado de alto crecimiento que requiere constante inyección de capital', isCorrect: false },
        { text: 'Alta participación en un mercado de altísimo crecimiento que lidera la innovación', isCorrect: false },
        { text: 'Baja participación en un mercado estancado que debe ser liquidada inmediatamente', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Alta',
      question: '11. ¿Cuál es la diferencia fundamental entre una estrategia de "Diferenciación" y una de "Liderazgo en Costos"?',
      options: [
        { text: 'La diferenciación busca atributos únicos valorados por el cliente, mientras que liderazgo en costos busca la estructura de costos más baja del sector', isCorrect: true },
        { text: 'La diferenciación es exclusiva de empresas de servicios y los costos de empresas industriales', isCorrect: false },
        { text: 'El liderazgo en costos implica siempre ofrecer la peor calidad del mercado', isCorrect: false },
        { text: 'No existe diferencia; ambas buscan aumentar el volumen de ventas bajando precios', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Media',
      question: '12. El análisis PESTEL analiza el macroentorno considerando las dimensiones:',
      options: [
        { text: 'Políticas, Económicas, Sociales, Tecnológicas, Ecológicas y Legales', isCorrect: true },
        { text: 'Presupuestales, Estratégicas, Sectoriales, Temporales, Evaluativas y Logísticas', isCorrect: false },
        { text: 'Productivas, Empresariales, Sindicales, Tributarias, Estatales y Laborales', isCorrect: false },
        { text: 'Públicas, Emocionales, Sanitarias, Terrestres, Educativas y Legales', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Media',
      question: '13. En la Cadena de Valor de Porter, ¿cuál de las siguientes es una "Actividad Primaria"?',
      options: [
        { text: 'Logística de entrada y operaciones de producción', isCorrect: true },
        { text: 'Gestión de recursos humanos', isCorrect: false },
        { text: 'Desarrollo tecnológico', isCorrect: false },
        { text: 'Infraestructura de la empresa', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Alta',
      question: '14. Cuando una empresa decide adquirir o integrarse verticalmente hacia adelante en su cadena de valor, busca:',
      options: [
        { text: 'Controlar la distribución o venta directa al consumidor final eliminando intermediarios', isCorrect: true },
        { text: 'Comprar a sus proveedores de materia prima para asegurar el abastecimiento', isCorrect: false },
        { text: 'Adquirir competidores directos en su mismo nivel de mercado', isCorrect: false },
        { text: 'Diversificarse en sectores completamente no relacionados con su negocio principal', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Baja',
      question: '15. ¿Qué es un KPI (Key Performance Indicator)?',
      options: [
        { text: 'Un indicador clave de desempeño cuantitativo o cualitativo para medir el progreso hacia un objetivo', isCorrect: true },
        { text: 'Un informe contable de pérdidas y ganancias auditado por el estado', isCorrect: false },
        { text: 'Un certificado de homologación de proveedores', isCorrect: false },
        { text: 'Un software de gestión de nóminas y planillas', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Media',
      question: '16. Los Planes Operativos (POA) se distinguen del Plan Estratégico principalmente por:',
      options: [
        { text: 'Su horizonte temporal a corto plazo (generalmente 1 año) y su nivel de detalle en tareas y recursos', isCorrect: true },
        { text: 'Que no requieren ningún tipo de presupuesto para ejecutarse', isCorrect: false },
        { text: 'Que son elaborados exclusivamente por la junta de accionistas sin consultar a las áreas', isCorrect: false },
        { text: 'Que sustituyen la misión y visión corporativa cada trimestre', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Alta',
      question: '17. La estrategia de "Océano Azul" propuesta por Chan Kim y Renée Mauborgne propone:',
      options: [
        { text: 'Crear nuevos espacios de mercado no disputados y hacer irrelevante a la competencia', isCorrect: true },
        { text: 'Competir agresivamente mediante guerras de precios en industrias saturadas', isCorrect: false },
        { text: 'Invertir todo el capital corporativo en transporte marítimo internacional', isCorrect: false },
        { text: 'Copiar exactamente el modelo de negocio del competidor líder del sector', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Baja',
      question: '18. La Misión de una empresa debe responder fundamentalmente a la pregunta:',
      options: [
        { text: '¿Cuál es nuestra razón de ser y a quién servimos en el presente?', isCorrect: true },
        { text: '¿Cuánto dinero ganaremos en los próximos diez años?', isCorrect: false },
        { text: '¿Quién será el próximo gerente general?', isCorrect: false },
        { text: '¿Qué impuestos tributarios pagaremos el siguiente mes?', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Alta',
      question: '19. En la Matriz de Ansoff, el crecimiento mediante la introducción de productos existentes en mercados totalmente nuevos se denomina:',
      options: [
        { text: 'Desarrollo de Mercado', isCorrect: true },
        { text: 'Penetración de Mercado', isCorrect: false },
        { text: 'Desarrollo de Producto', isCorrect: false },
        { text: 'Diversificación pura', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Media',
      question: '20. ¿Qué se entiende por "Alineamiento Estratégico" dentro de una organización?',
      options: [
        { text: 'La coherencia y sincronización de los objetivos individuales y de equipo con los objetivos globales de la empresa', isCorrect: true },
        { text: 'La coincidencia física en los horarios de entrada y salida del personal', isCorrect: false },
        { text: 'El uso uniforme del mismo software en todas las computadoras', isCorrect: false },
        { text: 'La firma obligatoria del manual de funciones por todos los colaboradores', isCorrect: false }
      ]
    }
  ],

  'Español nivel basico': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. Identifique la opción que presenta adecuada concordancia gramatical:',
      options: [
        { text: 'El grupo de colaboradores asistió puntualmente a la reunión.', isCorrect: true },
        { text: 'El grupo de colaboradores asistieron puntualmente a la reunión.', isCorrect: false },
        { text: 'Habían muchas dudas sobre el procedimiento.', isCorrect: false },
        { text: 'La acta fue redactada ayer.', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Baja',
      question: '2. ¿Cuál de las siguientes oraciones utiliza correctamente la tilde diacrítica?',
      options: [
        { text: 'Él entregó el informe a tiempo para la auditoría.', isCorrect: true },
        { text: 'El informe fue entregado por el.', isCorrect: false },
        { text: 'Tu tienes que presentar los resultados hoy.', isCorrect: false },
        { text: 'Se que vendrán más postulantes esta tarde.', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Baja',
      question: '3. Señale la palabra que está correctamente escrita según las reglas de acentuación:',
      options: [
        { text: 'Examen', isCorrect: true },
        { text: 'Exámen', isCorrect: false },
        { text: 'Imágen', isCorrect: false },
        { text: 'Origén', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Media',
      question: '4. ¿En cuál de las siguientes opciones se hace un uso correcto de la coma vocativa?',
      options: [
        { text: 'Estimado colega, le remito los archivos solicitados.', isCorrect: true },
        { text: 'Estimado colega le remito, los archivos solicitados.', isCorrect: false },
        { text: 'Estimado, colega le remito los archivos solicitados.', isCorrect: false },
        { text: 'Estimado colega le remito los archivos, solicitados.', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Baja',
      question: '5. ¿Cuál es el antónimo adecuado de la palabra "EFÍMERO"?',
      options: [
        { text: 'Duradero', isCorrect: true },
        { text: 'Fugaz', isCorrect: false },
        { text: 'Pasajero', isCorrect: false },
        { text: 'Breve', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Media',
      question: '6. Identifique el enunciado que NO incurre en solecismo ni discordancia:',
      options: [
        { text: 'Hubo varios reclamos durante el turno de la mañana.', isCorrect: true },
        { text: 'Hubieron varios reclamos durante el turno de la mañana.', isCorrect: false },
        { text: 'Habían bastantes personas esperando atención.', isCorrect: false },
        { text: 'Hicieron mucho calor en las oficinas operativas.', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Baja',
      question: '7. Señale la oración que presenta correcta puntuación:',
      options: [
        { text: 'Compramos café, azúcar, tazas y servilletas para la reunión.', isCorrect: true },
        { text: 'Compramos café, azúcar, tazas, y servilletas, para la reunión.', isCorrect: false },
        { text: 'Compramos, café azúcar tazas y servilletas para la reunión.', isCorrect: false },
        { text: 'Compramos café: azúcar: tazas y servilletas para la reunión.', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Media',
      question: '8. ¿Cuál de las siguientes palabras es un sustantivo colectivo?',
      options: [
        { text: 'Plantel', isCorrect: true },
        { text: 'Trabajadores', isCorrect: false },
        { text: 'Oficinas', isCorrect: false },
        { text: 'Archivadores', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Alta',
      question: '9. Identifique la oración que presenta un caso de dequeísmo:',
      options: [
        { text: 'Pienso de que la decisión tomada fue la más prudente.', isCorrect: true },
        { text: 'Estoy seguro de que vendrán mejores resultados.', isCorrect: false },
        { text: 'Nos percatamos de que faltaba una firma en el contrato.', isCorrect: false },
        { text: 'Tengo la convicción de que alcanzaremos el objetivo.', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Baja',
      question: '10. Las palabras "Hojear" y "Ojear" son un ejemplo de:',
      options: [
        { text: 'Palabras homófonas', isCorrect: true },
        { text: 'Palabras antónimas', isCorrect: false },
        { text: 'Palabras hiperónimas', isCorrect: false },
        { text: 'Palabras parónimas de significado idéntico', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Media',
      question: '11. ¿Cuál es el significado contextual del término "ASERTIVO"?',
      options: [
        { text: 'Que expresa sus ideas y derechos de forma clara, respetuosa y oportuna', isCorrect: true },
        { text: 'Que siempre impone su voluntad sin escuchar a los demás', isCorrect: false },
        { text: 'Que acata sumisamente las órdenes sin expresar desacuerdos', isCorrect: false },
        { text: 'Que adivina con exactitud el futuro de un proyecto', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Baja',
      question: '12. En la oración "Los postulantes entregaron sus documentos ayer", el sujeto es:',
      options: [
        { text: 'Los postulantes', isCorrect: true },
        { text: 'Sus documentos', isCorrect: false },
        { text: 'Ayer', isCorrect: false },
        { text: 'Entregaron', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Media',
      question: '13. Identifique la palabra correctamente tildada por regla de hiato acentual:',
      options: [
        { text: 'Actuaría', isCorrect: true },
        { text: 'Pais', isCorrect: false },
        { text: 'Raiz', isCorrect: false },
        { text: 'Baul', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Alta',
      question: '14. Señale la opción en la que se utiliza correctamente el punto y coma (;):',
      options: [
        { text: 'El equipo de Lima cumplió la meta de ventas; el de Arequipa, por su parte, superó el margen esperado.', isCorrect: true },
        { text: 'El equipo; de Lima cumplió la meta de ventas el de Arequipa.', isCorrect: false },
        { text: 'Para la reunión necesitamos; proyectores, micrófonos y punteros.', isCorrect: false },
        { text: 'Estimado gerente general; le escribo para manifestar mi opinión.', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Baja',
      question: '15. ¿Cuál es el plural correcto de la palabra "carácter"?',
      options: [
        { text: 'Caracteres', isCorrect: true },
        { text: 'Carácteres', isCorrect: false },
        { text: 'Carácters', isCorrect: false },
        { text: 'Carácteris', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Media',
      question: '16. ¿Qué función de la lengua predomina en el mensaje: "Por favor, mantén silencio en la sala de capacitación"?',
      options: [
        { text: 'Función apelativa o conativa', isCorrect: true },
        { text: 'Función referencial o informativa', isCorrect: false },
        { text: 'Función poética o estética', isCorrect: false },
        { text: 'Función fática o de contacto', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Alta',
      question: '17. Identifique la opción que no incurre en queísmo:',
      options: [
        { text: 'Se convenció de que el proyecto era viable técnica y financieramente.', isCorrect: true },
        { text: 'Se convenció que el proyecto era viable técnica y financieramente.', isCorrect: false },
        { text: 'No me di cuenta que la reunión ya había terminado.', isCorrect: false },
        { text: 'Estoy seguro que todos aprobarán la evaluación.', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Baja',
      question: '18. ¿Cuál es el término correcto para completar la oración: "El cliente solicitó un informe _____ de los gastos"?',
      options: [
        { text: 'pormenorizado', isCorrect: true },
        { text: 'pormenorizado', isCorrect: true },
        { text: 'por menorisado', isCorrect: false },
        { text: 'pormenorizao', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Media',
      question: '19. Seleccione el conector lógico que exprese oposición o concesión en la redacción corporativa:',
      options: [
        { text: 'No obstante', isCorrect: true },
        { text: 'Por lo tanto', isCorrect: false },
        { text: 'En consecuencia', isCorrect: false },
        { text: 'Asimismo', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Alta',
      question: '20. ¿Qué palabra contiene un prefijo que denota "oposición o contrariedad"?',
      options: [
        { text: 'Antisindical', isCorrect: true },
        { text: 'Subgerente', isCorrect: false },
        { text: 'Precontrato', isCorrect: false },
        { text: 'Coautor', isCorrect: false }
      ]
    }
  ],

  'Negociación': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. El concepto de MAAN (Mejor Alternativa a un Acuerdo Negociado) se utiliza para evaluar si conviene aceptar un acuerdo propuesto frente a no acordar nada.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Baja',
      question: '2. ¿Cuál es el objetivo primordial de una negociación de tipo integrativa?',
      options: [
        { text: 'Maximizar el beneficio mutuo mediante soluciones ganar-ganar', isCorrect: true },
        { text: 'Obtener la mayor ganancia a expensas de la derrota de la contraparte', isCorrect: false },
        { text: 'Ceder incondicionalmente en todas las demandas para evitar discusiones', isCorrect: false },
        { text: 'Dilatar los plazos indefinidamente para desgastar al interlocutor', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Media',
      question: '3. En el Modelo de Negociación de Harvard, se recomienda negociar con base en:',
      options: [
        { text: 'Intereses y necesidades reales de las partes, no en posiciones rígidas', isCorrect: true },
        { text: 'El poder jerárquico y amenazas contractuales', isCorrect: false },
        { text: 'Vínculos afectivos y simpatía personal', isCorrect: false },
        { text: 'La mayor cantidad de concesiones unilaterales posibles', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Baja',
      question: '4. ¿Qué significa la sigla ZOPA en el ámbito de la negociación comercial?',
      options: [
        { text: 'Zona de Posible Acuerdo (Zone of Possible Agreement)', isCorrect: true },
        { text: 'Zona Operativa de Precios Aplicados', isCorrect: false },
        { text: 'Zona Oficial de Pago Anticipado', isCorrect: false },
        { text: 'Zona Organizacional de Políticas y Aranceles', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Media',
      question: '5. Cuando una de las partes utiliza la técnica del "Anclaje" al iniciar la negociación de precios, busca:',
      options: [
        { text: 'Fijar una cifra inicial de referencia que influya en las ofertas y contraofertas subsecuentes', isCorrect: true },
        { text: 'Obligar legalmente a firmar el contrato en el primer minuto', isCorrect: false },
        { text: 'Prohibir que la otra parte hable durante la sesión', isCorrect: false },
        { text: 'Romper la negociación de manera inmediata y definitiva', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Baja',
      question: '6. Escuchar activamente en una mesa de negociación significa:',
      options: [
        { text: 'Prestar atención plena, entender los argumentos y verificar la comprensión sin interrumpir agresivamente', isCorrect: true },
        { text: 'Esperar en silencio a que la otra persona termine para repetir nuestro mismo discurso', isCorrect: false },
        { text: 'Aceptar todo lo que dice la otra parte sin formular objeciones', isCorrect: false },
        { text: 'Grabar la conversación sin el consentimiento del interlocutor', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Media',
      question: '7. En una negociación distributiva (ganar-perder), el recurso en juego es visto generalmente como:',
      options: [
        { text: 'Un pastel de tamaño fijo donde lo que gana uno lo pierde el otro', isCorrect: true },
        { text: 'Un recurso ilimitado que puede multiplicarse infinitamente', isCorrect: false },
        { text: 'Un beneficio que solo favorece al intermediario', isCorrect: false },
        { text: 'Una donación sin fines comerciales ni compensaciones', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Alta',
      question: '8. ¿Cuál es la mejor táctica para responder cuando la contraparte adopta una posición extrema o intransigente?',
      options: [
        { text: 'Indagar las razones subyacentes e intereses que motivan esa postura mediante preguntas abiertas', isCorrect: true },
        { text: 'Responder con una exigencia aún más extrema de inmediato', isCorrect: false },
        { text: 'Levantarse de la mesa gritando para intimidar al adversario', isCorrect: false },
        { text: 'Ceder completamente en el acto sin pedir nada a cambio', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Media',
      question: '9. En negociación, el "Punto de Reserva" (o precio de reserva) representa:',
      options: [
        { text: 'El límite máximo o mínimo aceptable más allá del cual es preferible retirarse sin acuerdo', isCorrect: true },
        { text: 'El descuento promocional reservado exclusivamente para clientes premium', isCorrect: false },
        { text: 'La reserva monetaria que el banco exige para otorgar una fianza', isCorrect: false },
        { text: 'El costo del local donde se celebra la reunión de negociación', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Baja',
      question: '10. Hacer una concesión sin solicitar nada a cambio suele ser percibido por la contraparte como:',
      options: [
        { text: 'Una señal de debilidad o de que el valor inicial estaba inflado', isCorrect: true },
        { text: 'Una muestra obligatoria de cortesía profesional', isCorrect: false },
        { text: 'El único camino legal para firmar una minuta', isCorrect: false },
        { text: 'Una garantía de que la otra parte cederá el doble', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Media',
      question: '11. ¿Qué es el "Reencuadre" (Reframing) en una negociación compleja?',
      options: [
        { text: 'Cambiar la perspectiva de un problema para enfocarlo como un desafío u oportunidad conjunta de solución', isCorrect: true },
        { text: 'Modificar los términos del contrato después de haber sido firmado', isCorrect: false },
        { text: 'Contratar a un nuevo abogado para sustituir al equipo legal', isCorrect: false },
        { text: 'Aceptar el reclamo del cliente devolviendo el dinero de inmediato', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Alta',
      question: '12. Cuando un cliente te dice: "Su propuesta es excelente, pero la competencia me ofrece un 20% menos", ¿cuál es la respuesta más estratégica?',
      options: [
        { text: 'Revisar qué incluye exactamente la oferta de la competencia y resaltar el valor diferencial y garantías de nuestra solución', isCorrect: true },
        { text: 'Igualar el 20% de descuento de inmediato sin analizar la rentabilidad', isCorrect: false },
        { text: 'Decirle al cliente que la competencia ofrece productos de mala calidad sin pruebas', isCorrect: false },
        { text: 'Dar por terminada la relación comercial de forma grosera', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Baja',
      question: '13. En una negociación, el lenguaje no verbal (postura, contacto visual, tono de voz) influye en la confianza percibida.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Media',
      question: '14. La táctica del "Bueno y el Malo" (Good Cop / Bad Cop) es una técnica psicológica que busca:',
      options: [
        { text: 'Generar contraste para que el negociador ceda con el negociador "amable" por temor al "duro"', isCorrect: true },
        { text: 'Dividir las tareas de secretaría y contabilidad en la empresa', isCorrect: false },
        { text: 'Capacitar a dos personas al mismo tiempo en servicio al cliente', isCorrect: false },
        { text: 'Cumplir con las normas de seguridad e higiene del trabajo', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Alta',
      question: '15. Para ampliar el pastel de valor en una negociación comercial estancada en el precio, se recomienda:',
      options: [
        { text: 'Incorporar variables adicionales negociables como plazos de entrega, formas de pago, garantías y servicios post-venta', isCorrect: true },
        { text: 'Reiterar el precio con mayor agresividad hasta que el cliente acepte', isCorrect: false },
        { text: 'Negarse a hablar de cualquier tema que no sea el precio unitario', isCorrect: false },
        { text: 'Renunciar a la comisión de venta de forma voluntaria', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Baja',
      question: '16. Si tu MAAN (Mejor Alternativa a un Acuerdo Negociado) es muy sólida y atractiva:',
      options: [
        { text: 'Tienes mayor poder de negociación y seguridad para no aceptar propuestas desfavorables', isCorrect: true },
        { text: 'Estás obligado a aceptar la primera oferta que te presenten', isCorrect: false },
        { text: 'Debes revelar tu MAAN de inmediato antes de iniciar la reunión', isCorrect: false },
        { text: 'Tu poder de negociación se anula por completo', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Media',
      question: '17. Las preguntas reflexivas en la negociación sirven principalmente para:',
      options: [
        { text: 'Invitar a la otra parte a considerar el impacto a largo plazo de su decisión o falta de acuerdo', isCorrect: true },
        { text: 'Hacer perder el tiempo deliberadamente para cansar a la contraparte', isCorrect: false },
        { text: 'Comprobar si el interlocutor sabe sumar y restar sin calculadora', isCorrect: false },
        { text: 'Memorizar los nombres de los asistentes a la mesa', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Alta',
      question: '18. ¿Cómo debe gestionarse una situación donde la contraparte intenta imponer un ultimátum ("Tómalo o déjalo ahora mismo")?',
      options: [
        { text: 'Mantener la calma, no reaccionar impulsivamente, reformular la propuesta o proponer un receso para evaluar opciones objetivas', isCorrect: true },
        { text: 'Aceptar el ultimátum inmediatamente sin leer las condiciones', isCorrect: false },
        { text: 'Iniciar una discusión acalorada con insultos', isCorrect: false },
        { text: 'Firmar con un nombre falso para no comprometerse', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Baja',
      question: '19. En el cierre de una negociación, resumir por escrito los acuerdos alcanzados y los compromisos asumidos evita malentendidos posteriores.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Media',
      question: '20. ¿Qué caracteriza a un negociador que utiliza el estilo "Colaborativo"?',
      options: [
        { text: 'Alta asertividad y alta cooperación: busca maximizar los resultados de ambas partes protegiendo la relación a largo plazo', isCorrect: true },
        { text: 'Baja asertividad y alta cooperación: prefiere perder con tal de complacer a los demás', isCorrect: false },
        { text: 'Alta asertividad y baja cooperación: busca ganar a toda costa sin importarle la relación', isCorrect: false },
        { text: 'Baja asertividad y baja cooperación: evita a toda costa sentarse a negociar', isCorrect: false }
      ]
    }
  ],

  'Psicometría': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. La confiabilidad de un instrumento de medición psicométrica evalúa:',
      options: [
        { text: 'La consistencia y reproducibilidad de las puntuaciones obtenidas a lo largo de aplicaciones sucesivas', isCorrect: true },
        { text: 'El costo económico de la aplicación y corrección del test', isCorrect: false },
        { text: 'La duración total de la sesión de evaluación en minutos', isCorrect: false },
        { text: 'El grado de agrado o simpatía del evaluado hacia el evaluador', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Media',
      question: '2. ¿Qué mide el coeficiente Alfa de Cronbach?',
      options: [
        { text: 'La consistencia interna de los ítems de una escala psicométrica unidimensional', isCorrect: true },
        { text: 'La correlación bivariada entre dos variables continuas independientes', isCorrect: false },
        { text: 'El tiempo promedio de respuesta por reactivo en una prueba cronometrada', isCorrect: false },
        { text: 'El porcentaje de aciertos mínimos para aprobar un examen universitario', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Baja',
      question: '3. La "Validez de Contenido" en una prueba psicométrica indica si:',
      options: [
        { text: 'Los reactivos representan adecuadamente el dominio conceptual o constructo que se pretende evaluar', isCorrect: true },
        { text: 'El examen tiene una portada visualmente atractiva para los candidatos', isCorrect: false },
        { text: 'Las respuestas son corregidas por un software informático', isCorrect: false },
        { text: 'El test fue publicado hace menos de cinco años', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Media',
      question: '4. ¿Qué es un "Baremo" en psicometría aplicada?',
      options: [
        { text: 'Una tabla normativa que permite transformar las puntuaciones directas en percentiles o puntuaciones típicas basadas en una muestra de referencia', isCorrect: true },
        { text: 'Un manual de instrucciones para encender el proyector de la sala de evaluación', isCorrect: false },
        { text: 'Un registro de asistencia diaria de los psicólogos del área', isCorrect: false },
        { text: 'Un código disciplinario para sancionar a postulantes que copian', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Alta',
      question: '5. La escala de "Deseabilidad Social" o "Escala de Mentira" en un inventario de personalidad tiene como objetivo:',
      options: [
        { text: 'Detectar si el candidato intenta falsear deliberadamente sus respuestas para dar una imagen excesivamente positiva', isCorrect: true },
        { text: 'Evaluar cuántos amigos tiene el evaluado en sus redes sociales', isCorrect: false },
        { text: 'Medir el cociente intelectual matemático de los postulantes', isCorrect: false },
        { text: 'Comprobar si el candidato conoce las leyes laborales del país', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Baja',
      question: '6. El Percentil 50 (P50) en una distribución normal corresponde a:',
      options: [
        { text: 'La Mediana de la muestra, donde el 50% de las puntuaciones se sitúa por debajo', isCorrect: true },
        { text: 'La puntuación perfecta o máxima alcanzable en el examen', isCorrect: false },
        { text: 'El puntaje mínimo para ser descalificado del proceso', isCorrect: false },
        { text: 'El porcentaje de error cometido por el software evaluador', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Media',
      question: '7. Las pruebas psicométricas de aptitud cognoscitiva evalúan constructos como:',
      options: [
        { text: 'Razonamiento lógico, habilidad espacial, fluidez verbal y velocidad perceptual', isCorrect: true },
        { text: 'Historial crediticio y deudas bancarias del postulante', isCorrect: false },
        { text: 'Preferencia por marcas comerciales de ropa corporativa', isCorrect: false },
        { text: 'Nivel de colesterol y presión arterial del trabajador', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Alta',
      question: '8. En la Teoría de Respuesta al Ítem (TRI), el parámetro "b" representa:',
      options: [
        { text: 'La dificultad del reactivo', isCorrect: true },
        { text: 'El poder de discriminación del ítem', isCorrect: false },
        { text: 'La probabilidad de acertar por azar', isCorrect: false },
        { text: 'El tiempo máximo asignado al postulante', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Baja',
      question: '9. En la evaluación DISC, el factor "D" hace referencia a:',
      options: [
        { text: 'Dominancia o Decisión ante retos y problemas', isCorrect: true },
        { text: 'Desempeño financiero y monetario', isCorrect: false },
        { text: 'Duda constante e indecisión', isCorrect: false },
        { text: 'Disciplina escolar y académica', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Media',
      question: '10. En el modelo DISC, un perfil con alta "I" (Influencia) se destaca principalmente por:',
      options: [
        { text: 'Habilidades de persuasión, optimismo, comunicación interpersonal y entusiasmo grupal', isCorrect: true },
        { text: 'Rigor meticuloso con las cifras numéricas y aislamiento laboral', isCorrect: false },
        { text: 'Resistencia absoluta a cualquier tipo de cambio organizativo', isCorrect: false },
        { text: 'Comportamiento silencioso y estricto apego a reglamentos mecánicos', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Media',
      question: '11. El factor "S" (Estabilidad o Solidez) en DISC caracteriza a personas con orientación a:',
      options: [
        { text: 'Paciencia, lealtad, cooperación constante, ritmo predecible y trabajo en equipo armonioso', isCorrect: true },
        { text: 'Toma de riesgos impulsiva y búsqueda constante de confrontación', isCorrect: false },
        { text: 'Despreocupación total por los compañeros de trabajo', isCorrect: false },
        { text: 'Volatilidad anímica e inconstancia laboral', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Media',
      question: '12. En DISC, un candidato con alta "C" (Conciencia o Cumplimiento) tiende a valorar especialmente:',
      options: [
        { text: 'La precisión, los estándares de calidad, la lógica analítica y el cumplimiento normativo', isCorrect: true },
        { text: 'La improvisación espontánea sin seguir ningún protocolo', isCorrect: false },
        { text: 'Ser el centro de atención en eventos sociales de la empresa', isCorrect: false },
        { text: 'Aceptar tareas sin verificar nunca los datos ni los procedimientos', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Alta',
      question: '13. ¿Qué es el "Efecto Halo" en el contexto de la evaluación de candidatos?',
      options: [
        { text: 'El sesgo del evaluador al generalizar una impresión positiva global a partir de un solo rasgo favorable', isCorrect: true },
        { text: 'El efecto de iluminación óptima en la cabina de evaluación digital', isCorrect: false },
        { text: 'La mejora en el rendimiento por haber descansado bien la noche anterior', isCorrect: false },
        { text: 'La interferencia provocada por ruidos ambientales en el aula de examen', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Baja',
      question: '14. Una puntuación típica "Z" igual a 0 en una prueba estandarizada indica que el evaluado se encuentra exactamente en la media poblacional.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Media',
      question: '15. ¿Qué diferencia fundamental existe entre una prueba psicométrica proyectiva y una psicométrica estandarizada?',
      options: [
        { text: 'Las estandarizadas utilizan estímulos y opciones de respuesta estructuradas con baremos cuantitativos objetivos', isCorrect: true },
        { text: 'Las proyectivas solo pueden ser resueltas por ingenieros informáticos', isCorrect: false },
        { text: 'Las pruebas estandarizadas no tienen ningún sustento científico ni estadístico', isCorrect: false },
        { text: 'Las pruebas proyectivas son corregidas exclusivamente por inteligencia artificial', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Alta',
      question: '16. La "Validez Predictiva" de un test de selección mide:',
      options: [
        { text: 'La capacidad de las puntuaciones del test para pronosticar con precisión el futuro desempeño laboral real del colaborador', isCorrect: true },
        { text: 'La cantidad de postulantes que asistirán a la entrevista presencial', isCorrect: false },
        { text: 'El tiempo que tardará el reclutador en revisar la prueba', isCorrect: false },
        { text: 'La predicción del clima meteorológico el día de la prueba', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Baja',
      question: '17. El consentimiento informado firmado por el postulante antes de la aplicación psicométrica garantiza el respeto a la privacidad y el uso ético de sus resultados.',
      options: [
        { text: 'VERDADERO', isCorrect: true },
        { text: 'FALSO', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Media',
      question: '18. ¿Qué es el "Error Estándar de Medición" (SEM)?',
      options: [
        { text: 'La estimación de la variación o fluctuación esperada en la puntuación observada respecto a la puntuación verdadera del sujeto', isCorrect: true },
        { text: 'El número de veces que se cae el sistema informático durante el test', isCorrect: false },
        { text: 'El error tipográfico en la impresión del folleto de preguntas', isCorrect: false },
        { text: 'El porcentaje de candidatos que no asisten a la prueba programada', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Alta',
      question: '19. En la evaluación de competencias mediante el método STAR, las cuatro etapas estructuradas corresponden a:',
      options: [
        { text: 'Situación, Tarea, Acción y Resultado', isCorrect: true },
        { text: 'Solución, Tiempo, Actitud y Remuneración', isCorrect: false },
        { text: 'Sindicato, Trabajo, Aprobación y Reconocimiento', isCorrect: false },
        { text: 'Selección, Talento, Asignación y Reclutamiento', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Media',
      question: '20. ¿Por qué es fundamental actualizar periódicamente los baremos de las pruebas psicométricas?',
      options: [
        { text: 'Para controlar el Efecto Flynn y reflejar las características demográficas y educativas cambiantes de la población evaluada', isCorrect: true },
        { text: 'Para poder cobrar tarifas más altas a los clientes corporativos', isCorrect: false },
        { text: 'Porque las leyes exigen cambiar los nombres de las competencias cada seis meses', isCorrect: false },
        { text: 'Para que los postulantes nunca puedan memorizar las respuestas', isCorrect: false }
      ]
    }
  ],

  'Razonamiento Matemático': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. Si una mercadería con un precio de lista de S/ 200 tiene un descuento del 15%, ¿cuánto se paga efectivamente por ella?',
      options: [
        { text: 'S/ 170', isCorrect: true },
        { text: 'S/ 185', isCorrect: false },
        { text: 'S/ 160', isCorrect: false },
        { text: 'S/ 175', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Baja',
      question: '2. En un equipo de atención al cliente de 40 colaboradores, el 60% son mujeres. ¿Cuántas mujeres integran el equipo?',
      options: [
        { text: '24 colaboradoras', isCorrect: true },
        { text: '20 colaboradoras', isCorrect: false },
        { text: '26 colaboradoras', isCorrect: false },
        { text: '18 colaboradoras', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Media',
      question: '3. Si 4 operadores atienden 120 llamadas en 2 horas, ¿cuántas llamadas atenderán 6 operadores con el mismo ritmo en 3 horas?',
      options: [
        { text: '270 llamadas', isCorrect: true },
        { text: '240 llamadas', isCorrect: false },
        { text: '180 llamadas', isCorrect: false },
        { text: '300 llamadas', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Media',
      question: '4. ¿Cuál es el número que continúa en la siguiente serie lógica: 3, 7, 15, 31, 63, ...?',
      options: [
        { text: '127', isCorrect: true },
        { text: '126', isCorrect: false },
        { text: '95', isCorrect: false },
        { text: '120', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Baja',
      question: '5. El promedio de ventas de tres sucursales es S/ 15,000. Si dos de ellas vendieron S/ 12,000 y S/ 16,000 respectivamente, ¿cuánto vendió la tercera?',
      options: [
        { text: 'S/ 17,000', isCorrect: true },
        { text: 'S/ 15,000', isCorrect: false },
        { text: 'S/ 18,000', isCorrect: false },
        { text: 'S/ 14,000', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Media',
      question: '6. Un producto cuesta S/ 100 sin IGV (18%). Al aplicarle el impuesto, el precio final de venta al público será:',
      options: [
        { text: 'S/ 118', isCorrect: true },
        { text: 'S/ 115', isCorrect: false },
        { text: 'S/ 120', isCorrect: false },
        { text: 'S/ 108', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Alta',
      question: '7. Un comerciante compra un lote a S/ 800 y desea obtener una ganancia del 25% sobre el precio de costo. ¿A cuánto debe venderlo?',
      options: [
        { text: 'S/ 1,000', isCorrect: true },
        { text: 'S/ 950', isCorrect: false },
        { text: 'S/ 1,050', isCorrect: false },
        { text: 'S/ 1,200', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Baja',
      question: '8. Si la razón entre aprobados y desaprobados en una evaluación es de 3 a 1 en un grupo de 80 postulantes, ¿cuántos aprobaron?',
      options: [
        { text: '60 postulantes', isCorrect: true },
        { text: '50 postulantes', isCorrect: false },
        { text: '40 postulantes', isCorrect: false },
        { text: '65 postulantes', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Media',
      question: '9. Si un vehículo de distribución recorre 240 kilómetros en 3 horas a velocidad constante, ¿qué distancia recorrerá en 5 horas?',
      options: [
        { text: '400 km', isCorrect: true },
        { text: '360 km', isCorrect: false },
        { text: '420 km', isCorrect: false },
        { text: '380 km', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Alta',
      question: '10. Se aplican dos descuentos sucesivos del 10% y 20% a un artículo de S/ 500. ¿Cuál es el precio final?',
      options: [
        { text: 'S/ 360', isCorrect: true },
        { text: 'S/ 350', isCorrect: false },
        { text: 'S/ 380', isCorrect: false },
        { text: 'S/ 400', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Baja',
      question: '11. Si una docena de cuadernos cuesta S/ 36, ¿cuál es el precio de 4 cuadernos?',
      options: [
        { text: 'S/ 12', isCorrect: true },
        { text: 'S/ 9', isCorrect: false },
        { text: 'S/ 15', isCorrect: false },
        { text: 'S/ 10', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Media',
      question: '12. En una empresa, el presupuesto mensual se distribuye en: 50% sueldos, 30% operaciones y el resto para publicidad. Si el presupuesto total es S/ 100,000, ¿cuánto se asigna a publicidad?',
      options: [
        { text: 'S/ 20,000', isCorrect: true },
        { text: 'S/ 15,000', isCorrect: false },
        { text: 'S/ 25,000', isCorrect: false },
        { text: 'S/ 30,000', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Alta',
      question: '13. Para alcanzar un margen bruto de ganancia del 20% sobre el precio de venta de un producto cuyo costo es S/ 80, ¿cuál debe ser su precio de venta?',
      options: [
        { text: 'S/ 100', isCorrect: true },
        { text: 'S/ 96', isCorrect: false },
        { text: 'S/ 105', isCorrect: false },
        { text: 'S/ 110', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Baja',
      question: '14. La mitad de la cuarta parte de 80 es igual a:',
      options: [
        { text: '10', isCorrect: true },
        { text: '20', isCorrect: false },
        { text: '5', isCorrect: false },
        { text: '15', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Media',
      question: '15. Una cuadrilla de 8 personas concluye una obra en 15 días. ¿Cuántos días tardarían 12 personas con la misma capacidad en hacer la misma obra?',
      options: [
        { text: '10 días', isCorrect: true },
        { text: '12 días', isCorrect: false },
        { text: '8 días', isCorrect: false },
        { text: '14 días', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Alta',
      question: '16. Si se depositan S/ 10,000 a una tasa de interés simple anual del 6% durante 2 años, ¿cuál será el monto total acumulado al final del periodo?',
      options: [
        { text: 'S/ 11,200', isCorrect: true },
        { text: 'S/ 11,000', isCorrect: false },
        { text: 'S/ 10,600', isCorrect: false },
        { text: 'S/ 12,000', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Baja',
      question: '17. Complete la secuencia numérica: 100, 95, 85, 70, ...',
      options: [
        { text: '50', isCorrect: true },
        { text: '55', isCorrect: false },
        { text: '45', isCorrect: false },
        { text: '60', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Media',
      question: '18. En una encuesta de satisfacción, 180 personas respondieron favorablemente, lo que representa el 75% del total encuestado. ¿Cuántas personas fueron encuestadas en total?',
      options: [
        { text: '240 personas', isCorrect: true },
        { text: '220 personas', isCorrect: false },
        { text: '250 personas', isCorrect: false },
        { text: '200 personas', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Alta',
      question: '19. Una tienda aumenta el precio de un artículo en 20% y luego, por temporada de liquidación, le aplica un descuento del 20%. Respecto al precio original, el precio final:',
      options: [
        { text: 'Disminuyó en un 4%', isCorrect: true },
        { text: 'Se mantuvo exactamente igual', isCorrect: false },
        { text: 'Aumentó en un 4%', isCorrect: false },
        { text: 'Disminuyó en un 2%', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Media',
      question: '20. ¿Cuántos minutos hay en 3.75 horas?',
      options: [
        { text: '225 minutos', isCorrect: true },
        { text: '215 minutos', isCorrect: false },
        { text: '235 minutos', isCorrect: false },
        { text: '205 minutos', isCorrect: false }
      ]
    }
  ],

  'Inglés nivel básico (A2)': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. Choose the correct form to complete the sentence: "She _____ in the Customer Service department."',
      options: [
        { text: 'works', isCorrect: true },
        { text: 'work', isCorrect: false },
        { text: 'working', isCorrect: false },
        { text: 'is work', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Baja',
      question: '2. Which sentence is grammatically correct in the past simple?',
      options: [
        { text: 'We sent the invoice to the client yesterday.', isCorrect: true },
        { text: 'We sended the invoice to the client yesterday.', isCorrect: false },
        { text: 'We was send the invoice to the client yesterday.', isCorrect: false },
        { text: 'We did sent the invoice to the client yesterday.', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Baja',
      question: '3. Choose the appropriate response to: "Could you please hold the line for a moment?"',
      options: [
        { text: 'Sure, no problem. I will wait.', isCorrect: true },
        { text: 'Yes, I am hold right now.', isCorrect: false },
        { text: 'No, I have two phones.', isCorrect: false },
        { text: 'Yesterday was Monday.', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Media',
      question: '4. Fill in the blank: "If a customer calls, please ask them _____ their account number."',
      options: [
        { text: 'for', isCorrect: true },
        { text: 'to', isCorrect: false },
        { text: 'at', isCorrect: false },
        { text: 'on', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Baja',
      question: '5. What is the plural of "Company"?',
      options: [
        { text: 'Companies', isCorrect: true },
        { text: 'Companys', isCorrect: false },
        { text: 'Companyes', isCorrect: false },
        { text: 'Companias', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Media',
      question: '6. Choose the correct modal verb: "All employees _____ wear their security badge at all times."',
      options: [
        { text: 'must', isCorrect: true },
        { text: 'might to', isCorrect: false },
        { text: 'could to', isCorrect: false },
        { text: 'shall not', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Baja',
      question: '7. Select the correct question: "_____ does the weekly meeting start?" - "At 9:00 AM."',
      options: [
        { text: 'What time', isCorrect: true },
        { text: 'Where', isCorrect: false },
        { text: 'Who', isCorrect: false },
        { text: 'Why', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Media',
      question: '8. Choose the correct sentence with Present Continuous for ongoing actions:',
      options: [
        { text: 'They are analyzing the new sales report right now.', isCorrect: true },
        { text: 'They analyze the new sales report right now.', isCorrect: false },
        { text: 'They is analyzing the new sales report right now.', isCorrect: false },
        { text: 'They are analyze the new sales report right now.', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Alta',
      question: '9. Complete the formal business email closing: "I look forward to _____ from you soon."',
      options: [
        { text: 'hearing', isCorrect: true },
        { text: 'hear', isCorrect: false },
        { text: 'heard', isCorrect: false },
        { text: 'to hear', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Baja',
      question: '10. What does the acronym "ASAP" mean in professional workplace communication?',
      options: [
        { text: 'As Soon As Possible', isCorrect: true },
        { text: 'After Some Account Payment', isCorrect: false },
        { text: 'Always Stay At Protocol', isCorrect: false },
        { text: 'All Staff Are Present', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Media',
      question: '11. Which preposition fits: "The supervisor will be back _____ office on Thursday."',
      options: [
        { text: 'in the', isCorrect: true },
        { text: 'into', isCorrect: false },
        { text: 'at under', isCorrect: false },
        { text: 'above', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Baja',
      question: '12. What is the opposite of "Expensive"?',
      options: [
        { text: 'Cheap / Affordable', isCorrect: true },
        { text: 'Fast', isCorrect: false },
        { text: 'Heavy', isCorrect: false },
        { text: 'Narrow', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Media',
      question: '13. Select the correct comparative form: "Our online system is _____ than the manual process."',
      options: [
        { text: 'more efficient', isCorrect: true },
        { text: 'efficienter', isCorrect: false },
        { text: 'most efficient', isCorrect: false },
        { text: 'as efficienter', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Alta',
      question: '14. Choose the best translation for: "Lamentamos las molestias ocasionadas por el retraso":',
      options: [
        { text: 'We apologize for any inconvenience caused by the delay.', isCorrect: true },
        { text: 'We are sad for the troubles of the late.', isCorrect: false },
        { text: 'We excuse the molestations from delay.', isCorrect: false },
        { text: 'We regret your delay with inconvenients.', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Baja',
      question: '15. Choose the correct negative sentence: "He _____ have administrative permissions in the database."',
      options: [
        { text: "doesn't", isCorrect: true },
        { text: "don't", isCorrect: false },
        { text: "isn't", isCorrect: false },
        { text: "haven't", isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Media',
      question: '16. "Could you clarify what you mean by that?" is used to:',
      options: [
        { text: 'Politely ask for more information or an explanation', isCorrect: true },
        { text: 'Insult the person speaking', isCorrect: false },
        { text: 'Agree to an unconditional price discount', isCorrect: false },
        { text: 'Finish the conversation abruptly', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Alta',
      question: '17. Fill in the conditional sentence: "If we _____ the target this month, the team will receive a bonus."',
      options: [
        { text: 'reach', isCorrect: true },
        { text: 'will reach', isCorrect: false },
        { text: 'reached', isCorrect: false },
        { text: 'are reaching to', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Baja',
      question: '18. Select the correct pronoun: "Please send _____ the updated presentation when finished."',
      options: [
        { text: 'me', isCorrect: true },
        { text: 'I', isCorrect: false },
        { text: 'my', isCorrect: false },
        { text: 'mine', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Media',
      question: '19. What is a "Deadline"?',
      options: [
        { text: 'The latest date or time by which a task must be completed', isCorrect: true },
        { text: 'A phone line that is out of service', isCorrect: false },
        { text: 'A cancellation notice of a corporate insurance policy', isCorrect: false },
        { text: 'A physical fence around the building premises', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Alta',
      question: '20. Choose the sentence with the correct passive voice structure:',
      options: [
        { text: 'All transactions are monitored by our fraud prevention team.', isCorrect: true },
        { text: 'All transactions are monitoring with our fraud prevention team.', isCorrect: false },
        { text: 'All transactions have monitor by our team.', isCorrect: false },
        { text: 'All transactions were be monitor by our team.', isCorrect: false }
      ]
    }
  ],

  'Excel intermedio y avanzado': [
    {
      id: 1,
      difficulty: 'Baja',
      question: '1. ¿Cuál es el carácter utilizado en Excel para fijar una referencia de celda absoluta (bloquear fila y columna)?',
      options: [
        { text: '$ (ejemplo: $A$1)', isCorrect: true },
        { text: '# (ejemplo: #A#1)', isCorrect: false },
        { text: '% (ejemplo: %A%1)', isCorrect: false },
        { text: '& (ejemplo: &A&1)', isCorrect: false }
      ]
    },
    {
      id: 2,
      difficulty: 'Baja',
      question: '2. En Excel, ¿qué función permite sumar los valores de un rango que cumplen una condición específica?',
      options: [
        { text: 'SUMAR.SI', isCorrect: true },
        { text: 'CONTAR.SI', isCorrect: false },
        { text: 'PROMEDIO.SI', isCorrect: false },
        { text: 'TOTAL.CONDICIONAL', isCorrect: false }
      ]
    },
    {
      id: 3,
      difficulty: 'Media',
      question: '3. La función BUSCARV (VLOOKUP) busca un valor en la primera columna de una tabla y devuelve el valor correspondiente:',
      options: [
        { text: 'Hacia la derecha en el número de columna especificado', isCorrect: true },
        { text: 'Hacia la izquierda sin importar el orden', isCorrect: false },
        { text: 'Hacia arriba en la fila anterior', isCorrect: false },
        { text: 'En otra hoja sin indicar rango', isCorrect: false }
      ]
    },
    {
      id: 4,
      difficulty: 'Media',
      question: '4. ¿Qué ventaja principal ofrece la función BUSCARX (XLOOKUP) frente a BUSCARV?',
      options: [
        { text: 'Permite buscar hacia la izquierda, tiene coincidencia exacta por defecto y no se rompe al insertar columnas', isCorrect: true },
        { text: 'Solo funciona para números pares', isCorrect: false },
        { text: 'Es compatible únicamente con archivos PDF', isCorrect: false },
        { text: 'No requiere especificar ningún argumento', isCorrect: false }
      ]
    },
    {
      id: 5,
      difficulty: 'Baja',
      question: '5. Una Tabla Dinámica (Pivot Table) se utiliza principalmente para:',
      options: [
        { text: 'Resumir, analizar, explorar y comparar grandes volúmenes de datos rápidamente', isCorrect: true },
        { text: 'Dibujar logotipos vectoriales de la empresa', isCorrect: false },
        { text: 'Enviar correos masivos a clientes morosos', isCorrect: false },
        { text: 'Escanear documentos impresos en alta resolución', isCorrect: false }
      ]
    },
    {
      id: 6,
      difficulty: 'Media',
      question: '6. ¿Qué función se utiliza para evitar que aparezca el error #N/D o #¡VALOR! en una celda?',
      options: [
        { text: 'SI.ERROR (IFERROR)', isCorrect: true },
        { text: 'IGNORAR.ERROR', isCorrect: false },
        { text: 'BORRAR.N/D', isCorrect: false },
        { text: 'OCULTAR.FALLA', isCorrect: false }
      ]
    },
    {
      id: 7,
      difficulty: 'Alta',
      question: '7. La combinación de las funciones ÍNDICE y COINCIDIR (INDEX/MATCH) es ampliamente preferida porque:',
      options: [
        { text: 'Permite búsquedas bidireccionales flexibles en matrices sin restricción de columnas fijas y consume menos memoria', isCorrect: true },
        { text: 'Elimina automáticamente las filas duplicadas de la base de datos', isCorrect: false },
        { text: 'Convierte el texto a formato de moneda sin fórmulas adicionales', isCorrect: false },
        { text: 'Obliga a que todos los usuarios guarden en la nube', isCorrect: false }
      ]
    },
    {
      id: 8,
      difficulty: 'Baja',
      question: '8. El atajo de teclado en Excel en español para seleccionar todos los datos contiguos de una tabla es:',
      options: [
        { text: 'Ctrl + Shift + Teclas de dirección (flechas)', isCorrect: true },
        { text: 'Alt + F4', isCorrect: false },
        { text: 'Ctrl + Alt + Supr', isCorrect: false },
        { text: 'Shift + Espacio únicamente', isCorrect: false }
      ]
    },
    {
      id: 9,
      difficulty: 'Media',
      question: '9. ¿Qué herramienta de Excel permite restringir el tipo de datos que los usuarios pueden ingresar en una celda (por ejemplo, solo listas desplegables o fechas)?',
      options: [
        { text: 'Validación de Datos', isCorrect: true },
        { text: 'Formato Condicional', isCorrect: false },
        { text: 'Texto en Columnas', isCorrect: false },
        { text: 'Auditoría de Fórmulas', isCorrect: false }
      ]
    },
    {
      id: 10,
      difficulty: 'Baja',
      question: '10. Para resaltar automáticamente con color rojo las ventas menores a S/ 1,000 en una columna se utiliza:',
      options: [
        { text: 'Formato Condicional', isCorrect: true },
        { text: 'Párrafo justificado', isCorrect: false },
        { text: 'Pegado especial de fórmulas', isCorrect: false },
        { text: 'AutoFiltro manual', isCorrect: false }
      ]
    },
    {
      id: 11,
      difficulty: 'Media',
      question: '11. La función CONCATENAR o el operador ampersand (&) se utiliza para:',
      options: [
        { text: 'Unir dos o más cadenas de texto procedentes de celdas distintas en una sola celda', isCorrect: true },
        { text: 'Calcular el interés compuesto de un préstamo bancario', isCorrect: false },
        { text: 'Contar cuántas palabras tienen más de 5 letras', isCorrect: false },
        { text: 'Proteger con contraseña una hoja de cálculo', isCorrect: false }
      ]
    },
    {
      id: 12,
      difficulty: 'Alta',
      question: '12. En Power Query para Excel, la acción de "Anular dinamización de columnas" (Unpivot) sirve para:',
      options: [
        { text: 'Transformar columnas matriciales en pares de atributo-valor en filas para normalizar los datos', isCorrect: true },
        { text: 'Eliminar el archivo fuente de origen de datos', isCorrect: false },
        { text: 'Cambiar el idioma de las fórmulas de Excel a inglés', isCorrect: false },
        { text: 'Crear una copia de seguridad en formato CSV plano', isCorrect: false }
      ]
    },
    {
      id: 13,
      difficulty: 'Baja',
      question: '13. ¿Qué resultado produce la fórmula =CONTAR.BLANCO(A1:A10)?',
      options: [
        { text: 'El número de celdas vacías dentro del rango especificado', isCorrect: true },
        { text: 'La suma de las celdas de color blanco', isCorrect: false },
        { text: 'El promedio de los ceros en el rango', isCorrect: false },
        { text: 'Un mensaje de alerta de celda bloqueada', isCorrect: false }
      ]
    },
    {
      id: 14,
      difficulty: 'Media',
      question: '14. En una función =SI(A1>=14; "Aprobado"; "Desaprobado"), ¿qué resultado arrojará si A1 tiene el valor 13.5?',
      options: [
        { text: 'Desaprobado', isCorrect: true },
        { text: 'Aprobado', isCorrect: false },
        { text: '#¡VALOR!', isCorrect: false },
        { text: '13.5', isCorrect: false }
      ]
    },
    {
      id: 15,
      difficulty: 'Alta',
      question: '15. ¿Qué función matemática y estadística se utiliza para calcular el percentil k-ésimo de un conjunto de datos numéricos en Excel?',
      options: [
        { text: 'PERCENTIL.INC (o PERCENTILE.INC)', isCorrect: true },
        { text: 'CALC.PERCENTIL', isCorrect: false },
        { text: 'POSICION.ESTADISTICA', isCorrect: false },
        { text: 'DIST.NORMAL.PERCENTIL', isCorrect: false }
      ]
    },
    {
      id: 16,
      difficulty: 'Media',
      question: '16. La herramienta "Texto en Columnas" de la pestaña Datos permite:',
      options: [
        { text: 'Separar el contenido de una celda (como Nombre y Apellido) en varias columnas según un delimitador como coma o espacio', isCorrect: true },
        { text: 'Traducir el texto de español a inglés automáticamente', isCorrect: false },
        { text: 'Comprobar la ortografía del documento', isCorrect: false },
        { text: 'Cambiar la orientación de la hoja a vertical', isCorrect: false }
      ]
    },
    {
      id: 17,
      difficulty: 'Baja',
      question: '17. El error #¡DIV/0! en Excel ocurre cuando:',
      options: [
        { text: 'Una fórmula intenta dividir un número entre cero o entre una celda vacía', isCorrect: true },
        { text: 'El ancho de la columna es insuficiente para mostrar el número', isCorrect: false },
        { text: 'El nombre de la función está mal escrito', isCorrect: false },
        { text: 'Se ha desconectado la conexión a internet', isCorrect: false }
      ]
    },
    {
      id: 18,
      difficulty: 'Alta',
      question: '18. ¿Cuál es el propósito del "Buscar Objetivo" (Goal Seek) en el análisis de hipótesis de Excel?',
      options: [
        { text: 'Encontrar el valor de entrada necesario que produce el resultado deseado en una fórmula objetivo', isCorrect: true },
        { text: 'Buscar palabras clave en todos los correos electrónicos guardados', isCorrect: false },
        { text: 'Generar macros automatizadas en lenguaje Python', isCorrect: false },
        { text: 'Fijar el sueldo de un colaborador según baremos públicos', isCorrect: false }
      ]
    },
    {
      id: 19,
      difficulty: 'Baja',
      question: '19. Para inmovilizar la fila superior de títulos para que no se oculte al desplazarse hacia abajo en una base de datos se utiliza:',
      options: [
        { text: 'Inmovilizar Fila Superior (pestaña Vista)', isCorrect: true },
        { text: 'Bloquear Celda con candado', isCorrect: false },
        { text: 'Ocultar Columnas', isCorrect: false },
        { text: 'Proteger Libro con contraseña', isCorrect: false }
      ]
    },
    {
      id: 20,
      difficulty: 'Media',
      question: '20. ¿Qué hace la función =AHORA() en una celda?',
      options: [
        { text: 'Devuelve la fecha y la hora actuales del sistema en formato de fecha y hora', isCorrect: true },
        { text: 'Calcula el tiempo restante hasta el fin de mes', isCorrect: false },
        { text: 'Inicia un temporizador de cuenta regresiva de 60 segundos', isCorrect: false },
        { text: 'Cierra el archivo guardando los cambios de inmediato', isCorrect: false }
      ]
    }
  ]
};

// Generador genérico contextual de preguntas para cualquier materia del catálogo
// Asegura que NINGÚN cuestionario quede con menos de 20 preguntas
export function getQuestionsForTopic(
  topicName: string,
  difficulty?: 'Personalizada' | 'Baja' | 'Media' | 'Alta',
  totalCount: number = 20
): QuestionData[] {
  // 1. Buscar coincidencia exacta o normalizada en el diccionario
  const cleanTopic = topicName.trim().toLowerCase();
  const directKey = Object.keys(QUESTIONS_BY_TOPIC).find(
    k => k.trim().toLowerCase() === cleanTopic
  );

  let pool: QuestionData[] = [];

  if (directKey && QUESTIONS_BY_TOPIC[directKey]) {
    pool = [...QUESTIONS_BY_TOPIC[directKey]];
  } else {
    // Si no tiene banco estático específico, generar banco temático de 20 preguntas
    pool = generateDynamicQuestionBank(topicName);
  }

  // 2. Filtrar o priorizar según la dificultad solicitada
  if (difficulty === 'Baja') {
    pool.sort((a, b) => {
      const weight = { Baja: 0, Media: 1, Alta: 2 };
      return weight[a.difficulty] - weight[b.difficulty];
    });
  } else if (difficulty === 'Alta') {
    pool.sort((a, b) => {
      const weight = { Alta: 0, Media: 1, Baja: 2 };
      return weight[a.difficulty] - weight[b.difficulty];
    });
  } else if (difficulty === 'Media') {
    pool.sort((a, b) => {
      const weight = { Media: 0, Baja: 1, Alta: 2 };
      return weight[a.difficulty] - weight[b.difficulty];
    });
  }

  // 3. Limitar a la cantidad solicitada (mínimo 20 por requerimiento si totalCount >= 20)
  const targetCount = Math.max(5, Math.min(pool.length, totalCount));
  return pool.slice(0, targetCount).map((q, idx) => ({
    ...q,
    id: idx + 1,
    question: q.question.replace(/^\d+\.\s*/, `${idx + 1}. `)
  }));
}

// Generador temático de preguntas para cualquier materia profesional
function generateDynamicQuestionBank(topicName: string): QuestionData[] {
  const templates = [
    {
      q: `Como concepto fundamental, ¿cuál es el objetivo principal de ${topicName} en el entorno corporativo actual?`,
      correct: `Optimizar los resultados operativos y garantizar la calidad y satisfacción en los procesos de la empresa.`,
      wrong1: `Reducir a cero el presupuesto operativo sin medir el impacto en los clientes.`,
      wrong2: `Eliminar los canales de comunicación formal entre equipos interdisciplinarios.`,
      wrong3: `Sustituir toda la supervisión humana por procesos no auditables.`,
      diff: 'Baja' as const
    },
    {
      q: `En el ámbito de ${topicName}, ¿cuál de las siguientes acciones se considera una mejor práctica profesional?`,
      correct: `Definir indicadores medibles (KPIs), documentar procedimientos y realizar seguimiento continuo.`,
      wrong1: `Improvisar las respuestas ante contingencias graves sin registrar los incidentes.`,
      wrong2: `Ocultar las desviaciones detectadas para no alarmar a los comités de auditoría.`,
      wrong3: `Delegar las decisiones estratégicas exclusivamente en personal en periodo de inducción.`,
      diff: 'Media' as const
    },
    {
      q: `¿Cuál de las siguientes afirmaciones describe de manera precisa el principio rector de ${topicName}?`,
      correct: `La alineación entre los objetivos individuales, las directrices del área y los estándares institucionales.`,
      wrong1: `La prioridad absoluta del beneficio personal por encima de las políticas de la organización.`,
      wrong2: `La no aplicación de normas de seguridad ni controles de cumplimiento legal.`,
      wrong3: `La postergación indefinida de las quejas y reclamos de los usuarios.`,
      diff: 'Baja' as const
    },
    {
      q: `Al implementar una estrategia de ${topicName}, ¿cuál es el primer paso metodológico recomendado?`,
      correct: `Realizar un diagnóstico situacional del estado actual y definir el alcance de los objetivos.`,
      wrong1: `Comprar licencias de software sin antes analizar las necesidades reales del puesto.`,
      wrong2: `Emitir sanciones masivas al personal antes de iniciar la capacitación.`,
      wrong3: `Eliminar los puestos de supervisión para ahorrar costos administrativos.`,
      diff: 'Media' as const
    },
    {
      q: `En situaciones de alta exigencia o contingencia crítica en ${topicName}, el colaborador debe:`,
      correct: `Mantener el autocontrol, comunicar asertivamente el estado del caso y aplicar el protocolo escalado.`,
      wrong1: `Abandonar el turno de atención sin notificar a su jefe inmediato.`,
      wrong2: `Culpar públicamente a otros departamentos para evadir responsabilidades.`,
      wrong3: `Desactivar los sistemas de registro para evitar que se midan los tiempos de respuesta.`,
      diff: 'Baja' as const
    },
    {
      q: `¿Qué métrica o indicador es indispensable para evaluar la efectividad en ${topicName}?`,
      correct: `El nivel de cumplimiento de metas, la tasa de resolución en primer contacto y la calidad del servicio.`,
      wrong1: `El número de llamadas perdidas acumuladas sin devolver.`,
      wrong2: `El tiempo ocioso no justificado durante la jornada laboral.`,
      wrong3: `El costo de la publicidad en televisión nacional.`,
      diff: 'Media' as const
    },
    {
      q: `En la gestión avanzada de ${topicName}, ¿qué implicancia tiene la gestión de riesgos operativos?`,
      correct: `Anticipar posibles fallas, mitigar vulnerabilidades y establecer planes de contingencia documentados.`,
      wrong1: `Aceptar pasivamente cualquier pérdida financiera sin investigar su origen.`,
      wrong2: `Contratar solo personal sin experiencia para no invertir en planes de desarrollo.`,
      wrong3: `Firmar contratos sin revisión previa del área legal o regulatoria.`,
      diff: 'Alta' as const
    },
    {
      q: `¿Cuál es el rol de la retroalimentación (feedback) continua en el fortalecimiento de ${topicName}?`,
      correct: `Detectar brechas de desempeño oportunamente y orientar planes de acción formativos y correctivos.`,
      wrong1: `Intimidar a los colaboradores con menor antigüedad en la organización.`,
      wrong2: `Reemplazar las evaluaciones oficiales anuales por rumores de pasillo.`,
      wrong3: `Fijar metas inalcanzables que desmotiven al equipo de operaciones.`,
      diff: 'Baja' as const
    },
    {
      q: `Ante una discrepancia técnica en ${topicName} con un cliente o usuario clave, ¿cuál es la conducta adecuada?`,
      correct: `Escuchar activamente, validar los datos con objetividad y argumentar la solución con base en evidencias y normas.`,
      wrong1: `Elevar la voz y desacreditar la postura del cliente de forma agresiva.`,
      wrong2: `Prometer beneficios falsos que la empresa no puede cumplir legalmente.`,
      wrong3: `Ignorar el correo electrónico y archivar el reclamo como no resuelto.`,
      diff: 'Media' as const
    },
    {
      q: `¿Qué diferencia a un enfoque proactivo de uno reactivo en el campo de ${topicName}?`,
      correct: `El enfoque proactivo previene incidentes analizando tendencias, mientras que el reactivo solo actúa tras la falla.`,
      wrong1: `El reactivo es siempre más económico y recomendable para empresas líderes.`,
      wrong2: `No existe diferencia práctica; ambos dependen exclusivamente de la suerte.`,
      wrong3: `El enfoque proactivo prohíbe el uso de tecnología digital en la toma de decisiones.`,
      diff: 'Media' as const
    },
    {
      q: `En el marco ético y normativo de ${topicName}, el tratamiento de datos confidenciales exige:`,
      correct: `Rigor absoluto bajo las políticas de protección de datos personales y secreto profesional.`,
      wrong1: `Compartir información de los usuarios en foros públicos de internet.`,
      wrong2: `Vender bases de datos de clientes a empresas externas sin consentimiento.`,
      wrong3: `Anotar claves y contraseñas maestras en papeles visibles a terceros.`,
      diff: 'Baja' as const
    },
    {
      q: `¿Cómo contribuye ${topicName} a la propuesta de valor y reputación corporativa de GEA?`,
      correct: `Generando confianza, consistencia en la entrega del servicio y fidelización de clientes e instituciones.`,
      wrong1: `Aumentando los reclamos no atendidos en los entes reguladores.`,
      wrong2: `Reduciendo la transparencia en los reportes financieros presentados.`,
      wrong3: `Fomentando la rotación constante y voluntaria del talento calificado.`,
      diff: 'Baja' as const
    },
    {
      q: `¿Cuál es la consecuencia directa de una deficiente planificación en ${topicName}?`,
      correct: `Sobrecarga de trabajo, cuellos de botella en la operación, incremento de costos y pérdida de clientes.`,
      wrong1: `Un incremento automático en el margen de rentabilidad neta.`,
      wrong2: `La felicitación formal por parte de los auditores externos.`,
      wrong3: `La reducción del tiempo total de los procesos a cero segundos.`,
      diff: 'Media' as const
    },
    {
      q: `En la toma de decisiones complejas en ${topicName}, el análisis basado en datos (Data-Driven) garantiza:`,
      correct: `Mayor objetividad, minimización de sesgos personales y predictibilidad de los resultados.`,
      wrong1: `Que no sea necesario contar con liderazgo ni criterio directivo en la empresa.`,
      wrong2: `Que el 100% de las ventas queden aseguradas sin necesidad de ejecutar ninguna acción.`,
      wrong3: `El cese de las actividades comerciales los fines de semana.`,
      diff: 'Alta' as const
    },
    {
      q: `¿Qué importancia tiene la estandarización de procesos en ${topicName}?`,
      correct: `Garantiza uniformidad, facilita la inducción de nuevos colaboradores y asegura el control de calidad.`,
      wrong1: `Permite que cada colaborador ejecute las tareas según su propio parecer sin consultar a nadie.`,
      wrong2: `Hace que sea imposible medir los tiempos de ciclo y eficiencia del servicio.`,
      wrong3: `Obliga a duplicar innecesariamente el personal en cada turno de trabajo.`,
      diff: 'Baja' as const
    },
    {
      q: `En ${topicName}, ¿cuál es el objetivo de un plan de contingencia (BCP)?`,
      correct: `Asegurar la continuidad operativa del negocio ante situaciones de fuerza mayor, desastres o fallas masivas.`,
      wrong1: `Suspender definitivamente todas las operaciones de la compañía.`,
      wrong2: `Cancelar el pago de nómina de los trabajadores afectados.`,
      wrong3: `Eliminar el historial de reclamos archivados en el servidor.`,
      diff: 'Alta' as const
    },
    {
      q: `¿Qué factor es determinante para la motivación y el alto rendimiento del equipo en ${topicName}?`,
      correct: `Claridad en los roles, metas desafiantes pero alcanzables, reconocimiento oportuno y recursos adecuados.`,
      wrong1: `La aplicación constante de amonestaciones públicas frente a los compañeros.`,
      wrong2: `El cambio diario de funciones sin previo aviso ni explicación.`,
      wrong3: `La prohibición de solicitar asesoría a los líderes de área.`,
      diff: 'Media' as const
    },
    {
      q: `Al auditar la calidad en ${topicName}, ¿qué elemento proporciona mayor confiabilidad?`,
      correct: `Muestreos aleatorios de casos evaluados con pautas de calibración validadas y objetivas.`,
      wrong1: `Revisar solo los casos de colaboradores que tienen simpatía con el auditor.`,
      wrong2: `Evaluar únicamente el caso con mayor cantidad de errores para calificar a todo el grupo.`,
      wrong3: `Asignar puntuaciones perfectas sin revisar ningún expediente.`,
      diff: 'Media' as const
    },
    {
      q: `La mejora continua (método Kaizen) aplicada a ${topicName} postula que:`,
      correct: `Pequeños cambios y optimizaciones constantes en el tiempo generan ventajas competitivas sostenibles.`,
      wrong1: `Solo deben realizarse cambios cuando la empresa se encuentre al borde de la quiebra.`,
      wrong2: `La perfección se logra en un solo día sin necesidad de seguimiento posterior.`,
      wrong3: `Los colaboradores de primera línea no deben aportar sugerencias de optimización.`,
      diff: 'Alta' as const
    },
    {
      q: `¿Cuál de las siguientes es la conclusión fundamental para un especialista en ${topicName}?`,
      correct: `El equilibrio entre rigor metodológico, orientación al servicio y adaptabilidad a la transformación digital.`,
      wrong1: `El rechazo a cualquier innovación tecnológica en los próximos cinco años.`,
      wrong2: `La creencia de que el cliente siempre debe aceptar las demoras sin explicación.`,
      wrong3: `La priorización de tareas burocráticas por encima de la resolución efectiva del problema.`,
      diff: 'Media' as const
    }
  ];

  return templates.map((t, idx) => ({
    id: idx + 1,
    difficulty: t.diff,
    topic: topicName,
    question: `${idx + 1}. ${t.q}`,
    options: [
      { text: t.correct, isCorrect: true },
      { text: t.wrong1, isCorrect: false },
      { text: t.wrong2, isCorrect: false },
      { text: t.wrong3, isCorrect: false }
    ]
  }));
}

