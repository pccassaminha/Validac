import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Database, ArrowRight, Lock, Users } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HomeViewProps {
  setView: (view: string) => void;
  isAuthenticated: boolean;
  currentUser: FirebaseUser | null;
  userName: string;
}

export default function HomeView({ setView, isAuthenticated, currentUser, userName }: HomeViewProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0f1221] text-white overflow-hidden font-sans selection:bg-violet-500 selection:text-white">
      
      {/* ── BACKGROUND MOTIONS ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[130px]"
        />
        <motion.div 
          animate={{ x: (mousePos.x - window.innerWidth / 2) * 0.05, y: (mousePos.y - window.innerHeight / 2) * 0.05 }}
          className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-sky-500/15 blur-[100px]"
        />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-40 border-b border-white/5 bg-[#0f1221]/40 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="https://i.postimg.cc/qqtQqXb4/C-grupo.png" 
              alt="Logo Grupo Cassaminha" 
              className="h-9 object-contain drop-shadow-md"
            />
            <span className="font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Valida C
            </span>
          </div>
          <div className="flex items-center gap-4">
             {isAuthenticated ? (
               <button 
                  onClick={() => setView('pages')} 
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white backdrop-blur-sm flex items-center gap-2"
               >
                  <LayoutDashboard size={16} /> Meu Painel
               </button>
             ) : (
               <button 
                  onClick={() => setView('auth')} 
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white backdrop-blur-sm flex items-center gap-2"
               >
                  <Lock size={16} /> Acesso Restrito
               </button>
             )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-6 min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema Interno Grupo Cassaminha
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Centro de Operações <br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Integradas
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plataforma exclusiva para gestão de landing pages, consolidação de leads e coordenação de vendas do Grupo. Acesso reservado apenas para as equipas internas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => setView('pages')} 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-[0_0_30px_rgba(123,47,255,0.3)] transition-all flex items-center justify-center gap-2 text-lg"
              >
                <LayoutDashboard size={20} />
                Acessar Operação
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setView('auth')} 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-[0_0_30px_rgba(123,47,255,0.3)] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Entrar na Conta
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setView('auth-register')} 
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold backdrop-blur-sm transition-all flex items-center justify-center text-lg shadow-lg"
                >
                  Solicitar Acesso
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 py-20 px-6 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Feat 1 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Leads Centralizadas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Reúne os dados de todas as campanhas e landing pages ativas numa única matriz, simplificando o acompanhamento e fechamento.
              </p>
            </div>
            
            {/* Feat 2 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 bg-violet-500/20 text-violet-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Páginas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Controlo total dos links e métricas vitais das páginas estáticas das nossas operações de venda em tempo real.
              </p>
            </div>

            {/* Feat 3 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Acesso Exclusivo</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Estrutura desenhada unicamente para a equipa gerencial. Novos acessos necessitam da aprovação da diretoria antes de poderem operar.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-10 text-center border-t border-white/5 bg-black/40">
        <p className="text-slate-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} Grupo Cassaminha. Operações Internas.
        </p>
      </footer>
    </div>
  );
}
