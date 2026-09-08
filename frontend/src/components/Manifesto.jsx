import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useSiteData } from '../context/SiteDataContext';

export const Manifesto = () => {
  const { manifesto } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (!manifesto || manifesto.length === 0) return (
    <section ref={ref} className="py-32 bg-zinc-950" />
  );

  return (
    <section ref={ref} className="py-32 bg-zinc-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-red-800/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-['Sora']">
            Komitmen <span className="text-red-500">Kami</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Prinsip yang kami pegang dalam melayani setiap pelanggan
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {manifesto.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-500">
                <div className="text-7xl font-bold text-red-600/20 mb-4 font-['Sora']">
                  {item.number}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-['Sora']">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
