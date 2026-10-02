'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  FileText,
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  Inbox,
  Send,
  Camera,
  Clock,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Stats {
  totalArchives: number;
  monthArchives: number;
  totalCategories: number;
  totalUsers: number;
}

interface CategoryCount {
  name: string;
  slug: string;
  count: number;
}

interface RecentArchive {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  date: string;
  createdAt: string;
}

const categoryIcons: Record<string, any> = {
  'surat-masuk': Inbox,
  'surat-keluar': Send,
  'dokumen-proyek': FolderKanban,
  'laporan': FileText,
  'foto-dokumentasi': Camera,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalArchives: 0,
    monthArchives: 0,
    totalCategories: 0,
    totalUsers: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [recentArchives, setRecentArchives] = useState<RecentArchive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats || { totalArchives: 0, monthArchives: 0, totalCategories: 0, totalUsers: 0 });
        setCategoryCounts(data.categoryCounts || []);
        setRecentArchives(data.recentArchives || []);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };



  const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <span>Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang di ARUNIKA</p>
        </div>
        <Link href="/arsip/tambah" className="btn btn-primary">
          <Plus size={18} />
          Tambah Arsip
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card animate-fadeInUp stagger-1">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Archive size={22} />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalArchives}</div>
          <div className="stat-card-label">Total Arsip</div>
        </div>

        <div className="stat-card animate-fadeInUp stagger-2">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-card-value">{stats.monthArchives}</div>
          <div className="stat-card-label">Arsip Bulan Ini</div>
        </div>

        <div className="stat-card animate-fadeInUp stagger-3">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <FolderKanban size={22} />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalCategories}</div>
          <div className="stat-card-label">Kategori</div>
        </div>

        <div className="stat-card animate-fadeInUp stagger-4">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalUsers}</div>
          <div className="stat-card-label">Total User</div>
        </div>
      </div>

      {/* Chart & Recent */}
      <div className="dashboard-grid">
        {/* Bar Chart */}
        <div className="card animate-fadeInUp stagger-5">
          <div className="section-header">
            <h2 className="section-title">Distribusi Arsip per Kategori</h2>
          </div>
          <div className="chart-container">
            {categoryCounts.length > 0 ? (
              <div className="bar-chart">
                {categoryCounts.map((cat) => (
                  <div key={cat.slug} className="bar-chart-item">
                    <div className="bar-chart-value">{cat.count}</div>
                    <div
                      className="bar-chart-bar"
                      style={{
                        height: `${Math.max((cat.count / maxCount) * 100, 3)}%`,
                      }}
                    />
                    <div className="bar-chart-label">{cat.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <p className="empty-state-text">Belum ada data arsip</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Archives */}
        <div className="card animate-fadeInUp stagger-6">
          <div className="section-header">
            <h2 className="section-title">Arsip Terbaru</h2>
            <Link href="/arsip" className="section-link">
              Lihat Semua <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          {recentArchives.length > 0 ? (
            <div className="recent-list">
              {recentArchives.map((archive) => {
                const IconComp = categoryIcons[archive.categorySlug] || FileText;
                return (
                  <Link
                    key={archive.id}
                    href={`/arsip/${archive.id}`}
                    className="recent-item"
                  >
                    <div className="recent-item-icon">
                      <IconComp size={20} />
                    </div>
                    <div className="recent-item-info">
                      <div className="recent-item-title">{archive.title}</div>
                      <div className="recent-item-meta">
                        <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {archive.categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="recent-item-date">
                      {formatDateShort(archive.date)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <Archive size={40} className="empty-state-icon" />
              <p className="empty-state-title">Belum ada arsip</p>
              <p className="empty-state-text">
                Mulai tambahkan arsip pertama Anda
              </p>
              <Link href="/arsip/tambah" className="btn btn-primary btn-sm">
                <Plus size={16} />
                Tambah Arsip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
