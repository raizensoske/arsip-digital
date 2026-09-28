const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  // Create default staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPassword,
      name: 'Staff UPTD',
      role: 'STAFF',
    },
  });

  // Create default categories
  const categories = [
    {
      name: 'Surat Masuk',
      slug: 'surat-masuk',
      description: 'Surat yang diterima dari pihak luar',
      icon: 'inbox',
    },
    {
      name: 'Surat Keluar',
      slug: 'surat-keluar',
      description: 'Surat yang dikirim ke pihak luar',
      icon: 'send',
    },
    {
      name: 'Dokumen Proyek',
      slug: 'dokumen-proyek',
      description: 'Kontrak, RAB, berita acara, dan dokumen proyek lainnya',
      icon: 'folder-kanban',
    },
    {
      name: 'Laporan',
      slug: 'laporan',
      description: 'Laporan kegiatan, laporan bulanan, laporan tahunan',
      icon: 'file-text',
    },
    {
      name: 'Foto Dokumentasi',
      slug: 'foto-dokumentasi',
      description: 'Foto dokumentasi kegiatan dan proyek',
      icon: 'camera',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Seed completed!');
  console.log('   Admin user: admin / admin123');
  console.log('   Staff user: staff / staff123');
  console.log(`   Categories: ${categories.length} created`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
