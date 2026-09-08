import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Tag, MessageSquare, Users, TrendingUp, Calendar, Flame, PieChart as PieIcon } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_LABELS = { new: 'Baru', contacted: 'Dihubungi', completed: 'Selesai' };
const STATUS_COLORS = { new: '#ef4444', contacted: '#eab308', completed: '#22c55e' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getAnalytics()])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Motor', value: stats?.motors || 0, icon: Bike, color: 'from-red-600 to-red-800', href: '/admin/motors' },
    { label: 'Total Promo', value: stats?.promos || 0, icon: Tag, color: 'from-orange-600 to-red-700', href: '/admin/promos' },
    { label: 'Testimoni', value: stats?.testimonials || 0, icon: MessageSquare, color: 'from-red-700 to-red-900', href: '/admin/testimonials' },
    { label: 'Minat Konsumen', value: stats?.interests || 0, icon: Users, color: 'from-red-800 to-orange-800', href: '/admin/interests', badge: stats?.new_interests },
  ];

  const totals = analytics?.totals || {};
  const summaryCards = [
    { label: 'Hari Ini', value: totals.today || 0, icon: Calendar, color: 'text-red-500' },
    { label: '7 Hari', value: totals.last_7_days || 0, icon: TrendingUp, color: 'text-orange-500' },
    { label: '30 Hari', value: totals.last_30_days || 0, icon: Flame, color: 'text-yellow-500' },
  ];

  // Prepare chart data - last 14 days for readability
  const trendData = (analytics?.interests_by_day || []).slice(-14);
  const topMotors = analytics?.top_motors || [];
  const statusData = (analytics?.status_distribution || []).map((s) => ({
    ...s,
    label: STATUS_LABELS[s.status] || s.status,
    color: STATUS_COLORS[s.status] || '#ef4444',
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Dashboard</h1>
        <p className="text-gray-400">Selamat datang di panel admin Honda Wijaya Abadi Motor</p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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

      {/* Analytics summary chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {summaryCards.map((c, idx) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 flex items-center space-x-4"
          >
            <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-['Sora']">{c.value}</div>
              <div className="text-xs text-gray-400">Minat {c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white font-['Sora'] flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                Tren Minat Konsumen
              </h2>
              <p className="text-xs text-gray-400 mt-1">14 hari terakhir</p>
            </div>
          </div>
          <div className="h-72" data-testid="chart-trend">
            {trendData.length === 0 || trendData.every((d) => d.count === 0) ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Belum cukup data untuk menampilkan tren
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#ef4444' }}
                    formatter={(v) => [`${v} minat`, 'Jumlah']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fill="url(#colorInterest)"
                    dot={{ fill: '#ef4444', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white font-['Sora'] mb-6 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-red-500" />
            Status Minat
          </h2>
          <div className="h-72" data-testid="chart-status">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(v, n) => [`${v} minat`, n]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Motors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-['Sora'] flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              Motor Terpopuler
            </h2>
            <p className="text-xs text-gray-400 mt-1">Berdasarkan jumlah minat konsumen</p>
          </div>
        </div>
        <div className="h-64" data-testid="chart-top-motors">
          {topMotors.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Belum ada data minat konsumen
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMotors} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="#71717a" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#f97316' }}
                  formatter={(v) => [`${v} minat`, 'Jumlah']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
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
