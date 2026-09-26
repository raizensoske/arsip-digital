'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Save,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function TambahArsipPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    sender: '',
    receiver: '',
    categoryId: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('Ukuran file maksimal 10MB');
      return;
    }
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Tipe file tidak didukung. Gunakan PDF, JPG, PNG, atau DOCX.');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.date || !form.categoryId) {
      setError('Judul, tanggal, dan kategori wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/arsip', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan arsip');
      }

      const data = await res.json();
      setSuccess('Arsip berhasil disimpan!');
      setTimeout(() => {
        router.push(`/arsip/${data.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-fadeIn">
      <Link href="/arsip" className="back-link">
        <ArrowLeft size={18} />
        Kembali ke Daftar Arsip
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">Tambah Arsip Baru</h1>
          <p className="page-subtitle">Isi formulir untuk menambahkan arsip baru</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Informasi Dokumen
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Judul Dokumen *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Masukkan judul dokumen"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="documentNumber">
                Nomor Dokumen
              </label>
              <input
                id="documentNumber"
                name="documentNumber"
                type="text"
                className="form-input"
                placeholder="Contoh: 001/SM/UPTD-JJ/2024"
                value={form.documentNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">
                Tanggal *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="categoryId">
                Kategori *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="form-select"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sender">
                Pengirim
              </label>
              <input
                id="sender"
                name="sender"
                type="text"
                className="form-input"
                placeholder="Nama pengirim"
                value={form.sender}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="receiver">
              Penerima
            </label>
            <input
              id="receiver"
              name="receiver"
              type="text"
              className="form-input"
              placeholder="Nama penerima"
              value={form.receiver}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Deskripsi / Keterangan
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Deskripsi singkat tentang dokumen ini..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Upload File
          </h3>

          <div
            className={`file-upload-zone ${dragActive ? 'active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload size={40} className="file-upload-zone-icon" />
            <p className="file-upload-zone-text">
              Seret & lepas file di sini, atau{' '}
              <span style={{ color: 'var(--text-accent)' }}>pilih file</span>
            </p>
            <p className="file-upload-zone-hint">
              PDF, JPG, PNG, DOCX — Maks. 10MB
            </p>
          </div>

          <input
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />

          {file && (
            <div className="file-preview">
              <FileText size={20} style={{ color: 'var(--primary-400)' }} />
              <div className="file-preview-info">
                <div className="file-preview-name">{file.name}</div>
                <div className="file-preview-size">
                  {formatFileSize(file.size)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setFile(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/arsip" className="btn btn-secondary">
            Batal
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Arsip
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
