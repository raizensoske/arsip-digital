import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFiles } from '@/lib/server-utils';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    const where: Prisma.ArchiveWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { documentNumber: { contains: search } },
        { sender: { contains: search } },
        { receiver: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    let orderBy: Prisma.ArchiveOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'title-asc') orderBy = { title: 'asc' };
    if (sort === 'title-desc') orderBy = { title: 'desc' };

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where,
        include: {
          category: true,
          createdBy: { select: { name: true } },
          _count: { select: { files: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.archive.count({ where }),
    ]);

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      archives: archives.map((a) => ({
        ...a,
        date: a.date.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    console.error('Archive list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const fileDataArray = await uploadFiles(files);

    const archive = await prisma.archive.create({
      data: {
        title,
        description: description || null,
        documentNumber: documentNumber || null,
        date: new Date(date),
        sender: sender || null,
        receiver: receiver || null,
        categoryId,
        createdById: (session.user as any).id,
        files: {
          create: fileDataArray,
        }
      },
      include: { category: true, files: true },
    });

    return NextResponse.json(archive, { status: 201 });
  } catch (error) {
    console.error('Archive create error:', error);
    return NextResponse.json(
      { error: 'Failed to create archive' },
      { status: 500 }
    );
  }
}
