import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const emptyForm = { name: '', motor: '', rating: 5, comment: '', date: '' };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await publicApi.getTestimonials());
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
    setForm({
      name: item.name, motor: item.motor, rating: item.rating,
      comment: item.comment, date: item.date || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editing) {
        await adminApi.updateTestimonial(editing.id, payload);
        toast.success('Testimoni diperbarui');
      } else {
        await adminApi.createTestimonial(payload);
        toast.success('Testimoni ditambahkan');
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
    if (!window.confirm(`Hapus testimoni dari "${item.name}"?`)) return;
    await adminApi.deleteTestimonial(item.id);
    toast.success('Testimoni dihapus');
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Kelola Testimoni</h1>
          <p className="text-gray-400">Atur testimoni pelanggan yang ditampilkan di website</p>
        </div>
        <Button
          onClick={openAdd}
          data-testid="admin-add-testimonial"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Testimoni
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">"{item.comment}"</p>
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-white font-bold">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.motor}</div>
                </div>
                <div className="text-xs text-gray-500">{item.date}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => openEdit(item)}
                  variant="outline"
                  size="sm"
                  data-testid={`admin-edit-testimonial-${item.id}`}
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Pencil className="w-3 h-3 mr-1" />Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item)}
                  variant="outline"
                  size="sm"
                  data-testid={`admin-delete-testimonial-${item.id}`}
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
              {editing ? 'Edit Testimoni' : 'Tambah Testimoni'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-name" className="text-gray-300">Nama</Label>
                <Input
                  id="t-name"
                  data-testid="testimonial-form-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="t-motor" className="text-gray-300">Motor</Label>
                <Input
                  id="t-motor"
                  data-testid="testimonial-form-motor"
                  value={form.motor}
                  onChange={(e) => setForm({ ...form, motor: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-rating" className="text-gray-300">Rating (1-5)</Label>
                <select
                  id="t-rating"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-white/20 text-white px-3 py-2 rounded-md mt-2"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} bintang</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="t-date" className="text-gray-300">Tanggal</Label>
                <Input
                  id="t-date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="1 minggu lalu"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="t-comment" className="text-gray-300">Komentar</Label>
              <Textarea
                id="t-comment"
                data-testid="testimonial-form-comment"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
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
                data-testid="testimonial-form-submit"
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
