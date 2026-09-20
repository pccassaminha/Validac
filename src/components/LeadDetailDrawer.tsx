import React, { useState } from "react";
import {
  X,
  Phone,
  MapPin,
  Package,
  Calendar,
  Sparkles,
  Send,
  MessageSquare,
  Copy,
  Check,
  Tag,
  ShieldCheck,
  User,
  ArrowRight,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  Trophy,
  CheckCheck
} from "lucide-react";
import { sendMetaConversionEvent } from "../services/metaIntegration";
import { getLeadPrice } from "../services/leadUtils";

export interface LeadDetailDrawerProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onUpdateStatus: (leadId: string, newStatus: string) => Promise<void>;
  onDeleteLead?: (lead: any) => void;
  onTriggerWhatsApp: (lead: any, type: "reserva" | "entrega" | "pendente" | "stock") => void;
  formatKz: (val: number) => string;
  hidePhones?: boolean;
  formatPhoneWithCensorship: (phone: string) => string;
  formatPageNameWithCensorship: (prod: string) => string;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  isDark,
  onUpdateStatus,
  onDeleteLead,
  onTriggerWhatsApp,
  formatKz,
  hidePhones,
  formatPhoneWithCensorship,
  formatPageNameWithCensorship,
}) => {
  const [internalNotes, setInternalNotes] = useState<string[]>(() => {
    if (!lead) return [];
    if (Array.isArray(lead.crmNotes)) return lead.crmNotes;
    if (lead.observacoes) return [lead.observacoes];
    return [];
  });
  const [newNoteText, setNewNoteText] = useState("");
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [soldSuccess, setSoldSuccess] = useState(false);

  if (!isOpen || !lead) return null;

  // Calculate dynamic lead scoring (0 to 100)
  const calculateLeadScore = (item: any): { score: number; level: "Alto" | "Médio" | "Básico"; color: string } => {
    let score = 50; // base score
    if (item.phone && item.phone.length >= 9) score += 15;
    if (item.province) score += 10;
    if (item.area || item.address) score += 10;
    if (item.status && (item.status === "Vendido" || item.status.includes("Vendido"))) score += 25;
    else if (item.status && item.status.includes("Reservado")) score += 15;
    else if (item.status === "Transferido" || item.status === "Em Vendas") score += 20;
    const qty = item.quantity || item.qtd || item.quantidade || 1;
    if (qty > 1) score += 10;

    const finalScore = Math.min(100, score);
    if (finalScore >= 85) return { score: finalScore, level: "Alto", color: "emerald" };
    if (finalScore >= 65) return { score: finalScore, level: "Médio", color: "amber" };
    return { score: finalScore, level: "Básico", color: "blue" };
  };

  const leadScoreInfo = calculateLeadScore(lead);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const timestamp = new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
    const noteEntry = `[${timestamp}] ${newNoteText.trim()}`;
    const updated = [noteEntry, ...internalNotes];
    setInternalNotes(updated);
    setNewNoteText("");
  };

  const generateSalesDossier = (item: any) => {
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString("pt-AO") : "Hoje";
    const prod = formatPageNameWithCensorship(item.produto || "Produto Valida C");
    const qty = item.quantity || item.qtd || item.quantidade || 1;
    const loc = `${item.area || item.address || "Endereço a confirmar"}, ${item.province || "Luanda"}`;

    return `*🚀 LEAD QUALIFICADO — TRANSFERÊNCIA COMERCIAL*\n` +
      `*Sistema:* Valida C\n` +
      `*Data:* ${date}\n` +
      `--------------------------------\n` +
      `👤 *Cliente:* ${item.name || "Cliente"}\n` +
      `📱 *WhatsApp:* ${item.phone || "N/A"}\n` +
      `📍 *Localização:* ${loc}\n` +
      `📦 *Produto:* ${prod}\n` +
      `🔢 *Quantidade:* ${qty} Unidade(s)\n` +
      (item.cor ? `🎨 *Cor:* ${item.cor}\n` : "") +
      (item.tamanho ? `📏 *Tamanho:* ${item.tamanho}\n` : "") +
      `⭐ *Score de Qualificação:* ${leadScoreInfo.score}/100 (${leadScoreInfo.level})\n` +
      `📝 *Notas de Validação:* ${internalNotes.length > 0 ? internalNotes.join(" | ") : "Lead confirmou interesse inicial na landing page."}\n` +
      `--------------------------------\n` +
      `✅ *Pronto para fecho de venda e cobrança imediata.*`;
  };

  const handleCopyDossier = () => {
    const text = generateSalesDossier(lead);
    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  const handleTransferToSales = async () => {
    setIsTransferring(true);
    try {
      // 1. Atualizar status para Transferido
      await onUpdateStatus(lead.id, "Transferido");

      // 2. Disparar evento oficial da Meta Conversions API
      sendMetaConversionEvent({
        eventName: "CompleteRegistration",
        lead: {
          name: lead.name,
          phone: lead.phone,
          province: lead.province,
          produto: lead.produto,
        },
        customData: {
          crm_status: "transferido_para_vendas",
          lead_score: leadScoreInfo.score,
        },
      });

      // 3. Copiar dossiê comercial para a área de transferência
      handleCopyDossier();
    } catch (e) {
      console.error("Erro ao transferir lead:", e);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleMarkAsSold = async () => {
    setIsMarkingSold(true);
    try {
      // 1. Atualizar status para Vendido
      await onUpdateStatus(lead.id, "Vendido");

      // 2. Disparar evento oficial Purchase para a Meta Conversions API (CAPI)
      const price = getLeadPrice(lead);
      await sendMetaConversionEvent({
        eventName: "Purchase",
        lead: {
          name: lead.name,
          phone: lead.phone,
          province: lead.province,
          produto: lead.produto,
          price: price,
        },
        customData: {
          crm_status: "vendido",
          value: price,
          currency: "AOA",
          lead_score: leadScoreInfo.score,
        },
      });

      setSoldSuccess(true);
      setTimeout(() => setSoldSuccess(false), 3500);
    } catch (e) {
      console.error("Erro ao marcar lead como vendido:", e);
    } finally {
      setIsMarkingSold(false);
    }
  };

  const handleCopyPhone = () => {
    if (!lead?.phone) return;
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden transition-all cursor-default ${
          isDark ? "bg-slate-900 border-l border-slate-800 text-slate-100" : "bg-white border-l border-slate-200 text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50/80"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-base">
              {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black truncate max-w-[220px]">
                  {lead.name || "Lead Sem Nome"}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  leadScoreInfo.color === "emerald" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  leadScoreInfo.color === "amber" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}>
                  Score: {leadScoreInfo.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ficha 360° de Validação de Lead — Valida C
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Status Bar */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Estágio no Funil de Validação:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { key: "Pendente", label: "Entrada" },
                { key: "Em Contacto", label: "Em Contacto" },
                { key: "Reservado", label: "Qualificado" },
                { key: "Transferido", label: "Em Vendas" },
                { key: "Vendido", label: "🏆 Vendido" },
                { key: "Rejeitado", label: "Desqualif." },
              ].map((stage) => {
                const isActive = (lead.status === stage.key) || (stage.key === "Reservado" && lead.status?.includes("Reservado"));
                const isSoldStage = stage.key === "Vendido";
                return (
                  <button
                    key={stage.key}
                    onClick={() => {
                      if (isSoldStage) {
                        handleMarkAsSold();
                      } else {
                        onUpdateStatus(lead.id, stage.key);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                      isActive
                        ? isSoldStage
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40 ring-2 ring-emerald-400/50"
                          : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : isDark
                        ? "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {stage.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action: Registrar Venda Concluída (Purchase Meta) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-700">
                  <Trophy size={12} className="text-amber-400" /> Conversão Final Meta (Purchase)
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">
                  {lead.status === "Vendido" ? "Venda Confirmada & Sincronizada" : "Marcar Lead como Vendido"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lead.status === "Vendido"
                    ? `Lead com venda concluída! Evento Purchase (${formatKz(getLeadPrice(lead))}) emitido para a Meta Conversions API para retroalimentar o algoritmo.`
                    : `Ao marcar como vendido, o sistema despacha o evento Purchase de ${formatKz(getLeadPrice(lead))} para a Meta CAPI com dados criptografados, fortalecendo os Lookalikes.`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Valor da Venda</p>
                <p className="text-base font-black text-emerald-400">{formatKz(getLeadPrice(lead))}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {lead.status === "Vendido" ? (
                <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCheck size={16} className="text-emerald-400" />
                  <span>Vendido Registrado · Evento Purchase Ativo na Meta</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkAsSold}
                  disabled={isMarkingSold}
                  className="flex-1 min-w-[180px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy size={14} className="text-amber-300" />
                  <span>{isMarkingSold ? "A enviar para a Meta CAPI..." : "Marcar como VENDIDO (Disparar Purchase Meta)"}</span>
                </button>
              )}
            </div>

            {soldSuccess && (
              <div className="mt-2.5 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                <Check size={14} className="text-emerald-300" />
                <span>Venda registrada com sucesso! Evento 'Purchase' transmitido para a Meta.</span>
              </div>
            )}
          </div>

          {/* Primary Action: Transferir para Vendas */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 border border-emerald-500/30 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                  <ShieldCheck size={12} /> Handoff Comercial
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Transferir Lead para a Equipa de Vendas
                </h3>
                <p className="text-xs text-slate-300">
                  Atualiza o status para "Em Vendas", dispara o evento oficial na Meta e copia o dossiê comercial formatado.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={handleTransferToSales}
                disabled={isTransferring}
                className="flex-1 min-w-[170px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight size={15} />
                <span>{isTransferring ? "A transferir..." : "Validar & Transferir p/ Vendas"}</span>
              </button>

              <button
                onClick={handleCopyDossier}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Copiar resumo comercial formatado"
              >
                {copiedDossier ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedDossier ? "Dossiê Copiado!" : "Copiar Dossiê"}</span>
              </button>
            </div>
          </div>

          {/* Customer Profile Information Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Dados do Contacto & Localização
            </h4>

            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-white border-slate-200 shadow-xs"}`}>
              {/* Telefone / WhatsApp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp / Contacto</p>
                    <p className="text-xs font-bold text-slate-200">
                      {hidePhones ? formatPhoneWithCensorship(lead.phone || "") : lead.phone || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                    title="Copiar número"
                  >
                    {copiedPhone ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={() => onTriggerWhatsApp(lead, "reserva")}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Endereço / Província */}
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/40">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Localização / Província</p>
                  <p className="text-xs font-bold text-slate-200">
                    {lead.area || lead.address || "Endereço não especificado"}, {lead.province || "Luanda"} (Angola)
                  </p>
                </div>
              </div>

              {/* Produto de Interesse */}
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/40">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Package size={15} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Produto / Landing Page</p>
                  <p className="text-xs font-bold text-slate-200">
                    {formatPageNameWithCensorship(lead.produto || "Produto Valida C")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-700 text-[10px] font-bold text-slate-300">
                      Qtd: {lead.quantity || lead.qtd || lead.quantidade || 1}
                    </span>
                    {lead.cor && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-700 text-[10px] font-bold text-slate-300">
                        Cor: {lead.cor}
                      </span>
                    )}
                    {lead.tamanho && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-700 text-[10px] font-bold text-slate-300">
                        Tamanho: {lead.tamanho}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data de Entrada */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-700/40 text-xs text-slate-400">
                <Calendar size={14} />
                <span>
                  Captado em: {lead.timestamp ? new Date(lead.timestamp).toLocaleString("pt-AO") : "Data não disponível"}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Qualification Notes (CRM Activity) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Notas Internas & Atividades</span>
              <span className="text-[10px] text-indigo-400 font-normal">{internalNotes.length} registo(s)</span>
            </h4>

            {/* Note input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Ex: Cliente prefere contacto após as 17h..."
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs border outline-none transition ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
              <button
                onClick={handleAddNote}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Send size={13} />
                <span>Salvar</span>
              </button>
            </div>

            {/* Note list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {internalNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhuma anotação de validação registrada ainda.
                </p>
              ) : (
                internalNotes.map((note, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs border flex items-start gap-2 ${
                      isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <Clock size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="flex-1">{note}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-2 shrink-0 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"}`}>
          {onDeleteLead && (
            <button
              onClick={() => {
                onDeleteLead(lead);
                onClose();
              }}
              className="py-2 px-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Eliminar Lead</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
