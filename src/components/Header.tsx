'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-item">Arsip Digital</span>
          <span className="header-breadcrumb-separator">/</span>
          <span className="header-breadcrumb-item current">{title}</span>
          {subtitle && (
            <>
              <span className="header-breadcrumb-separator">/</span>
              <span className="header-breadcrumb-item current">{subtitle}</span>
            </>
          )}
        </div>
      </div>
      <div className="header-right">
      </div>
    </header>
  );
}
