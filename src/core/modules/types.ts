export type SubscriptionTier = 'CORE' | 'PROFESSIONAL' | 'CLINICAL' | 'ENTERPRISE';

export type CareSuiteModuleKey =
  | 'dashboard'
  | 'clients'
  | 'staff'
  | 'visits'
  | 'carePlans'
  | 'actions'
  | 'risks'
  | 'audits'
  | 'medication'
  | 'medicationOrders'
  | 'reports'
  | 'users'
  | 'roles'
  | 'company';

export interface CareSuiteModuleDefinition {
  key: CareSuiteModuleKey;
  label: string;
  route: string;
  requiredTier: SubscriptionTier;
  requiredPermission?: string;
  dependencies?: CareSuiteModuleKey[];
  navigationOrder: number;
}

export interface ModuleEntitlements {
  tier: SubscriptionTier;
  enabledModules: CareSuiteModuleKey[];
  overrides?: Partial<Record<CareSuiteModuleKey, boolean>>;
}
