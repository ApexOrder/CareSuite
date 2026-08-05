import {
  CLIENT_PACKAGE_TYPES,
  DEFAULT_CLIENT_PACKAGE_TYPE,
  getClientPackageTypeLabel,
} from './modules/clients/constants/packageTypes';

const CLIENT_LABEL = 'Clients';
const PACKAGE_SELECT_MARKER = 'data-client-package-type';
const REGISTRATION_MARKER = 'data-basic-client-registration';
const PROFILE_IDENTIFIER_MARKER = 'data-client-identifiers';
const clientCache = new Map<string, any>();
let fetchPatched = false;
let selectedClientId: string | null = null;

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
    const pathname = new URL(url, window.location.origin).pathname;
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let nextInit = init;

    if (/\/api\/clients(?:\/[^/]+)?$/.test(pathname) && ['POST', 'PUT'].includes(method) && init?.body) {
      try {
        const payload = JSON.parse(String(init.body));
        const form = document.querySelector<HTMLFormElement>(`form[${REGISTRATION_MARKER}]`);
        payload.nhsNumber = form?.querySelector<HTMLInputElement>('input[name="nhsNumber"]')?.value.replace(/\D/g, '') || '';
        payload.pidNumber = form?.querySelector<HTMLInputElement>('input[name="pidNumber"]')?.value.trim() || '';
        nextInit = { ...init, body: JSON.stringify(payload) };
      } catch {
        // Leave non-JSON requests unchanged.
      }
    }

    const response = await originalFetch(input, nextInit);
    if (pathname.startsWith('/api/clients') && response.ok) {
      void response.clone().json().then(cacheClients).catch(() => undefined);
    }
    return response;
  };
}

function applyPackageTypeOptions(): void {
  for (const select of Array.from(document.querySelectorAll('select'))) {
    if (select.hasAttribute(PACKAGE_SELECT_MARKER)) continue;
    const values = Array.from(select.options).map(option => option.value);
    if (!(values.includes('Private') && values.includes('Social Services') && values.includes('NHS'))) continue;

    const currentValue = select.value;
    select.replaceChildren(...CLIENT_PACKAGE_TYPES.map(packageType => {
      const option = document.createElement('option');
      option.value = packageType.value;
      option.textContent = packageType.label;
      return option;
    }));
    select.value = CLIENT_PACKAGE_TYPES.some(type => type.value === currentValue)
      ? currentValue
      : DEFAULT_CLIENT_PACKAGE_TYPE;
    select.setAttribute(PACKAGE_SELECT_MARKER, 'true');
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function relabelPackageValues(): void {
  const values = new Set(CLIENT_PACKAGE_TYPES.map(type => type.value));
  for (const element of Array.from(document.querySelectorAll('span'))) {
    const value = normaliseLabel(element);
    if (values.has(value as typeof CLIENT_PACKAGE_TYPES[number]['value'])) {
      element.textContent = getClientPackageTypeLabel(value);
    }
  }
}

function createLabel(text: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.className = 'text-[10px] font-bold text-slate-500 uppercase tracking-widest';
  label.textContent = text;
  return label;
}

function wrapField(labelText: string, field: HTMLElement, helper?: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-2';
  wrapper.append(createLabel(labelText), field);
  if (helper) {
    const note = document.createElement('p');
    note.className = 'text-[9px] text-slate-600';
    note.textContent = helper;
    wrapper.appendChild(note);
  }
  return wrapper;
}

function createIdentifierInput(name: string, placeholder: string, value: string): HTMLInputElement {
  const input = document.createElement('input');
  input.name = name;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.className = 'form-input font-mono';
  input.value = value;
  if (name === 'nhsNumber') {
    input.inputMode = 'numeric';
    input.maxLength = 13;
    input.addEventListener('input', () => { input.value = formatNhsNumber(input.value); });
  } else {
    input.maxLength = 100;
  }
  return input;
}

function attachClientRowSelection(): void {
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const clients = Array.from(clientCache.values());
  rows.forEach((row, index) => {
    const client = clients[index];
    if (!client || row.dataset.clientSelectionBound) return;
    row.dataset.clientSelectionBound = 'true';
    row.querySelectorAll('button').forEach(button => {
      if (normaliseLabel(button) === 'Edit' || normaliseLabel(button) === 'Profile') {
        button.addEventListener('click', () => { selectedClientId = client.id; });
      }
    });
  });
}

function redesignClientRegistration(): void {
  const headings = Array.from(document.querySelectorAll('h2'))
    .filter(heading => ['Client Registration', 'Edit Client Record'].includes(normaliseLabel(heading)));

  for (const heading of headings) {
    const modal = heading.closest('div.fixed');
    const form = modal?.querySelector('form');
    if (!(form instanceof HTMLFormElement) || form.hasAttribute(REGISTRATION_MARKER)) continue;

    form.setAttribute(REGISTRATION_MARKER, 'true');
    heading.textContent = heading.textContent?.includes('Edit') ? 'Edit Basic Client Details' : 'Register Client';

    const firstName = form.querySelector<HTMLInputElement>('input[placeholder="First Name"]');
    const lastName = form.querySelector<HTMLInputElement>('input[placeholder="Last Name"]');
    const dateOfBirth = form.querySelector<HTMLInputElement>('input[type="date"]');
    const status = Array.from(form.querySelectorAll('select')).find(select => Array.from(select.options).some(option => option.value === 'ACTIVE'));
    const address = form.querySelector<HTMLInputElement>('input[placeholder="Address Line 1"]');
    const town = form.querySelector<HTMLInputElement>('input[placeholder="Town"]');
    const postcode = form.querySelector<HTMLInputElement>('input[placeholder="Postcode"]');
    const email = form.querySelector<HTMLInputElement>('input[placeholder="Email (optional)"]');
    const phone = form.querySelector<HTMLInputElement>('input[placeholder="Phone"]');
    const packageType = Array.from(form.querySelectorAll('select')).find(select => select.hasAttribute(PACKAGE_SELECT_MARKER));

    if (!firstName || !lastName || !dateOfBirth || !status || !address || !town || !postcode || !email || !phone || !packageType) continue;

    const client = selectedClientId ? clientCache.get(selectedClientId) : undefined;
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

    const identity = document.createElement('section');
    identity.className = 'space-y-4';
    const identityHeading = document.createElement('h3');
    identityHeading.className = 'text-[10px] font-bold text-emerald-500 uppercase tracking-widest';
    identityHeading.textContent = 'Basic Identity';
    identity.append(
      identityHeading,
      wrapField('First Name', firstName),
      wrapField('Last Name', lastName),
      wrapField('Date of Birth', dateOfBirth),
      wrapField('NHS Number', createIdentifierInput('nhsNumber', '123 456 7890', formatNhsNumber(client?.nhsNumber || '')), '10 digits; spaces are added automatically.'),
      wrapField('PID Number', createIdentifierInput('pidNumber', 'Council / commissioner PID', client?.pidNumber || '')),
    );

    const contact = document.createElement('section');
    contact.className = 'space-y-4';
    const contactHeading = document.createElement('h3');
    contactHeading.className = 'text-[10px] font-bold text-emerald-500 uppercase tracking-widest';
    contactHeading.textContent = 'Contact & Package';
    contact.append(
      contactHeading,
      wrapField('Address Line 1', address),
      wrapField('Town / City', town),
      wrapField('Postcode', postcode),
      wrapField('Telephone', phone),
      wrapField('Email Address', email),
      wrapField('Package Type', packageType),
      wrapField('Package Status', status),
    );

    grid.append(identity, contact);

    const existingGrid = form.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    if (existingGrid) existingGrid.replaceWith(grid);

    const notes = Array.from(form.querySelectorAll('label')).find(label => normaliseLabel(label) === 'Confidential Care Insights')?.parentElement;
    notes?.setAttribute('hidden', '');

    selectedClientId = null;
  }
}

function addProfileIdentifiers(): void {
  for (const heading of Array.from(document.querySelectorAll('h1'))) {
    const name = normaliseLabel(heading);
    const client = Array.from(clientCache.values()).find(item => `${item.firstName} ${item.lastName}` === name);
    const card = heading.closest('.premium-card');
    if (!client || !card || card.querySelector(`[${PROFILE_IDENTIFIER_MARKER}]`)) continue;

    const panel = document.createElement('div');
    panel.setAttribute(PROFILE_IDENTIFIER_MARKER, 'true');
    panel.className = 'mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4';

    const nhs = document.createElement('div');
    nhs.className = 'p-4 rounded-xl bg-[#151917] border border-emerald-900/10';
    nhs.append(createLabel('NHS Number'));
    const nhsValue = document.createElement('p');
    nhsValue.className = 'text-sm text-white font-mono mt-2';
    nhsValue.textContent = client.nhsNumber ? formatNhsNumber(client.nhsNumber) : 'Not recorded';
    nhs.appendChild(nhsValue);

    const pid = document.createElement('div');
    pid.className = nhs.className;
    pid.append(createLabel('PID Number'));
    const pidValue = document.createElement('p');
    pidValue.className = 'text-sm text-white font-mono mt-2';
    pidValue.textContent = client.pidNumber || 'Not recorded';
    pid.appendChild(pidValue);

    panel.append(nhs, pid);
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

  applyPackageTypeOptions();
  relabelPackageValues();
  attachClientRowSelection();
  redesignClientRegistration();
  addProfileIdentifiers();
}

export function enableClientOnlyMode(): () => void {
  patchClientFetch();
  applyClientOnlyMode();
  const observer = new MutationObserver(() => applyClientOnlyMode());
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
