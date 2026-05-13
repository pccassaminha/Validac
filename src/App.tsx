import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, CheckCircle, PackageOpen, TriangleAlert, Crown, XCircle, ArrowLeft, Lock, Loader2, Info, Star, Eye, EyeOff, Copy, MessageCircle, Search, Filter, Download, User, LayoutDashboard, Settings, ExternalLink, LogOut, ChevronDown, Store, FileText, AlertOctagon, Trash2, Timer, Paperclip, FolderOpen, Monitor, Smartphone, Tablet, Bot, Upload, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, orderBy, serverTimestamp, Timestamp, deleteDoc, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword, updateProfile, updateEmail, onAuthStateChanged, signOut } from 'firebase/auth';
import './home.css';
import AuthView from './AuthView';
import PaymentView from './PaymentView';
import SettingsView from './SettingsView';
import HomeView from './HomeView';

// ==========================================
// MÁQUINA DE GROWTH: Configuração de Pixels
// ==========================================
const campaignConfigs: Record<string, { fbPixel: string; googleTag: string }> = {
  "Secador Inteligente UV": {
    // ATENÇÃO: Substitua os valores abaixo pelos seus IDs reais
    fbPixel: "1234567890", // Exemplo: 1234567890
    googleTag: "AW-123456789" // Exemplo: AW-123456789
  }
};

let pixelsLoaded = false;

const initTracking = (produto: string) => {
  if (pixelsLoaded || typeof window === 'undefined') return;
  const config = campaignConfigs[produto];
  if (!config) return;

  // Facebook Pixel
  if (config.fbPixel) {
    // @ts-ignore
    !function(f,b,e,v,n,t,s)
    {if((f as any).fbq)return;n=(f as any).fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!(f as any)._fbq)(f as any)._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e) as HTMLScriptElement;t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    if(s && s.parentNode) s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    (window as any).fbq('init', config.fbPixel);
    (window as any).fbq('track', 'PageView');
  }

  // Google Analytics
  if (config.googleTag) {
    const scriptTag = document.createElement('script');
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleTag}`;
    document.head.appendChild(scriptTag);
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(){(window as any).dataLayer.push(arguments);}
    (window as any).gtag = gtag;
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', config.googleTag);
  }

  pixelsLoaded = true;
};

const trackEvent = (produto: string, eventName: string, fbEvent: string) => {
  const config = campaignConfigs[produto];
  if (!config) return;
  if (config.fbPixel && (window as any).fbq) {
    (window as any).fbq('track', fbEvent);
  }
  if (config.googleTag && (window as any).gtag) {
    (window as any).gtag('event', eventName, { 'send_to': config.googleTag });
  }
};

const TESTIMONIALS = [
  { name: "Pedro M., Luanda", comment: "Sempre sofri com chulé por causa do suor no ginásio. O Secador UV resolveu isso em dois dias. Incrível!", rating: 5 },
  { name: "Sílvia C., Talatona", comment: "Vale cada kwanza. Seca os sapatos rápido sem estragar o material. Excelente para época de chuva.", rating: 5 },
  { name: "Rui F., Benguela", comment: "Chegou super rápido e funciona perfeitamente. Pagar só na entrega deu-me muita segurança.", rating: 4 }
];

const TESTIMONIALS_ROUPAS = [
  { name: "Joana S., Maianga", comment: "Moro num apartamento pequeno e não tinha como secar a roupa no inverno. Este secador mudou a minha vida. Muito prático!", rating: 5 },
  { name: "Carlos A., Kilamba", comment: "Com as fardas das crianças demorando a secar, estávamos sempre aflitos. Agora em poucas horas a roupa está pronta.", rating: 5 },
  { name: "Marta V., Talatona", comment: "Silencioso e super rápido. Seco minhas camisas mais delicadas sem medo de estragar.", rating: 4 }
];

const RECENT_BUYERS = [
  { name: "Kelson", city: "Luanda", time: "Há 2 min" },
  { name: "Nádia", city: "Talatona (Luanda)", time: "Há 5 min" },
  { name: "Paulo", city: "Kilamba (Luanda)", time: "Há 1 min" },
  { name: "Beatriz", city: "Viana (Luanda)", time: "Agora" },
  { name: "Helder", city: "Nova Vida (Luanda)", time: "Há 10 min" },
  { name: "Cláudio", city: "Maianga (Luanda)", time: "Há 3 min" },
  { name: "Ana", city: "Benfica (Luanda)", time: "Há 8 min" },
  { name: "João", city: "Talatona (Luanda)", time: "Há 4 min" }
];

const IMAGES = [
  "https://i.postimg.cc/PJc42xy9/main-image-1.webp",
  "https://i.postimg.cc/gkX4rVcH/main-image-2.webp",
  "https://i.postimg.cc/Qx9SVQxZ/main-image-3.webp",
  "https://i.postimg.cc/gkX4rVc1/main-image-4.webp",
  "https://i.postimg.cc/FsdG1yFP/main-image-5.webp",
  "https://i.postimg.cc/qMPwKNgF/main-image-6.webp"
];

const IMAGES_ROUPAS = [
  "https://i.postimg.cc/RCd8qXgb/main-image-1.webp",
  "https://i.postimg.cc/8PCYvMYq/main-image-5.webp",
  "https://i.postimg.cc/Prq7DY72/main-image-2.webp",
  "https://i.postimg.cc/c4Jz3wzF/main-image-3.webp",
  "https://i.postimg.cc/BQvzFHzk/main-image-4.webp",
];


type ModalState = 'none' | 'step1' | 'last-chance' | 'success' | 'rejected' | 'profile' | 'danger-zone' | 'danger-action-page-prompt' | 'danger-action-page-confirm' | 'danger-action-all-prompt' | 'danger-alert' | 'delete-lead-confirm';

export default function App() {
  const [view, setView] = useState<'home' | 'sales' | 'sales-roupas' | 'admin' | 'pages' | 'danger-zone' | 'ai-generator' | 'settings' | 'prompt-gallery'>(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    if (product === 'secador-uv') return 'sales';
    if (product === 'cabide-secador') return 'sales-roupas';
    return 'home';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // AI Generator State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Olá! Sou a IA da Valida C. Descreve a landing page que desejas criar hoje, ou escolhe um dos nossos prompts na Galeria de Prompts.'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{name: string, type: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [projectName, setProjectName] = useState('Nova Página IA');
  const [generatedCode, setGeneratedCode] = useState('// O código processado pela IA aparecerá aqui...\n\nexport default function GeneratedPage() {\n  return (\n    <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400">\n      <p>A aguardar a geração da página...</p>\n    </div>\n  );\n}');
  const [selectedApi, setSelectedApi] = useState('gemini_free');
  const [aiKeys, setAiKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('valida_c_ai_keys') || '{"openai": "", "gemini": "", "anthropic": ""}'); }
    catch { return {openai: '', gemini: '', anthropic: ''}; }
  });
  
  // Profile State
  const [profileFormData, setProfileFormData] = useState({ name: '', email: '', password: '' });
  
  // Sales State
  const [modalState, setModalState] = useState<ModalState>('none');
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [dangerActionContext, setDangerActionContext] = useState<{
    pageName?: string;
    leadCount?: number;
    docsToDelete?: import('firebase/firestore').QueryDocumentSnapshot<import('firebase/firestore').DocumentData, import('firebase/firestore').DocumentData>[];
    alertMessage?: string;
  }>({});
  const [dangerInputValue, setDangerInputValue] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  
  // Admin State
  const [adminData, setAdminData] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  
  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userStatus, setUserStatus] = useState<'pending' | 'approved' | 'blocked' | 'expired' | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Admin Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState('Tudo');
  
  // Gallery State
  const [activeImage, setActiveImage] = useState(0);
  
  // Popup State
  const [activePopup, setActivePopup] = useState<any>(null);

  useEffect(() => {
    if (view !== 'sales' && view !== 'sales-roupas') return;
    
    setTimeLeft(600); // 10 minutes
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [view]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (view === 'sales') {
      params.set('product', 'secador-uv');
      document.title = 'Secador Inteligente UV - Reserva Premium';
    } else if (view === 'sales-roupas') {
      params.set('product', 'cabide-secador');
      document.title = 'Secador Expresso Pro - C Store Angola';
    } else if (view === 'admin' || view === 'pages' || view === 'danger-zone' || view === 'ai-generator' || view === 'settings' || view === 'prompt-gallery') {
      params.delete('product');
      document.title = 'Administração - Valida C';
    } else {
      params.delete('product');
      document.title = 'Valida C - Plataforma de Vendas';
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [view]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Load user DB object to check status
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            let finalStatus = data.status || 'pending';
            
            // Check expiration if pending
            if (finalStatus === 'pending' && data.trialExpiresAt) {
               const now = new Date();
               const exp = data.trialExpiresAt.toDate();
               if (now > exp) finalStatus = 'expired';
            }
            
            setUserStatus(finalStatus as any);
          } else {
             // Admin fallback or old user
             if (user.email === 'exportacoes.extras@gmail.com') setUserStatus('approved');
             else setUserStatus('pending'); // assume new user without doc
          }
        } catch (e) {
          console.error('Error fetching user status:', e);
        }

        if (view === 'admin' || view === 'pages' || view === 'danger-zone' || view === 'ai-generator' || view === 'settings' || view === 'prompt-gallery') {
           loadAdminData();
        }
      } else {
        setIsAuthenticated(false);
        setUserStatus(null);
      }
    });

    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    if (view !== 'sales' && view !== 'sales-roupas') return;

    const handleScroll = () => {
      const comprarEl = document.getElementById('comprar');
      if (comprarEl) {
        const rect = comprarEl.getBoundingClientRect();
        // Visible when top is less than viewport height (with a small buffer so it doesn't disappear too early)
        // and bottom is greater than 0
        if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
          setIsCheckoutVisible(true);
        } else {
          setIsCheckoutVisible(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  useEffect(() => {
    if (view === 'sales' || view === 'sales-roupas') {
      const produtoName = view === 'sales-roupas' ? 'Secador Expresso Pro 34 900 Kz' : 'Secador Inteligente UV';
      initTracking(produtoName);
      
      const imagesList = view === 'sales-roupas' ? IMAGES_ROUPAS : IMAGES;
      
      const timer = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % imagesList.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [view]);

  useEffect(() => {
    if (view !== 'sales' && view !== 'sales-roupas') return;
    
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNext = () => {
      // Show every 12 to 25 seconds randomly
      const delay = 12000 + Math.random() * 13000;
      timeoutId = setTimeout(() => {
        const randomBuyer = RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
        setActivePopup(randomBuyer);
        
        setTimeout(() => {
          setActivePopup(null);
          scheduleNext();
        }, 5000); // Display for 5 seconds
      }, delay);
    };
    
    // Initial popup after 3 seconds
    timeoutId = setTimeout(() => {
       const initialBuyer = RECENT_BUYERS[0];
       setActivePopup(initialBuyer);
       setTimeout(() => {
         setActivePopup(null);
         scheduleNext();
       }, 5000);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [view]);

  // ----------------------------------------------------
  // Sales Logic
  // ----------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const produtoName = view === 'sales-roupas' ? 'Secador Expresso Pro 34 900 Kz' : 'Secador Inteligente UV';
    const pricePerUnit = view === 'sales-roupas' ? 34900 : 24900;

    const tempLead = {
      ...formData,
      province: 'Luanda', // Form doesn't have it, hardcoding for now or we could add it
      produto: produtoName,
      totalPrice: formData.quantity * pricePerUnit,
      status: 'Pendente',
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'leads'), tempLead);
      setCurrentLeadId(docRef.id);
      
      // Disparar Evento Lead (Pendente)
      trackEvent(produtoName, 'generate_lead', 'Lead');
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('missing or insufficient permissions')) {
         handleFirestoreError(err, OperationType.CREATE, 'leads');
      }
      console.error("Erro ao criar lead:", err);
    }

    setIsSubmitting(false);
    setModalState('step1');
  };

  const processReservation = async (isAccepted: boolean) => {
    setModalState('none');
    
    const produtoName = view === 'sales-roupas' ? 'Secador Expresso Pro 34 900 Kz' : 'Secador Inteligente UV';

    if (isAccepted) {
      setTimeout(() => setModalState('success'), 300);
      
      // Disparar Evento Custom/AddToCart (Reservado)
      trackEvent(produtoName, 'add_to_cart', 'AddToCart');
    } else {
      setTimeout(() => setModalState('rejected'), 300);
    }

    if (currentLeadId) {
      try {
        await updateDoc(doc(db, 'leads', currentLeadId), {
          status: isAccepted ? 'Reservado' : 'Rejeitado'
        });
      } catch (err: any) {
        if (err instanceof Error && err.message.includes('missing or insufficient permissions')) {
           handleFirestoreError(err, OperationType.UPDATE, `leads/${currentLeadId}`);
        }
        console.error("Erro ao atualizar lead:", err);
      }
    }
  };

  const closeModal = () => {
    setModalState('none');
    setFormData({ name: '', phone: '', address: '', quantity: 1 });
  };

  // ----------------------------------------------------
  // Admin Logic
  // ----------------------------------------------------
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setLoginError('Por favor, introduza o seu email no campo acima para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      alert('Link de recuperação enviado! Verifique o seu email.');
    } catch (err: any) {
      setLoginError('Erro ao recuperar senha: ' + err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      if (profileFormData.name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: profileFormData.name });
      }
      
      if (profileFormData.email !== auth.currentUser.email && profileFormData.email.trim() !== '') {
        await updateEmail(auth.currentUser, profileFormData.email);
      }
      
      if (profileFormData.password.trim() !== '') {
        await updatePassword(auth.currentUser, profileFormData.password);
      }
      
      alert('Perfil atualizado com sucesso!');
      setModalState('none');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        alert('Por motivos de segurança, deverá terminar sessão e voltar a entrar antes de atualizar dados sensíveis.');
      } else {
        alert('Erro ao atualizar perfil: ' + err.message);
      }
    }
  };

  const openProfileModal = () => {
    setProfileFormData({
      name: auth.currentUser?.displayName || 'Pedro',
      email: auth.currentUser?.email || '',
      password: ''
    });
    setModalState('profile');
  };

  const handlePasswordChange = async () => {
    const newPass = prompt("Digite a nova senha para o seu painel:");
    if (!newPass || newPass.trim() === '') return;
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPass);
        alert('Senha alterada com sucesso!');
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        alert('Por motivos de segurança, deverá terminar sessão e voltar a entrar antes de alterar a senha.');
      } else {
        alert('Erro ao alterar senha: ' + err.message);
      }
    }
  };

  const toggleAdmin = () => {
    if (view === 'sales') {
      setView('admin');
      if (isAuthenticated) {
        loadAdminData();
      }
    } else {
      setView('sales');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAdminLoading(true);

    try {
      if (loginEmail.toLowerCase() === 'grupocassaminha@gmail.com') {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        } catch (authErr: any) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-login-credentials' || authErr.code === 'auth/invalid-credential') {
             // If the user doesn't exist, we create it. Warning: Production apps should handle this differently
             try {
                await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
             } catch (createErr: any) {
                setLoginError('Erro ao criar conta: ' + (createErr.message || 'Erro desconhecido'));
                setIsAdminLoading(false);
                return;
             }
          } else {
             setLoginError('Erro ao fazer login: ' + (authErr.message || 'Credenciais inválidas.'));
             setIsAdminLoading(false);
             return;
          }
        }
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setLoginError('Endereço de e-mail não autorizado.');
      }
    } catch (err) {
      setLoginError('Ocorreu um erro ao fazer login.');
    }
    setIsAdminLoading(false);
  };

  const loadAdminData = async () => {
    setIsAdminLoading(true);
    setAdminError('');
    
    try {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : doc.data().timestamp
      }));
      setAdminData(leads);
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.GET, 'leads');
      }
      console.error(err);
      setAdminError('Erro na comunicação com a base de dados.');
    }
    setIsAdminLoading(false);
  };

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'decimal', minimumFractionDigits: 2 }).format(value) + ' Kz';
  };

  const handleCopyLead = (lead: any) => {
    const q = lead.quantity || 1;
    const product = lead.produto || 'Secador Inteligente UV';
    const total = lead.totalPrice ? formatKz(lead.totalPrice) : formatKz(q * 24900);
    const text = `Cliente: ${lead.name}\ntelefone: ${lead.phone}\nProdutos: ${q} - ${product}\nLocal: ${lead.address}\nTotal: ${total}`;
    navigator.clipboard.writeText(text);
    alert('Informações copiadas!');
  };

  const handleWhatsApp = (lead: any) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const q = lead.quantity || 1;
    const product = lead.produto || 'Secador Inteligente UV';
    const total = lead.totalPrice ? formatKz(lead.totalPrice) : formatKz(q * 24900);
    const text = `Cliente: ${lead.name}\ntelefone: ${lead.phone}\nProdutos: ${q} - ${product}\nLocal: ${lead.address}\nTotal: ${total}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}/?text=${encodedText}`, '_blank');
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Update no UI otimista
    setAdminData(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await updateDoc(doc(db, 'leads', leadId), { status: newStatus });
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadId}`);
      }
      console.error("Erro ao atualizar status:", err);
      // Carregar os dados reais em caso de erro no servidor
      loadAdminData();
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    const headers = ["Data", "Nome", "WhatsApp", "Produto", "Qtd", "Endereço", "Status"];
    const csvRows = [headers.join(",")];

    filteredData.forEach(lead => {
      const date = lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A';
      const q = lead.quantity || 1;
      // Prevenir problemas com vírgulas escapando com aspas duplas
      const row = [
        `"${date}"`,
        `"${lead.name || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.produto || 'Secador Inteligente UV'}"`,
        q,
        `"${lead.address || ''}"`,
        `"${lead.status || ''}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + "\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Valida_C_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredData = adminData.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus || (lead.status && lead.status.includes('Reservado') && filterStatus === 'Reservado');
    const matchesDate = filterDate === '' || (lead.timestamp && new Date(lead.timestamp).toISOString().split('T')[0] === filterDate);
    const matchesProduct = filterProduct === '' || (lead.produto || 'Secador Inteligente UV').toLowerCase().includes(filterProduct.toLowerCase());
    
    // Filtro CRM por período (Hoje, Últimos 7 dias, etc.)
    let passesTimeRange = true;
    const leadDateStr = lead.timestamp || (lead.createdAt && lead.createdAt.toDate ? lead.createdAt.toDate().toISOString() : null);
    if (leadDateStr && timeRangeFilter !== 'Tudo') {
        const leadDate = new Date(leadDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (timeRangeFilter === 'Hoje') {
            passesTimeRange = leadDate >= today;
        } else if (timeRangeFilter === 'Últimos 7 Dias') {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            passesTimeRange = leadDate >= sevenDaysAgo;
        } else if (timeRangeFilter === 'Este Mês') {
            passesTimeRange = leadDate.getMonth() === today.getMonth() && leadDate.getFullYear() === today.getFullYear();
        }
    }

    return matchesSearch && matchesStatus && matchesDate && matchesProduct && passesTimeRange;
  });

  const totalSubmissions = adminData.length;
  const totalReservados = adminData.filter(d => d.status && d.status.includes('Reservado')).length;
  const conversionRate = totalSubmissions > 0 ? ((totalReservados / totalSubmissions) * 100).toFixed(1) : '0.0';

  const uniquePages = Array.from(new Set([
    'Secador Inteligente UV',
    'Secador Expresso Pro 34 900 Kz',
    ...adminData.map(l => l.produto).filter(Boolean)
  ]));

  const isProtectedView = ['admin', 'pages', 'danger-zone', 'ai-generator', 'settings', 'prompt-gallery'].includes(view);

  if (view === 'auth' || (isProtectedView && !isAuthenticated && userStatus !== undefined)) {
    return <AuthView setView={setView} onLoginSuccess={() => setView('pages')} />;
  }

  if (isProtectedView && isAuthenticated && userStatus === null) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  if (isProtectedView && isAuthenticated && (userStatus === 'blocked' || userStatus === 'expired' || userStatus === 'pending')) {
    return <PaymentView reason={userStatus} onLogout={() => { setView('home'); auth.signOut(); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation handled by HomeView if view === 'home' */}
      {view !== 'home' && (
        <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
              {view === 'admin' || view === 'pages' || view === 'danger-zone' || view === 'ai-generator' || view === 'settings' || view === 'prompt-gallery' ? (
                <>
                  <img 
                    src="https://i.postimg.cc/qqtQqXb4/C-grupo.png" 
                    alt="Logotipo C Grupo" 
                    className="h-8 w-auto object-contain rounded"
                  />
                  <span className="font-bold text-lg tracking-tight">Valida C</span>
                </>
              ) : (
                <>
                  <img 
                    src="https://i.postimg.cc/3wsKF20v/Chat-GPT-Image-13-de-mai-de-2026-12-40-58.png"
                    alt="Logotipo C Store Angola" 
                    className="h-10 w-auto object-contain rounded"
                  />
                  <span className="font-bold text-lg tracking-tight">C Store Angola</span>
                </>
              )}
            </div>
          
          <div className={`flex items-center gap-4 ${(view === 'sales' || view === 'sales-roupas') ? 'hidden md:flex' : ''}`}>
            {isAuthenticated && (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 border border-slate-700 bg-slate-800/80 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                     {(auth.currentUser?.displayName || 'Pedro').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Olá, {auth.currentUser?.displayName || 'Pedro'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 ml-1"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 z-50 overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          <button 
                            onClick={() => { setIsDropdownOpen(false); openProfileModal(); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <User size={16} /> Meu Perfil
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setView('admin'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <FileText size={16} /> Painel de Leads
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setView('pages'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <LayoutDashboard size={16} /> Gerenc. Páginas
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setView('ai-generator'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <Star size={16} /> Estúdio de IA
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setView('prompt-gallery'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <FileText size={16} /> Galeria de Prompts
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); setView('settings'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                          >
                            <Settings size={16} /> Configurações Gerais
                          </button>
                        </div>
                        <div className="p-2 border-t border-slate-700">
                          <button 
                            onClick={async () => { await signOut(auth); setIsDropdownOpen(false); setIsAuthenticated(false); setView('sales'); }} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors text-left font-medium"
                          >
                            <LogOut size={16} /> Sair
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            {!isAuthenticated && view !== 'home' && (
              <button 
                onClick={() => setView('admin')} 
                className="text-sm font-medium flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                <Lock size={14} /> Entrar
              </button>
            )}
          </div>
        </div>
      </nav>
      )}

      {/* NEW HOME VIEW */}
      {view === 'home' && (
        <HomeView setView={setView} isAuthenticated={isAuthenticated} currentUser={auth.currentUser} />
      )}

      {/* Old Home Footer removed, handled by new HomeView */}

      {/* SALES VIEW */}
      {view === 'sales' && (
        <main className="pb-24">
          
          {/* Header content */}
          <section className="pt-10 pb-6 px-4 max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6"
            >
              🔥 Mais de 150 unidades reservadas esta semana
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight"
            >
              Pare de estragar o seu calçado e <span className="text-indigo-600 block sm:inline">elimine o mau cheiro pela raiz.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2"
            >
              O primeiro Esterilizador Inteligente com Tecnologia UV em Angola que seca de forma segura e destrói fungos enquanto você descansa.
            </motion.p>
          </section>

          {/* Product Gallery */}
          <section className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-2xl border border-slate-200">
              <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4 group shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    src={IMAGES[activeImage]}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full h-full object-cover absolute inset-0"
                    alt={`Produto Imagem ${activeImage + 1}`}
                  />
                </AnimatePresence>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {IMAGES.map((src, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden snap-center transition-all ${
                      i === activeImage 
                        ? 'ring-4 ring-indigo-500 opacity-100 scale-105' 
                        : 'ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={src} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-4">
            {/* Features (Mobile First stacking) */}
            <section className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <ShieldAlert className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Elimina Fungos</h3>
                <p className="text-sm text-slate-500 leading-relaxed">A luz UV destrói 99,9% das bactérias causadoras do pé de atleta e chulé.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <Activity className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Secagem Segura</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Calor 360º não deforma nem queima couro ou tecidos caros.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Cuidado Premium</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Prolonga a vida útil dos seus ténis molhados pela chuva ou suor.</p>
              </div>
            </section>

            {/* Product Specifications */}
            <section className="mb-14 text-left max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Settings size={20} /></div>
                Especificações Técnicas
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Tipo de Secador</span>
                    <span className="font-medium text-slate-900 text-right">Secador de calçado elétrico portátil</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Potência</span>
                    <span className="font-medium text-slate-900 text-right">33W</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Aquecimento</span>
                    <span className="font-medium text-slate-900 text-right">Temperatura constante de 48ºC</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Temporizador</span>
                    <span className="font-medium text-slate-900 text-right">0 a 120 minutos, automático</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Capacidade</span>
                    <span className="font-medium text-slate-900 text-right">2 Calçados (1 par) em simultâneo</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Dimensões (Aprox.)</span>
                    <span className="font-medium text-slate-900 text-right">26 x 16 x 7.4 cm</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Material da Carcaça</span>
                    <span className="font-medium text-slate-900 text-right">Plástico resistente ao calor</span>
                  </div>
                  <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                    <span className="font-semibold text-slate-600">Usabilidade</span>
                    <span className="font-medium text-slate-900 text-right">Casa, Escritório, Viagem e Camping</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="mb-14">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Quem comprou, recomenda!</h2>
                <p className="text-slate-500 max-w-lg mx-auto">Veja o que os nossos clientes dizem sobre a eficácia do Secador Inteligente UV.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex gap-1 mb-4">
                       {Array.from({length: 5}).map((_, i) => (
                         <Star key={i} size={18} className={i < t.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} />
                       ))}
                    </div>
                    <p className="text-slate-700 text-sm italic mb-6 flex-grow leading-relaxed">"{t.comment}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                         {t.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Offer & Form Layout */}
            <section id="comprar" className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative">
              
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-indigo-500 to-indigo-600" />
              
              <div className="p-6 sm:p-10 flex flex-col md:flex-row gap-10 items-center">
                
                {/* Visual / Price */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 relative">
                    <div className="absolute -top-3 right-4 bg-emerald-500 text-white font-bold py-1 px-3 rounded-full text-sm shadow-md animate-pulse">
                      Poupa 10.100 Kz
                    </div>
                    <p className="text-slate-400 line-through text-lg mb-1 font-medium">De: 35.000 Kz</p>
                    <p className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">24.900 <span className="text-2xl text-slate-500">Kz</span></p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 font-bold mb-2">
                      <PackageOpen size={20} /> Entregas para Luanda
                    </div>
                    <p className="text-sm text-slate-500">* Pague apenas quando receber o produto.</p>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/60 p-4 rounded-xl text-amber-900 text-sm font-medium text-left">
                    <Info className="shrink-0 text-amber-500 mt-0.5" size={18} />
                    <p>Atenção: Devido ao elevado volume de pedidos, poderão ocorrer rupturas de stock. Garanta já a sua reserva abaixo.</p>
                  </div>
                </div>

                {/* Form */}
                <div className="w-full md:w-1/2">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Reserve sem compromisso</h2>
                    <p className="text-slate-500 text-sm mb-4">Garantimos o seu envio prioritário.</p>
                    <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl flex items-center justify-between font-bold shadow-sm">
                      <div className="flex items-center gap-2">
                        <Timer className="animate-pulse" size={20} />
                        Oferta expira em:
                      </div>
                      <span className="text-xl font-black bg-white px-3 py-1 rounded-md shadow-sm border border-red-100 tabular-nums">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name-input">Nome Completo</label>
                      <input 
                        id="name-input"
                        type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                        placeholder="Ex: João da Silva" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de WhatsApp</label>
                      <input 
                        type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                        placeholder="Ex: 921 167 980" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço Completo</label>
                      <input 
                        type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                        placeholder="Bairro, Rua, Referência" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantidade</label>
                      <div className="relative">
                        <select 
                          value={formData.quantity}
                          onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                        >
                           {Array.from({ length: 10 }).map((_, i) => {
                             const q = i + 1;
                             return (
                               <option key={q} value={q}>
                                 {q} {q === 1 ? 'unidade' : 'unidades'} - {new Intl.NumberFormat('pt-AO', { style: 'decimal', minimumFractionDigits: 2 }).format(q * 24900)} Kz
                               </option>
                             );
                           })}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <button 
                      type="submit" disabled={isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:hover:bg-emerald-500 disabled:scale-100 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 mt-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR RESERVA VIP'}
                    </button>
                  </form>
                </div>

              </div>
            </section>
          </div>
        </main>
      )}

      {/* FOOTER */}
      {view === 'sales' && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 text-center mt-auto pb-28 md:pb-12 shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <img 
              src="https://i.postimg.cc/3wsKF20v/Chat-GPT-Image-13-de-mai-de-2026-12-40-58.png" 
              alt="Logotipo C Store Angola" 
              className="h-10 w-auto object-contain rounded opacity-80 hover:opacity-100 transition-opacity mb-5"
            />
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Procura por mais novidades?</h3>
            <p className="mb-6 max-w-sm mx-auto text-sm leading-relaxed text-slate-500">
              Temos um catálogo completo com as últimas tendências e produtos inovadores a preços incríveis.
            </p>
            <a 
              href="https://www.cstoreao.shop/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-full border border-slate-700 transition hover:border-slate-500"
            >
              Visitar Loja Oficial C Store Angola
            </a>
            <div className="mt-12 text-xs opacity-40">
              &copy; {new Date().getFullYear()} C Store Angola. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}

      {/* SALES ROUPAS VIEW */}
      {view === 'sales-roupas' && (
        <main className="pb-24">
          
          <section className="pt-10 pb-6 px-4 max-w-4xl mx-auto text-center">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="mb-8"
            >
              <div className="inline-block bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded-full text-sm mb-4 border border-sky-200">
                 A Salvação para Dias de Chuva
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                O primeiro Secador Expresso Portátil (Edition Pro) disponível em Angola.
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                Chega de depender do sol ou espalhar roupa pela casa. A solução prática para secar as suas peças rapidamente, mesmo em apartamentos ou dias de chuva.
              </p>

              {/* Gallery Wrapper */}
              <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 inline-block w-full mb-12">
                <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden bg-slate-100 w-full mb-4 group cursor-pointer" onClick={() => window.open(IMAGES_ROUPAS[activeImage], '_blank')}>
                  <img src={IMAGES_ROUPAS[activeImage]} alt="Secador Expresso Portátil (Edition Pro)" className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto pb-2 px-2 snap-x">
                  {IMAGES_ROUPAS.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-sky-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              
              <ul className="text-left max-w-xl mx-auto space-y-3 mb-12 text-slate-700 font-medium text-lg">
                <li className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100"><CheckCircle className="text-emerald-500 shrink-0" size={24} /> Seca roupas em poucas horas</li>
                <li className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100"><CheckCircle className="text-emerald-500 shrink-0" size={24} /> Tecnologia de ar quente silencioso</li>
                <li className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100"><CheckCircle className="text-emerald-500 shrink-0" size={24} /> Compacto e fácil de transportar</li>
                <li className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100"><CheckCircle className="text-emerald-500 shrink-0" size={24} /> Ideal para apartamentos, estudantes e famílias</li>
                <li className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100"><CheckCircle className="text-emerald-500 shrink-0" size={24} /> Perfeito para fardas, camisas, roupas íntimas e peças do dia a dia</li>
              </ul>

              <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-sky-200 hover:shadow-md transition">
                      <div className="text-3xl text-sky-500 mb-3 block">🕒</div>
                      <h3 className="font-bold mb-2 text-slate-800">Stress Matinal Acabou</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">A farda das crianças ou a roupa de trabalho continuam húmidas? Resolva a urgência pendurando no cabide por 1 ou 2 horas.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition">
                      <div className="text-3xl text-orange-500 mb-3 block">💨</div>
                      <h3 className="font-bold mb-2 text-slate-800">Fim do Cheiro a Bafio</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">Roupas estendidas dentro de casa ganham aquele cheiro terrível a humidade. Seque rápido com ar quente e mantenha o cheiro do perfume.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition">
                      <div className="text-3xl text-emerald-500 mb-3 block">🏢</div>
                      <h3 className="font-bold mb-2 text-slate-800">Ideal para Apartamentos</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">Sem quintal? Esqueça a sala cheia de estendais gigantes. O design portátil e dobrável seca a roupa discretamente num canto do quarto.</p>
                  </div>
              </div>
              
              {/* Product Specifications */}
              <div className="mt-20 text-left max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Settings size={20} /></div>
                  Especificações Técnicas
                </h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Tipo de Secador</span>
                      <span className="font-medium text-slate-900 text-right">Secador de roupa elétrico</span>
                    </div>
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Potência</span>
                      <span className="font-medium text-slate-900 text-right">600W</span>
                    </div>
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Instalação</span>
                      <span className="font-medium text-slate-900 text-right">Portátil / Mini Dobrável</span>
                    </div>
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Modo de Aquecimento</span>
                      <span className="font-medium text-slate-900 text-right">Circulação de Ar Quente (PTC)</span>
                    </div>
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Dimensões (C x L x A)</span>
                      <span className="font-medium text-slate-900 text-right">32 x 24 x 15 cm</span>
                    </div>
                    <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Eficiência Energética</span>
                      <span className="font-medium text-slate-900 text-right">Classe UM (A)</span>
                    </div>
                     <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Aplicação / Uso</span>
                      <span className="font-medium text-slate-900 text-right">Casa, Hotel, Viagem, Camping</span>
                    </div>
                     <div className="p-4 md:p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 bg-slate-50/50 md:text-base text-sm transition-colors">
                      <span className="font-semibold text-slate-600">Controlado por App</span>
                      <span className="font-medium text-slate-900 text-right">Sem controle por app (Controlado por Comando de Fio/Temporizador)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Testimonials */}
          <section className="mb-14">
            <div className="text-center mb-10 mt-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Quem comprou, recomenda!</h2>
              <p className="text-slate-500 max-w-lg mx-auto">Veja o que os nossos clientes dizem sobre a praticidade do Secador Expresso Portátil.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
              {TESTIMONIALS_ROUPAS.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                     {Array.from({length: 5}).map((_, i) => (
                       <Star key={i} size={18} className={i < t.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} />
                     ))}
                  </div>
                  <p className="text-sm text-slate-600 mb-6 italic leading-relaxed flex-grow">"{t.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Checkout Section */}
          <div id="comprar" className="pt-8 scroll-mt-20 px-4">
            <section className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
              <div className="bg-sky-600 p-8 text-center text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">A Mini-Lavandaria que cabe na Gaveta</h2>
                  <p className="text-sky-100 font-medium text-sm md:text-base">Faça a sua Encomenda e Pague Apenas na Entrega!</p>
              </div>
              
              <div className="p-8 md:flex gap-8 items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0">
                      <div className="text-center md:text-left relative">
                          <div className="absolute top-8 right-0 md:right-10 bg-emerald-500 text-white font-bold py-1 px-3 rounded-full text-sm shadow-md animate-pulse">
                            Poupa 15.100 Kz
                          </div>
                          <p className="text-slate-500 text-sm mb-2">Uma máquina tradicional gasta energia e custa 300.000 Kz.</p>
                          <p className="text-slate-400 line-through text-lg font-medium">De: 50.000 Kz</p>
                          <p className="text-5xl font-black text-slate-900 mb-3 tracking-tight">34.900 <span className="text-2xl text-slate-500">Kz</span></p>
                          <p className="text-sm text-emerald-600 font-bold mb-6 flex items-center justify-center md:justify-start gap-1.5"><PackageOpen size={16} /> Entrega Grátis em Luanda</p>
                          
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-medium flex items-start gap-2 text-left leading-relaxed">
                            <span className="text-amber-500 mt-0.5"><Info size={16} /></span>
                            Atenção: A procura dispara nos dias nublados. Restam apenas 12 unidades ao preço promocional.
                          </div>
                      </div>
                  </div>

                  <div className="md:w-1/2">
                    <div className="mb-6">
                      <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl flex items-center justify-between font-bold shadow-sm">
                        <div className="flex items-center gap-2">
                          <Timer className="animate-pulse" size={20} />
                          Oferta expira em:
                        </div>
                        <span className="text-xl font-black bg-white px-3 py-1 rounded-md shadow-sm border border-red-100 tabular-nums">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name-input">Nome Completo</label>
                        <input 
                          id="name-input"
                          type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400" 
                          placeholder="Ex: Marta Silva"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de WhatsApp</label>
                        <input 
                          type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400" 
                          placeholder="Ex: 923 000 000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço Completo</label>
                         <input 
                          type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400" 
                          placeholder="Bairro, Rua, Referência"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantidade</label>
                        <div className="relative">
                          <select 
                            value={formData.quantity}
                            onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all appearance-none"
                          >
                             {Array.from({ length: 10 }).map((_, i) => {
                               const q = i + 1;
                               return (
                                 <option key={q} value={q}>
                                   {q} {q === 1 ? 'unidade' : 'unidades'} - {new Intl.NumberFormat('pt-AO', { style: 'decimal', minimumFractionDigits: 2 }).format(q * 34900)} Kz
                                 </option>
                               );
                             })}
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-1'}`}
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "QUERO SECAR ROUPA RÁPIDO"}
                      </button>
                    </form>
                  </div>

              </div>
            </section>
          </div>
        </main>
      )}

      {/* FOOTER - Roupas */}
      {view === 'sales-roupas' && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 text-center mt-auto pb-28 md:pb-12 shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <img 
              src="https://i.postimg.cc/3wsKF20v/Chat-GPT-Image-13-de-mai-de-2026-12-40-58.png" 
              alt="Logotipo C Store Angola" 
              className="h-10 w-auto object-contain rounded opacity-80 hover:opacity-100 transition-opacity mb-5"
            />
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Procura por mais novidades?</h3>
            <p className="mb-6 max-w-sm mx-auto text-sm leading-relaxed text-slate-500">
              Temos um catálogo completo com as últimas tendências e produtos inovadores a preços incríveis.
            </p>
            <a 
              href="https://www.cstoreao.shop/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-full border border-slate-700 transition hover:border-slate-500"
            >
              Visitar Loja Oficial C Store Angola
            </a>
            <div className="mt-12 text-xs opacity-40">
              &copy; {new Date().getFullYear()} C Store Angola. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}

      {/* ADMIN VIEW */}
      {view === 'admin' && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
            <div className="mb-8 block">
              <button 
                onClick={() => setView('pages')} 
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Painel de Leads</h1>
                    <p className="text-slate-500 mt-1">Gestão de Reservas</p>
                  </div>
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    <button 
                      onClick={handleExportCSV}
                      className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition border border-indigo-200"
                    >
                      <Download size={16} /> Exportar CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64}/></div>
                  <p className="text-sm text-amber-600 font-bold uppercase tracking-wider">Pendentes</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">{adminData.filter(d => d.status === 'Pendente').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500"><CheckCircle size={64}/></div>
                  <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">Reservados</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">{adminData.filter(d => d.status && d.status.includes('Reservado')).length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500"><Activity size={64}/></div>
                  <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider">Taxa de Conversão</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">{conversionRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><XCircle size={64}/></div>
                  <p className="text-sm text-red-600 font-bold uppercase tracking-wider">Rejeitados</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">{adminData.filter(d => d.status === 'Rejeitado').length}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por nome, telefone ou endereço..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="relative min-w-[140px] shrink-0">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <select 
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer"
                       value={timeRangeFilter}
                       onChange={(e) => setTimeRangeFilter(e.target.value)}
                     >
                        <option value="Tudo">Qualquer Data</option>
                        <option value="Hoje">Hoje</option>
                        <option value="Últimos 7 Dias">Últimos 7 Dias</option>
                        <option value="Este Mês">Este Mês</option>
                     </select>
                  </div>
                  <div className="relative min-w-[140px] shrink-0">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <select 
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer"
                       value={filterStatus}
                       onChange={(e) => setFilterStatus(e.target.value)}
                     >
                        <option value="Todos">Todos os Status</option>
                        <option value="Pendente">Pendentes</option>
                        <option value="Reservado">Reservados</option>
                        <option value="Rejeitado">Rejeitados</option>
                        <option value="Entregue">Entregues</option>
                        <option value="Tentativa Falhada">Tentativas Falhadas</option>
                        <option value="Cancelado">Cancelados</option>
                     </select>
                  </div>
                  <input 
                    type="date"
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shrink-0 cursor-pointer"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  <div className="relative min-w-[160px] shrink-0">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <select 
                       className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer"
                       value={filterProduct}
                       onChange={(e) => setFilterProduct(e.target.value)}
                     >
                        <option value="">Todas as Páginas</option>
                        {uniquePages.map((page, index) => (
                           <option key={index} value={page}>{page}</option>
                        ))}
                     </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isAdminLoading ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>A sincronizar com a base de dados...</p>
                  </div>
                ) : adminError ? (
                  <div className="p-8 pb-10 text-center text-red-600 bg-red-50">
                    <TriangleAlert className="mx-auto mb-3" size={32} />
                    <p className="font-medium">{adminError}</p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    Nenhum lead encontrado com os filtros actuais.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Qtd</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filteredData.map((lead, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                               {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.produto || 'Secador Inteligente UV'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{lead.quantity || 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-[200px] truncate">{lead.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select 
                                value={lead.status}
                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                className={`text-xs font-bold rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                                  lead.status?.includes('Reservado') ? 'bg-emerald-100 text-emerald-700' :
                                  lead.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                                  lead.status === 'Entregue' ? 'bg-blue-100 text-blue-700' :
                                  lead.status === 'Cancelado' ? 'bg-slate-200 text-slate-700' :
                                  lead.status === 'Tentativa Falhada' ? 'bg-orange-100 text-orange-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}
                              >
                                <option value="Pendente">⏳ Pendente</option>
                                <option value="Reservado">✅ Reservado</option>
                                <option value="Rejeitado">❌ Rejeitado</option>
                                <option value="Entregue">📦 Entregue</option>
                                <option value="Tentativa Falhada">⚠️ Tentativa Falhada</option>
                                <option value="Cancelado">🚫 Cancelado</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                               <div className="flex justify-end gap-2">
                                 <button
                                   onClick={() => handleCopyLead(lead)}
                                   className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                   title="Copiar informações"
                                 >
                                   <Copy size={16} />
                                 </button>
                                 <button
                                   onClick={() => handleWhatsApp(lead)}
                                   className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                   title="Contactar por WhatsApp"
                                 >
                                   <MessageCircle size={16} />
                                 </button>
                                 <button
                                   onClick={() => {
                                      setLeadToDelete(lead);
                                      setModalState('delete-lead-confirm');
                                   }}
                                   className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                   title="Eliminar Lead"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
        </main>
      )}

      {/* PAGES HUB VIEW */}
      {view === 'pages' && isAuthenticated && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button 
                onClick={() => setView('sales')} 
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <h1 className="text-3xl font-bold text-slate-900">Gerência de Páginas</h1>
              <p className="text-slate-500 mt-1">Gira as suas landing pages, acesse links e veja leads rapidamente.</p>
            </div>
            <div>
              <button 
                onClick={() => setView('ai-generator')} 
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Star size={16} /> Configurações de IA
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Produto 1: Secador UV */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                 <img src={IMAGES[0]} alt="Secador Inteligente UV" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                 <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">Ativa</div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                 <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">Secador Inteligente UV</h3>
                 <p className="text-sm text-slate-500 mb-6 flex-grow">Oferta CPA padrão com formulário integrado. Conversão direta.</p>
                 <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setView('sales')} 
                      className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                    >
                      <Eye size={14} /> Pré-visualizar
                    </button>
                    <button 
                      onClick={() => {
                        setFilterProduct('Secador Inteligente UV');
                        setView('admin');
                      }} 
                      className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                    >
                      Leads
                    </button>
                    <button 
                      onClick={() => {
                        const link = window.location.origin + '?product=secador-uv';
                        navigator.clipboard.writeText(link);
                        alert('Link copiado: ' + link);
                      }}
                      className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                      title="Copiar Link da Página"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setProjectName('Secador Inteligente UV');
                        setView('ai-generator');
                      }}
                      className="text-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                      title="Editar Projeto com IA"
                    >
                      <Edit size={16} />
                    </button>
                 </div>
              </div>
            </div>

            {/* Produto 2: Secador Expresso */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                 <img src={IMAGES_ROUPAS[0]} alt="Secador Expresso Portátil (Edition Pro)" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                 <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">Ativa</div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                 <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">Secador Expresso Pro 34 900 Kz</h3>
                 <p className="text-sm text-slate-500 mb-6 flex-grow">Novo produto voltado a roupas húmidas e dias de chuva.</p>
                 <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setView('sales-roupas')} 
                      className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                    >
                      <Eye size={14} /> Pré-visualizar
                    </button>
                    <button 
                      onClick={() => {
                        setFilterProduct('Secador Expresso Pro 34 900 Kz');
                        setView('admin');
                      }} 
                      className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                    >
                      Leads
                    </button>
                    <button 
                      onClick={() => {
                        const link = window.location.origin + '?product=cabide-secador';
                        navigator.clipboard.writeText(link);
                        alert('Link copiado: ' + link);
                      }}
                      className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                      title="Copiar Link da Página"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setProjectName('Cabide Secador Expresso');
                        setView('ai-generator');
                      }}
                      className="text-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                      title="Editar Projeto com IA"
                    >
                      <Edit size={16} />
                    </button>
                 </div>
              </div>
            </div>

            {/* Adicionar Nova Página */}
            <div 
              onClick={() => {
                setView('ai-generator');
              }}
              className="bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center p-8 text-center min-h-[300px] hover:bg-slate-100 hover:border-indigo-400 transition cursor-pointer group"
            >
               <div className="w-12 h-12 bg-indigo-100 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors rounded-full flex items-center justify-center mb-3 shadow-sm">
                 <span className="text-2xl leading-none -mt-1">+</span>
               </div>
               <h3 className="font-bold text-slate-700 mb-1 group-hover:text-indigo-700 transition">Solicitar Nova Página</h3>
               <p className="text-sm text-slate-500 px-4">Peça ao assistente para programar novas páginas com 100% de integração e alta conversão.</p>
            </div>
          </div>
        </main>
      )}

      {/* SETTINGS VIEW */}
      {view === 'settings' && isAuthenticated && (
         <SettingsView onBack={() => setView('pages')} aiKeys={aiKeys} setAiKeys={setAiKeys} />
      )}

      {/* PROMPT GALLERY VIEW */}
      {view === 'prompt-gallery' && isAuthenticated && (
        <main className="w-full max-w-5xl mx-auto px-4 py-10 flex-grow">
          <div className="mb-8 block">
            <button 
              onClick={() => setView('pages')} 
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Galeria de Prompts</h1>
            <p className="text-slate-500 mt-2 text-lg">Use as nossas instruções moldadas e testadas para gerar a landing page perfeita usando IA.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-purple-600" /> Prompt Especialista Alta Conversão (Template)
              </h3>
              <button 
                onClick={() => {
                  const promptText = document.getElementById('prompt-text')?.innerText || '';
                  navigator.clipboard.writeText(promptText);
                  alert('Prompt copiado com sucesso. Vá para o Estúdio IA e inicie uma página!');
                  setView('ai-generator');
                }}
                className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Copy size={14} /> Usar Prompt
              </button>
            </div>
            <div className="p-5 bg-slate-50 flex-grow relative">
              <div className="absolute top-4 right-4 animate-pulse opacity-50 pointer-events-none">
                <Star size={24} className="text-amber-400" />
              </div>
              <pre id="prompt-text" className="w-full h-[500px] bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-sm leading-relaxed rounded-xl p-5 overflow-y-auto whitespace-pre-wrap selection:bg-emerald-500/30 selection:text-emerald-300">
{`Aja como um Expert em Landing Pages e Engenheiro Frontend focado em conversão.

Por favor, crie uma landing page de alta conversão usando React e Tailwind CSS. 
O tema do produto é [INSERIR NOME DO PRODUTO AQUI - ex: Secador Inteligente].

A página deve conter as seguintes secções:
1. Header Persuasivo com escassez (ex: "Aviso: Últimas unidades em stock").
2. Hero Section impactante:
   - Título principal focado no benefício e na transformação.
   - Subtítulo explicativo.
   - Botão de Call-To-Action (CTA) com scroll suave para o formulário.
   - Área para imagem principal do produto ou mockup.
3. Seção de Avaliações / Prova Social:
   - Apresente 3 a 4 depoimentos simulados de clientes angolanos (ex: "Paula, Luanda", "João, Benguela") com estrelas.
4. Benefícios do Produto (Feature/Benefit):
   - Apresente pelo menos 4 vantagens claras do uso do produto, usando ícones.
5. Formulário de Captura / Pedido Integrado:
   - Título focado em "Faça já a sua Reserva".
   - Campos: Nome Completo, Número de Telefone/WhatsApp, Endereço de Entrega (Província/Município).
   - Aviso de que o pagamento é feito apenas no ato de entrega (Pagamento na Entrega).
   - Botão final de compra que engatilha envio dos dados.
6. FAQ e Garanta:
   - Secção de Perguntas Frequentes.
   - Secção de Garantia de Satisfação (ex: "Garantia de 7 dias").

O formulário deve salvar os dados ("leads") numa colecção Firestore chamada "leads" contendo as seguintes chaves do objecto:
- name (string)
- phone (string)
- address (string)
- product (string - nome do produto fixo)
- status (string "Pendente")
- createdAt (timestamp do servidor temporal)

Não te esqueças de incluir pequenos gatilhos de atenção, como um temporizador (ex: "A oferta expira em 10 minutos") e pequenos pop-ups discretos do tipo "Alguém em Luanda acabou de comprar!". Toda a cópia deve estar em português de Angola.

O código da UI deve ser num único ficheiro App.tsx suportando React, usando \`lucide-react\` para ícones, com uma componente funcional que tenha gestão do estado do formulário e animações suaves caso necessário.`}
              </pre>
              <div className="mt-4 p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm border border-indigo-100 flex gap-3">
                <Info size={20} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Como usar este prompt:</strong> Pode editá-lo e copiá-lo para que a IA do Estúdio de IA gere uma estrutura perfeita.
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* AI STUDIO HUB VIEW */}
      {view === 'ai-generator' && isAuthenticated && (
        <main className="w-full flex-grow p-4 flex gap-4 h-[calc(100vh-4rem)] max-w-[1920px] mx-auto">
          {/* Chat Panel */}
          <div className="w-[350px] lg:w-[400px] h-full bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold flex items-center gap-2 text-indigo-700">
                <Star size={18} /> IA Builder
              </h2>
              <div className="relative">
                <select 
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value)}
                  className="appearance-none bg-slate-200 border-none text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                   <option value="gemini_free">Gemini (Free)</option>
                   <option value="gemini">Gemini Pro</option>
                   <option value="openai">GPT-4o</option>
                   <option value="anthropic">Claude 3.5</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                   <ChevronDown size={12} />
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50/50 border-b border-indigo-100 px-4 py-2 flex items-center gap-2">
              <FolderOpen size={14} className="text-indigo-400" />
              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nome do Projeto..."
                  className="bg-transparent border-none text-xs text-indigo-900 font-bold flex-1 min-w-0 p-0 py-1 focus:ring-0 focus:outline-none placeholder-indigo-300"
                />
                <div className="relative">
                   <select 
                     title="Carregar Projeto Salvo"
                     className="appearance-none bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none text-xs font-semibold py-1 pl-2 pr-6 rounded-md cursor-pointer focus:ring-0 focus:outline-none w-24"
                     onChange={(e) => {
                       if (e.target.value !== 'new') {
                         setProjectName(e.target.options[e.target.selectedIndex].text);
                         setTimeout(() => alert(`Projeto "${e.target.options[e.target.selectedIndex].text}" carregado com sucesso para edição!`), 300);
                         setChatMessages([{role: 'assistant', content: `Baseado no projeto "${e.target.options[e.target.selectedIndex].text}", o que gostarias de alterar ou melhorar na página de vendas?`}]);
                       }
                       e.target.value = ''; // reset selection
                     }}
                     value=""
                   >
                     <option value="" disabled>Projetos</option>
                     <option value="page1">Secador Inteligente UV</option>
                     <option value="page2">Cabide Secador Expresso</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                      <ChevronDown size={12} />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
               {chatMessages.map((msg, index) => (
                 <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 max-w-[90%] text-sm rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                       {msg.content}
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-xs text-slate-400 font-medium ml-1">
                    {selectedApi === 'gemini_free' ? 'Créditos: Ilimitado (Básico)' : 
                     (!aiKeys[selectedApi.replace('_pro', '') as keyof typeof aiKeys] ? <span className="text-red-400">Chave API em falta</span> : <span className="text-emerald-500">API Key Conectada</span>)}
                 </span>
                 <button onClick={() => setView('prompt-gallery')} className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition font-medium">
                   <FileText size={12} /> Galeria Prompts
                 </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  const newChat = [...chatMessages, {role: 'user' as const, content: chatInput}];
                  setChatMessages(newChat);
                  setChatInput('');
                  
                  // Simulate AI thinking and generating code
                  setTimeout(() => {
                     setChatMessages([...newChat, {role: 'assistant', content: "Estou a preparar a geração da tua nova página baseada nessa descrição. Em breve a pré-visualização e os códigos estarão disponíveis à direita!"}]);
                     setGeneratedCode('// Nova landing page gerada!\n\nexport default function NovaPagina() {\n  return (\n    <div className="p-8 max-w-4xl mx-auto text-center font-sans">\n       <h1 className="text-4xl font-bold mb-4 text-indigo-600">Página Gerada com Sucesso</h1>\n       <p className="text-lg text-slate-600 mb-8">Esta é uma simulação da página que a IA construiria. Como estamos em modo simulação, o código de interface deve aparecer aqui após a integração com a IA em Backend.</p>\n       <button className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">Faça o seu pedido</button>\n    </div>\n  );\n}');
                  }, 1500);
                }}
                className="relative"
              >
                {attachedFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                        <FolderOpen size={12} />
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setAttachedFiles(files => files.filter((_, i) => i !== idx))}
                          className="hover:text-red-500 ml-1"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative flex items-end gap-2 bg-slate-100 rounded-xl border border-transparent focus-within:border-indigo-400 focus-within:ring focus-within:ring-indigo-200 focus-within:ring-opacity-50 p-1">
                  <div className="relative">
                    <input 
                      type="file" 
                      id="ai-file-upload" 
                      className="hidden" 
                      multiple 
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = (Array.from(e.target.files) as File[]).map(f => ({name: f.name, type: f.type || 'unknown'}));
                          setAttachedFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="ai-file-upload" 
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg cursor-pointer transition-colors block"
                      title="Anexar arquivos (HTML, JSON, Imagens)"
                    >
                      <Paperclip size={18} />
                    </label>
                  </div>
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escreve o teu prompt aqui..."
                    className="flex-1 text-sm resize-none bg-transparent border-none focus:ring-0 min-h-[44px] max-h-[120px] py-3 px-1"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        document.getElementById('send-prompt-btn')?.click();
                      }
                    }}
                  />
                  <button 
                    id="send-prompt-btn"
                    type="submit"
                    className="p-2.5 mb-0.5 mr-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition self-end shrink-0"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Workspace / Preview Panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
             <div className="border-b border-slate-200 px-4 h-[52px] flex items-center justify-between bg-slate-50 gap-4">
                <div className="flex items-center h-full gap-4">
                  <button 
                    onClick={() => setActiveTab('preview')}
                    className={`h-full px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <Eye size={16} /> Preview (Simulado)
                  </button>
                  <button 
                    onClick={() => setActiveTab('code')}
                    className={`h-full px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'code' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <FileText size={16} /> App.tsx Code
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {activeTab === 'preview' && (
                    <div className="flex items-center bg-slate-200 rounded-lg p-0.5 shadow-inner">
                       <button title="Desktop" onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Monitor size={16} /></button>
                       <button title="Tablet" onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Tablet size={16} /></button>
                       <button title="Mobile" onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Smartphone size={16} /></button>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      alert(`Projeto "${projectName}" publicado com sucesso! Pode aceder-lhe nas Páginas Publicadas.`);
                      setView('pages');
                    }}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition"
                  >
                     <Upload size={14} /> Publicar
                  </button>
                </div>
             </div>
             
             <div className="flex-1 relative overflow-auto bg-slate-100">
                {activeTab === 'code' ? (
                   <pre className="p-6 font-mono text-sm leading-relaxed text-slate-800 h-full">
                     {generatedCode}
                   </pre>
                ) : (
                   <div className="w-full h-full p-6 flex flex-col items-center">
                      <div className={`w-full ${previewDevice === 'mobile' ? 'max-w-[400px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-[1280px]'} transition-all duration-500 bg-white shadow-2xl border-[8px] border-slate-800 min-h-[600px] flex-shrink-0 relative \${previewDevice === 'desktop' ? 'rounded-xl mt-4' : 'rounded-[2rem] max-h-[800px]'}`}>
                         {previewDevice !== 'desktop' && (
                            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl max-w-[150px] mx-auto z-10"></div>
                         )}
                         {/* Simulacao renderizada com base no que tiver no input de texto simulado - iframe simulado */}
                         <div className="w-full h-full overflow-y-auto">
                            {generatedCode.includes('Nova landing page gerada') ? (
                               <div className="p-8 text-center font-sans mt-10">
                                   <div className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold rounded-full mb-4 inline-block">NOVIDADE</div>
                                   <h1 className="text-2xl font-black mb-4 text-slate-800 leading-tight">Secador Inteligente UV Profissional</h1>
                                   <img src="https://i.postimg.cc/8CB6G2qN/OIG4-8dsv20-I6k-HTy-Gj29l-K3-f-removebg.png" className="w-full h-auto object-cover rounded-xl mb-4 shadow" alt="Secador Mockup" />
                                   <p className="text-sm text-slate-600 mb-6 font-medium">Secagem rápida e inteligente numa fracção do tempo tradicional. Garante o teu hoje mesmo com desconto especial!</p>
                                   <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition px-6 py-4 rounded-2xl font-bold shadow-lg animate-pulse uppercase tracking-wide">Fazer Encomenda</button>
                               </div>
                            ) : (
                               <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400 text-sm">
                                  Quando a IA gerar a página, ela aparecerá aqui.
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </main>
      )}

      {/* DANGER ZONE VIEW */}
      {view === 'danger-zone' && isAuthenticated && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
          <div className="mb-8 block">
            <button 
              onClick={() => setView('pages')} 
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
              <AlertOctagon size={32} /> Zona de Perigo
            </h1>
            <p className="text-slate-500 mt-1">Ações avançadas e irreversíveis sobre a plataforma.</p>
          </div>
          
          <div className="max-w-2xl bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden mt-6">
             <div className="p-6 border-b border-red-100 bg-red-50/50">
               <h2 className="font-bold text-red-800 text-lg">Atenção!</h2>
               <p className="text-sm text-red-700 mt-1">As funcionalidades abaixo excluem permanentemente os dados. Use com extrema cautela.</p>
             </div>
             
             <div className="p-6 space-y-4">
                  <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">Eliminar Leads por Páginas</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Apaga todos os leads de uma página selecionada.</p>
                    </div>
                    <button 
                      onClick={() => {
                          setDangerInputValue('');
                          setModalState('danger-action-page-prompt');
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Especial
                    </button>
                  </div>
                  
                  <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">Eliminar Páginas</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Remove a página e todos os leads associados a ela.</p>
                    </div>
                    <button 
                      onClick={() => {
                          setDangerActionContext({ alertMessage: 'As páginas são estáticas nesta versão do sistema. Para alterar as visualizações de páginas, deverá editar o código diretamente.' });
                          setModalState('danger-alert');
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Páginas
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">Eliminação Total</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Remove TODOS os leads de TODAS as campanhas da plataforma.</p>
                    </div>
                    <button 
                      onClick={() => {
                          setDangerInputValue('');
                          setModalState('danger-action-all-prompt');
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors font-bold text-sm flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Tudo!
                    </button>
                  </div>
             </div>
          </div>
        </main>
      )}
      <AnimatePresence>
        {modalState !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
            onClick={() => setModalState('none')}
          >
            {/* Step 1: Sold Out */}
            {modalState === 'step1' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-amber-500 p-8 text-center text-white relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-white opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <PackageOpen className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-3xl font-black tracking-tight">Lote Esgotado!</h3>
                </div>
                <div className="p-8 text-center text-slate-700">
                  <p className="mb-6 text-lg">
                    O stock do <strong>{view === 'sales-roupas' ? 'Secador Expresso Portátil' : 'Secador UV'}</strong> para entrega imediata terminou devido à altíssima procura nas últimas horas.
                  </p>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Mas <b>não se preocupe!</b> O nosso novo lote chega dentro de alguns dias. Deseja <b>garantir a sua reserva </b> e manter o preço promocional de <b>{view === 'sales-roupas' ? '34.900 Kz' : '24.900 Kz'}</b>? <span className="text-indigo-600 font-bold block mt-2">(Não paga nada hoje!)</span>
                  </p>
                  <div className="space-y-3">
                    <button onClick={() => processReservation(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]">
                      SIM, QUERO RESERVAR O MEU!
                    </button>
                    <button onClick={() => setModalState('last-chance')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-4 rounded-xl transition">
                      Não, prefiro perder a promoção
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Last Chance */}
            {modalState === 'last-chance' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8 border-4 border-red-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 text-center pt-8 pb-4">
                  <TriangleAlert className="w-16 h-16 mx-auto mb-2 text-red-500" />
                  <h3 className="text-2xl font-black text-red-600">Tem a certeza, {formData.name ? formData.name.split(' ')[0] : 'amigo'}?</h3>
                </div>
                <div className="p-8 text-center pt-4">
                  <p className="text-slate-700 mb-4 font-bold text-lg">
                    Sem o {view === 'sales-roupas' ? 'Secador Expresso Portátil' : 'secador UV'}, {view === 'sales-roupas' ? 'vai' : 'os seus ténis vão'} continuar a:
                  </p>
                  {view === 'sales-roupas' ? (
                    <ul className="text-left text-slate-600 mb-8 space-y-3 bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Sofrer com fardas molhadas de manhã.</span></li>
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Suportar o cheiro a bafio nas roupas.</span></li>
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Ter a casa cheia de estendais feios.</span></li>
                    </ul>
                  ) : (
                    <ul className="text-left text-slate-600 mb-8 space-y-3 bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Acumular bactérias e fungos perigosos.</span></li>
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Manter o mau cheiro (chulé) impossível de tirar.</span></li>
                      <li className="flex items-start gap-2"><XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> <span>Estragar e deformar o couro com a humidade.</span></li>
                    </ul>
                  )}
                  <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    O próximo lote custará <b>{view === 'sales-roupas' ? '50.000 Kz' : '35.000 Kz'}</b>. Vai mesmo deixar passar?
                  </p>
                  <div className="space-y-3">
                    <button onClick={() => processReservation(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]">
                      MUDEI DE IDEIAS! QUERO RESERVAR
                    </button>
                    <button onClick={() => processReservation(false)} className="w-full bg-transparent text-slate-400 hover:text-slate-600 underline font-medium py-2 transition">
                      Sim, assumo o risco
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: VIP Success */}
            {modalState === 'success' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-emerald-500 p-8 text-center text-white">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-emerald-100" />
                  <h3 className="text-3xl font-black tracking-tight">Reserva VIP!</h3>
                </div>
                <div className="p-8 text-center text-slate-700">
                  <p className="text-xl font-bold mb-4">
                    Parabéns, <span className="text-indigo-600">{formData.name ? formData.name.split(' ')[0] : 'Cliente'}</span>! 🎉
                  </p>
                  <p className="text-slate-600 mb-2 leading-relaxed">
                     Entrou para o nosso grupo exclusivo. A sua unidade está garantida no próximo lote pelo valor de <b>{view === 'sales-roupas' ? '34.900 Kz' : '24.900 Kz'}</b>.
                  </p>
                  <p className="text-emerald-600 font-bold mb-6 text-lg">
                    Você garantiu um desconto de {view === 'sales-roupas' ? '15.100 Kz' : '10.100 Kz'}!
                  </p>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm mb-6 border border-emerald-100 font-medium">
                    A nossa equipa enviará uma mensagem para o <b>{formData.phone}</b> assim que o avião aterrar em Luanda.
                  </div>
                  <div className="space-y-3">
                    <a 
                      href="https://www.cstoreao.shop/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex justify-center items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-transform active:scale-[0.98]"
                    >
                      VISITAR LOJA OFICIAL
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 Alt: Rejected */}
            {modalState === 'rejected' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-8 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Compreendemos.</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  A sua vaga foi libertada para o próximo cliente na lista de espera.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://www.cstoreao.shop/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-transform active:scale-[0.98]"
                  >
                    CONHECER OUTROS PRODUTOS
                  </a>
                </div>
              </motion.div>
            )}

            {/* Profile Edit Modal */}
            {modalState === 'profile' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-slate-900 p-6 text-center text-white relative">
                  <button onClick={() => setModalState('none')} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <XCircle size={24} />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner mx-auto mb-3">
                     {(auth.currentUser?.displayName || 'Pedro').charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold">Meu Perfil</h3>
                </div>
                
                <div className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
                      <input 
                        type="text" value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <input 
                        type="email" value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova Senha (opcional)</label>
                      <input 
                        type="password" value={profileFormData.password} onChange={e => setProfileFormData({...profileFormData, password: e.target.value})}
                        placeholder="Deixe em branco para manter a atual"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] mt-4"
                    >
                      Guardar Alterações
                    </button>
                  </form>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <button 
                      type="button"
                      onClick={() => { setModalState('danger-zone'); }} 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-red-100 font-bold"
                    >
                      <AlertOctagon size={18} /> Acessar Zona de Perigo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Danger Zone Entry Modal */}
            {modalState === 'danger-zone' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8 border-2 border-red-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 p-6 text-center text-red-900 relative border-b border-red-100">
                  <button onClick={() => setModalState('none')} className="absolute top-4 right-4 text-red-400 hover:text-red-600 border border-transparent hover:border-red-600 rounded-full">
                    <XCircle size={24} />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
                     <AlertOctagon size={32} />
                  </div>
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                     Aviso de Segurança
                  </h3>
                  <p className="text-sm mt-2 text-red-700/80 font-medium">Você está preste a acessar uma área restrita e perigosa.</p>
                </div>
                
                <div className="p-6 space-y-4 text-center">
                  <p className="text-slate-600 text-sm">
                    A Zona de Perigo permite a <strong className="text-red-600">exclusão irreversível</strong> de páginas e contatos. Qualquer ação realizada lá não poderá ser desfeita. Tem a certeza que pretende continuar?
                  </p>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setModalState('none')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        setModalState('none');
                        setView('danger-zone');
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      Sim, tenho a certeza
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Danger Custom Modals */}
            {modalState === 'danger-action-page-prompt' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 p-6 border-b border-red-100 relative">
                  <button onClick={() => setModalState('none')} className="absolute top-4 right-4 text-red-400 hover:text-red-700">
                    <XCircle size={24} />
                  </button>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Eliminar Leads por Página</h3>
                  <p className="text-sm text-red-700/80">Digite o NOME DA PÁGINA (ex: "Secador Inteligente UV")</p>
                </div>
                <div className="p-6">
                  <input 
                    type="text" 
                    value={dangerInputValue}
                    onChange={(e) => setDangerInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-6"
                    placeholder="Nome da página..."
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setModalState('none')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition">Cancelar</button>
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                         if (!dangerInputValue) return;
                         try {
                             const q = query(collection(db, 'leads'), where('produto', '==', dangerInputValue));
                             const snapshot = await getDocs(q);
                             if (snapshot.empty) {
                                 setDangerActionContext({ alertMessage: 'Nenhum lead encontrado para esta página.' });
                                 setModalState('danger-alert');
                                 return;
                             }
                             setDangerActionContext({ pageName: dangerInputValue, leadCount: snapshot.size, docsToDelete: snapshot.docs });
                             setModalState('danger-action-page-confirm');
                         } catch (err) {
                             handleFirestoreError(err, OperationType.DELETE, 'leads');
                         }
                      }}
                    >Procurar</button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === 'danger-action-page-confirm' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-600 p-6 text-center text-white relative">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-3">
                     <AlertOctagon size={32} />
                  </div>
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">Confirma a eliminação?</h3>
                </div>
                <div className="p-6 text-center">
                  <p className="text-slate-600 mb-6">Foram encontrados <strong className="text-red-600">{dangerActionContext.leadCount}</strong> leads para a página "{dangerActionContext.pageName}". A eliminação é definitiva.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setModalState('none')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition">Cancelar</button>
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                         try {
                             const docs = dangerActionContext.docsToDelete || [];
                             await Promise.all(docs.map(docSnapshot => deleteDoc(doc(db, 'leads', docSnapshot.id))));
                             setDangerActionContext({ alertMessage: `${docs.length} leads eliminados com sucesso.` });
                             setModalState('danger-alert');
                             if (isAuthenticated) loadAdminData();
                         } catch (err) {
                             handleFirestoreError(err, OperationType.DELETE, 'leads');
                         }
                      }}
                    >Sim, eliminar</button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === 'danger-action-all-prompt' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="bg-red-50 p-6 border-b border-red-100 relative">
                  <button onClick={() => setModalState('none')} className="absolute top-4 right-4 text-red-500">
                    <XCircle size={24} />
                  </button>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Eliminação Total</h3>
                  <p className="text-sm text-red-700 flex flex-col gap-1">Para confirmar a exclusão DEFINITIVA de todos os leads, digite: <strong className="bg-red-100 px-2 py-1 rounded inline-block text-center mt-2 font-mono">eliminar todos leads</strong></p>
                </div>
                <div className="p-6">
                  <input 
                    type="text" 
                    value={dangerInputValue}
                    onChange={(e) => setDangerInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-6 text-center font-mono"
                    placeholder="Escreva aqui..."
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setModalState('none')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition">Cancelar</button>
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                         if (dangerInputValue !== 'eliminar todos leads') {
                             setDangerActionContext({ alertMessage: 'Nome de verificação incorreto.' });
                             setModalState('danger-alert');
                             return;
                         }
                         try {
                             const snapshot = await getDocs(collection(db, 'leads'));
                             if (snapshot.empty) {
                                 setDangerActionContext({ alertMessage: 'Nenhum lead encontrado para apagar.' });
                                 setModalState('danger-alert');
                                 return;
                             }
                             await Promise.all(snapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'leads', docSnapshot.id))));
                             setDangerActionContext({ alertMessage: `Total de ${snapshot.size} leads eliminados com sucesso.` });
                             setModalState('danger-alert');
                             if (isAuthenticated) loadAdminData();
                         } catch (err) {
                             handleFirestoreError(err, OperationType.DELETE, 'leads');
                         }
                      }}
                    >Confirmar Exclusão</button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === 'danger-alert' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Informação</h3>
                <p className="text-slate-600 mb-6">{dangerActionContext.alertMessage}</p>
                <button onClick={() => setModalState('none')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm">Entendido</button>
              </motion.div>
            )}

            {modalState === 'delete-lead-confirm' && leadToDelete && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Lead permanentemente?</h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Esta ação não pode ser desfeita. O lead de <span className="font-bold text-slate-700">{leadToDelete.name}</span> será removido para sempre.</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                       setLeadToDelete(null);
                       setModalState('none');
                    }} 
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Não, manter
                  </button>
                  <button 
                    onClick={async () => {
                       try {
                          await deleteDoc(doc(db, 'leads', leadToDelete.id));
                          if (view === 'admin') {
                            setAdminData(adminData.filter(l => l.id !== leadToDelete.id));
                          }
                          setModalState('none');
                          setLeadToDelete(null);
                       } catch (e) {
                          handleFirestoreError(e, OperationType.DELETE, 'leads');
                       }
                    }} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Sim, excluir
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile CTA (Only visible on mobile when scrolling) */}
      {(view === 'sales' || view === 'sales-roupas') && modalState === 'none' && !isCheckoutVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 md:hidden z-30">
          <button 
            onClick={() => {
              document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
              setTimeout(() => document.getElementById('name-input')?.focus(), 500);
            }}
            className="w-full bg-emerald-500 text-white font-bold text-lg py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            QUERO APROVEITAR
          </button>
        </div>
      )}

      {/* Social Proof Popup */}
      <AnimatePresence>
        {(view === 'sales' || view === 'sales-roupas') && activePopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[90px] md:bottom-6 left-4 right-4 md:right-auto z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] p-4 flex items-center gap-4 border border-slate-200/60 max-w-[340px]"
          >
            <div className="relative">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
                <PackageOpen size={22} className="opacity-90" />
              </div>
              <span className="absolute top-0 right-0 flex justify-center items-center h-3 w-3 -mt-0.5 -mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <p className="text-[13px] md:text-sm text-slate-800 leading-tight mb-1">
                <span className="font-bold">{activePopup.name}</span> em <span className="font-semibold text-indigo-700">{activePopup.city}</span>
              </p>
              <p className="text-[11px] md:text-xs text-slate-500 flex items-center gap-1.5">
                Acabou de reservar uma unidade <span className="text-slate-300">•</span> <span className="text-emerald-600 font-medium">{activePopup.time}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
