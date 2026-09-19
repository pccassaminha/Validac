import React, { useState, useEffect } from "react";
import { MessageSquare, Copy, Check, ExternalLink, X, Phone, User, Package, MapPin, Edit3, Eye } from "lucide-react";

export interface WhatsAppModalData {
  isOpen: boolean;
  lead: any;
  title: string;
  type: "reserva" | "entrega" | "pendente" | "stock" | "custom";
  messageText: string;
  recipientPhone: string;
  recipientName: string;
}

interface WhatsAppActionModalProps {
  data: WhatsAppModalData | null;
  onClose: () => void;
  isDark?: boolean;
}

export const WhatsAppActionModal: React.FC<WhatsAppActionModalProps> = ({
  data,
  onClose,
  isDark = true,
}) => {
  const [message, setMessage] = useState(data?.messageText || "");
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    if (data && data.isOpen) {
      setMessage(data.messageText || "");
      setIsEditing(false);
      setCopiedMessage(false);
      setCopiedPhone(false);
    }
  }, [data]);

  if (!data || !data.isOpen) return null;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(data.recipientPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 3000);
    } catch (err) {
      console.error("Falha ao copiar telefone:", err);
    }
  };

  const handleSendDirect = () => {
    let cleanPhone = (data.recipientPhone || "").replace(/\D/g, "");
    if (cleanPhone.length === 9 && (cleanPhone.startsWith("9") || cleanPhone.startsWith("2"))) {
      cleanPhone = `244${cleanPhone}`;
    }
    const encodedText = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`, "_blank");
  };

  const getTypeBadge = () => {
    switch (data.type) {
      case "reserva":
        return { label: "Reconfirmar Reserva", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case "entrega":
        return { label: "Confirmar Entrega", bg: "bg-teal-500/20 text-teal-400 border-teal-500/30" };
      case "pendente":
        return { label: "Recuperar Pendente", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "stock":
        return { label: "Encomenda em Stock", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      default:
        return { label: "Mensagem WhatsApp", bg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
    }
  };

  const badge = getTypeBadge();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70"}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  {data.title || "Opções de Envio WhatsApp"}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Como deseja proceder com esta mensagem?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Recipient Overview Pill */}
          <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-100/80 border-slate-200 text-slate-700"
          }`}>
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 shrink-0" />
              <span className="font-bold">{data.recipientName}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span>{data.recipientPhone}</span>
              <button
                onClick={handleCopyPhone}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                  copiedPhone
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
                title="Copiar apenas número de telefone"
              >
                {copiedPhone ? <Check size={10} /> : <Copy size={10} />}
                <span>{copiedPhone ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className={`font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <span>Conteúdo da Mensagem</span>
                <span className="text-[10px] font-normal opacity-70">
                  ({message.length} caracteres)
                </span>
              </label>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-[11px] font-bold flex items-center gap-1 transition cursor-pointer px-2 py-0.5 rounded-lg ${
                  isEditing
                    ? "bg-indigo-500/20 text-indigo-400"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye size={12} />
                    <span>Ver Original</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={12} />
                    <span>Personalizar Texto</span>
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className={`w-full p-3 rounded-2xl border text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600"
                    : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
                }`}
                placeholder="Escreva ou edite a mensagem..."
              />
            ) : (
              <div className={`p-3 rounded-2xl border text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-sans ${
                isDark ? "bg-slate-950/70 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                {message}
              </div>
            )}
          </div>

          {copiedMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Check size={16} className="shrink-0" />
              <span>✓ Mensagem copiada com sucesso para a área de transferência!</span>
            </div>
          )}
        </div>

        {/* MODAL FOOTER - ACTION BUTTONS */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row gap-2.5 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70"}`}>
          {/* OPTION 1: COPY MESSAGE ONLY */}
          <button
            onClick={handleCopyMessage}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border shadow-sm ${
              copiedMessage
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20"
                : isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {copiedMessage ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedMessage ? "Mensagem Copiada!" : "Copiar Mensagem"}</span>
          </button>

          {/* OPTION 2: SEND DIRECT TO WHATSAPP */}
          <button
            onClick={handleSendDirect}
            className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-98"
          >
            <ExternalLink size={16} />
            <span>Enviar Direto no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
