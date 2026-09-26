'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/arsip': 'Arsip Dokumen',
  '/arsip/tambah': 'Tambah Arsip',
  '/laporan': 'Cetak Laporan',
  '/users': 'Kelola User',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getTitle = () => {
    // Check exact match first
    if (pageTitles[pathname]) return pageTitles[pathname];
    // Check partial match
    if (pathname.startsWith('/arsip/') && pathname.includes('/edit')) return 'Edit Arsip';
    if (pathname.startsWith('/arsip/')) return 'Detail Arsip';
    return 'Dashboard';
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header
          title={getTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
