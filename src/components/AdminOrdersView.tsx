import React, { useState, useMemo } from "react";
import {
  PackageCheck,
  FileText,
  Store,
  Calculator,
  Search,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Copy,
  MessageCircle,
  Eye,
  Trash2,
  Filter,
  EyeOff,
  Check,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  ArrowUpDown,
  ShoppingBag,
  Send,
} from "lucide-react";

interface AdminOrdersViewProps {
  isDark: boolean;
  adminData: any[];
  onNavigateSubView: (subView: "leads" | "encomendas" | "financeiro" | "calculadora") => void;
  updateLeadStatus: (leadId: string, newStatus: string) => Promise<void> | void;
  onDeleteLead: (lead: any) => void;
  formatKz: (val: number) => string;
  formatPhoneWithCensorship: (phone: string) => string;
  formatPageNameWithCensorship: (name: string) => string;
  isStockLead: (lead: any) => boolean;
  getCleanObservacoes: (lead: any) => string;
  getLeadPrice: (lead: any) => number;
  normalizeProductName: (name: string) => string;
  hidePhones: boolean;
  setHidePhones: React.Dispatch<React.SetStateAction<boolean>>;
  handleWhatsAppStockOrder: (lead: any) => void;
  openLeadDetailModal: (lead: any) => void;
  toggleLeadDoubleCheck: (leadId: string, currentValOrLevel?: any) => Promise<void> | void;
  selectedLeadIds: string[];
  setSelectedLeadIds: React.Dispatch<React.SetStateAction<string[]>>;
  isSelectionModeActive: boolean;
  setIsSelectionModeActive: React.Dispatch<React.SetStateAction<boolean>>;
  setModalState: React.Dispatch<React.SetStateAction<any>>;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  isDark,
  adminData,
  onNavigateSubView,
  updateLeadStatus,
  onDeleteLead,
  formatKz,
  formatPhoneWithCensorship,
  formatPageNameWithCensorship,
  isStockLead,
  getCleanObservacoes,
  getLeadPrice,
  normalizeProductName,
  hidePhones,
  setHidePhones,
  handleWhatsAppStockOrder,
  openLeadDetailModal,
  toggleLeadDoubleCheck,
  selectedLeadIds,
  setSelectedLeadIds,
  isSelectionModeActive,
  setIsSelectionModeActive,
  setModalState,
}) => {
  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Identify all order records
  const allOrders = useMemo(() => {
    return adminData.filter((lead) => {
      const isStock = isStockLead(lead);
      const hasDelivery = !!lead.deliveryDate || !!lead.deliveryPeriod;
      const isSecadorExpresso =
        normalizeProductName(lead?.produto || "") === "Secador Expresso Pro";
      const isConfirmed =
        lead.status &&
        (lead.status.includes("Reservado") ||
          lead.status === "Entregue" ||
          lead.status === "Pago" ||
          lead.status === "A Caminho" ||
          lead.status === "Em Trânsito");

      return isStock || hasDelivery || isSecadorExpresso || isConfirmed;
    });
  }, [adminData, isStockLead, normalizeProductName]);

  // Unique products among orders
  const uniqueOrderProducts = useMemo(() => {
    const set = new Set<string>();
    allOrders.forEach((o) => {
      const p = normalizeProductName(o?.produto || "Produto");
      if (p) set.add(p);
    });
    return Array.from(set);
  }, [allOrders, normalizeProductName]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        (order.name && order.name.toLowerCase().includes(search)) ||
        (order.phone && order.phone.includes(search)) ||
        (order.address && order.address.toLowerCase().includes(search)) ||
        (order.area && order.area.toLowerCase().includes(search)) ||
        (order.province && order.province.toLowerCase().includes(search));

      // Status
      let matchesStatus = true;
      if (statusFilter === "pending") {
        matchesStatus = order.status === "Pendente" || !order.status;
      } else if (statusFilter === "scheduled") {
        matchesStatus =
          order.status?.includes("Reservado") ||
          order.status === "A Caminho" ||
          order.status === "Em Trânsito";
      } else if (statusFilter === "completed") {
        matchesStatus = order.status === "Entregue" || order.status === "Pago";
      } else if (statusFilter === "cancelled") {
        matchesStatus =
          order.status === "Cancelado" ||
          order.status === "Rejeitado" ||
          order.status === "Tentativa Falhada";
      } else if (statusFilter !== "all") {
        matchesStatus = order.status === statusFilter;
      }

      // Product
      const matchesProduct =
        productFilter === "all" ||
        normalizeProductName(order?.produto || "") === productFilter;

      // Period
      const matchesPeriod =
        periodFilter === "all" ||
        (order.deliveryPeriod && order.deliveryPeriod.includes(periodFilter));

      // Date
      let matchesDate = true;
      if (dateFilter !== "") {
        const orderDate =
          order.deliveryDate ||
          (order.timestamp ? new Date(order.timestamp).toISOString().split("T")[0] : "");
        matchesDate = orderDate === dateFilter;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProduct &&
        matchesPeriod &&
        matchesDate
      );
    });
  }, [allOrders, searchTerm, statusFilter, productFilter, periodFilter, dateFilter, normalizeProductName]);

  // Pagination
  const itemsPerPage = 30;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);
  }, [filteredOrders, validPage, itemsPerPage]);

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = allOrders.length;
    const pendingCount = allOrders.filter(
      (o) => o.status === "Pendente" || !o.status,
    ).length;
    const scheduledCount = allOrders.filter(
      (o) =>
        o.status?.includes("Reservado") ||
        o.status === "A Caminho" ||
        o.status === "Em Trânsito",
    ).length;
    const deliveredCount = allOrders.filter(
      (o) => o.status === "Entregue" || o.status === "Pago",
    ).length;
    const cancelledCount = allOrders.filter(
      (o) =>
        o.status === "Cancelado" ||
        o.status === "Rejeitado" ||
        o.status === "Tentativa Falhada",
    ).length;

    const totalRevenue = allOrders
      .filter((o) => o.status === "Entregue" || o.status === "Pago")
      .reduce((acc, o) => acc + getLeadPrice(o), 0);

    const projectedRevenue = allOrders
      .filter((o) => o.status !== "Cancelado" && o.status !== "Rejeitado" && o.status !== "Tentativa Falhada")
      .reduce((acc, o) => acc + getLeadPrice(o), 0);

    return {
      totalCount,
      pendingCount,
      scheduledCount,
      deliveredCount,
      cancelledCount,
      totalRevenue,
      projectedRevenue,
    };
  }, [allOrders, getLeadPrice]);

  // Copy order info for delivery courier (Estafeta)
  const copyForEstafeta = (order: any) => {
    const name = order?.name || "Cliente";
    const phone = order?.phone || "N/A";
    const address = [order?.area || order?.address, order?.province || "Luanda"].filter(Boolean).join(", ");
    const product = normalizeProductName(order?.produto || order?.product || "Produto");
    const qty = Number(order?.quantity) || Number(order?.qtd) || 1;
    const total = formatKz(getLeadPrice(order));
    const date = order?.deliveryDate
      ? order.deliveryDate.includes("-")
        ? order.deliveryDate.split("-").reverse().join("/")
        : order.deliveryDate
      : "A combinar";
    const period = order?.deliveryPeriod ? order.deliveryPeriod.split(" (")[0] : "Manhã (08:00 às 12:00)";
    const obs = getCleanObservacoes(order);

    const text = `📦 ORDEM DE ENTREGA - C STORE ANGOLA

Cliente: ${name}
Contacto: ${phone}
Endereço: ${address}
Produto: ${product} (${qty}x)
Total a Cobrar: ${total} (pagamento na entrega)
Data Agendada: ${date}
Período: ${period}${obs ? `\nObs: ${obs}` : ""}`;

    navigator.clipboard.writeText(text);
    showToast("Guia de entrega copiada para a área de transferência!");
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeadIds.length === 0) return;
    for (const id of selectedLeadIds) {
      await updateLeadStatus(id, newStatus);
    }
    setSelectedLeadIds([]);
    setIsSelectionModeActive(false);
    showToast(`${selectedLeadIds.length} encomendas atualizadas para "${newStatus}"!`);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-400/40 animate-bounce">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION TAB BAR */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-1.5 w-full shadow-xl flex-wrap justify-between items-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onNavigateSubView("leads")}
            className="px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <FileText size={16} />
            <span>📄 Painel de Leads (Testes)</span>
          </button>
          <button
            onClick={() => onNavigateSubView("encomendas")}
            className="px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
          >
            <PackageCheck size={16} />
            <span>
              📦 Gestão de Encomendas (
              <span className="text-cyan-200">{metrics.totalCount}</span>)
            </span>
          </button>
          <button
            onClick={() => onNavigateSubView("financeiro")}
            className="px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Store size={16} />
            <span>📊 Painel Financeiro</span>
          </button>
          <button
            onClick={() => onNavigateSubView("calculadora")}
            className="px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer text-amber-400 hover:text-amber-300 hover:bg-slate-800"
          >
            <Calculator size={16} />
            <span>🧮 Calculadora de Saldos</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => setHidePhones((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
              hidePhones
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            {hidePhones ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{hidePhones ? "Telefones Ocultos" : "Mostrar Telefones"}</span>
          </button>
        </div>
      </div>

      {/* SECTION HEADER & TITLE */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <PackageCheck size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Gestão de Encomendas & Entregas
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Acompanhamento operacional de pedidos prontos para entrega, estafetas e cobranças
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateSubView("leads")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <FileText size={14} className="text-indigo-400" />
            <span>Ir para Leads de Teste</span>
          </button>
        </div>
      </div>

      {/* KEY ORDER METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-blue-950/50 border-blue-500/50 ring-2 ring-blue-500/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Encomendas</span>
            <PackageCheck size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Est: <span className="text-blue-400 font-bold">{formatKz(metrics.projectedRevenue)}</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-950/50 border-amber-500/50 ring-2 ring-amber-500/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>A Preparar / Novas</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics.pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Aguardam despacho</div>
        </div>

        <div
          onClick={() => setStatusFilter("scheduled")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "scheduled"
              ? "bg-cyan-950/50 border-cyan-500/50 ring-2 ring-cyan-500/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Agendadas / Rota</span>
            <Truck size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{metrics.scheduledCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Com data ou em trânsito</div>
        </div>

        <div
          onClick={() => setStatusFilter("completed")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "completed"
              ? "bg-emerald-950/50 border-emerald-500/50 ring-2 ring-emerald-500/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Entregues & Pagas</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.deliveredCount}</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">
            {formatKz(metrics.totalRevenue)}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("cancelled")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "cancelled"
              ? "bg-red-950/50 border-red-500/50 ring-2 ring-red-500/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Canceladas / Falhas</span>
            <XCircle size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{metrics.cancelledCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Não concluídas</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone, bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            {/* Product Selector */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">📦 Todos os Produtos</option>
              {uniqueOrderProducts.map((p, idx) => (
                <option key={idx} value={p}>
                  {formatPageNameWithCensorship(p)}
                </option>
              ))}
            </select>

            {/* Delivery Period */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">🕒 Qualquer Período</option>
              <option value="Manhã">🌅 Manhã (08:00 - 12:00)</option>
              <option value="Tarde">☀️ Tarde (13:00 - 17:00)</option>
            </select>

            {/* Delivery Date */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              title="Filtrar por data de entrega agendada"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Todas as Datas
              </button>
            )}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1 shrink-0">
            Status:
          </span>
          {[
            { id: "all", label: "Todas", count: allOrders.length },
            { id: "pending", label: "A Preparar (Novas)", count: metrics.pendingCount },
            { id: "scheduled", label: "Agendadas / Rota", count: metrics.scheduledCount },
            { id: "completed", label: "Entregues & Pagas", count: metrics.deliveredCount },
            { id: "cancelled", label: "Canceladas / Falhas", count: metrics.cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-indigo-950/80 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="font-black text-sm text-white flex items-center gap-2">
              <PackageCheck size={18} className="text-indigo-400" />
              {selectedLeadIds.length} encomendas selecionadas
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatusChange("A Caminho")}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Truck size={14} />
              <span>Marcar A Caminho</span>
            </button>
            <button
              onClick={() => handleBulkStatusChange("Entregue")}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={14} />
              <span>Marcar Entregue</span>
            </button>
            <button
              onClick={() => handleBulkStatusChange("Pago")}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign size={14} />
              <span>Marcar Pago</span>
            </button>
            <button
              onClick={() => setModalState("delete-bulk-confirm")}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Eliminar ({selectedLeadIds.length})</span>
            </button>
            <button
              onClick={() => {
                setSelectedLeadIds([]);
                setIsSelectionModeActive(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ORDERS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <PackageOpen size={48} className="mx-auto text-slate-600" />
            <p className="font-bold text-lg text-white">Nenhuma encomenda encontrada</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Não existem pedidos correspondentes aos filtros atuais. Tente ajustar os filtros ou pesquisar por outro termo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px] pb-48">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={
                        paginatedOrders.length > 0 &&
                        paginatedOrders.every((o) => selectedLeadIds.includes(o.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const pageIds = paginatedOrders.map((o) => o.id);
                          setSelectedLeadIds(
                            Array.from(new Set([...selectedLeadIds, ...pageIds])),
                          );
                        } else {
                          const pageIds = new Set(paginatedOrders.map((o) => o.id));
                          setSelectedLeadIds(
                            selectedLeadIds.filter((id) => !pageIds.has(id)),
                          );
                        }
                      }}
                      title="Selecionar visíveis"
                    />
                  </th>
                  <th className="px-5 py-4">Data & Entrega</th>
                  <th className="px-5 py-4">Cliente / Contacto</th>
                  <th className="px-5 py-4">Endereço de Entrega</th>
                  <th className="px-5 py-4">Produto & Quantidade</th>
                  <th className="px-5 py-4">Total a Cobrar</th>
                  <th className="px-5 py-4">Status da Encomenda</th>
                  <th className="px-5 py-4 text-center">Verificação</th>
                  <th className="px-5 py-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900 text-sm">
                {paginatedOrders.map((order) => {
                  const isSelected = selectedLeadIds.includes(order.id);
                  const totalPrice = getLeadPrice(order);
                  const cleanObs = getCleanObservacoes(order);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors border-b ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-900/50"
                          : "hover:bg-slate-800/50 border-slate-800/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds([...selectedLeadIds, order.id]);
                            } else {
                              setSelectedLeadIds(
                                selectedLeadIds.filter((id) => id !== order.id),
                              );
                            }
                          }}
                        />
                      </td>

                      {/* Delivery Date & Time Window */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {order.deliveryDate ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-cyan-300 font-bold text-xs w-max">
                              <Calendar size={13} />
                              <span>
                                {order.deliveryDate.includes("-")
                                  ? order.deliveryDate.split("-").reverse().join("/")
                                  : order.deliveryDate}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              📅 A Combinar
                            </span>
                          )}
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                            <Clock size={12} className="text-slate-500" />
                            <span>
                              {order.deliveryPeriod
                                ? order.deliveryPeriod.split(" (")[0]
                                : "Manhã"}
                            </span>
                          </div>
                          {order.timestamp && (
                            <div className="text-[10px] text-slate-500">
                              Pedido: {new Date(order.timestamp).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-black text-white text-sm">
                          {order.name || "Cliente Sem Nome"}
                        </div>
                        <div className="flex items-center gap-2 mt-1 font-mono text-xs text-slate-300">
                          <Phone size={12} className="text-slate-400" />
                          <span>{formatPhoneWithCensorship(order.phone)}</span>
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="flex items-start gap-1.5 text-xs text-slate-300">
                          <MapPin size={14} className="text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-white">
                              {order.area || order.address || "Endereço não informado"}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {order.province || "Luanda"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Product & Qty */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>
                            {formatPageNameWithCensorship(
                              order.produto || order.product || "Secador Expresso Pro",
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-extrabold text-blue-400">
                            Qtd: {order.quantity || 1}
                          </span>
                          {cleanObs && (
                            <span
                              className="text-[11px] text-slate-400 truncate max-w-[140px]"
                              title={cleanObs}
                            >
                              • {cleanObs}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-black text-emerald-400 text-sm">
                          {formatKz(totalPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500">na entrega</div>
                      </td>

                      {/* Status Selector */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={order.status || "Pendente"}
                          onChange={(e) => updateLeadStatus(order.id, e.target.value)}
                          className={`text-xs font-black rounded-xl px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                            order.status?.includes("Reservado")
                              ? "bg-blue-500/20 text-cyan-300 border-blue-500/40"
                              : order.status === "A Caminho" || order.status === "Em Trânsito"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : order.status === "Entregue"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : order.status === "Pago"
                                    ? "bg-green-500/20 text-green-300 border-green-500/40"
                                    : order.status === "Cancelado" || order.status === "Rejeitado" || order.status === "Tentativa Falhada"
                                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <option value="Pendente" className="bg-slate-900 text-slate-200">
                            ⏳ Pendente / A Preparar
                          </option>
                          <option value="Reservado" className="bg-slate-900 text-cyan-300">
                            📅 Reservado / Agendado
                          </option>
                          <option value="A Caminho" className="bg-slate-900 text-amber-300">
                            🚚 A Caminho / Em Rota
                          </option>
                          <option value="Entregue" className="bg-slate-900 text-emerald-300">
                            ✅ Entregue
                          </option>
                          <option value="Pago" className="bg-slate-900 text-green-300">
                            💰 Pago
                          </option>
                          <option value="Tentativa Falhada" className="bg-slate-900 text-amber-400">
                            ⚠️ Tentativa Falhada
                          </option>
                          <option value="Cancelado" className="bg-slate-900 text-red-400">
                            ❌ Cancelado
                          </option>
                        </select>
                      </td>

                      {/* Verification (Double Check) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => toggleLeadDoubleCheck(order.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer inline-flex items-center justify-center ${
                            order.verificationLevel === 2 || order.doubleCheck || order.verified2x
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : order.verificationLevel === 1 || order.verified1x
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300"
                          }`}
                          title="Clique para alternar o nível de confirmação (1x / 2x)"
                        >
                          {order.verificationLevel === 2 || order.doubleCheck || order.verified2x ? (
                            <CheckCheck size={16} />
                          ) : order.verificationLevel === 1 || order.verified1x ? (
                            <Check size={16} />
                          ) : (
                            <Check size={16} className="opacity-40" />
                          )}
                        </button>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy for courier / estafeta */}
                          <button
                            onClick={() => copyForEstafeta(order)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Copiar dados da encomenda para enviar ao Estafeta"
                          >
                            <Copy size={14} className="text-indigo-400" />
                          </button>

                          {/* WhatsApp confirmation */}
                          <button
                            onClick={() => handleWhatsAppStockOrder(order)}
                            className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/40 transition cursor-pointer"
                            title="Enviar confirmação de encomenda via WhatsApp para o cliente"
                          >
                            <MessageCircle size={14} />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => openLeadDetailModal(order)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Visualizar detalhes completos"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteLead(order)}
                            className="p-2 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800/40 transition cursor-pointer"
                            title="Eliminar encomenda"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              A mostrar {paginatedOrders.length} de {filteredOrders.length} encomendas
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white rounded-xl transition cursor-pointer"
              >
                Anterior
              </button>
              <span className="font-bold text-white">
                Página {validPage} de {totalPages}
              </span>
              <button
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white rounded-xl transition cursor-pointer"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
