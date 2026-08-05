import type { CareSuiteModuleDefinition, CareSuiteModuleKey, SubscriptionTier } from './types';

export const TIER_RANK: Record<SubscriptionTier, number> = {
  CORE: 1,
  PROFESSIONAL: 2,
  CLINICAL: 3,
  ENTERPRISE: 4,
};

/**
 * Client-only beta module registry.
 *
 * Other CareSuite modules remain in the codebase so they can be restored and
 * migrated properly later, but they are intentionally excluded from the
 * active registry and therefore cannot be granted through subscription tiers.
 */
export const MODULE_REGISTRY: CareSuiteModuleDefinition[] = [
  {
    key: 'clients',
    label: 'Client Profiles',
    route: '/clients',
    requiredTier: 'CORE',
    requiredPermission: 'clients.view',
    navigationOrder: 10,
  },
];

export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_REGISTRY.map(module => [module.key, module]),
) as Partial<Record<CareSuiteModuleKey, CareSuiteModuleDefinition>>;
