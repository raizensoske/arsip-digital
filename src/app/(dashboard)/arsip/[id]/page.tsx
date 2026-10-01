'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  FileText,
  Image as ImageIcon,
  Calendar,
  Tag,
  User,
  Hash,
  Inbox,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { formatDateLong, formatFileSize } from '@/lib/utils';

interface ArchiveDetail {
  id: string;
  title: string;
  description: string | null;
  documentNumber: string | null;
  date: string;
  sender: string | null;
  receiver: string | null;
  category: { name: string; slug: string };
  createdBy: { name: string; username: string };
  files: { id: string; filePath: string; fileName: string; fileType: string; fileSize: number }[];
  createdAt: string;
  updatedAt: string;
}

export default function ArsipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/arsip/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setArchive)
      .catch(() => router.push('/arsip'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/arsip/${params.id}`, { method: 'DELETE' });
      router.push('/arsip');
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };



  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <span>Memuat detail arsip...</span>
      </div>
    );
  }

  if (!archive) return null;

  return (
    <div className="animate-fadeIn">
      <Link href="/arsip" className="back-link">
        <ArrowLeft size={18} />
        Kembali ke Daftar Arsip
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">{archive.title}</h1>
          <p className="page-subtitle">
            <span className="badge badge-primary" style={{ marginRight: '8px' }}>
              {archive.category.name}
            </span>
            Dibuat oleh {archive.createdBy.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href={`/arsip/${archive.id}/edit`}
            className="btn btn-secondary"
          >
            <Pencil size={16} />
            Edit
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-item-label">
              <Hash size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Nomor Dokumen
            </div>
            <div className="detail-item-value">
              {archive.documentNumber || '-'}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-item-label">
              <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Tanggal
            </div>
            <div className="detail-item-value">
              {formatDateLong(archive.date)}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-item-label">
              <Tag size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Kategori
            </div>
            <div className="detail-item-value">{archive.category.name}</div>
          </div>

          <div className="detail-item">
            <div className="detail-item-label">
              <User size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Dibuat Oleh
            </div>
            <div className="detail-item-value">{archive.createdBy.name}</div>
          </div>

          <div className="detail-item">
            <div className="detail-item-label">
              <Inbox size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Pengirim
            </div>
            <div className="detail-item-value">
              {archive.sender || '-'}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-item-label">
              <Send size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Penerima
            </div>
            <div className="detail-item-value">
              {archive.receiver || '-'}
            </div>
          </div>

          {archive.description && (
            <div className="detail-item full-width">
              <div className="detail-item-label">Deskripsi</div>
              <div className="detail-item-value" style={{ whiteSpace: 'pre-wrap' }}>
                {archive.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Viewer */}
      {archive.files && archive.files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {archive.files.map((file) => {
            const isImage = file.fileType?.startsWith('image/');
            const isPdf = file.fileType === 'application/pdf';

            return (
              <div key={file.id} className="file-viewer">
                <div className="file-viewer-header">
                  <div className="file-viewer-title">
                    {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                    {file.fileName}
                    {file.fileSize && (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 400 }}>
                        ({formatFileSize(file.fileSize)})
                      </span>
                    )}
                  </div>
                  <a
                    href={file.filePath}
                    download={file.fileName}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
                <div className="file-viewer-body">
                  {isImage ? (
                    <img src={file.filePath} alt={file.fileName} />
                  ) : isPdf ? (
                    <iframe src={file.filePath} title={file.fileName} />
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <FileText size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Preview tidak tersedia untuk tipe file ini.
                      </p>
                      <a
                        href={file.filePath}
                        download={file.fileName}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '12px' }}
                      >
                        <Download size={14} />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metadata */}
      <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
        <p>Dibuat: {formatDateLong(archive.createdAt)}</p>
        <p>Terakhir diubah: {formatDateLong(archive.updatedAt)}</p>
      </div>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ paddingTop: '32px' }}>
              <div className="confirm-icon danger">
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>
                Hapus Arsip?
              </h3>
              <p className="confirm-text">
                Anda akan menghapus &ldquo;{archive.title}&rdquo;. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDelete(false)} disabled={deleting}>
                Batal
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
