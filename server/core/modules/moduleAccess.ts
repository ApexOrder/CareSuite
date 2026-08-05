import type { PrismaClient } from '@prisma/client';

export type SubscriptionTier = 'CORE' | 'PROFESSIONAL' | 'CLINICAL' | 'ENTERPRISE';
export type ModuleKey =
  | 'dashboard' | 'clients' | 'staff' | 'visits' | 'carePlans'
  | 'actions' | 'risks' | 'audits' | 'medication'
  | 'medicationOrders' | 'reports' | 'users' | 'roles' | 'company';

const tierRank: Record<SubscriptionTier, number> = {
  CORE: 1,
  PROFESSIONAL: 2,
  CLINICAL: 3,
  ENTERPRISE: 4,
};

const requiredTier: Record<ModuleKey, SubscriptionTier> = {
  dashboard: 'CORE',
  clients: 'CORE',
  staff: 'CORE',
  visits: 'CORE',
  carePlans: 'PROFESSIONAL',
  actions: 'PROFESSIONAL',
  risks: 'PROFESSIONAL',
  audits: 'PROFESSIONAL',
  medication: 'CLINICAL',
  medicationOrders: 'CLINICAL',
  reports: 'PROFESSIONAL',
  users: 'CORE',
  roles: 'ENTERPRISE',
  company: 'CORE',
};

interface CompanyEntitlementRow {
  subscriptionTier: string | null;
  moduleKey: string | null;
  enabled: boolean | null;
}

export async function companyHasModule(
  prisma: PrismaClient,
  companyId: string,
  moduleKey: ModuleKey,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<CompanyEntitlementRow[]>`
    SELECT
      c."subscriptionTier",
      cm."moduleKey",
      cm."enabled"
    FROM "Company" c
    LEFT JOIN "CompanyModule" cm
      ON cm."companyId" = c.id
      AND cm."moduleKey" = ${moduleKey}
    WHERE c.id = ${companyId}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return false;
  if (row.enabled === false) return false;
  if (row.enabled === true) return true;

  const tier = (row.subscriptionTier || 'CORE') as SubscriptionTier;
  return tierRank[tier] >= tierRank[requiredTier[moduleKey]];
}
