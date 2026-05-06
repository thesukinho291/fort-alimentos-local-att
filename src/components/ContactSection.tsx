import { motion } from "framer-motion";
import type { SiteContent } from "@/store/siteStore";
import { Phone, MapPin, Mail, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

interface Props {
  siteContent: SiteContent;
}

const ContactSection = ({ siteContent }: Props) => {
  const logoSrc = siteContent.logo_url || logo;
  const phoneClean = siteContent.phone?.replace(/[^0-9+]/g, "") || "";

  const items = [
    {
      icon: Phone,
      label: "Telefone",
      value: siteContent.phone,
      href: `tel:${phoneClean}`,
      external: false,
    },
    {
      icon: MapPin,
      label: "Endereço",
      value: siteContent.address,
      href: siteContent.location_link || "#",
      external: true,
    },
    {
      icon: Mail,
      label: "E-mail",
      value: siteContent.email || "contato@fortalimentos.com.br",
      href: `mailto:${siteContent.email || "contato@fortalimentos.com.br"}`,
      external: false,
    },
    {
      icon: Clock,
      label: "Horário",
      value: siteContent.business_hours || "Seg–Sex: 08:00 – 18:00",
      href: "#",
      external: false,
    },
  ];

  return (
    <section id="contato" className="py-24 bg-fort-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-primary-foreground mb-2">
            Entre em Contato
          </h2>
          <div className="w-20 h-1 bg-gradient-yellow mx-auto mt-4 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-gradient-fort rounded-full flex items-center justify-center mb-4 shrink-0">
                <item.icon className="text-primary-foreground" size={24} />
              </div>
              <h3 className="font-heading font-bold text-primary-foreground mb-2">{item.label}</h3>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors underline-offset-2 hover:underline text-sm leading-relaxed break-words max-w-[200px]"
              >
                {item.value}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-primary-foreground/10 text-center">
          <img src={logoSrc} alt={siteContent.company_name} loading="lazy" decoding="async" className="h-12 mx-auto mb-4 opacity-60" />
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} {siteContent.company_name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
