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

const emptyForm = { number: '', title: '', description: '' };

export default function AdminManifesto() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await publicApi.getManifesto());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateManifesto(editing.id, form);
        toast.success('Diperbarui');
      } else {
        await adminApi.createManifesto(form);
        toast.success('Ditambahkan');
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
    if (!window.confirm(`Hapus "${item.title}"?`)) return;
    await adminApi.deleteManifesto(item.id);
    toast.success('Dihapus');
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Kelola Manifesto</h1>
          <p className="text-gray-400">Komitmen dan nilai-nilai perusahaan</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setForm(emptyForm); setIsOpen(true); }}
          data-testid="admin-add-manifesto"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Item
        </Button>
      </div>

      {loading ? <div className="text-gray-400">Memuat...</div> : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="text-5xl font-bold text-red-600/30 mb-3 font-['Sora']">{item.number}</div>
              <h3 className="text-xl font-bold text-white font-['Sora'] mb-2">{item.title}</h3>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => { setEditing(item); setForm({ number: item.number, title: item.title, description: item.description }); setIsOpen(true); }}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Pencil className="w-3 h-3 mr-1" />Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item)}
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
              {editing ? 'Edit Manifesto' : 'Tambah Manifesto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Nomor (misalnya 01, 02)</Label>
              <Input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                rows={4}
                required
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
