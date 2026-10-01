import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalArchives, monthArchives, totalCategories, totalUsers] =
      await Promise.all([
        prisma.archive.count(),
        prisma.archive.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        prisma.category.count(),
        prisma.user.count(),
      ]);

    const categories = await prisma.category.findMany({
      include: { _count: { select: { archives: true } } },
      orderBy: { name: 'asc' },
    });

    const categoryCounts = categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat._count.archives,
    }));

    const recentArchivesRaw = await prisma.archive.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    const recentArchives = recentArchivesRaw.map((a) => ({
      id: a.id,
      title: a.title,
      categoryName: a.category.name,
      categorySlug: a.category.slug,
      date: a.date.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      stats: { totalArchives, monthArchives, totalCategories, totalUsers },
      categoryCounts,
      recentArchives,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
