import {
  CLIENT_PACKAGE_TYPES,
  DEFAULT_CLIENT_PACKAGE_TYPE,
  getClientPackageTypeLabel,
} from './modules/clients/constants/packageTypes';

const CLIENT_LABEL = 'Clients';
const PACKAGE_SELECT_MARKER = 'data-client-package-type';

function normaliseLabel(element: Element): string {
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function relabelPackageFields(): void {
  for (const element of Array.from(document.querySelectorAll('th, span, label'))) {
    const label = normaliseLabel(element);

    if (label === 'Status & Funding') {
      element.textContent = 'Status & Package';
    } else if (label === 'Funding Type') {
      element.textContent = 'Package Type';
    }
  }
}

function applyPackageTypeOptions(): void {
  const selects = Array.from(document.querySelectorAll('select'));

  for (const select of selects) {
    if (select.hasAttribute(PACKAGE_SELECT_MARKER)) continue;

    const optionValues = Array.from(select.options).map(option => option.value);
    const isLegacyFundingSelect =
      optionValues.includes('Private') &&
      optionValues.includes('Social Services') &&
      optionValues.includes('Direct Payment') &&
      optionValues.includes('NHS');

    if (!isLegacyFundingSelect) continue;

    const currentValue = select.value;
    select.replaceChildren(
      ...CLIENT_PACKAGE_TYPES.map(packageType => {
        const option = document.createElement('option');
        option.value = packageType.value;
        option.textContent = packageType.label;
        return option;
      }),
    );

    const matchingValue = CLIENT_PACKAGE_TYPES.some(packageType => packageType.value === currentValue)
      ? currentValue
      : DEFAULT_CLIENT_PACKAGE_TYPE;

    select.value = matchingValue;
    select.setAttribute(PACKAGE_SELECT_MARKER, 'true');
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function relabelDisplayedPackageValues(): void {
  const knownValues = new Set(CLIENT_PACKAGE_TYPES.map(packageType => packageType.value));

  for (const element of Array.from(document.querySelectorAll('span'))) {
    const value = normaliseLabel(element);
    if (knownValues.has(value as typeof CLIENT_PACKAGE_TYPES[number]['value'])) {
      element.textContent = getClientPackageTypeLabel(value);
    }
  }
}

function applyClientOnlyMode(): void {
  const sidebar = document.querySelector('div.fixed.left-0.top-0');

  if (sidebar) {
    const buttons = Array.from(sidebar.querySelectorAll('button'));
    const clientButton = buttons.find(button => normaliseLabel(button) === CLIENT_LABEL);

    for (const button of buttons) {
      const label = normaliseLabel(button);
      const allowed = label === CLIENT_LABEL || label === 'Logout';
      button.toggleAttribute('hidden', !allowed);
    }

    for (const heading of Array.from(sidebar.querySelectorAll('h2'))) {
      if (normaliseLabel(heading) === 'Settings') {
        const section = heading.parentElement;
        if (section) section.setAttribute('hidden', '');
      }
    }

    if (clientButton && !clientButton.classList.contains('sidebar-link-active')) {
      clientButton.click();
    }
  }

  relabelPackageFields();
  applyPackageTypeOptions();
  relabelDisplayedPackageValues();
}

export function enableClientOnlyMode(): () => void {
  applyClientOnlyMode();

  const observer = new MutationObserver(() => applyClientOnlyMode());
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
