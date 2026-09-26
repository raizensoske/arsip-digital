import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};

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

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'title-asc') orderBy = { title: 'asc' };
    if (sort === 'title-desc') orderBy = { title: 'desc' };

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where,
        include: {
          category: true,
          createdBy: { select: { name: true } },
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
    const file = formData.get('file') as File | null;

    if (!title || !date || !categoryId) {
      return NextResponse.json(
        { error: 'Judul, tanggal, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    let filePath = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, uniqueName), buffer);

      filePath = `/uploads/${uniqueName}`;
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;
    }

    const archive = await prisma.archive.create({
      data: {
        title,
        description: description || null,
        documentNumber: documentNumber || null,
        date: new Date(date),
        sender: sender || null,
        receiver: receiver || null,
        categoryId,
        filePath,
        fileName,
        fileType,
        fileSize,
        createdById: (session.user as any).id,
      },
      include: { category: true },
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
