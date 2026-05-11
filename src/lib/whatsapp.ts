export const FORT_WHATSAPP_NUMBER = import.meta.env.VITE_FORT_WHATSAPP || "5515991138912";

export const normalizeWhatsAppNumber = (phone: string) => phone.replace(/\D/g, "");

export const createWhatsAppHref = (message: string, phone = FORT_WHATSAPP_NUMBER) =>
  `https://wa.me/${normalizeWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
