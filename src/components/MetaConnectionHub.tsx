import React, { useState, useEffect } from "react";
import {
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Key,
  Layers,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Activity,
  Code2
} from "lucide-react";
import {
  MetaConfig,
  MetaEventLog,
  getMetaConfig,
  saveMetaConfig,
  getMetaLogs,
  sendMetaConversionEvent
} from "../services/metaIntegration";

export interface MetaConnectionHubProps {
  isDark: boolean;
}

export const MetaConnectionHub: React.FC<MetaConnectionHubProps> = ({ isDark }) => {
  const [config, setConfig] = useState<MetaConfig>(getMetaConfig());
  const [logs, setLogs] = useState<MetaEventLog[]>(getMetaLogs());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getMetaLogs());
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    saveMetaConfig(config);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const handleSendTestEvent = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await sendMetaConversionEvent({
        eventName: "Lead",
        lead: {
          name: "Cliente Teste Valida C",
          phone: "+244 923 000 111",
          province: "Luanda",
          produto: "Validação Oficial Meta",
          price: 25000,
        },
        customData: {
          test_event: true,
          platform: "Valida C CRM",
        },
      });
      setTestResult(result);
      setLogs(getMetaLogs());
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || "Erro no teste" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyText = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isConfigured = Boolean(config.pixelId && config.accessToken);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border-blue-900/50"
          : "bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-blue-100 shadow-sm"
      }`}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Share2 size={18} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Integração Oficial Meta (Facebook & Instagram)
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            Meta Conversions API & Lead Ads Hub
          </h1>
          <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Conecte o <strong>Valida C</strong> diretamente ao Gerenciador de Negócios da Meta. Sincronize eventos de qualificação
            em tempo real com dados criptografados (SHA-256) para otimizar os seus anúncios de conversão.
          </p>
        </div>
      </div>

      {/* Integration Status Badge */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isConfigured
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
      }`}>
        <div className="flex items-center gap-2.5">
          {isConfigured ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div>
            <p className="text-xs font-bold">
              {isConfigured ? "Meta Conversions API Conectada & Ativa" : "Meta CAPI em Modo Simulação (Pixel Ativo)"}
            </p>
            <p className="text-[11px] opacity-80">
              {isConfigured
                ? `Disparos oficiais sendo enviados para o Pixel ID ${config.pixelId}`
                : "Insira o Access Token do Gerenciador de Negócios para ativar a transmissão direta de eventos."}
            </p>
          </div>
        </div>

        <button
          onClick={handleSendTestEvent}
          disabled={isTesting}
          className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isTesting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
          <span>Testar Disparo Oficial</span>
        </button>
      </div>

      {/* Test result message */}
      {testResult && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          testResult.success
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials Form (2 cols) */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Key size={16} className="text-blue-400" />
            <span>Credenciais do Meta Business Manager</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Meta Pixel ID / Dataset ID:
              </label>
              <input
                type="text"
                value={config.pixelId}
                onChange={(e) => setConfig({ ...config, pixelId: e.target.value })}
                placeholder="Ex: 4192962437607469"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500"
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Pixel ativo nas landing pages do Valida C.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Conversions API Access Token (System User Token):
              </label>
              <textarea
                rows={3}
                value={config.accessToken}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                placeholder="EAA..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500"
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Gerado no Gerenciador de Eventos da Meta &gt; Seu Pixel &gt; Configurações &gt; "Gerar token de acesso".
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Código de Teste de Evento (Test Event Code - Opcional):
              </label>
              <input
                type="text"
                value={config.testEventCode}
                onChange={(e) => setConfig({ ...config, testEventCode: e.target.value })}
                placeholder="Ex: TEST12345"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500"
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Copie da aba "Testar eventos" do seu Gerenciador de Eventos da Meta para ver o evento ao vivo.
              </p>
            </div>

            {/* Event Automations */}
            <div className="pt-3 border-t border-slate-700/50 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Disparos Automáticos de Eventos:
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.trackOnLeadReceived}
                  onChange={(e) => setConfig({ ...config, trackOnLeadReceived: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Enviar evento <strong>Lead</strong> quando uma nova reserva chega</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.trackOnLeadQualified}
                  onChange={(e) => setConfig({ ...config, trackOnLeadQualified: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Enviar evento <strong>CompleteRegistration</strong> quando o lead é Qualificado</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.trackOnLeadTransferred}
                  onChange={(e) => setConfig({ ...config, trackOnLeadTransferred: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Enviar evento <strong>Purchase</strong> quando o lead é Transferido p/ Vendas</span>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30"
              >
                {isSaving ? <Check size={14} /> : <ShieldCheck size={14} />}
                <span>{isSaving ? "Configuração Salva!" : "Salvar Configuração da Meta"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lead Ads Webhook Quick Guide (1 col) */}
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Code2 size={16} className="text-indigo-400" />
            <span>Meta Lead Ads (Formulários)</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Para receber leads de anúncios de Formulário Instantâneo do Facebook/Instagram direto no Valida C:
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Callback Webhook URL:</p>
              <div className="flex items-center justify-between gap-1 font-mono text-[11px] text-slate-200">
                <span className="truncate">{window.location.origin}/api/meta/webhook</span>
                <button
                  onClick={() => handleCopyText(`${window.location.origin}/api/meta/webhook`, "url")}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedKey === "url" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Token de Verificação (Verify Token):</p>
              <div className="flex items-center justify-between gap-1 font-mono text-[11px] text-slate-200">
                <span className="truncate">{config.verifyToken}</span>
                <button
                  onClick={() => handleCopyText(config.verifyToken, "token")}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedKey === "token" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <HelpCircle size={12} /> Criptografia SHA-256
              </p>
              <p className="text-[10px] opacity-80 leading-normal">
                Todos os dados de contacto (telefone com +244, nome e localização) são automaticamente criptografados com SHA-256 antes do envio para a Meta, garantindo total conformidade de privacidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Histórico de Disparos de Conversão (Meta CAPI Logs)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            {logs.length} evento(s) registrados
          </span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Nenhum evento disparado recentemente. Clique em "Testar Disparo Oficial" acima.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] font-black uppercase tracking-wider border-b ${
                isDark ? "text-slate-400 border-slate-800" : "text-slate-600 border-slate-200"
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Hora</th>
                  <th className="py-2.5 px-3">Evento Meta</th>
                  <th className="py-2.5 px-3">Lead / Cliente</th>
                  <th className="py-2.5 px-3">Telefone Hashed</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Resposta Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className={isDark ? "text-slate-300" : "text-slate-700"}>
                    <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-400">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">
                      {log.eventName}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.leadName || "Lead Teste"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      {log.phoneHashed || "SHA-256"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        log.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.status === "simulated"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                      {log.responseMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
