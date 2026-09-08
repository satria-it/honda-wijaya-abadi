import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useSiteData } from '../context/SiteDataContext';
import { publicApi, resolveImageUrl } from '../services/api';
import { CreditSimulator } from './CreditSimulator';

export const Catalog = () => {
  const { motors: motorcycles, settings } = useSiteData();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleInterest = (motor) => {
    setSelectedMotor(motor);
    setIsDialogOpen(true);
  };

  const handleOpenSimulator = (motor) => {
    setSelectedMotor(motor);
    setIsSimulatorOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Mohon lengkapi semua data');
      return;
    }

    setSubmitting(true);
    let waUrl = null;
    try {
      // Save to backend - returns whatsapp_url ready for auto-open
      const response = await publicApi.createInterest({
        name: formData.name,
        phone: formData.phone,
        motor_id: selectedMotor.id,
        motor_name: selectedMotor.name,
      });
      waUrl = response.whatsapp_url;
    } catch (err) {
      console.error('Failed to save interest', err);
      // Fallback: build wa.me URL client-side
      const message = `🔔 MINAT KONSUMEN BARU\n\n👤 Nama: ${formData.name}\n📱 No. HP: ${formData.phone}\n🏍️ Motor: ${selectedMotor.name}\n\nMohon ditindaklanjuti. Terima kasih!`;
      waUrl = `https://wa.me/${settings.phone}?text=${encodeURIComponent(message)}`;
    }

    // Reset form
    setFormData({ name: '', phone: '' });
    setIsDialogOpen(false);
    setSubmitting(false);
    toast.success('Data terkirim! Membuka WhatsApp...');

    // Auto-open WhatsApp to dealer (this notifies the dealer directly)
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 300);
  };

  const categories = ['Semua', 'Matic', 'Sport', 'Adventure'];
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredMotorcycles = activeCategory === 'Semua'
    ? motorcycles
    : motorcycles.filter(m => m.category.includes(activeCategory));

  return (
    <section id="katalog" ref={ref} className="py-32 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-['Sora']">
            Katalog <span className="text-red-500">Motor</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Temukan motor Honda yang sesuai dengan kebutuhan Anda
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMotorcycles.map((motor, index) => (
            <motion.div
              key={motor.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all duration-500">
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-zinc-950">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={resolveImageUrl(motor.image)}
                    alt={motor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {motor.category}
                  </div>

                  {/* Bestseller Badge */}
                  {motor.is_bestseller && (
                    <div
                      data-testid={`motor-bestseller-${motor.id}`}
                      className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1"
                    >
                      <span className="animate-pulse">🔥</span>
                      <span>TERLARIS</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 font-['Sora']">
                    {motor.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{motor.description}</p>
                  
                  {/* Specs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {motor.specs.map((spec, idx) => (
                      <span
                        key={idx}
                        className="bg-zinc-800/50 border border-white/10 px-3 py-1 rounded-full text-sm text-gray-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Mulai dari</div>
                        <div className="text-2xl font-bold text-red-500 font-['Sora']">
                          {motor.price}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleInterest(motor)}
                        data-testid={`motor-interest-${motor.id}`}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 flex items-center space-x-2 shadow-lg hover:shadow-red-500/50 transition-all duration-300 group"
                      >
                        <span>Minat</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleOpenSimulator(motor)}
                      variant="outline"
                      data-testid={`motor-simulator-${motor.id}`}
                      className="w-full border-white/20 bg-transparent text-gray-300 hover:bg-red-600/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Simulasi Kredit</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Sora']">
              Minat {selectedMotor?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                placeholder="Masukkan nama Anda"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-300">Nomor HP</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <Button
              type="submit"
              data-testid="interest-submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-semibold"
            >
              {submitting ? 'Memproses...' : 'Kirim ke WhatsApp'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Credit Simulator */}
      <CreditSimulator
        open={isSimulatorOpen}
        onOpenChange={setIsSimulatorOpen}
        motor={selectedMotor}
        onProceed={() => handleInterest(selectedMotor)}
      />
    </section>
  );
};
