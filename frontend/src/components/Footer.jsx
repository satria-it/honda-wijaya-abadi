import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube, Heart } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { resolveImageUrl } from '../services/api';

export const Footer = () => {
  const { settings: companyInfo } = useSiteData();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Katalog', href: '#katalog' },
    { label: 'Promo', href: '#promo' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'Kontak', href: '#kontak' },
  ];

  return (
    <footer className="bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-800/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center font-bold text-white text-xl overflow-hidden">
                  {companyInfo.logo ? (
                    <img src={resolveImageUrl(companyInfo.logo)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    'H'
                  )}
                </div>
                <div>
                  <div className="font-bold text-xl text-white font-['Sora']">
                    {companyInfo.name}
                  </div>
                  <div className="text-sm text-gray-400">{companyInfo.tagline}</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                {companyInfo.footerText || 'Dealer resmi Honda terpercaya yang siap melayani kebutuhan kendaraan Anda dengan profesional dan amanah.'}
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-bold text-lg mb-4 font-['Sora']">Menu</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-bold text-lg mb-4 font-['Sora']">Kontak</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="leading-relaxed">{companyInfo.address}</li>
                <li>
                  <a href={`tel:${companyInfo.phone}`} className="hover:text-red-500 transition-colors">
                    {companyInfo.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${companyInfo.email}`} className="hover:text-red-500 transition-colors">
                    {companyInfo.email}
                  </a>
                </li>
                <li className="text-sm">{companyInfo.workingHours}</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-gray-400 text-sm">
            © {currentYear} {companyInfo.name}. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span>for Honda enthusiasts</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
