const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '{/* SALES ROTEADOR VIEW */}';
const targetStart = content.indexOf(startMarker);
if (targetStart === -1) {
  console.log("Could not find SALES ROTEADOR VIEW");
  process.exit(1);
}

const endMarker = '{/* BLOCO 4: VELOCIDADE E ESTABILIDADE */}';
const targetEnd = content.indexOf(endMarker, targetStart);

if (targetEnd === -1) {
  console.log("Could not find BLOCO 4");
  process.exit(1);
}

const beforeContent = content.slice(0, targetStart);
const afterContent = content.slice(targetEnd);

const newHeroContent = `{/* SALES ROTEADOR VIEW */}
      {view === "sales-roteador" && (
        <main className="pb-24">
          {/* Nova Seção Hero Split-Pane */}
          <section className="pt-8 sm:pt-16 pb-12 px-4 max-w-[85rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
            >
              {/* Lado Direito: Imagem e Galeria (no Mobile aparece acima) */}
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="bg-slate-900 p-4 sm:p-5 rounded-[2.5rem] shadow-2xl border border-slate-800">
                  <div className="relative aspect-square sm:aspect-video md:aspect-[4/3] rounded-[1.8rem] overflow-hidden bg-slate-50 shadow-inner w-full mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white pointer-events-none z-0"></div>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImage}
                        src={IMAGES_ROTEADOR[activeImage]}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full object-contain p-6 z-10 drop-shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-center">
                    {IMAGES_ROTEADOR.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={\`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden snap-center transition-all bg-white \${
                          activeImage === i
                            ? "ring-4 ring-indigo-500 opacity-100 scale-105 shadow-md shadow-indigo-500/20"
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                        }\`}
                      >
                        <img
                          src={img}
                          alt={\`Thumbnail \${i}\`}
                          className="w-full h-full object-contain p-1.5"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lado Esquerdo: Texto */}
              <div className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-left flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-full text-xs sm:text-sm mb-6 mx-auto lg:mx-0 w-fit">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  A Revolução da Internet Ilimitada em Luanda
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
                  Roteador 5G Ultra Desbloqueado: Use qualquer operadora livremente
                </h1>
                <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Muitas famílias e empresas em Luanda estão a abandonar planos limitados de 500GB após recentes atualizações. Este Roteador ZTE 5G Ultra é 100% desbloqueado, facilitando a sua transição para planos realmente ILIMITADOS como o da Africel.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => {
                        document.getElementById("comprar")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] hover:scale-105 focus:ring-4 focus:ring-indigo-200 text-lg w-full sm:w-auto"
                  >
                    COMPRAR AGORA
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("motivos")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98] border border-slate-200 w-full sm:w-auto"
                  >
                    SABER MAIS
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Secção de Motivos Movida para o meio da página */}
          <section id="motivos" className="px-4 max-w-3xl mx-auto pt-16 pb-12 scroll-mt-20">
            <div className="text-center mb-16">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] sm:text-xs mb-6">
                Motivos para mudar AGORA MESMO:
              </h3>
              <div className="grid grid-cols-1 gap-4 text-left">
                {[
                  "A sua operadora atual cortou a internet a meio do mês por limite de GB?",
                  "Paga mais por um limite de tráfego de 500GB que não chega para a família toda?",
                  "Quer aproveitar os planos verdadeiramente ILIMITADOS da nova rede, mas o seu roteador está bloqueado?",
                  "A sua internet antiga é instável ou lenta nas horas de ponta?",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="bg-red-50 text-red-500 rounded-full p-2 sm:p-3 shrink-0">
                      <TriangleAlert size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-slate-700 font-semibold text-base sm:text-lg leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          `;

fs.writeFileSync('src/App.tsx', beforeContent + newHeroContent + afterContent);
console.log('Hero and gallery updated!');
