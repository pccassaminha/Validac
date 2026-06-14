const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('MoreVertical,\n} from "lucide-react";', 'MoreVertical,\n  Zap,\n} from "lucide-react";');
fs.writeFileSync('src/App.tsx', code);
console.log('Zap import added');
