const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const roteadorStart = content.indexOf('{/* SALES ROTEADOR VIEW */}');
const roteadorEnd = content.indexOf('{view === "admin" && (');

if (roteadorStart === -1 || roteadorEnd === -1) {
  console.log("Could not find SALES ROTEADOR VIEW boundaries");
  process.exit(1);
}

const beforeRoteador = content.slice(0, roteadorStart);
const afterRoteador = content.slice(roteadorEnd);

// Read the existing roteador segment
const existingRoteador = content.slice(roteadorStart, roteadorEnd);

fs.writeFileSync('roteador_dump.txt', existingRoteador);
console.log("Dumped roteador view");
