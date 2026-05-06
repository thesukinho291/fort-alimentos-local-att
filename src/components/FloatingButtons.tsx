import { motion } from "framer-motion";
import type { SiteContent } from "@/store/siteStore";
import { trackEvent } from "@/lib/analytics";

interface Props {
  siteContent: SiteContent;
}

const FloatingButtons = ({ siteContent }: Props) => {
  if (!siteContent) return null;
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 md:gap-3">
      {/* Localização */}
      <motion.a
        href={siteContent.location_link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("button_click", { button: "maps" })}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.15 }}
        aria-label="Abrir localizacao"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-float"
        style={{ backgroundColor: "#4285F4" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
        </svg>
      </motion.a>

      {/* Instagram */}
      <motion.a
        href={siteContent.instagram_link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("button_click", { button: "instagram" })}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.15 }}
        aria-label="Abrir Instagram"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-float"
        style={{
          background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
        </svg>
      </motion.a>

      {/* WhatsApp */}
      <motion.a
        href={siteContent.whatsapp_link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("button_click", { button: "whatsapp" })}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        whileHover={{ scale: 1.15 }}
        aria-label="Abrir WhatsApp"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-float"
        style={{ backgroundColor: "#25D366" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>
    </div>
  );
};

export default FloatingButtons;
