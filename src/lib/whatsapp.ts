export const WHATSAPP_NUMBER = "5515991138912";

export const createWhatsAppHref = (message: string, phone = WHATSAPP_NUMBER) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
