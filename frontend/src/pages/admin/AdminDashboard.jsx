import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Tag, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Motor', value: stats?.motors || 0, icon: Bike, color: 'from-red-600 to-red-800', href: '/admin/motors' },
    { label: 'Total Promo', value: stats?.promos || 0, icon: Tag, color: 'from-orange-600 to-red-700', href: '/admin/promos' },
    { label: 'Testimoni', value: stats?.testimonials || 0, icon: MessageSquare, color: 'from-red-700 to-red-900', href: '/admin/testimonials' },
    { label: 'Minat Konsumen', value: stats?.interests || 0, icon: Users, color: 'from-red-800 to-orange-800', href: '/admin/interests', badge: stats?.new_interests },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Dashboard</h1>
        <p className="text-gray-400">Selamat datang di panel admin Honda Wijaya Abadi Motor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={card.href}
              data-testid={`admin-stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="block bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                {card.badge > 0 && (
                  <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {card.badge} baru
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-['Sora']">
                {loading ? '...' : card.value}
              </div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white font-['Sora']">Aksi Cepat</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/motors"
            className="p-6 bg-zinc-800/50 border border-white/10 rounded-xl hover:border-red-500/50 hover:bg-red-600/5 transition-all"
          >
            <Bike className="w-8 h-8 text-red-500 mb-3" />
            <div className="text-white font-semibold mb-1">Tambah Motor Baru</div>
            <div className="text-sm text-gray-400">Kelola katalog motor Honda</div>
          </Link>
          <Link
            to="/admin/interests"
            className="p-6 bg-zinc-800/50 border border-white/10 rounded-xl hover:border-red-500/50 hover:bg-red-600/5 transition-all"
          >
            <Users className="w-8 h-8 text-red-500 mb-3" />
            <div className="text-white font-semibold mb-1">Lihat Minat Konsumen</div>
            <div className="text-sm text-gray-400">Daftar calon konsumen</div>
          </Link>
          <Link
            to="/admin/settings"
            className="p-6 bg-zinc-800/50 border border-white/10 rounded-xl hover:border-red-500/50 hover:bg-red-600/5 transition-all"
          >
            <MessageSquare className="w-8 h-8 text-red-500 mb-3" />
            <div className="text-white font-semibold mb-1">Pengaturan Website</div>
            <div className="text-sm text-gray-400">Edit logo, hero & info</div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
