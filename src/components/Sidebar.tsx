'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import {
  Archive,
  LayoutDashboard,
  FileText,
  Printer,
  Users,
  LogOut,
  X,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  href: string;
  icon: any;
  text: string;
  adminOnly?: boolean;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    label: 'Menu Utama',
    items: [
      { href: '/', icon: LayoutDashboard, text: 'Dashboard' },
      { href: '/arsip', icon: FileText, text: 'Arsip Dokumen' },
      { href: '/laporan', icon: Printer, text: 'Cetak Laporan' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [{ href: '/users', icon: Users, text: 'Kelola User', adminOnly: true }],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const userRole = (session?.user as any)?.role || 'STAFF';
  const userName = session?.user?.name || 'User';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Archive size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h1>ARUNIKA</h1>
            <span>UPTD Jalan &amp; Jembatan</span>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.adminOnly || userRole === 'ADMIN'
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="sidebar-section-label">{section.label}</div>
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.icon size={20} className="sidebar-link-icon" />
                    {item.text}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
          >
            <div className="theme-toggle-track">
              <Sun size={14} className="theme-toggle-icon theme-toggle-sun" />
              <Moon size={14} className="theme-toggle-icon theme-toggle-moon" />
              <div className="theme-toggle-thumb" />
            </div>
            <span>{theme === 'light' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">
                {userRole === 'ADMIN' ? 'Administrator' : 'Staff'}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
