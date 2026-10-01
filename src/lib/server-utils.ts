import fs from 'fs';
import path from 'path';

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Upload files — otomatis pakai Vercel Blob jika BLOB_READ_WRITE_TOKEN ada,
 * fallback ke public/uploads untuk lokal (SQLite/Postgres tanpa Blob).
 */
export async function uploadFiles(files: File[]): Promise<{
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}[]> {
  const results: { filePath: string; fileName: string; fileType: string; fileSize: number }[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const rawExt = file.name.split('.').pop() || 'bin';
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    if (USE_BLOB) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${uniqueName}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      results.push({
        filePath: blob.url, // absolute https://...blob.vercel-storage.com/...
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    } else {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);
      results.push({
        filePath: `/uploads/${uniqueName}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    }
  }

  return results;
}

/**
 * Hapus file — support Blob (URL) dan lokal (/uploads/...)
 */
export async function deleteUploadedFile(filePath: string): Promise<void> {
  if (!filePath) return;

  // Vercel Blob URL
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    if (USE_BLOB) {
      try {
        const { del } = await import('@vercel/blob');
        await del(filePath);
      } catch (e) {
        console.warn('Blob delete failed:', e);
      }
    }
    return;
  }

  // Lokal — guard path traversal
  if (!filePath.startsWith('/uploads/')) return;
  if (filePath.includes('..')) return;
  const fullPath = path.join(process.cwd(), 'public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
