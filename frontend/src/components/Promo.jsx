import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { promos } from '../mock';
import { Percent, TrendingDown, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { companyInfo } from '../mock';

const iconMap = {
  0: Percent,
  1: TrendingDown,
  2: CreditCard,
};

export const Promo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleWhatsApp = () => {
    const message = 'Halo, saya ingin mengetahui info promo terbaru!';
    window.open(`https://wa.me/${companyInfo.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="promo" ref={ref} className="py-32 bg-zinc-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-['Sora']">
            Promo <span className="text-red-500">Spesial</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Dapatkan penawaran terbaik untuk motor impian Anda
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {promos.map((promo, index) => {
            const Icon = iconMap[index];
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                
                <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-red-500/50 transition-all duration-500 h-full flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 font-['Sora']">
                    {promo.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6 flex-grow">
                    {promo.description}
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-2 text-sm text-red-400 font-medium">
                    <span>{promo.terms}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Sora']">
              Tertarik dengan promo kami?
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Hubungi kami sekarang untuk mendapatkan informasi lebih lanjut tentang promo dan penawaran khusus
            </p>
            <Button
              onClick={handleWhatsApp}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center justify-center space-x-3 mx-auto shadow-xl hover:shadow-red-500/50 transition-all duration-300 group"
            >
              <span>Tanya Promo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
