import { motion } from 'framer-motion';
import { ArrowRight, Zap, Award, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useSiteData } from '../context/SiteDataContext';
import { resolveImageUrl } from '../services/api';

export const Hero = () => {
  const { settings } = useSiteData();

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${settings.phone}`, '_blank');
  };

  const scrollToKatalog = () => {
    document.querySelector('#katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Split text animation from settings
  const title = settings.heroTitle || "Berkendara Dengan";
  const titleHighlight = settings.heroTitleHighlight || "Kebanggaan";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      },
    },
  };

  const features = [
    { icon: Zap, text: 'Proses Cepat' },
    { icon: Award, text: 'Terpercaya' },
    { icon: Clock, text: 'Layanan 24/7' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden grain-overlay">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_50%)]" 
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
      </div>

      {/* Hero Image with Parallax */}
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 parallax-container"
      >
        <div className="relative h-full">
          <motion.img
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            src={resolveImageUrl(settings.heroImage)}
            alt="Honda Motor"
            className="absolute right-0 h-full w-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          {/* Small Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Dealer Resmi Honda</span>
          </motion.div>

          {/* Main Title with Line-by-line Reveal */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none font-['Sora']"
          >
            <div className="kinetic-text">
              {title.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block text-white"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
            <div className="kinetic-text mt-2">
              {titleHighlight.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent glow-text"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed"
          >
            {settings.heroSubtitle || `${settings.tagline}. Dapatkan motor Honda impian Anda dengan harga terbaik dan proses yang mudah.`}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Button
              onClick={handleWhatsApp}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center justify-center space-x-3 shadow-xl hover:shadow-red-500/50 transition-all duration-300 group glow-primary"
            >
              <span>Hubungi Dealer</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={scrollToKatalog}
              variant="outline"
              className="border-2 border-white/20 hover:border-red-500 bg-transparent hover:bg-red-600/10 text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Lihat Katalog
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-3"
              >
                <feature.icon className="w-5 h-5 text-red-500" />
                <span className="text-gray-300 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 bg-red-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
