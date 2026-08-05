import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLIENT_PROFILE_PERMISSIONS = [
  {
    key: 'clients.view',
    group: 'Clients',
    description: 'View client list and profiles',
  },
  {
    key: 'clients.create',
    group: 'Clients',
    description: 'Create new clients',
  },
  {
    key: 'clients.edit',
    group: 'Clients',
    description: 'Edit client details',
  },
  {
    key: 'clients.archive',
    group: 'Clients',
    description: 'Archive clients',
  },
];

async function main() {
  console.log('Seeding Client Profiles permissions only...');

  for (const permission of CLIENT_PROFILE_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission,
    });
  }

  console.log('Seed complete. No companies, users or operational demo records created.');
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
