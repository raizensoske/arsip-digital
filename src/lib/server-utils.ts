import fs from 'fs';
import path from 'path';

/**
 * Upload files ke public/uploads dan return metadata array
 */
export async function uploadFiles(files: File[]): Promise<{
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}[]> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const file of files) {
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize: only allow safe extension characters
      const rawExt = file.name.split('.').pop() || 'bin';
      const ext = rawExt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

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
 * Hapus file dari public/uploads — guard path traversal
 */
export function deleteUploadedFile(filePath: string): void {
  if (!filePath.startsWith('/uploads/')) return;
  // Block path traversal
  if (filePath.includes('..')) return;
  const fullPath = path.join(process.cwd(), 'public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
