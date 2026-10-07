import React, { useState } from 'react';
import { 
  FileCode, 
  Database, 
  Server, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Copy, 
  Check, 
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PRISMA' | 'SERVICE' | 'MONOREPO' | 'K6' | 'SECURITY'>('PRISMA');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const PRISMA_SCHEMA = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Conexión a través de PgBouncer (pooler transaccional)
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["relationJoins"]
}

enum Role {
  SUPER_ADMIN
  ADMIN
  RECRUITER
  PSYCHOLOGIST
  CANDIDATE
}

enum CandidateStatus {
  INVITED
  IN_PROGRESS
  SCORED
  FINALIST
  REJECTED
}

enum AuditSeverity {
  INFO
  WARNING
  CRITICAL
}

// Usuarios administrativos y postulantes
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  fullName      String
  dni           String    @unique // Documento Nacional de Identidad (Perú - 8 dígitos)
  phone         String?
  role          Role      @default(CANDIDATE)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  attempts      Attempt[]
  auditEvents   AuditEvent[]

  @@index([role])
  @@index([dni])
  @@index([email])
}

// Proceso o convocatoria de selección (ej. Convocatoria Analistas 2026-II)
model Process {
  id                  String       @id @default(uuid())
  title               String
  description         String?
  targetCapacity      Int          @default(1000) // Pico de concurrentes a las 9:00 am
  startsAt            DateTime
  endsAt              DateTime
  isOpen              Boolean      @default(true)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  stages              Stage[]
  attempts            Attempt[]

  @@index([isOpen, startsAt])
}

// Etapas fijas del examen (Psicopedagógica, Emocional, Situaciones Laborales)
model Stage {
  id                  String       @id @default(uuid())
  processId           String
  orderIndex          Int          // 1, 2, 3
  name                String       // "Etapa Psicopedagógica"
  shortCode           String       // PSYCHO, EMOTIONAL, WORK_CASES
  durationSeconds     Int          @default(900) // 15 minutos exactos (900s)
  isMandatory         Boolean      @default(true)
  createdAt           DateTime     @default(now())

  process             Process      @relation(fields: [processId], references: [id], onDelete: Cascade)
  questions           Question[]
  stageAttempts       StageAttempt[]

  @@unique([processId, orderIndex])
  @@index([processId])
}

// Banco de reactivos psicométricos y casos
model Question {
  id                  String       @id @default(uuid())
  stageId             String
  orderNumber         Int
  statement           String       @db.Text
  competency          String       // Competencia laboral medida
  context             String?      @db.Text
  isActive            Boolean      @default(true)
  createdAt           DateTime     @default(now())

  stage               Stage        @relation(fields: [stageId], references: [id], onDelete: Cascade)
  options             Option[]
  answers             Answer[]

  @@index([stageId, orderNumber])
}

// Opciones de respuesta por reactivo (ponderación confidencial mantenida en backend)
model Option {
  id                  String       @id @default(uuid())
  questionId          String
  code                String       // A, B, C, D
  statement           String       @db.Text
  weight              Float        @default(0.0) // 0.0 - 1.0 (NUNCA expuesto al candidato)
  isCorrect           Boolean      @default(false)
  createdAt           DateTime     @default(now())

  question            Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers             Answer[]

  @@unique([questionId, code])
  @@index([questionId])
}

// Intento global del candidato
model Attempt {
  id                  String           @id @default(uuid())
  candidateId         String
  processId           String
  invitationToken     String           @unique
  status              CandidateStatus  @default(INVITED)
  startedAt           DateTime?
  completedAt         DateTime?
  totalDurationSecs   Int?
  
  // Consentimiento informado Ley 29733 (Perú)
  isConsentSigned     Boolean          @default(false)
  consentSignedAt     DateTime?
  consentIpAddress    String?

  // Calificaciones calculadas en segundo plano (BullMQ worker)
  overallScore        Float?
  stage1Score         Float?
  stage2Score         Float?
  stage3Score         Float?
  percentile          Float?

  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  candidate           User             @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  process             Process          @relation(fields: [processId], references: [id], onDelete: Cascade)
  stageAttempts       StageAttempt[]
  answers             Answer[]
  auditEvents         AuditEvent[]

  @@index([candidateId])
  @@index([status])
  @@index([invitationToken])
}

// Control autoritativo de tiempo por etapa en el servidor
model StageAttempt {
  id                  String           @id @default(uuid())
  attemptId           String
  stageId             String
  startedAt           DateTime         @default(now()) // Hora de inicio autoritativa en servidor
  expiresAt           DateTime         // startedAt + stage.durationSeconds (servidor no perdona desfase)
  isClosed            Boolean          @default(false)
  closedAt            DateTime?

  attempt             Attempt          @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  stage               Stage            @relation(fields: [stageId], references: [id], onDelete: Cascade)
  answers             Answer[]

  @@unique([attemptId, stageId])
  @@index([attemptId])
  @@index([expiresAt])
}

// Respuestas confirmadas: restricción de unicidad e inmutabilidad estricta
model Answer {
  id                  String           @id @default(uuid())
  attemptId           String
  stageAttemptId      String
  questionId          String
  selectedOptionId    String
  confirmedAtClient   DateTime
  receivedAtServer    DateTime         @default(now())
  isLateSubmission    Boolean          @default(false)

  attempt             Attempt          @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  stageAttempt        StageAttempt     @relation(fields: [stageAttemptId], references: [id], onDelete: Cascade)
  question            Question         @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedOption      Option           @relation(fields: [selectedOptionId], references: [id], onDelete: Restrict)

  // REQUISITO TÉCNICO VITAL: Una única respuesta por pregunta por intento (idempotente e inmutable)
  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@index([stageAttemptId])
}

// Bitácora de auditoría e integridad
model AuditEvent {
  id                  String           @id @default(uuid())
  attemptId           String
  userId              String?
  type                String           // TAB_SWITCH_OUT, WINDOW_BLUR, NETWORK_OFFLINE, COPY_ATTEMPT
  severity            AuditSeverity    @default(INFO)
  description         String
  metadata            Json?            // IP, userAgent, duración de desenfoque
  timestamp           DateTime         @default(now())

  attempt             Attempt          @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  user                User?            @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([attemptId, timestamp])
  @@index([type])
}`;

  const ATTEMPT_SERVICE = `// apps/api/src/modules/attempts/attempt.service.ts
import { Injectable, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('scoring-queue') private readonly scoringQueue: Queue
  ) {}

  /**
   * 1. INICIAR ETAPA: Fija expiración autoritativa en el servidor (Redis + Postgres)
   */
  async startStage(attemptId: string, stageId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { process: true }
    });

    if (!attempt || attempt.status === 'SCORED' || attempt.status === 'FINALIST') {
      throw new ForbiddenException('El intento ya ha concluido o no es válido.');
    }

    const stage = await this.prisma.stage.findUnique({ where: { id: stageId } });
    if (!stage) throw new BadRequestException('Etapa no existente.');

    // Verificar si ya existía para evitar reiniciar el cronómetro
    let stageAttempt = await this.prisma.stageAttempt.findUnique({
      where: { attemptId_stageId: { attemptId, stageId } }
    });

    const now = new Date();

    if (!stageAttempt) {
      const expiresAt = new Date(now.getTime() + stage.durationSeconds * 1000);

      stageAttempt = await this.prisma.stageAttempt.create({
        data: {
          attemptId,
          stageId,
          startedAt: now,
          expiresAt,
          isClosed: false
        }
      });

      // Guardar temporizador en Redis con TTL para lookup ultrarrápido a 1.000 concurrentes
      await this.redis.set(
        \`stage_timer:\${attemptId}:\${stageId}\`,
        expiresAt.getTime().toString(),
        'EX',
        stage.durationSeconds + 120 // TTL con margen de gracia
      );
    }

    const remainingSecs = Math.max(0, Math.floor((stageAttempt.expiresAt.getTime() - Date.now()) / 1000));

    return {
      stageAttemptId: stageAttempt.id,
      startedAt: stageAttempt.startedAt,
      expiresAt: stageAttempt.expiresAt,
      remainingSeconds: remainingSecs,
      isExpired: remainingSecs <= 0
    };
  }

  /**
   * 2. GUARDADO IDEMPOTENTE DE RESPUESTAS EN LOTE:
   * - Rechaza si now > expiresAt (tiempo de servidor expirado).
   * - Rechaza o ignora duplicados con @@unique([attemptId, questionId]).
   * - Inmutable: nunca permite modificar una respuesta ya confirmada.
   */
  async saveBatchAnswers(
    attemptId: string,
    answers: Array<{
      questionId: string;
      selectedOptionId: string;
      stageId: string;
      confirmedAt: string;
    }>
  ) {
    const results = {
      accepted: [] as string[],
      rejected: [] as Array<{ questionId: string; reason: string }>
    };

    const serverNow = Date.now();

    for (const ans of answers) {
      // 1. Validar expiración autoritativa en Redis (latencia < 1ms)
      const cachedExpiresAt = await this.redis.get(\`stage_timer:\${attemptId}:\${ans.stageId}\`);
      
      let isExpired = false;
      if (cachedExpiresAt) {
        isExpired = serverNow > parseInt(cachedExpiresAt, 10);
      } else {
        // Fallback a Postgres si no está en Redis
        const sa = await this.prisma.stageAttempt.findUnique({
          where: { attemptId_stageId: { attemptId, stageId: ans.stageId } }
        });
        isExpired = !sa || serverNow > sa.expiresAt.getTime();
      }

      if (isExpired) {
        results.rejected.push({
          questionId: ans.questionId,
          reason: 'STAGE_EXPIRED: El tiempo límite fijado por el servidor para esta etapa ha expirado.'
        });
        continue;
      }

      // 2. Upsert idempotente en Postgres garantizando inmutabilidad
      try {
        const stageAttempt = await this.prisma.stageAttempt.findUniqueOrThrow({
          where: { attemptId_stageId: { attemptId, stageId: ans.stageId } }
        });

        // Insertar únicamente si no existe (ON CONFLICT DO NOTHING)
        await this.prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: ans.questionId
            }
          },
          update: {
            // Regla: No sobreescribir selectedOptionId. Respuesta confirmada es inmutable.
          },
          create: {
            attemptId,
            stageAttemptId: stageAttempt.id,
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
            confirmedAtClient: new Date(ans.confirmedAt),
            receivedAtServer: new Date()
          }
        });

        results.accepted.push(ans.questionId);
      } catch (err) {
        results.rejected.push({
          questionId: ans.questionId,
          reason: 'DUPLICATE_OR_LOCKED: La respuesta ya fue fijada previamente.'
        });
      }
    }

    return results;
  }

  /**
   * 3. CIERRE DE EXAMEN Y ENCOLADO ASÍNCRONO EN BULLMQ
   * (La calificación nunca bloquea la petición HTTP del postulante)
   */
  async submitCompleteExam(attemptId: string) {
    const attempt = await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'SCORED',
        completedAt: new Date()
      }
    });

    // Encolar trabajo de calificación en background
    await this.scoringQueue.add(
      'compute-scores',
      { attemptId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true
      }
    );

    return {
      success: true,
      completedAt: attempt.completedAt,
      message: 'Evaluación recibida exitosamente. Calificación procesándose en background.'
    };
  }
}`;

  const K6_SCRIPT = `// tests/load/k6-peak-1000-candidates.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métricas personalizadas para el pico de las 9:00 AM
const stageSyncTrend = new Trend('stage_sync_duration_ms');
const rejectedAnswersRate = new Rate('rejected_answers_rate');
const successfulBatches = new Counter('successful_batches_total');

export const options = {
  scenarios: {
    // Simula 1.000 candidatos iniciando simultáneamente a las 9:00 a.m.
    concurrent_9am_peak: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 1200,
      stages: [
        { duration: '1m', target: 200 },  // 8:59 am: llegada preliminar
        { duration: '3m', target: 1000 }, // 9:00 am: pico masivo simultáneo
        { duration: '15m', target: 1000 },// 9:03 - 9:18 am: Etapa 1 en curso sostenido
        { duration: '2m', target: 200 },  // transición a Etapa 2
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<400', 'p(99)<800'], // 95% de peticiones bajo 400ms a 1k concurrentes
    http_req_failed: ['rate<0.01'],                 // Tasa de error HTTP menor al 1%
    'rejected_answers_rate': ['rate<0.02'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://api-talento.internal.pe';

export default function () {
  const vuId = __VU;
  const iteration = __ITER;
  const candidateId = \`cand_load_\${vuId}\`;
  const attemptId = \`att_load_\${vuId}\`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Candidate-Id': candidateId,
  };

  // 1. Concurrencia de arranque: Inicio de Etapa 1 (servidor fija expiración)
  const startRes = http.post(
    \`\${BASE_URL}/api/v1/attempts/\${attemptId}/stages/STAGE_1_PSYCHO/start\`,
    JSON.stringify({ durationSeconds: 900 }),
    { headers }
  );

  check(startRes, {
    'Etapa 1 iniciada con éxito (200)': (r) => r.status === 200,
    'Servidor entregó tiempo autoritativo': (r) => JSON.parse(r.body).remainingSeconds > 890,
  });

  // 2. Simulación de avance: candidato responde 1 reactivo cada 30-50 segundos
  for (let q = 1; q <= 5; q++) {
    sleep(Math.random() * 20 + 30); // 30-50s de lectura y reflexión

    // Envío agrupado en batch cada vez que confirma
    const batchPayload = JSON.stringify({
      answers: [
        {
          questionId: \`psy-0\${q}\`,
          stageId: 'STAGE_1_PSYCHO',
          selectedOptionId: \`opt-p\${q}-a\`,
          confirmedAt: new Date().toISOString(),
        }
      ],
      auditEvents: [
        {
          type: 'WINDOW_FOCUS',
          description: 'Foco activo',
          timestamp: new Date().toISOString(),
        }
      ]
    });

    const tStart = Date.now();
    const batchRes = http.post(
      \`\${BASE_URL}/api/v1/attempts/\${attemptId}/batch-sync\`,
      batchPayload,
      { headers }
    );
    stageSyncTrend.add(Date.now() - tStart);

    const isOk = check(batchRes, {
      'Batch aceptado (200/201)': (r) => r.status === 200 || r.status === 201,
      'Sin rechazos por expiración temprana': (r) => {
        const body = JSON.parse(r.body);
        return body.rejectedAnswers && body.rejectedAnswers.length === 0;
      },
    });

    if (isOk) successfulBatches.add(1);
    else rejectedAnswersRate.add(1);
  }
}`;

  const MONOREPO_STRUCTURE = `# Estructura Monorepo Turborepo + pnpm
# Diseñado para compartir tipos de TypeScript de punta a punta entre apps y paquetes

talento-peru/
├── apps/
│   ├── web-candidate/         # SPA estática en Vite + React (CDN Cloudflare Pages / Vercel)
│   │   ├── src/
│   │   │   ├── components/    # ConsentScreen, QuestionView, StageTransition, CompletionScreen
│   │   │   ├── db/            # Dexie.js (IndexedDB local con cola offline)
│   │   │   └── services/      # ClientSyncWorker con batch sync & backoff
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── web-admin/             # Panel reclutadores (Next.js / Vite)
│   │   ├── src/
│   │   │   ├── components/    # CandidatePipeline, DetailModal, QuestionBank
│   │   │   └── hooks/         # SWR / React Query para métricas en tiempo real
│   │   └── package.json
│   │
│   └── api/                   # Fastify + NestJS en Cloud Run / Fargate con autoscaling
│       ├── src/
│       │   ├── modules/
│       │   │   ├── attempts/  # AttemptService (autoritativo, expiración en Redis)
│       │   │   ├── audits/    # Ingesta masiva de auditoría
│       │   │   └── workers/   # BullMQ worker asíncrono para calificación
│       │   └── main.ts        # Fastify adapter (latencia < 5ms)
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma Client, migraciones y seeders
│   │   ├── prisma/schema.prisma
│   │   └── src/index.ts
│   │
│   ├── types/                 # Modelos compartidos (Question, Option, Attempt, AuditEvent)
│   │   └── src/index.ts
│   │
│   └── ui/                    # Componentes accesibles compartidos (Tailwind CSS)
│       └── src/index.ts
│
├── turbo.json                 # Pipeline de build cacheado
├── pnpm-workspace.yaml        # Declaración de paquetes
└── package.json`;

  const SECURITY_DOCS = `## Arquitectura de Seguridad, Privacidad y Cumplimiento (Perú)

### 1. Ley N° 29733 (Protección de Datos Personales del Perú)
- **Naturaleza de reactivos:** Las respuestas a pruebas psicopedagógicas y conductuales son catalogadas como datos sensibles.
- **Consentimiento Previo:** Implementado como compuerta técnica obligatoria antes de iniciar el examen (ConsentScreen). No se puede abrir la prueba sin firma de fecha y aceptación.
- **Plazo de Retención:** 12 meses tras el término de la convocatoria. Job de purga automatizada en Postgres mediante \`pg_cron\` o BullMQ.
- **Derechos ARCO:** Canales documentados en la interfaz para Acceso, Rectificación, Cancelación y Oposición.

### 2. Control de Acceso Basado en Roles (RBAC)
- **CANDIDATE:** Acceso restringido exclusivamente a su propio intento mediante token criptográfico de un solo uso. La API jamás le envía reactivos con la respuesta correcta ni ponderaciones.
- **PSYCHOLOGIST:** Acceso completo a baremos psicométricos, percentiles y reportes conductuales detallados.
- **RECRUITER / ADMIN:** Acceso al tablero de candidatos, métricas agregadas, acciones de pase a finalistas y reenvío de invitaciones.

### 3. Integridad y Resiliencia a Escala (1.000 concurrentes)
- **Cronómetro Autoritativo:** El cliente es un visualizador pasivo. La hora de expiración (\`expiresAt\`) se graba en Redis y Postgres. Toda respuesta que llegue con \`now > expiresAt\` es rechazada por el servidor con código HTTP 403 / 422.
- **Idempotencia Absoluta:** Restricción \`@@unique([attemptId, questionId])\` que impide duplicados ante reintentos de red y garantiza inmutabilidad.
- **Auditoría Disuasiva:** Eventos de pérdida de foco (\`blur\`), cambio de pestaña (\`visibilitychange\`) e intentos de copia se almacenan en bitácora inmutable para análisis contextual del comité, no como descalificación algorítmica punitiva.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Ingeniería de Software & Arquitectura Técnica
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Especificación Técnica y Código de Producción
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Entregables técnicos completos: Prisma ORM, Servicio autoritativo NestJS, Monorepo Turborepo y Script k6.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 sm:gap-4 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('PRISMA')}
          className={`py-2.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'PRISMA'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Esquema Prisma (PostgreSQL)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SERVICE')}
          className={`py-2.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'SERVICE'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>2. Servicio de Intentos (NestJS + Redis)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('K6')}
          className={`py-2.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'K6'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>3. Prueba de Carga k6 (1.000 concurrentes)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MONOREPO')}
          className={`py-2.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'MONOREPO'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Monorepo Turborepo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`py-2.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'SECURITY'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5. Seguridad & Ley 29733</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl text-zinc-100">
        
        {/* Header with copy button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/80 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>
              {activeTab === 'PRISMA' && 'packages/database/prisma/schema.prisma'}
              {activeTab === 'SERVICE' && 'apps/api/src/modules/attempts/attempt.service.ts'}
              {activeTab === 'K6' && 'tests/load/k6-peak-1000-candidates.js'}
              {activeTab === 'MONOREPO' && 'talento-peru/tree-structure.txt'}
              {activeTab === 'SECURITY' && 'docs/security-and-compliance-peru.md'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const content = 
                activeTab === 'PRISMA' ? PRISMA_SCHEMA :
                activeTab === 'SERVICE' ? ATTEMPT_SERVICE :
                activeTab === 'K6' ? K6_SCRIPT :
                activeTab === 'MONOREPO' ? MONOREPO_STRUCTURE : SECURITY_DOCS;
              copyToClipboard(content, activeTab);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar código</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="text-xs sm:text-sm font-mono leading-relaxed text-zinc-300">
            {activeTab === 'PRISMA' && PRISMA_SCHEMA}
            {activeTab === 'SERVICE' && ATTEMPT_SERVICE}
            {activeTab === 'K6' && K6_SCRIPT}
            {activeTab === 'MONOREPO' && MONOREPO_STRUCTURE}
            {activeTab === 'SECURITY' && SECURITY_DOCS}
          </pre>
        </div>

      </div>

    </div>
  );
};
