export const CLIENT_PACKAGE_TYPES = [
  { value: 'SOCIAL_SERVICES_REABLEMENT', label: 'Social Services – Reablement' },
  { value: 'SOCIAL_SERVICES_LONG_TERM', label: 'Social Services – Long Term' },
  { value: 'EOL', label: 'End of Life (EOL)' },
  { value: 'MEDICATION_ONLY', label: 'Medication Only' },
  { value: 'PRIVATE_CARE', label: 'Private Care' },
  { value: 'DIRECT_PAYMENT', label: 'Direct Payment' },
  { value: 'NHS_CONTINUING_HEALTHCARE', label: 'NHS Continuing Healthcare' },
  { value: 'RESPITE', label: 'Respite' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type ClientPackageType = typeof CLIENT_PACKAGE_TYPES[number]['value'];

export const DEFAULT_CLIENT_PACKAGE_TYPE: ClientPackageType = 'SOCIAL_SERVICES_REABLEMENT';

export function getClientPackageTypeLabel(value?: string | null): string {
  if (!value) return 'Not specified';

  return CLIENT_PACKAGE_TYPES.find(packageType => packageType.value === value)?.label ?? value;
}
