import { motion } from "framer-motion";
import type { SiteContent } from "@/store/siteStore";
import bannerImg from "@/assets/banner.webp";

interface Props {
  siteContent: SiteContent;
}

const HeroBanner = ({ siteContent }: Props) => {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={siteContent.banner_image_url || bannerImg}
          alt="Fort Alimentos"
          className="w-full h-full object-cover"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fort-dark/80 via-fort-dark/60 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="font-heading font-black text-4xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight mb-6">
            {siteContent.banner_title}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            {siteContent.banner_subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#produtos"
              className="inline-block bg-gradient-fort text-primary-foreground font-heading font-bold px-8 py-4 rounded-lg shadow-float hover:shadow-elevated transition-all hover:scale-105"
            >
              Ver Produtos
            </a>
            <a
              href="#contato"
              className="inline-block border-2 border-primary-foreground/30 text-primary-foreground font-heading font-bold px-8 py-4 rounded-lg hover:bg-primary-foreground/10 transition-all"
            >
              Fale Conosco
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
