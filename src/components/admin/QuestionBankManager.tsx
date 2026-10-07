import React, { useState } from 'react';
import { STAGES_CONFIG, SAMPLE_QUESTIONS, VALIDATION_DISCLAIMER } from '../../data/questionBank';
import { ExamStageId, Question } from '../../types';
import { 
  PlusCircle, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle,
  FileCheck,
  Tag
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<ExamStageId>('STAGE_1_PSYCHO');
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New question form state
  const [newStatement, setNewStatement] = useState('');
  const [newCompetency, setNewCompetency] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');

  const currentStageConfig = STAGES_CONFIG.find(s => s.id === selectedStage) || STAGES_CONFIG[0];
  const stageQuestions = questions.filter(q => q.stageId === selectedStage);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim() || !newOptionA.trim() || !newOptionB.trim()) return;

    const newQ: Question = {
      id: `custom-${Date.now()}`,
      stageId: selectedStage,
      orderNumber: stageQuestions.length + 1,
      competency: newCompetency.trim() || 'Evaluación de competencias',
      statement: newStatement.trim(),
      options: [
        { id: `opt-${Date.now()}-a`, code: 'A', text: newOptionA.trim() },
        { id: `opt-${Date.now()}-b`, code: 'B', text: newOptionB.trim() },
        { id: `opt-${Date.now()}-c`, code: 'C', text: newOptionC.trim() || 'Opción complementaria' },
        { id: `opt-${Date.now()}-d`, code: 'D', text: newOptionD.trim() || 'Opción alternativa' }
      ]
    };

    setQuestions([newQ, ...questions]);
    setIsAddingNew(false);
    setNewStatement('');
    setNewCompetency('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
  };

  return (
    <div className="space-y-6">
      
      {/* Disclaimer Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold">Validación Psicométrica Obligatoria</p>
          <p className="mt-0.5 opacity-90 leading-relaxed">
            {VALIDATION_DISCLAIMER} Cada reactivo nuevo incorporado al banco debe cumplir los estándares del Colegio de Psicólogos del Perú (CPsP) y contar con clave ciega no expuesta al cliente.
          </p>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {STAGES_CONFIG.map((stage, idx) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setSelectedStage(stage.id);
                setIsAddingNew(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedStage === stage.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Etapa {idx + 1}: {stage.shortName} ({questions.filter(q => q.stageId === stage.id).length})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAddingNew ? 'Cancelar adición' : 'Agregar nuevo reactivo'}</span>
        </button>
      </div>

      {/* New Question Form */}
      {isAddingNew && (
        <form onSubmit={handleCreateQuestion} className="p-6 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-800 rounded-2xl shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Nuevo reactivo para {currentStageConfig.name}</span>
            </h3>
            <span className="text-xs text-zinc-400">Banco de reactivos calibrados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Competencia evaluada
              </label>
              <input
                type="text"
                required
                value={newCompetency}
                onChange={e => setNewCompetency(e.target.value)}
                placeholder="Ej. Resiliencia y autocontrol bajo presión"
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Enunciado o situación del caso
            </label>
            <textarea
              required
              rows={3}
              value={newStatement}
              onChange={e => setNewStatement(e.target.value)}
              placeholder="Describa el dilema laboral o situación con claridad y verbos activos…"
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Opción A (Conducta altamente adaptativa)
              </label>
              <input
                type="text"
                required
                value={newOptionA}
                onChange={e => setNewOptionA(e.target.value)}
                placeholder="Texto de la opción A…"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Opción B (Conducta neutra o estándar)
              </label>
              <input
                type="text"
                required
                value={newOptionB}
                onChange={e => setNewOptionB(e.target.value)}
                placeholder="Texto de la opción B…"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Opción C (Conducta poco asertiva / evasiva)
              </label>
              <input
                type="text"
                value={newOptionC}
                onChange={e => setNewOptionC(e.target.value)}
                placeholder="Texto de la opción C…"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Opción D (Conducta desadaptativa o reactiva)
              </label>
              <input
                type="text"
                value={newOptionD}
                onChange={e => setNewOptionD(e.target.value)}
                placeholder="Texto de la opción D…"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Guardar en banco de preguntas
            </button>
          </div>
        </form>
      )}

      {/* Questions List for Selected Stage */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>{stageQuestions.length} reactivos activos en esta etapa (meta técnica: 15-25)</span>
          <span>Cronómetro: 15:00 min autoritativo en servidor</span>
        </div>

        <div className="space-y-3">
          {stageQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                    {q.competency}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">ID: {q.id}</span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {q.statement}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 flex items-start gap-2"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {opt.code}.
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
