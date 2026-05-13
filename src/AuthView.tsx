import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import './auth.css';

interface AuthViewProps {
  setView: (view: string) => void;
  onLoginSuccess: () => void;
}

export default function AuthView({ setView, onLoginSuccess }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ icon: string; msg: string; visible: boolean }>({ icon: '', msg: '', visible: false });
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [successScreenType, setSuccessScreenType] = useState<'login' | 'register' | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  
  const [regNome, setRegNome] = useState('');
  const [regApelido, setRegApelido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTel, setRegTel] = useState('');
  const [regPw, setRegPw] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      showToast('❌', 'Falha no login. Verifique as credenciais.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regNome || !regEmail || !regTel || regPw.length < 8) {
      showToast('⚠️', 'Preencha os campos obrigatórios e senha >= 8');
      return;
    }
    if (!termsAccepted) {
      showToast('⚠️', 'Aceite os termos para continuar.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPw);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: `${regNome} ${regApelido}`.trim() });
      
      const trialExpiresAt = new Date();
      trialExpiresAt.setMonth(trialExpiresAt.getMonth() + 1);

      // Create user doc
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: `${regNome} ${regApelido}`.trim(),
        email: regEmail,
        phone: regTel,
        role: 'user', // Default role
        status: 'pending', // Requires approval
        trialExpiresAt: trialExpiresAt,
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'users'));

      setSuccessScreenType('register');
      setTimeout(() => {
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

  const getPasswordStrength = () => {
    let score = 0;
    if (regPw.length >= 8) score++;
    if (/[A-Z]/.test(regPw)) score++;
    if (/[0-9]/.test(regPw)) score++;
    if (/[^A-Za-z0-9]/.test(regPw)) score++;
    return score;
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
                        <div className="form-title">Bem-vindo de volta 👋</div>
                        <div className="form-subtitle">Entre na sua conta para continuar</div>
                      </div>

                      <div className="social-btns">
                        <button className="btn-social" onClick={() => showToast('🔗','Login com Google em breve')}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                          Google
                        </button>
                        <button className="btn-social" onClick={() => showToast('📘','Login com Facebook em breve')}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </button>
                      </div>

                      <div className="or-divider">ou entre com e-mail</div>

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

                      <div className="switch-text">
                        Não tem conta? <a onClick={() => setActiveTab('register')}>Criar conta grátis</a>
                      </div>
                    </div>
                  )}

                  {activeTab === 'register' && (
                    <div className="form-panel active">
                      <div className="form-header">
                        <div className="form-title">Criar conta grátis ✦</div>
                        <div className="form-subtitle">Comece a vender mais hoje mesmo</div>
                      </div>

                      <div className="social-btns">
                        <button className="btn-social" onClick={() => showToast('🔗','Registo com Google em breve')}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                          Google
                        </button>
                        <button className="btn-social" onClick={() => showToast('📘','Registo com Facebook em breve')}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </button>
                      </div>

                      <div className="or-divider">ou crie com e-mail</div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Nome</label>
                          <input type="text" className="form-input" value={regNome} onChange={e=>setRegNome(e.target.value)} placeholder="Pedro" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Apelido</label>
                          <input type="text" className="form-input" value={regApelido} onChange={e=>setRegApelido(e.target.value)} placeholder="Silva" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input type="email" className="form-input" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="o.seu@email.com" />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Telefone / WhatsApp</label>
                        <div className="input-wrap">
                          <input type="tel" className="form-input has-icon" value={regTel} onChange={e=>setRegTel(e.target.value)} placeholder="9XX XXX XXX" />
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '.9rem' }}>🇦🇴</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Palavra-passe</label>
                        <div className="input-wrap">
                          <input type={showPassword ? 'text' : 'password'} className="form-input has-icon" value={regPw} onChange={e=>setRegPw(e.target.value)} placeholder="Mínimo 8 caracteres" />
                          <span className="input-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </span>
                        </div>
                        {regPw.length > 0 && (
                          <div className="pw-strength show">
                            <div className="pw-bars">
                              <div className={`pw-bar ${getPasswordStrength() >= 1 ? 'weak' : ''}`}></div>
                              <div className={`pw-bar ${getPasswordStrength() >= 2 ? 'medium' : ''}`}></div>
                              <div className={`pw-bar ${getPasswordStrength() >= 3 ? 'strong' : ''}`}></div>
                              <div className={`pw-bar ${getPasswordStrength() >= 4 ? 'strong' : ''}`}></div>
                            </div>
                            <div className="pw-label" style={{ color: getPasswordStrength() < 2 ? 'var(--auth-red)' : getPasswordStrength() < 3 ? '#f59e0b' : 'var(--auth-green)' }}>
                              {getPasswordStrength() < 2 ? 'Fraca' : getPasswordStrength() < 3 ? 'Razoável' : 'Forte'}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="check-row">
                        <input type="checkbox" className="check-input" id="terms" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} />
                        <label className="check-label" htmlFor="terms">
                          Aceito os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a> da Valida C.
                        </label>
                      </div>

                      <button className="btn-submit" onClick={handleRegister} disabled={loading}>
                        {!loading ? <span className="btn-text">Criar conta grátis</span> : <div className="spinner"></div>}
                      </button>

                      <div className="switch-text">
                        Já tem conta? <a onClick={() => setActiveTab('login')}>Entrar agora</a>
                      </div>
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
