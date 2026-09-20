import React from "react";
import {
  FileText,
  Sparkles,
  Share2,
  Calculator,
  Eye,
  EyeOff,
  Download,
  Users
} from "lucide-react";

export type AdminSubViewType = "leads" | "prospeccao" | "meta" | "calculadora";

interface AdminSubNavProps {
  currentSubView: AdminSubViewType;
  onNavigateSubView: (subView: AdminSubViewType) => void;
  hidePhones?: boolean;
  onToggleHidePhones?: () => void;
  onOpenExport?: () => void;
  leadsCount?: number;
}

export const AdminSubNav: React.FC<AdminSubNavProps> = ({
  currentSubView,
  onNavigateSubView,
  hidePhones,
  onToggleHidePhones,
  onOpenExport,
  leadsCount,
}) => {
  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2 mb-6 shadow-xl sticky top-16 z-30 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Modern CRM Navigation Tabs */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 1. Validação de Leads */}
          <button
            onClick={() => onNavigateSubView("leads")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "leads"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <FileText size={15} />
            <span>Validação de Leads</span>
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

          {/* 2. Prospecção Inteligente IA */}
          <button
            onClick={() => onNavigateSubView("prospeccao")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "prospeccao"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Sparkles size={15} className="text-amber-300" />
            <span>Prospecção com IA</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/30">
              NOVO
            </span>
          </button>

          {/* 3. Conexão Meta Oficial */}
          <button
            onClick={() => onNavigateSubView("meta")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentSubView === "meta"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Share2 size={15} />
            <span>Conexão Meta (Oficial)</span>
          </button>

          {/* 4. Calculadora */}
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
              title="Exportar dados para CSV (Excel / Google Sheets)"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
