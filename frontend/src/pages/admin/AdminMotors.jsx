import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, publicApi, resolveImageUrl } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ImageUploader } from '../../components/ImageUploader';

const emptyForm = {
  name: '',
  category: 'Matic',
  price: '',
  image: '',
  specs: '',
  description: '',
};

export default function AdminMotors() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await publicApi.getMotors();
    setMotors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (motor) => {
    setEditing(motor);
    setForm({
      name: motor.name,
      category: motor.category,
      price: motor.price,
      image: motor.image,
      specs: (motor.specs || []).join(', '),
      description: motor.description || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        specs: form.specs.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editing) {
        await adminApi.updateMotor(editing.id, payload);
        toast.success('Motor diperbarui');
      } else {
        await adminApi.createMotor(payload);
        toast.success('Motor ditambahkan');
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      toast.error('Gagal: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (motor) => {
    if (!window.confirm(`Hapus motor "${motor.name}"?`)) return;
    try {
      await adminApi.deleteMotor(motor.id);
      toast.success('Motor dihapus');
      await load();
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const categories = ['Matic', 'Matic Premium', 'Sport', 'Adventure', 'Bebek'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white font-['Sora'] mb-2">Kelola Motor</h1>
          <p className="text-gray-400">Tambah, edit, atau hapus data motor Honda</p>
        </div>
        <Button
          onClick={openAdd}
          data-testid="admin-add-motor"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Motor
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motors.map((motor, idx) => (
            <motion.div
              key={motor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="relative h-48 bg-zinc-800">
                {motor.image && (
                  <img src={resolveImageUrl(motor.image)} alt={motor.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {motor.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white font-['Sora'] mb-1">{motor.name}</h3>
                <div className="text-red-500 font-bold mb-3">{motor.price}</div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{motor.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(motor)}
                    data-testid={`admin-edit-motor-${motor.id}`}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(motor)}
                    data-testid={`admin-delete-motor-${motor.id}`}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 bg-transparent text-red-500 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Sora']">
              {editing ? 'Edit Motor' : 'Tambah Motor Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="m-name" className="text-gray-300">Nama Motor</Label>
              <Input
                id="m-name"
                data-testid="motor-form-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="m-cat" className="text-gray-300">Kategori</Label>
                <select
                  id="m-cat"
                  data-testid="motor-form-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/20 text-white px-3 py-2 rounded-md mt-2"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="m-price" className="text-gray-300">Harga</Label>
                <Input
                  id="m-price"
                  data-testid="motor-form-price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-zinc-800 border-white/20 text-white mt-2"
                  placeholder="Rp 18.000.000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="m-specs" className="text-gray-300">Spesifikasi (pisahkan dengan koma)</Label>
              <Input
                id="m-specs"
                data-testid="motor-form-specs"
                value={form.specs}
                onChange={(e) => setForm({ ...form, specs: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                placeholder="110cc, eSP, Smart Key"
              />
            </div>

            <div>
              <Label htmlFor="m-desc" className="text-gray-300">Deskripsi</Label>
              <Textarea
                id="m-desc"
                data-testid="motor-form-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800 border-white/20 text-white mt-2"
                rows={3}
              />
            </div>

            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              label="Gambar Motor"
              testId="motor-image"
            />

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
                data-testid="motor-form-submit"
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
