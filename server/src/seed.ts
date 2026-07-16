import { prisma } from './config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  const password = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hubevent.com' },
    update: {},
    create: {
      email: 'admin@hubevent.com',
      password,
      name: 'Admin HubEvent',
      role: 'admin',
    },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: 'organisateur@hubevent.com' },
    update: {},
    create: {
      email: 'organisateur@hubevent.com',
      password,
      name: 'Organisateur Autonome',
      role: 'organizer',
      organizerId: 'org-1',
    },
  });

  const event = await prisma.event.upsert({
    where: { id: 'evt-seed-1' },
    update: {},
    create: {
      id: 'evt-seed-1',
      name: 'Festival HWENDO-CULTURE 2026',
      description: 'Le plus grand festival culturel du Bénin',
      country: 'Bénin',
      city: 'Cotonou',
      location: 'Palais des Congrès',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-07'),
      voteStartDate: new Date('2026-05-01'),
      voteEndDate: new Date('2026-06-05'),
      status: 'Actif',
      isAccompanied: false,
      votePriceCFA: 100,
      organizerId: 'org-1',
      organizerName: 'Organisateur Autonome',
    },
  });

  const cat = await prisma.category.upsert({
    where: { id: 'cat-seed-1' },
    update: {},
    create: {
      id: 'cat-seed-1',
      eventId: event.id,
      name: 'Miss HWENDO-CULTURE',
      description: 'Concours de beauté et d\'élégance',
      voteType: 'both',
    },
  });

  await prisma.candidate.upsert({
    where: { id: 'cand-seed-1' },
    update: {},
    create: {
      id: 'cand-seed-1',
      categoryId: cat.id,
      eventId: event.id,
      name: 'Aminata Diallo',
      bio: 'Étudiante en communication',
      votesCount: 150,
    },
  });

  await prisma.votePack.upsert({
    where: { id: 'pack-seed-1' },
    update: {},
    create: {
      id: 'pack-seed-1',
      eventId: event.id,
      name: 'Bronze',
      votesCount: 10,
      priceCFA: 900,
      discountPercent: 10,
    },
  });

  await prisma.votePack.upsert({
    where: { id: 'pack-seed-2' },
    update: {},
    create: {
      id: 'pack-seed-2',
      eventId: event.id,
      name: 'Gold',
      votesCount: 100,
      priceCFA: 8500,
      discountPercent: 15,
    },
  });

  console.log('Seed completed');
  console.log(`Admin: admin@hubevent.com / admin123`);
  console.log(`Organizer: organisateur@hubevent.com / admin123`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
