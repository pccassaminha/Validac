import React, { useState } from "react";
import {
  Sparkles,
  Search,
  MapPin,
  Building2,
  Users,
  MessageSquare,
  Copy,
  Check,
  PlusCircle,
  TrendingUp,
  Target,
  ArrowRight,
  Briefcase,
  Store,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { ProspectLead, searchProspectsWithAI } from "../services/geminiProspecting";

export interface AiProspectingViewProps {
  isDark: boolean;
  onImportLeadsToCrm: (leads: ProspectLead[]) => Promise<void>;
  onTriggerWhatsApp: (lead: any, type: "reserva" | "entrega" | "pendente" | "stock") => void;
  formatPhoneWithCensorship: (p: string) => string;
}

export const AiProspectingView: React.FC<AiProspectingViewProps> = ({
  isDark,
  onImportLeadsToCrm,
  onTriggerWhatsApp,
  formatPhoneWithCensorship,
}) => {
  const [category, setCategory] = useState<"produtos_fisicos" | "servicos">("produtos_fisicos");
  const [niche, setNiche] = useState("Salões de Beleza & Cabeleireiros VIP");
  const [location, setLocation] = useState("Luanda (Talatona & Maianga)");
  const [targetCount, setTargetCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [prospects, setProspects] = useState<ProspectLead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const PRESET_NICHES_PRODUCTS = [
    "Salões de Beleza & Cabeleireiros VIP",
    "Boutiques de Moda Feminina & Seda",
    "Clínicas de Estética & Cintas Modeladoras",
    "Lojas de Calçado & Artigos Desportivos",
    "Boutiques de Acessórios & Cosméticos",
    "Supermercados & Conveniência em Luanda",
  ];

  const PRESET_NICHES_SERVICES = [
    "Empresas de Segurança Privada & Fardas",
    "Transportadoras & Frotas de Logística",
    "Clínicas Médicas & Higienização Hospitalar",
    "Escritórios de Advocacia & Consultoria B2B",
    "Hotéis & Pousadas em Luanda",
    "Oficinas Mecânicas & Centros Automotivos",
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    setImportSuccessMessage(null);
    try {
      const results = await searchProspectsWithAI({
        niche,
        location,
        category,
        targetCount,
      });
      setProspects(results);
      // Select all by default for fast bulk-import
      setSelectedIds(new Set(results.map((r) => r.id)));
    } catch (err) {
      console.error("Erro na busca de prospecção com IA:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === prospects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prospects.map((p) => p.id)));
    }
  };

  const handleImport = async () => {
    const toImport = prospects.filter((p) => selectedIds.has(p.id));
    if (toImport.length === 0) return;

    setIsLoading(true);
    try {
      await onImportLeadsToCrm(toImport);
      setImportSuccessMessage(`${toImport.length} lead(s) importados com sucesso para o Funil de Validação!`);
      // Remove imported from current view or mark them
      setProspects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Erro ao importar leads para o CRM:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPitch = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchId(id);
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border-indigo-900/50"
          : "bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-100 shadow-sm"
      }`}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={18} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
              Módulo de Prospecção Inteligente com IA
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            Busca de Leads Qualificados para Produtos & Serviços
          </h1>
          <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Utilize a inteligência artificial do Gemini para mapear negócios, decisores comerciais e lojas em Angola.
            Gere abordagens personalizadas para WhatsApp e importe os leads qualificados diretamente para o funil do Valida C.
          </p>
        </div>
      </div>

      {/* Search Configuration Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Tipo de Prospecção:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory("produtos_fisicos");
                  setNiche(PRESET_NICHES_PRODUCTS[0]);
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 border cursor-pointer ${
                  category === "produtos_fisicos"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                    : isDark ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-white" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <Store size={16} />
                <div className="text-left">
                  <div>Venda de Produtos Físicos</div>
                  <div className="text-[10px] font-normal opacity-80">Revendedores, Salões, Boutiques e Lojas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("servicos");
                  setNiche(PRESET_NICHES_SERVICES[0]);
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 border cursor-pointer ${
                  category === "servicos"
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                    : isDark ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-white" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <Briefcase size={16} />
                <div className="text-left">
                  <div>Prestação de Serviços & B2B</div>
                  <div className="text-[10px] font-normal opacity-80">Empresas, Consultorias e Clientes Corporativos</div>
                </div>
              </button>
            </div>
          </div>

          {/* Preset Niches Chips */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Nichos Recomendados:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(category === "produtos_fisicos" ? PRESET_NICHES_PRODUCTS : PRESET_NICHES_SERVICES).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNiche(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    niche === p
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                      : isDark ? "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nicho / Setor Personalizado:
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ex: Salões de estética em Luanda..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Localização / Região Alvo:
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Luanda, Talatona, Kilamba..."
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Quantidade de Leads a Buscar:
              </label>
              <select
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500"
                }`}
              >
                <option value={3}>3 Leads (Busca Rápida)</option>
                <option value={6}>6 Leads (Padrão)</option>
                <option value={10}>10 Leads (Lote Amplo)</option>
                <option value={15}>15 Leads (Expansão Máxima)</option>
              </select>
            </div>
          </div>

          {/* Search Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>A IA está a pesquisar e qualificar contactos em Angola...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Pesquisar Leads com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Search Results Section */}
      {prospects.length > 0 && (
        <div className="space-y-4">
          {/* Results Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                {selectedIds.size === prospects.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </button>
              <span className="text-xs text-slate-400">
                {selectedIds.size} de {prospects.length} seleccionados
              </span>
            </div>

            <button
              onClick={handleImport}
              disabled={selectedIds.size === 0 || isLoading}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs transition shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Importar {selectedIds.size} Leads Selecionados para o CRM</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prospects.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  onClick={() => handleToggleSelect(lead.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? isDark ? "bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-950/20" : "bg-indigo-50/40 border-indigo-300"
                      : isDark ? "bg-slate-900/80 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  {/* Select Checkbox & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <h3 className="text-xs font-black text-slate-100 truncate max-w-[180px]">
                        {lead.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Score: {lead.score}/100
                    </span>
                  </div>

                  {/* Decisor & Telefone */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    {lead.contactPerson && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Users size={12} className="text-indigo-400 shrink-0" />
                        <span>Decisor: <strong className="text-slate-200">{lead.contactPerson}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-emerald-400">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyPhone(lead.id, lead.phone)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Copiar número"
                        >
                          {copiedPhoneId === lead.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <button
                          onClick={() => onTriggerWhatsApp(lead, "reserva")}
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Abrir no WhatsApp"
                        >
                          <MessageSquare size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                      <MapPin size={12} className="text-blue-400 shrink-0" />
                      <span className="truncate">{lead.area}, {lead.province}</span>
                    </div>
                  </div>

                  {/* AI Suggested Pitch Preview */}
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-2">
                    <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase">
                      <span className="flex items-center gap-1">
                        <Sparkles size={11} /> Abordagem WhatsApp Sugerida
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPitch(lead.id, lead.suggestedPitch);
                        }}
                        className="text-slate-400 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedPitchId === lead.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedPitchId === lead.id ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="line-clamp-3 text-slate-400 italic">
                      "{lead.suggestedPitch}"
                    </p>
                  </div>

                  {/* Card Footer Note */}
                  <div className="text-[10px] text-slate-500 truncate">
                    {lead.notes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
