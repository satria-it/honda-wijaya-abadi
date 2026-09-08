import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const emptyForm = { title: '', description: '', terms: '' };

export default function AdminPromos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await publicApi.getPromos());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description, terms: item.terms || '' });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updatePromo(editing.id, form);
        toast.success('Promo diperbarui');
      } else {
        await adminApi.createPromo(form);
        toast.success('Promo ditambahkan');
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      toast.error('Gagal: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus promo "${item.title}"?`)) return;
    await adminApi.deletePromo(item.id);
    toast.success('Promo dihapus');
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Kelola Promo</h1>
          <p className="text-gray-400">Atur promo dan penawaran khusus</p>
        </div>
        <Button
          onClick={openAdd}
          data-testid="admin-add-promo"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Promo
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white font-['Sora'] mb-2">{item.title}</h3>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <div className="inline-block bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-3 py-1 rounded-full mb-4">
                {item.terms}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => openEdit(item)}
                  data-testid={`admin-edit-promo-${item.id}`}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Pencil className="w-3 h-3 mr-1" />Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item)}
                  data-testid={`admin-delete-promo-${item.id}`}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 bg-transparent text-red-500 hover:bg-red-600/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Sora']">
              {editing ? 'Edit Promo' : 'Tambah Promo Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="p-title" className="text-gray-300">Judul Promo</Label>
              <Input
                id="p-title"
                data-testid="promo-form-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-desc" className="text-gray-300">Deskripsi</Label>
              <Textarea
                id="p-desc"
                data-testid="promo-form-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="p-terms" className="text-gray-300">Syarat & Ketentuan</Label>
              <Input
                id="p-terms"
                data-testid="promo-form-terms"
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                placeholder="S&K Berlaku"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Batal
              </Button>
              <Button
                type="submit"
                data-testid="promo-form-submit"
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? 'Menyimpan...' : (editing ? 'Perbarui' : 'Tambahkan')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
