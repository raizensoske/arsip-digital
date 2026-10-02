'use client';

import { useEffect, useState } from 'react';
import {
  Printer,
  Search,
  FileText,
  Calendar,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface ReportArchive {
  id: string;
  title: string;
  documentNumber: string | null;
  date: string;
  sender: string | null;
  receiver: string | null;
  category: { name: string };
  createdBy: { name: string };
  fileName: string | null;
  fileCount: number;
}

interface Summary {
  name: string;
  count: number;
}

export default function LaporanPage() {
  const [archives, setArchives] = useState<ReportArchive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const res = await fetch(`/api/laporan?${params}`);
      const data = await res.json();
      setArchives(data.archives);
      setSummary(data.summary);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };



  const getFilterDescription = () => {
    const parts: string[] = [];
    if (filters.startDate) parts.push(`dari ${formatDateShort(filters.startDate)}`);
    if (filters.endDate) parts.push(`sampai ${formatDateShort(filters.endDate)}`);
    if (filters.category) {
      const cat = categories.find((c) => c.id === filters.category);
      if (cat) parts.push(`kategori: ${cat.name}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Semua arsip';
  };

  return (
    <div className="animate-fadeIn">
      {/* Print Header (hidden on screen) */}
      <div className="print-only">
        <div className="print-header">
          <h1>LAPORAN ARSIP DOKUMEN — ARUNIKA</h1>
          <p>Arsip UPTD Jalan dan Jembatan Bina Konstruksi — Dinas BMBK Provinsi Lampung</p>
          <p style={{ marginTop: '8px' }}>Filter: {getFilterDescription()}</p>
          <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Cetak Laporan</h1>
          <p className="page-subtitle">Generate dan cetak laporan arsip</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card no-print" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
          <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Filter Laporan
        </h3>

        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Mulai</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Akhir</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                Memuat...
              </>
            ) : (
              <>
                <Search size={16} />
                Generate Laporan
              </>
            )}
          </button>
          {archives.length > 0 && (
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              Cetak
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {archives.length > 0 && (
        <>
          {/* Summary */}
          <div className="report-summary no-print">
            {summary
              .filter((s) => s.count > 0)
              .map((s) => (
                <div key={s.name} className="card" style={{ textAlign: 'center' }}>
                  <div className="report-summary-value">{s.count}</div>
                  <div className="report-summary-label">{s.name}</div>
                </div>
              ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }} className="no-print">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Total: {total} arsip
                </span>
              </div>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Judul</th>
                    <th>No. Dokumen</th>
                    <th>Kategori</th>
                    <th>Tanggal</th>
                    <th>Pengirim</th>
                    <th>Penerima</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {archives.map((archive, idx) => (
                    <tr key={archive.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{archive.title}</td>
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
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {archive.receiver || '-'}
                      </td>
                      <td>
                        {archive.fileName ? (
                          <span className="badge badge-success" style={{ fontSize: '11px' }}>Ada</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && archives.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <FileText size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">Belum ada laporan</h3>
            <p className="empty-state-text">
              Pilih filter dan klik &quot;Generate Laporan&quot; untuk memulai.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
