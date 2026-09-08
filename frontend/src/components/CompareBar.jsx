import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompare, Trash2, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { resolveImageUrl } from '../services/api';
import { useSiteData } from '../context/SiteDataContext';

const parsePrice = (str) => {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^\d]/g, '') || '0', 10);
};

const formatIDR = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export const CompareBar = () => {
  const { selected, remove, clear, open, setOpen, openCompare } = useCompare();
  const { settings } = useSiteData();

  const handleContact = () => {
    const motorList = selected.map((m) => m.name).join(', ');
    const message = `Halo, saya sedang membandingkan motor: ${motorList}. Bisa bantu saya pilih yang terbaik?`;
    const url = `https://wa.me/${settings.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Build comparison rows
  const compareRows = () => {
    if (selected.length === 0) return [];
    const rows = [
      { label: 'Harga', key: 'price', values: selected.map((m) => m.price) },
      { label: 'Kategori', key: 'category', values: selected.map((m) => m.category) },
      { label: 'Spesifikasi', key: 'specs', values: selected.map((m) => (m.specs || []).join(', ') || '-') },
      { label: 'Deskripsi', key: 'description', values: selected.map((m) => m.description || '-') },
      { label: 'Minat Konsumen', key: 'interest_count', values: selected.map((m) => `${m.interest_count || 0} minat`) },
    ];
    // Highlight cheapest in price row
    const prices = selected.map((m) => parsePrice(m.price));
    const minPrice = Math.min(...prices.filter((p) => p > 0));
    rows[0].highlights = prices.map((p) => p === minPrice && p > 0);
    return rows;
  };

  const rows = compareRows();

  return (
    <>
      {/* Floating Bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl"
            data-testid="compare-bar"
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
              <div className="hidden sm:flex items-center space-x-2 pr-2 border-r border-white/10">
                <GitCompare className="w-5 h-5 text-red-500" />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {selected.length} dipilih
                </span>
              </div>

              <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {selected.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center bg-zinc-800/80 border border-white/10 rounded-lg p-1 pr-2 min-w-[120px] max-w-[180px] flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-zinc-700 flex-shrink-0 mr-2">
                      {m.image && <img src={resolveImageUrl(m.image)} alt={m.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-semibold truncate">{m.name}</div>
                      <div className="text-red-500 text-[10px] truncate">{m.price}</div>
                    </div>
                    <button
                      onClick={() => remove(m.id)}
                      className="ml-1 p-0.5 rounded hover:bg-red-600/20 text-gray-500 hover:text-red-500"
                      data-testid={`compare-remove-${m.id}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clear}
                  data-testid="compare-clear-btn"
                  className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  title="Hapus semua"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Button
                  onClick={openCompare}
                  data-testid="compare-open-btn"
                  disabled={selected.length < 2}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  Bandingkan
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-white/20 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Sora'] flex items-center">
              <GitCompare className="w-6 h-6 mr-2 text-red-500" />
              Perbandingan Motor
            </DialogTitle>
          </DialogHeader>

          {selected.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              {/* Motor Cards Row */}
              <div className={`grid gap-4 mb-6`} style={{ gridTemplateColumns: `140px repeat(${selected.length}, minmax(0, 1fr))` }}>
                <div /> {/* empty for label column */}
                {selected.map((m) => (
                  <div key={m.id} className="bg-zinc-800/50 border border-white/10 rounded-xl overflow-hidden">
                    <div className="relative h-32 bg-zinc-900">
                      {m.image && (
                        <img src={resolveImageUrl(m.image)} alt={m.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {m.category}
                      </div>
                      {m.is_bestseller && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center">
                          🔥 <span className="ml-1">TERLARIS</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-white text-sm truncate mb-1">{m.name}</div>
                      <div className="text-red-500 font-bold">{m.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid gap-4 items-start py-3 border-b border-white/5"
                    style={{ gridTemplateColumns: `140px repeat(${selected.length}, minmax(0, 1fr))` }}
                  >
                    <div className="text-sm font-semibold text-gray-400 pt-1">{row.label}</div>
                    {row.values.map((v, idx) => (
                      <div
                        key={idx}
                        className={`text-sm ${
                          row.highlights?.[idx]
                            ? 'text-green-400 font-bold'
                            : 'text-white'
                        }`}
                      >
                        {v}
                        {row.highlights?.[idx] && (
                          <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Termurah</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Tutup
                </Button>
                <Button
                  onClick={handleContact}
                  data-testid="compare-contact-btn"
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                >
                  Konsultasi via WhatsApp
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
