import { ExamStageConfig, Question } from '../types';

export const STAGES_CONFIG: ExamStageConfig[] = [
  {
    id: 'STAGE_1_PSYCHO',
    name: 'Etapa Psicopedagógica',
    shortName: 'Psicopedagógica',
    durationSeconds: 900, // 15 minutos
    description: 'Evalúa la capacidad de asimilación de nueva información, estructuración del trabajo autónomo y resolución lógica de problemas en entornos cambiantes.',
    objective: 'Determinar la agilidad de aprendizaje y el rigor organizativo del postulante.',
    guidelines: [
      'Duración fija: 15 minutos continuos.',
      'Una pregunta por pantalla: al confirmar una respuesta, no podrás retroceder ni cambiarla.',
      'Si el tiempo culmina antes de responder todo, el sistema guardará automáticamente lo completado.',
      'Responde con honestidad según tu forma habitual de trabajo.'
    ]
  },
  {
    id: 'STAGE_2_EMOTIONAL',
    name: 'Etapa Personal y Emocional',
    shortName: 'Personal y Emocional',
    durationSeconds: 900, // 15 minutos
    description: 'Explora el autocontrol emocional, la empatía con pares, la tolerancia a la frustración y la comunicación asertiva bajo presión laboral.',
    objective: 'Identificar habilidades intrapersonales e interpersonales en contextos de alta exigencia.',
    guidelines: [
      'Duración fija: 15 minutos continuos.',
      'Los reactivos no tienen respuestas de conocimiento técnico; valoran tu estilo conductual.',
      'La información recopilada es confidencial bajo la Ley 29733 de Protección de Datos Personales.',
      'Al pulsar Confirmar, tu respuesta queda registrada de forma definitiva.'
    ]
  },
  {
    id: 'STAGE_3_WORK_CASES',
    name: 'Etapa de Situaciones Laborales',
    shortName: 'Situaciones Laborales',
    durationSeconds: 900, // 15 minutos
    description: 'Presenta dilemas de toma de decisiones operativas, priorización de contingencias críticas y gestión de compromisos con clientes y equipos internos.',
    objective: 'Valorar el criterio práctico y la orientación al resultado responsable.',
    guidelines: [
      'Duración fija: 15 minutos continuos.',
      'Analiza el caso presentado en cada pantalla antes de tomar tu decisión.',
      'Recuerda que una vez confirmada la respuesta se avanza automáticamente.',
      'Al finalizar esta etapa, tu evaluación completa se remitirá al comité de selección.'
    ]
  }
];

export const VALIDATION_DISCLAIMER = 
  'Nota técnica: El contenido de estas pruebas psicométricas y de situación laboral debe ser validado y calibrado por un profesional psicólogo colegiado o especialista de talento humano acreditado según el puesto y baremo sectorial.';

export const SAMPLE_QUESTIONS: Question[] = [
  // =================== ETAPA 1: PSICOPEDAGÓGICA (15 preguntas) ===================
  {
    id: 'psy-01',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 1,
    competency: 'Gestión y organización del tiempo',
    statement: 'Te asignan dos tareas urgentes el mismo día: una auditoría de inventario con entrega a las 2:00 p.m. y la preparación de un reporte para gerencia a las 4:00 p.m. ¿Cuál es tu primera acción?',
    options: [
      { id: 'opt-p1-a', code: 'A', weight: 100, text: 'Desglosar ambas tareas en subtareas estimando tiempos y avisar a los solicitantes sobre la secuencia de entrega.' },
      { id: 'opt-p1-b', code: 'B', weight: 65, text: 'Iniciar de inmediato con la auditoría de inventario por ser la de plazo más cercano, sin planificar la segunda.' },
      { id: 'opt-p1-c', code: 'C', weight: 30, text: 'Delegar una de las dos tareas a un compañero sin consultar previamente a la jefatura.' },
      { id: 'opt-p1-d', code: 'D', weight: 0, text: 'Pedir ampliación de plazo para ambas tareas para asegurar un trabajo sin prisa.' }
    ]
  },
  {
    id: 'psy-02',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 2,
    competency: 'Agilidad de aprendizaje',
    statement: 'La empresa implementa un nuevo software de gestión que sustituye al sistema que dominabas. Los manuales son extensos y la capacitación formal será en dos semanas. ¿Cómo procedes?',
    options: [
      { id: 'opt-p2-a', code: 'A', weight: 100, text: 'Explorar proactivamente las funciones básicas mediante los tutoriales y documentar mis dudas para la capacitación.' },
      { id: 'opt-p2-b', code: 'B', weight: 65, text: 'Continuar usando hojas de cálculo paralelas y esperar a que brinden el curso oficial obligatorio.' },
      { id: 'opt-p2-c', code: 'C', weight: 30, text: 'Consultar constantemente a los compañeros más experimentados cada vez que requiera hacer una operación.' },
      { id: 'opt-p2-d', code: 'D', weight: 0, text: 'Notificar que no podré cumplir los plazos hasta que culmine la capacitación formal.' }
    ]
  },
  {
    id: 'psy-03',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 3,
    competency: 'Resolución analítica de problemas',
    statement: 'Al revisar los números del mes detectas una discrepancia recurrente del 4% en el cuadre final que nadie había reportado. ¿Qué camino tomas?',
    options: [
      { id: 'opt-p3-a', code: 'A', weight: 100, text: 'Rastrear el origen del dato paso a paso, aislar la causa raíz y proponer un ajuste documentado al responsable.' },
      { id: 'opt-p3-b', code: 'B', weight: 65, text: 'Ajustar la cifra manualmente en el balance para evitar demoras en el cierre contable.' },
      { id: 'opt-p3-c', code: 'C', weight: 30, text: 'Dejarlo pasar porque al ser menor al 5% entra dentro del margen de tolerancia no formal.' },
      { id: 'opt-p3-d', code: 'D', weight: 0, text: 'Enviar un correo a toda el área advirtiendo del error sin haber verificado de dónde proviene.' }
    ]
  },
  {
    id: 'psy-04',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 4,
    competency: 'Recepción y aplicación de retroalimentación',
    statement: 'Tu supervisor te señala que la estructura de tu informe semanal carece de síntesis ejecutiva y pide rehacerlo antes de finalizar el día. ¿Cómo actúas?',
    options: [
      { id: 'opt-p4-a', code: 'A', weight: 100, text: 'Solicitar un ejemplo del formato esperado, ajustar los puntos clave y reentregar con prontitud.' },
      { id: 'opt-p4-b', code: 'B', weight: 65, text: 'Explicar que tu informe tiene todo el detalle necesario y que resumirlo omitiría datos relevantes.' },
      { id: 'opt-p4-c', code: 'C', weight: 30, text: 'Rehacerlo con molestia interna y evitar presentar nuevas iniciativas en las próximas semanas.' },
      { id: 'opt-p4-d', code: 'D', weight: 0, text: 'Pedirle a un compañero que redacte el resumen ejecutivo por ti.' }
    ]
  },
  {
    id: 'psy-05',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 5,
    competency: 'Atención al detalle y rigor',
    statement: 'Debes enviar una base de datos con 500 registros de postulantes a una entidad reguladora externa. ¿Cuál es tu protocolo de verificación?',
    options: [
      { id: 'opt-p5-a', code: 'A', weight: 100, text: 'Aplicar reglas de validación automática (campos vacíos, DNI de 8 dígitos, correos válidos) y muestreo aleatorio antes del envío.' },
      { id: 'opt-p5-b', code: 'B', weight: 65, text: 'Enviar directamente el archivo confiando en que los datos fueron ingresados por los usuarios.' },
      { id: 'opt-p5-c', code: 'C', weight: 30, text: 'Revisar manualmente los 500 registros uno por uno, retrasando la entrega programada.' },
      { id: 'opt-p5-d', code: 'D', weight: 0, text: 'Solicitar que la entidad reguladora revise y te informe si encuentra inconsistencias.' }
    ]
  },
  {
    id: 'psy-06',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 6,
    competency: 'Pensamiento lógico y priorización',
    statement: 'Tu equipo tiene 4 proyectos en curso y se reduce el presupuesto disponible en un 25%. ¿Cómo recomiendas proceder?',
    options: [
      { id: 'opt-p6-a', code: 'A', weight: 100, text: 'Evaluar el retorno y criticidad de cada proyecto, priorizar los dos de mayor impacto y renegociar plazos de los restantes.' },
      { id: 'opt-p6-b', code: 'B', weight: 65, text: 'Recortar el 25% de manera uniforme a los cuatro proyectos, arriesgando que ninguno se concluya bien.' },
      { id: 'opt-p6-c', code: 'C', weight: 30, text: 'Detener los cuatro proyectos hasta que la gerencia restablezca el presupuesto inicial.' },
      { id: 'opt-p6-d', code: 'D', weight: 0, text: 'Continuar sin cambios y esperar a agotar los fondos para solicitar una ampliación de urgencia.' }
    ]
  },
  {
    id: 'psy-07',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 7,
    competency: 'Adaptabilidad a procesos normalizados',
    statement: 'Encuentras un atajo que reduce a la mitad el tiempo de un trámite pero salta una firma de control interno no automatizada. ¿Qué decisión tomas?',
    options: [
      { id: 'opt-p7-a', code: 'A', weight: 100, text: 'Proponer la optimización formal al comité de procesos sustentando cómo mantener el control sin la firma manual.' },
      { id: 'opt-p7-b', code: 'B', weight: 65, text: 'Aplicar el atajo en silencio para mejorar mis métricas individuales de rendimiento.' },
      { id: 'opt-p7-c', code: 'C', weight: 30, text: 'Ignorar la oportunidad de mejora y ceñirme estrictamente al trámite lento sin comentar nada.' },
      { id: 'opt-p7-d', code: 'D', weight: 0, text: 'Comentar el atajo con otros compañeros para que todos lo usen de manera informal.' }
    ]
  },
  {
    id: 'psy-08',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 8,
    competency: 'Curiosidad y actualización continua',
    statement: 'Surge una nueva normativa del sector laboral que afectará los procesos en seis meses. No es de tu responsabilidad directa, pero impacta tus reportes. ¿Qué haces?',
    options: [
      { id: 'opt-p8-a', code: 'A', weight: 100, text: 'Leer el decreto oficial en El Peruano, tomar notas de impacto y consultar con el área legal cómo adecuarnos preventivamente.' },
      { id: 'opt-p8-b', code: 'B', weight: 65, text: 'Esperar a que Recursos Humanos o Legal envíen un memorándum de instrucción dentro de cinco meses.' },
      { id: 'opt-p8-c', code: 'C', weight: 30, text: 'Despreocuparme ya que los cambios normativos suelen postergarse o derogarse.' },
      { id: 'opt-p8-d', code: 'D', weight: 0, text: 'Delegar la lectura de la norma a los practicantes para que preparen un resumen breve.' }
    ]
  },
  {
    id: 'psy-09',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 9,
    competency: 'Capacidad de síntesis informativa',
    statement: 'Tienes una presentación de 10 minutos ante la Dirección General para sustentar una inversión en herramientas de trabajo. ¿Cómo estructuras tu exposición?',
    options: [
      { id: 'opt-p9-a', code: 'A', weight: 100, text: 'Problema actual cuantitativo, solución propuesta, costo-beneficio proyectado y próximos pasos concretos en 4 diapositivas.' },
      { id: 'opt-p9-b', code: 'B', weight: 65, text: 'Presentar una lista detallada de 30 diapositivas con todo el historial de fallas de los últimos tres años.' },
      { id: 'opt-p9-c', code: 'C', weight: 30, text: 'Hablar sin material de soporte para que la reunión sea una conversación espontánea.' },
      { id: 'opt-p9-d', code: 'D', weight: 0, text: 'Enfocarme únicamente en las quejas del personal sin presentar un presupuesto valorizado.' }
    ]
  },
  {
    id: 'psy-10',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 10,
    competency: 'Manejo de instrucciones ambiguas',
    statement: 'Recibes una instrucción de tu jefatura: "Revisa los contratos del último trimestre y haz una propuesta de mejora". No especifica formato ni enfoque. ¿Cuál es tu paso inicial?',
    options: [
      { id: 'opt-p10-a', code: 'A', weight: 100, text: 'Elaborar un breve bosquejo de 3 puntos (plazos, costos y riesgos) y validar con la jefatura si ese es el enfoque esperado.' },
      { id: 'opt-p10-b', code: 'B', weight: 65, text: 'Asumir una interpretación propia y presentar un informe final de 50 páginas sin validación previa.' },
      { id: 'opt-p10-c', code: 'C', weight: 30, text: 'No hacer nada hasta que la jefatura envíe una orden con términos de referencia detallados.' },
      { id: 'opt-p10-d', code: 'D', weight: 0, text: 'Preguntar a los compañeros qué hicieron en años anteriores y copiar exactamente ese formato.' }
    ]
  },
  {
    id: 'psy-11',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 11,
    competency: 'Autonomía y proactividad',
    statement: 'Tu líder de equipo estará ausente por dos días sin cobertura telefónica y surge un incidente con un proveedor que solicita autorización para un cambio no crítico. ¿Qué haces?',
    options: [
      { id: 'opt-p11-a', code: 'A', weight: 100, text: 'Revisar las cláusulas del contrato, evaluar el impacto en costos y tiempos, y si no genera sobrecosto dar visto bueno provisional documentado.' },
      { id: 'opt-p11-b', code: 'B', weight: 65, text: 'Frenar todo el despacho del proveedor hasta el retorno del líder, aun si genera demoras al cliente.' },
      { id: 'opt-p11-c', code: 'C', weight: 30, text: 'Aprobar verbalmente sin revisar el contrato ni dejar constancia por correo.' },
      { id: 'opt-p11-d', code: 'D', weight: 0, text: 'Trasladar la decisión a un compañero nuevo para deslindar responsabilidad personal.' }
    ]
  },
  {
    id: 'psy-12',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 12,
    competency: 'Sistematización de conocimientos',
    statement: 'Resuelves un problema técnico recurrente que afectaba a varios integrantes del área. ¿Cuál es la mejor práctica posterior?',
    options: [
      { id: 'opt-p12-a', code: 'A', weight: 100, text: 'Crear una guía paso a paso en el repositorio compartido del equipo y compartirla en la siguiente reunión semanal.' },
      { id: 'opt-p12-b', code: 'B', weight: 65, text: 'Guardar la solución en mis notas privadas para cuando alguien me pida auxilio personalmente.' },
      { id: 'opt-p12-c', code: 'C', weight: 30, text: 'Solicitar un bono extraordinario a la jefatura por haber resuelto el inconveniente.' },
      { id: 'opt-p12-d', code: 'D', weight: 0, text: 'Borrar los registros de error para que la bitácora del sistema se vea limpia.' }
    ]
  },
  {
    id: 'psy-13',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 13,
    competency: 'Manejo de interrupciones imprevistas',
    statement: 'Mientras estás concentrado en una tarea de alto análisis contable, te interrumpen tres veces en una hora por consultas secundarias de otros compañeros. ¿Cómo gestionas la situación?',
    options: [
      { id: 'opt-p13-a', code: 'A', weight: 100, text: 'Agradecer la consulta, acordar un bloque específico de 20 minutos por la tarde para dudas y concentrarme en la tarea.' },
      { id: 'opt-p13-b', code: 'B', weight: 65, text: 'Responder bruscamente para que entiendan que estoy ocupado y dejen de molestar.' },
      { id: 'opt-p13-c', code: 'C', weight: 30, text: 'Abandonar mi tarea contable y dedicarme exclusivamente a resolver los problemas de los demás.' },
      { id: 'opt-p13-d', code: 'D', weight: 0, text: 'Quejarme formalmente con Recursos Humanos sobre la falta de respeto a mi concentración.' }
    ]
  },
  {
    id: 'psy-14',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 14,
    competency: 'Evaluación de alternativas',
    statement: 'Para resolver un cuello de botella logístico tienes dos alternativas: comprar un equipo costoso de entrega inmediata o capacitar al personal existente con resultados en dos meses. ¿Cómo fundamentas la elección?',
    options: [
      { id: 'opt-p14-a', code: 'A', weight: 100, text: 'Cuantificar el costo total de propiedad, el impacto en la operación mensual y presentar un cuadro comparativo con recomendación técnica.' },
      { id: 'opt-p14-b', code: 'B', weight: 65, text: 'Optar siempre por la opción más barata sin importar el tiempo de impacto en los clientes.' },
      { id: 'opt-p14-c', code: 'C', weight: 30, text: 'Elegir el equipo costoso de inmediato para no tener que invertir tiempo en enseñar al personal.' },
      { id: 'opt-p14-d', code: 'D', weight: 0, text: 'Dejar que el jefe decida sin ofrecer ningún análisis ni sugerencia técnica de soporte.' }
    ]
  },
  {
    id: 'psy-15',
    stageId: 'STAGE_1_PSYCHO',
    orderNumber: 15,
    competency: 'Cierre de proyectos y lecciones aprendidas',
    statement: 'Al concluir una campaña laboral exigente con resultados positivos pero varios contratiempos internos, ¿qué acción consideras prioritaria?',
    options: [
      { id: 'opt-p15-a', code: 'A', weight: 100, text: 'Convocar una breve reunión de retrospectiva con el equipo para identificar qué mantener, qué descartar y qué mejorar.' },
      { id: 'opt-p15-b', code: 'B', weight: 65, text: 'Celebrar el resultado y pasar al siguiente proyecto sin revisar lo que falló.' },
      { id: 'opt-p15-c', code: 'C', weight: 30, text: 'Buscar culpables de las demoras para señalarlos en la evaluación de desempeño.' },
      { id: 'opt-p15-d', code: 'D', weight: 0, text: 'Archivar todos los documentos sin actualizar las plantillas de trabajo del equipo.' }
    ]
  },

  // =================== ETAPA 2: PERSONAL Y EMOCIONAL (15 preguntas) ===================
  {
    id: 'emo-01',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 1,
    competency: 'Autorregulación bajo presión',
    statement: 'En plena reunión de balance mensual con varias jefaturas, un par te recrimina públicamente por un retraso que no fue responsabilidad directa de tu área. ¿Cómo reaccionas?',
    options: [
      { id: 'opt-e1-a', code: 'A', weight: 100, text: 'Mantener la calma, precisar los hechos objetivos con serenidad y proponer revisar el flujo conjunto al término de la sesión.' },
      { id: 'opt-e1-b', code: 'B', weight: 65, text: 'Responder con el mismo tono alzando la voz para defender mi reputación y la de mi equipo.' },
      { id: 'opt-e1-c', code: 'C', weight: 30, text: 'Permanecer en silencio absoluto con evidente enojo y abandonar la sala de reuniones.' },
      { id: 'opt-e1-d', code: 'D', weight: 0, text: 'Aceptar la culpa en público aun sabiendo que no es cierta, para evitar el conflicto.' }
    ]
  },
  {
    id: 'emo-02',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 2,
    competency: 'Empatía y escucha activa',
    statement: 'Notas que un compañero de equipo habitualmente eficiente lleva tres días distraído, cometiendo errores menores y mostrándose retraído. ¿Qué actitud adoptas?',
    options: [
      { id: 'opt-e2-a', code: 'A', weight: 100, text: 'Acercarme en privado en un momento oportuno, consultarle si todo marcha bien y ofrecerle apoyo en sus tareas urgentes.' },
      { id: 'opt-e2-b', code: 'B', weight: 65, text: 'Avisar de inmediato a la jefatura para que le llamen la atención por bajar su productividad.' },
      { id: 'opt-e2-c', code: 'C', weight: 30, text: 'Comentar su bajo rendimiento con otros compañeros del área en los pasillos.' },
      { id: 'opt-e2-d', code: 'D', weight: 0, text: 'Ignorar la situación por completo ya que sus problemas personales no me corresponden.' }
    ]
  },
  {
    id: 'emo-03',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 3,
    competency: 'Tolerancia a la frustración',
    statement: 'Dedicaste tres semanas a formular un proyecto estratégico de innovación. En el comité de evaluación deciden posponerlo indefinidamente por reasignación de prioridades corporativas. ¿Cómo lo procesas?',
    options: [
      { id: 'opt-e3-a', code: 'A', weight: 100, text: 'Aceptar que las prioridades del negocio cambian, solicitar feedback constructivo y dejar el proyecto listo para retomarlo en el futuro.' },
      { id: 'opt-e3-b', code: 'B', weight: 65, text: 'Expresar desmotivación evidente y reducir mi compromiso con las tareas habituales.' },
      { id: 'opt-e3-c', code: 'C', weight: 30, text: 'Insistir tercamente ante el gerente general para que desautorice la decisión del comité.' },
      { id: 'opt-e3-d', code: 'D', weight: 0, text: 'Deshacerme de los archivos y plantillas del proyecto por considerarlos tiempo perdido.' }
    ]
  },
  {
    id: 'emo-04',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 4,
    competency: 'Comunicación asertiva',
    statement: 'Tu líder de área te solicita constantemente que te quedes fuera de tu jornada laboral habitual sin previo aviso ni justificación de fuerza mayor, afectando tus compromisos familiares. ¿Cómo lo abordas?',
    options: [
      { id: 'opt-e4-a', code: 'A', weight: 100, text: 'Solicitar una reunión privada, exponer con respeto la necesidad de planificar con anticipación y proponer alternativas de organización del trabajo.' },
      { id: 'opt-e4-b', code: 'B', weight: 65, text: 'Aceptar siempre con resignación y quejarme con mis compañeros al día siguiente.' },
      { id: 'opt-e4-c', code: 'C', weight: 30, text: 'Apagar el teléfono a la hora exacta de salida sin avisar a nadie y ausentarme.' },
      { id: 'opt-e4-d', code: 'D', weight: 0, text: 'Publicar una indirecta en redes sociales sobre las empresas que no respetan el balance vida-trabajo.' }
    ]
  },
  {
    id: 'emo-05',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 5,
    competency: 'Resolución constructiva de desacuerdos',
    statement: 'Tienes una discrepancia metodológica profunda con un colega sobre cómo presentar una propuesta comercial a un cliente clave. ¿Cómo alcanzan un acuerdo?',
    options: [
      { id: 'opt-e5-a', code: 'A', weight: 100, text: 'Centrar el debate en el objetivo del cliente, contrastar pros y contras de cada método con datos y buscar un punto medio sin tomarlo como una batalla personal.' },
      { id: 'opt-e5-b', code: 'B', weight: 65, text: 'Buscar que la jefatura imponga mi criterio demostrando que tengo más antigüedad.' },
      { id: 'opt-e5-c', code: 'C', weight: 30, text: 'Ceder por completo a regañadientes esperando que la propuesta falle para decir "te lo dije".' },
      { id: 'opt-e5-d', code: 'D', weight: 0, text: 'Enviar dos propuestas contradictorias por separado directamente al cliente.' }
    ]
  },
  {
    id: 'emo-06',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 6,
    competency: 'Manejo del error propio',
    statement: 'Cometes una equivocación al cargar una plantilla de precios y el sistema publica un descuento incorrecto durante 30 minutos antes de ser detectado. ¿Cuál es tu conducta?',
    options: [
      { id: 'opt-e6-a', code: 'A', weight: 100, text: 'Informar de inmediato a la jefatura, asumir la autoría con honestidad, corregir el archivo y proponer un filtro de validación doble para que no se repita.' },
      { id: 'opt-e6-b', code: 'B', weight: 65, text: 'Esperar a que alguien lo note y atribuirlo a un problema técnico de la plataforma informática.' },
      { id: 'opt-e6-c', code: 'C', weight: 30, text: 'Borrar los registros de auditoría de mi usuario en la base de datos para no dejar evidencia.' },
      { id: 'opt-e6-d', code: 'D', weight: 0, text: 'Decir que otro compañero que estuvo en mi escritorio modificó la celda por error.' }
    ]
  },
  {
    id: 'emo-07',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 7,
    competency: 'Resiliencia ante la incertidumbre',
    statement: 'La empresa atraviesa una reestructuración organizacional y durante un mes no hay claridad sobre qué funciones mantendrá cada puesto. ¿Cómo te desenvuelves?',
    options: [
      { id: 'opt-e7-a', code: 'A', weight: 100, text: 'Enfocarme en cumplir mis tareas presentes con excelencia, mantener una comunicación fluida con mi equipo y estar abierto a nuevas responsabilidades.' },
      { id: 'opt-e7-b', code: 'B', weight: 65, text: 'Participar activamente en rumores de pasillo y especular sobre despidos masivos.' },
      { id: 'opt-e7-c', code: 'C', weight: 30, text: 'Bajar mi ritmo de trabajo bajo la premisa de que "para qué esforzarse si las cosas van a cambiar".' },
      { id: 'opt-e7-d', code: 'D', weight: 0, text: 'Exigir al gerente general garantías laborales inmediatas bajo amenaza de huelga de brazos caídos.' }
    ]
  },
  {
    id: 'emo-08',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 8,
    competency: 'Reconocimiento y mérito compartido',
    statement: 'La Dirección premia una iniciativa que lideraste, pero que requirió el esfuerzo extraordinario y las horas extras de dos colaboradores de soporte. ¿Qué dices en el reconocimiento?',
    options: [
      { id: 'opt-e8-a', code: 'A', weight: 100, text: 'Agradecer el premio mencionando con nombre y apellido a los colaboradores y explicando el valor determinante de su aporte.' },
      { id: 'opt-e8-b', code: 'B', weight: 65, text: 'Recibir el premio en solitario y felicitarlos después por mensaje privado de texto.' },
      { id: 'opt-e8-c', code: 'C', weight: 30, text: 'Atribuirme todo el crédito intelectual dado que fui quien diseñó la idea original.' },
      { id: 'opt-e8-d', code: 'D', weight: 0, text: 'Decir que el premio no tiene importancia y no presentarse al acto corporativo.' }
    ]
  },
  {
    id: 'emo-09',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 9,
    competency: 'Actitud frente al éxito ajeno',
    statement: 'Promueven a un puesto vacante que tú anhelabas a un compañero con igual tiempo de servicio en la empresa. ¿Cómo gestionas tus emociones?',
    options: [
      { id: 'opt-e9-a', code: 'A', weight: 100, text: 'Felicitarlo sinceramente, reflexionar sobre mis brechas de desarrollo y pedir una sesión de retroalimentación con mi jefe sobre mi plan de carrera.' },
      { id: 'opt-e9-b', code: 'B', weight: 65, text: 'Mostrar desdén hacia el compañero promovido y dejar de saludarlo en los pasillos.' },
      { id: 'opt-e9-c', code: 'C', weight: 30, text: 'Esparcir la idea de que fue promovido por favoritismos personales y no por méritos.' },
      { id: 'opt-e9-d', code: 'D', weight: 0, text: 'Renunciar de manera impulsiva ese mismo día sin contar con otra oferta laboral.' }
    ]
  },
  {
    id: 'emo-10',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 10,
    competency: 'Límites interpersonales y ética profesional',
    statement: 'Un amigo cercano dentro de la oficina te pide que no registres un retraso reiterado suyo en el sistema de asistencias que tú gestionas. ¿Cómo respondes?',
    options: [
      { id: 'opt-e10-a', code: 'A', weight: 100, text: 'Explicarle con afecto pero total firmeza que la amistad no puede condicionar las normas de la empresa ni comprometer mi integridad laboral.' },
      { id: 'opt-e10-b', code: 'B', weight: 65, text: 'Cubrirlo esta vez y advertirle que será la última ocasión.' },
      { id: 'opt-e10-c', code: 'C', weight: 30, text: 'Aceptar ayudarlo a cambio de favores laborales equivalentes en el futuro.' },
      { id: 'opt-e10-d', code: 'D', weight: 0, text: 'Insultarlo por ponerme en esa situación y cortar la amistad de forma agresiva.' }
    ]
  },
  {
    id: 'emo-11',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 11,
    competency: 'Motivación intrínseca y constancia',
    statement: 'Debes realizar una labor repetitiva de archivo y digitalización que durará varias semanas y no resulta estimulante. ¿Cómo mantienes tu estándar de calidad?',
    options: [
      { id: 'opt-e11-a', code: 'A', weight: 100, text: 'Establecer metas diarias personales, diseñar un método más ordenado y recordar la importancia que tiene esa información para el servicio integral.' },
      { id: 'opt-e11-b', code: 'B', weight: 65, text: 'Hacerlo al mínimo esfuerzo posible solo para cumplir el horario.' },
      { id: 'opt-e11-c', code: 'C', weight: 30, text: 'Quejarme todos los días ante los jefes para que me reasignen tareas más entretenidas.' },
      { id: 'opt-e11-d', code: 'D', weight: 0, text: 'Dejar expedientes sin digitalizar asumiendo que nadie los consultará.' }
    ]
  },
  {
    id: 'emo-12',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 12,
    competency: 'Manejo de clientes o usuarios alterados',
    statement: 'Un usuario o cliente interno llega a tu módulo sumamente ofuscado, levantando la voz y quejándose de una demora en su trámite. ¿Cuál es tu primera intervención?',
    options: [
      { id: 'opt-e12-a', code: 'A', weight: 100, text: 'Escuchar sin interrumpir, validar su preocupación con empatía ("Entiendo su malestar"), mantener un tono de voz sosegado y ofrecer una solución concreta.' },
      { id: 'opt-e12-b', code: 'B', weight: 65, text: 'Exigirle que se calle de inmediato o de lo contrario no será atendido.' },
      { id: 'opt-e12-c', code: 'C', weight: 30, text: 'Culpar al sistema informático y lavarme las manos del trámite.' },
      { id: 'opt-e12-d', code: 'D', weight: 0, text: 'Llamar a seguridad de inmediato sin antes haber conversado con él.' }
    ]
  },
  {
    id: 'emo-13',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 13,
    competency: 'Inclusión y respeto a la diversidad',
    statement: 'Se incorpora al equipo un nuevo integrante con una cultura, dialecto o estilo de comunicación diferente y algunos compañeros hacen comentarios burlones a sus espaldas. ¿Cuál es tu postura?',
    options: [
      { id: 'opt-e13-a', code: 'A', weight: 100, text: 'Frenar la burla con amabilidad, recordar la importancia del respeto en el equipo y ser un puente de integración para el nuevo compañero.' },
      { id: 'opt-e13-b', code: 'B', weight: 65, text: 'Reír de los comentarios para encajar en el grupo de confianza de la oficina.' },
      { id: 'opt-e13-c', code: 'C', weight: 30, text: 'Mantener distancia tanto del nuevo integrante como del grupo burlón.' },
      { id: 'opt-e13-d', code: 'D', weight: 0, text: 'Filtrar una grabación secreta de los compañeros a la gerencia sin hablar primero con ellos.' }
    ]
  },
  {
    id: 'emo-14',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 14,
    competency: 'Capacidad de pedir ayuda a tiempo',
    statement: 'Te das cuenta de que la carga de trabajo asignada excede tu capacidad humana de entrega para el viernes a las 5:00 p.m. Son el miércoles a mediodía. ¿Qué decides?',
    options: [
      { id: 'opt-e14-a', code: 'A', weight: 100, text: 'Alertar con anticipación a la jefatura, presentar lo avanzado con métricas y acordar una redistribución o repriorización de entregables.' },
      { id: 'opt-e14-b', code: 'B', weight: 65, text: 'Callar hasta el viernes a las 4:55 p.m. y avisar que no se pudo terminar.' },
      { id: 'opt-e14-c', code: 'C', weight: 30, text: 'Realizar un trabajo apresurado con baja calidad para fingir que se completó.' },
      { id: 'opt-e14-d', code: 'D', weight: 0, text: 'Presentar descanso médico el viernes para justificar la no entrega.' }
    ]
  },
  {
    id: 'emo-15',
    stageId: 'STAGE_2_EMOTIONAL',
    orderNumber: 15,
    competency: 'Integridad y coherencia personal',
    statement: 'En una auditoría interna detectas que una práctica habitual del área vulnera una política formal de la empresa, aunque beneficia a los indicadores rápidos. ¿Qué conducta sostienes?',
    options: [
      { id: 'opt-e15-a', code: 'A', weight: 100, text: 'Exponer el hallazgo de manera transparente ante la jefatura y proponer la regularización formal del proceso para blindar a la empresa de riesgos legales.' },
      { id: 'opt-e15-b', code: 'B', weight: 65, text: 'Ocultar el hallazgo para no poner en aprietos a los líderes que promovieron esa práctica.' },
      { id: 'opt-e15-c', code: 'C', weight: 30, text: 'Aprovechar la situación para chantajear a los responsables en futuras evaluaciones.' },
      { id: 'opt-e15-d', code: 'D', weight: 0, text: 'Desinteresarme porque la auditoría es responsabilidad exclusiva del auditor líder.' }
    ]
  },

  // =================== ETAPA 3: SITUACIONES LABORALES (15 preguntas) ===================
  {
    id: 'work-01',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 1,
    competency: 'Toma de decisiones operativas bajo presión',
    statement: 'Caso: Son las 8:50 a.m. de un lunes. El servidor principal de atención al público se encuentra fuera de servicio y hay una fila de 40 usuarios esperando en ventanilla. El soporte de TI demorará 45 minutos en restablecerlo. ¿Qué acción implementas de inmediato?',
    options: [
      { id: 'opt-w1-a', code: 'A', weight: 100, text: 'Activar el protocolo de contingencia manual (fichas físicas numeradas y registro sellado), salir a informar a los usuarios con amabilidad y ordenar la atención por orden de llegada.' },
      { id: 'opt-w1-b', code: 'B', weight: 65, text: 'Cerrar las persianas de ventanilla hasta que TI confirme que el sistema está 100% operativo.' },
      { id: 'opt-w1-c', code: 'C', weight: 30, text: 'Indicar a los usuarios que regresen al día siguiente porque sin sistema no se puede hacer nada.' },
      { id: 'opt-w1-d', code: 'D', weight: 0, text: 'Atender solo a los conocidos o conocidos de gerencia usando una conexión móvil privada.' }
    ]
  },
  {
    id: 'work-02',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 2,
    competency: 'Negociación y gestión de compromisos',
    statement: 'Caso: Un área usuaria clave te solicita un reporte extraordinario con fecha de entrega para hoy a las 3:00 p.m., pero ya tenías comprometido un informe legal regulatorio cuya omisión conlleva multa para la organización. ¿Cómo procedes?',
    options: [
      { id: 'opt-w2-a', code: 'A', weight: 100, text: 'Explicar al área usuaria el riesgo regulatorio del informe legal, acordar qué datos clave del reporte extraordinario puedo brindarle hoy de forma preliminar y coordinar la entrega final para mañana a primera hora.' },
      { id: 'opt-w2-b', code: 'B', weight: 65, text: 'Dejar de lado el informe regulatorio para no ganarme problemas con el área usuaria.' },
      { id: 'opt-w2-c', code: 'C', weight: 30, text: 'Ignorar los correos y mensajes del área usuaria hasta que venza el plazo.' },
      { id: 'opt-w2-d', code: 'D', weight: 0, text: 'Decirles que sí a ambos compromisos sabiendo que no podré cumplir ninguno de los dos.' }
    ]
  },
  {
    id: 'work-03',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 3,
    competency: 'Atención a la calidad del servicio',
    statement: 'Caso: Un proveedor estratégico entrega un lote de materiales indispensable para un evento corporativo de mañana por la mañana. Al verificar la mercadería, encuentras que el 15% presenta fallas visibles de empaque o rotulación. ¿Qué medida tomas?',
    options: [
      { id: 'opt-w3-a', code: 'A', weight: 100, text: 'Aceptar el 85% conforme con acta firmada, exigir la reposición inmediata del 15% fallado en un plazo de 6 horas bajo penalidad y notificar a la jefatura.' },
      { id: 'opt-w3-b', code: 'B', weight: 65, text: 'Rechazar todo el lote completo cancelando el evento de mañana.' },
      { id: 'opt-w3-c', code: 'C', weight: 30, text: 'Aceptar todo el lote sin observaciones para no generar papeleos ni incomodar al proveedor.' },
      { id: 'opt-w3-d', code: 'D', weight: 0, text: 'Ocultar las fallas y esperar a que los asistentes al evento se quejen mañana.' }
    ]
  },
  {
    id: 'work-04',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 4,
    competency: 'Seguridad de la información y confidencialidad',
    statement: 'Caso: Un funcionario de otra gerencia te escribe por chat corporativo pidiéndote con urgencia la lista de sueldos o evaluaciones psicológicas del personal para una "comparativa rápida". No tiene autorización formal en el sistema. ¿Qué haces?',
    options: [
      { id: 'opt-w4-a', code: 'A', weight: 100, text: 'Rechazar cordialmente la solicitud explicando que son datos sensibles protegidos por ley interna y la Ley 29733, e indicarle el canal formal de aprobación con Recursos Humanos.' },
      { id: 'opt-w4-b', code: 'B', weight: 65, text: 'Compartir el archivo por WhatsApp privado para no dejar rastro en el correo corporativo.' },
      { id: 'opt-w4-c', code: 'C', weight: 30, text: 'Enviarle los datos de inmediato dado que tiene rango de funcionario en la empresa.' },
      { id: 'opt-w4-d', code: 'D', weight: 0, text: 'Ignorar el mensaje sin responderle nada.' }
    ]
  },
  {
    id: 'work-05',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 5,
    competency: 'Optimización de recursos y costos',
    statement: 'Caso: En tu área se consumen mensualmente 15 millares de hojas de papel y carpetas de plástico para trámites que hoy cuentan con firma electrónica habilitada por ley. ¿Cuál es tu propuesta de acción?',
    options: [
      { id: 'opt-w5-a', code: 'A', weight: 100, text: 'Presentar un plan piloto de digitalización de flujos con firma digital, estimar el ahorro económico y ambiental anual, y capacitar al equipo en el uso de la herramienta.' },
      { id: 'opt-w5-b', code: 'B', weight: 65, text: 'Seguir imprimiendo todo porque el papel "da más seguridad psicológica" a los usuarios.' },
      { id: 'opt-w5-c', code: 'C', weight: 30, text: 'Esconder el papel en los cajones para que la gente no imprima a la fuerza.' },
      { id: 'opt-w5-d', code: 'D', weight: 0, text: 'Comprar impresoras más veloces para no perder tiempo esperando las copias.' }
    ]
  },
  {
    id: 'work-06',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 6,
    competency: 'Gestión de reclamos y resolución de conflictos con usuarios',
    statement: 'Caso: Un candidato postula a una convocatoria y por un error técnico del sistema su prueba no se grabó. El postulante llama sumamente indignado amenazando con denunciar a la institución ante Sunafil. ¿Cómo gestionas el caso?',
    options: [
      { id: 'opt-w6-a', code: 'A', weight: 100, text: 'Verificar la bitácora técnica con TI, reconocer la contingencia con respeto institucional, reprogramar su intento con garantías de tiempo y levantar un acta de solución.' },
      { id: 'opt-w6-b', code: 'B', weight: 65, text: 'Decirle que es problema de su conexión de internet y desestimar su postulación.' },
      { id: 'opt-w6-c', code: 'C', weight: 30, text: 'Cortar la llamada telefónica para no escuchar amenazas.' },
      { id: 'opt-w6-d', code: 'D', weight: 0, text: 'Aprobar al candidato con puntaje máximo sin que rinda la prueba para evitar la denuncia.' }
    ]
  },
  {
    id: 'work-07',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 7,
    competency: 'Cumplimiento normativo y anticorrupción',
    statement: 'Caso: Un postulante finalista en una convocatoria de compras o logística resulta ser el sobrino directo del jefe de tu departamento. La jefatura te pide que le sumes 3 puntos en la entrevista para asegurar su ingreso. ¿Qué haces?',
    options: [
      { id: 'opt-w7-a', code: 'A', weight: 100, text: 'Rechazar la solicitud con apego estricto al código de ética institucional y normativas de conflicto de interés, calificar según la rúbrica objetiva y dejar constancia formal.' },
      { id: 'opt-w7-b', code: 'B', weight: 65, text: 'Sumarle los puntos solicitados porque el jefe es quien evalúa mi continuidad laboral.' },
      { id: 'opt-w7-c', code: 'C', weight: 30, text: 'Descalificar al postulante arbitrariamente para no tener problemas.' },
      { id: 'opt-w7-d', code: 'D', weight: 0, text: 'Pedirle dinero al postulante a cambio del favor solicitado por su tío.' }
    ]
  },
  {
    id: 'work-08',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 8,
    competency: 'Gestión de imprevistos logísticos',
    statement: 'Caso: Para una jornada de inducción obligatoria para 60 nuevos ingresos, el local contratado sufre un corte intempestivo de fluido eléctrico 20 minutos antes de comenzar. ¿Cómo respondes?',
    options: [
      { id: 'opt-w8-a', code: 'A', weight: 100, text: 'Coordinar con administración la habilitación del grupo electrógeno del edificio, adaptar la primera hora con dinámicas presenciales sin proyector y mantener informados a los participantes.' },
      { id: 'opt-w8-b', code: 'B', weight: 65, text: 'Cancelar la jornada de inducción y reprogramarla para el mes siguiente.' },
      { id: 'opt-w8-c', code: 'C', weight: 30, text: 'Permanecer a oscuras en la sala esperando a que la empresa de luz restablezca el servicio.' },
      { id: 'opt-w8-d', code: 'D', weight: 0, text: 'Dar por dictada la inducción y pedir a los 60 asistentes que firmen la lista de asistencia.' }
    ]
  },
  {
    id: 'work-09',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 9,
    competency: 'Evaluación y selección de prioridades en equipo',
    statement: 'Caso: En tu equipo de 5 personas, dos se encuentran con descanso médico simultáneo en plena semana de cierre anual. El volumen de trabajo restante supera las horas laborales habituales. ¿Cómo te organizas?',
    options: [
      { id: 'opt-w9-a', code: 'A', weight: 100, text: 'Reunirme con los 3 integrantes activos y el líder para clasificar los entregables en críticos (vitales para el negocio) y postergables, rebalanceando la carga de forma equitativa.' },
      { id: 'opt-w9-b', code: 'B', weight: 65, text: 'Trabajar 18 horas diarias sin descanso hasta enfermarme también.' },
      { id: 'opt-w9-c', code: 'C', weight: 30, text: 'Dejar que el trabajo de los compañeros ausentes se acumule en sus bandejas hasta que regresen.' },
      { id: 'opt-w9-d', code: 'D', weight: 0, text: 'Quejarme con el sindicato por sobrecarga laboral sin proponer soluciones.' }
    ]
  },
  {
    id: 'work-10',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 10,
    competency: 'Mejora continua del puesto de trabajo',
    statement: 'Caso: Adviertes que una consulta recurrente que quita 2 horas al día a tu equipo podría resolverse colocando una sección de preguntas frecuentes clara y un formulario automatizado en la intranet. ¿Cómo lo impulsas?',
    options: [
      { id: 'opt-w10-a', code: 'A', weight: 100, text: 'Diseñar el borrador de las preguntas frecuentes, validar con el área de TI la viabilidad técnica del formulario y presentar a la jefatura la propuesta con la estimación de horas ahorradas.' },
      { id: 'opt-w10-b', code: 'B', weight: 65, text: 'Esperar a que el área de Comunicaciones se dé cuenta por su propia cuenta.' },
      { id: 'opt-w10-c', code: 'C', weight: 30, text: 'Dejar de contestar las consultas de los usuarios para que ellos mismos averigüen las respuestas.' },
      { id: 'opt-w10-d', code: 'D', weight: 0, text: 'Publicar el documento sin autorización en cualquier carpeta pública.' }
    ]
  },
  {
    id: 'work-11',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 11,
    competency: 'Auditoría y trazabilidad documental',
    statement: 'Caso: Debes archivar los expedientes de una licitación que concluyó. Un compañero te sugiere descartar las actas borrador y las notas de aclaración para que los archivadores ocupen menos espacio. ¿Qué decides?',
    options: [
      { id: 'opt-w11-a', code: 'A', weight: 100, text: 'Mantener el expediente íntegro con foliación consecutiva conforme a la tabla de retención documental institucional, garantizando la trazabilidad ante eventuales auditorías.' },
      { id: 'opt-w11-b', code: 'B', weight: 65, text: 'Desechar todas las actas preliminares a la papelera de reciclaje.' },
      { id: 'opt-w11-c', code: 'C', weight: 30, text: 'Llevarme los documentos a mi domicilio particular.' },
      { id: 'opt-w11-d', code: 'D', weight: 0, text: 'Digitalizar solo las firmas y triturar todo el papel de inmediato sin acta de descarte.' }
    ]
  },
  {
    id: 'work-12',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 12,
    competency: 'Comunicación en situaciones de crisis institucional',
    statement: 'Caso: Se propaga una noticia falsa en redes sociales sobre un supuesto desabastecimiento en la organización, y varios clientes llaman alarmados a tu anexo. No hay aún un comunicado oficial emitido. ¿Cómo manejas las llamadas?',
    options: [
      { id: 'opt-w12-a', code: 'A', weight: 100, text: 'Transmitir serenidad, informar que las operaciones se desarrollan con normalidad, evitar emitir juicios no contrastados y canalizar las dudas institucionales al área de Comunicaciones Corporativas.' },
      { id: 'opt-w12-b', code: 'B', weight: 65, text: 'Confirmar el rumor a los clientes y aconsejarles que retiren sus fondos o compras de inmediato.' },
      { id: 'opt-w12-c', code: 'C', weight: 30, text: 'Tratar de mentirosos a los clientes de forma agresiva.' },
      { id: 'opt-w12-d', code: 'D', weight: 0, text: 'Descolgar el teléfono para que no ingresen más llamadas.' }
    ]
  },
  {
    id: 'work-13',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 13,
    competency: 'Gestión del cambio organizacional',
    statement: 'Caso: La organización decide migrar hacia una política de trabajo híbrido (3 días presenciales y 2 remotos) con medición estricta por objetivos en lugar de horas de presencia física. ¿Cuál es tu postura operativa?',
    options: [
      { id: 'opt-w13-a', code: 'A', weight: 100, text: 'Establecer metas semanales claras, definir canales de comunicación sincronizados y acordar indicadores medibles con mi jefatura para asegurar la entrega de valor en ambos formatos.' },
      { id: 'opt-w13-b', code: 'B', weight: 65, text: 'Aprovechar los días remotos como días de descanso sin revisar correos ni tareas.' },
      { id: 'opt-w13-c', code: 'C', weight: 30, text: 'Exigir volver al formato 100% presencial porque no confío en el trabajo a distancia.' },
      { id: 'opt-w13-d', code: 'D', weight: 0, text: 'Negarme a registrar los avances en la plataforma de gestión aduciendo sobrecarga.' }
    ]
  },
  {
    id: 'work-14',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 14,
    competency: 'Orientación a la excelencia y mejora de la satisfacción',
    statement: 'Caso: Al finalizar una capacitación interna que dictaste, la encuesta de satisfacción arroja una nota aprobatoria pero varios comentarios indican que el material de diapositivas tenía letra muy pequeña y ejemplos poco prácticos. ¿Qué haces para la siguiente edición?',
    options: [
      { id: 'opt-w14-a', code: 'A', weight: 100, text: 'Analizar los comentarios constructivos, rediseñar las diapositivas con mayor contraste y tipografía legible, e incorporar 3 casos prácticos reales basados en las funciones de los participantes.' },
      { id: 'opt-w14-b', code: 'B', weight: 65, text: 'Desestimar los comentarios asumiendo que los participantes siempre buscan pretextos para quejarse.' },
      { id: 'opt-w14-c', code: 'C', weight: 30, text: 'Eliminar las encuestas de satisfacción en las futuras capacitaciones para no recibir críticas.' },
      { id: 'opt-w14-d', code: 'D', weight: 0, text: 'Pedir que solo participen quienes tengan buena vista.' }
    ]
  },
  {
    id: 'work-15',
    stageId: 'STAGE_3_WORK_CASES',
    orderNumber: 15,
    competency: 'Cierre responsable y entrega de cuentas',
    statement: 'Caso: Vas a hacer uso de tu descanso vacacional reglamentario por dos semanas. Tienes procesos periódicos y dos proyectos en curso. ¿Cuál es el procedimiento adecuado previo a tu salida?',
    options: [
      { id: 'opt-w15-a', code: 'A', weight: 100, text: 'Elaborar un acta de transferencia detallada con el estado de cada proceso, accesos, contactos clave y tareas prioritarias, realizar una reunión de entrega con el relevo y notificar a la jefatura.' },
      { id: 'opt-w15-b', code: 'B', weight: 65, text: 'Cerrar la laptop el último día a la hora de salida sin avisar a nadie.' },
      { id: 'opt-w15-c', code: 'C', weight: 30, text: 'Dejar una nota manuscrita rápida en el escritorio con números de teléfono sueltos.' },
      { id: 'opt-w15-d', code: 'D', weight: 0, text: 'Pedir que nadie toque nada de mi escritorio ni archivos hasta mi retorno.' }
    ]
  }
];
