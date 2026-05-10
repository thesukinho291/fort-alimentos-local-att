export const WHATSAPP_NUMBER = "5515991138912";

export const createWhatsAppHref = (message: string, phone = WHATSAPP_NUMBER) => {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};
