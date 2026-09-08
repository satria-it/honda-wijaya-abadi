import { useState } from 'react';
import { Save, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function AdminAccount() {
  const { admin, updateAdmin } = useAuth();
  const [form, setForm] = useState({
    current_password: '',
    new_username: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current_password) {
      toast.error('Masukkan password saat ini');
      return;
    }

    if (!form.new_username && !form.new_password) {
      toast.error('Masukkan username baru atau password baru');
      return;
    }

    if (form.new_password && form.new_password !== form.confirm_password) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    if (form.new_password && form.new_password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setSaving(true);
    try {
      const data = await adminApi.changeCredentials(
        form.current_password,
        form.new_username || null,
        form.new_password || null
      );
      updateAdmin(data.username, data.token);
      toast.success('Kredensial berhasil diubah!');
      setForm({ current_password: '', new_username: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal';
      toast.error(typeof detail === 'string' ? detail : 'Gagal mengubah kredensial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Akun Saya</h1>
        <p className="text-gray-400">Ubah username dan password akun admin</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {admin?.username?.[1]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="text-sm text-gray-400">Username Saat Ini</div>
              <div className="text-2xl font-bold text-white font-['Sora']">{admin?.username}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-bold text-white font-['Sora'] mb-2">Ubah Kredensial</h2>

          <div>
            <Label className="text-gray-300">Password Saat Ini <span className="text-red-500">*</span></Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="password"
                value={form.current_password}
                data-testid="account-current-password"
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white pl-10"
                required
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="text-sm text-gray-400 mb-4">Isi salah satu atau keduanya:</div>

            <div className="mb-4">
              <Label className="text-gray-300">Username Baru (kosongkan jika tidak diubah)</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={form.new_username}
                  data-testid="account-new-username"
                  onChange={(e) => setForm({ ...form, new_username: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white pl-10"
                  placeholder={admin?.username}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Password Baru</Label>
                <Input
                  type="password"
                  value={form.new_password}
                  data-testid="account-new-password"
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <Label className="text-gray-300">Konfirmasi Password Baru</Label>
                <Input
                  type="password"
                  value={form.confirm_password}
                  data-testid="account-confirm-password"
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            data-testid="account-save-btn"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </div>
    </div>
  );
}
