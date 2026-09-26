import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate + 'T23:59:59.999Z') };
    }

    const archives = await prisma.archive.findMany({
      where,
      include: {
        category: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    // Summary by category
    const summary = categories.map((cat) => ({
      name: cat.name,
      count: archives.filter((a) => a.categoryId === cat.id).length,
    }));

    return NextResponse.json({
      archives: archives.map((a) => ({
        ...a,
        date: a.date.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      summary,
      total: archives.length,
      categories,
    });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
