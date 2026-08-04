import type { CareSuiteModuleDefinition, CareSuiteModuleKey, SubscriptionTier } from './types';

export const TIER_RANK: Record<SubscriptionTier, number> = {
  CORE: 1,
  PROFESSIONAL: 2,
  CLINICAL: 3,
  ENTERPRISE: 4,
};

export const MODULE_REGISTRY: CareSuiteModuleDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', route: '/', requiredTier: 'CORE', navigationOrder: 10 },
  { key: 'clients', label: 'Clients', route: '/clients', requiredTier: 'CORE', requiredPermission: 'clients.view', navigationOrder: 20 },
  { key: 'staff', label: 'Staff', route: '/staff', requiredTier: 'CORE', requiredPermission: 'staff.view', navigationOrder: 30 },
  { key: 'visits', label: 'Visits', route: '/visits', requiredTier: 'CORE', requiredPermission: 'visits.view', dependencies: ['clients', 'staff'], navigationOrder: 40 },
  { key: 'carePlans', label: 'Care Plans', route: '/care-plans', requiredTier: 'PROFESSIONAL', requiredPermission: 'carePlans.view', dependencies: ['clients'], navigationOrder: 50 },
  { key: 'actions', label: 'Actions', route: '/actions', requiredTier: 'PROFESSIONAL', requiredPermission: 'actions.view', navigationOrder: 60 },
  { key: 'risks', label: 'Risk Register', route: '/risks', requiredTier: 'PROFESSIONAL', requiredPermission: 'risks.view', dependencies: ['clients'], navigationOrder: 70 },
  { key: 'audits', label: 'Audits', route: '/audits', requiredTier: 'PROFESSIONAL', requiredPermission: 'audits.view', navigationOrder: 80 },
  { key: 'medication', label: 'Medication', route: '/medication', requiredTier: 'CLINICAL', requiredPermission: 'medication.view', dependencies: ['clients', 'staff'], navigationOrder: 90 },
  { key: 'medicationOrders', label: 'Medication Orders', route: '/medication-orders', requiredTier: 'CLINICAL', requiredPermission: 'medication.orders.view', dependencies: ['medication'], navigationOrder: 100 },
  { key: 'reports', label: 'Reports', route: '/reports', requiredTier: 'PROFESSIONAL', requiredPermission: 'reports.view', navigationOrder: 110 },
  { key: 'users', label: 'Users', route: '/users', requiredTier: 'CORE', requiredPermission: 'users.view', navigationOrder: 120 },
  { key: 'roles', label: 'Roles', route: '/roles', requiredTier: 'ENTERPRISE', requiredPermission: 'settings.roles.view', navigationOrder: 130 },
  { key: 'company', label: 'Company', route: '/company', requiredTier: 'CORE', requiredPermission: 'company.view', navigationOrder: 140 },
];

export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_REGISTRY.map(module => [module.key, module]),
) as Record<CareSuiteModuleKey, CareSuiteModuleDefinition>;
