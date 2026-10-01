'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Archive {
  id: string;
  title: string;
  documentNumber: string | null;
  date: string;
  sender: string | null;
  category: { name: string; slug: string };
  createdBy: { name: string };
  _count: { files: number };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ArsipPage() {
  const router = useRouter();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: debouncedSearch,
        category: categoryFilter,
        sort,
      });
      const res = await fetch(`/api/arsip?${params}`);
      const data = await res.json();
      setArchives(data.archives);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, sort]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, sort]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/arsip/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchArchives();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };



  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Arsip Dokumen</h1>
          <p className="page-subtitle">{total} arsip ditemukan</p>
        </div>
        <Link href="/arsip/tambah" className="btn btn-primary">
          <Plus size={18} />
          Tambah Arsip
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Cari judul, nomor dokumen, pengirim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ minWidth: '160px' }}
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="title-asc">Judul A-Z</option>
          <option value="title-desc">Judul Z-A</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-page">
          <div className="loading-spinner" />
          <span>Memuat data...</span>
        </div>
      ) : archives.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">Belum ada arsip</h3>
            <p className="empty-state-text">
              {search || categoryFilter
                ? 'Tidak ada arsip yang cocok dengan filter Anda.'
                : 'Mulai tambahkan arsip pertama Anda.'}
            </p>
            {!search && !categoryFilter && (
              <Link href="/arsip/tambah" className="btn btn-primary">
                <Plus size={16} />
                Tambah Arsip
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>No. Dokumen</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Pengirim / Penerima</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((archive) => (
                  <tr key={archive.id}>
                    <td>
                      <Link
                        href={`/arsip/${archive.id}`}
                        style={{ color: 'var(--text-accent)', fontWeight: 500 }}
                      >
                        {archive.title}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {archive.documentNumber || '-'}
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {archive.category.name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDateShort(archive.date)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {archive.sender || '-'}
                    </td>
                    <td>
                      {archive._count?.files > 0 ? (
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>
                          <FileText size={12} style={{ marginRight: '4px' }} />
                          {archive._count.files} File
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                          Tidak ada
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => router.push(`/arsip/${archive.id}`)}
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() =>
                            router.push(`/arsip/${archive.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => setDeleteId(archive.id)}
                          title="Hapus"
                          style={{ color: 'var(--danger-400)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Halaman {page} dari {totalPages} ({total} arsip)
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ paddingTop: '32px' }}>
              <div className="confirm-icon danger">
                <AlertTriangle size={28} />
              </div>
              <h3
                style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                Hapus Arsip?
              </h3>
              <p className="confirm-text">
                Arsip yang dihapus tidak dapat dikembalikan. File yang terkait juga akan dihapus.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
