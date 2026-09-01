import React from "react";
import { FileText, PackageCheck, Store, Calculator, Eye, EyeOff, Download } from "lucide-react";

interface AdminSubNavProps {
  currentSubView: "leads" | "encomendas" | "financeiro" | "calculadora";
  onNavigateSubView: (subView: "leads" | "encomendas" | "financeiro" | "calculadora") => void;
  hidePhones?: boolean;
  onToggleHidePhones?: () => void;
  onOpenExport?: () => void;
  leadsCount?: number;
  ordersCount?: number;
}

export const AdminSubNav: React.FC<AdminSubNavProps> = ({
  currentSubView,
  onNavigateSubView,
  hidePhones,
  onToggleHidePhones,
  onOpenExport,
  leadsCount,
  ordersCount,
}) => {
  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2 mb-6 shadow-xl sticky top-16 z-30 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Sub-view navigation tabs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onNavigateSubView("leads")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "leads"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <FileText size={15} />
            <span>Leads</span>
            {typeof leadsCount === "number" && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  currentSubView === "leads" ? "bg-indigo-700 text-indigo-100" : "bg-slate-800 text-slate-400"
                }`}
              >
                {leadsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigateSubView("encomendas")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "encomendas"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <PackageCheck size={15} />
            <span>Encomendas</span>
            {typeof ordersCount === "number" && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  currentSubView === "encomendas" ? "bg-blue-700 text-blue-100" : "bg-slate-800 text-slate-400"
                }`}
              >
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigateSubView("financeiro")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "financeiro"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Store size={15} />
            <span>Financeiro</span>
          </button>

          <button
            onClick={() => onNavigateSubView("calculadora")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "calculadora"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Calculator size={15} />
            <span>Calculadora</span>
          </button>
        </div>

        {/* Quick Utilities (Hide Phones & Export) */}
        <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-800 pl-2">
          {onToggleHidePhones && (
            <button
              onClick={onToggleHidePhones}
              className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                hidePhones
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
              title={hidePhones ? "Mostrar Dados de Contacto" : "Censurar Dados de Contacto"}
            >
              {hidePhones ? <EyeOff size={15} /> : <Eye size={15} />}
              <span className="hidden sm:inline">{hidePhones ? "Censurado" : "Visível"}</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title="Exportar dados"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
