import { MODULES_BY_KEY, TIER_RANK } from './registry';
import type { CareSuiteModuleKey, ModuleEntitlements } from './types';

export function isModuleEnabled(
  moduleKey: CareSuiteModuleKey,
  entitlements: ModuleEntitlements,
  visited = new Set<CareSuiteModuleKey>(),
): boolean {
  if (visited.has(moduleKey)) return false;
  visited.add(moduleKey);

  const override = entitlements.overrides?.[moduleKey];
  if (override === false) return false;

  const definition = MODULES_BY_KEY[moduleKey];
  const includedByTier = TIER_RANK[entitlements.tier] >= TIER_RANK[definition.requiredTier];
  const explicitlyEnabled = entitlements.enabledModules.includes(moduleKey) || override === true;

  if (!includedByTier && !explicitlyEnabled) return false;

  return (definition.dependencies ?? []).every(dependency =>
    isModuleEnabled(dependency, entitlements, new Set(visited)),
  );
}

export function getEnabledModules(entitlements: ModuleEntitlements): CareSuiteModuleKey[] {
  return (Object.keys(MODULES_BY_KEY) as CareSuiteModuleKey[])
    .filter(moduleKey => isModuleEnabled(moduleKey, entitlements));
}
