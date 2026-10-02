import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'ARUNIKA — Arsip UPTD Jalan & Jembatan',
  description:
    'ARUNIKA (Arsip UPTD Jalan dan Jembatan Bina Konstruksi), Dinas BMBK Provinsi Lampung. Kelola surat masuk, surat keluar, dokumen proyek, dan arsip digital lainnya.',
  keywords: 'arunika, arsip digital, UPTD, jalan, jembatan, lampung, dinas BMBK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
