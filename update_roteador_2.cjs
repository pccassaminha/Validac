const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const roteadorStart = content.indexOf('{/* SALES ROTEADOR VIEW */}');
if (roteadorStart === -1) {
  console.log("Could not find SALES ROTEADOR VIEW");
  process.exit(1);
}

const beforeRoteador = content.slice(0, roteadorStart);
let roteadorView = content.slice(roteadorStart);

roteadorView = roteadorView.replace(
  `{/* BLOCO 10 & 11: PREÇOS E CHECKOUT */}
          <div id="comprar" className="pt-8 scroll-mt-20 px-4 mb-20">
            <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden max-w-6xl mx-auto flex flex-col lg:flex-row">
              {/* Esquerda: Info e Benefícios */}
              <div className="lg:w-[42%] bg-sky-600 p-10 text-white flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 mb-auto">
                  <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
                    Oferta por Tempo Limitado
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black mb-8 leading-tight tracking-tight">
                    Adeus humidade.
                    <br />
                    Olá praticidade.
                  </h2>`,
  `{/* BLOCO 10 & 11: PREÇOS E CHECKOUT */}
          <div id="comprar" className="pt-8 scroll-mt-20 px-4 mb-20">
            <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden max-w-6xl mx-auto flex flex-col lg:flex-row">
              {/* Esquerda: Info e Benefícios */}
              <div className="lg:w-[42%] bg-sky-600 p-10 text-white flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 mb-auto">
                  <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
                    Oferta por Tempo Limitado
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black mb-8 leading-tight tracking-tight">
                    Adeus lentidão.
                    <br />
                    Olá internet de verdade.
                  </h2>`
);

roteadorView = roteadorView.replace(
  `{/* Direita: Formulário */}
              <div className="lg:w-[58%] p-8 sm:p-12">
                <div className="text-center sm:text-left mb-12 relative flex flex-col items-center sm:items-start">
                  <div className="bg-red-500 text-white font-black py-2 px-5 rounded-full text-xs shadow-xl animate-bounce mb-6">
                    POUPA{" "}
                    {new Intl.NumberFormat("pt-AO").format(
                      formData.quantity * 10000,
                    )}{" "}
                    KZ HOJE
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 line-through text-2xl font-bold tracking-tight">
                      {new Intl.NumberFormat("pt-AO").format(
                        formData.quantity * 45000,
                      )}{" "}
                      Kz
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black text-slate-900 tracking-tighter">
                        {new Intl.NumberFormat("pt-AO").format(
                          formData.quantity * 35000,
                        )}
                      </span>`,
  `{/* Direita: Formulário */}
              <div className="lg:w-[58%] p-8 sm:p-12">
                <div className="text-center sm:text-left mb-12 relative flex flex-col items-center sm:items-start">
                  <div className="bg-red-500 text-white font-black py-2 px-5 rounded-full text-xs shadow-xl animate-bounce mb-6">
                    POUPA{" "}
                    {new Intl.NumberFormat("pt-AO").format(
                      formData.quantity * 70000,
                    )}{" "}
                    KZ HOJE
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 line-through text-2xl font-bold tracking-tight">
                      {new Intl.NumberFormat("pt-AO").format(
                        formData.quantity * 310000,
                      )}{" "}
                      Kz
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black text-slate-900 tracking-tighter">
                        {new Intl.NumberFormat("pt-AO").format(
                          formData.quantity * 240000,
                        )}
                      </span>`
);

fs.writeFileSync('src/App.tsx', beforeRoteador + roteadorView);
console.log('Variables updated in roteador forms');
