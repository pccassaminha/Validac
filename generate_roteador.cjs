const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '{/* SALES ROUPAS VIEW */}';
const targetStart = content.indexOf(startMarker);
const endMarker = '{/* FOOTER */}';
const targetEnd = content.indexOf(endMarker);

if (targetStart === -1 || targetEnd === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

const roupasViewStr = content.substring(targetStart, targetEnd);

let roteadorViewStr = roupasViewStr
  .replace(/sales-roupas/g, 'sales-roteador')
  .replace(/SALES ROUPAS VIEW/g, 'SALES ROTEADOR VIEW')
  .replace(/A solução para quem vive em apartamento em Luanda/g, 'Independência TOTAL da lentidão das redes convencionais')
  .replace(/A solução definitiva para secar e higienizar a sua roupa de\s*forma prática e rápida\./g, 'ZTE 5G Ultra: Pare de ficar refém de planos lentos e acesse até 3600 Mbps de forma instantânea.')
  .replace(/Seca roupa íntima, camisas e uniformes em menos de 2 horas\./g, 'Velocidade absurda com a nova tecnologia Wi-Fi 6 e pico 5G.')
  .replace(/Elimina 99% das bactérias e o cheiro a humidade\./g, '100% Desbloqueado: Use chip Unitel, Africel ou Movicel e mude quando quiser.')
  .replace(/Totalmente prático, portátil e não estraga a roupa\./g, 'Conecta até 256 dispositivos sem perda de performance.')
  .replace(/35\.000/g, '240.000') 
  .replace(/45\.000/g, '310.000') 
  .replace(/10\.000/g, '70.000') 
  .replace(/Secador Expresso Pro/g, 'Roteador ZTE 5G Ultra')
  .replace(/IMAGES_ROUPAS/g, 'IMAGES_ROTEADOR')
  .replace(/TESTIMONIALS_ROUPAS/g, 'TESTIMONIALS_ROTEADOR')
  .replace(/FAQ_ROUPAS/g, 'FAQ_ROTEADOR')
  .replace(/POUPA 70\.000 KZ HOJE/g, 'POUPANÇA APROVADA DE 70 MIL Kz!');

const finalContent = content.slice(0, targetEnd) + roteadorViewStr + '\n      ' + content.slice(targetEnd);

fs.writeFileSync('src/App.tsx', finalContent);
console.log("Generated Roteador view!");
