import React, { useState } from 'react';
import { EvaluationTest } from '../../types';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Linkedin, 
  QrCode, 
  ExternalLink, 
  Users, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react';

interface ViralizacionViewProps {
  tests: EvaluationTest[];
  onSelectTest?: (testId: string) => void;
}

export const ViralizacionView: React.FC<ViralizacionViewProps> = ({
  tests,
  onSelectTest
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalTest, setQrModalTest] = useState<EvaluationTest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyPublicLink = (test: EvaluationTest) => {
    const url = `${window.location.origin}/postular/${test.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(test.id);
    showToast(`✓ Enlace de convocatoria copiado: ${test.title}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareOnWhatsApp = (test: EvaluationTest) => {
    const url = `${window.location.origin}/postular/${test.id}`;
    const text = encodeURIComponent(`📢 ¡Convocatoria Laboral Abierta en GEA Internacional!\n\nPosición: ${test.title}\nPostula directamente aquí: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareOnLinkedIn = (test: EvaluationTest) => {
    const url = encodeURIComponent(`${window.location.origin}/postular/${test.id}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const filteredTests = tests.filter(t => 
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.targetPosition || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1F2A5E] text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#2F5BA8]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1F2A5E] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-6 h-6 text-[#2FA58B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#1F2A5E] dark:text-white tracking-tight">
                  Módulo de Viralización & Difusión
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2F5BA8]/10 text-[#2F5BA8] dark:bg-[#2F5BA8]/20 dark:text-[#5B8AE0]">
                  Campaña Activa
                </span>
              </div>
              <p className="text-xs text-[#6B7494] dark:text-[#9AA5C4]">
                Multiplica el alcance de tus convocatorias compartiendo enlaces directos en redes, bolsas de empleo y código QR.
              </p>
            </div>
          </div>
        </div>

        {/* Viral Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DDE2EF] dark:border-[#2A3563]">
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Convocatorias para difusión</span>
            <span className="text-xl font-black text-[#1F2A5E] dark:text-white">{tests.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Visualizaciones estimadas</span>
            <span className="text-xl font-black text-[#2FA58B]">1,420</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Postulantes captados</span>
            <span className="text-xl font-black text-[#F28C28]">328</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F]">
            <span className="text-[11px] text-[#6B7494] block font-medium">Tasa de conversión</span>
            <span className="text-xl font-black text-[#2F5BA8] dark:text-[#5B8AE0]">23.1%</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#182044] rounded-2xl border border-[#DDE2EF] dark:border-[#2A3563] p-3 shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar convocatoria por nombre o perfil..."
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-[#DDE2EF] dark:border-[#2A3563] bg-[#F8FAFC] dark:bg-[#151D3F] text-[#161C3A] dark:text-white placeholder:text-[#6B7494] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#6B7494] absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Process Cards Grid for Viral Diffusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => {
          const publicUrl = `${window.location.origin}/postular/${test.id}`;
          return (
            <div
              key={test.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#182044] border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1F2A5E] dark:text-white">
                    {test.title}
                  </h3>
                  <p className="text-xs text-[#6B7494]">
                    Perfil: <strong className="text-[#161C3A] dark:text-zinc-200">{test.targetPosition}</strong>
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  En Difusión
                </span>
              </div>

              {/* Link Box */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#151D3F] border border-[#DDE2EF]/80 dark:border-[#2A3563]/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#6B7494] truncate">
                  {publicUrl}
                </span>

                <button
                  type="button"
                  onClick={() => copyPublicLink(test)}
                  className="px-2.5 py-1 rounded-lg bg-[#1F2A5E] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedId === test.id ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === test.id ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Share Channels */}
              <div className="flex items-center justify-between pt-2 border-t border-[#DDE2EF]/60 dark:border-[#2A3563]/60">
                <span className="text-[11px] text-[#6B7494] font-medium">Compartir en:</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shareOnWhatsApp(test)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-pointer transition-colors"
                    title="Compartir por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => shareOnLinkedIn(test)}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer transition-colors"
                    title="Compartir en LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrModalTest(test)}
                    className="p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
                    title="Ver Código QR para ferias o sucursal"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Modal */}
      {qrModalTest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#182044] rounded-2xl max-w-sm w-full p-6 space-y-4 text-center border border-[#DDE2EF] dark:border-[#2A3563] shadow-2xl animate-in zoom-in-95">
            <h3 className="font-black text-base text-[#1F2A5E] dark:text-white">
              Código QR de Convocatoria
            </h3>
            <p className="text-xs text-[#6B7494]">
              {qrModalTest.title}
            </p>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-zinc-200 shadow-inner flex items-center justify-center">
              {/* Simulated QR Code SVG */}
              <div className="w-full h-full border-4 border-dashed border-[#1F2A5E] rounded-lg flex flex-col items-center justify-center p-2 text-center">
                <QrCode className="w-16 h-16 text-[#1F2A5E]" />
                <span className="text-[10px] font-mono font-bold text-[#1F2A5E] mt-2">
                  ESCANEAR PARA POSTULAR
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B7494]">
              Imprime o proyecta este código QR en sedes, volantes o ferias laborales para captura instantánea de candidatos.
            </p>

            <button
              type="button"
              onClick={() => setQrModalTest(null)}
              className="w-full py-2.5 rounded-xl bg-[#1F2A5E] hover:bg-[#182348] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
