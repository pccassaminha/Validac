const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const roteadorStart = content.indexOf('SALES ROTEADOR VIEW');
if (roteadorStart === -1) process.exit(1);

const beforeRoteador = content.slice(0, roteadorStart);
let roteadorView = content.slice(roteadorStart);

roteadorView = roteadorView.replace(
  `{/* BLOCO 7: ESPECIFICAÇÕES TÉCNICAS */}
              <div className="mt-20 text-left max-w-3xl mx-auto mb-20 px-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                  Especificações Técnicas
                </h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Potência</span>
                      <span className="font-bold text-slate-900 text-right">
                        800W
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Material</span>
                      <span className="font-bold text-slate-900 text-right">
                        ABS Ignífugo + Cabide Alumínio
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Aquecimento
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        PTC Automático
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Dimensões
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        32 × 34 × 15 cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>`,
  `{/* BLOCO 7: ESPECIFICAÇÕES TÉCNICAS */}
              <div className="mt-20 text-left max-w-3xl mx-auto mb-20 px-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                  Especificações Técnicas
                </h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Tecnologia Rede</span>
                      <span className="font-bold text-slate-900 text-right">
                        5G NSA/SA + Wi-Fi 6
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Dispositivos max</span>
                      <span className="font-bold text-slate-900 text-right">
                        Até 256 Wi-Fi
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Antena
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        Super direcional 360°
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Bloqueio
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        100% Desbloqueado
                      </span>
                    </div>
                  </div>
                </div>
              </div>`
);


roteadorView = roteadorView.replace(
  `Quem comprou, recomenda!
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Vê o que os nossos clientes dizem sobre a praticidade do Secador
                Expresso Pro.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Ana P.",
                  text: "Moro num apartamento pequeno sem varanda. Antes as roupas ficavam com cheiro estranho, agora em 2h está tudo seco e cheiroso. Salvou-me!",
                },
                {
                  name: "Carlos M.",
                  text: "Incrível para as minhas camisas. Coloco à noite e de manhã estão impecáveis e secas. Recomendo para quem tem pressa.",
                },
                {
                  name: "Marta S.",
                  text: "O uniforme do meu filho já não é um problema. Lavo à noite, seco no aparelho e de manhã está pronto. Muito fácil de usar.",
                },
                {
                  name: "José B.",
                  text: "Muito prático. Levo até nas viagens de trabalho. Silencioso e não ocupa quase nada de espaço na mala.",
                },
              ]`,
  `Quem comprou, recomenda!
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Vê o que os nossos clientes dizem sobre a revolução do ZTE 5G Ultra com Africel.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Ana P.",
                  text: "Antes a internet da Unitel acabava a meio do mês por limite. Comprei o roteador, pus um chip Africel ilimitado e a minha vida mudou!",
                },
                {
                  name: "Carlos M.",
                  text: "Trabalho em casa e o ping estava péssimo. O ZTE 5G Ultra resolveu. E foi só pôr na tomada.",
                },
                {
                  name: "Marta S.",
                  text: "Finalmente uma internet digna em Luanda. Liguei mais de 10 dispositivos, Netflix a decorrer e nem sente engasgos.",
                },
                {
                  name: "José B.",
                  text: "Como é desbloqueado, posso levar para onde eu quiser! Chegou ao Kilamba bem embalado. Serviço top.",
                },
              ]`
);

fs.writeFileSync('src/App.tsx', beforeRoteador + roteadorView);
console.log('Done!');
