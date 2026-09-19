// Meta Conversions API (CAPI) & Lead Ads official hub for Valida C

export interface MetaConfig {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
  verifyToken: string;
  enableAutoTrack: boolean;
  trackOnLeadReceived: boolean;
  trackOnLeadQualified: boolean;
  trackOnLeadTransferred: boolean;
  trackOnLeadSold: boolean;
}

export interface MetaEventLog {
  id: string;
  timestamp: string;
  eventName: "Lead" | "CompleteRegistration" | "Schedule" | "Purchase" | "InitiateCheckout";
  leadName?: string;
  phoneHashed?: string;
  status: "success" | "error" | "simulated";
  responseMessage: string;
  eventSourceUrl?: string;
}

const STORAGE_KEY_CONFIG = "validaC_meta_config";
const STORAGE_KEY_LOGS = "validaC_meta_logs";

export const DEFAULT_META_CONFIG: MetaConfig = {
  pixelId: "4192962437607469", // Extracted from active pixel in index.html
  accessToken: "",
  testEventCode: "",
  verifyToken: "valida_c_meta_token_2026",
  enableAutoTrack: true,
  trackOnLeadReceived: true,
  trackOnLeadQualified: true,
  trackOnLeadTransferred: true,
  trackOnLeadSold: true,
};

export function getMetaConfig(): MetaConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_META_CONFIG;
    return { ...DEFAULT_META_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_META_CONFIG;
  }
}

export function saveMetaConfig(config: MetaConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Erro ao salvar config Meta:", e);
  }
}

export function getMetaLogs(): MetaEventLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMetaLog(log: Omit<MetaEventLog, "id" | "timestamp">): void {
  try {
    const logs = getMetaLogs();
    const newLog: MetaEventLog = {
      id: `meta_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      ...log,
    };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao registrar log Meta:", e);
  }
}

// Client-side SHA-256 hashing compliant with Meta Conversions API specifications
export async function hashSha256(value: string): Promise<string> {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback simple hash for older contexts
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}

export async function sendMetaConversionEvent(params: {
  eventName: "Lead" | "CompleteRegistration" | "Schedule" | "Purchase" | "InitiateCheckout";
  lead: {
    name?: string;
    phone?: string;
    province?: string;
    produto?: string;
    price?: number;
  };
  customData?: Record<string, any>;
}): Promise<{ success: boolean; message: string }> {
  const config = getMetaConfig();
  const { eventName, lead, customData = {} } = params;

  // Clean and hash phone number: Meta expects country code without spaces/symbols, e.g., 244923000000
  let cleanPhone = (lead.phone || "").replace(/\D/g, "");
  if (cleanPhone.length === 9 && !cleanPhone.startsWith("244")) {
    cleanPhone = "244" + cleanPhone;
  }
  const hashedPhone = cleanPhone ? await hashSha256(cleanPhone) : "";
  const hashedName = lead.name ? await hashSha256(lead.name) : "";
  const hashedCity = lead.province ? await hashSha256(lead.province) : "";
  const hashedCountry = await hashSha256("ao"); // Angola ISO code

  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `valida_c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Also trigger Meta Pixel client-side if loaded in browser
  if (typeof (window as any).fbq === "function") {
    try {
      (window as any).fbq("track", eventName, {
        content_name: lead.produto || "Lead Valida C",
        value: lead.price || 0,
        currency: "AOA",
        ...customData,
      }, { eventID: eventId });
    } catch (pixelErr) {
      console.warn("Meta Pixel client-side dispatch error:", pixelErr);
    }
  }

  // If no Access Token is filled, log simulation with instructions
  if (!config.accessToken || !config.pixelId) {
    const msg = !config.pixelId
      ? "Pixel ID não configurado no painel Meta."
      : "Access Token CAPI não inserido. Evento simulado com sucesso no Valida C.";
    saveMetaLog({
      eventName,
      leadName: lead.name,
      phoneHashed: hashedPhone ? `${hashedPhone.substring(0, 8)}...` : undefined,
      status: "simulated",
      responseMessage: msg,
      eventSourceUrl: window.location.href,
    });
    return { success: true, message: msg };
  }

  // Official Meta Conversions API Graph Call
  try {
    const payload: any = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: window.location.href,
          action_source: "website",
          user_data: {
            ph: hashedPhone ? [hashedPhone] : undefined,
            fn: hashedName ? [hashedName] : undefined,
            ct: hashedCity ? [hashedCity] : undefined,
            country: [hashedCountry],
          },
          custom_data: {
            content_name: lead.produto || "Lead Valida C",
            currency: customData?.currency || "AOA",
            value: customData?.value !== undefined ? customData.value : (lead.price || 0),
            status: customData?.crm_status || "qualificado",
            ...customData,
          },
        },
      ],
    };

    if (config.testEventCode) {
      payload.test_event_code = config.testEventCode;
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${config.pixelId}/events?access_token=${encodeURIComponent(config.accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok && !data.error) {
      const successMsg = `Evento '${eventName}' aceito pela Meta CAPI (${data.events_received || 1} evento(s) recebidos)`;
      saveMetaLog({
        eventName,
        leadName: lead.name,
        phoneHashed: hashedPhone ? `${hashedPhone.substring(0, 8)}...` : undefined,
        status: "success",
        responseMessage: successMsg,
        eventSourceUrl: window.location.href,
      });
      return { success: true, message: successMsg };
    } else {
      const errorMsg = data.error?.message || "Erro desconhecido na Meta Graph API";
      saveMetaLog({
        eventName,
        leadName: lead.name,
        phoneHashed: hashedPhone ? `${hashedPhone.substring(0, 8)}...` : undefined,
        status: "error",
        responseMessage: errorMsg,
        eventSourceUrl: window.location.href,
      });
      return { success: false, message: errorMsg };
    }
  } catch (err: any) {
    const errText = err?.message || "Falha na requisição de rede para a Meta";
    saveMetaLog({
      eventName,
      leadName: lead.name,
      phoneHashed: hashedPhone ? `${hashedPhone.substring(0, 8)}...` : undefined,
      status: "error",
      responseMessage: errText,
      eventSourceUrl: window.location.href,
    });
    return { success: false, message: errText };
  }
}
