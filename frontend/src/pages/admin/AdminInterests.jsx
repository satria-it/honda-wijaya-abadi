import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Phone, Send, User, Bike, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../services/api';
import { Button } from '../../components/ui/button';

export default function AdminInterests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  const load = async () => {
    setLoading(true);
    const [interests, s] = await Promise.all([
      adminApi.getInterests(),
      publicApi.getSettings(),
    ]);
    setItems(interests);
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus data minat dari "${item.name}"?`)) return;
    await adminApi.deleteInterest(item.id);
    toast.success('Data dihapus');
    await load();
  };

  const handleWhatsApp = (item) => {
    const message = `Halo ${item.name}, kami menerima ketertarikan Anda terhadap ${item.motor_name}. Ada yang bisa kami bantu?`;
    const cleanPhone = item.phone.replace(/[^\d]/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const forwardToDealer = (item) => {
    const message = `📋 Minat Konsumen Baru!\n\nNama: ${item.name}\nNo. HP: ${item.phone}\nMotor: ${item.motor_name}\nWaktu: ${new Date(item.created_at).toLocaleString('id-ID')}`;
    const dealerPhone = (settings.phone || '6282343488319').replace(/[^\d]/g, '');
    window.open(`https://wa.me/${dealerPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Minat Konsumen</h1>
        <p className="text-gray-400">Daftar calon konsumen yang tertarik dengan motor Honda</p>
      </div>

      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-12 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <div className="text-white text-xl font-bold mb-2">Belum ada data minat</div>
          <div className="text-gray-400">Data akan muncul saat konsumen submit form minat di website</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">
                      {item.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{item.name}</div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{item.phone}</span>
                        <span className="flex items-center"><Bike className="w-3 h-3 mr-1" />{item.motor_name}</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleWhatsApp(item)}
                    size="sm"
                    data-testid={`admin-wa-customer-${item.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    WA Konsumen
                  </Button>
                  <Button
                    onClick={() => forwardToDealer(item)}
                    size="sm"
                    variant="outline"
                    data-testid={`admin-forward-dealer-${item.id}`}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Teruskan ke Dealer
                  </Button>
                  <Button
                    onClick={() => handleDelete(item)}
                    size="sm"
                    variant="outline"
                    data-testid={`admin-delete-interest-${item.id}`}
                    className="border-red-500/30 bg-transparent text-red-500 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
