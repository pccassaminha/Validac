// Shared CRM lead utility functions for Valida C

export function formatKz(value: number): string {
  return (
    new Intl.NumberFormat("pt-AO", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0) + " Kz"
  );
}

export function getLeadPrice(lead: any): number {
  if (!lead) return 0;
  if (typeof lead.price === "number" && lead.price > 0) return lead.price;
  if (typeof lead.totalPrice === "number" && lead.totalPrice > 0) return lead.totalPrice;
  if (typeof lead.valor === "number" && lead.valor > 0) return lead.valor;

  const q = lead.quantity || 1;
  const prod = (lead.produto || lead.product || "").toLowerCase();
  const isCamisaSeda = prod.includes("seda") || prod.includes("camisa");
  const unitPrice =
    prod.includes("35000") ||
    prod.includes("35 000") ||
    prod.includes("expresso") ||
    isCamisaSeda
      ? 35000
      : prod.includes("base") || prod.includes("móvel") || prod.includes("movel")
        ? 15000
        : 25000;

  if (typeof lead.totalPrice === "number" && lead.totalPrice > 0) {
    if (isCamisaSeda) return lead.totalPrice;
    if (lead.totalPrice < q * unitPrice) return q * unitPrice;
    return lead.totalPrice;
  }
  return q * unitPrice;
}

export function getLeadScore(lead: any): number {
  if (!lead) return 50;
  let score = 50;
  if (lead.phone && lead.phone.length >= 9) score += 15;
  if (lead.province) score += 10;
  if (lead.area || lead.address) score += 10;
  const st = (lead.status || "").toLowerCase();
  if (st.includes("vendido") || st.includes("fechado")) score += 25;
  else if (st.includes("transferido") || st.includes("vendas")) score += 20;
  else if (st.includes("reservado") || st.includes("qualificado")) score += 15;
  return Math.min(100, score);
}
