import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';

export const Testimonials = () => {
  const { testimonials } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="testimoni" ref={ref} className="py-32 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-['Sora']">
            Kata <span className="text-red-500">Pelanggan</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Kepercayaan dan kepuasan pelanggan adalah prioritas kami
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-red-500/50 transition-all duration-500">
                {/* Quote Icon */}
                <div className="absolute top-8 right-8 opacity-10">
                  <Quote className="w-16 h-16 text-red-500" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-red-500 text-red-500" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-300 text-lg leading-relaxed mb-6 relative z-10">
                  "{testimonial.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <div className="font-bold text-white font-['Sora']">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.motor}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Marquee Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 overflow-hidden"
        >
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center space-x-8 mr-8">
                {['TERPERCAYA', '•', 'BERKUALITAS', '•', 'PROFESIONAL', '•', 'AMANAH', '•'].map((text, i) => (
                  <span
                    key={i}
                    className={`text-6xl font-bold ${
                      text === '•' ? 'text-red-500' : 'text-white/10'
                    } font-['Sora']`}
                  >
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
};
