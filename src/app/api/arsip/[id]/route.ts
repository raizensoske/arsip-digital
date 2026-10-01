import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFiles, deleteUploadedFile } from '@/lib/server-utils';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const archive = await prisma.archive.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: { select: { name: true, username: true } },
        files: true,
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
    const files = formData.getAll('files') as File[];

    if (!title || !date || !categoryId) {
      return NextResponse.json(
        { error: 'Judul, tanggal, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const updateData: Prisma.ArchiveUpdateInput = {
      title,
      description: description || null,
      documentNumber: documentNumber || null,
      date: new Date(date),
      sender: sender || null,
      receiver: receiver || null,
      category: { connect: { id: categoryId } },
    };

    if (files.length > 0 && files[0].size > 0) {
      // Delete old files from disk and database
      const oldArchive = await prisma.archive.findUnique({
        where: { id },
        include: { files: true },
      });
      
      if (oldArchive?.files) {
        for (const file of oldArchive.files) {
          deleteUploadedFile(file.filePath);
        }
        await prisma.archiveFile.deleteMany({
          where: { archiveId: id }
        });
      }

      const fileDataArray = await uploadFiles(files);

      updateData.files = {
        create: fileDataArray
      };
    }

    const archive = await prisma.archive.update({
      where: { id },
      data: updateData,
      include: { category: true, files: true },
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

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only ADMIN or the archive creator can delete
    const archive = await prisma.archive.findUnique({
      where: { id },
      include: { files: true }
    });

    if (!archive) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }

    if (userRole !== 'ADMIN' && archive.createdById !== userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus arsip ini' },
        { status: 403 }
      );
    }

    // Delete files from disk
    if (archive.files) {
      for (const file of archive.files) {
        deleteUploadedFile(file.filePath);
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
