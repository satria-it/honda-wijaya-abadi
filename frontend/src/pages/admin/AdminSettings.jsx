import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ImageUploader } from '../../components/ImageUploader';

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    publicApi.getSettings().then((s) => {
      setForm(s || {});
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload._id;
      delete payload.updated_at;
      await adminApi.updateSettings(payload);
      toast.success('Pengaturan berhasil disimpan');
    } catch (err) {
      toast.error('Gagal: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400">Memuat...</div>;

  const set = (k) => (v) => setForm({ ...form, [k]: typeof v === 'object' ? v.target.value : v });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Pengaturan Website</h1>
        <p className="text-gray-400">Kelola logo, hero, dan informasi perusahaan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo & Hero Images */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white font-['Sora'] mb-6">Logo & Gambar Utama</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUploader
              value={form.logo}
              onChange={(v) => setForm({ ...form, logo: v })}
              label="Logo (opsional)"
              testId="settings-logo"
            />
            <ImageUploader
              value={form.heroImage}
              onChange={(v) => setForm({ ...form, heroImage: v })}
              label="Gambar Hero (motor utama di beranda)"
              testId="settings-hero"
            />
          </div>
        </div>

        {/* Hero Text */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white font-['Sora'] mb-6">Teks Hero (Beranda)</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Judul Utama</Label>
                <Input
                  value={form.heroTitle || ''}
                  onChange={set('heroTitle')}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="Berkendara Dengan"
                />
              </div>
              <div>
                <Label className="text-gray-300">Highlight (warna merah)</Label>
                <Input
                  value={form.heroTitleHighlight || ''}
                  onChange={set('heroTitleHighlight')}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="Kebanggaan"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Subjudul</Label>
              <Textarea
                value={form.heroSubtitle || ''}
                onChange={set('heroSubtitle')}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white font-['Sora'] mb-6">Informasi Perusahaan</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Nama Perusahaan</Label>
                <Input
                  value={form.name || ''}
                  onChange={set('name')}
                  data-testid="settings-name"
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-300">Tagline</Label>
                <Input
                  value={form.tagline || ''}
                  onChange={set('tagline')}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Nomor WhatsApp (untuk polling)</Label>
                <Input
                  value={form.phone || ''}
                  onChange={set('phone')}
                  data-testid="settings-phone"
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="6282343488319"
                />
                <div className="text-xs text-gray-500 mt-1">Format: 62xxx (tanpa + atau 0 di depan)</div>
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  value={form.email || ''}
                  onChange={set('email')}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Alamat</Label>
              <Input
                value={form.address || ''}
                onChange={set('address')}
                className="bg-zinc-800 border-white/20 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Jam Operasional</Label>
              <Input
                value={form.workingHours || ''}
                onChange={set('workingHours')}
                className="bg-zinc-800 border-white/20 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Teks Footer</Label>
              <Textarea
                value={form.footerText || ''}
                onChange={set('footerText')}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-4">
          <Button
            type="submit"
            disabled={saving}
            data-testid="settings-save-btn"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg font-semibold shadow-2xl"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
