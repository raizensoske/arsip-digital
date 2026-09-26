import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const archive = await prisma.archive.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: { select: { name: true, username: true } },
      },
    });

    if (!archive) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...archive,
      date: archive.date.toISOString(),
      createdAt: archive.createdAt.toISOString(),
      updatedAt: archive.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Archive detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archive' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const documentNumber = formData.get('documentNumber') as string;
    const date = formData.get('date') as string;
    const sender = formData.get('sender') as string;
    const receiver = formData.get('receiver') as string;
    const categoryId = formData.get('categoryId') as string;
    const file = formData.get('file') as File | null;

    if (!title || !date || !categoryId) {
      return NextResponse.json(
        { error: 'Judul, tanggal, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title,
      description: description || null,
      documentNumber: documentNumber || null,
      date: new Date(date),
      sender: sender || null,
      receiver: receiver || null,
      categoryId,
    };

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old file
      const oldArchive = await prisma.archive.findUnique({
        where: { id },
      });
      if (oldArchive?.filePath) {
        const oldPath = path.join(process.cwd(), 'public', oldArchive.filePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);

      updateData.filePath = `/uploads/${uniqueName}`;
      updateData.fileName = file.name;
      updateData.fileType = file.type;
      updateData.fileSize = file.size;
    }

    const archive = await prisma.archive.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(archive);
  } catch (error) {
    console.error('Archive update error:', error);
    return NextResponse.json(
      { error: 'Failed to update archive' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete file if exists
    const archive = await prisma.archive.findUnique({
      where: { id },
    });

    if (archive?.filePath) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', archive.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.archive.delete({ where: { id } });

    return NextResponse.json({ message: 'Arsip berhasil dihapus' });
  } catch (error) {
    console.error('Archive delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete archive' },
      { status: 500 }
    );
  }
}
