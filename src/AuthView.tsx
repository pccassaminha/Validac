import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import './auth.css';

interface AuthViewProps {
  setView: (view: string) => void;
  onLoginSuccess: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthView({ setView, onLoginSuccess, initialTab = 'login' }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ icon: string; msg: string; visible: boolean }>({ icon: '', msg: '', visible: false });
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [successScreenType, setSuccessScreenType] = useState<'login' | 'register' | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');

  // Cursors
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = cursorRef.current;
    const ring = ringRef.current;
    if (!cur || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animFrame: number;

    const onMouse = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; cur.style.left = mx + 'px'; cur.style.top = my + 'px'; };
    window.addEventListener('mousemove', onMouse);

    const animR = () => {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      animFrame = requestAnimationFrame(animR);
    };
    animR();

    return () => {
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const showToast = (icon: string, msg: string) => {
    setToast({ icon, msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPw) {
      showToast('⚠️', 'Preencha e-mail e palavra-passe');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPw);
      setSuccessScreenType('login');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } catch (error: any) {
      if (loginEmail.toLowerCase() === 'grupocassaminha@gmail.com' || loginEmail.toLowerCase() === 'grupocasssaminha@gmail.com') {
         try {
            const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPw);
            const user = userCredential.user;
            await updateProfile(user, { displayName: 'Pedro Cassaminha' });
            // Criar doc do utilizador admin
            await setDoc(doc(db, 'users', user.uid), {
              id: user.uid,
              name: 'Pedro Cassaminha',
              email: loginEmail,
              phone: '',
              role: 'admin',
              status: 'approved',
              createdAt: serverTimestamp()
            }).catch(err => console.error("Could not create user document", err));

            setSuccessScreenType('login');
            setTimeout(() => {
              onLoginSuccess();
            }, 1500);
            return;
         } catch (createError) {
            console.error('Failed to create super admin:', createError);
         }
      }
      showToast('❌', 'Falha no login. Verifique as credenciais.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regNome || !regEmail || regPw.length < 6) {
      showToast('⚠️', 'Preencha os campos obrigatórios. Senha mínima 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPw);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: regNome.trim() });
      
      // Create user doc as pending
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: regNome.trim(),
        email: regEmail,
        status: 'pending', // Requires approval
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'users'));

      setSuccessScreenType('register');
      setTimeout(() => {
         // Auto-login succeeds but they will just be stopped by the restriction page if pending
         onLoginSuccess();
      }, 2000);
    } catch (error: any) {
      showToast('❌', 'Erro ao criar conta. ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail) { showToast('⚠️', 'Introduza um e-mail válido.'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      showToast('✉️', 'Link enviado para ' + forgotEmail);
      setForgotModalOpen(false);
    } catch(err) {
      showToast('❌', 'Erro ao enviar link de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={ringRef}></div>

      {/* TOAST */}
      <div className={`toast ${toast.visible ? 'show' : ''}`}>
        <span className="toast-icon">{toast.icon}</span>
        <span>{toast.msg}</span>
      </div>

      {/* FORGOT MODAL */}
      <div className={`modal-overlay ${forgotModalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setForgotModalOpen(false); }}>
        <div className="modal-card">
          <button className="modal-close" onClick={() => setForgotModalOpen(false)}>✕</button>
          <div className="modal-title">Recuperar palavra-passe</div>
          <div className="modal-desc">Introduza o seu e-mail e enviaremos um link para redefinir a sua palavra-passe.</div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-input" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="o.seu@email.com"/>
          </div>
          <button className="btn-submit" onClick={handleForgot} disabled={loading} style={{ marginTop: '4px' }}>
            {!loading ? <span className="btn-text">Enviar link de recuperação</span> : <div className="spinner"></div>}
          </button>
        </div>
      </div>

      <div className="auth-layout">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="lp-grid"></div>
          <div className="lp-blob lb1"></div>
          <div className="lp-blob lb2"></div>
          <div className="lp-blob lb3"></div>

          <div className="lp-content">
            <div className="lp-logo" onClick={() => setView('home')}>
              <div className="lp-logo-icon"><img src="https://i.postimg.cc/qqtQqXb4/C-grupo.png" alt="Logo"/></div>
              Valida C
            </div>

            <div className="lp-middle">
              <div className="lp-badge">
                <div className="badge-dot"></div>
                Plataforma activa
              </div>
              <h2 className="lp-title">Venda mais.<br/><span className="grad">Com mais controlo.</span></h2>
              <p className="lp-desc">A Valida C centraliza as suas páginas, leads e clientes numa só plataforma desenhada para o mercado angolano.</p>

              <div className="lp-features">
                <div className="lp-feat">
                  <div className="lp-feat-icon fi-blue">🗂️</div>
                  <div>
                    <div className="lp-feat-title">Múltiplas páginas de produto</div>
                    <div className="lp-feat-desc">Crie e publique landing pages em minutos, sem código.</div>
                  </div>
                </div>
                <div className="lp-feat">
                  <div className="lp-feat-icon fi-violet">🔁</div>
                  <div>
                    <div className="lp-feat-title">Leads directo no WhatsApp</div>
                    <div className="lp-feat-desc">Pedidos organizados chegam automaticamente ao seu número.</div>
                  </div>
                </div>
                <div className="lp-feat">
                  <div className="lp-feat-icon fi-green">📊</div>
                  <div>
                    <div className="lp-feat-title">CRM e analytics integrados</div>
                    <div className="lp-feat-desc">Conheça os seus clientes e tome decisões com dados reais.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lp-stats">
              <div className="lp-stat">
                <div className="lp-stat-num">247+</div>
                <div className="lp-stat-label">Páginas criadas</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">12K+</div>
                <div className="lp-stat-label">Leads capturados</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">34%</div>
                <div className="lp-stat-label">Taxa de conversão</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="auth-card">
            {!successScreenType ? (
              <>
                {/* TABS */}
                <div className="auth-tabs">
                  <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Entrar</button>
                  <button className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Criar Conta</button>
                </div>

                {/* FORMS */}
                <div className="auth-form-wrap">
                  
                  {activeTab === 'login' && (
                    <div className="form-panel active">
                      <div className="form-header">
                        <div className="form-title">Gerir Plataforma 👋</div>
                        <div className="form-subtitle">Entre na sua conta para continuar</div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input type="email" className="form-input" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="o.seu@email.com"/>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Palavra-passe</label>
                        <div className="input-wrap">
                          <input type={showPassword ? 'text' : 'password'} className="form-input has-icon" value={loginPw} onChange={e=>setLoginPw(e.target.value)} placeholder="A sua palavra-passe" onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
                          <span className="input-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </span>
                        </div>
                      </div>

                      <div className="forgot-row">
                        <a className="forgot-link" onClick={() => setForgotModalOpen(true)}>Esqueceu a palavra-passe?</a>
                      </div>

                      <button className="btn-submit" onClick={handleLogin} disabled={loading}>
                        {!loading ? <span className="btn-text">Entrar na conta</span> : <div className="spinner"></div>}
                      </button>
                    </div>
                  )}

                  {activeTab === 'register' && (
                    <div className="form-panel active">
                      <div className="form-header">
                        <div className="form-title">Solicitar Acesso ✦</div>
                        <div className="form-subtitle">Crie conta e aguarde a aprovação</div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Nome Completo</label>
                        <input type="text" className="form-input" value={regNome} onChange={e=>setRegNome(e.target.value)} placeholder="O seu nome" />
                      </div>

                      <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input type="email" className="form-input" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="o.seu@email.com" />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Palavra-passe</label>
                        <div className="input-wrap">
                          <input type={showPassword ? 'text' : 'password'} className="form-input has-icon" value={regPw} onChange={e=>setRegPw(e.target.value)} placeholder="Mínimo 6 caracteres" onKeyDown={e => e.key === 'Enter' && handleRegister()}/>
                          <span className="input-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </span>
                        </div>
                      </div>

                      <button className="btn-submit" onClick={handleRegister} disabled={loading}>
                        {!loading ? <span className="btn-text">Criar conta</span> : <div className="spinner"></div>}
                      </button>
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="success-screen" style={{ display: 'flex' }}>
                <div className="success-anim">✦</div>
                <div className="success-title">{successScreenType === 'login' ? 'Bem-vindo de volta! 👋' : 'Conta criada!'}</div>
                <div className="success-desc">
                  {successScreenType === 'login' ? 'Login efectuado com sucesso. A redirecionar para o painel...' : 'A sua conta foi criada com sucesso. Redirecionando...'}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
