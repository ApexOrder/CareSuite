import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIRM_CLEAR_DUMMY_DATA !== 'yes') {
    throw new Error(
      'Refusing to clear data. Re-run with CONFIRM_CLEAR_DUMMY_DATA=yes.',
    );
  }

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.medicationAdministration.deleteMany(),
    prisma.medicationOrder.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.carePlan.deleteMany(),
    prisma.audit.deleteMany(),
    prisma.risk.deleteMany(),
    prisma.action.deleteMany(),
    prisma.visit.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.client.deleteMany(),
  ]);

  console.log('Operational demo data cleared.');
  console.log('Companies, users, roles and permissions were preserved.');
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
