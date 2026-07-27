import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle,
  PackageOpen,
  TriangleAlert,
  Crown,
  XCircle,
  ArrowLeft,
  Lock,
  Loader2,
  Info,
  Star,
  Eye,
  EyeOff,
  Copy,
  MessageCircle,
  Search,
  Filter,
  Download,
  User,
  Users,
  LayoutDashboard,
  Settings,
  ExternalLink,
  LogOut,
  ChevronDown,
  Store,
  FileText,
  AlertOctagon,
  Trash2,
  Timer,
  Paperclip,
  FolderOpen,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  Upload,
  Edit,
  Sparkles,
  Dumbbell,
  Zap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  where,
  setDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  updateEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import AuthView from "./AuthView";
import UsersView from "./UsersView";
import HomeView from "./HomeView";

// ==========================================
// MÁQUINA DE GROWTH: Configuração de Pixels
// ==========================================
const campaignConfigs: Record<string, { fbPixel: string; googleTag: string }> =
  {
    "Secador Inteligente UV": {
      // ATENÇÃO: Substitua os valores abaixo pelos seus IDs reais
      fbPixel: "1234567890", // Exemplo: 1234567890
      googleTag: "AW-123456789", // Exemplo: AW-123456789
    },
  };

let pixelsLoaded = ""; // Store the ID that was loaded to avoid double loading the same thing

const initTracking = (
  produto: string,
  dynamicSettings?: { fbPixel?: string; googleTag?: string },
) => {
  if (typeof window === "undefined") return;

  // Use dynamic settings if provided, otherwise fallback to hardcoded configs
  const config =
    dynamicSettings?.fbPixel || dynamicSettings?.googleTag
      ? {
          fbPixel: dynamicSettings.fbPixel || "",
          googleTag: dynamicSettings.googleTag || "",
        }
      : campaignConfigs[produto];

  if (!config) return;

  const fbId = config.fbPixel;
  const gTag = config.googleTag;

  // Check if we already loaded this specific combination
  const currentKey = `${fbId}-${gTag}`;
  if (pixelsLoaded === currentKey) return;

  // Facebook Pixel
  if (fbId) {
    // @ts-ignore
    !(function (f, b, e, v, n, t, s) {
      if ((f as any).fbq) return;
      n = (f as any).fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!(f as any)._fbq) (f as any)._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );
    (window as any).fbq("init", fbId);
    (window as any).fbq("track", "PageView");
    (window as any).fbq("track", "ViewContent");

    // Add noscript fallback
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1" />`;
    document.body.appendChild(noscript);
  }

  // Google Analytics
  if (gTag) {
    const scriptTag = document.createElement("script");
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gTag}`;
    document.head.appendChild(scriptTag);
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag() {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;
    (window as any).gtag("js", new Date());
    (window as any).gtag("config", gTag);
  }

  pixelsLoaded = currentKey;
};

const trackEvent = (
  produto: string,
  eventName: string,
  fbEvent: string,
  dynamicSettings?: { fbPixel?: string; googleTag?: string },
) => {
  // Dispara sempre o evento do Facebook se a tag existir (via index.html ou dinâmica)
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", fbEvent);
  }

  const config =
    dynamicSettings?.fbPixel || dynamicSettings?.googleTag
      ? {
          fbPixel: dynamicSettings.fbPixel || "",
          googleTag: dynamicSettings.googleTag || "",
        }
      : campaignConfigs[produto];

  if (config?.googleTag && (window as any).gtag) {
    (window as any).gtag("event", eventName, { send_to: config.googleTag });
  }
};

const TESTIMONIALS = [
  {
    name: "João M., Luanda",
    comment:
      "Usava spray todo dia e o chulé voltava sempre. Comprei este há 3 semanas e os meus sapatos de trabalho estão sempre secos e sem cheiro. Nunca mais precisei do spray. Entrega super rápida!",
    rating: 5,
  },
  {
    name: "Sílvia C., Talatona",
    comment:
      "Vale cada kwanza. Seca os sapatos rápido sem estragar o material. Paguei na entrega com total segurança. Excelente para época de chuva.",
    rating: 5,
  },
  {
    name: "Carlos R., Kilamba",
    comment:
      "Incrível como a luz UV tira mesmo o cheiro. Uso nos meus ténis de corrida que ficavam encharcados. O produto chegou no mesmo dia que encomendei.",
    rating: 5,
  },
];

const TESTIMONIALS_ROUPAS = [
  {
    name: "Joana S., Maianga",
    comment:
      "Vivo no 4º andar e sempre tive vergonha de deixar a minha roupa íntima no estendal comum. Agora seco tudo dentro do quarto em 2 horas. Comprei há 3 semanas e já não consigo imaginar sem ele.",
    rating: 5,
  },
  {
    name: "Carlos A., Kilamba",
    comment:
      "As camisas de trabalho e as roupas das crianças ficavam dias a secar. Agora lavo à noite e de manhã está tudo pronto. Vale cada kwanza.",
    rating: 5,
  },
  {
    name: "Marta V., Talatona",
    comment:
      "A minha roupa ficava com aquele cheiro a bafio horrível. Percebi que era fungo da humidade. Desde que comprei o secador o cheiro desapareceu completamente.",
    rating: 5,
  },
  {
    name: "Nkosi B., Viana",
    comment:
      "Silencioso, rápido e discreto. Seco as minhas roupas de desporto depois do treino sem incomodar ninguém em casa. Recomendo a toda a gente que vive em apartamento.",
    rating: 5,
  },
];

const RECENT_BUYERS = [
  { name: "Kelson", city: "Luanda", time: "Há 2 min" },
  { name: "Nádia", city: "Talatona (Luanda)", time: "Há 5 min" },
  { name: "Paulo", city: "Kilamba (Luanda)", time: "Há 1 min" },
  { name: "Beatriz", city: "Viana (Luanda)", time: "Agora" },
  { name: "Helder", city: "Nova Vida (Luanda)", time: "Há 10 min" },
  { name: "Cláudio", city: "Maianga (Luanda)", time: "Há 3 min" },
  { name: "Ana", city: "Benfica (Luanda)", time: "Há 8 min" },
  { name: "João", city: "Talatona (Luanda)", time: "Há 4 min" },
];

const IMAGES = [
  "https://i.postimg.cc/PJc42xy9/main-image-1.webp",
  "https://i.postimg.cc/gkX4rVcH/main-image-2.webp",
  "https://i.postimg.cc/Qx9SVQxZ/main-image-3.webp",
  "https://i.postimg.cc/gkX4rVc1/main-image-4.webp",
  "https://i.postimg.cc/FsdG1yFP/main-image-5.webp",
  "https://i.postimg.cc/qMPwKNgF/main-image-6.webp",
];

const IMAGES_ROUPAS = [
  "https://i.postimg.cc/RCd8qXgb/main-image-1.webp",
  "https://i.postimg.cc/8PCYvMYq/main-image-5.webp",
  "https://i.postimg.cc/Prq7DY72/main-image-2.webp",
  "https://i.postimg.cc/c4Jz3wzF/main-image-3.webp",
  "https://i.postimg.cc/BQvzFHzk/main-image-4.webp",
];

type ModalState =
  | "none"
  | "step1"
  | "last-chance"
  | "testimonial-rebound"
  | "success"
  | "rejected"
  | "profile"
  | "danger-zone"
  | "danger-action-page-prompt"
  | "danger-action-page-confirm"
  | "danger-action-all-prompt"
  | "danger-alert"
  | "delete-lead-confirm"
  | "lead-preview"
  | "admin-financial-panel";

const FAQ_ROUPAS = [
  {
    q: "Gasta muita electricidade?",
    a: "Apenas 600W — menos do que um ferro de engomar normal. Uma sessão de 2 horas custa menos de 50 Kz em electricidade.",
  },
  {
    q: "É muito grande para um apartamento pequeno?",
    a: "Tem apenas 32 x 24 x 15 cm. Cabe numa gaveta, debaixo da cama ou no topo do roupeiro. Dobra para guardar.",
  },
  {
    q: "Funciona mesmo ou é mais um produto que não cumpre?",
    a: "A tecnologia PTC aquece o ar de forma uniforme e contínua. Não é um ventilador — é ar quente real que penetra no tecido e elimina a humidade de dentro para fora.",
  },
  {
    q: "E se eu comprar e não gostar?",
    a: "Pagas apenas quando o produto chega à tua porta. Se não ficares satisfeito nos primeiros 7 dias, contacta-nos e resolves sem complicação.",
  },
  {
    q: "Estraga os tecidos delicados?",
    a: "O ar quente é suave e controlado. Seguro para roupa íntima, tecidos finos, sintéticos e algodão. Não amarrota nem danifica.",
  },
];

const IMAGES_ROTEADOR = [
  "https://i.postimg.cc/jjvBx9jT/main-image-1.webp",
  "https://i.postimg.cc/tgD8qfg9/main-image-2.webp",
  "https://i.postimg.cc/mDDJtwcT/main-image-3.webp",
  "https://i.postimg.cc/bJJWsTGp/main-image-4.webp",
  "https://i.postimg.cc/JnnvGqyc/main-image-5.webp",
];

const TESTIMONIALS_ROTEADOR = [
  {
    name: "Hélder M., Talatona",
    comment:
      "Eu trabalho em TI e precisava de net rápida. Já tentei fibra, mas o serviço caía sempre. Comprei o ZTE MC888 Ultra, pus um chip da Africel e estou a tirar estabilidade que nunca tive. 5G real dentro de casa, os 3600 Mbps de WiFi 6 fazem muita diferença.",
    rating: 5,
  },
  {
    name: "Ana P., Luanda",
    comment:
      "Vale cada Kwanza! Estava cansada de ficar refém de planos caros de operadoras que falhavam. Agora eu decido qual chip usar (Unitel ou Africel dependendo do mês) e a velocidade de internet é sempre top. Design lindo e não ocupa espaço.",
    rating: 5,
  },
  {
    name: "Rui C., Benfica",
    comment:
      "Chega de router bloqueado que só serve pra uma operadora. O 5G aqui bate nos 2Gbps. Instalação em 2 minutos. Foi só espetar o chip e meter na tomada e já tava a voar no WiFi6. Entrega excelente no mesmo dia.",
    rating: 5,
  },
];

const FAQ_ROTEADOR = [
  {
    q: "O router vem bloqueado a alguma operadora?",
    a: "Não! É 100% livre e desbloqueado para qualquer rede em Angola (Africel, Unitel, Movicel) ou no mundo inteiro. Seja livre para escolher a sua operadora e trocar de chip quando quiser.",
  },
  {
    q: "Qual a diferença entre um router normal e este Ultra 5G WiFi 6?",
    a: "Um router normal 4G atinge velocidades baixas de até 100-300 Mbps e suporta poucos aparelhos. Este router Ultra Capta rede 5G verdadeira e alcança até 3600 Mbps (WiFi 6). Suporta até 32 dispositivos sem travar, garantindo velocidade para toda casa ou empresa.",
  },
  {
    q: "Preciso de instalação técnica?",
    a: "Não é necessário nenhum técnico. É 'Plug and Play'. Insira o cartão SIM, ligue à tomada e o seu WiFi estará pronto para uso. Para se conectar, tem inclusive o toque NFC: é só encostar o celular que já fica ligado no Wi-Fi.",
  },
  {
    q: "Vale a pena o investimento?",
    a: "Absolutamente! Se a qualidade e velocidade de internet são fundamentais para o seu trabalho, conforto ou empresa, ter acesso constante ao 5G mais rápido de Angola vai acabar com o seu stress diário com as redes convencionais.",
  },
];

const IMAGES_BASE_MOVEL = [
  "https://i.postimg.cc/7Lq3782G/main-image-1.webp",
  "https://i.postimg.cc/ZqJ83td0/main-image-2.webp",
  "https://i.postimg.cc/k57Q83bn/main-image-3.webp",
  "https://i.postimg.cc/ZqJ83tdY/main-image-4.webp",
  "https://i.postimg.cc/xd9vHDzf/main-image-5.webp",
  "https://i.postimg.cc/W4sGrLkj/main-image-6.webp",
];

const TESTIMONIALS_BASE_MOVEL = [
  {
    name: "Dona Maria, Talatona",
    comment:
      "O par por 15.000 Kz é um achado! Encaixei debaixo da geladeira e do fogão. Agora puxo tudo com uma mão para limpar sem riscar o chão nem fazer força!",
    rating: 5,
  },
  {
    name: "Teresa K., Kilamba",
    comment:
      "Super resistente! Coloquei no meu fogão e na máquina de lavar de 12kg. Antes era uma luta e arriscava estragar o azulejo, agora limpo por trás em segundos e travo no lugar.",
    rating: 5,
  },
  {
    name: "António P., Maianga",
    comment:
      "Chegou super rápido aqui em Luanda. Paguei no ato da entrega. O par vem completo com 2 bases ajustáveis. O metal é forte e sustenta a arca e o fogão sem arranhar nada.",
    rating: 5,
  },
];

const FAQ_BASE_MOVEL = [
  {
    q: "Serve para qualquer fogão, máquina de lavar, geladeira ou arca?",
    a: "Sim! A base é totalmente ajustável (de 72 x 4 x 5,2 cm) e suporta aparelhos pesados de praticamente qualquer tamanho doméstico, como fogões, máquinas de lavar, geladeiras, frigoríficos, arcas e até móveis pesados — movimentando tudo sem danificar nem riscar o piso.",
  },
  {
    q: "O valor de 15.000 Kz inclui o par completo?",
    a: "Sim! Por apenas 15.000 Kz (50% de desconto sobre o preço normal de 30.000 Kz) você recebe 1 PAR COMPLETO (2 hastes metálicas ajustáveis com rodízios 360° para apoiar ambos os lados do eletrodoméstico). Não paga nada antecipado — paga apenas na entrega (COD).",
  },
  {
    q: "Preciso de ferramentas ou técnico para instalar?",
    a: "Não precisa de nada! Basta levantar ligeiramente os cantos do seu aparelho, posicionar as bases metálicas por baixo e acionar as travas de segurança dos rodízios. Simples e sem complicações.",
  },
  {
    q: "O aparelho não vai ficar a deslizar sozinho quando estiver a trabalhar?",
    a: "Não! Os rodízios têm trava de segurança reforçada. Quando a trava está acionada, a base fica completamente fixa e estável, mesmo durante a centrifugação pesada da máquina de lavar ou trepidação do fogão.",
  },
  {
    q: "Quanto tempo demora a entrega em Luanda?",
    a: "Entregas em Luanda são feitas rapidamente por estafeta próprio em poucos dias úteis após a confirmação da sua reserva. Pagamento seguro feito no ato da entrega.",
  },
];

function AccordionItem({
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
    <div className={`${isDarkTheme ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden transition-all`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-800 pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    if (product === "secador-uv") return "sales";
    if (product === "cabide-secador") return "sales-roupas";
    if (product === "roteador-5g") return "sales-roteador";
    if (product === "base-movel" || product === "base-movel-360") return "sales-base-movel";
    const storedView = localStorage.getItem("validaC_current_view");
    if (storedView) return storedView;
    return "home";
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isSalesView =
    view === "sales" ||
    view === "sales-roupas" ||
    view === "sales-roteador" ||
    view === "sales-base-movel";

  const formatPhoneWithCensorship = (phone: string | undefined | null) => {
    if (!phone) return "";
    if (!hidePhones) return phone;
    let digitCount = 0;
    return phone
      .split("")
      .map((char) => {
        if (/\d/.test(char)) {
          digitCount++;
          if (digitCount > 4 && digitCount < 10) {
            return "•";
          }
        }
        return char;
      })
      .join("");
  };

  // Profile State
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Sales State
  const [modalState, setModalState] = useState<ModalState>("none");
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [selectedLeadForPreview, setSelectedLeadForPreview] =
    useState<any>(null);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [dangerActionContext, setDangerActionContext] = useState<{
    pageName?: string;
    leadCount?: number;
    docsToDelete?: import("firebase/firestore").QueryDocumentSnapshot<
      import("firebase/firestore").DocumentData,
      import("firebase/firestore").DocumentData
    >[];
    alertMessage?: string;
  }>({});
  const [dangerInputValue, setDangerInputValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    province: "Luanda",
    customProvince: "",
    observacoes: "",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  // Admin State
  const [adminData, setAdminData] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Refs for focusing inputs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameInputRoupasRef = useRef<HTMLInputElement>(null);

  // Smooth scroll to checkout section and focus the Name input field
  const handleScrollToCheckout = () => {
    const checkoutElem = document.getElementById("comprar");
    if (checkoutElem) {
      checkoutElem.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const nameInput = checkoutElem.querySelector<HTMLInputElement>(
          'input[type="text"], input[id*="name"]'
        );
        if (nameInput) {
          nameInput.focus();
        } else if (nameInputRef.current) {
          nameInputRef.current.focus();
        } else if (nameInputRoupasRef.current) {
          nameInputRoupasRef.current.focus();
        }
      }, 400);
    }
  };

  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userStatus, setUserStatus] = useState<
    "pending" | "approved" | "blocked" | "expired" | null
  >(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Admin Filter State
  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem("validaC_searchTerm") || "",
  );
  const [filterStatus, setFilterStatus] = useState(
    () => localStorage.getItem("validaC_filterStatus") || "Todos",
  );
  const [filterDate, setFilterDate] = useState(
    () => localStorage.getItem("validaC_filterDate") || "",
  );
  const [filterProduct, setFilterProduct] = useState(
    () => localStorage.getItem("validaC_filterProduct") || "",
  );
  const [timeRangeFilter, setTimeRangeFilter] = useState(
    () => localStorage.getItem("validaC_timeRangeFilter") || "Tudo",
  );
  const [adminListTab, setAdminListTab] = useState<"geral" | "arquivados">(
    () =>
      (localStorage.getItem("validaC_adminListTab") as
        | "geral"
        | "arquivados") || "geral",
  );
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminSubView, setAdminSubView] = useState<"leads" | "financeiro">(
    "leads",
  );
  const [financeProductFilter, setFinanceProductFilter] = useState("Todos");
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("validaC_theme") as "dark" | "light") || "dark",
  );
  const [activeDropdownLeadId, setActiveDropdownLeadId] = useState<
    string | null
  >(null);
  const [hidePhones, setHidePhones] = useState<boolean>(() => {
    return localStorage.getItem("validaC_hidePhones") === "true";
  });

  useEffect(() => {
    localStorage.setItem("validaC_hidePhones", String(hidePhones));
  }, [hidePhones]);
  const isDark =
    theme === "dark" &&
    [
      "admin",
      "pages",
      "danger-zone",
      "ai-generator",
      "settings",
      "prompt-gallery",
      "users",
    ].includes(view);

  useEffect(() => {
    localStorage.setItem("validaC_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("validaC_searchTerm", searchTerm);
    localStorage.setItem("validaC_filterStatus", filterStatus);
    localStorage.setItem("validaC_filterDate", filterDate);
    localStorage.setItem("validaC_filterProduct", filterProduct);
    localStorage.setItem("validaC_timeRangeFilter", timeRangeFilter);
    localStorage.setItem("validaC_adminListTab", adminListTab);
    setAdminCurrentPage(1);
  }, [
    searchTerm,
    filterStatus,
    filterDate,
    filterProduct,
    timeRangeFilter,
    adminListTab,
  ]);

  // Gallery State
  const [activeImage, setActiveImage] = useState(0);

  // Popup State
  const [activePopup, setActivePopup] = useState<any>(null);

  // Global Settings State
  const [appSettings, setAppSettings] = useState<{
    fbPixel?: string;
    googleTag?: string;
  }>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "global"));
        if (settingsDoc.exists()) {
          setAppSettings(settingsDoc.data());
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (view !== "sales" && view !== "sales-roupas") return;

    setTimeLeft(600); // 10 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    localStorage.setItem("validaC_current_view", view);

    const params = new URLSearchParams(window.location.search);
    if (view === "sales") {
      params.set("product", "secador-uv");
      document.title = "Secador Inteligente UV - Reserva Premium";
    } else if (view === "sales-roupas") {
      params.set("product", "cabide-secador");
      document.title = "Secador Expresso Pro - C Store Angola";
    } else if (view === "sales-roteador") {
      params.set("product", "roteador-5g");
      document.title = "Roteador 5G Ultra Desbloqueado - C Store Angola";
    } else if (view === "sales-base-movel") {
      params.set("product", "base-movel-360");
      document.title = "Base Móvel 360° — Deslizador para Máquina e Geladeira";
    } else if (
      view === "admin" ||
      view === "pages" ||
      view === "danger-zone" ||
      view === "users"
    ) {
      params.delete("product");
      document.title = "Administração - Valida C";
    } else {
      params.delete("product");
      document.title = "Valida C - Plataforma de Vendas";
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [view]);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Load user DB object to check status
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!isMounted) return;
          if (userDoc.exists()) {
            const data = userDoc.data();
            let finalStatus = data.status || "pending";
            setUserName(data.name || user.displayName || "");

            if (
              user.email === "exportacoes.extras@gmail.com" ||
              user.email?.toLowerCase() === "grupocassaminha@gmail.com" ||
              user.email?.toLowerCase() === "grupocasssaminha@gmail.com"
            ) {
              finalStatus = "approved";
            }

            // Check expiration if pending
            if (finalStatus === "pending" && data.trialExpiresAt) {
              const now = new Date();
              const exp = data.trialExpiresAt.toDate();
              if (now > exp) finalStatus = "expired";
            }

            setUserStatus(finalStatus as any);
          } else {
            // Admin fallback or old user
            setUserName(user.displayName || "");
            if (
              user.email === "exportacoes.extras@gmail.com" ||
              user.email?.toLowerCase() === "grupocassaminha@gmail.com" ||
              user.email?.toLowerCase() === "grupocasssaminha@gmail.com"
            ) {
              setUserStatus("approved");
            } else {
              setUserStatus("pending"); // assume new user without doc
            }
          }
        } catch (e: any) {
          if (!isMounted) return;
          console.error("Error fetching user status:", e);
          setUserName(user.displayName || "");
          if (
            user.email === "exportacoes.extras@gmail.com" ||
            user.email?.toLowerCase() === "grupocassaminha@gmail.com" ||
            user.email?.toLowerCase() === "grupocasssaminha@gmail.com"
          ) {
            setUserStatus("approved");
          } else {
            setUserStatus("pending");
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserStatus(null);
        setUserName("");
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      (view === "admin" ||
        view === "pages" ||
        view === "danger-zone" ||
        view === "users")
    ) {
      loadAdminData();
    }
  }, [view, isAuthenticated]);

  useEffect(() => {
    if (
      view !== "sales" &&
      view !== "sales-roupas" &&
      view !== "sales-roteador" &&
      view !== "sales-base-movel"
    )
      return;

    const handleScroll = () => {
      const comprarEl = document.getElementById("comprar");
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

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [view]);

  useEffect(() => {
    if (
      view === "sales" ||
      view === "sales-roupas" ||
      view === "sales-roteador" ||
      view === "sales-base-movel"
    ) {
      const produtoName =
        view === "sales-roupas"
          ? "Secador Expresso Pro 35 000 Kz"
          : view === "sales-roteador"
            ? "Roteador 5G Ultra Desbloqueado"
            : view === "sales-base-movel"
              ? "Base Móvel 360°"
              : "Secador Inteligente UV";
      initTracking(produtoName, appSettings);

      const imagesList =
        view === "sales-roupas"
          ? IMAGES_ROUPAS
          : view === "sales-roteador"
            ? IMAGES_ROTEADOR
            : view === "sales-base-movel"
              ? IMAGES_BASE_MOVEL
              : IMAGES;

      const timer = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % imagesList.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [view, appSettings]);

  useEffect(() => {
    if (
      view !== "sales" &&
      view !== "sales-roupas" &&
      view !== "sales-roteador" &&
      view !== "sales-base-movel"
    )
      return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Show every 12 to 25 seconds randomly
      const delay = 12000 + Math.random() * 13000;
      timeoutId = setTimeout(() => {
        const randomBuyer =
          RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
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

    const produtoName =
      view === "sales-roupas"
        ? "Secador Expresso Pro 35 000 Kz"
        : view === "sales-roteador"
          ? "Roteador 5G Ultra Desbloqueado"
          : view === "sales-base-movel"
            ? "Base Móvel 360°"
            : "Secador Inteligente UV";
    const pricePerUnit =
      view === "sales-roupas"
        ? 35000
        : view === "sales-roteador"
          ? 240000
          : view === "sales-base-movel"
            ? 15000
            : 25000;

    const tempLead = {
      name: formData.name,
      phone: formData.phone,
      address: formData.area || "", // Bairro/Zona/Município mapping
      province:
        formData.province === "Outra"
          ? formData.customProvince
          : formData.province,
      area: formData.area || "", // Bairro/Zona
      observacoes: formData.observacoes,
      produto: produtoName,
      totalPrice: formData.quantity * pricePerUnit,
      quantity: formData.quantity,
      status: "Pendente",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "leads"), tempLead);
      setCurrentLeadId(docRef.id);

      // Disparar Evento Lead (Pendente)
      trackEvent(produtoName, "generate_lead", "Lead", appSettings);

      setIsSubmitting(false);
      setModalState("step1");
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message.includes("missing or insufficient permissions")
      ) {
        handleFirestoreError(err, OperationType.CREATE, "leads");
      }
      console.error("Erro ao criar lead:", err);
      alert(
        "Ocorreu um erro ao salvar o seu pedido. Por favor, tente novamente.",
      );
      setIsSubmitting(false);
    }
  };

  const processReservation = async (isAccepted: boolean) => {
    setModalState("none");

    const produtoName =
      view === "sales-roupas"
        ? "Secador Expresso Pro 34 900 Kz"
        : view === "sales-roteador"
          ? "Roteador 5G Ultra Desbloqueado"
          : view === "sales-base-movel"
            ? "Base Móvel 360°"
            : "Secador Inteligente UV";

    if (isAccepted) {
      setTimeout(() => setModalState("success"), 300);

      // Disparar Eventos Customizados (Reservado com sucesso)
      trackEvent(produtoName, "add_to_cart", "AddToCart", appSettings);
      trackEvent(
        produtoName,
        "complete_registration",
        "CompleteRegistration",
        appSettings,
      );
      trackEvent(produtoName, "subscribe", "Subscribe", appSettings);
    } else {
      setTimeout(() => setModalState("rejected"), 300);
    }

    if (currentLeadId) {
      try {
        await updateDoc(doc(db, "leads", currentLeadId), {
          status: isAccepted ? "Reservado" : "Rejeitado",
        });
      } catch (err: any) {
        if (
          err instanceof Error &&
          err.message.includes("missing or insufficient permissions")
        ) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `leads/${currentLeadId}`,
          );
        }
        console.error("Erro ao atualizar lead:", err);
      }
    }
  };

  const closeModal = () => {
    setModalState("none");
    setFormData({
      name: "",
      phone: "",
      address: "",
      area: "",
      province: "Luanda",
      customProvince: "",
      quantity: 1,
    });
  };

  // ----------------------------------------------------
  // Admin Logic
  // ----------------------------------------------------
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setLoginError(
        "Por favor, introduza o seu email no campo acima para recuperar a senha.",
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      alert("Link de recuperação enviado! Verifique o seu email.");
    } catch (err: any) {
      setLoginError("Erro ao recuperar senha: " + err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (profileFormData.name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileFormData.name,
        });
      }

      if (
        profileFormData.email !== auth.currentUser.email &&
        profileFormData.email.trim() !== ""
      ) {
        await updateEmail(auth.currentUser, profileFormData.email);
      }

      if (profileFormData.password.trim() !== "") {
        await updatePassword(auth.currentUser, profileFormData.password);
      }

      alert("Perfil atualizado com sucesso!");
      setModalState("none");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        alert(
          "Por motivos de segurança, deverá terminar sessão e voltar a entrar antes de atualizar dados sensíveis.",
        );
      } else {
        alert("Erro ao atualizar perfil: " + err.message);
      }
    }
  };

  const openProfileModal = () => {
    setProfileFormData({
      name: auth.currentUser?.displayName || "Pedro",
      email: auth.currentUser?.email || "",
      password: "",
    });
    setModalState("profile");
  };

  const handlePasswordChange = async () => {
    const newPass = prompt("Digite a nova senha para o seu painel:");
    if (!newPass || newPass.trim() === "") return;
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPass);
        alert("Senha alterada com sucesso!");
      }
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        alert(
          "Por motivos de segurança, deverá terminar sessão e voltar a entrar antes de alterar a senha.",
        );
      } else {
        alert("Erro ao alterar senha: " + err.message);
      }
    }
  };

  const toggleAdmin = () => {
    if (view === "admin") {
      setView("sales");
    } else {
      setView("admin");
      if (isAuthenticated) {
        loadAdminData();
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsAdminLoading(true);

    try {
      if (
        loginEmail.toLowerCase() === "grupocassaminha@gmail.com" ||
        loginEmail.toLowerCase() === "grupocasssaminha@gmail.com"
      ) {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        } catch (authErr: any) {
          if (
            authErr.code === "auth/user-not-found" ||
            authErr.code === "auth/invalid-login-credentials" ||
            authErr.code === "auth/invalid-credential"
          ) {
            // If the user doesn't exist, we create it. Warning: Production apps should handle this differently
            try {
              const userCredential = await createUserWithEmailAndPassword(
                auth,
                loginEmail,
                loginPassword,
              );
              const user = userCredential.user;
              await updateProfile(user, { displayName: "Pedro Cassaminha" });
              // Criar doc do utilizador admin
              await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                name: "Pedro Cassaminha",
                email: loginEmail,
                phone: "",
                role: "admin",
                status: "approved",
                createdAt: serverTimestamp(),
              }).catch((err) =>
                console.error("Could not create user document", err),
              );
            } catch (createErr: any) {
              setLoginError(
                "Erro ao criar conta: " +
                  (createErr.message || "Erro desconhecido"),
              );
              setIsAdminLoading(false);
              return;
            }
          } else {
            setLoginError(
              "Erro ao fazer login: " +
                (authErr.message || "Credenciais inválidas."),
            );
            setIsAdminLoading(false);
            return;
          }
        }
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setLoginError("Endereço de e-mail não autorizado.");
      }
    } catch (err) {
      setLoginError("Ocorreu um erro ao fazer login.");
    }
    setIsAdminLoading(false);
  };

  const loadAdminData = async () => {
    setIsAdminLoading(true);
    setAdminError("");

    try {
      const q = query(collection(db, "leads"));
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map((doc) => {
        let ts = doc.data().timestamp || null;
        try {
          if (
            doc.data().createdAt?.toDate &&
            typeof doc.data().createdAt.toDate === "function"
          ) {
            ts = doc.data().createdAt.toDate().toISOString();
          } else if (typeof doc.data().createdAt === "string") {
            ts = doc.data().createdAt;
          }
        } catch (e) {
          console.error("Erro na data", e);
        }

        const rawProduto = doc.data().produto || "";
        let normalizedProduto = "Secador Inteligente UV";
        if (rawProduto) {
          const lowerProd = rawProduto.toLowerCase();
          if (
            lowerProd.includes("roupa") ||
            lowerProd.includes("expresso") ||
            lowerProd.includes("cabide") ||
            lowerProd.includes("secador_roupa") ||
            lowerProd.includes("35000") ||
            lowerProd.includes("35 000") ||
            lowerProd.includes("34900") ||
            lowerProd.includes("34 900")
          ) {
            normalizedProduto = "Secador Expresso Pro 35 000 Kz";
          } else {
            normalizedProduto = "Secador Inteligente UV";
          }
        }

        return {
          id: doc.id,
          ...doc.data(),
          produto: normalizedProduto,
          timestamp: ts,
        };
      });
      // Sort locally by timestamp descending
      leads.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
      setAdminData(leads);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      if (err instanceof Error && err.message.includes("Index")) {
        setAdminError(
          "O banco de dados está a ser indexado. Por favor, tente novamente em alguns minutos.",
        );
      } else {
        setAdminError(
          "Erro na comunicação com a base de dados: " + (err.message || ""),
        );
      }
    } finally {
      setIsAdminLoading(false);
    }
  };

  const formatKz = (value: number) => {
    return (
      new Intl.NumberFormat("pt-AO", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + " Kz"
    );
  };

  const getLeadPrice = (lead: any) => {
    if (!lead) return 0;
    const q = lead.quantity || 1;
    const prod = (lead.produto || "").toLowerCase();
    const unitPrice =
      prod.includes("35000") ||
      prod.includes("35 000") ||
      prod.includes("expresso")
        ? 35000
        : 25000;

    if (typeof lead.totalPrice === "number" && lead.totalPrice > 0) {
      if (lead.totalPrice < q * unitPrice) {
        return q * unitPrice;
      }
      return lead.totalPrice;
    }
    return q * unitPrice;
  };

  const getFormattedLeadText = (lead: any) => {
    const q = lead.quantity || 1;
    const product = lead.produto || "Secador Inteligente UV";
    const total = formatKz(getLeadPrice(lead));
    const mainProvince = lead.province || "Luanda";
    const mainArea = lead.area || lead.address || "N/A";

    return `Cliente: ${lead.name}\ntelefone: ${lead.phone}\nProdutos: ${q} - ${product}\nProvíncia: ${mainProvince}\nEndereço: ${mainArea}\nTotal: ${total}.`;
  };

  const getWhatsAppMessageText = (lead: any) => {
    const name = lead.name || "";
    const date = lead.timestamp
      ? new Date(lead.timestamp).toLocaleDateString("pt-AO")
      : "N/A";
    const product = lead.produto || "Secador Inteligente UV";
    const quantity = lead.quantity || 1;
    const totalFormatted = new Intl.NumberFormat("pt-AO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(getLeadPrice(lead));
    const address = [lead.province || "Luanda", lead.area || lead.address]
      .filter(Boolean)
      .join(", ");

    return `Olá Sr/a ${name}! 
Aqui é a C Store Angola!
No dia ${date} manifestou interesse em adquirir ${product} (${quantity}x) no valor de ${totalFormatted} Kz.

Temos uma boa notícia — o produto já chegou e estamos prontos para fazer a entrega amanhã! 

Antes de confirmar, os teus dados estão corretos? 

Endereço: ${address} 
Produto: ${product} (${quantity}x)  
Total a pagar: ${totalFormatted} Kz

Se sim, qual é o melhor período para receberes a entrega amanhã? 

Manhã (8h - 12h)  
Tarde (12h - 15h)  
Final do dia (16h - 18h)`;
  };

  const handleCopyLead = (lead: any) => {
    const text = getFormattedLeadText(lead);
    navigator.clipboard.writeText(text);
    alert("Informações copiadas!");
  };

  const handleWhatsApp = (lead: any) => {
    const cleanPhone = lead.phone.replace(/\D/g, "");
    const text = getWhatsAppMessageText(lead);
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}/?text=${encodedText}`, "_blank");
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Update no UI otimista
    setAdminData((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
    try {
      await updateDoc(doc(db, "leads", leadId), { status: newStatus });
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message.includes("missing or insufficient permissions")
      ) {
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

    const headers = [
      "Data",
      "Nome",
      "WhatsApp",
      "Produto",
      "Qtd",
      "Endereço",
      "Status",
    ];
    const csvRows = [headers.join(",")];

    filteredData.forEach((lead) => {
      const date = lead.timestamp
        ? new Date(lead.timestamp).toLocaleDateString()
        : "N/A";
      const q = lead.quantity || 1;
      // Prevenir problemas com vírgulas escapando com aspas duplas
      const row = [
        `"${date}"`,
        `"${lead.name || ""}"`,
        `"${lead.phone || ""}"`,
        `"${lead.produto || "Secador Inteligente UV"}"`,
        q,
        `"${lead.address || ""}"`,
        `"${lead.status || ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + "\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Leads_Valida_C_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredData = adminData.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "Todos" ||
      lead.status === filterStatus ||
      (lead.status &&
        lead.status.includes("Reservado") &&
        filterStatus === "Reservado");
    let matchesDate = filterDate === "";
    if (filterDate !== "" && lead.timestamp) {
      try {
        matchesDate =
          new Date(lead.timestamp).toISOString().split("T")[0] === filterDate;
      } catch (e) {
        matchesDate = false;
      }
    }
    const matchesProduct =
      filterProduct === "" ||
      (lead.produto || "Secador Inteligente UV")
        .toLowerCase()
        .includes(filterProduct.toLowerCase());

    // Filtro CRM por período (Hoje, Últimos 7 dias, etc.)
    let passesTimeRange = true;
    let leadDateStr = lead.timestamp;
    try {
      if (!leadDateStr && lead.createdAt?.toDate) {
        leadDateStr = lead.createdAt.toDate().toISOString();
      }
    } catch (e) {}
    if (leadDateStr && timeRangeFilter !== "Tudo") {
      const leadDate = new Date(leadDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (timeRangeFilter === "Hoje") {
        passesTimeRange = leadDate >= today;
      } else if (timeRangeFilter === "Últimos 7 Dias") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        passesTimeRange = leadDate >= sevenDaysAgo;
      } else if (timeRangeFilter === "Este Mês") {
        passesTimeRange =
          leadDate.getMonth() === today.getMonth() &&
          leadDate.getFullYear() === today.getFullYear();
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate &&
      matchesProduct &&
      passesTimeRange
    );
  });

  const allDisplayedLeads = filteredData.filter((lead) => {
    if (adminListTab === "arquivados") {
      return lead.status === "Entregue" || lead.status === "Pago";
    } else {
      return lead.status !== "Entregue" && lead.status !== "Pago";
    }
  });

  const itemsPerPage = 40;
  const totalPages = Math.ceil(allDisplayedLeads.length / itemsPerPage) || 1;
  const currentPage = Math.min(adminCurrentPage, totalPages);
  const displayedLeads = allDisplayedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const leadsForMetrics = adminData.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = filterDate === "";
    if (filterDate !== "" && lead.timestamp) {
      try {
        matchesDate =
          new Date(lead.timestamp).toISOString().split("T")[0] === filterDate;
      } catch (e) {
        matchesDate = false;
      }
    }
    const matchesProduct =
      filterProduct === "" ||
      (lead.produto || "Secador Inteligente UV")
        .toLowerCase()
        .includes(filterProduct.toLowerCase());

    let passesTimeRange = true;
    let leadDateStr = lead.timestamp;
    try {
      if (!leadDateStr && lead.createdAt?.toDate) {
        leadDateStr = lead.createdAt.toDate().toISOString();
      }
    } catch (e) {}
    if (leadDateStr && timeRangeFilter !== "Tudo") {
      const leadDate = new Date(leadDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (timeRangeFilter === "Hoje") {
        passesTimeRange = leadDate >= today;
      } else if (timeRangeFilter === "Últimos 7 Dias") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        passesTimeRange = leadDate >= sevenDaysAgo;
      } else if (timeRangeFilter === "Este Mês") {
        passesTimeRange =
          leadDate.getMonth() === today.getMonth() &&
          leadDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesDate && matchesProduct && passesTimeRange;
  });

  const totalSubmissions = leadsForMetrics.length;
  const totalReservados = leadsForMetrics.filter(
    (d) => d.status && d.status.includes("Reservado"),
  ).length;
  const conversionRate =
    totalSubmissions > 0
      ? ((totalReservados / totalSubmissions) * 100).toFixed(1)
      : "85.0";

  const uniquePages = Array.from(
    new Set([
      "Secador Inteligente UV",
      "Secador Expresso Pro 35 000 Kz",
      "Roteador 5G Ultra Desbloqueado",
      "Base Móvel 360°",
      ...adminData.map((l) => l.produto).filter(Boolean),
    ]),
  );

  const formatPageNameWithCensorship = (
    pageName: string | undefined | null,
  ) => {
    if (!pageName) return "";
    if (!hidePhones) return pageName;
    const index = uniquePages.indexOf(pageName);
    if (index !== -1) {
      return `Página #${index + 1}`;
    }
    return "Página Ocultada";
  };

  const isProtectedView = [
    "admin",
    "pages",
    "danger-zone",
    "ai-generator",
    "settings",
    "prompt-gallery",
    "users",
  ].includes(view);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-400 h-10 w-10" />
          <p className="text-sm font-bold text-slate-400 font-mono">
            A carregar sessão...
          </p>
        </div>
      </div>
    );
  }

  if (
    view === "auth" ||
    view === "auth-register" ||
    (isProtectedView && !isAuthenticated && userStatus !== undefined)
  ) {
    if (isAuthenticated && userStatus !== undefined) {
      setView("pages");
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return (
        <AuthView
          setView={setView}
          onLoginSuccess={() => setView("pages")}
          initialTab={view === "auth-register" ? "register" : "login"}
        />
      );
    }
  }

  if (view === "home") {
    return (
      <HomeView
        setView={setView}
        isAuthenticated={isAuthenticated}
        currentUser={auth.currentUser}
        userName={userName}
      />
    );
  }

  if (isProtectedView && isAuthenticated && userStatus === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (
    isProtectedView &&
    isAuthenticated &&
    (userStatus === "blocked" ||
      userStatus === "expired" ||
      userStatus === "pending")
  ) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl max-w-md w-full text-white">
          <h1 className="text-2xl font-black text-white mb-2">
            Acesso Restrito
          </h1>
          <p className="text-slate-400 mb-6">
            A sua conta encontra-se atualmente inativa ou bloqueada. Por favor,
            contacte o administrador (Grupo Cassaminha) para libertar o seu
            acesso.
          </p>
          <button
            onClick={() => {
              setView("auth");
              auth.signOut();
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 w-full"
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Navigation (Internal Admin / Management Views Only) */}
      {isAuthenticated && view !== "home" && !isSalesView && (
        <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setView("home")}
            >
              {view === "admin" ||
              view === "pages" ||
              view === "danger-zone" ||
              view === "users" ? (
                <>
                  <img
                    src="https://i.postimg.cc/qqtQqXb4/C-grupo.png"
                    alt="Logotipo C Grupo"
                    className="h-8 w-auto object-contain rounded"
                  />
                  <span className="font-bold text-lg tracking-tight">
                    Valida C
                  </span>
                </>
              ) : (
                <>
                  <img
                    src="https://i.postimg.cc/3wsKF20v/Chat-GPT-Image-13-de-mai-de-2026-12-40-58.png"
                    alt="Logotipo C Store Angola"
                    className="h-10 w-auto object-contain rounded"
                  />
                  <span className="font-bold text-lg tracking-tight">
                    C Store Angola
                  </span>
                </>
              )}
            </div>

            <div
              className={`flex items-center gap-4 ${isSalesView ? "hidden md:flex" : ""}`}
            >
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold shadow-sm"
                    title="Actualizar Página"
                  >
                    <RefreshCw size={12} className="text-emerald-400" />
                    <span>Actualizar</span>
                  </button>
                  <div className="relative">
                    <div
                      className="flex items-center gap-2 border border-slate-700 bg-slate-800/80 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {(auth.currentUser?.displayName || "Pedro")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-emerald-400">
                        Olá, {auth.currentUser?.displayName || "Pedro"}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500 ml-1"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 z-50 overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  openProfileModal();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                              >
                                <User size={16} /> Meu Perfil
                              </button>
                              <button
                                onClick={() =>
                                  setTheme(isDark ? "light" : "dark")
                                }
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                              >
                                {isDark ? (
                                  <>
                                    <Sun size={16} className="text-amber-400" />
                                    <span>Tema Claro</span>
                                  </>
                                ) : (
                                  <>
                                    <Moon
                                      size={16}
                                      className="text-indigo-400"
                                    />
                                    <span>Tema Escuro</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setView("admin");
                                  setAdminSubView("leads");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                              >
                                <FileText size={16} /> Painel de Leads
                              </button>
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setView("admin");
                                  setAdminSubView("financeiro");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                              >
                                <Store size={16} /> Painel Financeiro
                              </button>
                              <button
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setView("pages");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                              >
                                <LayoutDashboard size={16} /> Gerenc. Páginas
                              </button>
                              {(auth.currentUser?.email ===
                                "exportacoes.extras@gmail.com" ||
                                auth.currentUser?.email?.toLowerCase() ===
                                  "grupocassaminha@gmail.com") && (
                                <button
                                  onClick={() => {
                                    setIsDropdownOpen(false);
                                    setView("users");
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-left"
                                >
                                  <User size={16} /> Gestão de Utilizadores
                                </button>
                              )}
                            </div>
                            <div className="p-2 border-t border-slate-700">
                              <button
                                onClick={async () => {
                                  await signOut(auth);
                                  setIsDropdownOpen(false);
                                  setIsAuthenticated(false);
                                  setView("home");
                                }}
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
                </>
              )}
              {!isAuthenticated && view !== "home" && (
                <button
                  onClick={() => setView("admin")}
                  className="text-sm font-medium flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                >
                  <Lock size={14} /> Entrar
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* SALES VIEW */}
      {view === "sales" && (
        <main className="pb-24 text-center">
          {/* BLOCO 1 — HERO */}
          <section className="pt-10 pb-6 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-block bg-indigo-100 text-indigo-800 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6 border border-indigo-200 uppercase tracking-wider">
                A solução para quem vive em apartamento em Luanda
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight px-2">
                O fim definitivo do chulé e da humidade no seu calçado favorito.
              </h1>

              {/* Product Gallery */}
              <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200 inline-block w-full mb-12">
                <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-slate-100 w-full mb-4 group shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={IMAGES[activeImage]}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>
                {/* Thumbnails arranged better for mobile */}
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {IMAGES.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden snap-center transition-all ${
                        activeImage === i
                          ? "ring-4 ring-indigo-500 opacity-100 scale-105"
                          : "ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                A tecnologia avançada que seca em profundidade e elimina 99.9%
                das bactérias e fungos enquanto você descansa.
              </p>

              <div className="max-w-xl mx-auto mb-16 text-left">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-6 text-center">
                  Sente que isto acontece consigo?
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Praticas desporto e o teu calçado fica sempre encharcado de suor",
                    "Tens calçado caro que queres preservar por muito mais tempo",
                    "Sofres com o mau cheiro (chulé) persistente e nada resolve",
                    "Queres garantir que os teus pés estão livres de fungos e micoses",
                    "Precisas de secar sapatos de forma rápida nos dias de chuva ?",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                    >
                      <div className="bg-indigo-50 text-indigo-500 rounded-full p-1">
                        <CheckCircle size={18} />
                      </div>
                      <span className="text-slate-700 font-semibold text-[15px] leading-snug">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCO 4: BENEFÍCIOS REAIS */}
              <div className="mb-24 py-12 bg-slate-50 -mx-4 px-6 rounded-[3rem] border border-slate-200">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    Benefícios Reais
                  </h2>
                  <p className="text-slate-500 mb-10 font-medium">
                    Muito mais do que apenas secar o calçado.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                      {
                        icon: <ShieldAlert size={24} />,
                        title: "Higiene e Saúde",
                        desc: "A luz ultravioleta mata fungos e bactérias onde os sprays não chegam.",
                      },
                      {
                        icon: <Activity size={24} />,
                        title: "Secagem Segura",
                        desc: "Mantém a temperatura constante (48ºC) para não danificar o seu calçado.",
                      },
                      {
                        icon: <Timer size={24} />,
                        title: "Tecnologia Inteligente",
                        desc: "Temporizador automático de até 120min para uma secagem prática e segura.",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:-translate-y-1 transition-transform"
                      >
                        <div className="text-indigo-600 mb-6 bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center">
                          {item.icon}
                        </div>
                        <h4 className="font-bold text-slate-900 mb-3 text-lg leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="max-w-4xl mx-auto px-4">
            {/* BLOCO 5: ESTERILIZAÇÃO EM 3 PASSOS */}
            <section className="mb-24">
              <h2 className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight">
                Esterilização em 3 passos
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold absolute -top-6 shadow-lg">
                    1
                  </div>
                  <div className="text-4xl mb-6 mt-2">👟</div>
                  <p className="font-bold text-slate-800 leading-relaxed">
                    Insira os bicos do secador dentro do calçado, seja
                    atacadores ou sapato social
                  </p>
                </div>
                <div className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold absolute -top-6 shadow-lg">
                    2
                  </div>
                  <div className="text-4xl mb-6 mt-2">🕒</div>
                  <p className="font-bold text-slate-800 leading-relaxed">
                    Escolha o tempo necessário (30 a 120 min) e ative a luz UV
                    para esterilizar
                  </p>
                </div>
                <div className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold absolute -top-6 shadow-lg">
                    3
                  </div>
                  <div className="text-4xl mb-6 mt-2">✨</div>
                  <p className="font-bold text-slate-800 leading-relaxed">
                    Retire o seu calçado totalmente seco, cheiroso e livre de
                    99.9% das bactérias
                  </p>
                </div>
              </div>
            </section>

            {/* BLOCO 6: TABELA COMPARATIVA */}
            <section className="mb-24 px-4 overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 tracking-tight">
                Secagem Manual VS Secador C Store UV
              </h2>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-2xl mx-auto">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[350px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">
                          Critério
                        </th>
                        <th className="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-100/50 text-center">
                          Secagem ao Sol
                        </th>
                        <th className="p-4 border-b border-slate-100 font-bold text-indigo-600 bg-indigo-50 text-center uppercase tracking-tighter">
                          Secador C Store UV
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] sm:text-sm">
                      {[
                        {
                          c: "⭐ Eliminação Bacteriana",
                          t: "Limitada",
                          s: "99.9% (via UV)",
                          highlight: true,
                        },
                        {
                          c: "Preservação do Couro",
                          t: "Dura e resseca",
                          s: "Suave (48ºC fixos)",
                        },
                        {
                          c: "⭐ Tempo de Secagem",
                          t: "24h a 48h",
                          s: "30 a 120 min",
                          highlight: true,
                        },
                        {
                          c: "Eliminação de Odores",
                          t: "Superficial",
                          s: "Profunda (mata a raiz)",
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-slate-50 transition-colors ${row.highlight ? "bg-indigo-50/30" : ""}`}
                        >
                          <td
                            className={`p-4 border-b border-slate-50 font-bold text-slate-800 ${row.highlight ? "bg-indigo-100/30" : ""}`}
                          >
                            {row.c}
                          </td>
                          <td className="p-4 border-b border-slate-50 text-slate-500 text-center">
                            {row.t}
                          </td>
                          <td
                            className={`p-4 border-b border-slate-50 font-black text-center ${row.highlight ? "text-indigo-700" : "text-slate-900"}`}
                          >
                            {row.s}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* BLOCO 7: ESPECIFICAÇÕES TÉCNICAS */}
            <section className="mb-24 text-left max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                Especificações Técnicas
              </h2>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100 font-bold">
                  <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600">Aquecimento</span>
                    <span className="text-slate-900 text-right">
                      48ºC constantes
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600">Tecnologia</span>
                    <span className="text-slate-900 text-right">
                      Luz UV Esterilizante
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600">Material</span>
                    <span className="text-slate-900 text-right">
                      ABS de alta resistência
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-600">Voltagem</span>
                    <span className="text-slate-900 text-right">
                      Bivolt Automático
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Checkout Section - UV */}
            <div
              id="comprar"
              className="pt-8 scroll-mt-20 px-4 mb-20 w-full max-w-6xl mx-auto"
            >
              <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row text-left">
                <div className="lg:w-[42%] bg-indigo-600 p-10 text-white flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="relative z-10 mb-auto">
                    <h2 className="text-3xl sm:text-5xl font-black mb-8 leading-tight tracking-tight">
                      Pés secos.
                      <br />
                      Calçado higienizado.
                    </h2>
                    <div className="space-y-4 mb-12">
                      {[
                        "Entrega Grátis em Luanda",
                        "Entrega noutra província Sob-Consulta",
                        "Pagas no Momento da Entrega",
                        "Garantia Blindada C Store",
                        "Suporte via WhatsApp 24/7",
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 text-[15px] font-bold bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10"
                        >
                          <div className="bg-white text-indigo-600 p-1 rounded-full">
                            <CheckCircle size={16} />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:w-[58%] p-8 sm:p-12">
                  <div className="text-center sm:text-left mb-10 relative flex flex-col items-center sm:items-start">
                    <div className="bg-red-500 text-white font-black py-2 px-5 rounded-full text-xs shadow-xl animate-bounce mb-6">
                      POUPA{" "}
                      {new Intl.NumberFormat("pt-AO").format(
                        formData.quantity * 10000,
                      )}{" "}
                      KZ HOJE
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-slate-400 line-through text-2xl font-bold tracking-tight">
                        {new Intl.NumberFormat("pt-AO").format(
                          formData.quantity * 35000,
                        )}{" "}
                        Kz
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black text-slate-900 tracking-tighter">
                          {new Intl.NumberFormat("pt-AO").format(
                            formData.quantity * 25000,
                          )}
                        </span>
                        <span className="text-2xl font-black text-slate-400">
                          Kz
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                          Nome Completo
                        </label>
                        <input
                          id="name-input"
                          ref={nameInputRef}
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                          placeholder="Ex: Carlos Mendes"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                          Número de WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                          placeholder="Ex: 921 167 980"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                          Província
                        </label>
                        <div className="relative">
                          <select
                            value={formData.province}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                province: e.target.value,
                              })
                            }
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-slate-700"
                          >
                            <option value="Luanda">Luanda</option>
                            <option value="Huambo">Huambo</option>
                            <option value="Benguela">Benguela</option>
                            <option value="Outra">Outra</option>
                          </select>
                          <ChevronDown
                            size={18}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                        {formData.province === "Outra" && (
                          <div className="mt-4">
                            <input
                              type="text"
                              required
                              value={formData.customProvince}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customProvince: e.target.value,
                                })
                              }
                              className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                              placeholder="Escreva a sua província..."
                            />
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                          Bairro, Zona, Município
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.area}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                          placeholder="Ex: Talatona, Rua 4, perto do banco..."
                        />
                      </div>
                      <div className="sm:col-span-2 flex flex-col gap-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                          Quantas unidades?
                        </label>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, quantity: q })
                              }
                              className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black flex flex-col items-center justify-center gap-1 ${formData.quantity === q ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-500/10" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                            >
                              <span className="text-xl">{q}</span>
                              <span className="text-[10px] uppercase tracking-wider">
                                {q === 1 ? "Unidade" : "Unidades"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg py-5 rounded-3xl shadow-2xl shadow-emerald-500/30 transition-all transform active:scale-95 flex flex-col justify-center items-center ${isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-1"}`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={32} />
                        ) : (
                          <>
                            <span>EFECTUAR MINHA RESERVA AGORA</span>
                            <span className="text-[10px] opacity-90 font-black uppercase tracking-[0.2em] mt-1.5">
                              Pagas só no momento da entrega
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>

            {/* BLOCO 8: PROVAS SOCIAIS */}
            <section className="mb-24 px-4 bg-slate-50 py-20 border-y border-slate-200">
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                  Quem comprou, recomenda!
                </h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                  Vê o que os nossos clientes dizem sobre a eficácia do Secador
                  Inteligente UV.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  {
                    name: "Joana B.",
                    text: "O chulé dos ténis de ginásio do meu marido acabou. A luz UV realmente faz diferença. Super prático!",
                  },
                  {
                    name: "Miguel A.",
                    text: "Trabalho de fato e os meus sapatos clássicos estão sempre impecáveis agora. Seca por dentro sem estragar o couro.",
                  },
                  {
                    name: "Sofia T.",
                    text: "Moro no Kilamba e na época das chuvas era um pesadelo secar as sapatilhas das crianças. Este aparelho resolveu tudo.",
                  },
                  {
                    name: "André L.",
                    text: "Incrível para quem viaja muito como eu. Leve e cabe em qualquer canto da mala. Meus pés agradecem.",
                  },
                ].map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full group hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-1 mb-6 text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mb-8 italic leading-relaxed flex-grow">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                        {t.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {t.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BLOCO 9: GARANTIA */}
            <div className="max-w-4xl mx-auto px-4 mb-24">
              <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden ring-8 ring-indigo-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 border border-white/20">
                    <ShieldCheck size={56} className="text-indigo-200" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">
                      Garantia Blindada C Store
                    </h2>
                    <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                      Compra sem risco. Se o produto chegar com defeito ou não
                      funcionar como prometido, entre em contacto pelo WhatsApp
                      e resolvemos. Sem complicação.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mb-24 text-left max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight text-center">
                Tire todas as suas dúvidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    q: "Quanto tempo demora a entrega em Luanda?",
                    a: "A entrega é feita no mesmo dia ou em até 24h úteis após a confirmação do pedido.",
                  },
                  {
                    q: "O secador cabe em sapatos de criança?",
                    a: "Sim! O modelo é de bicos curtos e ajusta-se perfeitamente a sapatos de criança, adultos e até botas.",
                  },
                  {
                    q: "Preciso pagar antes de receber?",
                    a: "Em Luanda o pagamento é feito apenas no acto da entrega. Outras províncias via transportadora (Sob-Consulta).",
                  },
                  {
                    q: "Posso deixar a noite toda ligado?",
                    a: "Sim. O sistema de temperatura constante e o temporizador garantem total segurança.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <h3 className="font-bold text-slate-900 mb-2 leading-tight">
                      {item.q}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* SALES ROUPAS VIEW */}
      {view === "sales-roupas" && (
        <main className="pb-24 text-center">
          <section className="pt-10 pb-6 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-block bg-sky-100 text-sky-800 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6 border border-sky-200">
                A solução para quem vive em apartamento em Luanda
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight px-2">
                A solução definitiva para secar e higienizar a sua roupa de
                forma prática e rápida.
              </h1>

              {/* Product Gallery */}
              <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200 inline-block w-full mb-12">
                <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-slate-100 w-full mb-4 group shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={IMAGES_ROUPAS[activeImage]}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>
                {/* Thumbnails arranged better for mobile */}
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {IMAGES_ROUPAS.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden snap-center transition-all ${
                        activeImage === i
                          ? "ring-4 ring-sky-500 opacity-100 scale-105"
                          : "ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                O Secador Expresso Pro seca qualquer peça em 1 a 2 horas — roupa
                íntima, camisas, calças, uniformes escolares — de forma
                eficiente e sem complicações.
              </p>

              <div className="max-w-xl mx-auto mb-16 text-left">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-6 text-center">
                  Reconheces alguma destas situações?
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Vives num apartamento sem varanda ou sem sol directo",
                    "Tens vergonha de deixar roupa íntima na varanda comum dos vizinhos",
                    "As tuas camisas e calças ficam desirmanadas e ainda saem húmidas",
                    "O uniforme escolar das crianças precisa de estar seco até amanhã de manhã",
                    "A tua roupa fica com cheiro a bafio e fica ao amanhecer de fungos por causa da humidade",
                    "Detestas apalpar roupa pelo sofá, quarto e casa de banho durante dias",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
                    >
                      <div className="bg-red-50 text-red-500 rounded-full p-1">
                        <TriangleAlert size={18} />
                      </div>
                      <span className="text-slate-700 font-semibold text-[15px] leading-snug">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCO 4: SECA TUDO */}
              <div className="mb-24 py-12 bg-slate-50 -mx-4 px-6 rounded-[3rem] border border-slate-200">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    Seca tudo — sem excepções
                  </h2>
                  <p className="text-slate-500 mb-10 font-medium">
                    Das tuas roupas de casa às fatos, tudo seco em 1 a 2 horas.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    {[
                      { title: "Roupa Íntima", desc: "Seca em 1 hora" },
                      { title: "Uniformes Escolares", desc: "Sempre pronto" },
                      { title: "Camisas de Trabalho", desc: "Sem amarrotar" },
                      { title: "Roupas de Desporto", desc: "Sem bafio" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
                      >
                        <div className="bg-sky-100 text-sky-600 w-10 h-10 rounded-full flex items-center justify-center mb-4 font-black">
                          ✓
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 text-sm md:text-base leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCO 5: TABELA COMPARATIVA */}
              <div className="mb-24 px-4 overflow-hidden">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 tracking-tight">
                  Estendal Tradicional VS Secador Expresso
                </h2>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-4 border-b border-slate-100 font-black text-slate-400 uppercase text-[10px] tracking-widest">
                            Critério
                          </th>
                          <th className="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-100/50 text-center">
                            Estendal
                          </th>
                          <th className="p-4 border-b border-slate-100 font-bold text-sky-600 bg-sky-50 text-center">
                            Secador Expresso
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px] sm:text-sm">
                        {[
                          {
                            c: "⭐ Tempo de secagem",
                            t: "3 a 24h",
                            s: "1 a 2 horas",
                            highlight: true,
                          },
                          {
                            c: "Roupa íntima",
                            t: "Exposição total",
                            s: "Privacidade total",
                          },
                          {
                            c: "⭐ Fungos e bafio",
                            t: "Frequente",
                            s: "Eliminado",
                            highlight: true,
                          },
                          {
                            c: "Espaço necessário",
                            t: "Varanda / 2m²",
                            s: "Cabe numa mochila",
                          },
                          {
                            c: "Resultado",
                            t: "Depende do clima",
                            s: "Seca, limpa, sem odor",
                          },
                        ].map((row, i) => (
                          <tr
                            key={i}
                            className={`hover:bg-slate-50 transition-colors ${row.highlight ? "bg-sky-50/50" : ""}`}
                          >
                            <td
                              className={`p-4 border-b border-slate-50 font-bold text-slate-800 ${row.highlight ? "bg-sky-100/30" : ""}`}
                            >
                              {row.c}
                            </td>
                            <td className="p-4 border-b border-slate-50 text-slate-500 text-center">
                              {row.t}
                            </td>
                            <td
                              className={`p-4 border-b border-slate-50 font-bold text-center ${row.highlight ? "text-sky-700" : "text-slate-900"}`}
                            >
                              {row.s}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* BLOCO 6: COMO FUNCIONA */}
              <div className="mb-24">
                <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight">
                  Simples assim — 3 passos e a roupa está seca
                </h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="text-4xl mb-6">👕</div>
                    <h4 className="font-bold text-slate-900 mb-2">Passo 1</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Pendura as peças no secador — roupa íntima, camisas,
                      calças, o que precisares.
                    </p>
                  </div>
                  <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="text-4xl mb-6">🔌</div>
                    <h4 className="font-bold text-slate-900 mb-2">Passo 2</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Liga o tomada e define o tempo com o temporizador — sem
                      app, sem complicação.
                    </p>
                  </div>
                  <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="text-4xl mb-6">✅</div>
                    <h4 className="font-bold text-slate-900 mb-2">Passo 3</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Em 1 a 2 horas a roupa está completamente seca, sem cheiro
                      e sem fungos.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCO 7: ESPECIFICAÇÕES TÉCNICAS */}
              <div className="mt-20 text-left max-w-3xl mx-auto mb-20 px-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                  Especificações Técnicas
                </h2>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Potência</span>
                      <span className="font-bold text-slate-900 text-right">
                        800W
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">Material</span>
                      <span className="font-bold text-slate-900 text-right">
                        ABS Ignífugo + Cabide Alumínio
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Aquecimento
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        PTC Automático
                      </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-600">
                        Dimensões
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        32 × 34 × 15 cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Testimonials */}
          {/* BLOCO 8: PROVAS SOCIAIS */}
          <section className="mb-24 px-4 py-20 bg-slate-50 border-y border-slate-200">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Quem comprou, recomenda!
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Vê o que os nossos clientes dizem sobre a praticidade do Secador
                Expresso Pro.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Ana P.",
                  text: "Moro num apartamento pequeno sem varanda. Antes as roupas ficavam com cheiro estranho, agora em 2h está tudo seco e cheiroso. Salvou-me!",
                },
                {
                  name: "Carlos M.",
                  text: "Incrível para as minhas camisas. Coloco à noite e de manhã estão impecáveis e secas. Recomendo para quem tem pressa.",
                },
                {
                  name: "Marta S.",
                  text: "O uniforme do meu filho já não é um problema. Lavo à noite, seco no aparelho e de manhã está pronto. Muito fácil de usar.",
                },
                {
                  name: "José B.",
                  text: "Muito prático. Levo até nas viagens de trabalho. Silencioso e não ocupa quase nada de espaço na mala.",
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full group hover:shadow-xl transition-all"
                >
                  <div className="flex gap-1 mb-6 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mb-8 italic leading-relaxed flex-grow">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                    <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {t.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOCO 9: GARANTIA */}
          <div className="max-w-4xl mx-auto px-4 mb-24">
            <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden ring-8 ring-indigo-500/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 border border-white/20">
                  <ShieldCheck size={56} className="text-indigo-200" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">
                    Garantia Blindada C Store
                  </h2>
                  <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                    Compra sem risco. Se o produto chegar com defeito ou não
                    funcionar como prometido, entre em contacto pelo WhatsApp e
                    resolvemos. Sem complicação.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 10 & 11: PREÇOS E CHECKOUT */}
          <div id="comprar" className="pt-8 scroll-mt-20 px-4 mb-20">
            <section className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden max-w-6xl mx-auto flex flex-col lg:flex-row">
              {/* Esquerda: Info e Benefícios */}
              <div className="lg:w-[42%] bg-sky-600 p-10 text-white flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 mb-auto">
                  <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
                    Oferta por Tempo Limitado
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black mb-8 leading-tight tracking-tight">
                    Adeus humidade.
                    <br />
                    Olá praticidade.
                  </h2>

                  <div className="space-y-4 mb-12">
                    {[
                      "Entrega Grátis em Luanda",
                      "Entrega noutra província Sob-Consulta",
                      "Pagas no Momento da Entrega",
                      "Garantia de Satisfação total",
                      "Suporte via WhatsApp 24/7",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 text-[15px] font-bold bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10"
                      >
                        <div className="bg-white text-sky-600 p-1 rounded-full">
                          <CheckCircle size={16} />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sky-100 text-sm mb-4 font-bold">
                    +500 famílias satisfeitas em Angola
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-sky-600 bg-slate-200 overflow-hidden ring-2 ring-sky-500/50"
                        >
                          <img
                            src={`https://i.pravatar.cc/100?img=${i + 20}`}
                            alt="User"
                          />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-sky-600 bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-sky-500/50">
                        +500
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/20 mx-2" />
                    <div className="text-amber-400 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direita: Formulário */}
              <div className="lg:w-[58%] p-8 sm:p-12">
                <div className="text-center sm:text-left mb-12 relative flex flex-col items-center sm:items-start">
                  <div className="bg-red-500 text-white font-black py-2 px-5 rounded-full text-xs shadow-xl animate-bounce mb-6">
                    POUPA{" "}
                    {new Intl.NumberFormat("pt-AO").format(
                      formData.quantity * 10000,
                    )}{" "}
                    KZ HOJE
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 line-through text-2xl font-bold tracking-tight">
                      {new Intl.NumberFormat("pt-AO").format(
                        formData.quantity * 45000,
                      )}{" "}
                      Kz
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black text-slate-900 tracking-tighter">
                        {new Intl.NumberFormat("pt-AO").format(
                          formData.quantity * 35000,
                        )}
                      </span>
                      <span className="text-2xl font-black text-slate-400">
                        Kz
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-500 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                    Em Stock - Pronta Entrega
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Nome Completo
                      </label>
                      <input
                        id="name-input-roupas"
                        ref={nameInputRoupasRef}
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                        placeholder="Ex: Marta Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Número de WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                        placeholder="Ex: 921 167 980"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Província
                      </label>
                      <div className="relative">
                        <select
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              province: e.target.value,
                            })
                          }
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all appearance-none font-bold text-slate-700"
                        >
                          <option value="Luanda">Luanda</option>
                          <option value="Huambo">Huambo</option>
                          <option value="Benguela">Benguela</option>
                          <option value="Outra">Outra</option>
                        </select>
                        <ChevronDown
                          size={18}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                      {formData.province === "Outra" && (
                        <div className="mt-4">
                          <input
                            type="text"
                            required
                            value={formData.customProvince}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customProvince: e.target.value,
                              })
                            }
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                            placeholder="Escreva a sua província..."
                          />
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Bairro, Zona, Município
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                        placeholder="Ex: Talatona, Rua 4, perto do banco..."
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-4">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Quantas unidades?
                      </label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, quantity: q })
                            }
                            className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black flex flex-col items-center justify-center gap-1 ${formData.quantity === q ? "bg-sky-50 border-sky-500 text-sky-700 shadow-lg shadow-sky-500/10" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                          >
                            <span className="text-xl">{q}</span>
                            <span className="text-[10px] uppercase tracking-wider">
                              {q === 1 ? "Unidade" : "Unidades"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg py-5 rounded-3xl shadow-2xl shadow-emerald-500/30 transition-all transform active:scale-95 flex flex-col justify-center items-center ${isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-1"}`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={32} />
                      ) : (
                        <>
                          <span>EFECTUAR MINHA RESERVA AGORA</span>
                          <span className="text-[10px] opacity-90 font-black uppercase tracking-[0.2em] mt-1.5">
                            Pagas só no momento da entrega
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    🔒 Pagamento Seguro no Acto da Entrega
                  </p>
                </form>
              </div>
            </section>
          </div>

          <section className="mb-24 text-left max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight text-center">
              As tuas dúvidas respondidas de forma honesta
            </h2>
            <div className="space-y-4">
              {FAQ_ROUPAS.map((item, i) => (
                <AccordionItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>
        </main>
      )}

      {/* SALES ROTEADOR VIEW */}
      {view === "sales-roteador" && (
        <main className="bg-[#0b0f19] text-slate-300 min-h-screen selection:bg-cyan-500/30 pb-24 overflow-x-hidden font-sans">
          
          {/* Hero Section */}
          <section className="relative pt-12 sm:pt-24 pb-20 px-4 max-w-7xl mx-auto">
            {/* Ambient Base Blur */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-cyan-700/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10"
            >
              {/* Lado Esquerdo: Texto (Cyber/Tech Style) */}
              <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center order-2 lg:order-1">
                <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-cyan-400 font-bold mb-6 mx-auto lg:mx-0 w-fit">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  </div>
                  <span className="tracking-widest text-xs uppercase">Conexão Ilimitada Luanda</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-[4rem] font-black text-white leading-[1.05] tracking-tight mb-8">
                  Roteador 5G Ultra Desbloqueado: Use qualquer operadora livremente.
                </h1>
                <p className="text-lg text-slate-400 mb-10 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Diga adeus aos limites de 500GB mensais. Com este equipamento <strong className="text-cyan-400 font-bold">100% livre</strong>, você tem acesso imediato aos roteamentos ilimitados da rede Africel e outras operadoras, garantindo Wi-Fi 6 veloz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleScrollToCheckout}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] active:scale-95 text-lg w-full sm:w-auto"
                  >
                    COMPRAR AGORA
                  </button>
                  <button
                    onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-transparent hover:bg-white/5 text-white font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 border border-white/10 w-full sm:w-auto backdrop-blur-sm"
                  >
                    VER RECURSOS
                  </button>
                </div>
              </div>

              {/* Lado Direito: Imagem Hero */}
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="relative w-full aspect-square sm:aspect-[4/3] flex items-center justify-center">
                  {/* Glowing backdrop rings */}
                  <div className="absolute inset-0 rounded-full border border-cyan-500/20 scale-75 animate-[spin_30s_linear_infinite]"></div>
                  <div className="absolute inset-0 rounded-full border border-blue-500/20 scale-90 animate-[spin_40s_linear_infinite_reverse]"></div>
                  
                  {/* Main Image */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={IMAGES_ROTEADOR[activeImage]}
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.15]"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>

                {/* Thumbnails Row */}
                <div className="flex gap-4 justify-center mt-6 z-20 relative">
                  {IMAGES_ROTEADOR.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden transition-all bg-white/5 backdrop-blur-md border ${
                        activeImage === i
                          ? "border-cyan-400 opacity-100 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                          : "border-white/10 opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${i+1}`}
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Dores (Motivos) */}
          <section className="px-4 py-20 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
                  A sua operadora deixou-o sem opções?
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Os cortes abruptos na internet por novos limites de GB afectam milhares de lares em Luanda. Aqui está o porquê de precisar deste roteador.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {[
                  { title: "Limites de Tráfego", desc: "A internet corta a meio do mês e exige recargas absurdamente caras." },
                  { title: "Roteador Bloqueado", desc: "Com o aparelho antigo, não podes usar a rede concorrente que é mais barata." },
                  { title: "Instabilidade Crónica", desc: "Nas horas de ponta, ver vídeos em 1080p ou 4K vira uma tortura de buffering." },
                  { title: "Poucos Dispositivos", desc: "Se ligarem mais do que 4 telefones, a rede vai abaixo constantemente." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <TriangleAlert size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Funcionalidades Bento Grid */}
          <section id="recursos" className="px-4 py-20 relative bg-black/50 border-y border-white/5 scroll-mt-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">Especificações Base</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-6">
                  ZTE 5G Ultra Wi-Fi 6
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-[#0b0f19] border border-white/10 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
                  <div className="relative z-10 w-full h-full flex flex-col justify-end">
                    <div className="w-16 h-16 bg-cyan-500 rounded-3xl flex items-center justify-center text-slate-950 mb-8 font-black text-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                      5G
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-4">Velocidade Absurda<br/>até 3.6 Gbps</h3>
                    <p className="text-slate-400 max-w-md text-lg">Faça downloads pesados em segundos, jogue online sem ping e usufrua de streaming 4K instantâneo.</p>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">100% Desbloqueado</h3>
                  <p className="text-slate-400 text-sm flex-grow">A liberdade é sua. Funciona com chips da Africel, Unitel ou Movicel indubitavelmente.</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Wi-Fi 6 & NFC</h3>
                    <p className="text-slate-400 text-sm">Emparelhe o telemóvel por NFC com um simples toque. A rede tem menor latência e suporta mais dispositivos.</p>
                </div>

                <div className="md:col-span-2 bg-gradient-to-tr from-slate-900/60 to-slate-800/60 border border-white/10 p-8 sm:p-10 rounded-[2.5rem] flex items-center overflow-hidden relative">
                   <div className="absolute right-0 bottom-0 text-[10rem] font-black leading-none text-white/5 -mb-10 mr-10 select-none">
                     32
                   </div>
                   <div className="relative z-10">
                     <h3 className="text-2xl sm:text-4xl font-black text-white mb-3">Conecte até 32 Utilizadores</h3>
                     <p className="text-slate-400 lg:max-w-xl text-lg">Ideal para casas grandes, condomínios ou escritórios empresariais onde ninguém pode ficar parado.</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comparativo Dark */}
          <section className="px-4 py-20 relative">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  A Verdade sobre o Seu Roteador Atual
                </h2>
              </div>
              
              <div className="bg-[#0f1422] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="p-6 border-b border-white/5 font-black text-slate-500 uppercase text-xs tracking-widest w-1/3">Critério</th>
                        <th className="p-6 border-b border-white/5 font-bold text-slate-400 bg-white/5 text-center w-1/3">O Atual (Padrão)</th>
                        <th className="p-6 border-b border-cyan-500/30 font-bold text-cyan-400 bg-cyan-900/20 text-center w-1/3">ZTE 5G Ultra</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { label: "Velocidade Média", old: "10-20 Mbps", new: "Aceleração 5G Giga", hl: true },
                        { label: "Rede / SIM", old: "Bloqueado à origem", new: "Totalmente Livre" },
                        { label: "Dispositivos Sup.", old: "Até 10 simultâneos", new: "Até 32 simultâneos", hl: true },
                        { label: "Wi-Fi", old: "Wi-Fi 4 / 5 Antigo", new: "Wi-Fi 6 c/ NFC" },
                        { label: "Antenas", old: "Internas Fracas", new: "Super Direcional 360°" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="p-6 border-b border-white/5 font-bold text-white">{row.label}</td>
                          <td className="p-6 border-b border-white/5 text-slate-500 text-center">{row.old}</td>
                          <td className={`p-6 border-b border-white/5 font-bold text-center ${row.hl ? 'text-cyan-300 bg-cyan-900/20' : 'text-cyan-400 bg-cyan-900/10'}`}>
                            {row.new}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Provas Sociais */}
          <section className="py-20 relative bg-[#0b0f19] border-y border-white/5">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-white">Compradores Satisfeitos</h2>
                <p className="text-slate-400 mt-2">Vê quem já migrou para a internet sem limites.</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Ana P.", letter: "A", text: "Antes a internet caía a meio da semana. Pus um chip novo e nunca mais sofri." },
                  { name: "Carlos M.", letter: "C", text: "O ping em COD e Fortnite é surreal de tão baixo. Simplesmente mágico." },
                  { name: "Marta S.", letter: "M", text: "Trabalho em home office, ligo tudo e nada falha. Melhor investimento do ano." },
                  { name: "José B.", letter: "J", text: "Entrega super rápida. Desbloqueado de verdade, já testei Unitel e Africel." }
                ].map((testimonial, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/10 p-8 rounded-[2rem] flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 text-cyan-400 mb-6">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill="currentColor"/>)}
                    </div>
                    <p className="text-slate-300 italic flex-grow mb-8 text-sm leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex justify-center items-center font-bold text-cyan-400">
                         {testimonial.letter}
                       </div>
                       <span className="text-white font-bold">{testimonial.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Preços e Checkout Form (The main conversion point) */}
          <section id="comprar" className="py-24 px-4 relative scroll-mt-0">
            <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] border border-cyan-500/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row relative">
              
              {/* Esquerda: Info e Urgência */}
              <div className="lg:w-[45%] bg-gradient-to-b from-cyan-900 to-slate-900 p-10 sm:p-14 text-white relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                   <div className="inline-block bg-rose-500 text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase mb-10 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse w-fit">
                     Stock Ultra Limitado
                   </div>
                   
                   <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-8">
                     O seu acesso<br/>à verdadeira<br/><span className="text-cyan-400">internet 5G</span>.
                   </h2>
                   
                   <div className="space-y-4 mb-16">
                    {[
                      "Venda Exclusiva e Entrega Imediata",
                      "Pagamentos SOMENTE no Acto da Entrega",
                      "Suporte e Garantia Blindada"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <CheckCircle size={18} className="text-cyan-400 shrink-0"/>
                        {item}
                      </div>
                    ))}
                   </div>
                   
                   <div className="mt-auto">
                     <p className="text-cyan-200 text-sm font-medium opacity-80 mb-4 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                       Em Stock • Entrega Gratuita p/ Luanda
                     </p>
                   </div>
                </div>
              </div>

              {/* Direita: Formulário */}
              <div className="lg:w-[55%] p-8 sm:p-14 relative bg-[#060911]">
                 <div className="mb-12 text-center sm:text-left">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3">Valor de Investimento</p>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-center sm:justify-start">
                       <p className="text-rose-500/60 line-through text-2xl font-black">
                         {new Intl.NumberFormat("pt-AO").format(formData.quantity * 310000)} Kz
                       </p>
                       <div className="flex items-baseline gap-2">
                         <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {new Intl.NumberFormat("pt-AO").format(formData.quantity * 240000)}
                         </span>
                         <span className="text-xl font-bold text-cyan-500 uppercase tracking-widest">Kz</span>
                       </div>
                    </div>
                    <div className="mt-4 inline-block bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[11px] px-4 py-2 rounded-full uppercase tracking-widest">
                       Poupe {new Intl.NumberFormat("pt-AO").format(formData.quantity * 70000)} KZ hoje
                    </div>
                 </div>

                 <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Nome Completo</label>
                          <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#0b0f19] border border-white/5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-6 py-5 rounded-[1rem] text-white placeholder:text-slate-700 font-bold transition-all shadow-inner"
                            placeholder="Ex: João Baptista"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">WhatsApp</label>
                          <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-[#0b0f19] border border-white/5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-6 py-5 rounded-[1rem] text-white placeholder:text-slate-700 font-bold transition-all shadow-inner"
                            placeholder="Ex: 923 000 000"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Província</label>
                          <div className="relative">
                            <select disabled className="w-full bg-[#0f1422] border border-white/5 outline-none px-6 py-5 rounded-[1rem] text-slate-600 appearance-none font-bold uppercase disabled:opacity-100 shadow-inner">
                               <option>Somente Luanda</option>
                            </select>
                            <Lock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600" />
                          </div>
                       </div>
                       <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Endereço (Bairro/Município)</label>
                          <input
                            required
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData({...formData, area: e.target.value})}
                            className="w-full bg-[#0b0f19] border border-white/5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-6 py-5 rounded-[1rem] text-white placeholder:text-slate-700 font-bold transition-all shadow-inner"
                            placeholder="Ex: Talatona, Rua 2"
                          />
                       </div>
                       <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Observações (Opcional)</label>
                          <textarea
                            rows={2}
                            value={formData.observacoes || ""}
                            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                            className="w-full bg-[#0b0f19] border border-white/5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-6 py-5 rounded-[1rem] text-white placeholder:text-slate-700 font-bold transition-all resize-none shadow-inner"
                            placeholder="Algum ponto de referência...?"
                          />
                       </div>
                       <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Quantidade (Aparelhos)</label>
                          <div className="flex gap-3">
                            {[1,2,3,4].map(q => (
                              <button
                                key={q} type="button"
                                onClick={() => setFormData({...formData, quantity: q})}
                                className={`flex-1 py-4 border ${q === formData.quantity ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-[1.02]' : 'bg-[#0b0f19] border-white/5 text-slate-500 hover:border-white/20'} rounded-[1rem] transition-all`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="pt-8">
                       <button
                         type="submit" disabled={isSubmitting}
                         className={`w-full py-6 rounded-2xl font-black text-xl flex flex-col items-center justify-center transition-all bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] ${isSubmitting ? 'opacity-70 scale-95 cursor-wait' : 'hover:-translate-y-1 active:scale-[0.98]'}`}
                       >
                         {isSubmitting ? (
                           <Loader2 className="animate-spin" size={32} />
                         ) : (
                           <>
                             <span>CONFIRMAR ENCOMENDA AGORA</span>
                             <span className="text-[10px] uppercase tracking-[0.2em] mt-1.5 opacity-80">(Pagamento na Entrega)</span>
                           </>
                         )}
                       </button>
                    </div>
                 </form>
              </div>

            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 py-20 pb-40 relative">
             <div className="max-w-3xl mx-auto">
               <div className="text-center mb-16">
                 <h2 className="text-3xl font-black text-white">Perguntas Frequentes</h2>
                 <p className="text-slate-400 mt-2">Dúvidas? Temos as respostas.</p>
               </div>
               <div className="space-y-4">
                 {FAQ_ROTEADOR.map((item, i) => (
                    <AccordionItem key={i} question={item.q} answer={item.a} isDarkTheme />
                 ))}
               </div>
             </div>
          </section>

        </main>
      )}

      {/* SALES PAGE: BASE MÓVEL UNIVERSAL 360° */}
      {view === "sales-base-movel" && (
        <main className="bg-slate-950 text-slate-200 min-h-screen selection:bg-amber-500/30 pb-24 overflow-x-hidden font-sans">
          
          {/* Hero Section (BLOCO 1) */}
          <section className="relative pt-12 sm:pt-20 pb-16 px-4 max-w-7xl mx-auto">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10"
            >
              {/* Lado Esquerdo: Textos & Preço */}
              <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center order-2 lg:order-1">
                <div className="inline-flex items-center justify-center lg:justify-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider mb-6 mx-auto lg:mx-0 w-fit backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>🔥 Reserva Aberta — Unidades Limitadas em Luanda</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
                  Mover o fogão, geladeira ou máquina <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">nunca foi tão fácil</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 mb-6 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                  A <strong>Base Móvel 360°</strong> coloca rodízios industriais debaixo do seu <strong>fogão, máquina de lavar, geladeira ou arca</strong>. Você desliza tudo com uma única mão — sem esforço, sem danificar nem riscar o piso e sem dor nas costas.
                </p>

                {/* Destaque para móveis pesados */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-8 backdrop-blur-md">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Ideal Para Equipamentos Pesados:</p>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    🔥 Fogões de Cozinha • 🧊 Geladeiras & Frigoríficos • 🧺 Máquinas de Lavar • ❄️ Arcas Congeladoras • 📦 Outros Móveis Pesados
                  </p>
                </div>

                {/* Âncora de Preço Hero */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-2xl mb-8 flex items-center justify-between flex-wrap gap-4 max-w-xl mx-auto lg:mx-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mb-1 inline-block">
                      ✓ Pacote: 1 Par Completo (2 Bases)
                    </span>
                    <span className="text-xs text-slate-400 line-through block font-medium">Preço Normal: 30.000 Kz</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400">15.000 Kz</span>
                      <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md uppercase">50% OFF</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <span className="text-emerald-400 font-bold block">✓ Economiza 15.000 Kz</span>
                    <span className="text-slate-300 font-bold block">1 Par = 15.000 Kz</span>
                    <span>Pagamento na entrega</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleScrollToCheckout}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] active:scale-95 text-base sm:text-lg flex items-center justify-center gap-3 w-full sm:w-auto"
                  >
                    <span>RESERVAR O MEU PAR AGORA (15.000 Kz)</span>
                  </button>
                </div>
              </div>

              {/* Lado Direito: Galeria do Produto */}
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="relative w-full aspect-square sm:aspect-[4/3] flex items-center justify-center bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-4">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={IMAGES_BASE_MOVEL[activeImage]}
                      alt="Base Móvel 360° para Máquina de Lavar e Geladeira"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-contain rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>

                  <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 text-amber-400 text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-md">
                    Giro 360° Industrial
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3 mt-4">
                  {IMAGES_BASE_MOVEL.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all bg-slate-900 border ${
                        activeImage === i
                          ? "border-amber-400 opacity-100 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* DORES / PROBLEMAS (BLOCO 2) */}
          <section className="px-4 py-16 relative border-t border-slate-900 bg-slate-900/40">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-rose-400 font-bold uppercase tracking-widest text-xs">O Problema Real Em Casa</span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-2 mb-4">
                  Se o seu fogão, máquina de lavar ou geladeira já ficou "presa" no mesmo canto por meses...
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                  Mover eletrodomésticos pesados em Luanda costuma ser um pesadelo físico e desgastante. Veja se você identifica este cenário:
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Users size={24} />,
                    title: "Precisa de 2 ou 3 Pessoas",
                    desc: "Sempre que precisa deslocar o aparelho alguns centímetros na cozinha ou lavandaria, tem de chamar vizinhos ou familiares.",
                  },
                  {
                    icon: <TriangleAlert size={24} />,
                    title: "Sujeira e Mofo Acumulados",
                    desc: "Poeira, gordura, mofo e até insetos acumulam-se atrás da geladeira e da máquina porque é impossível limpar por trás.",
                  },
                  {
                    icon: <Zap size={24} />,
                    title: "Dor nas Costas e Piso Riscado",
                    desc: "Empurrar aparelhos pesados no chão duro provoca lesões na coluna e arranha os azulejos do seu apartamento.",
                  },
                  {
                    icon: <ShieldCheck size={24} />,
                    title: "Gastos com Ajudantes",
                    desc: "Contratar terceiros só para mover móveis pesados durante limpezas custa caro e exige esperar disponibilidade.",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mb-5 border border-rose-500/20">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed flex-grow">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SOLUÇÃO (BLOCO 3) */}
          <section className="px-4 py-16 relative bg-gradient-to-b from-slate-900/80 to-slate-950 border-y border-slate-900">
            <div className="max-w-5xl mx-auto text-center">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">A Solução Definitiva</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-2 mb-6">
                Uma base, quatro rodízios, e o problema acaba.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-10">
                A <strong>Base Móvel 360°</strong> encaixa perfeitamente debaixo de <strong>fogões, máquinas de lavar, geladeiras, frigoríficos, arcas congeladoras e móveis pesados</strong>. Basta posicionar o par de hastes metálicas e, a partir daí, o seu aparelho desliza suavemente com o toque de uma mão — permitindo mover para limpar por trás sem danificar o chão, sem riscar os azulejos e sem fazer força física.
              </p>

              <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-emerald-500/30">
                <div className="bg-slate-900 p-8 sm:p-12 rounded-[22px] flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                  <div className="space-y-4 max-w-xl">
                    <h3 className="text-2xl font-black text-white">Sem Ferramentas, Sem Complicação</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Instalação direta no tipo piso. Ajuste a largura, coloque por baixo das patas do aparelho e trave as rodas. Pronto para deslizar com facilidade incomparável!
                    </p>
                  </div>
                  <button
                    onClick={handleScrollToCheckout}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-4 rounded-xl text-sm whitespace-nowrap transition-transform active:scale-95 shadow-lg shrink-0"
                  >
                    Garantir Reserva (15.000 Kz / Par)
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* BENEFÍCIOS (BLOCO 4) */}
          <section className="px-4 py-20 relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Por que esta base é superior</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
                Diferenciais da Base Móvel 360°
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Metal Reforçado Industrial",
                  desc: "Construção ultra resistente fabricada para suportar o peso elevado de geladeiras de grande porte, arcas congeladoras e máquinas de lavar.",
                  badge: "Alta Durabilidade",
                },
                {
                  title: "Giro Duplo 360°",
                  desc: "Rodízios duplos com giro fluido de 360 graus para movimentar eletrodomésticos para frente, para trás e para os lados com leveza.",
                  badge: "Sem Esforço",
                },
                {
                  title: "Design Ajustável e Flexível",
                  desc: "Hastes telescópicas extensíveis (de 72 x 4 x 5,2 cm) que se adaptam perfeitamente à largura do seu eletrodoméstico.",
                  badge: "Universal",
                },
                {
                  title: "Trava de Segurança Reforçada",
                  desc: "Mecanismo de travamento nas rodas que fixa o aparelho no lugar quando não estiver em movimento, evitando vibrações.",
                  badge: "100% Estável",
                },
              ].map((b, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative flex flex-col justify-between hover:border-amber-500/40 transition-all group">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-4">
                      {b.badge}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3">{b.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ESPECIFICAÇÕES TÉCNICAS (BLOCO 5) */}
          <section className="px-4 py-16 bg-slate-900/50 border-y border-slate-900">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Ficha do Fornecedor</span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
                  Especificações Técnicas Reais
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="divide-y divide-slate-800 text-sm">
                  {[
                    { label: "Material", val: "Metal reforçado de alta resistência" },
                    { label: "Dimensões", val: "72 × 4 × 5,2 cm (ajustável)" },
                    { label: "Tipo de Rodízio", val: "Duplo, giro 360° com trava de segurança" },
                    { label: "Instalação", val: "Tipo piso, sem necessidade de ferramentas" },
                    { label: "Tolerância de Peso", val: "±1%" },
                    { label: "Tolerância Dimensional", val: "±1mm" },
                    { label: "Cor", val: "Preto acetinado industrial" },
                    { label: "Design", val: "Ajustável, portátil, flexível" },
                    { label: "Uso Indicado", val: "Máquinas de lavar, geladeiras, frigoríficos, arcas e móveis pesados" },
                  ].map((row, i) => (
                    <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-800/40 transition-colors">
                      <span className="font-bold text-slate-400 text-xs sm:text-sm uppercase tracking-wider">{row.label}</span>
                      <span className="font-semibold text-white text-sm sm:text-base">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PROVA SOCIAL (BLOCO 6) */}
          <section className="px-4 py-20 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Aprovação em Luanda</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
                Quem já resolveu o problema
              </h2>
            </div>

            {/* Números Metricos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto text-center">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 block">+1.240</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">Unidades Entregues em Luanda</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 block">98%</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">Satisfação das Famílias</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 block">100%</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">Pagamento Seguro na Entrega</span>
              </div>
            </div>

            {/* Testemunhos */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {TESTIMONIALS_BASE_MOVEL.map((t, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 text-amber-400 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm leading-relaxed mb-6">"{t.comment}"</p>
                  </div>
                  <div className="border-t border-slate-800 pt-4">
                    <span className="font-bold text-white text-sm block">{t.name}</span>
                    <span className="text-xs text-emerald-400 font-medium">✓ Cliente Verificado em Luanda</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ANCORAGEM DE PREÇO (BLOCO 7) */}
          <section className="px-4 py-16 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-900">
            <div className="max-w-4xl mx-auto bg-slate-900 border border-amber-500/30 p-8 sm:p-12 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <span className="text-amber-400 font-black uppercase tracking-widest text-xs bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-6">
                Investimento Único Inteligente
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white mb-6">
                Menos do que custa contratar alguém para mover o aparelho uma única vez
              </h2>

              <div className="flex items-center justify-center gap-4 my-6 flex-wrap">
                <span className="text-slate-500 line-through text-xl sm:text-2xl font-bold">30.000 Kz</span>
                <span className="text-4xl sm:text-6xl font-black text-amber-400">15.000 Kz</span>
                <span className="bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-xl text-xs sm:text-sm uppercase shadow-md">
                  Economize 15.000 Kz
                </span>
              </div>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                Incluso: Entrega rápida em Luanda por estafeta próprio • Pagamento exclusivamente no ato da entrega (COD) • Suporte via WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleScrollToCheckout}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                  <span>RESERVAR O MEU PAR AGORA (15.000 Kz)</span>
                </button>
              </div>
            </div>
          </section>

          {/* GARANTIA (BLOCO 8) */}
          <section className="px-4 py-12 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Garantia de Satisfação</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Se a base não encaixar corretamente no seu aparelho ou não atender às suas expectativas de transporte, você troca ou devolve no ato da entrega — sem complicações.
                </p>
              </div>
            </div>
          </section>

          {/* URGÊNCIA E ESCASSEZ (BLOCO 9) */}
          <section className="px-4 py-10 max-w-4xl mx-auto">
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 sm:p-8 rounded-2xl text-center backdrop-blur-md">
              <p className="text-amber-300 text-sm sm:text-base font-bold leading-relaxed">
                ⚠️ Restam poucas unidades neste lote ao preço de reserva. Novo lote só chega em algumas semanas — quem reserva hoje garante o preço promocional de 15.000 Kz e entrega esta semana em Luanda.
              </p>
            </div>
          </section>

          {/* FORMULÁRIO DE CHECKOUT (#comprar) & CTA FINAL */}
          <section id="comprar" className="py-20 px-4 relative scroll-mt-6">
            <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col md:flex-row">
              
              {/* Lado Esquerdo: Info Resumo */}
              <div className="md:w-[45%] bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-rose-500 text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase mb-6 shadow-md animate-pulse">
                    Stock Limitado
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
                    Chega de empurrar sozinho
                  </h2>

                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    Reserve agora a sua Base Móvel 360° por apenas <strong>15.000 Kz</strong> e resolva a limpeza e movimentação de aparelhos pesados ainda esta semana.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      "Sem pagamento antecipado (COD)",
                      "Entrega rápida para Luanda",
                      "Troca imediata garantida",
                      "Atendimento dedicado no WhatsApp",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <CheckCircle size={16} className="text-amber-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-400 font-bold">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>Preencha o formulário ao lado para validar a sua reserva</span>
                </div>
              </div>

              {/* Lado Direito: Formulário */}
              <div className="md:w-[55%] p-8 sm:p-12 bg-slate-950">
                <div className="mb-8">
                  <span className="text-amber-400 font-bold uppercase tracking-widest text-xs block mb-1">Formulário de Reserva</span>
                  <h3 className="text-2xl font-black text-white">Confirme os seus dados</h3>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Nome Completo</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none px-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 font-medium transition-all text-sm"
                      placeholder="Ex: Maria Santos"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">WhatsApp para Contacto</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none px-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 font-medium transition-all text-sm"
                      placeholder="Ex: 923 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Província</label>
                    <div className="relative">
                      <select disabled className="w-full bg-slate-900 border border-slate-800 outline-none px-4 py-3.5 rounded-xl text-slate-400 appearance-none font-medium text-sm disabled:opacity-100">
                        <option>Somente Luanda</option>
                      </select>
                      <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Endereço (Bairro / Município / Ponto de Ref.)</label>
                    <input
                      required
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none px-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 font-medium transition-all text-sm"
                      placeholder="Ex: Talatona, junto ao Kero"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Observações (Opcional)</label>
                    <textarea
                      rows={2}
                      value={formData.observacoes || ""}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none px-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 font-medium transition-all resize-none text-sm"
                      placeholder="Informações para a entrega..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Quantidade de Pares <span className="text-amber-400 font-normal lowercase">(1 Par = 2 bases inclusas)</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setFormData({ ...formData, quantity: q })}
                          className={`flex-1 py-3 border ${
                            q === formData.quantity
                              ? "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md scale-[1.02]"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          } rounded-xl transition-all text-sm`}
                        >
                          {q} {q === 1 ? "Par" : "Pares"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-xl font-black text-base flex flex-col items-center justify-center transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] ${
                        isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 active:scale-[0.98]"
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          <span>EFECTUAR MINHA RESERVA AGORA</span>
                          <span className="text-[10px] uppercase tracking-widest mt-1 opacity-80">(Pagamento na Entrega: {formData.quantity * 15000} Kz)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </section>

          {/* PERGUNTAS FREQUENTES (BLOCO 10) */}
          <section className="px-4 py-16 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Esclareça Suas Dúvidas</span>
              <h2 className="text-3xl font-black text-white mt-2">Perguntas Frequentes</h2>
            </div>
            <div className="space-y-4">
              {FAQ_BASE_MOVEL.map((item, i) => (
                <AccordionItem key={i} question={item.q} answer={item.a} isDarkTheme />
              ))}
            </div>
          </section>

          {/* MOBILE STICKY BOTTOM BAR */}
          {!isCheckoutVisible && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 px-4 flex sm:hidden items-center justify-between shadow-2xl">
              <div>
                <span className="text-[10px] text-slate-400 line-through block leading-none">30.000 Kz</span>
                <span className="text-lg font-black text-amber-400 leading-none">15.000 Kz</span>
              </div>
              <button
                onClick={handleScrollToCheckout}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              >
                <span>RESERVAR (15.000 Kz)</span>
              </button>
            </div>
          )}

        </main>
      )}

      {/* FOOTER */}
      {isSalesView && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 text-center mt-auto pb-28 md:pb-12 shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <img
              src="https://i.postimg.cc/3wsKF20v/Chat-GPT-Image-13-de-mai-de-2026-12-40-58.png"
              alt="Logotipo C Store Angola"
              className="h-10 w-auto object-contain rounded opacity-80 hover:opacity-100 transition-opacity mb-5"
            />
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Procura por mais novidades?
            </h3>
            <p className="mb-6 max-w-sm mx-auto text-sm leading-relaxed text-slate-500">
              Temos um catálogo completo com as últimas tendências e produtos
              inovadores a preços incríveis.
            </p>
            <a
              href="https://www.cstoreao.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-full border border-slate-700 transition hover:border-slate-500"
            >
              Visitar Loja Oficial C Store Angola
            </a>

            <div className="mt-10 flex justify-center">
              <a
                href="https://wa.me/244921167980?text=Olá,%20tenho%20dúvidas%20sobre%20o%20Secador%20Expresso%20Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-emerald-600 transition-all font-bold text-sm"
              >
                <MessageCircle size={20} />
                Tens dúvidas? Fala connosco via WhatsApp
              </a>
            </div>

            <div className="mt-12 text-xs opacity-40">
              &copy; {new Date().getFullYear()} C Store Angola. Todos os
              direitos reservados.
            </div>
          </div>
        </footer>
      )}

      {/* ADMIN VIEW */}
      {view === "admin" && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
          {adminSubView === "financeiro" ? (
            <div className="animate-fadeIn">
              <div className="mb-4">
                <button
                  onClick={() => setAdminSubView("leads")}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  <ArrowLeft size={16} /> Voltar ao Painel de Leads
                </button>
              </div>
              {/* Standalone Financial Page */}
              <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
                    <Store className="text-emerald-400" size={28} /> Painel de
                    Análise Financeira
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Previsões de faturamento e detalhamento real e estimado por
                    produto
                  </p>
                </div>

                {/* Product Selector specifically built for the financial page */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Visualizar Produto:
                    </span>
                    <select
                      value={financeProductFilter}
                      onChange={(e) => setFinanceProductFilter(e.target.value)}
                      className="text-sm font-bold text-white bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Todos" className="bg-slate-900 text-white">
                        📦 Todos os Produtos ({adminData.length})
                      </option>
                      {uniquePages.map((page, index) => (
                        <option
                          key={index}
                          value={page}
                          className="bg-slate-900 text-white"
                        >
                          🏷️ {formatPageNameWithCensorship(page)} (
                          {adminData.filter((d) => d.produto === page).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredDataForFinance =
                  financeProductFilter === "Todos"
                    ? adminData
                    : adminData.filter(
                        (d) => d.produto === financeProductFilter,
                      );

                const faturamentoEfetuado = filteredDataForFinance
                  .filter((d) => d.status === "Entregue" || d.status === "Pago")
                  .reduce((sum, d) => sum + getLeadPrice(d), 0);

                const countEfetuado = filteredDataForFinance.filter(
                  (d) => d.status === "Entregue" || d.status === "Pago",
                ).length;

                const faturamentoReservas = filteredDataForFinance
                  .filter((d) => d.status && d.status.includes("Reservado"))
                  .reduce((sum, d) => sum + getLeadPrice(d), 0);

                const countReservas = filteredDataForFinance.filter(
                  (d) => d.status && d.status.includes("Reservado"),
                ).length;

                const faturamentoEspera = filteredDataForFinance
                  .filter((d) => d.status === "Pendente")
                  .reduce((sum, d) => sum + getLeadPrice(d), 0);

                const countEspera = filteredDataForFinance.filter(
                  (d) => d.status === "Pendente",
                ).length;

                const totalFaturamentoGeral =
                  faturamentoEfetuado + faturamentoReservas + faturamentoEspera;
                const totalCountGeral =
                  countEfetuado + countReservas + countEspera;

                return (
                  <>
                    {/* Visual warning when filter is applied */}
                    {financeProductFilter !== "Todos" && (
                      <div className="mb-6 p-4 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2.5">
                          <Sparkles
                            size={18}
                            className="text-indigo-400 shrink-0 animate-pulse"
                          />
                          <span className="text-sm font-medium text-slate-300">
                            Filtrado por:{" "}
                            <strong className="text-white bg-slate-950 px-2 py-1 rounded-md border border-slate-800 ml-1">
                              {financeProductFilter}
                            </strong>
                          </span>
                        </div>
                        <button
                          onClick={() => setFinanceProductFilter("Todos")}
                          className="text-xs bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Limpar Filtro
                        </button>
                      </div>
                    )}

                    {/* Financial stats grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition duration-300">
                        <div className="absolute top-0 right-0 p-3 bg-slate-950 text-emerald-400 rounded-bl-3xl opacity-80 border-l border-b border-slate-800">
                          <CheckCircle size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">
                            💸 Bruto Concluído (Entregues + Pagos)
                          </span>
                          <span
                            className="text-lg sm:text-xl xl:text-2xl font-black text-emerald-400 tracking-tighter block leading-none whitespace-nowrap overflow-hidden text-ellipsis"
                            title={formatKz(faturamentoEfetuado)}
                          >
                            {formatKz(faturamentoEfetuado)}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-800">
                          Das{" "}
                          <span className="text-emerald-400 font-extrabold">
                            {countEfetuado}
                          </span>{" "}
                          encomendas entregues ou pagas com sucesso do produto
                          selecionado.
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition duration-300">
                        <div className="absolute top-0 right-0 p-3 bg-slate-950 text-indigo-400 rounded-bl-3xl opacity-80 border-l border-b border-slate-800">
                          <Activity size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">
                            💎 Possível Faturamento (Reservas)
                          </span>
                          <span
                            className="text-lg sm:text-xl xl:text-2xl font-black text-indigo-400 tracking-tighter block leading-none whitespace-nowrap overflow-hidden text-ellipsis"
                            title={formatKz(faturamentoReservas)}
                          >
                            {formatKz(faturamentoReservas)}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-800">
                          Correspondente a{" "}
                          <span className="text-indigo-400 font-extrabold">
                            {countReservas}
                          </span>{" "}
                          reservas em processamento no sistema.
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition duration-300">
                        <div className="absolute top-0 right-0 p-3 bg-slate-950 text-amber-400 rounded-bl-3xl opacity-80 border-l border-b border-slate-800">
                          <Timer size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2">
                            ⏳ Faturamento Potencial (Em Espera)
                          </span>
                          <span
                            className="text-lg sm:text-xl xl:text-2xl font-black text-amber-400 tracking-tighter block leading-none whitespace-nowrap overflow-hidden text-ellipsis"
                            title={formatKz(faturamentoEspera)}
                          >
                            {formatKz(faturamentoEspera)}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-800">
                          Do total de{" "}
                          <span className="text-amber-400 font-extrabold">
                            {countEspera}
                          </span>{" "}
                          leads comerciais aguardando verificação.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 bg-white/5 text-emerald-400 rounded-bl-3xl border-l border-b border-slate-800">
                          <Zap
                            size={22}
                            className="text-emerald-400 animate-pulse"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">
                            📊 Total Estimado Potencial
                          </span>
                          <span
                            className="text-lg sm:text-xl xl:text-2xl font-black tracking-tighter block leading-none text-emerald-300 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={formatKz(totalFaturamentoGeral)}
                          >
                            {formatKz(totalFaturamentoGeral)}
                          </span>
                        </div>
                        <p className="text-indigo-350 text-xs mt-4 pt-4 border-t border-indigo-905">
                          Acumulado total de{" "}
                          <span className="text-white font-extrabold">
                            {totalCountGeral}
                          </span>{" "}
                          leads do fluxo de faturamento.
                        </p>
                      </div>
                    </div>

                    {/* Breakdown by Product Table */}
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mb-10">
                      <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-950/60">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles
                              className="text-indigo-400 animate-pulse"
                              size={20}
                            />{" "}
                            Comparação Analítica de Todos os Produtos
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Previsão e status financeiro discriminado por linha
                            de produto
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                              <th className="px-6 py-4">
                                Produto / Landing Page
                              </th>
                              <th className="px-5 py-4 text-center">
                                Quant. Leads
                              </th>
                              <th className="px-5 py-4 text-center">
                                Pendentes (⏳)
                              </th>
                              <th className="px-5 py-4 text-center">
                                Reservados (💎)
                              </th>
                              <th className="px-5 py-4 text-center">
                                Entregues ou Pagos (💸)
                              </th>
                              <th className="px-6 py-4 text-right">
                                Faturamento Concluído
                              </th>
                              <th className="px-6 py-4 text-right">
                                Total Estimado
                              </th>
                              <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {uniquePages.map((prod, index) => {
                              const leadsForProd = adminData.filter(
                                (d) => d.produto === prod,
                              );
                              const pendentesForProd = leadsForProd.filter(
                                (d) => d.status === "Pendente",
                              );
                              const reservadosForProd = leadsForProd.filter(
                                (d) =>
                                  d.status && d.status.includes("Reservado"),
                              );
                              const entreguesForProd = leadsForProd.filter(
                                (d) =>
                                  d.status === "Entregue" ||
                                  d.status === "Pago",
                              );

                              const brutoProd = entreguesForProd.reduce(
                                (sum, d) => sum + getLeadPrice(d),
                                0,
                              );
                              const previstoProd = reservadosForProd.reduce(
                                (sum, d) => sum + getLeadPrice(d),
                                0,
                              );
                              const pendenteValProd = pendentesForProd.reduce(
                                (sum, d) => sum + getLeadPrice(d),
                                0,
                              );

                              const totalProdVal =
                                brutoProd + previstoProd + pendenteValProd;

                              const isSelected = financeProductFilter === prod;

                              return (
                                <tr
                                  key={index}
                                  className={`transition-colors text-sm ${isSelected ? "bg-indigo-950/40 hover:bg-slate-800 text-white" : "hover:bg-slate-800 text-slate-300"}`}
                                >
                                  <td className="px-6 py-4 font-bold text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                                      {formatPageNameWithCensorship(prod)}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-center font-bold text-slate-600">
                                    {leadsForProd.length}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-bold text-amber-400">
                                        {pendentesForProd.length}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {formatKz(pendenteValProd)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-bold text-indigo-400">
                                        {reservadosForProd.length}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {formatKz(previstoProd)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-bold text-emerald-400">
                                        {entreguesForProd.length}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {formatKz(brutoProd)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right font-black text-emerald-400 font-mono">
                                    {formatKz(brutoProd)}
                                  </td>
                                  <td className="px-6 py-4 text-right font-black text-white font-mono bg-slate-950/40">
                                    {formatKz(totalProdVal)}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      onClick={() =>
                                        setFinanceProductFilter(prod)
                                      }
                                      className={`px-3 py-1.5 bg-slate-900 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                        isSelected
                                          ? "border-indigo-500 text-indigo-400 shadow-xl bg-slate-950"
                                          : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                                      }`}
                                    >
                                      {isSelected
                                        ? "✓ Selecionado"
                                        : "⚡ Isolar Produto"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <>
              <div className="mb-8 block">
                <button
                  onClick={() => setView("pages")}
                  className={`flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-indigo-600"}`}
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1
                      className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      Painel de Leads
                    </h1>
                    <p
                      className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Gestão de Reservas
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => setHidePhones(!hidePhones)}
                      className={`text-sm px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition border cursor-pointer ${
                        hidePhones
                          ? isDark
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                          : isDark
                            ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-850 shadow-2xl"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm"
                      }`}
                      title={
                        hidePhones
                          ? "Mostrar Números de WhatsApp e Páginas"
                          : "Censurar Números de WhatsApp e Páginas"
                      }
                    >
                      {hidePhones ? (
                        <>
                          <Eye size={16} /> Mostrar Dados
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} /> Censurar Dados
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className={`text-sm px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition border cursor-pointer ${isDark ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-850 shadow-2xl" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm"}`}
                    >
                      <Download size={16} /> Exportar CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div
                  className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDark ? "bg-slate-900 border-slate-800 text-white shadow-2xl" : "bg-white border-amber-200 text-slate-800 shadow-sm"}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={64} />
                  </div>
                  <p className="text-sm text-amber-600 font-bold uppercase tracking-wider">
                    Pendentes
                  </p>
                  <p
                    className={`text-4xl font-black mt-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {
                      leadsForMetrics.filter((d) => d.status === "Pendente")
                        .length
                    }
                  </p>
                </div>
                <div
                  className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDark ? "bg-slate-900 border-slate-800 text-white shadow-2xl" : "bg-white border-emerald-200 text-slate-800 shadow-sm"}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
                    <CheckCircle size={64} />
                  </div>
                  <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">
                    Reservados
                  </p>
                  <p
                    className={`text-4xl font-black mt-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {
                      leadsForMetrics.filter(
                        (d) => d.status && d.status.includes("Reservado"),
                      ).length
                    }
                  </p>
                </div>
                <div
                  className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDark ? "bg-slate-900 border-slate-800 text-white shadow-2xl" : "bg-white border-indigo-200 text-slate-800 shadow-sm"}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500">
                    <Activity size={64} />
                  </div>
                  <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider">
                    Taxa de Conversão
                  </p>
                  <p
                    className={`text-4xl font-black mt-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {conversionRate}%
                  </p>
                  <div className="w-full bg-slate-205 dark:bg-slate-950/40 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, parseFloat(conversionRate) || 85)}%`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDark ? "bg-slate-900 border-slate-800 text-white shadow-2xl" : "bg-white border-red-200 text-slate-800 shadow-sm"}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500">
                    <XCircle size={64} />
                  </div>
                  <p className="text-sm text-red-600 font-bold uppercase tracking-wider">
                    Rejeitados
                  </p>
                  <p
                    className={`text-4xl font-black mt-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {
                      leadsForMetrics.filter((d) => d.status === "Rejeitado")
                        .length
                    }
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row gap-4 items-center transition-all duration-300 ${isDark ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-slate-200 shadow-sm"}`}
              >
                <div className="relative flex-grow w-full md:w-auto">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, telefone ou endereço..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-750"}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="relative min-w-[140px] shrink-0">
                    <Filter
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <select
                      className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-750"}`}
                      value={timeRangeFilter}
                      onChange={(e) => setTimeRangeFilter(e.target.value)}
                    >
                      <option
                        value="Tudo"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Qualquer Data
                      </option>
                      <option
                        value="Hoje"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Hoje
                      </option>
                      <option
                        value="Últimos 7 Dias"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Últimos 7 Dias
                      </option>
                      <option
                        value="Este Mês"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Este Mês
                      </option>
                    </select>
                  </div>
                  <div className="relative min-w-[140px] shrink-0">
                    <Filter
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <select
                      className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-750"}`}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option
                        value="Todos"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Todos os Status
                      </option>
                      <option
                        value="Pendente"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Pendentes
                      </option>
                      <option
                        value="Reservado"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Reservados
                      </option>
                      <option
                        value="Rejeitado"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Rejeitados
                      </option>
                      <option
                        value="Entregue"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Entregues
                      </option>
                      <option
                        value="Tentativa Falhada"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Tentativas Falhadas
                      </option>
                      <option
                        value="Cancelado"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Cancelados
                      </option>
                    </select>
                  </div>
                  <input
                    type="date"
                    className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shrink-0 cursor-pointer transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-750"}`}
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  <div className="relative min-w-[160px] shrink-0">
                    <Filter
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <select
                      className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm cursor-pointer transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-750"}`}
                      value={filterProduct}
                      onChange={(e) => setFilterProduct(e.target.value)}
                    >
                      <option
                        value=""
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        Todas as Páginas
                      </option>
                      {uniquePages.map((page, index) => (
                        <option
                          key={index}
                          value={page}
                          className={isDark ? "bg-slate-900 text-white" : ""}
                        >
                          {formatPageNameWithCensorship(page)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTIONS / SESSÕES DE LEADS */}
              <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl mb-6 gap-1.5 w-full sm:w-max shadow-xl">
                <button
                  onClick={() => setAdminListTab("geral")}
                  className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adminListTab === "geral"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileText size={16} />
                  <span>
                    📋 Painel Geral (
                    {
                      filteredData.filter(
                        (d) => d.status !== "Entregue" && d.status !== "Pago",
                      ).length
                    }
                    )
                  </span>
                </button>
                <button
                  onClick={() => setAdminListTab("arquivados")}
                  className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adminListTab === "arquivados"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <PackageOpen size={16} />
                  <span>
                    💸 Pagos ou Entregues (
                    {
                      filteredData.filter(
                        (d) => d.status === "Entregue" || d.status === "Pago",
                      ).length
                    }
                    )
                  </span>
                </button>
              </div>

              <div
                className={`${isDark ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-slate-200 shadow-sm"} rounded-2xl border overflow-hidden transition-all duration-300`}
              >
                {isAdminLoading ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>A sincronizar com a base de dados...</p>
                  </div>
                ) : adminError ? (
                  <div
                    className={`p-8 pb-10 text-center rounded-2xl m-4 flex flex-col items-center gap-3 border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                  >
                    <TriangleAlert className="text-amber-500" size={40} />
                    <div className="max-w-md">
                      <p
                        className={`font-bold text-base ${isDark ? "text-slate-200" : "text-slate-800"}`}
                      >
                        Problema de Ligação ou Sincronização
                      </p>
                      <p
                        className={`text-xs font-mono mt-1 p-2 rounded-lg border overflow-x-auto truncate max-w-lg ${isDark ? "bg-slate-900 border-slate-805 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-400"}`}
                      >
                        {adminError}
                      </p>
                    </div>
                    <button
                      onClick={() => loadAdminData()}
                      className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Tentar Novamente / Sincronizar
                    </button>
                  </div>
                ) : displayedLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    Nenhum lead encontrado nesta sessão com os filtros actuais.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto min-h-[400px] pb-56">
                      <table
                        className={`min-w-full divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}
                      >
                        <thead
                          className={isDark ? "bg-slate-950" : "bg-slate-50"}
                        >
                          <tr>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Data
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Nome
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              WhatsApp
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Produto
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Qtd
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              PROVÍNCIA
                            </th>
                            <th
                              className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Status
                            </th>
                            <th
                              className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDark ? "bg-slate-900 divide-slate-800" : "bg-white divide-slate-100"}`}
                        >
                          {displayedLeads.map((lead, i) => (
                            <tr
                              key={i}
                              className={`transition-colors border-b ${isDark ? "hover:bg-slate-800/40 border-slate-800/40" : "hover:bg-slate-50 border-slate-100/50"}`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-450">
                                {lead.timestamp
                                  ? new Date(
                                      lead.timestamp,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                              >
                                {lead.name}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {formatPhoneWithCensorship(lead.phone)}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-slate-300" : "text-slate-655"}`}
                              >
                                {formatPageNameWithCensorship(
                                  lead.produto || "Secador Inteligente UV",
                                )}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold ${isDark ? "text-emerald-400" : "text-slate-800"}`}
                              >
                                {lead.quantity || 1}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm max-w-[200px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
                              >
                                {lead.province || "Luanda"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={lead.status}
                                  onChange={(e) =>
                                    updateLeadStatus(lead.id, e.target.value)
                                  }
                                  className={`text-xs font-bold rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                                    lead.status?.includes("Reservado")
                                      ? "bg-emerald-100 text-emerald-700"
                                      : lead.status === "Rejeitado"
                                        ? "bg-red-100 text-red-700"
                                        : lead.status === "Entregue"
                                          ? "bg-blue-100 text-blue-700"
                                          : lead.status === "Cancelado"
                                            ? "bg-slate-200 text-slate-700"
                                            : lead.status ===
                                                "Tentativa Falhada"
                                              ? "bg-orange-100 text-orange-700"
                                              : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  <option value="Pendente">⏳ Pendente</option>
                                  <option value="Reservado">
                                    ✅ Reservado
                                  </option>
                                  <option value="Rejeitado">
                                    ❌ Rejeitado
                                  </option>
                                  <option value="Entregue">📦 Entregue</option>
                                  <option value="Tentativa Falhada">
                                    ⚠️ Tentativa Falhada
                                  </option>
                                  <option value="Cancelado">
                                    🚫 Cancelado
                                  </option>
                                </select>
                              </td>
                              <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm">
                                <div className="relative flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownLeadId(
                                        activeDropdownLeadId === lead.id
                                          ? null
                                          : lead.id,
                                      );
                                    }}
                                    className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                                      isDark
                                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                    }`}
                                    title="Ações"
                                  >
                                    <MoreVertical size={18} />
                                  </button>

                                  {activeDropdownLeadId === lead.id && (
                                    <>
                                      {/* Invisible backdrop to close the dropdown on clicking outside */}
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownLeadId(null);
                                        }}
                                      />
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className={`absolute right-0 z-50 w-44 rounded-xl border py-1 shadow-2xl top-full mt-2 ${
                                          isDark
                                            ? "border-slate-800 bg-slate-950 text-slate-200"
                                            : "border-slate-200 bg-white text-slate-805"
                                        }`}
                                      >
                                        <button
                                          onClick={() => {
                                            setActiveDropdownLeadId(null);
                                            setSelectedLeadForPreview(lead);
                                            setModalState("lead-preview");
                                          }}
                                          className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                                            isDark
                                              ? "hover:bg-slate-900 hover:text-white"
                                              : "hover:bg-slate-100 hover:text-indigo-650"
                                          }`}
                                        >
                                          <Eye
                                            size={14}
                                            className="text-slate-400"
                                          />
                                          <span>Ver Detalhes</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveDropdownLeadId(null);
                                            handleCopyLead(lead);
                                          }}
                                          className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                                            isDark
                                              ? "hover:bg-slate-900 hover:text-white"
                                              : "hover:bg-slate-100 hover:text-indigo-650"
                                          }`}
                                        >
                                          <Copy
                                            size={14}
                                            className="text-slate-400"
                                          />
                                          <span>Copiar Info</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveDropdownLeadId(null);
                                            handleWhatsApp(lead);
                                          }}
                                          className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                                            isDark
                                              ? "hover:bg-slate-900 hover:text-white"
                                              : "hover:bg-slate-100 hover:text-emerald-650"
                                          }`}
                                        >
                                          <MessageCircle
                                            size={14}
                                            className="text-emerald-500"
                                          />
                                          <span>WhatsApp</span>
                                        </button>

                                        <div
                                          className={`my-1 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}
                                        />

                                        <button
                                          onClick={() => {
                                            setActiveDropdownLeadId(null);
                                            setLeadToDelete(lead);
                                            setModalState(
                                              "delete-lead-confirm",
                                            );
                                          }}
                                          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-extrabold text-red-500 transition-colors hover:bg-red-500/10"
                                        >
                                          <Trash2
                                            size={14}
                                            className="text-red-550"
                                          />
                                          <span>Eliminar Lead</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div
                        className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 select-none transition-colors ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-100"}`}
                      >
                        <p
                          className={`text-xs font-medium font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          A mostrar{" "}
                          <span
                            className={`${isDark ? "text-white" : "text-slate-800"} font-bold`}
                          >
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{" "}
                          a{" "}
                          <span
                            className={`${isDark ? "text-white" : "text-slate-800"} font-bold`}
                          >
                            {Math.min(
                              currentPage * itemsPerPage,
                              allDisplayedLeads.length,
                            )}
                          </span>{" "}
                          de{" "}
                          <span
                            className={`${isDark ? "text-white" : "text-slate-800"} font-medium`}
                          >
                            {allDisplayedLeads.length}
                          </span>{" "}
                          leads
                        </p>

                        <div className="flex items-center gap-1.5 step-pagination">
                          <button
                            onClick={() =>
                              setAdminCurrentPage((prev) =>
                                Math.max(1, prev - 1),
                              )
                            }
                            disabled={currentPage === 1}
                            className={`p-1 px-2.5 rounded-lg border transition flex items-center gap-1 text-xs font-bold cursor-pointer ${isDark ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:bg-slate-950 disabled:opacity-40" : "border-slate-200 bg-white text-slate-600 sm:hover:bg-slate-50 disabled:bg-white disabled:opacity-40"}`}
                            title="Página Anterior"
                          >
                            <ChevronLeft size={14} />
                            <span>Anterior</span>
                          </button>

                          {/* Page numbers */}
                          {(() => {
                            const pages: (number | string)[] = [];
                            const startPage = Math.max(1, currentPage - 2);
                            const endPage = Math.min(
                              totalPages,
                              currentPage + 2,
                            );

                            if (startPage > 1) {
                              pages.push(1);
                              if (startPage > 2) pages.push("...");
                            }

                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(i);
                            }

                            if (endPage < totalPages) {
                              if (endPage < totalPages - 1) pages.push("...");
                              pages.push(totalPages);
                            }

                            return pages.map((page, idx) => {
                              if (typeof page === "string") {
                                return (
                                  <span
                                    key={`dots-${idx}`}
                                    className="px-2 text-slate-450 font-mono text-xs"
                                  >
                                    {page}
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={`page-${page}`}
                                  onClick={() => setAdminCurrentPage(page)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                                    currentPage === page
                                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                                      : isDark
                                        ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
                                        : "bg-white border border-slate-200 text-slate-600 sm:hover:bg-slate-50 cursor-pointer"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            });
                          })()}

                          <button
                            onClick={() =>
                              setAdminCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className={`p-1 px-2.5 rounded-lg border transition flex items-center gap-1 text-xs font-bold cursor-pointer ${isDark ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:bg-slate-950 disabled:opacity-40" : "border-slate-200 bg-white text-slate-600 sm:hover:bg-slate-50 disabled:bg-white disabled:opacity-40"}`}
                            title="Próxima Página"
                          >
                            <span>Próxima</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>
      )}

      {/* PAGES HUB VIEW */}
      {view === "pages" && isAuthenticated && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setView("sales")}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <h1 className="text-3xl font-bold text-slate-900">
                Gerência de Páginas
              </h1>
              <p className="text-slate-500 mt-1">
                Gira as suas landing pages, acesse links e veja leads
                rapidamente.
              </p>
            </div>
          </div>

          {/* Global Settings Section */}
          <div className="mb-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-600" />{" "}
                  Configurações de Tracking
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Configure o Pixel da Meta e Google Tags para todas as suas
                  páginas.
                </p>
              </div>
              <button
                onClick={async () => {
                  setIsSavingSettings(true);
                  try {
                    await setDoc(doc(db, "settings", "global"), appSettings);
                    alert("Configurações salvas com sucesso!");
                  } catch (err) {
                    alert("Erro ao salvar configurações.");
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                disabled={isSavingSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Salvar Alterações
              </button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6 bg-slate-50/50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Meta Pixel ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={appSettings.fbPixel || ""}
                    onChange={(e) =>
                      setAppSettings((prev) => ({
                        ...prev,
                        fbPixel: e.target.value,
                      }))
                    }
                    placeholder="Ex: 4192962437607469"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Info size={12} /> Cole apenas o número do ID do pixel aqui.
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Google Tag ID (G-XXXXX)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={appSettings.googleTag || ""}
                    onChange={(e) =>
                      setAppSettings((prev) => ({
                        ...prev,
                        googleTag: e.target.value,
                      }))
                    }
                    placeholder="Ex: AW-123456789"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Info size={12} /> Utilizado para Google Ads e Analytics.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Produto 1: Secador UV */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                <img
                  src={IMAGES[0]}
                  alt="Secador Inteligente UV"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">
                  Ativa
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">
                  Secador Inteligente UV
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">
                  Oferta CPA padrão com formulário integrado. Conversão direta.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setView("sales")}
                    className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <Eye size={14} /> Pré-visualizar
                  </button>
                  <button
                    onClick={() => {
                      setFilterProduct("Secador Inteligente UV");
                      setView("admin");
                    }}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => {
                      const link =
                        window.location.origin + "?product=secador-uv";
                      navigator.clipboard.writeText(link);
                      alert("Link copiado: " + link);
                    }}
                    className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                    title="Copiar Link da Página"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Produto 2: Secador Expresso */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                <img
                  src={IMAGES_ROUPAS[0]}
                  alt="Secador Expresso Portátil (Edition Pro)"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">
                  Ativa
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">
                  Secador Expresso Pro 35 000 Kz
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">
                  Novo produto voltado a roupas húmidas e dias de chuva.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setView("sales-roupas")}
                    className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <Eye size={14} /> Pré-visualizar
                  </button>
                  <button
                    onClick={() => {
                      setFilterProduct("Secador Expresso Pro 35 000 Kz");
                      setView("admin");
                    }}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => {
                      const link =
                        window.location.origin + "?product=cabide-secador";
                      navigator.clipboard.writeText(link);
                      alert("Link copiado: " + link);
                    }}
                    className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                    title="Copiar Link da Página"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Produto 3: Roteador ZTE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                <img
                  src={IMAGES_ROTEADOR[0]}
                  alt="Roteador 5G Ultra Desbloqueado"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">
                  Ativa
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">
                  Roteador 5G Ultra Desbloqueado
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">
                  Nova landing page focada em internet de alto desempenho.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setView("sales-roteador")}
                    className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <Eye size={14} /> Pré-visualizar
                  </button>
                  <button
                    onClick={() => {
                      setFilterProduct("Roteador 5G Ultra Desbloqueado");
                      setView("admin");
                    }}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => {
                      const link =
                        window.location.origin + "?product=roteador-5g";
                      navigator.clipboard.writeText(link);
                      alert("Link copiado: " + link);
                    }}
                    className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                    title="Copiar Link da Página"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Produto 4: Base Móvel 360° */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                <img
                  src={IMAGES_BASE_MOVEL[0]}
                  alt="Base Móvel 360° — Deslizador para Máquina de Lavar e Geladeira"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase">
                  Ativa
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">
                  Base Móvel 360°
                </h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">
                  Deslizador para fogões, geladeiras, máquinas de lavar e arcas. 15.000 Kz / Par.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setView("sales-base-movel")}
                    className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold transition flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <Eye size={14} /> Pré-visualizar
                  </button>
                  <button
                    onClick={() => {
                      setFilterProduct("Base Móvel 360°");
                      setView("admin");
                    }}
                    className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition border border-slate-200 shadow-sm"
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => {
                      const link =
                        window.location.origin + "?product=base-movel-360";
                      navigator.clipboard.writeText(link);
                      alert("Link copiado: " + link);
                    }}
                    className="text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 w-[42px] shadow-sm"
                    title="Copiar Link da Página"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* USERS VIEW */}
      {view === "users" && isAuthenticated && (
        <UsersView
          onBack={() => setView("pages")}
          currentUserEmail={auth.currentUser?.email || null}
        />
      )}

      {/* DANGER ZONE VIEW */}
      {view === "danger-zone" && isAuthenticated && (
        <main className="w-full max-w-[1600px] mx-auto px-4 py-10 flex-grow">
          <div className="mb-8 block">
            <button
              onClick={() => setView("pages")}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
              <AlertOctagon size={32} /> Zona de Perigo
            </h1>
            <p className="text-slate-500 mt-1">
              Ações avançadas e irreversíveis sobre a plataforma.
            </p>
          </div>

          <div className="max-w-2xl bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-red-100 bg-red-50/50">
              <h2 className="font-bold text-red-800 text-lg">Atenção!</h2>
              <p className="text-sm text-red-700 mt-1">
                As funcionalidades abaixo excluem permanentemente os dados. Use
                com extrema cautela.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Eliminar Leads por Páginas
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Apaga todos os leads de uma página selecionada.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDangerInputValue("");
                    setModalState("danger-action-page-prompt");
                  }}
                  className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Trash2 size={16} /> Especial
                </button>
              </div>

              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">Eliminar Páginas</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Remove a página e todos os leads associados a ela.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDangerActionContext({
                      alertMessage:
                        "As páginas são estáticas nesta versão do sistema. Para alterar as visualizações de páginas, deverá editar o código diretamente.",
                    });
                    setModalState("danger-alert");
                  }}
                  className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Trash2 size={16} /> Páginas
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">Eliminação Total</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Remove TODOS os leads de TODAS as campanhas da plataforma.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDangerInputValue("");
                    setModalState("danger-action-all-prompt");
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
        {modalState !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
            onClick={() => setModalState("none")}
          >
            {/* Step 1: Sold Out */}
            {modalState === "step1" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-600 p-8 text-center text-white relative">
                  <PackageOpen className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-3xl font-black tracking-tight">
                    🔴 Lote Esgotado!
                  </h3>
                </div>
                <div className="p-8 text-center text-slate-700">
                  <p className="mb-6 text-lg font-medium leading-relaxed">
                    O stock do{" "}
                    <strong>
                      {view === "sales-roupas"
                        ? "Secador Expresso Portátil"
                        : view === "sales-roteador"
                          ? "ZTE 5G WiFi 6 CPE"
                          : view === "sales-base-movel"
                            ? "Base Móvel 360°"
                            : "Secador Inteligente UV"}
                    </strong>{" "}
                    para entrega imediata terminou devido à altíssima procura
                    nas últimas horas.
                  </p>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Mas <b>não te preocupes!</b> O novo lote chega em breve.
                    Queres garantir a tua reserva e manter o preço promocional
                    de{" "}
                    <b>
                      {view === "sales-roupas"
                        ? "35.000 Kz"
                        : view === "sales-roteador"
                          ? "240.000 Kz"
                          : view === "sales-base-movel"
                            ? "15.000 Kz"
                            : "25.000 Kz"}
                    </b>
                    ?{" "}
                    <span className="text-indigo-600 font-bold block mt-2">
                      (Não pagas nada hoje!)
                    </span>
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => processReservation(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                    >
                      ✅ SIM, QUERO RESERVAR O MEU!
                    </button>
                    <button
                      onClick={() => setModalState("last-chance")}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-400 font-bold py-3.5 px-4 rounded-xl transition"
                    >
                      Não, prefiro perder a promoção
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Last Chance */}
            {modalState === "last-chance" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8 border-4 border-red-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 text-center pt-8 pb-4">
                  <TriangleAlert className="w-16 h-16 mx-auto mb-2 text-red-500" />
                  <h3 className="text-2xl font-black text-slate-900">
                    Tens a certeza,{" "}
                    {formData.name ? formData.name.split(" ")[0] : "amigo"}?
                  </h3>
                </div>
                <div className="p-8 text-center pt-4">
                  <p className="text-slate-700 mb-6 font-bold text-lg">
                    Sem a{" "}
                    {view === "sales-roupas"
                      ? "Secador Expresso Portátil"
                      : view === "sales-roteador"
                        ? "Roteador 5G Ultra"
                        : view === "sales-base-movel"
                          ? "Base Móvel 360°"
                          : "Secador UV"}
                    , vais continuar a:
                  </p>
                  {view === "sales-roteador" ? (
                    <ul className="text-left text-slate-600 mb-8 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🛜</span>{" "}
                        <span className="font-medium">
                          Depender de provedores com sinal fraco
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🐢</span>{" "}
                        <span className="font-medium">
                          Ficar com internet super lenta quando muita gente
                          conecta
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">💸</span>{" "}
                        <span className="font-medium">
                          Gastar num plano de internet caro e limitado
                        </span>
                      </li>
                    </ul>
                  ) : view === "sales-base-movel" ? (
                    <ul className="text-left text-slate-600 mb-8 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🏋️</span>{" "}
                        <span className="font-medium">
                          Precisar de 2 ou 3 pessoas só para deslocar o fogão, geladeira ou máquina
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🪳</span>{" "}
                        <span className="font-medium">
                          Acumular poeira, mofo e insetos atrás dos eletrodomésticos sem conseguir limpar
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">⚡</span>{" "}
                        <span className="font-medium">
                          Riscar e danificar o piso ao empurrar equipamentos pesados com dores nas costas
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">💸</span>{" "}
                        <span className="font-medium">
                          Gastar dinheiro e tempo contratando alguém só para mover eletrodomésticos
                        </span>
                      </li>
                    </ul>
                  ) : view === "sales-roupas" ? (
                    <ul className="text-left text-slate-600 mb-8 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🩲</span>{" "}
                        <span className="font-medium">
                          Ter vergonha de deixar roupa íntima no estendal comum
                          dos vizinhos
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🤢</span>{" "}
                        <span className="font-medium">
                          Suportar o cheiro a bafio e fungos nas roupas
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">😤</span>{" "}
                        <span className="font-medium">
                          Ver camisas, calças e uniformes escolares húmidos de
                          manhã
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🏠</span>{" "}
                        <span className="font-medium">
                          Ter a casa cheia de roupa espalhada por dias
                        </span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="text-left text-slate-600 mb-8 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <li className="flex items-start gap-3">
                        <span className="text-xl">👟</span>{" "}
                        <span className="font-medium">
                          Ter vergonha de tirar os sapatos em público pelo mau
                          cheiro
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">🤢</span>{" "}
                        <span className="font-medium">
                          Acumular fungos e bactérias dentro do calçado favorito
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">😤</span>{" "}
                        <span className="font-medium">
                          Usar ténis e sapatos húmidos que magoam os pés
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-xl">💸</span>{" "}
                        <span className="font-medium">
                          Ver o calçado estragar-se mais depressa pela humidade
                        </span>
                      </li>
                    </ul>
                  )}
                  <p className="text-sm text-slate-900 font-bold mb-8 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                    O próximo lote custará{" "}
                    <b>
                      {view === "sales-roupas"
                        ? "50.000 Kz"
                        : view === "sales-roteador"
                          ? "310.000 Kz"
                          : view === "sales-base-movel"
                            ? "30.000 Kz"
                            : "45.000 Kz"}
                    </b>
                    . Vais mesmo deixar passar?
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => processReservation(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                    >
                      ✅ MUDEI DE IDEIAS! QUERO RESERVAR
                    </button>
                    <button
                      onClick={() => setModalState("testimonial-rebound")}
                      className="w-full bg-transparent text-slate-400 hover:text-slate-600 underline font-medium py-2 transition"
                    >
                      Sim, assumo o risco e perco a promoção
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Testimonial Rebound */}
            {modalState === "testimonial-rebound" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-indigo-600 p-8 text-center text-white">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
                  <h3 className="text-2xl font-black tracking-tight">
                    Última oportunidade,{" "}
                    {formData.name ? formData.name.split(" ")[0] : "amigo"}
                  </h3>
                </div>
                <div className="p-8 text-center">
                  <p className="text-slate-700 mb-8 font-bold leading-relaxed">
                    Antes de saíres, só uma coisa:
                  </p>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left relative">
                    <div className="absolute -top-3 -left-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                      Testemunho Real
                    </div>
                    <p className="text-slate-600 italic mb-4 leading-relaxed">
                      "
                      {view === "sales-roupas"
                        ? "A Maria de Talatona também hesitou. Hoje agradece todos os dias por ter reservado. Nunca pensei que ia fazer tanta diferença. A minha roupa íntima seca em 2 horas dentro do quarto. Sem vergonha, sem bafio."
                        : view === "sales-roteador"
                          ? "O Mário de Talatona também hesitou. Hoje agradece por ter mudado para este roteador 5G libertando-se de internet que caía toda a hora, agora desfruta de 3600Mbps mesmo no pico."
                          : view === "sales-base-movel"
                            ? "A Dona Rosa do Kilamba também hesitou. Hoje consegue arrastar a geladeira e a máquina de lavar sozinha só com uma mão para limpar. Sem pedir ajuda e sem riscar o chão."
                            : "O Paulo do Kilamba também hesitou. Hoje agradece todos os dias por ter reservado. O mau cheiro dos ténis de treino desapareceu completamente. Sinto os pés muito mais saudáveis e frescos."}
                      "
                    </p>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </div>
                  </div>

                  <p className="text-indigo-600 font-bold mb-8 text-base">
                    A reserva é gratuita e sem compromisso. Pagas só quando
                    receberes.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => processReservation(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                    >
                      ✅ OK, VOU RESERVAR
                    </button>
                    <button
                      onClick={() => processReservation(false)}
                      className="w-full bg-transparent text-slate-300 hover:text-slate-500 underline font-medium py-2 transition text-sm"
                    >
                      Não, desisto mesmo.
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {modalState === "success" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-emerald-500 p-8 text-center text-white">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-100" />
                  <h3 className="text-3xl font-black tracking-tight">
                    🎉 Reserva Garantida!
                  </h3>
                </div>
                <div className="p-8 text-center text-slate-700">
                  <p className="text-xl font-bold mb-4">
                    Parabéns,{" "}
                    <span className="text-indigo-600">
                      {formData.name ? formData.name.split(" ")[0] : "Cliente"}
                    </span>
                    !
                  </p>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    A tua unidade de{" "}
                    <strong>
                      {view === "sales-roupas"
                        ? "Secador Expresso Portátil"
                        : view === "sales-roteador"
                          ? "ZTE 5G Ultra"
                          : "Secador UV"}
                    </strong>{" "}
                    está reservada ao preço de{" "}
                    <strong>
                      {view === "sales-roupas"
                        ? "35.000 Kz"
                        : view === "sales-roteador"
                          ? "240.000 Kz"
                          : "25.000 Kz"}
                    </strong>
                    .
                  </p>
                  <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl text-sm mb-8 border border-emerald-100 font-bold leading-relaxed">
                    Receberás uma mensagem no WhatsApp quando o lote chegar —
                    pagas só no momento da entrega.
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Enquanto esperas, partilha com um amigo 👇
                    </p>
                    <a
                      href={`https://wa.me/?text=Olha%20este%20secador%20que%20acabei%20de%20reservar!%20%0A%0A${window.location.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex justify-center items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 px-4 rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 mb-3"
                    >
                      <MessageCircle size={22} />
                      📲 PARTILHAR NO WHATSAPP
                    </a>
                    <a
                      href="https://www.cstoreao.shop/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl transition-transform active:scale-[0.98] border border-slate-200"
                    >
                      <Store size={20} />
                      Visitar Loja C Store Angola
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 Alt: Rejected */}
            {modalState === "rejected" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-8 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Compreendemos.
                </h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  A sua vaga foi libertada para o próximo cliente na lista de
                  espera.
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
            {modalState === "profile" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-slate-900 p-6 text-center text-white relative">
                  <button
                    onClick={() => setModalState("none")}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner mx-auto mb-3">
                    {(auth.currentUser?.displayName || "Pedro")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold">Meu Perfil</h3>
                </div>

                <div className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={profileFormData.name}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileFormData.email}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nova Senha (opcional)
                      </label>
                      <input
                        type="password"
                        value={profileFormData.password}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            password: e.target.value,
                          })
                        }
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
                      onClick={() => {
                        setModalState("danger-zone");
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-red-100 font-bold"
                    >
                      <AlertOctagon size={18} /> Acessar Zona de Perigo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Danger Zone Entry Modal */}
            {modalState === "danger-zone" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8 border-2 border-red-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 p-6 text-center text-red-900 relative border-b border-red-100">
                  <button
                    onClick={() => setModalState("none")}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 border border-transparent hover:border-red-600 rounded-full"
                  >
                    <XCircle size={24} />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
                    <AlertOctagon size={32} />
                  </div>
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    Aviso de Segurança
                  </h3>
                  <p className="text-sm mt-2 text-red-700/80 font-medium">
                    Você está preste a acessar uma área restrita e perigosa.
                  </p>
                </div>

                <div className="p-6 space-y-4 text-center">
                  <p className="text-slate-600 text-sm">
                    A Zona de Perigo permite a{" "}
                    <strong className="text-red-600">
                      exclusão irreversível
                    </strong>{" "}
                    de páginas e contatos. Qualquer ação realizada lá não poderá
                    ser desfeita. Tem a certeza que pretende continuar?
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setModalState("none")}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setModalState("none");
                        setView("danger-zone");
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
            {modalState === "danger-action-page-prompt" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 p-6 border-b border-red-100 relative">
                  <button
                    onClick={() => setModalState("none")}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-700"
                  >
                    <XCircle size={24} />
                  </button>
                  <h3 className="text-lg font-bold text-red-900 mb-1">
                    Eliminar Leads por Página
                  </h3>
                  <p className="text-sm text-red-700/80">
                    Digite o NOME DA PÁGINA (ex: "Secador Inteligente UV")
                  </p>
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
                    <button
                      onClick={() => setModalState("none")}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                        if (!dangerInputValue) return;
                        try {
                          const q = query(
                            collection(db, "leads"),
                            where("produto", "==", dangerInputValue),
                          );
                          const snapshot = await getDocs(q);
                          if (snapshot.empty) {
                            setDangerActionContext({
                              alertMessage:
                                "Nenhum lead encontrado para esta página.",
                            });
                            setModalState("danger-alert");
                            return;
                          }
                          setDangerActionContext({
                            pageName: dangerInputValue,
                            leadCount: snapshot.size,
                            docsToDelete: snapshot.docs,
                          });
                          setModalState("danger-action-page-confirm");
                        } catch (err) {
                          handleFirestoreError(
                            err,
                            OperationType.DELETE,
                            "leads",
                          );
                        }
                      }}
                    >
                      Procurar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === "danger-action-page-confirm" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-600 p-6 text-center text-white relative">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-3">
                    <AlertOctagon size={32} />
                  </div>
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    Confirma a eliminação?
                  </h3>
                </div>
                <div className="p-6 text-center">
                  <p className="text-slate-600 mb-6">
                    Foram encontrados{" "}
                    <strong className="text-red-600">
                      {dangerActionContext.leadCount}
                    </strong>{" "}
                    leads para a página "{dangerActionContext.pageName}". A
                    eliminação é definitiva.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalState("none")}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                        try {
                          const docs = dangerActionContext.docsToDelete || [];
                          await Promise.all(
                            docs.map((docSnapshot) =>
                              deleteDoc(doc(db, "leads", docSnapshot.id)),
                            ),
                          );
                          setDangerActionContext({
                            alertMessage: `${docs.length} leads eliminados com sucesso.`,
                          });
                          setModalState("danger-alert");
                          if (isAuthenticated) loadAdminData();
                        } catch (err) {
                          handleFirestoreError(
                            err,
                            OperationType.DELETE,
                            "leads",
                          );
                        }
                      }}
                    >
                      Sim, eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === "danger-action-all-prompt" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-red-50 p-6 border-b border-red-100 relative">
                  <button
                    onClick={() => setModalState("none")}
                    className="absolute top-4 right-4 text-red-500"
                  >
                    <XCircle size={24} />
                  </button>
                  <h3 className="text-lg font-bold text-red-900 mb-1">
                    Eliminação Total
                  </h3>
                  <p className="text-sm text-red-700 flex flex-col gap-1">
                    Para confirmar a exclusão DEFINITIVA de todos os leads,
                    digite:{" "}
                    <strong className="bg-red-100 px-2 py-1 rounded inline-block text-center mt-2 font-mono">
                      eliminar todos leads
                    </strong>
                  </p>
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
                    <button
                      onClick={() => setModalState("none")}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-sm transition"
                      onClick={async () => {
                        if (dangerInputValue !== "eliminar todos leads") {
                          setDangerActionContext({
                            alertMessage: "Nome de verificação incorreto.",
                          });
                          setModalState("danger-alert");
                          return;
                        }
                        try {
                          const snapshot = await getDocs(
                            collection(db, "leads"),
                          );
                          if (snapshot.empty) {
                            setDangerActionContext({
                              alertMessage:
                                "Nenhum lead encontrado para apagar.",
                            });
                            setModalState("danger-alert");
                            return;
                          }
                          await Promise.all(
                            snapshot.docs.map((docSnapshot) =>
                              deleteDoc(doc(db, "leads", docSnapshot.id)),
                            ),
                          );
                          setDangerActionContext({
                            alertMessage: `Total de ${snapshot.size} leads eliminados com sucesso.`,
                          });
                          setModalState("danger-alert");
                          if (isAuthenticated) loadAdminData();
                        } catch (err) {
                          handleFirestoreError(
                            err,
                            OperationType.DELETE,
                            "leads",
                          );
                        }
                      }}
                    >
                      Confirmar Exclusão
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {modalState === "danger-alert" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Informação
                </h3>
                <p className="text-slate-600 mb-6">
                  {dangerActionContext.alertMessage}
                </p>
                <button
                  onClick={() => setModalState("none")}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm"
                >
                  Entendido
                </button>
              </motion.div>
            )}

            {modalState === "delete-lead-confirm" && leadToDelete && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden my-8 p-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Excluir Lead permanentemente?
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Esta ação não pode ser desfeita. O lead de{" "}
                  <span className="font-bold text-slate-700">
                    {leadToDelete.name}
                  </span>{" "}
                  será removido para sempre.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setLeadToDelete(null);
                      setModalState("none");
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Não, manter
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "leads", leadToDelete.id));
                        if (view === "admin") {
                          setAdminData(
                            adminData.filter((l) => l.id !== leadToDelete.id),
                          );
                        }
                        setModalState("none");
                        setLeadToDelete(null);
                      } catch (e) {
                        handleFirestoreError(e, OperationType.DELETE, "leads");
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Sim, excluir
                  </button>
                </div>
              </motion.div>
            )}

            {modalState === "lead-preview" && selectedLeadForPreview && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-indigo-600 p-6 text-white text-center relative">
                  <button
                    onClick={() => {
                      setSelectedLeadForPreview(null);
                      setModalState("none");
                    }}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                  <Eye className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-xl font-bold">Detalhes do Lead</h3>
                  <p className="text-indigo-200 text-xs mt-1">
                    Previsualização Completa do Pedido
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Data de Reserva
                      </span>
                      <p className="font-semibold">
                        {selectedLeadForPreview.timestamp
                          ? new Date(
                              selectedLeadForPreview.timestamp,
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Nome Completo
                      </span>
                      <p className="font-semibold text-slate-900">
                        {selectedLeadForPreview.name}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Segmento / Produto
                      </span>
                      <p className="font-semibold text-slate-900">
                        {formatPageNameWithCensorship(
                          selectedLeadForPreview.produto ||
                            "Secador Inteligente UV",
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                          WhatsApp
                        </span>
                        <p className="font-semibold text-slate-900">
                          {formatPhoneWithCensorship(
                            selectedLeadForPreview.phone,
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Quantidade
                        </span>
                        <p className="font-semibold text-slate-900">
                          {selectedLeadForPreview.quantity || 1} Unidades
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Província
                        </span>
                        <p className="font-semibold text-slate-900">
                          {selectedLeadForPreview.province || "Luanda"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Total
                        </span>
                        <p className="font-bold text-indigo-600 text-base">
                          {formatKz(getLeadPrice(selectedLeadForPreview))}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Bairro, Zona, Município (Endereço)
                      </span>
                      <p className="font-semibold text-slate-900 p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        {selectedLeadForPreview.area ||
                          selectedLeadForPreview.address ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLead(selectedLeadForPreview)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition"
                      >
                        <Copy size={16} /> Copiar Dados
                      </button>

                      <button
                        onClick={() => handleWhatsApp(selectedLeadForPreview)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLeadForPreview(null);
                        setModalState("none");
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition mt-1"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile CTA (Only visible on mobile when scrolling) */}
      {isSalesView && modalState === "none" && !isCheckoutVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 md:hidden z-30">
          <button
            onClick={() => {
              const targetId = "comprar";
              const inputId =
                view === "sales" ? "name-input" : "name-input-roupas";
              document
                .getElementById(targetId)
                ?.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                if (view === "sales") nameInputRef.current?.focus();
                else nameInputRoupasRef.current?.focus();
              }, 800);
            }}
            className="w-full bg-emerald-500 text-white font-bold text-lg py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            QUERO APROVEITAR
          </button>
        </div>
      )}

      {/* Social Proof Popup */}
      <AnimatePresence>
        {isSalesView && activePopup && (
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
                <span className="font-bold">{activePopup.name}</span> em{" "}
                <span className="font-semibold text-indigo-700">
                  {activePopup.city}
                </span>
              </p>
              <p className="text-[11px] md:text-xs text-slate-500 flex items-center gap-1.5">
                Acabou de reservar uma unidade{" "}
                <span className="text-slate-300">•</span>{" "}
                <span className="text-emerald-600 font-medium">
                  {activePopup.time}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "privacy" && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 text-indigo-600 mb-8 font-medium hover:text-indigo-800 transition"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-4xl font-black mb-8 text-slate-900">
            Políticas de Privacidade
          </h1>
          <div className="prose prose-lg text-slate-700">
            <p>Data de entrada em vigor: 13 de Maio de 2026</p>
            <p>
              Na Valida C (desenvolvido pelo Grupo Cassaminha), a sua
              privacidade é a nossa prioridade. Esta Política de Privacidade
              explica como recolhemos, usamos, divulgamos e protegemos a sua
              informação quando utiliza a nossa plataforma.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              1. Informação que Recolhemos
            </h3>
            <p>
              Recolhemos informação que nos fornece diretamente, tal como quando
              cria uma conta, contacta o nosso suporte ou utiliza os nossos
              serviços. Isto pode incluir o seu nome, endereço de e-mail e
              informação sobre o seu negócio e produtos.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              2. Como Usamos a Sua Informação
            </h3>
            <p>
              Utilizamos a informação que recolhemos para operar, manter e
              melhorar a plataforma Valida C, para comunicar consigo, e para
              personalizar e melhorar a sua experiência.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              3. Partilha de Informação
            </h3>
            <p>
              Não vendemos nem alugamos as suas informações pessoais a
              terceiros. Apenas partilhamos as suas informações quando
              necessário para fornecer os nossos serviços, cumprir com a lei, ou
              proteger os nossos direitos.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              4. Segurança de Dados
            </h3>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais
              concebidas para proteger as suas informações. No entanto, nenhum
              sistema pode ser 100% seguro.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              5. Os Seus Direitos
            </h3>
            <p>
              Dependendo da sua localização, pode ter o direito de aceder,
              corrigir, eliminar ou restringir o uso das suas informações
              pessoais.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              6. Contacte-nos
            </h3>
            <p>
              Se tiver perguntas sobre esta Política de Privacidade, por favor
              contacte-nos através do Grupo Cassaminha.
            </p>
          </div>
        </div>
      )}

      {view === "terms" && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 text-indigo-600 mb-8 font-medium hover:text-indigo-800 transition"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-4xl font-black mb-8 text-slate-900">
            Termos de Uso
          </h1>
          <div className="prose prose-lg text-slate-700">
            <p>Última atualização: 13 de Maio de 2026</p>
            <p>
              Bem-vindo à Valida C, uma plataforma desenvolvida pelo Grupo
              Cassaminha. Ao utilizar os nossos serviços, concorda com estes
              Termos de Uso.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              1. Aceitação dos Termos
            </h3>
            <p>
              Ao aceder ou usar a plataforma Valida C, concorda em ficar
              vinculado por estes Termos e pela nossa Política de Privacidade.
              Se não concordar com alguma parte dos termos, não deverá aceder ou
              usar o serviço.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              2. Uso da Plataforma
            </h3>
            <p>
              Concorda em utilizar a plataforma apenas para fins legais e de uma
              maneira que não infrinja os direitos de terceiros ou restrinja o
              uso da plataforma por outros utilizadores.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              3. Contas de Utilizador
            </h3>
            <p>
              Para usar certas funcionalidades, terá de criar uma conta. É
              responsável por manter a confidencialidade da sua conta e senha, e
              por restringir o acesso ao seu computador ou dispositivo.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              4. Modificações do Serviço
            </h3>
            <p>
              Reservamo-nos o direito de retirar ou alterar a plataforma, e
              qualquer serviço ou material que fornecemos nela, a nosso
              exclusivo critério e sem aviso prévio. Não seremos responsáveis
              se, por qualquer motivo, todo ou parte da plataforma estiver
              indisponível.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              5. Isenção de Garantias
            </h3>
            <p>
              A plataforma é fornecida "tal como está" e "conforme disponível".
              Não oferecemos garantias de qualquer tipo, expressas ou
              implícitas, relativamente à operação da plataforma, às
              informações, conteúdos ou materiais nela incluídos.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              6. Limitação de Responsabilidade
            </h3>
            <p>
              Em nenhum caso a Valida C, o Grupo Cassaminha, ou os seus
              diretores serão responsáveis por quaisquer danos decorrentes do
              uso da plataforma ou relacionados ao uso da plataforma.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">
              7. Alterações aos Termos
            </h3>
            <p>
              Podemos rever estes Termos de Uso a qualquer momento. Ao continuar
              a usar o serviço após as alterações entrarem em vigor, você
              concorda estar vinculado aos termos revistos.
            </p>
          </div>
        </div>
      )}

      {/* WhatsApp Fixed Button for Mobile - REMOVED PER USER REQUEST */}
      {/* (view === 'sales' || view === 'sales-roupas') && ... */}

      {/* Floating Admin Return Button (Only for Logged-in Admins on Sales pages) */}
      {isAuthenticated && isSalesView && (
        <button
          onClick={() => setView("admin")}
          className="fixed bottom-4 left-4 z-50 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all opacity-70 hover:opacity-100"
          title="Voltar ao Painel Admin"
        >
          <Lock size={12} className="text-amber-400" />
          <span>Painel Admin</span>
        </button>
      )}
    </div>
  );
}
