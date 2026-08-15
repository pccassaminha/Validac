import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  DollarSign,
  Edit3,
  Euro,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calculator,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  ShieldAlert,
  Download,
  Info,
  Sliders,
  Sparkles,
  Search,
  ShoppingCart,
  Banknote,
  Percent,
  Settings,
  Receipt,
  Camera,
  Coins,
  Image as ImageIcon,
  Maximize2,
  X,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  MoreVertical
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export interface TransactionItem {
  id: string;
  type: "topup" | "purchase" | "withdrawal";
  description: string;
  currency: string;
  originalAmount: number;
  exchangeRate: number;
  amountAOA: number;
  feeRate: number; // e.g. 0.02 for topup, 0.03 for purchase
  feeAOA: number;
  vatRate: number; // e.g. 0.14
  vatAOA: number; // 14% on feeAOA
  totalDebitedAOA: number; // Total debited
  cardBalanceAfterAOA: number;
  receiptPhotoUrl?: string; // Camera/Receipt photo attachment
  createdAt: string;
}

export interface SavedSimulationItem {
  id: string;
  itemName: string;
  currency: string;
  originalPrice: number;
  exchangeRate: number;
  baseAmountAOA: number;
  feePercent: number;
  feeAOA: number;
  vatPercent: number;
  vatAOA: number;
  totalCostAOA: number;
  cardBalanceAtSimAOA: number;
  canAfford: boolean;
  shortageOrRemainingAOA: number;
  productUrl?: string;
  createdAt: string;
}

export interface ExchangeRatesMap {
  [currency: string]: number;
}

interface CardCalculatorViewProps {
  isDark?: boolean;
  onBack?: () => void;
}

export const CardCalculatorView: React.FC<CardCalculatorViewProps> = ({
  isDark = true,
  onBack,
}) => {
  // State
  const [plafondAOA, setPlafondAOA] = useState<number>(5000000); // Default 5M Kz plafond
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesMap>({
    USD: 920,
    EUR: 1010,
  });

  // Configurable Fee Rules (Default: 2% topup, 3% purchase/withdrawal, 14% VAT)
  const [topupFeePercent, setTopupFeePercent] = useState<number>(2);
  const [purchaseFeePercent, setPurchaseFeePercent] = useState<number>(3);
  const [vatPercent, setVatPercent] = useState<number>(14);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Exchange rate edit modal
  const [editingRateCurr, setEditingRateCurr] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<string>("");

  // Fee rates edit modal
  const [editingFeesModal, setEditingFeesModal] = useState<boolean>(false);
  const [tempTopupFee, setTempTopupFee] = useState<string>("2");
  const [tempPurchaseFee, setTempPurchaseFee] = useState<string>("3");
  const [tempVatPercent, setTempVatPercent] = useState<string>("14");

  // Exchange rate form state (New currency)
  const [newCurrencyCode, setNewCurrencyCode] = useState<string>("");
  const [newCurrencyRate, setNewCurrencyRate] = useState<string>("");

  // Plafond edit modal
  const [editingPlafond, setEditingPlafond] = useState<boolean>(false);
  const [tempPlafondInput, setTempPlafondInput] = useState<string>("");

  // Transaction form state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState<"topup" | "purchase">("topup");
  const [txDescription, setTxDescription] = useState<string>("");
  const [txType, setTxType] = useState<"topup" | "purchase" | "withdrawal">("topup");
  const [txCurrency, setTxCurrency] = useState<string>("AOA");
  const [txOriginalAmount, setTxOriginalAmount] = useState<string>("");
  const [txChargedWhenWhere, setTxChargedWhenWhere] = useState<string>("");
  
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  const [txDateTime, setTxDateTime] = useState<string>(getCurrentDateTimeLocal());

  const [txReceiptPhoto, setTxReceiptPhoto] = useState<string>("");
  const [txError, setTxError] = useState<string | null>(null);

  // Camera preview modal / receipt zoom modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Transaction edit modal
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [editTxDesc, setEditTxDesc] = useState<string>("");
  const [editTxAmount, setEditTxAmount] = useState<string>("");
  const [editTxCurr, setEditTxCurr] = useState<string>("AOA");
  const [editTxRate, setEditTxRate] = useState<string>("1");
  const [editTxPhoto, setEditTxPhoto] = useState<string>("");

  // Filter & selection for transactions table
  const [tableFilter, setTableFilter] = useState<"all" | "topup" | "purchase" | "withdrawal">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleTxCount, setVisibleTxCount] = useState<number>(10);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [txMenuState, setTxMenuState] = useState<{ id: string; top: number; right: number; openUpward: boolean } | null>(null);

  // Auto-select all transactions on initial load or when new transactions are added
  useEffect(() => {
    if (transactions.length > 0) {
      setSelectedTxIds((prev) => {
        const validPrev = prev.filter((id) => transactions.some((t) => t.id === id));
        if (validPrev.length === 0) {
          return transactions.map((t) => t.id);
        }
        const newIds = transactions.map((t) => t.id).filter((id) => !prev.includes(id));
        return [...validPrev, ...newIds];
      });
    } else {
      setSelectedTxIds([]);
    }
  }, [transactions]);

  const handleToggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllTxs = () => {
    if (selectedTxIds.length === filteredTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredTransactions.map((t) => t.id));
    }
  };

  // Purchase Simulator State
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState<boolean>(false);
  const [simItemName, setSimItemName] = useState<string>("");
  const [simProductUrl, setSimProductUrl] = useState<string>("");
  const [isLinkInputOpen, setIsLinkInputOpen] = useState<boolean>(false);
  const [simCurrency, setSimCurrency] = useState<string>("USD");
  const [simOriginalPrice, setSimOriginalPrice] = useState<string>("");
  const [simCustomExchangeRate, setSimCustomExchangeRate] = useState<string>("920");
  const [simActiveSubTab, setSimActiveSubTab] = useState<"calculator" | "history">("calculator");

  // Saved simulations list & selection state & 3-dots action menu state
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulationItem[]>([]);
  const [selectedSimIds, setSelectedSimIds] = useState<string[]>([]);
  const [simMenuState, setSimMenuState] = useState<{ id: string; top: number; right: number; openUpward: boolean } | null>(null);

  // Auto-select all simulation items on initial load or when new items are added
  useEffect(() => {
    if (savedSimulations.length > 0) {
      setSelectedSimIds((prev) => {
        // Keep existing selections that still exist, plus add any new simulation IDs
        const validPrev = prev.filter((id) => savedSimulations.some((s) => s.id === id));
        if (validPrev.length === 0) {
          return savedSimulations.map((s) => s.id);
        }
        // Add any newly added simulation IDs automatically
        const newIds = savedSimulations.map((s) => s.id).filter((id) => !prev.includes(id));
        return [...validPrev, ...newIds];
      });
    } else {
      setSelectedSimIds([]);
    }
  }, [savedSimulations]);

  const handleToggleSelectSim = (id: string) => {
    setSelectedSimIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllSims = () => {
    if (selectedSimIds.length === savedSimulations.length) {
      setSelectedSimIds([]);
    } else {
      setSelectedSimIds(savedSimulations.map((s) => s.id));
    }
  };

  // Edit simulation modal state
  const [editingSim, setEditingSim] = useState<SavedSimulationItem | null>(null);
  const [editSimName, setEditSimName] = useState<string>("");
  const [editSimCurrency, setEditSimCurrency] = useState<string>("USD");
  const [editSimPrice, setEditSimPrice] = useState<string>("");
  const [editSimRate, setEditSimRate] = useState<string>("");
  const [editSimUrl, setEditSimUrl] = useState<string>("");

  const cameraFileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraEditInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-update default exchange rate in simulator when currency changes
  useEffect(() => {
    if (simCurrency === "AOA") {
      setSimCustomExchangeRate("1");
    } else if (exchangeRates[simCurrency]) {
      setSimCustomExchangeRate(exchangeRates[simCurrency].toString());
    }
  }, [simCurrency, exchangeRates]);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load state from Firestore
  useEffect(() => {
    async function loadCalculatorData() {
      setIsLoading(true);
      try {
        const docRef = doc(db, "settings", "card_calculator");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.plafondAOA === "number") setPlafondAOA(data.plafondAOA);
          if (data.rates && typeof data.rates === "object") {
            setExchangeRates((prev) => ({ ...prev, ...data.rates }));
          }
          if (typeof data.topupFeePercent === "number") setTopupFeePercent(data.topupFeePercent);
          if (typeof data.purchaseFeePercent === "number") setPurchaseFeePercent(data.purchaseFeePercent);
          if (typeof data.vatPercent === "number") setVatPercent(data.vatPercent);
          if (Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          }
          if (Array.isArray(data.savedSimulations)) {
            setSavedSimulations(data.savedSimulations);
          }
        } else {
          const localData = localStorage.getItem("c_store_card_calc");
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed.plafondAOA) setPlafondAOA(parsed.plafondAOA);
            if (parsed.rates) setExchangeRates(parsed.rates);
            if (parsed.topupFeePercent) setTopupFeePercent(parsed.topupFeePercent);
            if (parsed.purchaseFeePercent) setPurchaseFeePercent(parsed.purchaseFeePercent);
            if (parsed.vatPercent) setVatPercent(parsed.vatPercent);
            if (parsed.transactions) setTransactions(parsed.transactions);
            if (parsed.savedSimulations) setSavedSimulations(parsed.savedSimulations);
          }
        }
      } catch (err) {
        console.warn("Error loading card calculator data, using local fallback:", err);
        const localData = localStorage.getItem("c_store_card_calc");
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed.plafondAOA) setPlafondAOA(parsed.plafondAOA);
            if (parsed.rates) setExchangeRates(parsed.rates);
            if (parsed.topupFeePercent) setTopupFeePercent(parsed.topupFeePercent);
            if (parsed.purchaseFeePercent) setPurchaseFeePercent(parsed.purchaseFeePercent);
            if (parsed.vatPercent) setVatPercent(parsed.vatPercent);
            if (parsed.transactions) setTransactions(parsed.transactions);
            if (parsed.savedSimulations) setSavedSimulations(parsed.savedSimulations);
          } catch (e) {
            // Ignore
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCalculatorData();
  }, []);

  // Helper to recursively strip undefined properties for Firestore compatibility
  const sanitizeForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeForFirestore(item));
    }
    if (typeof obj === "object") {
      const clean: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          clean[key] = sanitizeForFirestore(value);
        }
      }
      return clean;
    }
    return obj;
  };

  // Save changes to Firestore & localStorage
  const saveData = async (
    updatedPlafond: number,
    updatedRates: ExchangeRatesMap,
    updatedTransactions: TransactionItem[],
    tFee = topupFeePercent,
    pFee = purchaseFeePercent,
    vPercent = vatPercent,
    updatedSimulations: SavedSimulationItem[] = savedSimulations
  ) => {
    setIsSaving(true);
    const rawPayload = {
      plafondAOA: updatedPlafond ?? 0,
      rates: updatedRates ?? {},
      topupFeePercent: tFee ?? 0,
      purchaseFeePercent: pFee ?? 0,
      vatPercent: vPercent ?? 0,
      transactions: updatedTransactions ?? [],
      savedSimulations: updatedSimulations ?? [],
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("c_store_card_calc", JSON.stringify(rawPayload));

    const firestorePayload = sanitizeForFirestore(rawPayload);

    try {
      await setDoc(doc(db, "settings", "card_calculator"), firestorePayload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/card_calculator");
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency helpers
  const formatAOA = (val: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      maximumFractionDigits: 2,
    }).format(val).replace("AOA", "Kz");
  };

  const formatForeign = (val: number, curr: string) => {
    if (curr === "USD") return `$ ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (curr === "EUR") return `€ ${val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${val.toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
  };

  // Re-calculate balance sequence across all transactions
  const recalculateSequence = (txs: TransactionItem[]): TransactionItem[] => {
    let runningBalance = 0;
    const sorted = [...txs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const updated = sorted.map((tx) => {
      if (tx.type === "topup") {
        runningBalance += tx.amountAOA;
      } else {
        runningBalance -= tx.totalDebitedAOA;
      }
      return {
        ...tx,
        cardBalanceAfterAOA: runningBalance,
      };
    });

    return updated.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Handle Photo Capture / Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "new" | "edit") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === "new") {
          setTxReceiptPhoto(result);
        } else {
          setEditTxPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Update Exchange Rate
  const handleSaveRate = (currency: string, rateVal: number) => {
    if (!currency || rateVal <= 0) return;
    const cleanCurr = currency.toUpperCase().trim();
    const updated = {
      ...exchangeRates,
      [cleanCurr]: rateVal,
    };
    setExchangeRates(updated);
    saveData(plafondAOA, updated, transactions);
    setNotification({
      type: "success",
      message: `Taxa de Câmbio de ${cleanCurr} atualizada para 1 ${cleanCurr} = ${formatAOA(rateVal)}`,
    });
    setNewCurrencyCode("");
    setNewCurrencyRate("");
    setEditingRateCurr(null);
  };

  const handleRemoveRate = (currency: string) => {
    const updated = { ...exchangeRates };
    delete updated[currency];
    setExchangeRates(updated);
    saveData(plafondAOA, updated, transactions);
    setNotification({
      type: "info",
      message: `Moeda ${currency} removida.`,
    });
  };

  // Save Plafond
  const handleSavePlafond = () => {
    const val = parseFloat(tempPlafondInput.replace(/[^0-9.]/g, ""));
    if (isNaN(val) || val < 0) {
      setNotification({ type: "error", message: "Insira um valor de Plafond válido." });
      return;
    }
    setPlafondAOA(val);
    saveData(val, exchangeRates, transactions);
    setEditingPlafond(false);
    setNotification({ type: "success", message: `Plafond do cartão atualizado para ${formatAOA(val)}` });
  };

  // Save Configurable Fee Rates & Plafond
  const handleSaveFeeRates = () => {
    const tVal = parseFloat(tempTopupFee);
    const pVal = parseFloat(tempPurchaseFee);
    const vVal = parseFloat(tempVatPercent);
    const plVal = parseFloat(tempPlafondInput.replace(/[^0-9.]/g, ""));

    if (isNaN(tVal) || isNaN(pVal) || isNaN(vVal) || isNaN(plVal) || tVal < 0 || pVal < 0 || vVal < 0 || plVal < 0) {
      setNotification({ type: "error", message: "Insira valores válidos para o Plafond e Taxas." });
      return;
    }

    setPlafondAOA(plVal);
    setTopupFeePercent(tVal);
    setPurchaseFeePercent(pVal);
    setVatPercent(vVal);

    saveData(plVal, exchangeRates, transactions, tVal, pVal, vVal);
    setEditingFeesModal(false);
    setNotification({
      type: "success",
      message: `Configurações atualizadas com sucesso! Plafond: ${formatAOA(plVal)}.`,
    });
  };

  // Add Transaction Handler
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxError(null);

    const numAmount = parseFloat(txOriginalAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setTxError("Insira um valor numérico válido maior que zero.");
      return;
    }

    let appliedRate = 1;
    if (txCurrency !== "AOA") {
      const existingRate = exchangeRates[txCurrency];
      if (!existingRate || existingRate <= 0) {
        setTxError(
          `CÂMBIO NÃO CONFIGURADO: Não existe taxa de câmbio para "${txCurrency}". Edite ou adicione o câmbio bancário para esta moeda no painel acima antes de prosseguir.`
        );
        return;
      }
      appliedRate = existingRate;
    }

    const currentType = activeFormTab === "topup" ? "topup" : txType;
    const baseAmountAOA = numAmount * appliedRate;

    let feeRate = 0;
    let feeAOA = 0;
    let vatAOA = 0;
    let totalDebitedAOA = 0;

    if (currentType === "topup") {
      feeRate = topupFeePercent / 100;
      feeAOA = baseAmountAOA * feeRate;
      vatAOA = feeAOA * (vatPercent / 100);
      totalDebitedAOA = baseAmountAOA + feeAOA + vatAOA;
    } else {
      feeRate = purchaseFeePercent / 100;
      feeAOA = baseAmountAOA * feeRate;
      vatAOA = feeAOA * (vatPercent / 100);
      totalDebitedAOA = baseAmountAOA + feeAOA + vatAOA;
    }

    let fullDesc = txDescription.trim();
    if (currentType === "topup" && txChargedWhenWhere.trim()) {
      fullDesc = fullDesc ? `${fullDesc} (${txChargedWhenWhere.trim()})` : `Carregamento - ${txChargedWhenWhere.trim()}`;
    }
    if (!fullDesc) {
      fullDesc = currentType === "topup" ? "Carregamento de Cartão Empresarial" : currentType === "withdrawal" ? "Levantamento ATM" : "Compra Online";
    }

    const newTx: TransactionItem = {
      id: "tx_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      type: currentType,
      description: fullDesc,
      currency: txCurrency,
      originalAmount: numAmount,
      exchangeRate: appliedRate,
      amountAOA: baseAmountAOA,
      feeRate,
      feeAOA,
      vatRate: vatPercent / 100,
      vatAOA,
      totalDebitedAOA,
      cardBalanceAfterAOA: 0,
      receiptPhotoUrl: txReceiptPhoto || undefined,
      createdAt: txDateTime ? new Date(txDateTime).toISOString() : new Date().toISOString(),
    };

    const updatedTxs = recalculateSequence([newTx, ...transactions]);
    setTransactions(updatedTxs);
    saveData(plafondAOA, exchangeRates, updatedTxs);

    setTxDescription("");
    setTxOriginalAmount("");
    setTxChargedWhenWhere("");
    setTxReceiptPhoto("");
    setIsNewTxModalOpen(false);
    setNotification({
      type: "success",
      message: `Movimento registado! ${currentType === "topup" ? "Carregamento" : "Transação"} de ${formatForeign(numAmount, txCurrency)} processado com sucesso.`,
    });
  };

  // Edit Existing Transaction Handler
  const handleOpenEditTx = (tx: TransactionItem) => {
    setEditingTx(tx);
    setEditTxDesc(tx.description);
    setEditTxAmount(tx.originalAmount.toString());
    setEditTxCurr(tx.currency);
    setEditTxRate(tx.exchangeRate.toString());
    setEditTxPhoto(tx.receiptPhotoUrl || "");
  };

  const handleSaveEditedTx = () => {
    if (!editingTx) return;

    const numAmount = parseFloat(editTxAmount.replace(/[^0-9.]/g, ""));
    const numRate = parseFloat(editTxRate);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numRate) || numRate <= 0) {
      setNotification({ type: "error", message: "Insira um valor e taxa de câmbio válidos." });
      return;
    }

    const baseAmountAOA = numAmount * numRate;
    const feeRate = editingTx.type === "topup" ? topupFeePercent / 100 : purchaseFeePercent / 100;
    const feeAOA = baseAmountAOA * feeRate;
    const vatAOA = feeAOA * (vatPercent / 100);
    const totalDebitedAOA = baseAmountAOA + feeAOA + vatAOA;

    const updatedTxsList = transactions.map((t) => {
      if (t.id === editingTx.id) {
        return {
          ...t,
          description: editTxDesc.trim() || t.description,
          currency: editTxCurr,
          originalAmount: numAmount,
          exchangeRate: numRate,
          amountAOA: baseAmountAOA,
          feeRate,
          feeAOA,
          vatAOA,
          totalDebitedAOA,
          receiptPhotoUrl: editTxPhoto || undefined,
        };
      }
      return t;
    });

    const recalculated = recalculateSequence(updatedTxsList);
    setTransactions(recalculated);
    saveData(plafondAOA, exchangeRates, recalculated);

    setEditingTx(null);
    setNotification({ type: "success", message: "Movimento atualizado no histórico!" });
  };

  const handleDeleteTransaction = (id: string) => {
    const filtered = transactions.filter((t) => t.id !== id);
    const updated = recalculateSequence(filtered);
    setTransactions(updated);
    saveData(plafondAOA, exchangeRates, updated);
    setNotification({ type: "info", message: "Movimento removido do histórico." });
  };

  // Simulation Handlers
  const handleSaveSimulation = (
    itemName: string,
    currency: string,
    originalPrice: number,
    exchangeRate: number,
    baseAOA: number,
    feeAOA: number,
    vatAOA: number,
    totalCostAOA: number,
    canAfford: boolean,
    shortageOrRemainingAOA: number,
    productUrl?: string
  ) => {
    if (!originalPrice || originalPrice <= 0) {
      setNotification({ type: "error", message: "Introduza um valor válido para a simulação." });
      return;
    }

    const newSim: SavedSimulationItem = {
      id: "sim_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      itemName: itemName.trim() || `Simulação ${originalPrice} ${currency}`,
      currency,
      originalPrice,
      exchangeRate,
      baseAmountAOA: baseAOA,
      feePercent: purchaseFeePercent,
      feeAOA,
      vatPercent: vatPercent,
      vatAOA,
      totalCostAOA,
      cardBalanceAtSimAOA: currentCardBalanceAOA,
      canAfford,
      shortageOrRemainingAOA,
      productUrl: productUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedSims = [newSim, ...savedSimulations];
    setSavedSimulations(updatedSims);
    saveData(plafondAOA, exchangeRates, transactions, topupFeePercent, purchaseFeePercent, vatPercent, updatedSims);

    setSimItemName("");
    setSimProductUrl("");
    setSimOriginalPrice("");

    setNotification({
      type: "success",
      message: `Simulação de "${newSim.itemName}" guardada com sucesso no histórico!`,
    });
  };

  const handleConvertSimToRealTx = (sim: SavedSimulationItem) => {
    if (currentCardBalanceAOA < sim.totalCostAOA) {
      setNotification({
        type: "error",
        message: `Saldo insuficiente no cartão. Necessita de ${formatAOA(sim.totalCostAOA)} mas tem apenas ${formatAOA(currentCardBalanceAOA)}.`,
      });
      return;
    }

    const newTx: TransactionItem = {
      id: "tx_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      type: "purchase",
      description: sim.itemName,
      currency: sim.currency,
      originalAmount: sim.originalPrice,
      exchangeRate: sim.exchangeRate,
      amountAOA: sim.baseAmountAOA,
      feeRate: sim.feePercent / 100,
      feeAOA: sim.feeAOA,
      vatRate: sim.vatPercent / 100,
      vatAOA: sim.vatAOA,
      totalDebitedAOA: sim.totalCostAOA,
      cardBalanceAfterAOA: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedTxs = recalculateSequence([newTx, ...transactions]);
    setTransactions(updatedTxs);
    saveData(plafondAOA, exchangeRates, updatedTxs, topupFeePercent, purchaseFeePercent, vatPercent, savedSimulations);

    setIsSimulatorModalOpen(false);
    setNotification({
      type: "success",
      message: `Simulação "${sim.itemName}" convertida e registada no histórico de compras real!`,
    });
  };

  const handleDeleteSimulation = (simId: string) => {
    const updatedSims = savedSimulations.filter((s) => s.id !== simId);
    setSavedSimulations(updatedSims);
    saveData(plafondAOA, exchangeRates, transactions, topupFeePercent, purchaseFeePercent, vatPercent, updatedSims);

    setNotification({
      type: "info",
      message: "Simulação removida do histórico.",
    });
  };

  // Edit Simulation Handlers
  const handleOpenEditSim = (sim: SavedSimulationItem) => {
    setEditingSim(sim);
    setEditSimName(sim.itemName);
    setEditSimCurrency(sim.currency);
    setEditSimPrice(sim.originalPrice.toString());
    setEditSimRate(sim.exchangeRate.toString());
    setEditSimUrl(sim.productUrl || "");
  };

  const handleSaveEditedSimulation = () => {
    if (!editingSim) return;

    const priceVal = parseFloat(editSimPrice.replace(/[^0-9.]/g, ""));
    const rateVal = parseFloat(editSimRate);

    if (isNaN(priceVal) || priceVal <= 0 || isNaN(rateVal) || rateVal <= 0) {
      setNotification({ type: "error", message: "Insira um preço e taxa de câmbio válidos para a simulação." });
      return;
    }

    const baseAOA = priceVal * rateVal;
    const feeAOA = baseAOA * (purchaseFeePercent / 100);
    const vatAOA = feeAOA * (vatPercent / 100);
    const totalCostAOA = baseAOA + feeAOA + vatAOA;
    const remainingAOA = currentCardBalanceAOA - totalCostAOA;
    const canAfford = remainingAOA >= 0;
    const shortageOrRemainingAOA = canAfford ? remainingAOA : Math.abs(remainingAOA);

    const updatedSims = savedSimulations.map((s) => {
      if (s.id === editingSim.id) {
        return {
          ...s,
          itemName: editSimName.trim() || `Simulação ${priceVal} ${editSimCurrency}`,
          currency: editSimCurrency,
          originalPrice: priceVal,
          exchangeRate: rateVal,
          baseAmountAOA: baseAOA,
          feePercent: purchaseFeePercent,
          feeAOA,
          vatPercent: vatPercent,
          vatAOA,
          totalCostAOA,
          cardBalanceAtSimAOA: currentCardBalanceAOA,
          canAfford,
          shortageOrRemainingAOA,
          productUrl: editSimUrl.trim() || undefined,
        };
      }
      return s;
    });

    setSavedSimulations(updatedSims);
    saveData(plafondAOA, exchangeRates, transactions, topupFeePercent, purchaseFeePercent, vatPercent, updatedSims);
    setEditingSim(null);
    setNotification({
      type: "success",
      message: `Simulação "${editSimName || "editada"}" atualizada com sucesso!`,
    });
  };

  // Aggregates
  const totalLoadedAOA = transactions
    .filter((t) => t.type === "topup")
    .reduce((acc, t) => acc + t.amountAOA, 0);

  const totalLoadedBankDebitAOA = transactions
    .filter((t) => t.type === "topup")
    .reduce((acc, t) => acc + t.totalDebitedAOA, 0);

  const totalPurchasesDebitedAOA = transactions
    .filter((t) => t.type !== "topup")
    .reduce((acc, t) => acc + t.totalDebitedAOA, 0);

  const currentCardBalanceAOA = totalLoadedAOA - totalPurchasesDebitedAOA;

  const totalTopupFeesAOA = transactions
    .filter((t) => t.type === "topup")
    .reduce((acc, t) => acc + t.feeAOA, 0);

  const totalTopupVATAOA = transactions
    .filter((t) => t.type === "topup")
    .reduce((acc, t) => acc + t.vatAOA, 0);

  const totalPurchaseFeesAOA = transactions
    .filter((t) => t.type !== "topup")
    .reduce((acc, t) => acc + t.feeAOA, 0);

  const totalPurchaseVATAOA = transactions
    .filter((t) => t.type !== "topup")
    .reduce((acc, t) => acc + t.vatAOA, 0);

  const totalAllFeesAOA = totalTopupFeesAOA + totalPurchaseFeesAOA;
  const totalAllVATAOA = totalTopupVATAOA + totalPurchaseVATAOA;

  const remainingPlafondAOA = plafondAOA - totalLoadedBankDebitAOA;

  const usdRate = exchangeRates["USD"] || 0;
  const eurRate = exchangeRates["EUR"] || 0;

  const currentCardBalanceUSD = usdRate > 0 ? currentCardBalanceAOA / usdRate : null;
  const currentCardBalanceEUR = eurRate > 0 ? currentCardBalanceAOA / eurRate : null;

  const filteredTransactions = transactions.filter((tx) => {
    if (tableFilter === "topup" && tx.type !== "topup") return false;
    if (tableFilter === "purchase" && tx.type !== "purchase") return false;
    if (tableFilter === "withdrawal" && tx.type !== "withdrawal") return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.currency.toLowerCase().includes(term) ||
        tx.originalAmount.toString().includes(term)
      );
    }
    return true;
  });

  const previewOriginal = parseFloat(txOriginalAmount.replace(/[^0-9.]/g, "")) || 0;
  const previewRate = txCurrency === "AOA" ? 1 : exchangeRates[txCurrency] || 0;
  const previewBaseAOA = previewOriginal * previewRate;
  const previewIsTopup = activeFormTab === "topup";
  const previewFeeRate = previewIsTopup ? topupFeePercent / 100 : purchaseFeePercent / 100;
  const previewFeeAOA = previewBaseAOA * previewFeeRate;
  const previewVatAOA = previewFeeAOA * (vatPercent / 100);
  const previewTotalAOA = previewBaseAOA + previewFeeAOA + previewVatAOA;

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 font-sans rounded-3xl border border-slate-800 shadow-2xl">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 mb-2 transition-colors cursor-pointer"
            >
              ← Voltar ao Painel
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
              <Calculator size={26} />
            </div>
            Calculadora de Saldos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestão inteligente de limites, câmbios editáveis, taxas e IVA em Angola
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {isSaving && (
            <span className="text-xs text-amber-400 flex items-center gap-1.5 animate-pulse bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <RefreshCw size={12} className="animate-spin" /> A guardar...
            </span>
          )}

          {/* GEAR ICON SETTINGS BUTTON FOR PLAFOND, TAXAS AND CAMBIOS */}
          <button
            onClick={() => {
              setTempPlafondInput(plafondAOA.toString());
              setTempTopupFee(topupFeePercent.toString());
              setTempPurchaseFee(purchaseFeePercent.toString());
              setTempVatPercent(vatPercent.toString());
              setEditingFeesModal(true);
            }}
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black p-3 rounded-2xl flex items-center justify-center transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            title="Configurações (Plafond, Taxas e Câmbios)"
          >
            <Settings size={20} className="animate-spin-slow" />
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : notification.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
              : "bg-sky-950/90 border-sky-500/40 text-sky-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : notification.type === "error" ? (
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
            ) : (
              <Info size={18} className="text-sky-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* RECEIPT ZOOM PREVIEW MODAL */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Camera size={16} /> Comprovativo / Talão Digitalizado
              </span>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800">
              <img src={previewReceiptUrl} alt="Comprovativo" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PLAFOND */}
      {editingPlafond && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sliders size={20} className="text-amber-400" /> Configurar Plafond do Cartão
            </h3>
            <p className="text-xs text-slate-400">
              Defina o plafond limite disponibilizado pelo banco em Kwanza (AOA) para o seu cartão.
            </p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Plafond Limite (AOA)</label>
              <input
                type="number"
                value={tempPlafondInput}
                onChange={(e) => setTempPlafondInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-amber-400"
                placeholder="Ex: 5000000"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingPlafond(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlafond}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Guardar Plafond
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURAÇÕES GERAIS (TAXAS, IVA & CÂMBIOS BANCÁRIOS) */}
      {editingFeesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Settings size={22} className="text-amber-400" /> Configurações de Taxas & Câmbios Bancários
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajuste as regras de taxas do banco e gerencie os câmbios das moedas estrangeiras.
                </p>
              </div>
              <button
                onClick={() => setEditingFeesModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* PARTE A: PLAFOND DO CARTÃO */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block border-b border-slate-800/80 pb-2 flex items-center justify-between">
                <span>1. Plafond do Cartão (Limite em AOA)</span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Atual: {formatAOA(plafondAOA)}
                </span>
              </span>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Limite Total do Banco (Kwanza - AOA)
                </label>
                <input
                  type="number"
                  value={tempPlafondInput}
                  onChange={(e) => setTempPlafondInput(e.target.value)}
                  placeholder="Ex: 5000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Valor limite em AOA disponibilizado pelo seu banco para carregamentos do cartão. Este limite renova-se automaticamente no final de cada mês para o valor padrão definido.
                </p>
              </div>
            </div>

            {/* PARTE B: REGRAS DE TAXAS & IVA */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block border-b border-slate-800/80 pb-2">
                2. Percentagens de Taxas Bancárias e IVA
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Taxa Carregamento (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempTopupFee}
                    onChange={(e) => setTempTopupFee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Taxa Compras / ATM (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempPurchaseFee}
                    onChange={(e) => setTempPurchaseFee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Taxa IVA (% s/ Taxas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempVatPercent}
                    onChange={(e) => setTempVatPercent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveFeeRates}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Guardar Plafond & Taxas
                </button>
              </div>
            </div>

            {/* PARTE C: CÂMBIOS BANCÁRIOS DEFINIDOS */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block border-b border-slate-800/80 pb-2">
                3. Câmbios Bancários Registados (1 Moeda = X Kz)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(exchangeRates).map(([curr, rate]) => (
                  <div
                    key={curr}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {curr}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">1 {curr} =</span>
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {formatAOA(Number(rate))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingRateCurr(curr);
                          setEditingRateValue(rate.toString());
                        }}
                        className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                        title={`Editar Câmbio de ${curr}`}
                      >
                        <Edit3 size={14} />
                      </button>

                      {curr !== "USD" && curr !== "EUR" && (
                        <button
                          onClick={() => handleRemoveRate(curr)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Remover Moeda"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADICIONAR NOVA MOEDA DENTRO DA MODAL */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Adicionar Nova Moeda Estrangeira</span>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newCurrencyCode}
                    onChange={(e) => setNewCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="Código (Ex: GBP)"
                    maxLength={4}
                    className="w-full sm:w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs uppercase focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newCurrencyRate}
                    onChange={(e) => setNewCurrencyRate(e.target.value)}
                    placeholder="Valor em Kz (Ex: 1150)"
                    className="w-full sm:w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(newCurrencyRate);
                      if (newCurrencyCode && val > 0) {
                        handleSaveRate(newCurrencyCode, val);
                      } else {
                        setNotification({ type: "error", message: "Preencha a moeda e o valor de câmbio." });
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-md whitespace-nowrap"
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => {
                  handleSaveFeeRates();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Guardar Tudo & Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT EXCHANGE RATE */}
      {editingRateCurr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Edit3 size={20} className="text-amber-400" /> Editar Câmbio Bancário para {editingRateCurr}
            </h3>
            <p className="text-xs text-slate-400">
              Digite a taxa de conversão em Kwanza (1 {editingRateCurr} = X Kz).
            </p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Novo Câmbio em Kwanza (AOA)
              </label>
              <input
                type="number"
                step="any"
                value={editingRateValue}
                onChange={(e) => setEditingRateValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-amber-400"
                placeholder="Ex: 935.5"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingRateCurr(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(editingRateValue);
                  if (val > 0) {
                    handleSaveRate(editingRateCurr, val);
                  } else {
                    setNotification({ type: "error", message: "Insira um valor de câmbio válido." });
                  }
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Atualizar Câmbio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EXISTING TRANSACTION */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Edit3 size={20} className="text-amber-400" /> Editar Movimento Registado
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Moeda</label>
                  <select
                    value={editTxCurr}
                    onChange={(e) => {
                      setEditTxCurr(e.target.value);
                      if (e.target.value === "AOA") setEditTxRate("1");
                      else if (exchangeRates[e.target.value]) setEditTxRate(exchangeRates[e.target.value].toString());
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-xs"
                  >
                    <option value="AOA">AOA (Kz)</option>
                    {Object.keys(exchangeRates).map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Valor Original</label>
                  <input
                    type="number"
                    step="any"
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Câmbio Aplicado (Kz)</label>
                <input
                  type="number"
                  step="any"
                  value={editTxRate}
                  onChange={(e) => setEditTxRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm"
                />
              </div>

              {/* CAMERA / RECEIPT PHOTO IN EDIT MODAL */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                  <Camera size={14} className="text-amber-400" /> Foto do Comprovativo / Talão
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={cameraEditInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoUpload(e, "edit")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraEditInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Camera size={14} /> Capturar / Carregar Foto
                  </button>
                  {editTxPhoto && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Foto Anexada
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditedTx}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECÇÃO 1: RESUMO DE SALDOS & VIBRANT QUADRANTS (ATTRACTIVE GRADIENT DESIGN) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <CreditCard size={15} className="text-amber-400" /> 1. Painel de Saldos e Limites do Cartão
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Valores em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* QUADRANTE 1: SALDO DISPONÍVEL NO CARTÃO (EMERALD MINT GLOW) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/40 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl transition-all hover:scale-[1.01] hover:border-emerald-400 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                Saldo Atual no Cartão
              </span>
              <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight drop-shadow">
              {formatAOA(currentCardBalanceAOA)}
            </div>

            {/* CONVERSÕES EQUIVALENTES PARA TODAS AS MOEDAS REGISTADAS NO SISTEMA */}
            <div className="mt-4 pt-3 border-t border-emerald-500/20 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 block">
                Equivalente em Câmbio Definido
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(exchangeRates).map(([curr, rate]) => {
                  const numRate = Number(rate) || 0;
                  const equiv = numRate > 0 ? currentCardBalanceAOA / numRate : null;

                  let formattedVal = "Sem Câmbio";
                  if (equiv !== null) {
                    formattedVal = equiv.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                  }

                  let badgeStyle = "bg-teal-500/20 border-teal-500/40 text-teal-200";
                  let icon = <Coins size={12} className="text-teal-400" />;

                  if (curr === "USD") {
                    badgeStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-200";
                    icon = <DollarSign size={12} className="text-emerald-400" />;
                  } else if (curr === "EUR") {
                    badgeStyle = "bg-indigo-500/20 border-indigo-500/40 text-indigo-200";
                    icon = <Euro size={12} className="text-indigo-400" />;
                  } else if (curr === "GBP") {
                    badgeStyle = "bg-purple-500/20 border-purple-500/40 text-purple-200";
                    icon = <Coins size={12} className="text-purple-400" />;
                  } else if (curr === "BRL") {
                    badgeStyle = "bg-amber-500/20 border-amber-500/40 text-amber-200";
                    icon = <Coins size={12} className="text-amber-400" />;
                  } else if (curr === "ZAR") {
                    badgeStyle = "bg-sky-500/20 border-sky-500/40 text-sky-200";
                    icon = <Coins size={12} className="text-sky-400" />;
                  }

                  return (
                    <span
                      key={curr}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm ${badgeStyle}`}
                      title={`Taxa de Câmbio Registada: 1 ${curr} = ${numRate} Kz`}
                    >
                      {icon}
                      <span>{curr} {formattedVal}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUADRANTE 2: PLAFOND & UTILIZAÇÃO (GOLDEN AMBER GLOW) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/80 via-slate-900 to-yellow-950/40 border border-amber-500/40 rounded-3xl p-5 shadow-2xl transition-all hover:scale-[1.01] hover:border-amber-400 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Plafond Disponível
              </span>
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
                <Building2 size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight drop-shadow">
              {formatAOA(remainingPlafondAOA)}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                <span>Plafond Utilizado:</span>
                <span className="text-white font-bold">{formatAOA(totalLoadedBankDebitAOA)}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700/80">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (totalLoadedBankDebitAOA / (plafondAOA || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* QUADRANTE 3: TOTAL TAXAS BANCÁRIAS (INDIGO VIOLET GLOW) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/40 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl transition-all hover:scale-[1.01] hover:border-indigo-400 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                Total Taxas ({topupFeePercent}% / {purchaseFeePercent}%)
              </span>
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-400 text-slate-950 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Percent size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300 tracking-tight drop-shadow">
              {formatAOA(totalAllFeesAOA)}
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-500/20 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Carregamento ({topupFeePercent}%):</span>
                <span className="font-bold text-white">{formatAOA(totalTopupFeesAOA)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Compras / ATM ({purchaseFeePercent}%):</span>
                <span className="font-bold text-white">{formatAOA(totalPurchaseFeesAOA)}</span>
              </div>
            </div>
          </div>

          {/* QUADRANTE 4: TOTAL IVA (ROSE CRIMSON GLOW) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-950/80 via-slate-900 to-pink-950/40 border border-rose-500/40 rounded-3xl p-5 shadow-2xl transition-all hover:scale-[1.01] hover:border-rose-400 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                Total IVA ({vatPercent}% s/ Taxas)
              </span>
              <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-pink-400 text-slate-950 rounded-2xl shadow-lg shadow-rose-500/20">
                <Receipt size={18} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 tracking-tight drop-shadow">
              {formatAOA(totalAllVATAOA)}
            </div>

            <div className="mt-4 pt-3 border-t border-rose-500/20 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>IVA s/ Carregamentos:</span>
                <span className="font-bold text-white">{formatAOA(totalTopupVATAOA)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>IVA s/ Compras:</span>
                <span className="font-bold text-white">{formatAOA(totalPurchaseVATAOA)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECÇÃO 2: BOTÕES E MODAIS DE MOVIMENTOS E SIMULADOR DE COMPRAS */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Sliders size={18} className="text-amber-400" /> 2. Operações e Simulação de Compras
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Registe carregamentos e compras reais ou faça uma simulação prévia para saber exatamente quanto vai gastar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setTxDateTime(getCurrentDateTimeLocal());
              setTxError(null);
              setIsNewTxModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-amber-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} className="stroke-[3]" />
            <span>+ Novo Registo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSimulatorModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Sparkles size={18} className="stroke-[2.5]" />
            <span>🔮 Simulador de Compras</span>
          </button>
        </div>
      </section>

      {/* MODAL POPUP: NOVO REGISTO (+ NOVO REGISTO) */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus size={20} className="text-amber-400" /> Novo Registo no Cartão
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preencha os dados do movimento a registar no cartão.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTxModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* MENSAGEM DE ERRO/VALIDAÇÃO */}
            {txError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-start gap-3 shadow-lg">
                <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-rose-300">Operação Bloqueada</span>
                  <p className="leading-relaxed text-[11px]">{txError}</p>
                </div>
              </div>
            )}

            {/* FORMULÁRIO DINÂMICO */}
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                  Tipo de Movimento
                </label>
                <select
                  value={activeFormTab}
                  onChange={(e) => {
                    const val = e.target.value as "topup" | "purchase";
                    setActiveFormTab(val);
                    setTxType(val);
                    if (val === "topup") setTxCurrency("AOA");
                    setTxError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="topup">💳 Carregamento de Cartão (Top-up)</option>
                  <option value="purchase">🛒 Compra em Site / Loja / ATM</option>
                </select>
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                  Descrição / Referência
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder={
                    activeFormTab === "topup"
                      ? "Ex: Carregamento BFA Nº 458"
                      : "Ex: Compra Amazon / Shein / Voo"
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* MOEDA E VALOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Moeda da Operação
                  </label>
                  <select
                    value={txCurrency}
                    onChange={(e) => {
                      setTxCurrency(e.target.value);
                      setTxError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {activeFormTab === "topup" ? (
                      <option value="AOA">Kwanza (AOA)</option>
                    ) : (
                      <>
                        <option value="AOA">Kwanza (AOA)</option>
                        {Object.keys(exchangeRates).map((curr) => (
                          <option key={curr} value={curr}>
                            {curr} ({formatAOA(exchangeRates[curr])})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Valor na Moeda ({txCurrency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={txOriginalAmount}
                    onChange={(e) => {
                      setTxOriginalAmount(e.target.value);
                      setTxError(null);
                    }}
                    placeholder="Ex: 100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* DETALHES DE ONDE/COMO FOI CARREGADO (SE FOR CARREGAMENTO) */}
              {activeFormTab === "topup" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Quando / Como Foi Carregado (Origem ou Obs)
                  </label>
                  <input
                    type="text"
                    value={txChargedWhenWhere}
                    onChange={(e) => setTxChargedWhenWhere(e.target.value)}
                    placeholder="Ex: Carregado via BFA Net / Conta Empresarial Nº 882"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* DATA E HORA DO REGISTO */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                  Data e Hora da Operação
                </label>
                <input
                  type="datetime-local"
                  value={txDateTime}
                  onChange={(e) => setTxDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                />
              </div>

              {/* SIMULAÇÃO EM TEMPO REAL ANTES DE GUARDAR */}
              {previewOriginal > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Sparkles size={13} /> Resumo Calculado da Operação
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Base em Kwanza</span>
                      <span className="font-black text-white">{formatAOA(previewBaseAOA)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Taxa ({previewIsTopup ? `${topupFeePercent}%` : `${purchaseFeePercent}%`})
                      </span>
                      <span className="font-black text-amber-400">{formatAOA(previewFeeAOA)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">IVA ({vatPercent}%)</span>
                      <span className="font-black text-rose-400">{formatAOA(previewVatAOA)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Total Debitado</span>
                      <span className="font-black text-emerald-400">{formatAOA(previewTotalAOA)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTÕES DE AÇÃO */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-xl ${
                    activeFormTab === "topup"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                  }`}
                >
                  <Plus size={16} />
                  {activeFormTab === "topup" ? "Registar Carregamento" : "Registar Compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECÇÃO 3: HISTÓRICO E EXTRATO DE MOVIMENTOS (MÁXIMO 10 REGISTOS COM VER MAIS) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Receipt size={16} className="text-amber-400" /> 3. Extrato Sequencial e Histórico de Movimentos ({filteredTransactions.length})
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Consulte os movimentos com descriminação do valor carregado, taxa (%) e IVA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold w-full sm:w-auto justify-center">
              <button
                onClick={() => setTableFilter("all")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  tableFilter === "all" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTableFilter("topup")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  tableFilter === "topup" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                Carregamentos
              </button>
              <button
                onClick={() => setTableFilter("purchase")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  tableFilter === "purchase" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                Compras
              </button>
            </div>
          </div>
        </div>

        {/* BANNER DE RESUMO DOS MOVIMENTOS MARCADOS */}
        {(() => {
          const selectedTxs = filteredTransactions.filter((t) => selectedTxIds.includes(t.id));
          const totalBaseAOA = selectedTxs.reduce((acc, t) => acc + (t.amountAOA || 0), 0);
          const totalFeeAOA = selectedTxs.reduce((acc, t) => acc + (t.feeAOA || 0), 0);
          const totalVatAOA = selectedTxs.reduce((acc, t) => acc + (t.vatAOA || 0), 0);
          const totalDebitedAOA = selectedTxs.reduce((acc, t) => acc + (t.totalDebitedAOA || 0), 0);
          const isAllSelected = filteredTransactions.length > 0 && selectedTxIds.length === filteredTransactions.length;

          return (
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="p-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                      Resumo dos Movimentos Marcados
                    </span>
                    <span className="text-[11px] text-slate-400">
                      <strong>{selectedTxs.length}</strong> de <strong>{filteredTransactions.length}</strong> {filteredTransactions.length === 1 ? "movimento marcado" : "movimentos marcados"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllTxs}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isAllSelected
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    {isAllSelected ? "Desmarcar Todos" : "Marcar Todos"}
                  </button>
                </div>
              </div>

              {/* DETALHAMENTO DE TAXAS, IVA E MONTANTES DOS MOVIMENTOS MARCADOS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                    Montante Base
                  </span>
                  <span className="text-xs font-black text-white">
                    {formatAOA(totalBaseAOA)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900/80 border border-amber-500/20 rounded-xl">
                  <span className="text-[10px] text-amber-400/80 font-bold uppercase block mb-0.5">
                    Total Taxas Gastas
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {formatAOA(totalFeeAOA)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900/80 border border-rose-500/20 rounded-xl">
                  <span className="text-[10px] text-rose-400/80 font-bold uppercase block mb-0.5">
                    Total IVA Gasto
                  </span>
                  <span className="text-xs font-black text-rose-300">
                    {formatAOA(totalVatAOA)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900/80 border border-emerald-500/20 rounded-xl">
                  <span className="text-[10px] text-emerald-400/80 font-bold uppercase block mb-0.5">
                    Total Debitado
                  </span>
                  <span className="text-xs font-black text-emerald-300">
                    {formatAOA(totalDebitedAOA)}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TABELA FORMATADA COM SELEÇÃO E MENU DE AÇÕES */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-300 bg-slate-950/60">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && selectedTxIds.length === filteredTransactions.length}
                    onChange={handleToggleSelectAllTxs}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer accent-amber-500"
                    title={selectedTxIds.length === filteredTransactions.length ? "Desmarcar todos" : "Marcar todos"}
                  />
                </th>
                <th className="py-3 px-3">Data / Hora</th>
                <th className="py-3 px-3">Movimento / Descrição</th>
                <th className="py-3 px-3">Valor Orig.</th>
                <th className="py-3 px-3 text-slate-100">Valor Carregado / Operação (AOA)</th>
                <th className="py-3 px-3 text-amber-300">Valor da Taxa (% & Kz)</th>
                <th className="py-3 px-3 text-rose-300">Valor do IVA (% & Kz)</th>
                <th className="py-3 px-3 text-amber-300">Total Debitado</th>
                <th className="py-3 px-3 text-emerald-300">Saldo Resultante</th>
                <th className="py-3 px-3 text-center">Talão</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    Nenhum movimento registado no histórico com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, visibleTxCount).map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isSelected ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-slate-800/60 opacity-60"
                      }`}
                    >
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectTx(tx.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer accent-amber-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString("pt-AO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        <span>{tx.description}</span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-200 whitespace-nowrap">
                        {formatForeign(tx.originalAmount, tx.currency)}
                        {tx.currency !== "AOA" && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Câmbio: {tx.exchangeRate} Kz
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-100 whitespace-nowrap">
                        {formatAOA(tx.amountAOA)}
                      </td>

                      <td className="py-3 px-3 font-bold text-amber-300 whitespace-nowrap">
                        <span>{formatAOA(tx.feeAOA)}</span>
                        <span className="text-[10px] text-amber-400/80 block font-normal">
                          ({(tx.feeRate * 100).toFixed(1)}% Taxa)
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-rose-300 whitespace-nowrap">
                        <span>{formatAOA(tx.vatAOA)}</span>
                        <span className="text-[10px] text-rose-400/80 block font-normal">
                          ({((tx.vatRate || 0.14) * 100).toFixed(0)}% IVA)
                        </span>
                      </td>

                      <td className="py-3 px-3 font-black text-amber-300 whitespace-nowrap">
                        {formatAOA(tx.totalDebitedAOA)}
                      </td>

                      <td className="py-3 px-3 font-black text-emerald-300 bg-slate-950/60 whitespace-nowrap">
                        {formatAOA(tx.cardBalanceAfterAOA)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {tx.receiptPhotoUrl ? (
                          <button
                            onClick={() => setPreviewReceiptUrl(tx.receiptPhotoUrl || null)}
                            className="p-1 hover:bg-slate-700 rounded-lg transition text-amber-400 cursor-pointer"
                            title="Ver Foto do Talão"
                          >
                            <ImageIcon size={16} />
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (txMenuState?.id === tx.id) {
                                setTxMenuState(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const openUpward = (window.innerHeight - rect.bottom) < 220;
                                setTxMenuState({
                                  id: tx.id,
                                  top: rect.top,
                                  right: window.innerWidth - rect.right,
                                  openUpward,
                                });
                              }
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center"
                            title="Mais opções do movimento"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {txMenuState?.id === tx.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[90]"
                                onClick={() => setTxMenuState(null)}
                              />
                              <div
                                className="fixed z-[100] w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 divide-y divide-slate-800 text-left"
                                style={{
                                  right: `${Math.max(12, txMenuState.right)}px`,
                                  ...(txMenuState.openUpward
                                    ? { bottom: `${window.innerHeight - txMenuState.top + 6}px` }
                                    : { top: `${txMenuState.top + 32}px` }),
                                }}
                              >
                                <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  Opções do Movimento
                                </div>
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleToggleSelectTx(tx.id);
                                      setTxMenuState(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <FileText size={14} className="text-amber-400 shrink-0" />
                                    <span>{isSelected ? "Desmarcar Movimento" : "Marcar Movimento"}</span>
                                  </button>

                                  {tx.receiptPhotoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTxMenuState(null);
                                        setPreviewReceiptUrl(tx.receiptPhotoUrl || null);
                                      }}
                                      className="w-full px-3.5 py-2 hover:bg-slate-800 text-indigo-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                    >
                                      <ImageIcon size={14} className="text-indigo-400 shrink-0" />
                                      <span>Ver Talão / Foto</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTxMenuState(null);
                                      handleOpenEditTx(tx);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <Edit3 size={14} className="text-slate-400 shrink-0" />
                                    <span>Editar Movimento</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTxMenuState(null);
                                      handleDeleteTransaction(tx.id);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <Trash2 size={14} className="text-rose-400 shrink-0" />
                                    <span>Eliminar Movimento</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* BOTÃO E CONTROLO "VER MAIS" REGISTOS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <span>
              A apresentar <strong className="text-white">{Math.min(visibleTxCount, filteredTransactions.length)}</strong> de{" "}
              <strong className="text-white">{filteredTransactions.length}</strong> registos no histórico
            </span>
          </div>

          <div className="flex items-center gap-2">
            {filteredTransactions.length > visibleTxCount && (
              <>
                <button
                  type="button"
                  onClick={() => setVisibleTxCount((prev) => prev + 10)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Ver Mais 10 Movimentos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibleTxCount(filteredTransactions.length)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Ver Todos ({filteredTransactions.length})
                </button>
              </>
            )}

            {visibleTxCount > 10 && (
              <button
                type="button"
                onClick={() => setVisibleTxCount(10)}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Mostrar Apenas 10
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MODAL POPUP: SIMULADOR DE COMPRAS (🔮 SIMULADOR DE COMPRAS) */}
      {isSimulatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-6xl xl:max-w-7xl shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Sparkles size={22} className="text-emerald-400" /> Simulador Inteligente de Compras
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Simule livremente qualquer artigo em qualquer moeda. A simulação é um cálculo estimativo independente que não consome saldo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* BARRA DE NAVEGAÇÃO DE SUB-ABAS (NOVA SIMULAÇÃO vs HISTÓRICO GUARDADO) */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setSimActiveSubTab("calculator")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  simActiveSubTab === "calculator"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md"
                    : "text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
                }`}
              >
                <Calculator size={16} />
                <span>🧮 Nova Simulação</span>
              </button>

              <button
                type="button"
                onClick={() => setSimActiveSubTab("history")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  simActiveSubTab === "history"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md"
                    : "text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
                }`}
              >
                <FileText size={16} />
                <span>📜 Histórico de Simulações ({savedSimulations.length})</span>
              </button>
            </div>

            {/* CONTEÚDO DA ABA: CALCULADORA / SIMULAÇÃO ATIVA */}
            {simActiveSubTab === "calculator" && (() => {
              const priceVal = parseFloat(simOriginalPrice.replace(/[^0-9.]/g, "")) || 0;
              const rateVal = simCurrency === "AOA" ? 1 : (exchangeRates[simCurrency] || 1);
              const baseAOA = priceVal * rateVal;
              const feeAOA = baseAOA * (purchaseFeePercent / 100);
              const vatAOA = feeAOA * (vatPercent / 100);
              const totalCostAOA = baseAOA + feeAOA + vatAOA;
              const remainingAOA = currentCardBalanceAOA - totalCostAOA;
              const canAfford = remainingAOA >= 0;
              const shortageAOA = canAfford ? 0 : Math.abs(remainingAOA);

              return (
                <div className="space-y-5">
                  {/* INPUTS DE SIMULAÇÃO */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                        Nome / Descrição do Artigo
                      </label>
                      <input
                        type="text"
                        value={simItemName}
                        onChange={(e) => setSimItemName(e.target.value)}
                        placeholder="Ex: Tênis Nike 250$ / iPhone 15 / Licença de Software"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                        Moeda do Artigo
                      </label>
                      <select
                        value={simCurrency}
                        onChange={(e) => setSimCurrency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer h-[42px]"
                      >
                        <option value="AOA">AOA (Kz - Kwanza)</option>
                        {Object.entries(exchangeRates).map(([curr, rate]) => {
                          const numRate = Number(rate) || 0;
                          return (
                            <option key={curr} value={curr}>
                              {curr} ({formatAOA(numRate)})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                        Preço ({simCurrency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={simOriginalPrice}
                        onChange={(e) => setSimOriginalPrice(e.target.value)}
                        placeholder="Ex: 250"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-emerald-300 font-black text-xs sm:text-sm focus:outline-none focus:border-emerald-400 h-[42px]"
                      />
                    </div>

                    {!isLinkInputOpen && !simProductUrl ? (
                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={() => setIsLinkInputOpen(true)}
                          className="w-full h-[42px] px-3 bg-slate-950 hover:bg-slate-900 border border-dashed border-indigo-500/40 hover:border-indigo-400 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <LinkIcon size={14} className="text-indigo-400 shrink-0" />
                          <span className="truncate">🔗 Link do Produto</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-end space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1">
                            <LinkIcon size={12} className="text-indigo-400" />
                            <span>Link do Produto</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setSimProductUrl("");
                              setIsLinkInputOpen(false);
                            }}
                            className="text-[10px] text-slate-400 hover:text-rose-300 transition cursor-pointer font-semibold"
                          >
                            Limpar
                          </button>
                        </div>
                        <input
                          type="url"
                          value={simProductUrl}
                          onChange={(e) => setSimProductUrl(e.target.value)}
                          placeholder="https://exemplo.com/produto"
                          className="w-full h-[42px] bg-slate-950 border border-indigo-500/40 focus:border-indigo-400 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* PAINEL DE CÁLCULO DE INTELIGÊNCIA */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Sparkles size={14} /> Decomposição Inteligente do Custo
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Preço Convertido</span>
                        <span className="font-bold text-white text-xs block truncate mt-0.5">{formatAOA(baseAOA)}</span>
                        <span className="text-[9px] text-slate-400">{formatForeign(priceVal, simCurrency)}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">Taxa ({purchaseFeePercent}%)</span>
                        <span className="font-bold text-amber-300 text-xs block truncate mt-0.5">{formatAOA(feeAOA)}</span>
                        <span className="text-[9px] text-slate-400">Taxa Bancária</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-rose-400 block">IVA ({vatPercent}%)</span>
                        <span className="font-bold text-rose-300 text-xs block truncate mt-0.5">{formatAOA(vatAOA)}</span>
                        <span className="text-[9px] text-slate-400">s/ Taxa Bancária</span>
                      </div>

                      <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-300 font-bold block">Custo Total Previsto</span>
                        <span className="font-black text-emerald-300 text-sm block truncate mt-0.5">{formatAOA(totalCostAOA)}</span>
                        <span className="text-[9px] text-emerald-400/80">Débito Total</span>
                      </div>
                    </div>

                    {/* QUADRO DE DIAGNÓSTICO DO SALDO */}
                    {priceVal > 0 && (
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          canAfford
                            ? "bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/40 border-emerald-500/50 text-emerald-200"
                            : "bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {canAfford ? (
                            <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert size={22} className="text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1.5 w-full">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className="font-black text-sm uppercase tracking-wide">
                                {canAfford ? "🟢 Saldo Disponível Suficiente!" : "🟡 Análise Estimativa do Saldo Atual"}
                              </span>
                              <span className="text-xs font-semibold opacity-90">
                                Saldo Atual no Cartão: <strong>{formatAOA(currentCardBalanceAOA)}</strong>
                              </span>
                            </div>

                            {canAfford ? (
                              <p className="text-xs leading-relaxed opacity-95">
                                Esta compra de <strong>{formatForeign(priceVal, simCurrency)}</strong> consumirá um custo total de{" "}
                                <strong>{formatAOA(totalCostAOA)}</strong> do seu cartão. Ficará com um saldo residual estimado de{" "}
                                <strong className="text-emerald-300 text-sm">{formatAOA(remainingAOA)}</strong>.
                              </p>
                            ) : (
                              <div className="space-y-1 text-xs">
                                <p className="leading-relaxed opacity-95">
                                  A compra pretendida requer <strong>{formatAOA(totalCostAOA)}</strong>. O seu saldo atual é de <strong>{formatAOA(currentCardBalanceAOA)}</strong>.
                                </p>
                                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-300 font-bold flex items-center justify-between flex-wrap gap-2">
                                  <span>Déficit Estimado para esta compra:</span>
                                  <span className="text-sm font-black text-amber-200">
                                    {formatAOA(shortageAOA)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 italic pt-0.5">
                                  💡 <strong>Nota:</strong> Pode guardar esta simulação para consultar mais tarde. O saldo apenas será exigido se clicar em "Converter em Registo de Compra Real".
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTOES DE AÇÃO */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveSimulation(
                          simItemName,
                          simCurrency,
                          priceVal,
                          rateVal,
                          baseAOA,
                          feeAOA,
                          vatAOA,
                          totalCostAOA,
                          canAfford,
                          canAfford ? remainingAOA : shortageAOA,
                          simProductUrl
                        )
                      }
                      disabled={priceVal <= 0}
                      className="w-full sm:w-auto px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40"
                    >
                      <FileText size={16} className="text-amber-400" />
                      <span>💾 Guardar na Lista de Simulações (Livre)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleConvertSimToRealTx({
                          id: "temp",
                          itemName: simItemName || `Compra ${priceVal} ${simCurrency}`,
                          currency: simCurrency,
                          originalPrice: priceVal,
                          exchangeRate: rateVal,
                          baseAmountAOA: baseAOA,
                          feePercent: purchaseFeePercent,
                          feeAOA,
                          vatPercent,
                          vatAOA,
                          totalCostAOA,
                          cardBalanceAtSimAOA: currentCardBalanceAOA,
                          canAfford,
                          shortageOrRemainingAOA: canAfford ? remainingAOA : shortageAOA,
                          createdAt: new Date().toISOString(),
                        })
                      }
                      disabled={priceVal <= 0 || !canAfford}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={16} />
                      <span>⚡ Registar Compra Real</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* CONTEÚDO DA ABA: HISTÓRICO DE SIMULAÇÕES GUARDADAS (REFINADO EM TABELA HORIZONTAL) */}
            {simActiveSubTab === "history" && (
              <div className="space-y-4">
                {savedSimulations.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-3">
                    <Sparkles size={38} className="mx-auto text-amber-400/60" />
                    <p className="text-sm text-slate-300 font-bold">
                      Nenhuma simulação guardada no histórico.
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Utilize o separador <strong>"🧮 Nova Simulação"</strong> para simular artigos em qualquer moeda e guardá-los aqui para análise prévia ou conversão em compras reais.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* BANNER DE RESUMO DO HISTÓRICO COM FILTRO DE MARCAÇÃO */}
                    {(() => {
                      const selectedSims = savedSimulations.filter((s) => selectedSimIds.includes(s.id));
                      const totalSelectedCostAOA = selectedSims.reduce((acc, s) => acc + (s.totalCostAOA || 0), 0);
                      const isAllSelected = savedSimulations.length > 0 && selectedSimIds.length === savedSimulations.length;

                      return (
                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
                                <FileText size={16} />
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                                  Histórico de Simulações Guardadas
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  <strong>{selectedSimIds.length}</strong> de <strong>{savedSimulations.length}</strong> {savedSimulations.length === 1 ? "artigo marcado" : "artigos marcados"}
                                </span>
                              </div>
                            </div>

                            {/* Botões rápidos de seleção */}
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                type="button"
                                onClick={handleToggleSelectAllSims}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                  isAllSelected
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                                }`}
                              >
                                {isAllSelected ? "Desmarcar" : "Marcar Todos"}
                              </button>
                            </div>
                          </div>

                          <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 flex items-center justify-between sm:justify-end gap-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">
                              Soma Prevista ({selectedSimIds.length} {selectedSimIds.length === 1 ? "selecionado" : "selecionados"}):
                            </span>
                            <span className="text-sm font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                              {formatAOA(totalSelectedCostAOA)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* TABELA REFINADA E HORIZONTAL DE SIMULAÇÕES COM SELEÇÃO */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl max-h-[60vh] overflow-y-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-3 text-center w-10">
                              <input
                                type="checkbox"
                                checked={savedSimulations.length > 0 && selectedSimIds.length === savedSimulations.length}
                                onChange={handleToggleSelectAllSims}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer accent-amber-500"
                                title={selectedSimIds.length === savedSimulations.length ? "Desmarcar todos" : "Marcar todos"}
                              />
                            </th>
                            <th className="py-3 px-4">Artigo & Data</th>
                            <th className="py-3 px-4">Preço Original</th>
                            <th className="py-3 px-4">Valor Convertido</th>
                            <th className="py-3 px-4">Taxas + IVA</th>
                            <th className="py-3 px-4">Custo Total Previsto</th>
                            <th className="py-3 px-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {savedSimulations.map((sim) => {
                            const isSelected = selectedSimIds.includes(sim.id);
                            return (
                              <tr
                                key={sim.id}
                                className={`transition-colors group ${
                                  isSelected ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-slate-900/60 opacity-60"
                                }`}
                              >
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectSim(sim.id)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950 cursor-pointer accent-amber-500"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                                    {sim.itemName}
                                  </div>
                                  {sim.productUrl && (
                                    <a
                                      href={sim.productUrl.startsWith("http") ? sim.productUrl : `https://${sim.productUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer shrink-0"
                                      title="Abrir página do produto"
                                    >
                                      <ExternalLink size={11} />
                                      <span>Ver</span>
                                    </a>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(sim.createdAt).toLocaleDateString("pt-AO", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-white">
                                  {formatForeign(sim.originalPrice, sim.currency)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Câmbio: {formatAOA(sim.exchangeRate)}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-amber-300">
                                  {formatAOA((sim.feeAOA || 0) + (sim.vatAOA || 0))}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {sim.feePercent || purchaseFeePercent}% + {sim.vatPercent || vatPercent}% IVA
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-black text-sm text-emerald-300">
                                  {formatAOA(sim.totalCostAOA)}
                                </div>
                                <div className="text-[10px] text-emerald-400/70">Débito no Cartão</div>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (simMenuState?.id === sim.id) {
                                        setSimMenuState(null);
                                      } else {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const openUpward = (window.innerHeight - rect.bottom) < 220;
                                        setSimMenuState({
                                          id: sim.id,
                                          top: rect.top,
                                          right: window.innerWidth - rect.right,
                                          openUpward,
                                        });
                                      }
                                    }}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center"
                                    title="Mais ações para esta simulação"
                                  >
                                    <MoreVertical size={16} />
                                  </button>

                                  {simMenuState?.id === sim.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-[90]"
                                        onClick={() => setSimMenuState(null)}
                                      />
                                      <div
                                        className="fixed z-[100] w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 divide-y divide-slate-800 text-left"
                                        style={{
                                          right: `${Math.max(12, simMenuState.right)}px`,
                                          ...(simMenuState.openUpward
                                            ? { bottom: `${window.innerHeight - simMenuState.top + 6}px` }
                                            : { top: `${simMenuState.top + 36}px` }),
                                        }}
                                      >
                                        <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                          Opções da Simulação
                                        </div>
                                        <div className="py-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleToggleSelectSim(sim.id);
                                              setSimMenuState(null);
                                            }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                          >
                                            <FileText size={14} className="text-amber-400 shrink-0" />
                                            <span>{isSelected ? "Desmarcar Simulação" : "Marcar Simulação"}</span>
                                          </button>
                                          {sim.productUrl && (
                                            <a
                                              href={sim.productUrl.startsWith("http") ? sim.productUrl : `https://${sim.productUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={() => setSimMenuState(null)}
                                              className="w-full px-3.5 py-2 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-2.5 transition"
                                            >
                                              <ExternalLink size={14} className="text-indigo-400 shrink-0" />
                                              <span>Ver Página do Produto</span>
                                            </a>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSimMenuState(null);
                                              handleOpenEditSim(sim);
                                            }}
                                            className="w-full px-3.5 py-2 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                          >
                                            <Edit3 size={14} className="text-amber-400 shrink-0" />
                                            <span>Editar Simulação</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSimMenuState(null);
                                              handleConvertSimToRealTx(sim);
                                            }}
                                            className="w-full px-3.5 py-2 hover:bg-emerald-950/60 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                          >
                                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                            <span>Registar Compra Real</span>
                                          </button>
                                        </div>

                                        <div className="py-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSimMenuState(null);
                                              handleDeleteSimulation(sim.id);
                                            }}
                                            className="w-full px-3.5 py-2 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer"
                                          >
                                            <Trash2 size={14} className="text-rose-400 shrink-0" />
                                            <span>Eliminar Simulação</span>
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE SIMULAÇÃO */}
      {editingSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Editar Simulação</h3>
                  <p className="text-[11px] text-slate-400">Atualize os dados e o link da simulação guardada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSim(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                  Nome / Descrição do Artigo
                </label>
                <input
                  type="text"
                  value={editSimName}
                  onChange={(e) => setEditSimName(e.target.value)}
                  placeholder="Ex: Tênis Nike 250$"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Moeda
                  </label>
                  <select
                    value={editSimCurrency}
                    onChange={(e) => {
                      const curr = e.target.value;
                      setEditSimCurrency(curr);
                      if (curr === "AOA") setEditSimRate("1");
                      else if (exchangeRates[curr]) setEditSimRate(exchangeRates[curr].toString());
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AOA">AOA (Kz)</option>
                    {Object.keys(exchangeRates)
                      .filter((c) => !["USD", "EUR", "AOA"].includes(c))
                      .map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Preço Original
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSimPrice}
                    onChange={(e) => setEditSimPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                  Taxa de Câmbio (1 {editSimCurrency} em Kz)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editSimRate}
                  onChange={(e) => setEditSimRate(e.target.value)}
                  disabled={editSimCurrency === "AOA"}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                  <LinkIcon size={13} className="text-indigo-400" />
                  <span>Link / URL do Produto (Opcional)</span>
                </label>
                <input
                  type="url"
                  value={editSimUrl}
                  onChange={(e) => setEditSimUrl(e.target.value)}
                  placeholder="https://exemplo.com/pagina-do-produto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSim(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditedSimulation}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 size={16} />
                <span>Guardar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
