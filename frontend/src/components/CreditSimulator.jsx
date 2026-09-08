import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

// Parse price string like "Rp 18.000.000" -> 18000000
const parsePrice = (str) => {
  if (!str) return 0;
  const digits = String(str).replace(/[^\d]/g, '');
  return parseInt(digits || '0', 10);
};

const formatIDR = (n) => {
  if (!isFinite(n)) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
};

export const CreditSimulator = ({ open, onOpenChange, motor, onProceed }) => {
  const otr = useMemo(() => parsePrice(motor?.price), [motor]);
  const [dpPct, setDpPct] = useState(20);
  const [tenor, setTenor] = useState(24);
  // Estimated interest rate per year (indicative, common for motor credit)
  const [rate, setRate] = useState(9);

  const calc = useMemo(() => {
    const dpAmount = Math.round((otr * dpPct) / 100);
    const financed = otr - dpAmount;
    const totalInterest = (financed * (rate / 100) * (tenor / 12));
    const total = financed + totalInterest;
    const monthly = tenor > 0 ? total / tenor : 0;
    return { dpAmount, financed, monthly, totalInterest, total };
  }, [otr, dpPct, tenor, rate]);

  const dpOptions = [10, 15, 20, 25, 30, 40, 50];
  const tenorOptions = [12, 24, 35, 47];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-['Sora'] flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-red-500" />
            <span>Simulasi Kredit</span>
          </DialogTitle>
        </DialogHeader>

        {motor && (
          <div className="space-y-5 mt-2">
            <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Motor</div>
                <div className="text-white font-bold text-lg">{motor.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Harga OTR</div>
                <div className="text-red-500 font-bold text-lg">{formatIDR(otr)}</div>
              </div>
            </div>

            {/* DP */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-300">Uang Muka (DP)</Label>
                <div className="text-red-500 font-bold">{dpPct}%</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {dpOptions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDpPct(v)}
                    data-testid={`dp-option-${v}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      dpPct === v
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-zinc-800 border-white/10 text-gray-400 hover:border-red-500/50'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">Nominal DP: <span className="text-white">{formatIDR(calc.dpAmount)}</span></div>
            </div>

            {/* Tenor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-300">Tenor (bulan)</Label>
                <div className="text-red-500 font-bold">{tenor} bulan</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tenorOptions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTenor(v)}
                    data-testid={`tenor-option-${v}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      tenor === v
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-zinc-800 border-white/10 text-gray-400 hover:border-red-500/50'
                    }`}
                  >
                    {v} bulan
                  </button>
                ))}
              </div>
            </div>

            {/* Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gray-300">Bunga Estimasi (per tahun)</Label>
                <div className="text-red-500 font-bold">{rate}%</div>
              </div>
              <input
                type="range"
                min="5"
                max="18"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                data-testid="rate-slider"
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span><span>18%</span>
              </div>
            </div>

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30 rounded-2xl p-5"
            >
              <div className="text-sm text-gray-300 mb-1">Estimasi Cicilan per Bulan</div>
              <div
                data-testid="credit-monthly-result"
                className="text-4xl font-bold text-white font-['Sora'] mb-3"
              >
                {formatIDR(calc.monthly)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Total pinjaman</span>
                  <span className="text-white">{formatIDR(calc.financed)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Total bunga</span>
                  <span className="text-white">{formatIDR(calc.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-gray-400 pt-2 border-t border-white/10">
                  <span>Total bayar (setelah DP)</span>
                  <span className="text-white font-bold">{formatIDR(calc.total)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3 italic">
                *Simulasi ini bersifat estimasi. Bunga & syarat aktual mengikuti ketentuan leasing.
              </div>
            </motion.div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onProceed) onProceed();
                }}
                data-testid="credit-proceed-btn"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Lanjut Ambil Motor Ini
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
