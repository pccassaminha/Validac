import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle,
  Truck,
  Sparkles,
  Wind,
  Sliders,
  TrendingUp,
  Star,
  ChevronDown,
  ShoppingBag,
  MessageCircle,
  Lock,
  ThumbsUp,
  RotateCcw,
  Zap,
  Info,
  Loader2
} from "lucide-react";

interface CamisaSedaViewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent, selectedColor: string, selectedSize: string) => void;
  isCheckoutVisible: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  leadCount?: number;
  leadGoal?: number;
}

// Provided images mapping color to link
const COLOR_IMAGES = [
  { color: "Verde Escuro", name: "Verde Esmeralda", url: "https://i.postimg.cc/4ykfcykk/C2128-13-verde-escuro.jpg", bg: "bg-emerald-800" },
  { color: "Branco", name: "Branco Imperial", url: "https://i.postimg.cc/2yRkWypx/C2128-1-branco.jpg", bg: "bg-white border-slate-300" },
  { color: "Azul Claro", name: "Azul Glacial", url: "https://i.postimg.cc/50JKFW7r/C2128-2-azul-claro.png", bg: "bg-sky-200" },
  { color: "Preto", name: "Preto Absoluto", url: "https://i.postimg.cc/Gp6d0tpB/C2128-3-preto.jpg", bg: "bg-slate-900" },
  { color: "Azul Marinho", name: "Azul Marinho Elite", url: "https://i.postimg.cc/PJWtQHTd/C2128-5-azul-marinho.jpg", bg: "bg-blue-900" },
];

const SIZES = [
  { label: "M", title: "M", sub: "(Porte magro / jovem)" },
  { label: "L", title: "L - G", sub: "(Porte magro / médio)" },
  { label: "XL", title: "XL - GG", sub: "(Porte médio padrão)" },
  { label: "2XL", title: "2XL - XGG", sub: "(Porte executivo robusto)" },
  { label: "3XL", title: "3XL - G2", sub: "(Porte alto / forte)" },
  { label: "4XL", title: "4XL - G3", sub: "(Plus size)" }
];

export default function CamisaSedaView({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  isCheckoutVisible,
  timeLeft,
  formatTime,
  leadCount = 38,
  leadGoal = 50,
}: CamisaSedaViewProps) {
  const [selectedColor, setSelectedColor] = useState(COLOR_IMAGES[0]);
  const [selectedSize, setSelectedSize] = useState("L - G");
  const [shirtConfigs, setShirtConfigs] = useState<Array<{ color: string; size: string }>>([
    { color: COLOR_IMAGES[0].color, size: "L - G" }, // Verde Escuro
    { color: COLOR_IMAGES[1].color, size: "L - G" }, // Branco
    { color: COLOR_IMAGES[2].color, size: "L - G" }, // Azul Claro
    { color: COLOR_IMAGES[3].color, size: "L - G" }, // Preto
    { color: COLOR_IMAGES[4].color, size: "L - G" }, // Azul Marinho
  ]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-rotate main image based on selected color or let user select it
  const handleColorChange = (colorObj: typeof COLOR_IMAGES[0]) => {
    setSelectedColor(colorObj);
  };

  const scrollToCheckout = () => {
    const element = document.getElementById("comprar");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const nameInput = element.querySelector<HTMLInputElement>('input[type="text"]');
        if (nameInput) nameInput.focus();
      }, 800);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const shirtCount = formData.quantity;
    
    if (shirtCount === 1) {
      onSubmit(e, shirtConfigs[0].color, shirtConfigs[0].size);
    } else {
      const selectedShirtsBreakdown = shirtConfigs.slice(0, shirtCount).map((config, index) => {
        const giftTag = (index === 4 && formData.quantity === 5) ? " (OFERTA GRÁTIS)" : "";
        return `Camisa ${index + 1}${giftTag}: ${config.color} (${config.size})`;
      });
      
      const colorsSummary = Array.from(new Set(shirtConfigs.slice(0, shirtCount).map(c => c.color))).join(", ");
      const sizesSummary = Array.from(new Set(shirtConfigs.slice(0, shirtCount).map(c => c.size))).join(", ");
      
      const finalBreakdownText = `[DETALHES DAS CAMISAS: ${selectedShirtsBreakdown.join(" | ")}]`;
      
      onSubmit(e, colorsSummary, `${sizesSummary} ${finalBreakdownText}`);
    }
  };

  const getCalculatedPrice = (qty: number) => {
    if (qty === 1) return 35000;
    if (qty === 2) return 60000;
    if (qty === 3) return 86000;
    if (qty === 5) return 140000;
    return qty * 35000;
  };

  const getOldPrice = (qty: number) => {
    if (qty === 1) return 50000;
    if (qty === 2) return 100000;
    if (qty === 3) return 150000;
    if (qty === 5) return 250000;
    return qty * 50000;
  };

  const currentPrice = getCalculatedPrice(formData.quantity);
  const oldPrice = getOldPrice(formData.quantity);
  const totalSavings = oldPrice - currentPrice;

  return (
    <main className="bg-slate-50 text-slate-800 min-h-screen pb-24 font-sans select-none overflow-x-hidden">
      
      {/* ── STICKY COUNTER TOP BAR ── */}
      <div className="bg-[#0b1329] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-16 z-30 border-b border-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span>O lote promocional termina em</span>
        <span className="bg-red-500 text-white font-mono px-2 py-0.5 rounded text-xs font-bold tracking-wider">
          {formatTime(timeLeft)}
        </span>
        <span className="hidden md:inline">• Restam apenas 11 camisas disponíveis</span>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">
          
          {/* Lado Esquerdo: Imagem do Produto Principal */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-200 inline-block w-full max-w-[500px]">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 w-full group shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedColor.color}
                    src={selectedColor.url}
                    alt={`Camisa de Seda Gelada - Cor ${selectedColor.color}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Badge de exclusividade */}
                <div className="absolute top-4 left-4 bg-[#0a1128] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md">
                  Seda Gelada Premium
                </div>
              </div>

              {/* Seletor Rápido de Galeria/Cores */}
              <div className="mt-5 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2.5">
                  Selecione a Cor para Pré-Visualizar:
                </p>
                <div className="flex justify-center gap-3">
                  {COLOR_IMAGES.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleColorChange(item)}
                      className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor.color === item.color
                          ? "ring-2 ring-indigo-600 ring-offset-2 scale-110"
                          : "border-slate-200 opacity-80 hover:opacity-100"
                      }`}
                      title={item.name}
                    >
                      <span className={`w-8 h-8 rounded-full ${item.bg} block shadow-inner`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-800 mt-3 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Cor: <span className="text-indigo-600">{selectedColor.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Lado Direito: Informação de Venda e Headline */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-4.5 py-2 rounded-full text-xs uppercase tracking-wider mb-6">
              <Sparkles size={14} className="animate-spin text-indigo-500" />
              <span>Alta Alfaiataria Masculina</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
              A elegância impecável da <span className="text-indigo-600">Seda Gelada</span> sem precisar passar a ferro.
            </h1>

            <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Desenvolvida para o homem de negócios moderno que exige status e conforto. 
              O tecido de <strong>Seda Gelada Premium (Ice Silk)</strong> possui tecnologia antirrugas definitiva, caimento sob medida e toque frio que mantém o seu corpo fresco o dia inteiro.
            </p>


            {/* Price Box with detailed discount logic */}
            <div className="bg-indigo-950 text-white p-5.5 rounded-3xl mb-6 max-w-md mx-auto lg:mx-0 shadow-lg border border-indigo-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded mb-4 inline-block">
                Tabela Oficial de Descontos Progressivos
              </span>
              
              <div className="space-y-2">
                {/* 1 Camisa */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, quantity: 1 }));
                    scrollToCheckout();
                  }}
                  className={`w-full text-left flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer group ${
                    formData.quantity === 1
                      ? "bg-indigo-900/60 border-indigo-700 shadow-sm"
                      : "border-transparent hover:border-indigo-900/30 hover:bg-indigo-900/20"
                  }`}
                >
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-200 group-hover:text-white transition-colors">1 Camisa</h5>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">Poupa 15.000 Kz no preço original</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 line-through block">50.000 Kz</span>
                    <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">35.000 Kz</span>
                  </div>
                </button>

                {/* 2 Camisas */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, quantity: 2 }));
                    scrollToCheckout();
                  }}
                  className={`w-full text-left flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer group ${
                    formData.quantity === 2
                      ? "bg-indigo-900/60 border-indigo-700 shadow-sm"
                      : "border-transparent hover:border-indigo-900/30 hover:bg-indigo-900/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-sm text-amber-400 group-hover:text-amber-300 transition-colors">Combo 2 Camisas</h5>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                        POUPA 40.000 KZ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal mt-0.5 group-hover:text-white transition-colors">
                      Receba 2 camisas (apenas 30.000 Kz / unidade).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 line-through block">100.000 Kz</span>
                    <span className="text-sm font-black text-amber-400 group-hover:text-amber-300 transition-colors">60.000 Kz</span>
                  </div>
                </button>

                {/* KIT 3 CAMISAS */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, quantity: 3 }));
                    scrollToCheckout();
                  }}
                  className={`w-full text-left flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer group ${
                    formData.quantity === 3
                      ? "bg-indigo-900/60 border-indigo-700 shadow-sm"
                      : "border-transparent hover:border-indigo-900/30 hover:bg-indigo-900/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">Kit 3 Camisas</h5>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.2 rounded">
                        POUPA 64.000 KZ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal mt-0.5 group-hover:text-white transition-colors">
                      Receba 3 camisas (apenas 28.667 Kz / unidade).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 line-through block">150.000 Kz</span>
                    <span className="text-sm font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">86.000 Kz</span>
                  </div>
                </button>

                {/* Compre 4 Leve 1 Grátis (5 Camisas) */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, quantity: 5 }));
                    scrollToCheckout();
                  }}
                  className={`w-full text-left flex justify-between items-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.98] cursor-pointer group relative ${
                    formData.quantity === 5
                      ? "bg-gradient-to-r from-indigo-900 to-indigo-950 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.3)] ring-2 ring-yellow-500/20 scale-[1.02]"
                      : "bg-indigo-950/40 border-yellow-500/40 hover:border-yellow-500/70 hover:bg-indigo-900/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-black text-sm text-yellow-400 group-hover:text-yellow-300 transition-colors uppercase tracking-wide">🏆 COMPRE 4 LEVE 1 GRÁTIS</h5>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-500 text-indigo-950 px-2 py-0.5 rounded shadow-sm animate-bounce">
                        A MELHOR OFERTA / MAIS VENDIDO
                      </span>
                    </div>
                    <p className="text-[11px] text-yellow-100/90 leading-normal mt-1.5 group-hover:text-white transition-colors">
                      Receba 5 Camisas Luxuosas ( Combo Semanal )
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs text-slate-400 line-through block">250.000 Kz</span>
                    <span className="text-base font-black text-yellow-400 group-hover:text-yellow-300 transition-all scale-110 inline-block">140.000 Kz</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 mb-8 text-left">
              {[
                { title: "Tecnologia Antirrugas", desc: "Camisa impecável sem ferro" },
                { title: "Toque Gelado", desc: "Ice Silk respirável" },
                { title: "Elasticidade Total", desc: "Liberdade absoluta" },
                { title: "Caimento Perfeito", desc: "Slim fit elegante" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <CheckCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>


          </div>
        </div>
      </section>

      {/* ── PROBLEM VS SOLUTION ── */}
      <section className="py-20 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">O Dilema Masculino</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">O pesadelo das camisas comuns</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto">Por que você deve parar de gastar dinheiro com camisas de algodão comum.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* O Problema */}
            <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-red-500/10 hover:border-red-500/25 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
                <Sliders size={24} className="rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                ⚠️ Camisas Tradicionais de Algodão
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Amarrotam em 5 minutos:</strong> Basta sentar no carro ou colocar o cinto de segurança para perder totalmente a postura de elegância.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Abafadas e quentes:</strong> Retêm o calor de Luanda, acumulando manchas de suor visíveis e constrangedoras nas axilas e costas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Prendem os movimentos:</strong> O tecido rígido dificulta esticar o braço ou gesticular livremente durante uma apresentação ou almoço de negócios.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span><strong>Trabalho de passar:</strong> Horas perdidas com o ferro de engomar quente, gastando energia e correndo o risco de queimar ou marcar a peça.</span>
                </li>
              </ul>
            </div>

            {/* A Solução */}
            <div className="bg-[#0b1329] p-8 rounded-[2rem] border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Wind size={24} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                ✨ A Solução: Camisa Seda Gelada Premium
              </h3>
              <ul className="space-y-4 text-indigo-100 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Tecnologia Antirrugas Perpétua:</strong> A fibra retoma a sua forma original imediatamente. Fique impecável do primeiro café à última reunião da noite.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Toque Frio Regulação Térmica:</strong> O tecido Ice Silk expele a humidade e reduz ativamente a temperatura sentida na pele. Sinta o frescor ideal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Elasticidade Bi-Direcional:</strong> Liberdade mecânica total. A camisa acompanha a flexão dos ombros e peitorais com conforto supremo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Lavagem Rápida e Prática:</strong> Secagem rápida ao ar, sem encolher, sem desbotar. Tire do estendal direta para o cabide e use!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── DETAILED FEATURES SECTION ── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">A Ciência do Tecido</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 tracking-tight">Pormenores premium que justificam o status</h2>
          <p className="text-slate-500 mt-2">Tecnologia têxtil desenvolvida para longa durabilidade e conforto de elite.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Wind size={24} />,
              title: "Seda Gelada (Ice Silk)",
              desc: "Contém micro-poros de evaporação instantânea que dão sensação de gelo na pele e evitam o acúmulo de odores."
            },
            {
              icon: <Sliders size={24} />,
              title: "Resiliência Antirrugas",
              desc: "A trama possui memória elástica molecular. Você pode amachucar a camisa e ela retornará lisa sem marcas."
            },
            {
              icon: <TrendingUp size={24} />,
              title: "Ajuste Slim Moderno",
              desc: "Desenho que modela discretamente o tórax e abdômen, mantendo as linhas clássicas que homens de negócios exigem."
            },
            {
              icon: <ShieldCheck size={24} />,
              title: "Alta Durabilidade",
              desc: "As cores de seda são blindadas contra lavagens industriais. Sem desbotamento, sem fiapos, sem encolhimento."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col hover:-translate-y-1 transition-transform">
              <div className="text-indigo-600 mb-5 bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <h4 className="font-bold text-slate-900 mb-2.5 text-base leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed flex-grow">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VERSATILITY AND STATUS ── */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <img
                src="https://i.postimg.cc/PJWtQHTd/C2128-5-azul-marinho.jpg"
                alt="Business Elite Look"
                className="rounded-[2.5rem] w-full max-w-[480px] mx-auto shadow-2xl border-2 border-slate-800 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full lg:w-1/2 text-left">
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Uso Versátil & Status</span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-6 leading-tight">
                Do gabinete executivo ao jantar de gala com postura imponente
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                Nossas peças combinam com calça social, fardamento clássico ou até calças casuais. Sinta-se confiante ao entrar em qualquer ambiente de alta sociedade sabendo que seu caimento e textura transmitem bom gosto instantâneo.
              </p>
              <div className="space-y-4">
                {[
                  "Perfeita para reuniões cruciais onde a primeira impressão decide contratos.",
                  "Toque sofisticado e brilhante discreto que destaca você na multidão.",
                  "Liberdade de movimentos para viagens longas de negócios ou conduzir sem apertos."
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-xs sm:text-sm font-semibold bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTEMUNHOS REAIS ── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Opinião de Quem Já Comprou</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">Usada por Homens de Sucesso</h2>
          <p className="text-slate-500 mt-1.5">Clientes satisfeitos em Luanda e arredores.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Eduardo M., Talatona",
              comment: "O tecido é surreal. Parece que tem ar condicionado no próprio fio! É gelado de verdade e não precisa de passar de jeito nenhum. Lavo e uso de seguida.",
              title: "Empresário"
            },
            {
              name: "José N., Kilamba",
              comment: "A camisa assenta perfeitamente no corpo. O caimento é slim mas estica super bem. O tecido tem um brilho muito discreto, bem executivo de alto escalão.",
              title: "Consultor Financeiro"
            },
            {
              name: "Álvaro B., Maianga",
              comment: "Tenho reuniões diárias e viajo muito. Essa camisa é a salvação do meu tempo. Tiro da mala intacta e uso na hora. Paguei no ato da entrega em Luanda. Excelente!",
              title: "Diretor de Operações"
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 italic text-sm leading-relaxed mb-6 font-medium">"{item.comment}"</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-sm">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PREÇOS E CHECKOUT FORM ── */}
      <section id="comprar" className="py-16 px-4 max-w-6xl mx-auto scroll-mt-24">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
          
          {/* Lado Esquerdo: Resumo de Benefícios */}
          <div className="lg:w-[45%] bg-indigo-950 p-8 sm:p-12 text-white flex flex-col justify-between relative">
            {/* Design accents */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/60 to-indigo-950 pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-red-500 text-white font-black px-3.5 py-1 rounded-full text-[9px] tracking-widest uppercase mb-6 shadow-sm">
                Unidades Limitadas
              </span>
              
              <h3 className="text-3xl font-black text-white leading-tight mb-6">
                Elegância sem esforço ao seu alcance
              </h3>
              
              <p className="text-indigo-200 text-sm leading-relaxed mb-8 font-normal">
                Efetue a sua reserva hoje para garantir o preço com <strong>50% de desconto</strong>. O pagamento é feito apenas no ato da entrega em dinheiro ou transferência, com entrega rápida ao seu endereço em Luanda.
              </p>
              
              <div className="space-y-4">
                {[
                  "Pagamento seguro no ato de entrega",
                  "Sem risco de encolhimento nas lavagens",
                  "Troca imediata de cor/tamanho garantida",
                  "Entrega expressa com estafeta próprio"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold bg-indigo-900/40 p-3.5 rounded-xl border border-indigo-800 backdrop-blur-sm">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 pt-8 mt-8 border-t border-indigo-900 flex items-center gap-3 text-xs text-indigo-300 font-bold">
              <ShieldCheck size={18} className="text-indigo-400 shrink-0" />
              <span>Garantia de Satisfação Total Grupo Cassaminha</span>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:w-[55%] p-8 sm:p-12 bg-white">
            <div className="mb-8">
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs block mb-1">Passo de Confirmação</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">Preencha os dados da reserva</h3>
            </div>

            <form
              onSubmit={handleSubmitForm}
              className="space-y-5 text-left"
            >
              {/* Nome */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium transition-all text-sm"
                  placeholder="João Silva"
                  id="name-input-camisa"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">WhatsApp para contacto</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium transition-all text-sm"
                  placeholder="921 167 980"
                />
              </div>

              {/* Província */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">Província de Entrega</label>
                <div className="relative">
                  <select disabled className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-500 appearance-none font-semibold text-sm disabled:opacity-100">
                    <option>Somente Luanda</option>
                  </select>
                  <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5">Endereço (Bairro / Município / Ponto de Ref.)</label>
                <input
                  required
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium transition-all text-sm"
                  placeholder="Ex: Maianga, Rua do Kero, próximo ao banco"
                />
              </div>

              {/* ── SELEÇÃO PERSONALIZADA DE COR E TAMANHO POR CAMISA ── */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <span className="block text-xs uppercase tracking-widest text-slate-400 font-bold">Personalize suas camisas</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Selecione a cor e o tamanho ideal para cada uma das camisas do seu pacote:</p>
                </div>

                <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 shadow-xs">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug font-medium">
                    <strong>Atenção ao Tamanho:</strong> Certifique-se de escolher o tamanho correto para a sua camisa.
                  </p>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: formData.quantity }).map((_, index) => {
                    const currentConf = shirtConfigs[index] || { color: COLOR_IMAGES[0].color, size: "L - G" };
                    const isGift = index === 4 && formData.quantity === 5;
                    return (
                      <div 
                        key={index} 
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative ${
                          isGift 
                            ? "bg-emerald-50/50 border-emerald-200/80 shadow-[0_4px_12px_rgba(16,185,129,0.05)]" 
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        {isGift && (
                          <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-xl shadow-sm">
                            Oferta Grátis!
                          </span>
                        )}
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isGift ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                          }`}>
                            {index + 1}
                          </span>
                          <span>Camisa {index + 1} {isGift ? "(Sua Oferta)" : ""}</span>
                        </h4>

                        {/* Cores */}
                        <div className="mb-4">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2 px-0.5">
                            Cor: <span className="text-slate-800 font-black">{currentConf.color}</span>
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_IMAGES.map((item) => (
                              <button
                                key={item.color}
                                type="button"
                                onClick={() => {
                                  const newConfigs = [...shirtConfigs];
                                  if (!newConfigs[index]) newConfigs[index] = { color: item.color, size: "L - G" };
                                  newConfigs[index] = { ...newConfigs[index], color: item.color };
                                  setShirtConfigs(newConfigs);
                                  // Visually update the main image of the page to match the last selected color
                                  setSelectedColor(item);
                                }}
                                className={`py-2 px-3 border rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
                                  currentConf.color === item.color
                                    ? isGift 
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-black" 
                                      : "bg-indigo-600 border-indigo-600 text-white shadow-sm font-black"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <span className={`w-2.5 h-2.5 rounded-full ${item.bg} block border border-white/50 shrink-0`} />
                                <span className="leading-none">{item.color}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tamanho */}
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2 px-0.5">
                            Tamanho: <span className="text-slate-800 font-black">{currentConf.size}</span>
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {SIZES.map((size) => (
                              <button
                                key={size.label}
                                type="button"
                                onClick={() => {
                                  const newConfigs = [...shirtConfigs];
                                  if (!newConfigs[index]) newConfigs[index] = { color: COLOR_IMAGES[0].color, size: size.title };
                                  newConfigs[index] = { ...newConfigs[index], size: size.title };
                                  setShirtConfigs(newConfigs);
                                }}
                                className={`py-2 px-1 border text-center rounded-xl transition-all text-xs font-bold cursor-pointer active:scale-95 ${
                                  currentConf.size === size.title
                                    ? isGift 
                                      ? "bg-emerald-600 border-emerald-600 text-white font-black shadow-md"
                                      : "bg-indigo-600 border-indigo-600 text-white font-black shadow-md"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                                title={`${size.title} - ${size.sub}`}
                              >
                                {size.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold text-center mt-2 leading-relaxed">
                  Nota: Caimento slim fit clássico adaptável. Na dúvida, sugerimos escolher um número acima para maior conforto.
                </p>
              </div>

              {/* Seleção de Pacote Promocional */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">
                  Selecione a Oferta Desejada <span className="text-indigo-600 font-normal lowercase">(Com descontos progressivos!)</span>
                </label>
                <div className="space-y-3">
                  {[
                    {
                      qty: 1,
                      title: "1 Camisa Gelada Premium",
                      priceText: "35.000 Kz",
                      badge: null,
                      desc: "Desconto de 15.000 Kz incluído!",
                    },
                    {
                      qty: 2,
                      title: "2 Camisas Geladas (Combo Promocional)",
                      priceText: "60.000 Kz",
                      badge: "Promoção Recomendada",
                      desc: "Poupa 40.000 Kz! Apenas 30.000 Kz por unidade (De 100.000 Kz por 60.000 Kz)",
                    },
                    {
                      qty: 3,
                      title: "KIT 3 CAMISAS (POUPA 64.000 KZ)",
                      priceText: "86.000 Kz",
                      badge: "Economia Extra",
                      desc: "Apenas 28.667 Kz por unidade! De 150.000 Kz por apenas 86.000 Kz",
                    },
                    {
                      qty: 5,
                      title: "🏆 COMPRE 4 LEVE 1 GRÁTIS",
                      priceText: "140.000 Kz",
                      badge: "A MELHOR OFERTA / MAIS VENDIDO",
                      desc: "De 250.000 Kz por apenas 140.000 Kz! (Receba 5 camisas luxuosas)",
                    },
                  ].map((pkg) => (
                    <button
                      key={pkg.qty}
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: pkg.qty })}
                      className={`w-full p-4 border-2 rounded-2xl text-left transition-all flex items-center justify-between gap-4 cursor-pointer relative ${
                        formData.quantity === pkg.qty
                          ? pkg.qty === 5
                            ? "bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-500 ring-4 ring-amber-500/20 text-slate-900 shadow-lg scale-[1.03]"
                            : "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 shadow-md scale-[1.01]"
                          : pkg.qty === 5
                            ? "bg-gradient-to-r from-amber-50/30 to-transparent border-amber-500/40 hover:border-amber-500 hover:from-amber-50/50 hover:bg-amber-50/30 text-slate-700 shadow-md"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {pkg.badge && (
                        <span className={`absolute -top-2.5 right-4 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm ${
                          pkg.qty === 5 
                            ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 ring-2 ring-yellow-400 animate-pulse" 
                            : pkg.qty === 2
                              ? "bg-slate-200 text-slate-700 border border-slate-300"
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formData.quantity === pkg.qty
                            ? pkg.qty === 5
                              ? "border-amber-600 bg-amber-600 text-white"
                              : "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}>
                          {formData.quantity === pkg.qty && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className={`font-black ${
                            pkg.qty === 5 
                              ? formData.quantity === 5 
                                ? "text-amber-950 text-base" 
                                : "text-amber-900 text-sm" 
                              : formData.quantity === pkg.qty 
                                ? "text-indigo-950 text-sm" 
                                : "text-slate-800 text-sm"
                          }`}>
                            {pkg.title}
                          </p>
                          <p className={`text-[11px] font-medium mt-0.5 ${
                            pkg.qty === 5 
                              ? formData.quantity === 5 
                                ? "text-amber-800 font-semibold" 
                                : "text-amber-700/80" 
                              : formData.quantity === pkg.qty 
                                ? "text-indigo-600/80" 
                                : "text-slate-500"
                          }`}>
                            {pkg.desc}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm sm:text-base font-black ${
                          pkg.qty === 5 
                            ? formData.quantity === 5 
                              ? "text-amber-700 sm:text-lg" 
                              : "text-amber-600" 
                            : formData.quantity === pkg.qty 
                              ? "text-indigo-600" 
                              : "text-slate-800"
                        }`}>
                          {pkg.priceText}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-1.5">Notas / Observações Adicionais (Opcional)</label>
                <textarea
                  rows={2}
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-3 rounded-xl text-slate-900 font-medium transition-all resize-none text-sm"
                  placeholder="Se necessário, especifique referências para entrega ou dúvidas..."
                />
              </div>

              {/* Resumo de Preços Dinâmico */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm space-y-2">
                <div className="flex justify-between font-bold text-slate-600 text-xs uppercase tracking-wider">
                  <span>Oferta Escolhida:</span>
                  <span className="text-indigo-600 text-right">
                    {formData.quantity === 5
                      ? `Compre 4 Leve 1 Grátis (5 Camisas) (${Array.from(new Set(shirtConfigs.slice(0, 5).map(c => c.color))).join(", ")} / ${Array.from(new Set(shirtConfigs.slice(0, 5).map(c => c.size))).join(", ")})`
                      : `${formData.quantity}x Camisa Seda (${Array.from(new Set(shirtConfigs.slice(0, formData.quantity).map(c => c.color))).join(", ")} / ${Array.from(new Set(shirtConfigs.slice(0, formData.quantity).map(c => c.size))).join(", ")})`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-slate-400 text-xs line-through leading-none">
                  <span>Preço Original:</span>
                  <span>{new Intl.NumberFormat("pt-AO").format(oldPrice)} Kz</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 text-xs leading-none">
                  <span>Poupança Total:</span>
                  <span>- {new Intl.NumberFormat("pt-AO").format(totalSavings)} Kz ({Math.round((totalSavings / oldPrice) * 100)}% de Desconto!)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <span className="font-black text-slate-800 text-sm uppercase">Total a pagar:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-600">{new Intl.NumberFormat("pt-AO").format(currentPrice)}</span>
                    <span className="text-xs font-black text-indigo-600">Kz</span>
                  </div>
                </div>
              </div>

              {/* Observação sobre a escolha do tamanho */}
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-normal">
                  <span className="font-bold block text-amber-950">Observação sobre o tamanho:</span>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    Por favor, <strong>certifique-se de que escolheu o tamanho e a cor corretos</strong> para a sua camisa antes de confirmar a reserva!
                  </p>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-black text-base flex flex-col items-center justify-center transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg ${
                    isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin text-white" size={24} />
                  ) : (
                    <>
                      <span>CONFIRMAR RESERVA DA CAMISA</span>
                      <span className="text-[10px] uppercase tracking-widest mt-1 opacity-80">(Pagar apenas ao receber: {new Intl.NumberFormat("pt-AO").format(currentPrice)} Kz)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Dúvidas Frequentes</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2">Dúvidas Sobre o Tecido</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "A camisa realmente não amassa? Preciso passar a ferro?",
              a: "A nossa camisa Seda Gelada Premium é desenvolvida com tecnologia molecular antirrugas permanente. Após a lavagem, basta estendê-la num cabide e secar à sombra: ela recuperará naturalmente a forma lisa sem requerer ferro de passar. Perfeita para viagens e rotinas aceleradas."
            },
            {
              q: "Ela encolhe ou desbota com as lavagens?",
              a: "Não encolhe nem desbota! Diferente do algodão tradicional, a fibra de Seda Gelada (Ice Silk de alta densidade) possui cores injetadas na fundição do fio, impedindo desbotamento mesmo em lavagens consecutivas. O tamanho continuará idêntico."
            },
            {
              q: "Como sei qual é o meu tamanho ideal?",
              a: "A modelagem é slim fit clássico elegante angolano. Disponibilizamos os tamanhos M, L - G, XL - GG, 2XL - XGG, 3XL - G2 e 4XL - G3. Caso prefira um caimento ligeiramente mais solto ou tenha ombros largos, recomendamos vivamente selecionar um número acima do seu habitual."
            },
            {
              q: "Como funciona a entrega e o pagamento em Luanda?",
              a: "O estoque é reposto e a entrega é efetuada diretamente ao seu endereço dentro de 14 dias após confirmar a encomenda. O pagamento é feito 100% de forma segura apenas no momento em que recebe a camisa em mãos (dinheiro ou transferência de imediato)."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all text-left">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors font-bold text-slate-800"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${activeFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      {!isCheckoutVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 flex sm:hidden items-center justify-between shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 line-through block leading-none">50.000 Kz</span>
            <span className="text-lg font-black text-indigo-600 leading-none">35.000 Kz</span>
          </div>
          <button
            onClick={scrollToCheckout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>RESERVAR MINHA CAMISA</span>
          </button>
        </div>
      )}

    </main>
  );
}
