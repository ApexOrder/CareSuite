import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: 'clients.view', group: 'Clients', description: 'View client list and profiles' },
  { key: 'clients.create', group: 'Clients', description: 'Create new clients' },
  { key: 'clients.edit', group: 'Clients', description: 'Edit client details' },
  { key: 'clients.archive', group: 'Clients', description: 'Archive clients' },
  
  { key: 'staff.view', group: 'Staff', description: 'View staff list and profiles' },
  { key: 'staff.create', group: 'Staff', description: 'Add new staff members' },
  { key: 'staff.edit', group: 'Staff', description: 'Edit staff details' },
  { key: 'staff.archive', group: 'Staff', description: 'Archive staff members' },
  
  { key: 'visits.view', group: 'Visits', description: 'View visits and rota' },
  { key: 'visits.create', group: 'Visits', description: 'Schedule new visits' },
  { key: 'visits.edit', group: 'Visits', description: 'Modify visit details' },
  { key: 'visits.assign', group: 'Visits', description: 'Assign staff to visits' },
  { key: 'visits.status', group: 'Visits', description: 'Update visit status' },
  
  { key: 'users.view', group: 'Users', description: 'View company users' },
  { key: 'users.create', group: 'Users', description: 'Invite new users' },
  { key: 'users.edit', group: 'Users', description: 'Edit user details' },
  { key: 'users.disable', group: 'Users', description: 'Disable user accounts' },
  { key: 'users.assignRole', group: 'Users', description: 'Assign roles to users' },
  
  { key: 'settings.roles.view', group: 'Settings', description: 'View roles and permissions' },
  { key: 'settings.roles.manage', group: 'Settings', description: 'Create and edit roles' },
  
  { key: 'company.view', group: 'Company', description: 'View company settings' },
  { key: 'company.edit', group: 'Company', description: 'Edit company profile' },
  
  { key: 'billing.view', group: 'Billing', description: 'View subscription and invoices' },
  { key: 'billing.manage', group: 'Billing', description: 'Manage subscription' },
  
  { key: 'actions.view', group: 'Compliance', description: 'View actions and compliance' },
  { key: 'actions.create', group: 'Compliance', description: 'Create actions' },
  { key: 'actions.edit', group: 'Compliance', description: 'Edit actions' },
  { key: 'actions.assign', group: 'Compliance', description: 'Assign actions to staff' },
  { key: 'actions.close', group: 'Compliance', description: 'Close/Complete actions' },
  { key: 'actions.archive', group: 'Compliance', description: 'Archive actions' },
  
  { key: 'risks.view', group: 'Compliance', description: 'View risk register' },
  { key: 'risks.create', group: 'Compliance', description: 'Create risk assessments' },
  { key: 'risks.edit', group: 'Compliance', description: 'Edit risk assessments' },
  { key: 'risks.review', group: 'Compliance', description: 'Review and update risks' },
  { key: 'risks.archive', group: 'Compliance', description: 'Archive risks' },
  { key: 'risks.create_action', group: 'Compliance', description: 'Create actions from risks' },

  { key: 'audits.view', group: 'Compliance', description: 'View quality audits' },
  { key: 'audits.create', group: 'Compliance', description: 'Perform new audits' },
  { key: 'audits.edit', group: 'Compliance', description: 'Edit existing audits' },
  { key: 'audits.review', group: 'Compliance', description: 'Review audit results' },
  { key: 'audits.archive', group: 'Compliance', description: 'Archive audits' },
  { key: 'audits.create_action', group: 'Compliance', description: 'Create actions from audit findings' },
  { key: 'compliance.view', group: 'Compliance', description: 'View compliance dashboard' },
  { key: 'reports.view', group: 'Reporting', description: 'Access system reports' },

  { key: 'medication.view', group: 'Medication', description: 'View medication records' },
  { key: 'medication.create', group: 'Medication', description: 'Create medication records' },
  { key: 'medication.edit', group: 'Medication', description: 'Edit medication records' },
  { key: 'medication.archive', group: 'Medication', description: 'Archive medication records' },
  { key: 'medication.record', group: 'Medication', description: 'Record medication administration (MAR)' },
  { key: 'medication.stock_check', group: 'Medication', description: 'Perform medication stock checks' },
  
  { key: 'medication.orders.view', group: 'Medication', description: 'View medication orders' },
  { key: 'medication.orders.create', group: 'Medication', description: 'Create medication orders' },
  { key: 'medication.orders.edit', group: 'Medication', description: 'Edit medication orders' },
  { key: 'medication.orders.status', group: 'Medication', description: 'Update order status' },
  { key: 'medication.orders.collect', group: 'Medication', description: 'Mark orders as collected/received' },

  { key: 'carePlans.view', group: 'Care', description: 'View care plans' },
  { key: 'carePlans.create', group: 'Care', description: 'Create care plans' },
  { key: 'carePlans.edit', group: 'Care', description: 'Edit care plans' },
  { key: 'carePlans.review', group: 'Care', description: 'Review care plans' },
  { key: 'carePlans.archive', group: 'Care', description: 'Archive care plans' },
  
  { key: 'attachments.view', group: 'Documents', description: 'View and download attachments' },
  { key: 'attachments.upload', group: 'Documents', description: 'Upload new attachments' },
  { key: 'attachments.delete', group: 'Documents', description: 'Delete attachments' },

  { key: 'reports.view', group: 'Governance', description: 'View management reports' },
  { key: 'reports.export', group: 'Governance', description: 'Export data to CSV' },
];

async function main() {
  console.log('Seeding permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: perm,
      create: perm,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  console.log('Creating demo company...');
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-id' },
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'CareSuite Demo',
      tradingName: 'CareSuite Services',
      email: 'demo@caresuite.com',
      phone: '0123456789',
      addressLine1: '123 Care Street',
      town: 'London',
      postcode: 'SW1A 1AA',
    },
  });

  const roles = [
    { name: 'Owner', description: 'Full system access', isSystem: true },
    { name: 'Manager', description: 'Full operational control', isSystem: true },
    { name: 'Admin', description: 'Office administration', isSystem: true },
    { name: 'Coordinator', description: 'Rota and scheduling' },
    { name: 'Senior Carer', description: 'Care supervision' },
    { name: 'Carer', description: 'Direct care delivery' },
    { name: 'Auditor', description: 'Compliance auditing' },
    { name: 'Read Only', description: 'View-only access' },
  ];

  console.log('Creating default roles and assigning permissions...');
  for (const roleDef of roles) {
    const role = await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: roleDef.name } },
      update: {
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        companyId: company.id,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    let rolePerms: any[] = [];
    if (roleDef.name === 'Owner' || roleDef.name === 'Manager' || roleDef.name === 'Admin') {
      rolePerms = allPermissions;
    } else if (roleDef.name === 'Coordinator') {
      rolePerms = allPermissions.filter(p => p.key.startsWith('visits') || p.key.startsWith('clients.view') || p.key.startsWith('staff.view') || p.key.startsWith('medication.view') || p.key.startsWith('medication.orders'));
    } else if (roleDef.name === 'Senior Carer') {
      rolePerms = allPermissions.filter(p => p.key.startsWith('clients.view') || p.key.startsWith('staff.view') || p.key.startsWith('visits') || p.key.startsWith('medication.') || p.key.startsWith('carePlans.'));
    } else if (roleDef.name === 'Carer') {
      rolePerms = allPermissions.filter(p => (p.key === 'visits.view' || p.key === 'visits.status' || p.key === 'clients.view' || p.key === 'medication.view' || p.key === 'medication.record'));
    } else if (roleDef.name === 'Auditor') {
      rolePerms = allPermissions.filter(p => p.key.startsWith('audits.') || p.key.endsWith('.view'));
    } else if (roleDef.name === 'Read Only') {
      rolePerms = allPermissions.filter(p => p.key.endsWith('.view'));
    }

    for (const perm of rolePerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }

    if (roleDef.name === 'Owner') {
      console.log('Creating owner user...');
      const passwordHash = await bcrypt.hash('password123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@caresuite.com' },
        update: {
          roleId: role.id,
          status: 'ACTIVE'
        },
        create: {
          companyId: company.id,
          roleId: role.id,
          name: 'Demo Owner',
          email: 'admin@caresuite.com',
          passwordHash,
        },
      });
    }
  }

  console.log('Seeding some sample data...');
  
  // Clients
  const margaret = await prisma.client.upsert({
    where: { id: 'margaret-smith' },
    update: {},
    create: {
      id: 'margaret-smith',
      companyId: company.id,
      firstName: 'Margaret',
      lastName: 'Smith',
      dateOfBirth: new Date('1945-05-12'),
      addressLine1: '10 Rose Gardens',
      town: 'London',
      postcode: 'SE1 2BE',
      phone: '07700900123',
      carePackageStatus: 'ACTIVE',
      fundingType: 'PRIVATE',
      primaryContactName: 'John Smith',
      primaryContactPhone: '07700900124',
      primaryContactRelationship: 'Son',
    }
  });

  const arthur = await prisma.client.upsert({
    where: { id: 'arthur-pendragon' },
    update: {},
    create: {
      id: 'arthur-pendragon',
      companyId: company.id,
      firstName: 'Arthur',
      lastName: 'Pendragon',
      dateOfBirth: new Date('1938-10-22'),
      addressLine1: 'Camelot Court, 22 Knight Street',
      town: 'London',
      postcode: 'W1J 7JX',
      phone: '07700900777',
      carePackageStatus: 'ACTIVE',
      fundingType: 'LOCAL_AUTHORITY',
      notes: 'Requires assistance with mobility and meal preparation.',
    }
  });

  // Staff
  const alice = await prisma.staff.upsert({
    where: { id: 'alice-johnson' },
    update: {},
    create: {
      id: 'alice-johnson',
      companyId: company.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@caresuite.com',
      phone: '07700900555',
      jobTitle: 'Senior Carer',
      employmentStatus: 'ACTIVE',
      startDate: new Date('2023-01-15'),
      contractedHours: 37.5,
    }
  });

  const bob = await prisma.staff.upsert({
    where: { id: 'bob-miller' },
    update: {},
    create: {
      id: 'bob-miller',
      companyId: company.id,
      firstName: 'Bob',
      lastName: 'Miller',
      email: 'bob@caresuite.com',
      phone: '07700900666',
      jobTitle: 'Care Assistant',
      employmentStatus: 'ACTIVE',
      startDate: new Date('2024-02-01'),
      contractedHours: 20,
    }
  });

  // Care Plans
  await prisma.carePlan.create({
    data: {
      companyId: company.id,
      clientId: margaret.id,
      title: 'General Support Plan',
      status: 'Active',
      reviewDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      summary: 'Comprehensive support plan for daily living and personal care.',
      personalCareNeeds: 'Assist with morning wash and dressing.',
      mobilityNeeds: 'Requires assist of 1 and grab rails for transfers.',
      nutritionHydrationNeeds: 'Ensure protein-rich meals; client prefers light breakfast.'
    }
  });

  // Medications
  const med1 = await prisma.medication.create({
    data: {
      companyId: company.id,
      clientId: margaret.id,
      medicationName: 'Paracetamol',
      strength: '500mg',
      form: 'Tablet',
      route: 'Oral',
      dose: '1-2 tablets',
      dosageInstructions: 'Take every 4-6 hours as needed for pain.',
      frequency: 'PRN',
      medicationType: 'PRN',
      isPRN: true,
      prnGuidance: 'Assess pain level before administration. Do not exceed 8 tablets in 24 hours.',
      startDate: new Date(),
      status: 'Active'
    }
  });

  // Risks
  await prisma.risk.create({
    data: {
      companyId: company.id,
      linkedClientId: margaret.id,
      ownerUserId: alice.id,
      title: 'Fall Risk - High',
      description: 'Client has history of falls in the bathroom.',
      riskLevel: 'High',
      likelihood: 'High',
      impact: 'High',
      reviewDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'Open'
    }
  });

  // Actions
  await prisma.action.create({
    data: {
      companyId: company.id,
      title: 'Bathroom Handrail Installation',
      description: 'Handrail needed specifically for the shower area to mitigate fall risk.',
      priority: 'High',
      status: 'Open',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      sourceType: 'Risk Assessment',
      assignedToStaffId: alice.id
    }
  });

  // Audits
  await prisma.audit.create({
    data: {
      companyId: company.id,
      title: 'Monthly Medication Audit',
      auditType: 'Medication',
      auditorId: alice.id,
      auditDate: new Date(),
      status: 'Completed',
      result: 'Compliant',
      score: 100,
      findings: 'All medication records are accurate and up to date.',
      recommendations: 'Continue current monitoring protocol.'
    }
  });

  // Visits
  await prisma.visit.create({
    data: {
      companyId: company.id,
      clientId: margaret.id,
      staffId: alice.id,
      scheduledStart: new Date(new Date().setHours(9, 0, 0)),
      scheduledEnd: new Date(new Date().setHours(10, 0, 0)),
      status: 'SCHEDULED',
      visitType: 'Personal Care',
      notes: 'Morning visit for personal care.',
    }
  });

  await prisma.visit.create({
    data: {
      companyId: company.id,
      clientId: arthur.id,
      staffId: bob.id,
      scheduledStart: new Date(new Date().setHours(12, 0, 0)),
      scheduledEnd: new Date(new Date().setHours(13, 0, 0)),
      status: 'SCHEDULED',
      visitType: 'Social Support',
      notes: 'Lunch and social engagement.',
    }
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
