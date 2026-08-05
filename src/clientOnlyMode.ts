import {
  CLIENT_PACKAGE_TYPES,
  DEFAULT_CLIENT_PACKAGE_TYPE,
  getClientPackageTypeLabel,
} from './modules/clients/constants/packageTypes';

const CLIENT_LABEL = 'Clients';
const PACKAGE_SELECT_MARKER = 'data-client-package-type';
const IDENTIFIER_PANEL_MARKER = 'data-client-identifiers';
const clientCache = new Map<string, any>();
let fetchPatched = false;

function normaliseLabel(element: Element): string {
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function formatNhsNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

function cacheClients(payload: any): void {
  const clients = Array.isArray(payload) ? payload : payload?.id ? [payload] : [];
  for (const client of clients) clientCache.set(client.id, client);
}

function patchClientFetch(): void {
  if (fetchPatched) return;
  fetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let nextInit = init;

    if (/\/api\/clients(?:\/[^/]+)?$/.test(new URL(url, window.location.origin).pathname) && ['POST', 'PUT'].includes(method) && init?.body) {
      try {
        const payload = JSON.parse(String(init.body));
        const nhsInput = document.querySelector<HTMLInputElement>('input[name="nhsNumber"]');
        const pidInput = document.querySelector<HTMLInputElement>('input[name="pidNumber"]');
        payload.nhsNumber = nhsInput?.value.replace(/\D/g, '') || '';
        payload.pidNumber = pidInput?.value.trim() || '';
        nextInit = { ...init, body: JSON.stringify(payload) };
      } catch {
        // Leave non-JSON requests unchanged.
      }
    }

    const response = await originalFetch(input, nextInit);

    if (url.includes('/api/clients') && response.ok) {
      void response.clone().json().then(cacheClients).catch(() => undefined);
    }

    return response;
  };
}

function relabelPackageFields(): void {
  for (const element of Array.from(document.querySelectorAll('th, span, label'))) {
    const label = normaliseLabel(element);
    if (label === 'Status & Funding') element.textContent = 'Status & Package';
    else if (label === 'Funding Type') element.textContent = 'Package Type';
  }
}

function applyPackageTypeOptions(): void {
  for (const select of Array.from(document.querySelectorAll('select'))) {
    if (select.hasAttribute(PACKAGE_SELECT_MARKER)) continue;
    const optionValues = Array.from(select.options).map(option => option.value);
    const isLegacyFundingSelect = optionValues.includes('Private') && optionValues.includes('Social Services') && optionValues.includes('Direct Payment') && optionValues.includes('NHS');
    if (!isLegacyFundingSelect) continue;

    const currentValue = select.value;
    select.replaceChildren(...CLIENT_PACKAGE_TYPES.map(packageType => {
      const option = document.createElement('option');
      option.value = packageType.value;
      option.textContent = packageType.label;
      return option;
    }));
    select.value = CLIENT_PACKAGE_TYPES.some(type => type.value === currentValue) ? currentValue : DEFAULT_CLIENT_PACKAGE_TYPE;
    select.setAttribute(PACKAGE_SELECT_MARKER, 'true');
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function relabelDisplayedPackageValues(): void {
  const knownValues = new Set(CLIENT_PACKAGE_TYPES.map(packageType => packageType.value));
  for (const element of Array.from(document.querySelectorAll('span'))) {
    const value = normaliseLabel(element);
    if (knownValues.has(value as typeof CLIENT_PACKAGE_TYPES[number]['value'])) element.textContent = getClientPackageTypeLabel(value);
  }
}

function findEditingClient(form: HTMLFormElement): any | undefined {
  const firstName = form.querySelector<HTMLInputElement>('input[placeholder="First Name"]')?.value.trim();
  const lastName = form.querySelector<HTMLInputElement>('input[placeholder="Last Name"]')?.value.trim();
  if (!firstName || !lastName) return undefined;
  return Array.from(clientCache.values()).find(client => client.firstName === firstName && client.lastName === lastName);
}

function addIdentifierFields(): void {
  const headings = Array.from(document.querySelectorAll('h2')).filter(heading => ['Client Registration', 'Edit Client Record'].includes(normaliseLabel(heading)));

  for (const heading of headings) {
    const modal = heading.closest('div.fixed');
    const form = modal?.querySelector('form');
    if (!(form instanceof HTMLFormElement) || form.querySelector(`[${IDENTIFIER_PANEL_MARKER}]`)) continue;

    const baseHeading = Array.from(form.querySelectorAll('h3')).find(item => normaliseLabel(item) === 'Base Identity');
    const column = baseHeading?.parentElement;
    const fields = column?.querySelector('.space-y-4');
    if (!fields) continue;

    const currentClient = findEditingClient(form);
    const panel = document.createElement('div');
    panel.setAttribute(IDENTIFIER_PANEL_MARKER, 'true');
    panel.className = 'space-y-4 pt-2 border-t border-emerald-900/10';
    panel.innerHTML = `
      <div class="space-y-2">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NHS Number</label>
        <input name="nhsNumber" inputmode="numeric" autocomplete="off" maxlength="13" placeholder="123 456 7890" class="form-input font-mono" value="${formatNhsNumber(currentClient?.nhsNumber || '')}" />
        <p class="text-[9px] text-slate-600">10 digits. Spaces are added automatically.</p>
      </div>
      <div class="space-y-2">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PID Number</label>
        <input name="pidNumber" autocomplete="off" maxlength="100" placeholder="Council / commissioner PID" class="form-input font-mono" value="${currentClient?.pidNumber || ''}" />
      </div>`;

    const nhsInput = panel.querySelector<HTMLInputElement>('input[name="nhsNumber"]');
    nhsInput?.addEventListener('input', () => {
      nhsInput.value = formatNhsNumber(nhsInput.value);
    });

    fields.appendChild(panel);
  }
}

function addProfileIdentifiers(): void {
  for (const heading of Array.from(document.querySelectorAll('h1'))) {
    const name = normaliseLabel(heading);
    const client = Array.from(clientCache.values()).find(item => `${item.firstName} ${item.lastName}` === name);
    if (!client) continue;
    const card = heading.closest('.premium-card');
    if (!card || card.querySelector(`[${IDENTIFIER_PANEL_MARKER}]`)) continue;

    const panel = document.createElement('div');
    panel.setAttribute(IDENTIFIER_PANEL_MARKER, 'true');
    panel.className = 'mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4';
    panel.innerHTML = `
      <div class="p-4 rounded-xl bg-[#151917] border border-emerald-900/10">
        <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">NHS Number</p>
        <p class="text-sm text-white font-mono mt-2">${client.nhsNumber ? formatNhsNumber(client.nhsNumber) : 'Not recorded'}</p>
      </div>
      <div class="p-4 rounded-xl bg-[#151917] border border-emerald-900/10">
        <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">PID Number</p>
        <p class="text-sm text-white font-mono mt-2">${client.pidNumber || 'Not recorded'}</p>
      </div>`;
    heading.parentElement?.parentElement?.appendChild(panel);
  }
}

function applyClientOnlyMode(): void {
  const sidebar = document.querySelector('div.fixed.left-0.top-0');
  if (sidebar) {
    const buttons = Array.from(sidebar.querySelectorAll('button'));
    const clientButton = buttons.find(button => normaliseLabel(button) === CLIENT_LABEL);
    for (const button of buttons) {
      const label = normaliseLabel(button);
      button.toggleAttribute('hidden', label !== CLIENT_LABEL && label !== 'Logout');
    }
    for (const heading of Array.from(sidebar.querySelectorAll('h2'))) {
      if (normaliseLabel(heading) === 'Settings') heading.parentElement?.setAttribute('hidden', '');
    }
    if (clientButton && !clientButton.classList.contains('sidebar-link-active')) clientButton.click();
  }

  relabelPackageFields();
  applyPackageTypeOptions();
  relabelDisplayedPackageValues();
  addIdentifierFields();
  addProfileIdentifiers();
}

export function enableClientOnlyMode(): () => void {
  patchClientFetch();
  applyClientOnlyMode();
  const observer = new MutationObserver(() => applyClientOnlyMode());
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
