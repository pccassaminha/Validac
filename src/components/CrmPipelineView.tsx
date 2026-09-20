import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Columns3,
  Table as TableIcon,
  Phone,
  MapPin,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Copy,
  Check,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Share2,
  TrendingUp,
  UserCheck,
  Flame,
  Download,
  Trophy,
  CheckCheck,
  BadgePercent,
  GripVertical,
  Move
} from "lucide-react";
import { getLeadPrice } from "../services/leadUtils";

export interface CrmPipelineViewProps {
  isDark: boolean;
  leads: any[];
  onUpdateStatus: (leadId: string, newStatus: string) => Promise<void>;
  onDeleteLead: (lead: any) => void;
  onOpenLeadDetail: (lead: any) => void;
  onTriggerWhatsApp: (lead: any, type: "reserva" | "entrega" | "pendente" | "stock") => void;
  formatKz: (val: number) => string;
  hidePhones?: boolean;
  formatPhoneWithCensorship: (phone: string) => string;
  formatPageNameWithCensorship: (prod: string) => string;
  availableProducts: string[];
  selectedProductFilter: string;
  onSelectProductFilter: (prod: string) => void;
  onOpenExport?: () => void;
}

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  isDark,
  leads,
  onUpdateStatus,
  onDeleteLead,
  onOpenLeadDetail,
  onTriggerWhatsApp,
  formatKz,
  hidePhones,
  formatPhoneWithCensorship,
  formatPageNameWithCensorship,
  availableProducts,
  selectedProductFilter,
  onSelectProductFilter,
  onOpenExport,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnKey: string) => {
    // Only clear if leaving the drop container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === columnKey) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    setDragOverColumn(null);
    setDraggedLeadId(null);

    if (!leadId) return;

    // Find the lead to check if status actually changed
    const targetLead = leads.find((l) => String(l.id) === String(leadId));
    if (targetLead && targetLead.status !== targetStatus) {
      await onUpdateStatus(targetLead.id, targetStatus);
    }
  };

  // Filter leads by search query and product filter
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Product filter
      if (selectedProductFilter !== "Todos") {
        const prod = lead.produto || "Secador Inteligente UV";
        if (prod.toLowerCase() !== selectedProductFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (lead.name || "").toLowerCase();
        const phone = (lead.phone || "").toLowerCase();
        const area = (lead.area || lead.address || "").toLowerCase();
        const prov = (lead.province || "").toLowerCase();
        const prod = (lead.produto || "").toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          area.includes(q) ||
          prov.includes(q) ||
          prod.includes(q)
        );
      }

      return true;
    });
  }, [leads, selectedProductFilter, searchQuery]);

  // Group leads into the 6 stages of the validation pipeline
  const pipelineStages = useMemo(() => {
    const stages = {
      entrada: [] as any[],
      em_contacto: [] as any[],
      qualificado: [] as any[],
      transferido: [] as any[],
      vendido: [] as any[],
      desqualificado: [] as any[],
    };

    filteredLeads.forEach((lead) => {
      const st = (lead.status || "Pendente").toLowerCase();
      if (st.includes("vendido") || st.includes("fechado") || st.includes("ganho") || st.includes("comprou")) {
        stages.vendido.push(lead);
      } else if (st.includes("transferido") || st.includes("em vendas") || st.includes("venda")) {
        stages.transferido.push(lead);
      } else if (st.includes("reservado") || st.includes("qualificado") || st.includes("confirmado") || st.includes("pago")) {
        stages.qualificado.push(lead);
      } else if (st.includes("contacto") || st.includes("contactado") || st.includes("tentativa")) {
        stages.em_contacto.push(lead);
      } else if (st.includes("rejeitado") || st.includes("cancelado") || st.includes("desqualificado")) {
        stages.desqualificado.push(lead);
      } else {
        stages.entrada.push(lead);
      }
    });

    return stages;
  }, [filteredLeads]);

  // Overall KPI metrics
  const totalCount = filteredLeads.length;
  const qualificadosCount =
    pipelineStages.qualificado.length +
    pipelineStages.transferido.length +
    pipelineStages.vendido.length;
  const validationRate = totalCount > 0 ? Math.round((qualificadosCount / totalCount) * 100) : 0;
  const vendidosCount = pipelineStages.vendido.length;
  const totalVendidoRevenue = pipelineStages.vendido.reduce((acc, l) => acc + getLeadPrice(l), 0);
  const salesConversionRate = totalCount > 0 ? Math.round((vendidosCount / totalCount) * 100) : 0;

  const handleCopyPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLeadScore = (lead: any) => {
    let score = 50;
    if (lead.phone && lead.phone.length >= 9) score += 15;
    if (lead.province) score += 10;
    if (lead.area || lead.address) score += 10;
    if (lead.status && (lead.status === "Vendido" || lead.status.includes("Vendido"))) score += 25;
    else if (lead.status && lead.status.includes("Reservado")) score += 15;
    else if (lead.status && (lead.status === "Transferido" || lead.status === "Em Vendas")) score += 20;
    return Math.min(100, score);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              Funil de Validação de Leads
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              CRM Valida C
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Qualifique os contactos de landing pages e transfira leads prontos para o fecho comercial.
          </p>
        </div>

        {/* View Toggle & Action Controls */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns3 size={14} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon size={14} />
              <span>Tabela</span>
            </button>
          </div>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Exportar dados para CSV ou PDF da Meta"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Leads</span>
            <Flame size={16} className="text-indigo-400" />
          </div>
          <p className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {totalCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Registos no funil</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa de Validação</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {validationRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{qualificadosCount} leads qualificados</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Em Negociação</span>
            <UserCheck size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">
            {pipelineStages.transferido.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Handoff para fecho</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-emerald-950/30 border-emerald-500/40" : "bg-emerald-50/70 border-emerald-300 shadow-xs"}`}>
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Leads Vendidos</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {vendidosCount}
          </p>
          <p className="text-[11px] text-emerald-500/80 font-bold mt-1">{salesConversionRate}% conversão final</p>
        </div>

        <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 ${isDark ? "bg-emerald-950/20 border-emerald-500/30" : "bg-white border-emerald-200 shadow-xs"}`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Faturado Validado</span>
            <CheckCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 truncate">
            {formatKz(totalVendidoRevenue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Purchase Sincronizado Meta
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex-1 min-w-[240px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, WhatsApp (+244), município ou província..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
            }`}
          />
        </div>

        {/* Product / Landing Page filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={selectedProductFilter}
            onChange={(e) => onSelectProductFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none transition cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="Todos">Todos os Produtos / Páginas</option>
            {availableProducts.map((p) => (
              <option key={p} value={p}>
                {formatPageNameWithCensorship(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PIPELINE KANBAN VIEW */}
      {viewMode === "kanban" ? (
        <div className="space-y-2">
          {/* Helpful Drag & Drop Hint Banner */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Move size={13} className="text-indigo-400 shrink-0" />
              <span>
                <strong>Dica:</strong> Você pode <strong>arrastar e soltar</strong> qualquer card diretamente entre as colunas para alterar o estágio do lead ou usar os botões de ação rápida.
              </span>
            </span>
            {draggedLeadId && (
              <span className="text-[11px] font-bold text-amber-300 animate-pulse hidden sm:inline">
                Solte na coluna desejada...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
            {/* Column 1: Entrada / Novos */}
            <div
              onDragOver={(e) => handleDragOver(e, "entrada")}
              onDragLeave={(e) => handleDragLeave(e, "entrada")}
              onDrop={(e) => handleDrop(e, "Pendente")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "entrada"
                  ? "ring-2 ring-amber-400 bg-amber-500/10 border-amber-400/80 scale-[1.01]"
                  : isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    1. Entrada
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300">
                  {pipelineStages.entrada.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.entrada.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "entrada"
                      ? "border-amber-400/60 text-amber-300 bg-amber-400/5 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "entrada" ? "Soltar aqui p/ Entrada" : "Nenhum lead nesta etapa"}
                  </div>
                ) : (
                  pipelineStages.entrada.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      onAdvanceStatus={() => onUpdateStatus(lead.id, "Em Contacto")}
                      advanceLabel="Iniciar Contacto"
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Em Contacto */}
            <div
              onDragOver={(e) => handleDragOver(e, "em_contacto")}
              onDragLeave={(e) => handleDragLeave(e, "em_contacto")}
              onDrop={(e) => handleDrop(e, "Em Contacto")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "em_contacto"
                  ? "ring-2 ring-blue-400 bg-blue-500/10 border-blue-400/80 scale-[1.01]"
                  : isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    2. Contacto
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300">
                  {pipelineStages.em_contacto.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.em_contacto.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "em_contacto"
                      ? "border-blue-400/60 text-blue-300 bg-blue-400/5 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "em_contacto" ? "Soltar aqui p/ Contacto" : "Nenhum lead em atendimento"}
                  </div>
                ) : (
                  pipelineStages.em_contacto.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      onAdvanceStatus={() => onUpdateStatus(lead.id, "Reservado")}
                      advanceLabel="Qualificar Lead"
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Qualificados / Validados */}
            <div
              onDragOver={(e) => handleDragOver(e, "qualificado")}
              onDragLeave={(e) => handleDragLeave(e, "qualificado")}
              onDrop={(e) => handleDrop(e, "Reservado")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "qualificado"
                  ? "ring-2 ring-emerald-400 bg-emerald-500/10 border-emerald-400/80 scale-[1.01]"
                  : isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    3. Qualificados
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                  {pipelineStages.qualificado.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.qualificado.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "qualificado"
                      ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/5 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "qualificado" ? "Soltar aqui p/ Qualificado" : "Nenhum lead qualificado"}
                  </div>
                ) : (
                  pipelineStages.qualificado.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      onAdvanceStatus={() => onUpdateStatus(lead.id, "Transferido")}
                      advanceLabel="Handoff Vendas"
                      highlightAdvance
                      onMarkSold={() => onUpdateStatus(lead.id, "Vendido")}
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 4: Transferido para Vendas */}
            <div
              onDragOver={(e) => handleDragOver(e, "transferido")}
              onDragLeave={(e) => handleDragLeave(e, "transferido")}
              onDrop={(e) => handleDrop(e, "Transferido")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "transferido"
                  ? "ring-2 ring-indigo-400 bg-indigo-500/10 border-indigo-400/80 scale-[1.01]"
                  : isDark
                  ? "bg-indigo-950/20 border-indigo-800/40"
                  : "bg-indigo-50/50 border-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    4. Em Vendas
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                  {pipelineStages.transferido.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.transferido.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "transferido"
                      ? "border-indigo-400/60 text-indigo-300 bg-indigo-400/5 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "transferido" ? "Soltar aqui p/ Em Vendas" : "Nenhum lead em vendas"}
                  </div>
                ) : (
                  pipelineStages.transferido.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      onAdvanceStatus={() => onUpdateStatus(lead.id, "Vendido")}
                      advanceLabel="🏆 Marcar Vendido"
                      highlightAdvance
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 5: Vendido (Purchase Meta) */}
            <div
              onDragOver={(e) => handleDragOver(e, "vendido")}
              onDragLeave={(e) => handleDragLeave(e, "vendido")}
              onDrop={(e) => handleDrop(e, "Vendido")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "vendido"
                  ? "ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400 shadow-xl scale-[1.01]"
                  : isDark
                  ? "bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                  : "bg-emerald-50/80 border-emerald-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    5. Vendidos
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                  {pipelineStages.vendido.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.vendido.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "vendido"
                      ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/10 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "vendido" ? "Soltar aqui p/ REGISTRAR VENDA" : "Nenhuma venda registrada ainda"}
                  </div>
                ) : (
                  pipelineStages.vendido.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      isSold={true}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 6: Desqualificados */}
            <div
              onDragOver={(e) => handleDragOver(e, "desqualificado")}
              onDragLeave={(e) => handleDragLeave(e, "desqualificado")}
              onDrop={(e) => handleDrop(e, "Cancelado")}
              className={`rounded-2xl border p-3 space-y-3 transition-all duration-200 ${
                dragOverColumn === "desqualificado"
                  ? "ring-2 ring-red-400 bg-red-500/10 border-red-400/80 scale-[1.01]"
                  : isDark
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-slate-100/50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    6. Desqualif.
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400">
                  {pipelineStages.desqualificado.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                {pipelineStages.desqualificado.length === 0 ? (
                  <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                    dragOverColumn === "desqualificado"
                      ? "border-red-400/60 text-red-300 bg-red-400/5 font-bold"
                      : "border-slate-800 text-slate-500"
                  }`}>
                    {dragOverColumn === "desqualificado" ? "Soltar aqui p/ Desqualificar" : "Nenhum lead desqualificado"}
                  </div>
                ) : (
                  pipelineStages.desqualificado.map((lead) => (
                    <LeadKanbanCard
                      key={lead.id}
                      lead={lead}
                      isDark={isDark}
                      hidePhones={hidePhones}
                      formatPhoneWithCensorship={formatPhoneWithCensorship}
                      formatPageNameWithCensorship={formatPageNameWithCensorship}
                      onOpenLeadDetail={onOpenLeadDetail}
                      onTriggerWhatsApp={onTriggerWhatsApp}
                      onAdvanceStatus={() => onUpdateStatus(lead.id, "Pendente")}
                      advanceLabel="Reativar Lead"
                      formatKz={formatKz}
                      score={getLeadScore(lead)}
                      isDragging={draggedLeadId === String(lead.id)}
                      onDragStart={(e) => handleDragStart(e, String(lead.id))}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[11px] font-black uppercase tracking-wider border-b ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Província / Município</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Estágio</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onOpenLeadDetail(lead)}
                    className={`transition cursor-pointer ${isDark ? "hover:bg-slate-800/50 text-slate-200" : "hover:bg-slate-50 text-slate-800"}`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString("pt-AO") : "N/A"}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <div>{lead.name || "Sem Nome"}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {hidePhones ? formatPhoneWithCensorship(lead.phone || "") : lead.phone || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {formatPageNameWithCensorship(lead.produto || "Secador UV")}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {lead.area || lead.address || "Centro"}, {lead.province || "Luanda"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {getLeadScore(lead)}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.status === "Vendido" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                          <Trophy size={11} className="text-amber-400" />
                          <span>Vendido · {formatKz(getLeadPrice(lead))}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          {lead.status || "Pendente"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {lead.status !== "Vendido" && (
                          <button
                            onClick={() => onUpdateStatus(lead.id, "Vendido")}
                            className="py-1 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-black transition flex items-center gap-1 cursor-pointer"
                            title="Marcar como Vendido e disparar Purchase na Meta"
                          >
                            <Trophy size={11} className="text-amber-400" />
                            <span className="hidden sm:inline">Vendido</span>
                          </button>
                        )}
                        <button
                          onClick={() => onTriggerWhatsApp(lead, "reserva")}
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => onOpenLeadDetail(lead)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                          title="Ver Ficha 360°"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Individual Lead Card inside Kanban Board
interface LeadKanbanCardProps {
  lead: any;
  isDark: boolean;
  isSold?: boolean;
  hidePhones?: boolean;
  formatPhoneWithCensorship: (p: string) => string;
  formatPageNameWithCensorship: (p: string) => string;
  onOpenLeadDetail: (lead: any) => void;
  onTriggerWhatsApp: (lead: any, type: "reserva" | "entrega" | "pendente" | "stock") => void;
  onAdvanceStatus?: () => void;
  advanceLabel?: string;
  highlightAdvance?: boolean;
  onMarkSold?: () => void;
  formatKz?: (val: number) => string;
  score: number;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const LeadKanbanCard: React.FC<LeadKanbanCardProps> = ({
  lead,
  isDark,
  isSold,
  hidePhones,
  formatPhoneWithCensorship,
  formatPageNameWithCensorship,
  onOpenLeadDetail,
  onTriggerWhatsApp,
  onAdvanceStatus,
  advanceLabel,
  highlightAdvance,
  onMarkSold,
  formatKz,
  score,
  isDragging,
  onDragStart,
  onDragEnd,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone) return;
    navigator.clipboard.writeText(lead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leadPrice = getLeadPrice(lead);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpenLeadDetail(lead)}
      className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-indigo-400 ring-2 ring-indigo-400/50"
          : isSold
          ? isDark
            ? "bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400"
            : "bg-emerald-50 border-emerald-300 hover:border-emerald-500"
          : isDark
          ? "bg-slate-800/90 border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800"
          : "bg-white border-slate-200 hover:border-indigo-500/50"
      }`}
    >
      {/* Visual drag grip indicator */}
      <div className="absolute top-2.5 right-2 opacity-30 group-hover:opacity-100 transition text-slate-400 hover:text-indigo-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      {/* Top Card Row */}
      <div className="flex items-start justify-between gap-2 mb-1.5 pr-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black truncate text-slate-100 group-hover:text-indigo-300 transition" title={lead.name}>
            {lead.name || "Lead Sem Nome"}
          </h4>
          {isSold ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60 mt-0.5">
              <Trophy size={10} className="text-amber-400" /> Purchase Meta
            </span>
          ) : (
            <span className="text-[10.5px] font-semibold text-slate-400">
              {formatKz ? formatKz(leadPrice) : ""}
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          {isSold ? (
            <span className="text-xs font-black text-emerald-400 block">
              {formatKz ? formatKz(leadPrice) : ""}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300">
              {score} pts
            </span>
          )}
        </div>
      </div>

      {/* Phone / WhatsApp */}
      <div className="flex items-center justify-between gap-1 text-[11.5px] text-slate-300 mb-1.5">
        <span className="truncate font-mono">
          {hidePhones ? formatPhoneWithCensorship(lead.phone || "") : lead.phone || "Sem contacto"}
        </span>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Copiar número"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <button
            onClick={() => onTriggerWhatsApp(lead, "reserva")}
            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
            title="Abrir WhatsApp"
          >
            <MessageSquare size={12} />
          </button>
        </div>
      </div>

      {/* Location & Product Badges */}
      <div className="space-y-1 text-[10.5px] text-slate-400 border-t border-slate-700/40 pt-1.5 mb-2">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin size={12} className="shrink-0 text-blue-400" />
          <span className="truncate">{lead.area || lead.address || "Centro"}, {lead.province || "Luanda"}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Package size={12} className="shrink-0 text-purple-400" />
          <span className="truncate">{formatPageNameWithCensorship(lead.produto || "Secador UV")}</span>
        </div>
      </div>

      {/* Advance Action Button */}
      {onAdvanceStatus && advanceLabel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdvanceStatus();
          }}
          className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            highlightAdvance
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-black"
              : "bg-slate-700 hover:bg-slate-600 text-slate-200"
          }`}
        >
          <span>{advanceLabel}</span>
          <ArrowRight size={11} />
        </button>
      )}

      {/* Quick Mark as Sold button */}
      {onMarkSold && !isSold && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkSold();
          }}
          className="w-full mt-1.5 py-1 px-2 rounded-lg text-[9px] font-black bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition flex items-center justify-center gap-1 cursor-pointer"
          title="Marcar como Vendido e disparar Purchase na Meta"
        >
          <Trophy size={10} className="text-amber-400" />
          <span>Marcar como Vendido</span>
        </button>
      )}
    </div>
  );
};
