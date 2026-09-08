import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Phone, Send, User, Bike, Calendar, Search, Filter, Check, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const STATUS_META = {
  new: { label: 'Baru', color: 'bg-red-600', textColor: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-500/30' },
  contacted: { label: 'Dihubungi', color: 'bg-yellow-500', textColor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  completed: { label: 'Selesai', color: 'bg-green-600', textColor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

export default function AdminInterests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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

  const handleStatusChange = async (item, newStatus) => {
    try {
      await adminApi.updateInterestStatus(item.id, newStatus);
      toast.success('Status diperbarui');
      await load();
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleWhatsApp = (item) => {
    const message = `Halo ${item.name}, kami menerima ketertarikan Anda terhadap ${item.motor_name}. Ada yang bisa kami bantu?`;
    const cleanPhone = item.phone.replace(/[^\d]/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    // Auto-mark as contacted
    if (item.status === 'new') {
      handleStatusChange(item, 'contacted');
    }
  };

  const forwardToDealer = (item) => {
    const now = new Date(item.created_at).toLocaleString('id-ID');
    const message = `🔔 *MINAT KONSUMEN*\n\n👤 Nama: ${item.name}\n📱 No. HP: ${item.phone}\n🏍️ Motor: ${item.motor_name}\n🕐 Waktu: ${now}`;
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

  const filteredItems = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const monthAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;

    return items.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Date filter
      const t = new Date(item.created_at).getTime();
      if (dateFilter === 'today' && t < startOfToday) return false;
      if (dateFilter === 'week' && t < weekAgo) return false;
      if (dateFilter === 'month' && t < monthAgo) return false;

      // Search filter (name or phone or motor)
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          item.name?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.motor_name?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, search, statusFilter, dateFilter]);

  const statusCounts = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Minat Konsumen</h1>
        <p className="text-gray-400">Kelola dan pantau minat calon konsumen</p>
      </div>

      {/* Filters Card */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-white">Filter & Pencarian</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="interests-search"
              className="bg-zinc-800 border-white/20 text-white pl-10"
              placeholder="Cari nama, HP, atau motor..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="interests-filter-status"
            className="bg-zinc-800 border border-white/20 text-white px-4 py-2 rounded-md"
          >
            <option value="all">Semua Status ({items.length})</option>
            <option value="new">Baru ({statusCounts.new || 0})</option>
            <option value="contacted">Dihubungi ({statusCounts.contacted || 0})</option>
            <option value="completed">Selesai ({statusCounts.completed || 0})</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            data-testid="interests-filter-date"
            className="bg-zinc-800 border border-white/20 text-white px-4 py-2 rounded-md"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>

        <div className="mt-3 text-sm text-gray-400">
          Menampilkan <span className="text-white font-semibold">{filteredItems.length}</span> dari {items.length} data
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-12 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <div className="text-white text-xl font-bold mb-2">
            {items.length === 0 ? 'Belum ada data minat' : 'Tidak ada hasil'}
          </div>
          <div className="text-gray-400">
            {items.length === 0 ? 'Data akan muncul saat konsumen submit form minat di website' : 'Coba ubah filter atau kata kunci pencarian'}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item, idx) => {
            const meta = STATUS_META[item.status] || STATUS_META.new;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">
                        {item.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-white font-bold text-lg">{item.name}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.bg} ${meta.textColor} border ${meta.border}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                          <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{item.phone}</span>
                          <span className="flex items-center"><Bike className="w-3 h-3 mr-1" />{item.motor_name}</span>
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange(item, 'new')}
                        disabled={item.status === 'new'}
                        data-testid={`status-new-${item.id}`}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                          item.status === 'new'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-transparent text-gray-400 border-white/20 hover:border-red-500/50 hover:text-red-400'
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />Baru
                      </button>
                      <button
                        onClick={() => handleStatusChange(item, 'contacted')}
                        disabled={item.status === 'contacted'}
                        data-testid={`status-contacted-${item.id}`}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                          item.status === 'contacted'
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-transparent text-gray-400 border-white/20 hover:border-yellow-500/50 hover:text-yellow-400'
                        }`}
                      >
                        <Check className="w-3 h-3 inline mr-1" />Dihubungi
                      </button>
                      <button
                        onClick={() => handleStatusChange(item, 'completed')}
                        disabled={item.status === 'completed'}
                        data-testid={`status-completed-${item.id}`}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                          item.status === 'completed'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-transparent text-gray-400 border-white/20 hover:border-green-500/50 hover:text-green-400'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3 inline mr-1" />Selesai
                      </button>
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
                      Teruskan
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
            );
          })}
        </div>
      )}
    </div>
  );
}
