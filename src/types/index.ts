export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'RECRUITER' | 'PSYCHOLOGIST' | 'CANDIDATE';

export interface AuthSession {
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CANDIDATE';
  userId: string;
  fullName: string;
  email: string;
  username?: string;
  dni?: string;
  position?: string;
  candidateId?: string; // set when role === 'CANDIDATE'
}

export type CandidateStageStatus = 'INVITED' | 'IN_PROGRESS' | 'SCORED' | 'FINALIST' | 'REJECTED';

export type ExamStageId = 'STAGE_1_PSYCHO' | 'STAGE_2_EMOTIONAL' | 'STAGE_3_WORK_CASES';

export interface ExamStageConfig {
  id: ExamStageId;
  name: string;
  shortName: string;
  durationSeconds: number; // 900 seconds = 15 minutes
  description: string;
  objective: string;
  guidelines: string[];
}

export interface Option {
  id: string;
  code: 'A' | 'B' | 'C' | 'D';
  text: string;
  // Weight/score is kept only on the server or admin view, NEVER sent to candidate
  weight?: number; 
}

export interface Question {
  id: string;
  stageId: ExamStageId;
  orderNumber: number;
  statement: string;
  context?: string;
  options: Option[];
  competency: string;
  expertValidationNote?: string;
}

export interface CandidateAnswer {
  questionId: string;
  selectedOptionId: string;
  stageId: ExamStageId;
  confirmedAt: string;
  syncedToServer: boolean;
  serverTimestamp?: string;
}

export type AuditEventType = 
  | 'TAB_SWITCH_OUT'
  | 'TAB_SWITCH_BACK'
  | 'WINDOW_BLUR'
  | 'WINDOW_FOCUS'
  | 'NETWORK_OFFLINE'
  | 'NETWORK_ONLINE'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_FORCE_EXPIRED';

export interface AuditEvent {
  id: string;
  candidateId: string;
  attemptId: string;
  stageId?: ExamStageId;
  type: AuditEventType;
  description: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface CompetencyScore {
  name: string;
  category: string;
  score: number; // 0 - 100
  level: 'SOBRESALIENTE' | 'ADECUADO' | 'EN_DESARROLLO' | 'BAJO';
  description: string;
}

export interface CandidateDetailedReport {
  jobFitPercentage: number;
  evaluationDate: string;
  reportCode: string;
  competencies: CompetencyScore[];
  strengths: string[];
  developmentAreas: string[];
  suggestedInterviewQuestions: string[];
  psychologistRecommendation: 'RECOMENDADO_FINALISTA' | 'RECOMENDADO_CON_OBSERVACIONES' | 'NO_RECOMENDADO';
  recommendationSummary: string;
  psychologistName: string;
  psychologistCpsp: string; // e.g. "CPsP N° 28419"
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Credencial de acceso generada en la invitación
  phone: string;
  whatsappUser?: string; // Usuario / Número oficial de WhatsApp para envío de accesos
  dni: string; // Peruvian National ID
  position: string;
  testId?: string; // ID del proceso/examen asignado
  invitationCode: string;
  invitedAt: string;
  status: CandidateStageStatus;
  currentStage?: ExamStageId;
  startedAt?: string;
  completedAt?: string;
  totalDurationSeconds?: number;
  // Scores (computed server-side)
  scores?: {
    overall: number; // 0 - 100
    stage1Psycho: number;
    stage2Emotional: number;
    stage3WorkCases: number;
    percentile: number;
  };
  detailedReport?: CandidateDetailedReport;
  auditEventCount: number;
  criticalFlags: number;
  recruiterNotes?: string;
  isConsentSigned: boolean;
  consentSignedAt?: string;
}

export type SyncState = 'SYNCED' | 'SAVING' | 'OFFLINE_SAVED' | 'SYNCING';

export interface AttemptState {
  attemptId: string;
  candidateId: string;
  startedAt: string;
  currentStageId: ExamStageId;
  stageStartedAt: string;
  stageExpiresAt: string;
  isStageCompleted: boolean;
  isExamSubmitted: boolean;
  currentQuestionIndex: number;
  answers: Record<string, CandidateAnswer>; // questionId -> answer
}

// ==========================================
// CONFIGURACIÓN Y CREACIÓN DE PRUEBAS
// ==========================================

export type QuestionCategory = 
  | 'PSYCHOLOGICAL' 
  | 'EMOTIONAL' 
  | 'EDUCATIONAL' 
  | 'COMPETENCIES' 
  | 'WORK_CASES' 
  | 'TECHNICAL';

export interface CategoryDefinition {
  id: QuestionCategory;
  name: string;
  badgeLabel: string;
  description: string;
  defaultDurationMinutes: number;
  recommendedQuestions: number;
  competencies: string[];
}

export interface TestStageConfig {
  id: string;
  category: QuestionCategory;
  name: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
  weightPercent: number; // e.g. 30%, 35%, etc.
  isEnabled: boolean;
}

export interface EvaluationTest {
  id: string;
  code: string; // e.g. "GEA-TEST-OPS-2026"
  title: string;
  targetPosition: string;
  description: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  totalDurationMinutes: number;
  stages: TestStageConfig[];
  selectedCompetencies: string[]; // Competencias específicas elegidas para evaluar al postulante
  difficultyLevel?: 'BAJO' | 'MEDIO' | 'ALTO';
  candidateCount: number;
  completedCount: number;
  averageScore?: number;
  // Campos visuales estilo evaluar / GEA Internacional
  launchedBy?: string;
  startDate?: string;
  endDate?: string;
  processStatus?: 'LANZADO' | 'BORRADOR' | 'CERRADO' | 'ARCHIVADO';
  profileName?: string;
  hiredCount?: number;
  inProgressCount?: number;
  notStartedCount?: number;
  disqualifiedCount?: number;
}
