import { motion } from "framer-motion";
import type { SiteContent } from "@/store/siteStore";
import { ShieldCheck, Truck, Users, Heart, Star, Zap, Award, Package, ThumbsUp, Clock, Leaf, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck, Truck, Users, Heart, Star, Zap, Award, Package, ThumbsUp, Clock, Leaf, Globe,
};

export const availableIcons = Object.keys(iconMap);

interface Props {
  siteContent: SiteContent;
}

const AboutSection = ({ siteContent }: Props) => {
  const features = siteContent.features || [];

  return (
    <section id="sobre" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-2">
            Sobre a <span className="text-gradient">empresa</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-fort mx-auto mt-4 mb-8 rounded-full" />
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg leading-relaxed">
            {siteContent.about_text}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon] || ShieldCheck;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-background rounded-xl p-8 shadow-card hover:shadow-elevated transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-gradient-fort rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="text-primary-foreground" size={28} />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
