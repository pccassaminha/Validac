const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update AccordionItem to support isDarkTheme prop
content = content.replace(
  `function AccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
  key?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">`,
  `function AccordionItem({
  question,
  answer,
  isDarkTheme = false
}: {
  question: string;
  answer: string;
  isDarkTheme?: boolean;
  key?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={\`\${isDarkTheme ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden transition-all\`}>`
);

content = content.replace(
  `        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-800 pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={\`text-slate-400 transition-transform duration-300 \${isOpen ? "rotate-180" : ""}\`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-slate-500 leading-relaxed">
              {answer}
            </div>`,
  `        className={\`w-full px-6 py-5 text-left flex justify-between items-center \${isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors\`}
      >
        <span className={\`font-bold \${isDarkTheme ? 'text-white' : 'text-slate-800'} pr-4\`}>{question}</span>
        <ChevronDown
          size={20}
          className={\`\${isDarkTheme ? 'text-slate-500' : 'text-slate-400'} transition-transform duration-300 \${isOpen ? "rotate-180" : ""}\`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={\`px-6 pb-5 \${isDarkTheme ? 'text-slate-400' : 'text-slate-500'} leading-relaxed\`}>
              {answer}
            </div>`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx globally updated for AccordionItem');
