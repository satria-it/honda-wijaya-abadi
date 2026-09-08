import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { adminApi, resolveImageUrl } from '../services/api';
import { toast } from 'sonner';

export const ImageUploader = ({ value, onChange, label = 'Gambar', testId = 'image-uploader' }) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await adminApi.uploadFile(file);
      onChange(data.url);
      setUrlInput(data.url);
      toast.success('Gambar berhasil diupload');
    } catch (err) {
      toast.error('Upload gagal: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value);
  };

  const handleClear = () => {
    setUrlInput('');
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const previewUrl = resolveImageUrl(value);

  return (
    <div>
      <label className="text-gray-300 text-sm font-medium block mb-2">{label}</label>
      <div className="space-y-3">
        {previewUrl && (
          <div className="relative w-full h-48 bg-zinc-800 border border-white/10 rounded-lg overflow-hidden">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            data-testid={`${testId}-upload-btn`}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-white/20 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Upload Gambar'}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Atau masukkan URL gambar:</label>
          <input
            type="text"
            value={urlInput}
            onChange={handleUrlChange}
            data-testid={`${testId}-url`}
            placeholder="https://..."
            className="w-full bg-zinc-800 border border-white/20 text-white px-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
};
