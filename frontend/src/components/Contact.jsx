import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from './ui/button';
import { useSiteData } from '../context/SiteDataContext';

export const Contact = () => {
  const { settings: companyInfo } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${companyInfo.phone}`, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Telepon',
      value: companyInfo.phone,
      action: () => window.open(`https://wa.me/${companyInfo.phone}`, '_blank'),
    },
    {
      icon: Mail,
      label: 'Email',
      value: companyInfo.email,
      action: () => window.location.href = `mailto:${companyInfo.email}`,
    },
    {
      icon: MapPin,
      label: 'Alamat',
      value: companyInfo.address,
    },
    {
      icon: Clock,
      label: 'Jam Operasional',
      value: companyInfo.workingHours,
    },
  ];

  return (
    <section id="kontak" ref={ref} className="py-32 bg-zinc-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-['Sora']">
            Hubungi <span className="text-red-500">Kami</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Siap membantu Anda menemukan motor Honda yang tepat
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                className="group"
              >
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
                  onClick={info.action}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">{info.label}</div>
                      <div className="text-white font-semibold">{info.value}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent rounded-3xl blur-2xl" />
            
            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Sora']">
                Siap untuk berkendara?
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                Hubungi kami melalui WhatsApp untuk konsultasi gratis dan dapatkan penawaran terbaik untuk motor impian Anda.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Respon cepat dalam hitungan menit</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Konsultasi gratis tanpa komitmen</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Penawaran eksklusif tersedia</span>
                </div>
              </div>

              <Button
                onClick={handleWhatsApp}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full text-lg font-semibold flex items-center justify-center space-x-3 shadow-xl hover:shadow-red-500/50 transition-all duration-300 group w-full"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Chat via WhatsApp</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
