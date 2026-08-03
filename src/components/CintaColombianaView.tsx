import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  ChevronDown,
  Sparkles,
  Lock,
  ArrowRight,
  Heart,
  Truck,
  Award,
  Zap,
  PackageOpen,
  HelpCircle,
  Ruler,
  AlertCircle,
  Edit3,
  ThumbsUp,
  Flame,
  Star,
  RefreshCw,
  Loader2,
  Info,
  Check,
  Eye,
  UserCheck,
  Camera,
  X,
  Maximize2,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CintaColombianaViewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent, selectedColor?: string, selectedSize?: string) => void;
  isCheckoutVisible: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  leadCount: number;
  leadGoal: number;
}

const COLOR_OPTIONS = [
  {
    id: "nude",
    name: "Nude-Café",
    hex: "#d2b49c",
    image: "https://i.postimg.cc/tRknm8DP/NUDE-CAFE-1.jpg",
    gallery: [
      "https://i.postimg.cc/tRknm8DP/NUDE-CAFE-1.jpg",
      "https://i.postimg.cc/jqcnkBvH/n-UDE-CAFE-2.jpg"
    ],
    badge: "Mais Vendido"
  },
  {
    id: "black",
    name: "Preto Elegante",
    hex: "#1e1e1e",
    image: "https://i.postimg.cc/QNmKnvSp/Preto-elegante-1.jpg",
    gallery: [
      "https://i.postimg.cc/QNmKnvSp/Preto-elegante-1.jpg",
      "https://i.postimg.cc/3r10bz9C/Preto-elegante-2.jpg"
    ],
    badge: "Edição Clássica"
  }
];

const REAL_PHOTOS = [
  {
    id: "nude-1",
    url: "https://i.postimg.cc/tRknm8DP/NUDE-CAFE-1.jpg",
    title: "Modelo Nude-Café (Visão Frontal)",
    subtitle: "Ajuste perfeito de compressão no abdómen e quadril",
    color: "Nude-Café",
    badge: "Fotos Reais Nude"
  },
  {
    id: "nude-2",
    url: "https://i.postimg.cc/jqcnkBvH/n-UDE-CAFE-2.jpg",
    title: "Modelo Nude-Café (Visão Detalhada)",
    subtitle: "Renda antiderrapante na coxa e elevação de bumbum",
    color: "Nude-Café",
    badge: "Fotos Reais Nude"
  },
  {
    id: "black-1",
    url: "https://i.postimg.cc/QNmKnvSp/Preto-elegante-1.jpg",
    title: "Modelo Preto Elegante (Visão Frontal)",
    subtitle: "Modela e sustenta a postura sem achatar o bumbum",
    color: "Preto Elegante",
    badge: "Fotos Reais Preto"
  },
  {
    id: "black-2",
    url: "https://i.postimg.cc/3r10bz9C/Preto-elegante-2.jpg",
    title: "Modelo Preto Elegante (Visão Detalhada)",
    subtitle: "Modelação anatómica de alta compressão e conforto",
    color: "Preto Elegante",
    badge: "Fotos Reais Preto"
  },
  {
    id: "before-after",
    url: "https://i.postimg.cc/dQW3DC3p/Antes-e-depois-iamgem-extra.webp",
    title: "Resultado Comparativo: Antes vs Depois",
    subtitle: "Efeito imediato na silhueta e redução visual da cintura",
    color: "Nude-Café",
    badge: "Antes & Depois"
  }
];

const SIZE_OPTIONS = [
  { size: "XS", waist: "58 - 64 cm", hip: "80 - 86 cm", weight: "40 - 48 kg" },
  { size: "S", waist: "65 - 71 cm", hip: "87 - 93 cm", weight: "49 - 56 kg" },
  { size: "M", waist: "72 - 78 cm", hip: "94 - 100 cm", weight: "57 - 65 kg" },
  { size: "L", waist: "79 - 85 cm", hip: "101 - 107 cm", weight: "66 - 74 kg" },
  { size: "XL", waist: "86 - 92 cm", hip: "108 - 114 cm", weight: "75 - 83 kg" },
  { size: "2XL", waist: "93 - 99 cm", hip: "115 - 121 cm", weight: "84 - 92 kg" },
  { size: "3XL", waist: "100 - 106 cm", hip: "122 - 128 cm", weight: "93 - 101 kg" },
  { size: "4XL", waist: "107 - 113 cm", hip: "129 - 135 cm", weight: "102 - 110 kg" },
  { size: "5XL", waist: "114 - 120 cm", hip: "136 - 142 cm", weight: "111 - 120 kg" },
  { size: "6XL", waist: "121 - 128 cm", hip: "143 - 150 cm", weight: "121 - 132 kg" }
];

export const CintaColombianaView: React.FC<CintaColombianaViewProps> = ({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  isCheckoutVisible,
  timeLeft,
  formatTime,
  leadCount,
  leadGoal
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedHeroImage, setSelectedHeroImage] = useState<string | null>(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<typeof REAL_PHOTOS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"features" | "sizing" | "reviews">("features");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedMainSize, setSelectedMainSize] = useState("M");

  // Calculator states
  const [calcMode, setCalcMode] = useState<"weight" | "waist">("waist");
  const [calcWaist, setCalcWaist] = useState(74);
  const [calcWeight, setCalcWeight] = useState(62);

  const getRecommendedSize = () => {
    if (calcMode === "waist") {
      if (calcWaist <= 64) return "XS";
      if (calcWaist <= 71) return "S";
      if (calcWaist <= 78) return "M";
      if (calcWaist <= 85) return "L";
      if (calcWaist <= 92) return "XL";
      if (calcWaist <= 99) return "2XL";
      if (calcWaist <= 106) return "3XL";
      if (calcWaist <= 113) return "4XL";
      if (calcWaist <= 120) return "5XL";
      return "6XL";
    } else {
      if (calcWeight <= 48) return "XS";
      if (calcWeight <= 56) return "S";
      if (calcWeight <= 65) return "M";
      if (calcWeight <= 74) return "L";
      if (calcWeight <= 83) return "XL";
      if (calcWeight <= 92) return "2XL";
      if (calcWeight <= 101) return "3XL";
      if (calcWeight <= 110) return "4XL";
      if (calcWeight <= 120) return "5XL";
      return "6XL";
    }
  };

  // Multi-unit configuration state
  const [cintaConfigs, setCintaConfigs] = useState<Array<{ color: string; size: string }>>([
    { color: COLOR_OPTIONS[0].name, size: "M" },
    { color: COLOR_OPTIONS[1].name, size: "L" },
    { color: COLOR_OPTIONS[0].name, size: "XL" }
  ]);

  // Confirmation & Hesitation Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [showPersuasionStep1, setShowPersuasionStep1] = useState(false);
  const [showPersuasionStep2, setShowPersuasionStep2] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null);

  const checkoutRef = useRef<HTMLDivElement>(null);
  const sizeTableRef = useRef<HTMLDivElement>(null);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
    const input = document.getElementById("name-input-cinta");
    if (input) setTimeout(() => input.focus(), 600);
  };

  const handleEditInformation = () => {
    setShowConfirmModal(false);
    setShowObjectionModal(false);
    setShowPersuasionStep1(false);
    setShowPersuasionStep2(false);
    scrollToCheckout();
  };

  const scrollToSizeTable = () => {
    sizeTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateConfig = (index: number, field: "color" | "size", val: string) => {
    setCintaConfigs((prev) => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = { color: COLOR_OPTIONS[0].name, size: "M" };
      }
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const getCalculatedPrice = (qty: number) => {
    if (qty === 1) return 45000;
    if (qty === 2) return 80000; // Poupa 10.000 Kz
    if (qty === 3) return 110000; // Poupa 25.000 Kz
    return qty * 45000;
  };

  const getOldPrice = (qty: number) => {
    return qty * 100000;
  };

  const currentPrice = getCalculatedPrice(formData.quantity || 1);
  const oldPrice = getOldPrice(formData.quantity || 1);
  const totalSavings = oldPrice - currentPrice;

  const handleFormSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.area) {
      alert("Por favor, preencha o seu Nome, WhatsApp e Bairro/Zona em Luanda para continuar.");
      return;
    }
    handleFinalConfirmation(e);
  };

  const handleFinalConfirmation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowConfirmModal(false);
    setShowObjectionModal(false);
    setShowPersuasionStep1(false);
    setShowPersuasionStep2(false);

    const configString = Array.from({ length: formData.quantity || 1 })
      .map((_, i) => {
        const conf = cintaConfigs[i] || { color: COLOR_OPTIONS[0].name, size: selectedMainSize };
        return `Unidade ${i + 1}: ${conf.color} (${conf.size})`;
      })
      .join(" | ");

    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    onSubmit(syntheticEvent, configString, selectedMainSize);
  };

  return (
    <main className="bg-rose-50/30 text-slate-800 min-h-screen pb-24 font-sans select-none overflow-x-hidden">
      
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 text-rose-100 py-2.5 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-40 border-b border-rose-900/50 shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
        <span className="truncate">🔥 <strong>Lançamento em Luanda:</strong> Edição Limitada Pré-Venda com 50% OFF</span>
        <span className="bg-rose-600 text-white font-mono px-2 py-0.5 rounded text-xs font-bold tracking-wider shrink-0">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="px-4 pt-6 pb-12 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          
          {/* Visual Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-rose-100 group">
              <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 sm:gap-1.5">
                <Sparkles size={13} /> 50% OFF
              </span>

              <span className="absolute top-3 right-3 z-10 bg-slate-900/85 backdrop-blur-md text-amber-300 font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-400/30 flex items-center gap-1 shadow-md">
                <Star size={13} className="fill-amber-400 text-amber-400" /> 4.8 / 5
              </span>

              <div 
                onClick={() => {
                  const currentImgUrl = selectedHeroImage || COLOR_OPTIONS[selectedColorIndex].image;
                  const found = REAL_PHOTOS.find(p => p.url === currentImgUrl) || REAL_PHOTOS[0];
                  setActiveLightboxPhoto(found);
                }}
                className="cursor-zoom-in relative"
              >
                <motion.img
                  key={selectedHeroImage || selectedColorIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={selectedHeroImage || COLOR_OPTIONS[selectedColorIndex].image}
                  alt="Cinta Modeladora Colombiana Premium - Fotos Reais"
                  className="w-full h-[450px] sm:h-[520px] object-cover object-top hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-900/80 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 shadow-xl">
                    <Eye size={16} /> Clique para Ampliar Imagem Real
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-rose-100 shadow-lg flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <ShieldCheck size={18} className="text-rose-600" />
                  Compressão Firme & Tecido Fino
                </span>
                <span className="text-slate-500">GRS & Oeko-Tex 100</span>
              </div>
            </div>

            {/* Color Selectors */}
            <div className="grid grid-cols-2 gap-3">
              {COLOR_OPTIONS.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedColorIndex(idx);
                    setSelectedHeroImage(c.image);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left cursor-pointer ${
                    selectedColorIndex === idx
                      ? "border-rose-600 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-slate-300 shadow-inner shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] text-rose-600 font-medium">{c.badge}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Real Photos Thumbnails Strip */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-left flex items-center gap-1">
                <Camera size={14} className="text-rose-600" /> 📸 Fotos Reais do Produto e Modelo (5 Ângulos):
              </span>
              <div className="grid grid-cols-5 gap-2">
                {REAL_PHOTOS.map((photo) => {
                  const isSelected = (selectedHeroImage === photo.url) || (!selectedHeroImage && COLOR_OPTIONS[selectedColorIndex].image === photo.url);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setSelectedHeroImage(photo.url);
                        if (photo.color === "Preto Elegante") setSelectedColorIndex(1);
                        if (photo.color === "Nude-Café") setSelectedColorIndex(0);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all cursor-pointer ${
                        isSelected
                          ? "border-rose-600 ring-2 ring-rose-500/40 scale-105 shadow-md"
                          : "border-slate-200 opacity-80 hover:opacity-100 hover:border-rose-300"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover object-top"
                      />
                      {photo.id === "before-after" && (
                        <span className="absolute inset-x-0 bottom-0 bg-rose-900/90 text-white text-[8px] font-black py-0.5 text-center">
                          A/D
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Copy Hero */}
          <div className="w-full lg:w-1/2 space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-widest mb-3">
                <Flame size={14} className="text-rose-600" />
                Coleção Exclusiva Angola
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-tight tracking-tight">
                A cintura que você sempre soube que tinha.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium mt-3 leading-relaxed">
                Cinta Modeladora Colombiana Premium — realce imediato da silhueta, contorno firme do abdómen e elevação natural dos glúteos com conforto o dia inteiro.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xl space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">45.000 Kz</span>
                <span className="text-slate-400 line-through text-base font-semibold">100.000 Kz</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  Poupa 55.000 Kz
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                Sem pagamento antecipado — <strong>Pague 100% no ato da entrega em Luanda</strong>.
              </p>
            </div>

            {/* Illustrative Combo Offer Blocks (2 & 3 Units) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-600 fill-rose-600" /> KITS PROMOCIONAIS COM DESCONTO:
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Economia Extra
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 2 Units Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, quantity: 2 }));
                    scrollToCheckout();
                  }}
                  className={`group relative bg-gradient-to-b from-rose-50/90 to-white p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between shadow-xs ${
                    formData.quantity === 2
                      ? "border-rose-600 ring-2 ring-rose-500/20 shadow-md bg-rose-50/60"
                      : "border-rose-200/90 hover:border-rose-400 hover:shadow-md"
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Poupa 10.000 Kz
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex -space-x-1.5 shrink-0">
                        <img
                          src="https://i.postimg.cc/tRknm8DP/NUDE-CAFE-1.jpg"
                          alt="Cinta 1"
                          className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-xs"
                        />
                        <img
                          src="https://i.postimg.cc/QNmKnvSp/Preto-elegante-1.jpg"
                          alt="Cinta 2"
                          className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-xs"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 leading-tight block">
                          2x Cintas
                        </span>
                        <span className="text-[10px] text-rose-600 font-extrabold block">
                          40.000 Kz / cada
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mb-2">
                      Ideal para alternar cores (Nude + Preto)
                    </p>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex items-baseline justify-between">
                    <span className="text-slate-400 line-through text-[11px] font-semibold">200.000 Kz</span>
                    <span className="text-sm font-black text-rose-600">80.000 Kz</span>
                  </div>
                </button>

                {/* 3 Units Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, quantity: 3 }));
                    scrollToCheckout();
                  }}
                  className={`group relative bg-gradient-to-b from-amber-50/90 to-white p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between shadow-xs ${
                    formData.quantity === 3
                      ? "border-amber-600 ring-2 ring-amber-500/20 shadow-md bg-amber-50/60"
                      : "border-amber-200/90 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Poupa 25.000 Kz
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex -space-x-2 shrink-0">
                        <img
                          src="https://i.postimg.cc/tRknm8DP/NUDE-CAFE-1.jpg"
                          alt="Cinta 1"
                          className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-xs"
                        />
                        <img
                          src="https://i.postimg.cc/QNmKnvSp/Preto-elegante-1.jpg"
                          alt="Cinta 2"
                          className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-xs"
                        />
                        <img
                          src="https://i.postimg.cc/jqcnkBvH/n-UDE-CAFE-2.jpg"
                          alt="Cinta 3"
                          className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-xs"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 leading-tight block">
                          3x Cintas
                        </span>
                        <span className="text-[10px] text-amber-700 font-extrabold block">
                          36.667 Kz / cada
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mb-2">
                      Kit Sedutor / Máxima Poupança
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-100 flex items-baseline justify-between">
                    <span className="text-slate-400 line-through text-[11px] font-semibold">300.000 Kz</span>
                    <span className="text-sm font-black text-amber-700">110.000 Kz</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Specs bullets */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700">
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-rose-600 shrink-0" />
                <span>Efeito Modelador Imediato</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-rose-600 shrink-0" />
                <span>30% Elastano + 70% Nylon</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-rose-600 shrink-0" />
                <span>Tecido Fino e Respirável</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-rose-600 shrink-0" />
                <span>Tamanhos XS até 6XL</span>
              </div>
            </div>

            {/* Sizes selection quick view */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tamanho Recomendado:
                </label>
                <button
                  type="button"
                  onClick={scrollToSizeTable}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler size={14} /> Ver Tabela de Medidas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedMainSize(s.size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMainSize === s.size
                        ? "bg-rose-600 text-white shadow-md scale-105"
                        : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-200"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={scrollToCheckout}
                className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>RESERVAR A MINHA CINTA — 45.000 KZ</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex justify-center items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-emerald-600" /> Entrega em Luanda
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Lock size={14} className="text-slate-600" /> Pagamento no Ato
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── BLOCO 2: DOR & AGITAÇÃO ── */}
      <section className="bg-gradient-to-b from-rose-950 to-slate-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="bg-rose-900/60 text-rose-300 border border-rose-700/50 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            Identifica-se com esta sensação?
          </span>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Cansada de se esconder atrás da roupa?
          </h2>

          <p className="text-base sm:text-lg text-rose-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Aquele vestido lindo que ficou guardado na gaveta. A foto daquela festa que preferiste não publicar. A roupa justa que evitas no dia a dia por medo das marcas na barriga ou na cintura.
          </p>

          <div className="bg-rose-900/30 border border-rose-500/30 p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto backdrop-blur-md shadow-2xl space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-rose-200">
              "Não é falta de beleza — é falta da peça certa por baixo."
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O corpo da mulher muda com o tempo, com a maternidade e com a rotina. A nossa Cinta Colombiana foi criada exatamente para dar aquele suporte anatómico firme e natural que devolve a sua autoconfiança instantaneamente.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOCO 3: PROMESSA & TRANSFORMAÇÃO ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">Transformação Imediata</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Em segundos, outra mulher no espelho.
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Cintura definida, barriga contida e glúteos realçados — sem dietas malucas, sem horas exaustivas na academia e sem ter de esperar meses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">Redução Visual de Medidas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprime suavemente o abdómen superior e inferior, suavizando dobrinhas e criando aquele efeito ampulheta natural.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">Efeito Levanta-Bumbum</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modela o quadril e sustenta os glúteos de forma anatómica sem achatar, proporcionando um contorno firme e harmonioso.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">Correção de Postura & Suporte</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alivia a pressão na região lombar e ajuda a manter uma postura ereta e elegante ao caminhar ou sentar no trabalho.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOCO 4: PROVA VISUAL ANTES E DEPOIS ── */}
      <section className="bg-white py-16 px-4 border-y border-rose-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">Efeito Real na Pele</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-2">
              Não é photoshop. É engenharia têxtil colombiana.
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
              Veja o resultado direto por baixo de vestidos, calças sociais e roupas do dia a dia:
            </p>
          </div>

          {/* Real Before & After Image Card */}
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-rose-200 relative group">
            <div className="relative">
              <img
                src="https://i.postimg.cc/dQW3DC3p/Antes-e-depois-iamgem-extra.webp"
                alt="Resultado Real Antes e Depois com a Cinta Modeladora Colombiana"
                className="w-full h-auto max-h-[550px] object-cover object-top"
              />

              {/* Badges Overlays */}
              <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white font-black text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                <span>ANTES</span>
                <span className="font-normal opacity-80 sm:inline hidden">(Sem Cinta)</span>
              </div>

              <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white font-black text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles size={14} />
                <span>DEPOIS</span>
                <span className="font-normal opacity-90 sm:inline hidden">(Com Cinta Hexin)</span>
              </div>

              <button
                onClick={() => setActiveLightboxPhoto(REAL_PHOTOS[4])}
                className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Maximize2 size={14} className="text-rose-600" />
                <span>Ampliar Foto Real</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-rose-100 text-xs text-center font-medium border-t border-slate-800 flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              <span>Foto real sem edições de filtro: redução imediata da circunferência abdominal e alinhamento postural.</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-100 px-3 py-1 rounded-full">
                  Sem a Cinta Colombiana
                </span>
                <span className="text-xs text-slate-400">Comum</span>
              </div>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">✕</span> Roupas marcam dobrinhas no abdómen
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">✕</span> Postura curvada e dor nas costas ao fim do dia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">✕</span> Sensação de insegurança ao usar vestidos justos
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                  Com a Cinta Colombiana Hexin
                </span>
                <span className="text-xs text-emerald-600 font-bold">★ Resultado Imediato</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" /> Silhueta lisa e cinturada por baixo de qualquer tecido
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" /> Suporte lumbar firme que melhora a postura na hora
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" /> Confiança total para vestir o que quiser
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOCO 5 & 6: BENEFÍCIOS TÊXTEIS & DIFERENCIAIS ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">Especificações da Fábrica HEXIN</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Já existem muitas cintas. Só uma foi feita para durar o seu dia.
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Enquanto outras marcas usam tecidos sintéticos que perdem a firmeza em semanas, a nossa cinta combina tecnologia textil avançada com ajuste micrométrico.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">30% Elastano + 70% Nylon</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nível de compressão firme calibrado. Modela com alta intensidade sem sufocar ou provocar dor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Respirável & Antibacteriana</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Desenvolvida especialmente para climas quentes como Luanda. Dissipa o calor e evita maus odores ou suor retido.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Zap size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Renda Elegante Antiderrapante</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acabamento delicado em renda nas pernas com banda antiderrapante para não enrolar nem subir na coxa ao andar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <RefreshCw size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Secagem Rápida</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lave à noite e use na manhã seguinte. Tecido inteligente de secagem ultrarrápida que não perde a elasticidade.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Do XS ao 6XL (Plus Size)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modelagem inclusiva desenhada para o corpo real da mulher angolana, garantindo suporte e caimento perfeito.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Certificação GRS & Oeko-Tex</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Testada dermatologicamente para segurança têxtil. Sem componentes irritantes na pele.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOCO 7 & 8: SELOS & CONFIAÇÃO ── */}
      <section className="bg-rose-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-8 text-center">
          <div className="space-y-1">
            <span className="text-3xl font-black text-amber-300">4.8 / 5</span>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-wider">2.592 Avaliações da Fábrica</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white">OEKO-TEX 100</span>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-wider">Segurança Têxtil Garantida</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-white">CERTIFICADO GRS</span>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-wider">Produção Responsável</p>
          </div>
        </div>
      </section>

      {/* ── GUIA DE TAMANHOS (TABELA DE MEDIDAS & CALCULADORA INTELIGENTE) ── */}
      <section ref={sizeTableRef} className="py-16 px-4 max-w-4xl mx-auto text-center space-y-12">
        
        {/* CALCULADORA DE TAMANHO INTELIGENTE */}
        <div className="bg-gradient-to-br from-rose-950 via-slate-950 to-rose-950 text-white p-6 sm:p-8 rounded-3xl border border-rose-800 shadow-2xl text-left">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-rose-800/60 pb-6 mb-6">
            <div>
              <span className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-2">
                <Sparkles size={13} /> Recomendador de Tamanho em 1 Clique
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-100">
                Descubra o Seu Tamanho Ideal
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Ajuste os valores abaixo conforme a sua cintura ou peso para receber a recomendação exata da cinta:
              </p>
            </div>

            <div className="flex bg-rose-900/60 p-1 rounded-2xl border border-rose-700 shrink-0">
              <button
                type="button"
                onClick={() => setCalcMode("waist")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  calcMode === "waist"
                    ? "bg-rose-600 text-white shadow"
                    : "text-rose-200 hover:text-white"
                }`}
              >
                Por Cintura (cm)
              </button>
              <button
                type="button"
                onClick={() => setCalcMode("weight")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  calcMode === "weight"
                    ? "bg-rose-600 text-white shadow"
                    : "text-rose-200 hover:text-white"
                }`}
              >
                Por Peso (kg)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Control Inputs */}
            <div className="space-y-6">
              {calcMode === "waist" ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-200">Medida da Sua Cintura:</span>
                    <span className="text-rose-400 text-lg font-black">{calcWaist} cm</span>
                  </div>
                  <input
                    type="range"
                    min="58"
                    max="128"
                    value={calcWaist}
                    onChange={(e) => setCalcWaist(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-rose-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>58 cm (XS)</span>
                    <span>90 cm (XL)</span>
                    <span>128 cm (6XL)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-200">Seu Peso Aproximado:</span>
                    <span className="text-rose-400 text-lg font-black">{calcWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="130"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-rose-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>40 kg (XS)</span>
                    <span>75 kg (XL)</span>
                    <span>130 kg (6XL)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Output Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-rose-500/40 text-center space-y-3">
              <span className="text-xs uppercase tracking-widest text-rose-300 font-bold">
                Tamanho Recomendado para Si:
              </span>
              <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span className="text-rose-400">{getRecommendedSize()}</span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Efeito modelador firme e contorno natural sem desconforto.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedMainSize(getRecommendedSize());
                  scrollToCheckout();
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black py-3 px-4 rounded-xl shadow-lg transition-all"
              >
                APLICAR TAMANHO {getRecommendedSize()} AO PEDIDO
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">Escolha sem errar</span>
          <h2 className="text-3xl font-black text-slate-950">Tabela Completa de Medidas (XS ao 6XL)</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Consulte a tabela abaixo para selecionar o tamanho ideal de acordo com a sua cintura e quadril:
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-rose-900 text-white uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tamanho</th>
                  <th className="py-3.5 px-4">Cintura (cm)</th>
                  <th className="py-3.5 px-4">Quadril (cm)</th>
                  <th className="py-3.5 px-4">Peso Recomendado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 text-slate-700 font-medium">
                {SIZE_OPTIONS.map((row) => (
                  <tr
                    key={row.size}
                    className={`hover:bg-rose-50/60 transition-colors ${
                      selectedMainSize === row.size ? "bg-rose-100/60 font-bold text-rose-950" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-black text-rose-700">{row.size}</td>
                    <td className="py-3 px-4">{row.waist}</td>
                    <td className="py-3 px-4">{row.hip}</td>
                    <td className="py-3 px-4 text-slate-500">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dica de tamanho */}
        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs text-left flex items-start gap-3 shadow-sm">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>Dica Útil:</strong> Caso as suas medidas estejam no limite entre dois tamanhos ou se for a sua primeira vez usando cinta modeladora, recomendamos vivamente selecionar <strong>um tamanho acima</strong> para maior conforto inicial.
          </p>
        </div>
      </section>

      {/* ── GALERIA DE FOTOS REAIS DO PRODUTO & MODELO ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto border-t border-rose-100 bg-white/60">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Camera size={14} className="text-rose-600" />
            Galeria 100% Transparente
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Fotos Reais da Peça e Modelagem no Corpo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Sem truques ou edição: veja exatamente a qualidade do tecido, o acabamento da renda e o caimento no corpo antes de comprar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REAL_PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActiveLightboxPhoto(photo)}
              className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xl group hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                  {photo.badge}
                </span>

                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 size={14} className="text-rose-600" /> Ampliar Detalhes
                  </span>
                </div>
              </div>

              <div className="p-4 text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{photo.title}</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                    {photo.color}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {photo.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AVALIAÇÕES & DEPOIMENTOS DE CLIENTES EM LUANDA ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto border-t border-rose-100">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Star size={14} className="fill-rose-600 text-rose-600" />
            4.9 / 5 Baseado em Experiências Reais
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            O que as mulheres em Angola dizem:
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Relatos de quem já usa no trabalho, em festas e no dia a dia com roupas justas:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                "Depois que tive o meu segundo bebé, fiquei sem coragem de vestir certos vestidos. Esta cinta segura tudo no lugar, a renda da perna não enrola e nem dá para ver por baixo do pano! Fiquei com uma cintura que já não via há anos."
              </p>
            </div>
            <div className="pt-4 border-t border-rose-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Jandira K.</span>
                <span className="text-slate-400 text-[11px]">Kilamba, Luanda</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Compra Verificada
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                "Uso para trabalhar no escritório o dia todo. O suporte na coluna aliviou bastante a minha dor nas costas e dá aquela postura imponente. Comprei o Kit Duplo e valeu cada kwanza!"
              </p>
            </div>
            <div className="pt-4 border-t border-rose-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Vanessa M.</span>
                <span className="text-slate-400 text-[11px]">Talatona, Luanda</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Compra Verificada
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                "Estava receosa quanto ao tamanho por ser Plus Size, mas consultei a tabela e pedi o 3XL. Serve perfeitamente, ajusta sem sufocar e o bumbum fica super modelado!"
              </p>
            </div>
            <div className="pt-4 border-t border-rose-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Carmen P.</span>
                <span className="text-slate-400 text-[11px]">Maianga, Luanda</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Compra Verificada
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── BLOCO 10: URGÊNCIA & TRANSPARÊNCIA DO LANÇAMENTO ── */}
      <section className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">
            Edição Limitada de Lançamento
          </span>

          <h2 className="text-2xl sm:text-3xl font-black">
            Primeira Edição em Angola — Vagas de Pré-Venda
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            Estamos a lançar esta Cinta Modeladora Colombiana em Luanda em quantidade limitada. Ao efetuar a sua reserva hoje, garante prioridade no primeiro lote com <strong>desconto promocional de lançamento</strong>.
          </p>

          <div className="pt-2">
            <button
              onClick={scrollToCheckout}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              GARANTIR MINHA RESERVA SEM RISCO
            </button>
          </div>
        </div>
      </section>

      {/* ── CHECKOUT FORM ── */}
      <section id="comprar" ref={checkoutRef} className="py-16 px-4 max-w-4xl mx-auto scroll-mt-10">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Lado Esquerdo: Resumo da Oferta (Abaixo do formulário no mobile, à esquerda no desktop) */}
          <div className="order-2 lg:order-1 lg:w-[45%] p-8 bg-gradient-to-br from-rose-950 via-slate-950 to-rose-950 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-rose-400 font-bold uppercase tracking-widest text-xs block mb-1">
                  Reserva Oficial Pré-Venda
                </span>
                <h3 className="text-2xl font-black text-white">
                  Cinta Modeladora Colombiana
                </h3>
              </div>

              <div className="space-y-3 text-xs text-rose-100">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Sem pagamento antecipado — pague só na entrega</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Possibilidade de troca imediata de tamanho</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Entregas diretas em Luanda</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-rose-900 text-xs text-rose-300 font-medium">
              Garantia de Satisfação & Qualidade HEXIN
            </div>
          </div>

          {/* Lado Direito: Formulário (Primeiro no mobile, à direita no desktop) */}
          <div className="order-1 lg:order-2 lg:w-[55%] p-8 sm:p-10 bg-white text-left">
            <div className="mb-6">
              <span className="text-rose-600 font-bold uppercase tracking-widest text-xs block mb-1">
                Passo de Confirmação
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                Preencha os dados da reserva
              </h3>
            </div>

            <form onSubmit={handleFormSubmitInternal} className="space-y-5">
              
              {/* Quantidade & Pacotes */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">
                  Selecione a Oferta:
                </label>
                <div className="space-y-2">
                  {[
                    { qty: 1, title: "1x Cinta Modeladora", price: "45.000 Kz", sub: "Preço Padrão de Lançamento" },
                    { qty: 2, title: "2x Cintas (KIT DUPLO)", price: "80.000 Kz", sub: "Poupa 10.000 Kz!" },
                    { qty: 3, title: "3x Cintas (KIT SEDUTOR)", price: "110.000 Kz", sub: "Poupa 25.000 Kz!" }
                  ].map((pkg) => (
                    <button
                      key={pkg.qty}
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, quantity: pkg.qty }))}
                      className={`w-full p-3.5 border-2 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                        (formData.quantity || 1) === pkg.qty
                          ? "border-rose-600 bg-rose-50/80 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{pkg.title}</span>
                        <span className="text-[11px] text-rose-600 font-bold">{pkg.sub}</span>
                      </div>
                      <span className="font-black text-rose-600 text-base">{pkg.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalização de Cor e Tamanho */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Escolha as cores e tamanhos:
                </span>

                {Array.from({ length: formData.quantity || 1 }).map((_, idx) => {
                  const conf = cintaConfigs[idx] || { color: COLOR_OPTIONS[0].name, size: selectedMainSize };
                  return (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-rose-100 text-xs space-y-2">
                      <span className="font-bold text-rose-700 block">Cinta #{idx + 1}:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Cor</label>
                          <select
                            value={conf.color}
                            onChange={(e) => updateConfig(idx, "color", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Tamanho</label>
                          <select
                            value={conf.size}
                            onChange={(e) => updateConfig(idx, "size", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                          >
                            {SIZE_OPTIONS.map((s) => (
                              <option key={s.size} value={s.size}>{s.size} ({s.waist})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campos de Contacto */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium text-sm"
                  placeholder="Ex: Ana Maria Silva"
                  id="name-input-cinta"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                  WhatsApp para Contacto
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium text-sm"
                  placeholder="Ex: 923 000 000"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                  Bairro / Zona de Entrega em Luanda
                </label>
                <input
                  required
                  type="text"
                  value={formData.area || ""}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium text-sm"
                  placeholder="Ex: Talatona, Kilamba, Maianga, etc."
                />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Total da Encomenda:</span>
                  <span className="text-rose-600 text-sm font-black">{new Intl.NumberFormat("pt-AO").format(currentPrice)} Kz</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Pagamento na entrega: <strong>Dinheiro, Express, Transferência ou IBAN</strong>
                </p>
              </div>

              {/* Submit Button & Cancellation / Objection Question Link */}
              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-black text-base flex flex-col items-center justify-center transition-all bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-xl ${
                    isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin text-white" size={24} />
                  ) : (
                    <>
                      <span>CONFIRMAR RESERVA</span>
                      <span className="text-[11px] font-medium tracking-wide opacity-90">
                        Pagar na entrega: {new Intl.NumberFormat("pt-AO").format(currentPrice)} Kz
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowObjectionModal(true)}
                  className="w-full text-center text-xs text-rose-600 font-bold hover:text-rose-700 py-1 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={15} /> Tenho dúvidas ou receio antes de confirmar a reserva
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

      {/* ── BLOCO 11: FAQ ── */}
      <section className="px-4 py-16 max-w-3xl mx-auto text-left">
        <div className="text-center mb-10 space-y-2">
          <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">Perguntas Frequentes</span>
          <h2 className="text-3xl font-black text-slate-950">Dúvidas Sobre a Cinta</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "É desconfortável usar o dia todo?",
              a: "Não! O tecido é composto por 30% Elastano e 70% Nylon de alta tecnologia. É fino, respirável e antibacteriano, permitindo uso diário contínuo mesmo no calor sem acumular humidade."
            },
            {
              q: "Serve para o meu tamanho de corpo?",
              a: "Sim! Disponibilizamos tamanhos do XS ao 6XL (incluindo Plus Size). Consulte a nossa tabela de medidas acima. Caso tenha dúvidas ou esteja entre dois tamanhos, escolha o tamanho acima."
            },
            {
              q: "Quanto tempo demora a entrega?",
              a: "Como este é o lançamento exclusivo em Angola, o lote de pré-venda tem entrega prevista dentro de 14 dias após a confirmação. Enviamos atualizações pelo WhatsApp em todas as etapas."
            },
            {
              q: "E se o tamanho não me servir?",
              a: "Disponibilizamos a troca imediata de tamanho garantida no momento da entrega ou nos primeiros dias após receber a peça."
            },
            {
              q: "Como funciona o pagamento?",
              a: "O pagamento é 100% seguro e efetuado apenas no ato da entrega em mãos (em dinheiro ou transferência bancária/Multicaixa Express)."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-rose-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-rose-50/50 transition-colors font-bold text-slate-800 text-sm"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${activeFaq === i ? "rotate-180 text-rose-600" : ""}`}
                />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-rose-50"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOCO 12: CTA FINAL ── */}
      <section className="bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-rose-100 leading-tight">
            "A mulher confiante já está em você. A cinta só revela."
          </h2>
          <p className="text-sm text-slate-300">
            Garanta agora a sua Cinta Modeladora Colombiana com preço especial no lançamento.
          </p>
          <div>
            <button
              onClick={scrollToCheckout}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-lg py-4 px-8 rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.5)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
            >
              RESERVAR AGORA (45.000 KZ)
            </button>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX MODAL PARA FOTOS REAIS ── */}
      <AnimatePresence>
        {activeLightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-rose-200"
            >
              <button
                onClick={() => setActiveLightboxPhoto(null)}
                className="absolute top-4 right-4 z-20 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                <X size={20} />
              </button>

              <div className="relative bg-slate-900 max-h-[70vh] flex items-center justify-center overflow-hidden">
                <img
                  src={activeLightboxPhoto.url}
                  alt={activeLightboxPhoto.title}
                  className="w-full max-h-[70vh] object-contain"
                />
                
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {activeLightboxPhoto.badge}
                </span>
              </div>

              <div className="p-5 sm:p-6 text-left space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-950">
                    {activeLightboxPhoto.title}
                  </h3>
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                    {activeLightboxPhoto.color}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  {activeLightboxPhoto.subtitle}
                </p>
                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <CheckCircle size={15} className="text-emerald-600" /> Foto 100% Real do Produto
                  </span>
                  <button
                    onClick={() => {
                      setSelectedHeroImage(activeLightboxPhoto.url);
                      if (activeLightboxPhoto.color === "Preto Elegante") setSelectedColorIndex(1);
                      if (activeLightboxPhoto.color === "Nude-Café") setSelectedColorIndex(0);
                      setActiveLightboxPhoto(null);
                      scrollToCheckout();
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Quero Este Modelo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL 1: CONFIRMAÇÃO DE RESERVA DA CINTA ── */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-5 text-left my-8"
            >
              <div className="flex items-start justify-between border-b border-rose-100 pb-3">
                <div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                    Passo de Confirmação Final
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Confirmar Dados da Sua Reserva
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verifique se os dados estão corretos para garantir a entrega sem falhas.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Resumo dos Dados Preenchidos */}
              <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                  <span className="font-bold text-slate-600">Produto:</span>
                  <span className="font-black text-slate-900">Cinta Modeladora Colombiana</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                  <span className="font-bold text-slate-600">Nome Completo:</span>
                  <span className="font-bold text-slate-900">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                  <span className="font-bold text-slate-600">WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900">{formData.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                  <span className="font-bold text-slate-600">Bairro / Zona de Entrega:</span>
                  <span className="font-bold text-slate-900">{formData.area}</span>
                </div>

                <div className="pt-1">
                  <span className="font-bold text-rose-800 block mb-1.5">Especificações Escolhidas:</span>
                  <div className="space-y-1">
                    {Array.from({ length: formData.quantity || 1 }).map((_, i) => {
                      const conf = cintaConfigs[i] || { color: COLOR_OPTIONS[0].name, size: selectedMainSize };
                      return (
                        <div key={i} className="bg-white p-2.5 rounded-xl border border-rose-100 flex justify-between font-medium text-[11px]">
                          <span>Cinta #{i + 1}: <strong>{conf.color}</strong></span>
                          <span className="font-bold text-rose-600">Tamanho {conf.size}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-rose-200 text-slate-900">
                  <span>Valor Total a Pagar no Ato da Entrega:</span>
                  <span className="text-rose-600 text-base">{new Intl.NumberFormat("pt-AO").format(currentPrice)} Kz</span>
                </div>
              </div>

              {/* Garantia */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>Pagamento 100% seguro na entrega (Transferências, IBAN, Express ou Dinheiro)</span>
              </div>

              {/* Ações da Confirmação */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => handleFinalConfirmation()}
                  className="w-full py-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={18} /> CONFIRMAR RESERVA
                </button>

                <button
                  onClick={handleEditInformation}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={15} className="text-slate-500" /> Quero alterar informações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: PERGUNTAS DE OBJEÇÃO & REJEIÇÃO REESTRUTURADAS ── */}
      <AnimatePresence>
        {showObjectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowObjectionModal(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-5 text-left my-8"
            >
              <div className="flex items-start justify-between border-b border-rose-100 pb-3">
                <div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                    Suporte & Esclarecimento
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    O que te impede de concluir a reserva da cinta?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione a sua dúvida abaixo para vermos a solução ideal:
                  </p>
                </div>
                <button
                  onClick={() => setShowObjectionModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lista de perguntas / objeções de cancelamento */}
              <div className="space-y-2">
                {[
                  {
                    id: "size",
                    icon: "📏",
                    title: "Tenho receio do tamanho não me servir",
                    reassurance: "📐 Guia & Simulador de Tamanho Ideal: Para evitar transtornos e garantir o caimento perfeito, disponibilizamos a nossa Calculadora e Tabela de Medidas na página. Por favor, consulte as suas medidas (cintura ou peso) e escolha o tamanho correto com atenção antes de concluir a reserva!",
                    hasSimulatorButton: true
                  },
                  {
                    id: "comfort",
                    icon: "💃",
                    title: "Receio de ser desconfortável ou achatar o bumbum",
                    reassurance: "✨ Efeito Bumbum Empinado Colombiano: A nossa cinta possui malha Powernet anatómica de alta compressão que reduz a cintura em até 7cm enquanto sustenta e modela os glúteos sem achatar!"
                  },
                  {
                    id: "price",
                    icon: "💰",
                    title: "Quais são as formas de pagamento aceites?",
                    reassurance: "🔒 Formas de Pagamento na Entrega: Aceitamos Transferências, IBAN, Express e Dinheiro físico no ato da entrega em mãos em Luanda!"
                  },
                  {
                    id: "delivery",
                    icon: "🚚",
                    title: "Qual é o prazo exacto de entrega no meu bairro em Luanda?",
                    reassurance: "⚡ Entrega Direta em Luanda: Entregamos diretamente no seu bairro em 24h a 48h úteis com pagamento apenas no momento da receção."
                  }
                ].map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjection(obj.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedObjection === obj.id
                        ? "border-rose-600 bg-rose-50/90 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl shrink-0">{obj.icon}</span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">{obj.title}</span>
                      {selectedObjection === obj.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 text-xs text-rose-950 font-medium bg-white p-3 rounded-xl border border-rose-200 leading-relaxed shadow-xs space-y-2.5"
                        >
                          <p>{obj.reassurance}</p>
                          {obj.hasSimulatorButton && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowObjectionModal(false);
                                scrollToSizeTable();
                              }}
                              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Ruler size={14} /> Usar Simulador e Ver Tabela de Medidas
                            </button>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botões de Ação na Objeção */}
              <div className="space-y-2 pt-2 border-t border-rose-100">
                <button
                  onClick={() => handleFinalConfirmation()}
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={16} /> CONFIRMAR RESERVA
                </button>

                <button
                  onClick={handleEditInformation}
                  className="w-full text-center text-xs text-slate-600 font-bold hover:text-slate-800 py-2 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Edit3 size={14} /> Quero alterar informações no formulário
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERSUASION MODAL STEP 1: PERSUASÃO E MANUTENÇÃO DA OFERTA ── */}
      <AnimatePresence>
        {showPersuasionStep1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPersuasionStep1(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 text-left my-8"
            >
              <div className="flex items-start justify-between border-b border-rose-100 pb-3">
                <div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                    <Sparkles size={12} /> Desconto Garantido Hoje
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Deseja mesmo cancelar a sua reserva?
                  </h3>
                </div>
                <button
                  onClick={() => setShowPersuasionStep1(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100 text-slate-800 text-xs sm:text-sm space-y-1.5 leading-relaxed">
                <p className="font-semibold text-rose-950">
                  O preço promocional de lançamento e o <strong>pagamento seguro na entrega em Luanda</strong> são válidos apenas para pedidos de hoje!
                </p>
                <p className="text-slate-600 text-xs">
                  Reduza medidas de forma imediata e pague apenas ao receber em mãos.
                </p>
              </div>

              {/* Botões do Passo 1 */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleFinalConfirmation()}
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={18} /> CONFIRMAR RESERVA
                </button>

                <button
                  onClick={handleEditInformation}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={15} /> Quero alterar informações
                </button>

                <button
                  onClick={() => {
                    setShowPersuasionStep1(false);
                    setShowPersuasionStep2(true);
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 py-1 cursor-pointer font-medium"
                >
                  Ainda assim não quero confirmar...
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERSUASION MODAL STEP 2: PROVA SOCIAL DIRECTA ── */}
      <AnimatePresence>
        {showPersuasionStep2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPersuasionStep2(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 text-left my-8"
            >
              <div className="flex items-start justify-between border-b border-rose-100 pb-3">
                <div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                    ⭐ Depoimento Real
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    Não perca esta oportunidade!
                  </h3>
                </div>
                <button
                  onClick={() => setShowPersuasionStep2(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <p className="italic font-medium text-slate-900">
                  &ldquo;Também tive dúvidas no início, mas arrisquei porque o pagamento é só na entrega. A cinta modela perfeitamente e a entrega em Luanda foi rápida!&rdquo;
                </p>
                <span className="text-[11px] font-bold text-rose-600 block text-right">— Maria S., Luanda</span>
              </div>

              {/* Botões do Passo 2 */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleFinalConfirmation()}
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={18} /> CONFIRMAR RESERVA
                </button>

                <button
                  onClick={handleEditInformation}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={15} /> Quero alterar informações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};
