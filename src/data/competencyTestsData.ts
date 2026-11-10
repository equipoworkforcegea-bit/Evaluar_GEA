export interface CompetencyBehaviorStatement {
  id: string;
  text: string;
  level: number; // 4: Muy alineado (Excelente), 3: Alineado (Adecuado), 2: Básico, 1: Desalineado / Foco opuesto
}

export interface CompetencyTestBlock {
  blockNumber: number;
  instruction?: string;
  behaviors: CompetencyBehaviorStatement[];
}

export const TAILORED_COMPETENCY_BLOCKS: Record<string, CompetencyTestBlock[]> = {
  // 1. ORIENTACIÓN AL CLIENTE
  'Orientación al Cliente': [
    {
      blockNumber: 1,
      behaviors: [
        { id: 'c1_1', text: 'Me anticipo a las dudas del cliente y busco activamente superar sus expectativas.', level: 4 },
        { id: 'c1_2', text: 'Escucho con atención y empatía lo que el cliente necesita para resolver su consulta.', level: 3 },
        { id: 'c1_3', text: 'Sigo fielmente el manual y las pautas estándar de atención establecidas.', level: 2 },
        { id: 'c1_4', text: 'Prefiero enfocarme en terminar rápido los trámites administrativos del sistema.', level: 1 }
      ]
    },
    {
      blockNumber: 2,
      behaviors: [
        { id: 'c1_5', text: 'Convierto una queja o reclamo en una oportunidad para fidelizar y generar confianza.', level: 4 },
        { id: 'c1_6', text: 'Mantengo una actitud cordial y respetuosa incluso ante usuarios exigentes.', level: 3 },
        { id: 'c1_7', text: 'Derivo el caso a otra área cuando la solicitud del cliente excede mi turno.', level: 2 },
        { id: 'c1_8', text: 'Explico las limitaciones de la empresa sin involucrarme en el problema de fondo.', level: 1 }
      ]
    },
    {
      blockNumber: 3,
      behaviors: [
        { id: 'c1_9', text: 'Hago seguimiento personal al cliente hasta asegurarme de que su problema quedó 100% resuelto.', level: 4 },
        { id: 'c1_10', text: 'Brindo información clara y verificada sobre las alternativas disponibles.', level: 3 },
        { id: 'c1_11', text: 'Espero a que el cliente pregunte para detallar las condiciones del servicio.', level: 2 },
        { id: 'c1_12', text: 'Doy por finalizada la interacción una vez registrado el ticket en el sistema.', level: 1 }
      ]
    },
    {
      blockNumber: 4,
      behaviors: [
        { id: 'c1_13', text: 'Propongo mejoras en los procesos de la empresa basadas en los comentarios de los clientes.', level: 4 },
        { id: 'c1_14', text: 'Me aseguro de que el cliente se sienta comprendido y valorado en cada llamada o visita.', level: 3 },
        { id: 'c1_15', text: 'Atiendo con corrección formal cumpliendo el tiempo promedio por atención.', level: 2 },
        { id: 'c1_16', text: 'Considero que el cliente debe informarse por sí mismo en los canales digitales.', level: 1 }
      ]
    },
    {
      blockNumber: 5,
      behaviors: [
        { id: 'c1_17', text: 'Adapto mi ritmo y tono de voz según el estado de ánimo y necesidad del cliente.', level: 4 },
        { id: 'c1_18', text: 'Ofrezco disculpas sinceras ante una falla del servicio y busco una pronta solución.', level: 3 },
        { id: 'c1_19', text: 'Acepto las quejas como parte inevitable del trabajo diario.', level: 2 },
        { id: 'c1_20', text: 'Señalo al cliente cuando ha cometido un error en el uso de su producto o servicio.', level: 1 }
      ]
    },
    {
      blockNumber: 6,
      behaviors: [
        { id: 'c1_21', text: 'Defiendo la satisfacción del cliente como la máxima prioridad de mi labor diaria.', level: 4 },
        { id: 'c1_22', text: 'Cumplo a cabalidad los plazos de respuesta que le prometo al usuario.', level: 3 },
        { id: 'c1_23', text: 'Informo los plazos generales de atención de la empresa sin comprometerme de más.', level: 2 },
        { id: 'c1_24', text: 'Priorizo cerrar los casos con el menor tiempo de llamada posible.', level: 1 }
      ]
    },
    {
      blockNumber: 7,
      behaviors: [
        { id: 'c1_25', text: 'Identifico necesidades no expresadas por el cliente para ofrecerle valor agregado.', level: 4 },
        { id: 'c1_26', text: 'Explico con paciencia términos técnicos complejos en un lenguaje sencillo.', level: 3 },
        { id: 'c1_27', text: 'Repito el argumento estándar si el cliente manifiesta dudas.', level: 2 },
        { id: 'c1_28', text: 'Asumo que si el cliente no repregunta es porque todo quedó completamente claro.', level: 1 }
      ]
    },
    {
      blockNumber: 8,
      behaviors: [
        { id: 'c1_29', text: 'Genero una experiencia memorable y humana que distingue positivamente a la marca.', level: 4 },
        { id: 'c1_30', text: 'Agradezco al cliente por su contacto y verifico su conformidad antes de despedirme.', level: 3 },
        { id: 'c1_31', text: 'Uso los saludos y despedidas protocolares del guion de atención.', level: 2 },
        { id: 'c1_32', text: 'Corto la comunicación con rapidez una vez transmitida la respuesta principal.', level: 1 }
      ]
    },
    {
      blockNumber: 9,
      behaviors: [
        { id: 'c1_33', text: 'Colaboro con otras áreas para desbloquear soluciones urgentes a favor del cliente.', level: 4 },
        { id: 'c1_34', text: 'Mantengo la calma y el profesionalismo ante usuarios molestos o impacientes.', level: 3 },
        { id: 'c1_35', text: 'Registro la queja en el sistema para que otra área la gestione posteriormente.', level: 2 },
        { id: 'c1_36', text: 'Evito asumir responsabilidades por fallas originadas en otros departamentos.', level: 1 }
      ]
    },
    {
      blockNumber: 10,
      behaviors: [
        { id: 'c1_37', text: 'Busco constantemente retroalimentación sobre la calidad de mi servicio para superarme.', level: 4 },
        { id: 'c1_38', text: 'Respeto el tiempo del cliente siendo ágil y efectivo en cada interacción.', level: 3 },
        { id: 'c1_39', text: 'Me ajusto al horario de atención estricto sin excepciones.', level: 2 },
        { id: 'c1_40', text: 'Veo la atención al cliente como un trámite rutinario y mecánico.', level: 1 }
      ]
    }
  ],

  // 2. INTEGRIDAD
  'Integridad': [
    {
      blockNumber: 1,
      behaviors: [
        { id: 'c2_1', text: 'Actúo con honestidad y coherencia ética en todo momento, incluso cuando nadie me observa.', level: 4 },
        { id: 'c2_2', text: 'Cumplo mis compromisos laborales con responsabilidad y rectitud profesional.', level: 3 },
        { id: 'c2_3', text: 'Acepto las normas internas porque forman parte de mi contrato laboral.', level: 2 },
        { id: 'c2_4', text: 'Considero aceptable omitir detalles secundarios si eso agiliza el resultado.', level: 1 }
      ]
    },
    {
      blockNumber: 2,
      behaviors: [
        { id: 'c2_5', text: 'Asumo con valentía mis propios errores sin buscar culpables ni pretextos.', level: 4 },
        { id: 'c2_6', text: 'Corrijo oportunamente las fallas que detecto en mis reportes o entregables.', level: 3 },
        { id: 'c2_7', text: 'Reconozco un error únicamente si mi supervisor directo lo señala.', level: 2 },
        { id: 'c2_8', text: 'Prefiero justificar las equivocaciones atribuyéndolas a la sobrecarga de trabajo.', level: 1 }
      ]
    },
    {
      blockNumber: 3,
      behaviors: [
        { id: 'c2_9', text: 'Protejo la información confidencial de clientes y de la empresa con celo inquebrantable.', level: 4 },
        { id: 'c2_10', text: 'Utilizo los recursos y herramientas de la empresa con cuidado y transparencia.', level: 3 },
        { id: 'c2_11', text: 'Evito divulgar datos de la empresa salvo en conversaciones informales de confianza.', level: 2 },
        { id: 'c2_12', text: 'Pienso que compartir contraseñas de equipo es una práctica normal y necesaria.', level: 1 }
      ]
    },
    {
      blockNumber: 4,
      behaviors: [
        { id: 'c2_13', text: 'Denuncio y rechazo de inmediato cualquier conducta o práctica deshonesta que observe.', level: 4 },
        { id: 'c2_14', text: 'Trato a todos los compañeros con equidad, respeto y sin favoritismos.', level: 3 },
        { id: 'c2_15', text: 'Prefiero no opinar sobre faltas de otros compañeros para evitar conflictos.', level: 2 },
        { id: 'c2_16', text: 'Tolero pequeñas infracciones cotidianas si todos en el área las cometen.', level: 1 }
      ]
    },
    {
      blockNumber: 5,
      behaviors: [
        { id: 'c2_17', text: 'Digo siempre la verdad a mis líderes y clientes aunque sea difícil o incómoda.', level: 4 },
        { id: 'c2_18', text: 'Presento cifras e información verídica sin alterar la realidad de los hechos.', level: 3 },
        { id: 'c2_19', text: 'Suavizo los informes negativos para no generar alarma en la jefatura.', level: 2 },
        { id: 'c2_20', text: 'Muestro únicamente los resultados positivos para cuidar mi imagen laboral.', level: 1 }
      ]
    },
    {
      blockNumber: 6,
      behaviors: [
        { id: 'c2_21', text: 'Rechazo cualquier tipo de beneficio personal indebido o conflicto de intereses.', level: 4 },
        { id: 'c2_22', text: 'Respeto el tiempo de trabajo destinando la jornada a labores productivas.', level: 3 },
        { id: 'c2_23', text: 'Cumplo mis horas laborales aunque a veces me distraiga con asuntos personales.', level: 2 },
        { id: 'c2_24', text: 'Aprovecho tiempos muertos para resolver asuntos propios sin informar a mi líder.', level: 1 }
      ]
    },
    {
      blockNumber: 7,
      behaviors: [
        { id: 'c2_25', text: 'Promuevo una cultura de transparencia, confianza y justicia en mi entorno.', level: 4 },
        { id: 'c2_26', text: 'Reconozco el mérito y aportes de mis compañeros de trabajo con sinceridad.', level: 3 },
        { id: 'c2_27', text: 'Felicito a otros cuando la ocasión lo exige formalmente.', level: 2 },
        { id: 'c2_28', text: 'Permito que se me atribuya un logro grupal si beneficia mi evaluación anual.', level: 1 }
      ]
    },
    {
      blockNumber: 8,
      behaviors: [
        { id: 'c2_29', text: 'Mantengo mis convicciones éticas inalterables bajo presiones de metas o plazos.', level: 4 },
        { id: 'c2_30', text: 'Prefiero alcanzar metas por vías legítimas aunque tome más tiempo.', level: 3 },
        { id: 'c2_31', text: 'Me enfoco en cumplir metas siempre que no infrinja leyes formales.', level: 2 },
        { id: 'c2_32', text: 'Considero que el fin justifica los medios en momentos de alta exigencia comercial.', level: 1 }
      ]
    },
    {
      blockNumber: 9,
      behaviors: [
        { id: 'c2_33', text: 'Inspiro credibilidad y confianza sólida en clientes, pares y superiores.', level: 4 },
        { id: 'c2_34', text: 'Cumplo cabalmente con las normas de seguridad y código de conducta corporativo.', level: 3 },
        { id: 'c2_35', text: 'Sigo las normas cuando hay auditorías o revisiones de calidad programadas.', level: 2 },
        { id: 'c2_36', text: 'Considero que los códigos éticos son documentos teóricos poco aplicables.', level: 1 }
      ]
    },
    {
      blockNumber: 10,
      behaviors: [
        { id: 'c2_37', text: 'Soy un referente de integridad y conducta ejemplar para mi equipo de trabajo.', level: 4 },
        { id: 'c2_38', text: 'Trato a todas las personas con dignidad sin distinción de jerarquía o cargo.', level: 3 },
        { id: 'c2_39', text: 'Mantengo un trato adecuado con quienes tienen poder de decisión en el área.', level: 2 },
        { id: 'c2_40', text: 'Ajusto mi nivel de respeto según la conveniencia de mi relación con cada colega.', level: 1 }
      ]
    }
  ],

  // 3. TEMPLE Y SERENIDAD
  'Temple y Serenidad': [
    {
      blockNumber: 1,
      behaviors: [
        { id: 'c3_1', text: 'Conservo la calma y el juicio objetivo en situaciones de alta presión o crisis.', level: 4 },
        { id: 'c3_2', text: 'Respiro y pienso con detenimiento antes de responder en discusiones acaloradas.', level: 3 },
        { id: 'c3_3', text: 'Procuro no demostrar nerviosismo aunque por dentro me sienta abrumado.', level: 2 },
        { id: 'c3_4', text: 'Suelo perder la paciencia cuando las cosas no salen como estaban planificadas.', level: 1 }
      ]
    },
    {
      blockNumber: 2,
      behaviors: [
        { id: 'c3_5', text: 'Transmito tranquilidad y seguridad al equipo cuando enfrentamos contingencias imprevistas.', level: 4 },
        { id: 'c3_6', text: 'Enfoco mi energía en buscar soluciones prácticas en lugar de quejarme del problema.', level: 3 },
        { id: 'c3_7', text: 'Espero a que el ambiente se calme por sí solo antes de continuar trabajando.', level: 2 },
        { id: 'c3_8', text: 'Me contagio con facilidad del estrés o preocupación de las personas a mi alrededor.', level: 1 }
      ]
    },
    {
      blockNumber: 3,
      behaviors: [
        { id: 'c3_9', text: 'Tomo decisiones ponderadas y acertadas aun bajo límites estrictos de tiempo.', level: 4 },
        { id: 'c3_10', text: 'Priorizo las tareas urgentes sin descuidar la calidad del resultado final.', level: 3 },
        { id: 'c3_11', text: 'Ejecuto las órdenes que me dan con rapidez para salir del paso.', level: 2 },
        { id: 'c3_12', text: 'Me bloqueo momentáneamente cuando recibo múltiples requerimientos simultáneos.', level: 1 }
      ]
    },
    {
      blockNumber: 4,
      behaviors: [
        { id: 'c3_13', text: 'Recibo críticas o feedback exigente de manera constructiva y con madurez emocional.', level: 4 },
        { id: 'c3_14', text: 'Agradezco las observaciones y reflexiono sobre qué aspectos debo perfeccionar.', level: 3 },
        { id: 'c3_15', text: 'Escucho las críticas sin intervenir para evitar una discusión prolongada.', level: 2 },
        { id: 'c3_16', text: 'Tiendo a tomar los comentarios negativos como ataques personales hacia mi trabajo.', level: 1 }
      ]
    },
    {
      blockNumber: 5,
      behaviors: [
        { id: 'c3_17', text: 'Desactivo con tacto y serenidad la agresividad de clientes o compañeros exaltados.', level: 4 },
        { id: 'c3_18', text: 'Mantengo un volumen de voz modulado y firme ante reclamos desmedidos.', level: 3 },
        { id: 'c3_19', text: 'Dejo que la otra persona hable sin interrumpir hasta que agote sus argumentos.', level: 2 },
        { id: 'c3_20', text: 'Elevo el tono de voz si percibo que la otra persona me está faltando el respeto.', level: 1 }
      ]
    },
    {
      blockNumber: 6,
      behaviors: [
        { id: 'c3_21', text: 'Gestiono mi nivel de energía diaria para evitar el desgaste mental y el agotamiento.', level: 4 },
        { id: 'c3_22', text: 'Hago pausas activas conscientes para retomar el foco en momentos intensos.', level: 3 },
        { id: 'c3_23', text: 'Continúo trabajando sin parar aunque sienta fatiga mental acumulada.', level: 2 },
        { id: 'c3_24', text: 'Llego al final de la jornada sintiéndome agotado e irritable con frecuencia.', level: 1 }
      ]
    },
    {
      blockNumber: 7,
      behaviors: [
        { id: 'c3_25', text: 'Afronto la incertidumbre y los cambios de último minuto con soltura y adaptabilidad.', level: 4 },
        { id: 'c3_26', text: 'Reorganizo mi plan de trabajo con prontitud ante un cambio de directiva.', level: 3 },
        { id: 'c3_27', text: 'Me adapto al cambio pero expreso mi disconformidad por la falta de previsión.', level: 2 },
        { id: 'c3_28', text: 'Me cuesta aceptar los cambios repentinos que desordenan mi esquema previsto.', level: 1 }
      ]
    },
    {
      blockNumber: 8,
      behaviors: [
        { id: 'c3_29', text: 'Separo con nitidez mis emociones del análisis lógico que exige el problema.', level: 4 },
        { id: 'c3_30', text: 'Evito tomar decisiones importantes en momentos de enojo o euforia excesiva.', level: 3 },
        { id: 'c3_31', text: 'Dejo pasar unas horas antes de responder a un correo que me generó molestia.', level: 2 },
        { id: 'c3_32', text: 'Reacciono de inmediato por impulso cuando algo me parece injusto o incorrecto.', level: 1 }
      ]
    },
    {
      blockNumber: 9,
      behaviors: [
        { id: 'c3_33', text: 'Soy un ancla de equilibrio que propicia un clima armónico en el entorno de trabajo.', level: 4 },
        { id: 'c3_34', text: 'Ayudo a disipar tensiones en el equipo proponiendo un enfoque constructivo.', level: 3 },
        { id: 'c3_35', text: 'Me mantengo al margen de los roces interpersonales de mis compañeros.', level: 2 },
        { id: 'c3_36', text: 'Comento los desacuerdos internos con otros compañeros aumentando la tensión.', level: 1 }
      ]
    },
    {
      blockNumber: 10,
      behaviors: [
        { id: 'c3_37', text: 'Mantengo mi rendimiento y concentración óptimos durante picos extremos de demanda.', level: 4 },
        { id: 'c3_38', text: 'Conservo el orden y la rigurosidad en mis tareas bajo presión de entrega.', level: 3 },
        { id: 'c3_39', text: 'Acelero el ritmo aunque cometa pequeñas imprecisiones que corregiré después.', level: 2 },
        { id: 'c3_40', text: 'La prisa constante me hace olvidar pasos esenciales del procedimiento.', level: 1 }
      ]
    }
  ],

  // 4. ORIENTACIÓN Y ADAPTABILIDAD A LAS VENTAS
  'Orientación y adaptabilidad a las ventas': [
    {
      blockNumber: 1,
      behaviors: [
        { id: 'c4_1', text: 'Descubro motivaciones profundas del cliente para conectarlas con el valor del producto.', level: 4 },
        { id: 'c4_2', text: 'Explico con elocuencia y dinamismo los beneficios que ofrece la propuesta comercial.', level: 3 },
        { id: 'c4_3', text: 'Menciono la lista de características y precios establecida en la ficha comercial.', level: 2 },
        { id: 'c4_4', text: 'Espero a que el cliente muestre interés explícito antes de ofrecer un producto.', level: 1 }
      ]
    },
    {
      blockNumber: 2,
      behaviors: [
        { id: 'c4_5', text: 'Manejo objeciones con agilidad mental, convirtiendo las dudas en argumentos de cierre.', level: 4 },
        { id: 'c4_6', text: 'Acepto la duda del cliente y le ofrezco alternativas de financiamiento o planes.', level: 3 },
        { id: 'c4_7', text: 'Reitero la misma oferta si el cliente dice que el precio es elevado.', level: 2 },
        { id: 'c4_8', text: 'Doy por perdida la venta si el cliente manifiesta una objeción contundente.', level: 1 }
      ]
    },
    {
      blockNumber: 3,
      behaviors: [
        { id: 'c4_9', text: 'Adapto mi estilo comunicativo al perfil de cada cliente (analítico, directo, afectivo).', level: 4 },
        { id: 'c4_10', text: 'Utilizo un lenguaje cercano y persuasivo que genera confianza comercial.', level: 3 },
        { id: 'c4_11', text: 'Uso el mismo discurso de ventas para todos los clientes para ser equitativo.', level: 2 },
        { id: 'c4_12', text: 'Me cuesta adaptar mi conversación a personalidades muy distintas a la mía.', level: 1 }
      ]
    },
    {
      blockNumber: 4,
      behaviors: [
        { id: 'c4_13', text: 'Veo cada rechazo como un aprendizaje y mantengo mi energía de prospección intacta.', level: 4 },
        { id: 'c4_14', text: 'Continuo con la siguiente llamada o contacto con entusiasmo y disciplina.', level: 3 },
        { id: 'c4_15', text: 'Tomo un respiro tras varias negativas consecutivas para recuperar el ritmo.', level: 2 },
        { id: 'c4_16', text: 'Me desmotivo con rapidez cuando los primeros clientes del día rechazan la oferta.', level: 1 }
      ]
    },
    {
      blockNumber: 5,
      behaviors: [
        { id: 'c4_17', text: 'Detecto el momento oportuno para solicitar el compromiso y concretar el cierre de venta.', level: 4 },
        { id: 'c4_18', text: 'Propongo activamente los siguientes pasos para avanzar hacia la contratación.', level: 3 },
        { id: 'c4_19', text: 'Dejo que el cliente tome su tiempo para decidir sin presionarlo en absoluto.', level: 2 },
        { id: 'c4_20', text: 'Temo insistir demasiado por miedo a que el cliente se sienta incómodo.', level: 1 }
      ]
    },
    {
      blockNumber: 6,
      behaviors: [
        { id: 'c4_21', text: 'Supero con consistencia las metas comerciales buscando siempre el máximo resultado.', level: 4 },
        { id: 'c4_22', text: 'Cumplo con rigurosidad la cuota mensual asignada para mi posición.', level: 3 },
        { id: 'c4_23', text: 'Me conformo con alcanzar el mínimo exigido para evitar sobrecargas futuras.', level: 2 },
        { id: 'c4_24', text: 'Considero que las cuotas comerciales del área suelen ser poco realistas.', level: 1 }
      ]
    },
    {
      blockNumber: 7,
      behaviors: [
        { id: 'c4_25', text: 'Identifico oportunidades de cross-selling y up-selling que benefician al cliente.', level: 4 },
        { id: 'c4_26', text: 'Ofrezco servicios complementarios pertinentes durante la asesoría de venta.', level: 3 },
        { id: 'c4_27', text: 'Me enfoco únicamente en el producto básico por el que vino a consultar el cliente.', level: 2 },
        { id: 'c4_28', text: 'Evito sugerir productos adicionales para no complicar el trámite en curso.', level: 1 }
      ]
    },
    {
      blockNumber: 8,
      behaviors: [
        { id: 'c4_29', text: 'Construyo relaciones duraderas que generan recompras y recomendaciones constantes.', level: 4 },
        { id: 'c4_30', text: 'Envío mensajes de agradecimiento y seguimiento tras concretar cada venta.', level: 3 },
        { id: 'c4_31', text: 'Dejo el seguimiento en manos del equipo de post-venta asignado.', level: 2 },
        { id: 'c4_32', text: 'Me desvinculo por completo del cliente una vez cobrada la comisión.', level: 1 }
      ]
    },
    {
      blockNumber: 9,
      behaviors: [
        { id: 'c4_33', text: 'Analizo mis métricas de conversión comercial semanal para corregir desviaciones.', level: 4 },
        { id: 'c4_34', text: 'Registro todas las gestiones comerciales en el CRM de manera ordenada.', level: 3 },
        { id: 'c4_35', text: 'Actualizo el CRM al final de la semana cuando tengo tiempo libre.', level: 2 },
        { id: 'c4_36', text: 'Considero que la gestión de sistemas comerciales me quita tiempo de vender.', level: 1 }
      ]
    },
    {
      blockNumber: 10,
      behaviors: [
        { id: 'c4_37', text: 'Comparto con entusiasmo técnicas y tácticas de venta exitosas con mis compañeros.', level: 4 },
        { id: 'c4_38', text: 'Apoyo a los nuevos integrantes del equipo para que alcancen su primera venta.', level: 3 },
        { id: 'c4_39', text: 'Me enfoco en mi propia cartera sin intervenir en las gestiones de otros.', level: 2 },
        { id: 'c4_40', text: 'Guardo mis mejores técnicas en reserva para mantener mi ventaja individual.', level: 1 }
      ]
    }
  ],

  // 5. COMUNICACIÓN EFECTIVA
  'Comunicación efectiva': [
    {
      blockNumber: 1,
      behaviors: [
        { id: 'c5_1', text: 'Transmito ideas complejas con sencillez, estructura clara y alto impacto persuasivo.', level: 4 },
        { id: 'c5_2', text: 'Me expreso con corrección, fluidez y coherencia en mis intervenciones orales.', level: 3 },
        { id: 'c5_3', text: 'Doy explicaciones detalladas aunque a veces me extienda más de lo debido.', level: 2 },
        { id: 'c5_4', text: 'Asumo que los demás deben interpretar mis intenciones sin tantas explicaciones.', level: 1 }
      ]
    },
    {
      blockNumber: 2,
      behaviors: [
        { id: 'c5_5', text: 'Practico escucha activa plena, captando el fondo y las emociones de mi interlocutor.', level: 4 },
        { id: 'c5_6', text: 'Espero a que la otra persona termine de hablar antes de emitir mi respuesta.', level: 3 },
        { id: 'c5_7', text: 'Preparo mentalmente mi réplica mientras el otro compañero está exponiendo.', level: 2 },
        { id: 'c5_8', text: 'Interrumpo con frecuencia cuando considero que el argumento del otro es erróneo.', level: 1 }
      ]
    },
    {
      blockNumber: 3,
      behaviors: [
        { id: 'c5_9', text: 'Aseguro la comprensión mutua reformulando los acuerdos clave de la reunión.', level: 4 },
        { id: 'c5_10', text: 'Pregunto si existen dudas o consultas antes de finalizar la conversación.', level: 3 },
        { id: 'c5_11', text: 'Doy por sentada la comprensión si los participantes asienten con la cabeza.', level: 2 },
        { id: 'c5_12', text: 'Considero innecesario recapitular lo conversado si todos estaban presentes.', level: 1 }
      ]
    },
    {
      blockNumber: 4,
      behaviors: [
        { id: 'c5_13', text: 'Redacto correos y mensajes ejecutivos con brevedad, orden impecable y calidez.', level: 4 },
        { id: 'c5_14', text: 'Reviso la ortografía y redacción de mis textos antes de enviar un comunicado.', level: 3 },
        { id: 'c5_15', text: 'Escribo rápido sin preocuparme tanto por el estilo formal o la puntuación.', level: 2 },
        { id: 'c5_16', text: 'Envío correos extensos y desordenados confiando en que el lector los descifre.', level: 1 }
      ]
    },
    {
      blockNumber: 5,
      behaviors: [
        { id: 'c5_17', text: 'Brindo retroalimentación oportuna, constructiva y orientada al desarrollo humano.', level: 4 },
        { id: 'c5_18', text: 'Señalo los puntos de mejora enfocándome en hechos y conductas objetivas.', level: 3 },
        { id: 'c5_19', text: 'Prefiero callar los desacuerdos para no dañar la relación con el compañero.', level: 2 },
        { id: 'c5_20', text: 'Critico abiertamente a los demás cuando cometen errores evidentes en el turno.', level: 1 }
      ]
    },
    {
      blockNumber: 6,
      behaviors: [
        { id: 'c5_21', text: 'Mantengo congruencia total entre mi comunicación verbal y mi lenguaje corporal.', level: 4 },
        { id: 'c5_22', text: 'Acompaño mis palabras con gestos amables, contacto visual y postura abierta.', level: 3 },
        { id: 'c5_23', text: 'Me concentro en lo que digo sin prestar atención a mis gestos o postura física.', level: 2 },
        { id: 'c5_24', text: 'Muestro desinterés físico cuando la conversación no se relaciona conmigo.', level: 1 }
      ]
    },
    {
      blockNumber: 7,
      behaviors: [
        { id: 'c5_25', text: 'Facilito consensos y diálogo productivo entre posturas opuestas en el equipo.', level: 4 },
        { id: 'c5_26', text: 'Busco puntos en común para acercar las diferencias de criterio en el área.', level: 3 },
        { id: 'c5_27', text: 'Voto por la mayoría sin comprometerme en mediar entre las partes.', level: 2 },
        { id: 'c5_28', text: 'Defiendo mi posición de manera inflexible hasta convencer a los oponentes.', level: 1 }
      ]
    },
    {
      blockNumber: 8,
      behaviors: [
        { id: 'c5_29', text: 'Adapto el mensaje a distintas audiencias (directivos, clientes, personal operativo).', level: 4 },
        { id: 'c5_30', text: 'Ajusto el grado de tecnicismo según el nivel de conocimiento del receptor.', level: 3 },
        { id: 'c5_31', text: 'Uso un lenguaje homogéneo estándar en todas mis reuniones de trabajo.', level: 2 },
        { id: 'c5_32', text: 'Uso términos técnicos rebuscados para proyectar mayor estatus profesional.', level: 1 }
      ]
    },
    {
      blockNumber: 9,
      behaviors: [
        { id: 'c5_33', text: 'Comunico malas noticias o contingencias con asertividad, tacto y propuestas de solución.', level: 4 },
        { id: 'c5_34', text: 'Informo con prontitud las dificultades para que se tomen previsiones colectivas.', level: 3 },
        { id: 'c5_35', text: 'Postergo la comunicación de malas noticias hasta que la solución esté lista.', level: 2 },
        { id: 'c5_36', text: 'Oculto incidentes operativos menores esperando que pasen desapercibidos.', level: 1 }
      ]
    },
    {
      blockNumber: 10,
      behaviors: [
        { id: 'c5_37', text: 'Fomento una comunicación bidireccional, abierta y transparente en toda la organización.', level: 4 },
        { id: 'c5_38', text: 'Agradezco sinceramente las sugerencias y aportes que recibo de mis compañeros.', level: 3 },
        { id: 'c5_39', text: 'Escucho sugerencias aunque rara vez decida implementarlas en mi día a día.', level: 2 },
        { id: 'c5_40', text: 'Me incomoda que otros opinen sobre mi forma de desempeñar mis labores.', level: 1 }
      ]
    }
  ]
};

// Generador inteligente de bloques conductuales adaptados para cualquier competencia del catálogo
export function getCompetencyTestBlocks(competencyName: string, blockCount: number = 10): CompetencyTestBlock[] {
  const cleanName = competencyName.trim();

  // 1. Si existe configuración especializada exacta
  if (TAILORED_COMPETENCY_BLOCKS[cleanName]) {
    return TAILORED_COMPETENCY_BLOCKS[cleanName].slice(0, blockCount);
  }

  // 2. Coincidencia parcial con las competencias maestras
  const lower = cleanName.toLowerCase();
  for (const key of Object.keys(TAILORED_COMPETENCY_BLOCKS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return TAILORED_COMPETENCY_BLOCKS[key].slice(0, blockCount);
    }
  }

  // 3. Generación adaptada algorítmica específica para la competencia solicitada
  const genericDomains = [
    { area: 'Eficacia y Proactividad', actionL4: 'Demuestro iniciativa sobresaliente y visión anticipatoria en', actionL3: 'Ejecuto con constancia y esmero las tareas asociadas a', actionL2: 'Cumplo lo indispensable en lo relativo a', actionL1: 'Espero instrucciones precisas antes de actuar en' },
    { area: 'Relaciones y Colaboración', actionL4: 'Inspiro y fortalezco activamente la sinergia colectiva aplicando', actionL3: 'Promuevo el buen trato y el diálogo fluido manteniendo', actionL2: 'Me limito a coordinar formalmente los aspectos de', actionL1: 'Prefiero trabajar de forma aislada sin comprometerme en' },
    { area: 'Criterio y Toma de Decisiones', actionL4: 'Evalúo riesgos y elijo el mejor camino con criterio ético en', actionL3: 'Tomo decisiones ponderadas basadas en datos reales para', actionL2: 'Consulto a mi líder antes de resolver cualquier detalle de', actionL1: 'Decido con apresuramiento sin calibrar el impacto de' },
    { area: 'Resiliencia y Presión', actionL4: 'Conservo el temple y el equilibrio aun en momentos críticos de', actionL3: 'Mantengo el ritmo y la concentración ante exigencias de', actionL2: 'Me siento temporalmente tensionado ante los desafíos de', actionL1: 'Me desmotivo con rapidez cuando surgen obstáculos en' },
    { area: 'Calidad y Excelencia', actionL4: 'Perfecciono permanentemente los estándares más altos en', actionL3: 'Reviso con detenimiento mis entregables para garantizar', actionL2: 'Entrego lo justo dentro del estándar promedio de', actionL1: 'Doy por bueno el resultado sin verificar a fondo' },
    { area: 'Adaptabilidad y Cambio', actionL4: 'Asimilo con entusiasmo y lidero la transformación en', actionL3: 'Me ajusto con flexibilidad a los nuevos esquemas de', actionL2: 'Acepto el cambio con cautela y cierto recelo en', actionL1: 'Opongo resistencia a modificar mis hábitos de' },
    { area: 'Orientación a Resultados', actionL4: 'Supero con holgura los objetivos cuantitativos y cualitativos de', actionL3: 'Alcanzo las metas propuestas en los plazos fijados para', actionL2: 'Cumplo con lo justo para evitar llamadas de atención en', actionL1: 'Justifico el incumplimiento atribuyéndolo a factores de' },
    { area: 'Ética y Transparencia', actionL4: 'Soy un referente inquebrantable de honestidad y rectitud en', actionL3: 'Actúo con lealtad y veracidad en todas las gestiones de', actionL2: 'Sigo las normas formales mientras haya supervisión en', actionL1: 'Busco atajos informales que reduzcan mi esfuerzo en' },
    { area: 'Liderazgo e Influencia', actionL4: 'Movilizo y empodero a mis compañeros transmitiendo pasión por', actionL3: 'Guío con empatía y apertura a los demás reforzando', actionL2: 'Cumplo mi rol sin involucrarme en el desempeño de otros en', actionL1: 'Impongo mis puntos de vista sin escuchar alternativas en' },
    { area: 'Innovación y Mejora Continua', actionL4: 'Diseño soluciones creativas y transformadoras que enriquecen', actionL3: 'Aporto sugerencias útiles y constructivas para optimizar', actionL2: 'Aplico los métodos conocidos sin proponer innovaciones en', actionL1: 'Considero innecesario alterar los procesos habituales de' }
  ];

  return Array.from({ length: blockCount }, (_, i) => {
    const domain = genericDomains[i % genericDomains.length];
    const bId = `gen_${i + 1}`;
    // Barajamos levemente el orden para evitar patrones fijos en pantalla
    const statements: CompetencyBehaviorStatement[] = [
      { id: `${bId}_4`, text: `${domain.actionL4} ${cleanName.toLowerCase()}.`, level: 4 },
      { id: `${bId}_3`, text: `${domain.actionL3} ${cleanName.toLowerCase()}.`, level: 3 },
      { id: `${bId}_2`, text: `${domain.actionL2} ${cleanName.toLowerCase()}.`, level: 2 },
      { id: `${bId}_1`, text: `${domain.actionL1} ${cleanName.toLowerCase()}.`, level: 1 }
    ];

    return {
      blockNumber: i + 1,
      behaviors: statements
    };
  });
}
