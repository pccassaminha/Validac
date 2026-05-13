import React, { useEffect, useRef } from 'react';

interface HomeViewProps {
  setView: (view: any) => void;
  isAuthenticated: boolean;
  currentUser: any;
  userName?: string;
}

export default function HomeView({ setView, isAuthenticated, currentUser, userName }: HomeViewProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cursor customizado
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    };

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      animationFrameId = requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', onMouseMove);
    animRing();

    const interactables = document.querySelectorAll('a, button, .feat-card, .faq-q, .nav-user');
    
    const onMouseEnter = () => {
      ring.style.width = '54px';
      ring.style.height = '54px';
      ring.style.borderColor = 'rgba(123,47,255,.6)';
    };
    
    const onMouseLeave = () => {
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(123,47,255,.35)';
    };

    interactables.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    // Reveal on scroll
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.valida-home-wrapper .reveal').forEach(el => obs.observe(el));

    // Stats counter
    const animateCounter = (id: string, target: number, suffix = '', duration = 2000) => {
      const el = document.getElementById(id);
      if (!el) return;
      let start = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = Math.round(start).toLocaleString('pt-PT') + suffix;
        if (start >= target) clearInterval(interval);
      }, duration / 60);
    };

    const statsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounter('stat1', 247);
        animateCounter('stat2', 12480);
        animateCounter('stat3', 34, '%');
        animateCounter('stat4', 89);
        statsObs.disconnect();
      }
    }, { threshold: 0.5 });

    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) statsObs.observe(statsEl);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
      obs.disconnect();
      statsObs.disconnect();
    };
  }, []);

  const toggleFaq = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = e.currentTarget.parentElement;
    if (!item) return;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };

  const getFirstName = () => {
      if (userName) return userName.split(' ')[0];
      if (currentUser?.displayName) {
          return currentUser.displayName.split(' ')[0];
      }
      return 'Utilizador';
  };

  return (
    <div className="valida-home-wrapper">
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={ringRef}></div>

      {/* ─── NAV ─── */}
      <nav className="home-nav">
        <div className="nav-logo cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <img src="https://i.postimg.cc/qqtQqXb4/C-grupo.png" alt="Logotipo C Grupo" />
          Valida C
        </div>
        <ul className="nav-links">
          <li><a href="#funcionalidades">Funcionalidades</a></li>
          <li><a href="#como-funciona">Como Funciona</a></li>
          <li><a href="#precos">Preços</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="nav-right">
          {isAuthenticated ? (
            <div className="nav-user" onClick={() => setView('admin')}>
              <div className="nav-avatar">{getFirstName().charAt(0).toUpperCase()}</div>
              Olá, {getFirstName()}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setView('auth')} 
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.9rem', 
                  backgroundColor: '#4f46e5', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '100px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Entrar
              </button>
              <button 
                onClick={() => setView('auth')} 
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.9rem', 
                  backgroundColor: '#4f46e5', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '100px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-mesh">
          <div className="mesh-blob blob1"></div>
          <div className="mesh-blob blob2"></div>
          <div className="mesh-blob blob3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            Apresentamos a Plataforma Valida C
          </div>

          <h1>O ecossistema perfeito para <span className="gradient-text">acelerar as suas vendas.</span></h1>

          <p className="hero-desc">A Valida C é a plataforma que valida os nossos produtos e clientes. Ela gere as suas páginas, unifica os seus leads e permite uma gestão centralizada para a conversão de oportunidades de uma forma simples e eficiente.</p>

          <div className="hero-ctas">
            <button 
              onClick={() => setView(isAuthenticated ? 'ai-generator' : 'admin')} 
              className="btn-hero-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
               Acessar Painel
            </button>
            <button 
              onClick={() => setView('sales')} 
              className="btn-hero-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
               Ex. Validação de Produto
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num" id="stat1">0</div>
              <div className="stat-label">Páginas criadas</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num" id="stat2">0</div>
              <div className="stat-label">Leads capturados</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num" id="stat3">0%</div>
              <div className="stat-label">Taxa de conversão</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num" id="stat4">0</div>
              <div className="stat-label">Clientes activos</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
          Scroll
        </div>
      </section>

      {/* ─── AI FEATURE HIGHLIGHT ─── */}
      <section className="hm-section" id="ai-generator" style={{ background: '#f4f6fb', borderTop: '1px solid rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="section-center reveal">
          <div className="label-pill" style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', color: '#fff', border: 'none' }}>✨ IA Generativa</div>
          <h2 className="section-title">Crie páginas em segundos com<br /><span className="accent">Inteligência Artificial.</span></h2>
          <p className="section-desc mb-10">Use as APIs oficiais dos melhores modelos do mercado (Gemini, ChatGPT e Claude) para gerar a estrutura completa, os argumentos de venda e gatilhos mentais perfeitos para o seu público em Angola.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px', margin: '40px auto 0', textAlign: 'left' }}>
            <div className="feat-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div className="feat-icon-wrap" style={{ background: 'rgba(66, 133, 244, 0.12)', color: '#4285F4', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🧠</div>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 0' }}>Google Gemini</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>Inteligência conectada com a internet para gerar copys modernos. Grátis usando a capacidade do nosso sistema!</p>
            </div>
            <div className="feat-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div className="feat-icon-wrap" style={{ background: 'rgba(16, 163, 127, 0.12)', color: '#10a37f', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>💬</div>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 0' }}>OpenAI GPT-4</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>Insira a sua chave API e use o modelo mais versátil do mundo na criação avançada das suas landing pages.</p>
            </div>
            <div className="feat-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div className="feat-icon-wrap" style={{ background: 'rgba(212, 163, 115, 0.12)', color: '#d4a373', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🔮</div>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 0' }}>Anthropic Claude</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6, margin: 0 }}>Crie páginas com textos extremamente naturais, focados na empatia e gatilhos de confiança em vendas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="hm-section" id="funcionalidades">
        <div className="section-center reveal">
          <div className="label-pill">✦ Funcionalidades</div>
          <h2 className="section-title">Tudo o que precisa<br /><span className="accent">numa só plataforma.</span></h2>
          <p className="section-desc">Ferramentas poderosas desenhadas para o mercado angolano, para vender mais com menos esforço.</p>
        </div>

        <div className="features-4">
          <div className="feat-card reveal reveal-delay-1">
            <div className="feat-icon-wrap ic-blue">🗂️</div>
            <h3>Múltiplas Páginas</h3>
            <p>Gera e gerencia variadas Landing Pages a partir de um único local de trabalho. Sem código, sem complicações.</p>
          </div>
          <div className="feat-card reveal reveal-delay-2">
            <div className="feat-icon-wrap ic-green">🔍</div>
            <h3>Leads Centralizados</h3>
            <p>Todo o tráfego e conversões das suas páginas centralizam-se no Valida C para fácil acompanhamento.</p>
          </div>
          <div className="feat-card reveal reveal-delay-3">
            <div className="feat-icon-wrap ic-violet">🔁</div>
            <h3>Recuperação e Conversão</h3>
            <p>Filtros avançados para localizar vendas pendentes. Aceda aos leads e contacte-os directamente no WhatsApp com um clique.</p>
          </div>
          <div className="feat-card reveal reveal-delay-4">
            <div className="feat-icon-wrap ic-orange">👤</div>
            <h3>CRM de Contactos Isolado</h3>
            <p>Os seus leads são 100% privados e armazenados no seu ecossistema. O Valida C não partilha os seus clientes.</p>
          </div>
          <div className="feat-card reveal reveal-delay-1">
            <div className="feat-icon-wrap ic-pink">📊</div>
            <h3>Analytics em Tempo Real</h3>
            <p>Veja o desempenho das suas páginas ao minuto. Métricas claras para decisões rápidas e certeiras.</p>
          </div>
          <div className="feat-card reveal reveal-delay-2">
            <div className="feat-icon-wrap ic-cyan">⚡</div>
            <h3>Leads Directos para Vendas</h3>
            <p>Após colectar na plataforma, pode copiar os dados ou usar atalhos para fechar a venda no WhatsApp.</p>
          </div>
          <div className="feat-card reveal reveal-delay-3">
            <div className="feat-icon-wrap ic-blue">🧪</div>
            <h3>Validação de Produtos</h3>
            <p>Teste novos produtos antes de investir stock. Valide a procura real com campanhas de baixo custo.</p>
          </div>
          <div className="feat-card reveal reveal-delay-4">
            <div className="feat-icon-wrap ic-green">🚀</div>
            <h3>Publicação Instantânea</h3>
            <p>Lance a sua página de produto em minutos. URLs prontos para partilhar nas suas campanhas Meta Ads.</p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section" id="como-funciona">
        <div className="how-inner">
          <div className="section-center reveal" style={{ color: '#fff' }}>
            <div className="label-pill">✦ Processo</div>
            <h2 className="section-title" style={{ color: '#fff' }}>
              Como funciona<br />
              <span style={{
                background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>em 4 passos.</span>
            </h2>
            <p className="section-desc" style={{ color: 'rgba(255,255,255,.55)' }}>Do produto ao pagamento, a Valida C simplifica todo o processo de venda online.</p>
          </div>
          <div className="steps-grid">
            <div className="step-item reveal reveal-delay-1">
              <div className="step-num">1</div>
              <h3>Cria a sua página</h3>
              <p>Configure a página do seu produto com fotos, preços e informações em minutos, sem código.</p>
            </div>
            <div className="step-item reveal reveal-delay-2">
              <div className="step-num">2</div>
              <h3>Lança o anúncio</h3>
              <p>Partilhe o link nas suas campanhas Meta Ads (Facebook e Instagram) e atraia compradores.</p>
            </div>
            <div className="step-item reveal reveal-delay-3">
              <div className="step-num">3</div>
              <h3>Recebe os leads no seu CRM</h3>
              <p>Os clientes preenchem os dados na página e o pedido fica salvo de forma segura e totalmente invisível para outros usuários no seu painel.</p>
            </div>
            <div className="step-item reveal reveal-delay-4">
              <div className="step-num">4</div>
              <h3>Gere contactos e conclui</h3>
              <p>Copie os dados ou inicie uma conversa com apenas um clique para fechar a venda via WhatsApp em segurança.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="testimonials-section">
        <div className="testimonials-inner">
          <div className="section-center reveal">
            <div className="label-pill">✦ Testemunhos</div>
            <h2 className="section-title">O que dizem<br /><span className="accent">os nossos clientes.</span></h2>
            <p className="section-desc">Empresas angolanas que usam a Valida C para crescer.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testi-card reveal reveal-delay-1">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"As páginas geradas pela IA e o facto das minhas leads não irem parar a outras empresas concorrentes são o ponto forte da Valida C."</p>
              <div className="testi-author">
                <div className="testi-avatar">M</div>
                <div><div className="testi-name">Miguel A.</div><div className="testi-role">Vendedor online, Luanda</div></div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-2">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Consegui validar três produtos novos em duas semanas sem gastar dinheiro em stock desnecessário. A plataforma é muito prática."</p>
              <div className="testi-author">
                <div className="testi-avatar">A</div>
                <div><div className="testi-name">Ana C.</div><div className="testi-role">Empreendedora, Viana</div></div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-3">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"A melhor decisão foi centralizar tudo aqui. Agora sei exactamente quantos clientes tenho, quem voltou a comprar e o que vende mais."</p>
              <div className="testi-author">
                <div className="testi-avatar">J</div>
                <div><div className="testi-name">João P.</div><div className="testi-role">Gestor de e-commerce</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="hm-section" id="precos">
        <div className="section-center reveal">
          <div className="label-pill">✦ Planos</div>
          <h2 className="section-title">Planos simples<br /><span className="accent">sem surpresas.</span></h2>
          <p className="section-desc">Escolha o plano certo para o tamanho do seu negócio. Cancele quando quiser.</p>
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal reveal-delay-1">
            <div className="price-plan">Starter (Teste)</div>
            <div className="price-amount" style={{ fontSize: '2.5rem' }}>2.500<span style={{ fontSize: '1.2rem' }}> Kz</span></div>
            <div className="price-period">válido por 1 mês</div>
            <ul className="price-features">
              <li>Páginas ilimitadas (Teste)</li>
              <li>Leads ilimitados</li>
              <li>Gerador de Páginas IA (Gemini)</li>
              <li>CRM e Integração WhatsApp básica</li>
              <li>Suporte por email</li>
            </ul>
            <button 
              onClick={() => setView('auth')} 
              className="btn-price btn-price-outline w-full"
            >
              Começar Teste
            </button>
          </div>
          <div className="price-card popular reveal reveal-delay-2">
            <div className="popular-badge">Mais Popular</div>
            <div className="price-plan">Pro</div>
            <div className="price-amount">15.000<span style={{ fontSize: '1.2rem' }}> Kz</span></div>
            <div className="price-period">por mês</div>
            <ul className="price-features">
              <li>Páginas e Leads ilimitados</li>
              <li>Gerador IA Avançado (GPT, Claude, Gemini)</li>
              <li>CRM e Analytics avançados</li>
              <li>Recuperação automática</li>
              <li>Suporte prioritário</li>
            </ul>
            <button 
              onClick={() => setView('auth')} 
              className="btn-price btn-price-solid w-full"
            >
              Começar Agora
            </button>
          </div>
          <div className="price-card reveal reveal-delay-3">
            <div className="price-plan">Empresas</div>
            <div className="price-amount">Custom</div>
            <div className="price-period">Sob consulta</div>
            <ul className="price-features">
              <li>Tudo do plano Pro</li>
              <li>Multi-utilizadores</li>
              <li>API personalizada</li>
              <li>Onboarding dedicado</li>
              <li>SLA garantido</li>
            </ul>
            <a href="https://wa.me/244921167980" className="btn-price btn-price-outline">Falar Connosco</a>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="hm-section" id="faq" style={{ background: '#fff', maxWidth: '100%', padding: '96px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-center reveal">
            <div className="label-pill">✦ FAQ</div>
            <h2 className="section-title">Perguntas<br /><span className="accent">frequentes.</span></h2>
            <p className="section-desc">Tudo o que precisa saber antes de começar.</p>
          </div>
          <div className="faq-list">
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                O que é a Valida C exactamente?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">A Valida C é uma plataforma de gestão de vendas online criada para simplificar a testagem de produtos. Permite criar páginas de venda de forma independente, capturar leads e gerir clientes via CRM próprio (e privado) para encaminhá-los proativamente no WhatsApp.</div>
            </div>
            <div className="faq-item reveal reveal-delay-1">
              <div className="faq-q" onClick={toggleFaq}>
                Preciso saber programar para usar?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">Não. A plataforma foi desenhada para ser usada por qualquer pessoa, mesmo sem conhecimentos técnicos. Em poucos minutos consegue criar e publicar a sua página de produto.</div>
            </div>
            <div className="faq-item reveal reveal-delay-2">
              <div className="faq-q" onClick={toggleFaq}>
                Como falo com os clientes no WhatsApp?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">Quando um cliente compra, os dados dele só aparecem no seu painel. Depois, basta clicar no botão de WhatsApp do cliente, e a plataforma criará um atalho para falar com ele. A plataforma não envia mensagens para o cliente por iniciativa própria para respeitar a privacidade.</div>
            </div>
            <div className="faq-item reveal reveal-delay-3">
              <div className="faq-q" onClick={toggleFaq}>
                Posso testar um produto antes de ter stock?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">Sim! Essa é uma das principais vantagens. Crie uma página, lance um anúncio, recolha pedidos e só encomende o produto quando tiver procura validada. Isso reduz o risco do negócio drasticamente.</div>
            </div>
            <div className="faq-item reveal reveal-delay-4">
              <div className="faq-q" onClick={toggleFaq}>
                A plataforma funciona para qualquer tipo de produto?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">Sim. A Valida C foi criada para produtos físicos vendidos via Meta Ads com entrega em Angola. Produtos leves, gadgets, acessórios, beleza, auto — qualquer categoria funciona bem.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="mesh-blob" style={{ width: '500px', height: '500px', background: 'var(--violet)', top: '-100px', left: '-100px' }}></div>
        <div className="mesh-blob" style={{ width: '400px', height: '400px', background: 'var(--blue)', bottom: '-100px', right: '-50px' }}></div>
        <div className="cta-inner reveal">
          <div className="label-pill" style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.8)' }}>✦ Comece hoje</div>
          <h2>Pronto para<br />acelerar as suas vendas?</h2>
          <p>Junte-se às empresas angolanas que já usam a Valida C para vender mais, com menos esforço.</p>
          <div className="cta-btns">
            <button onClick={() => setView('admin')} className="btn-hero-primary">Acessar Painel Agora</button>
            <a href="https://wa.me/244921167980" className="btn-hero-secondary">Falar com Suporte</a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">✦ Valida C</div>
              <p className="footer-desc">O ecossistema perfeito para acelerar as suas vendas em Angola. Desenvolvido pelo Grupo Cassaminha.</p>
            </div>
            <div className="footer-col">
              <h4>Plataforma</h4>
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#como-funciona">Como Funciona</a>
              <a href="#precos">Preços</a>
              <a href="#">Actualizações</a>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <a href="#">Sobre o Grupo</a>
              <a href="#">Contacto</a>
              <a href="#">Carreiras</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Suporte</h4>
              <a href="#">Centro de Ajuda</a>
              <a href="https://wa.me/244921167980">WhatsApp</a>
              <button className="footer-btn" onClick={() => setView('privacy')}>Política de Privacidade</button>
              <button className="footer-btn" onClick={() => setView('terms')}>Termos de Uso</button>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">Desenvolvido pelo Grupo Cassaminha · © {new Date().getFullYear()} Todos os direitos reservados</div>
            <div className="footer-ecosystem">
              <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.25)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Ecossistema do Grupo</span>
              <a href="#" className="eco-link">C Gestão Empresarial</a>
              <a href="#" className="eco-link">C Store Angola</a>
              <a href="#" className="eco-link">C Profit</a>
              <a href="#" className="eco-link active-link">Valida C</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
