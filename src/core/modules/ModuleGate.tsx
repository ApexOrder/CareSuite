import React from 'react';
import { isModuleEnabled } from './access';
import type { CareSuiteModuleKey, ModuleEntitlements } from './types';

interface ModuleGateProps {
  module: CareSuiteModuleKey;
  entitlements: ModuleEntitlements;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModuleGate({ module, entitlements, children, fallback = null }: ModuleGateProps) {
  return isModuleEnabled(module, entitlements) ? <>{children}</> : <>{fallback}</>;
}
