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
  `"Entrega Grátis em Luanda",
                      "Entrega noutra província Sob-Consulta",
                      "Pagas no Momento da Entrega",`,
  `"Venda Exclusiva e Entrega Gratuita em Luanda",
                      "Sem envio para outras províncias de momento",
                      "Pagas no Momento da Entrega",`
);

fs.writeFileSync('src/App.tsx', beforeRoteador + roteadorView);
console.log('Location constraint updated!');
