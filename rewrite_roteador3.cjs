const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const roteadorStart = content.indexOf('{/* SALES ROTEADOR VIEW */}');
const roteadorEnd = content.indexOf('{/* FOOTER */}');

if (roteadorStart === -1 || roteadorEnd === -1) {
  console.log("Could not find SALES ROTEADOR VIEW boundaries");
  process.exit(1);
}

const beforeRoteador = content.slice(0, roteadorStart);
const afterRoteador = content.slice(roteadorEnd);

const newRoteadorView = fs.readFileSync('new_route.txt', 'utf8');

fs.writeFileSync('src/App.tsx', beforeRoteador + newRoteadorView + '\n      ' + afterRoteador);
console.log('App.tsx successfully overwritten with dramatic new tech theme.');
