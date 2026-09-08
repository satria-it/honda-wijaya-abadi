import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, VolumeX, X, Phone, Bike } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInterestNotifications } from '../hooks/useInterestNotifications';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const { newItems, unseenCount, markAllSeen, setSoundEnabled } = useInterestNotifications(true);

  const togglePanel = () => {
    setIsOpen((v) => !v);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const formatShortDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' • ' + d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        data-testid="notification-bell"
        className="relative w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center transition-all"
      >
        <Bell className={`w-5 h-5 ${unseenCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
        {unseenCount > 0 && (
          <motion.span
            key={unseenCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
          >
            {unseenCount > 99 ? '99+' : unseenCount}
          </motion.span>
        )}
        {unseenCount > 0 && (
          <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <div className="text-white font-bold">Notifikasi</div>
                  <div className="text-xs text-gray-400">
                    {unseenCount > 0 ? `${unseenCount} minat baru belum dilihat` : 'Semua terpantau'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSound}
                    data-testid="notification-sound-toggle"
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    title={soundOn ? 'Matikan suara' : 'Aktifkan suara'}
                  >
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {newItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <div className="text-gray-400 text-sm">Belum ada minat baru</div>
                    <div className="text-gray-500 text-xs mt-1">
                      Notifikasi akan muncul di sini secara otomatis
                    </div>
                  </div>
                ) : (
                  newItems.slice(0, 10).map((item) => (
                    <Link
                      key={item.id}
                      to="/admin/interests"
                      onClick={() => setIsOpen(false)}
                      className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {item.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="text-white font-semibold truncate">{item.name}</div>
                            <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold">BARU</span>
                          </div>
                          <div className="text-xs text-gray-400 space-y-0.5">
                            <div className="flex items-center"><Bike className="w-3 h-3 mr-1" />{item.motor_name}</div>
                            <div className="flex items-center"><Phone className="w-3 h-3 mr-1" />{item.phone}</div>
                            <div className="text-gray-500">{formatShortDate(item.created_at)}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              {newItems.length > 0 && (
                <div className="p-3 border-t border-white/10 flex items-center justify-between bg-zinc-900/50">
                  <button
                    onClick={markAllSeen}
                    data-testid="notification-mark-all"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Tandai semua telah dilihat
                  </button>
                  <Link
                    to="/admin/interests"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                  >
                    Lihat semua →
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
