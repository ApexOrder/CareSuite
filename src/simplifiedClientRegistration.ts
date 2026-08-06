const SIMPLE_REGISTRATION_MARKER = 'data-simple-client-registration';
let fetchPatched = false;
let pendingClientName: string | null = null;

function normaliseText(element: Element): string {
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function field(label: string, element: HTMLElement): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-2';

  const heading = document.createElement('label');
  heading.className = 'text-[10px] font-bold text-slate-500 uppercase tracking-widest';
  heading.textContent = label;

  wrapper.append(heading, element);
  return wrapper;
}

function createStartDateInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'date';
  input.name = 'packageStartDate';
  input.required = true;
  input.className = 'form-input';
  return input;
}

function patchCreateRequest(): void {
  if (fetchPatched) return;
  fetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const pathname = new URL(url, window.location.origin).pathname;
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let nextInit = init;

    if (pathname === '/api/clients' && method === 'POST' && init?.body) {
      try {
        const payload = JSON.parse(String(init.body));
        const form = document.querySelector<HTMLFormElement>(`form[${SIMPLE_REGISTRATION_MARKER}]`);
        const startDate = form?.querySelector<HTMLInputElement>('input[name="packageStartDate"]')?.value || '';
        const pidNumber = form?.querySelector<HTMLInputElement>('input[name="pidNumber"]')?.value.trim() || '';

        payload.packageStartDate = startDate;
        payload.pidNumber = pidNumber;
        payload.nhsNumber = '';
        payload.phone = '';
        payload.email = '';
        payload.fundingType = null;
        payload.carePackageStatus = 'ACTIVE';

        pendingClientName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
        nextInit = { ...init, body: JSON.stringify(payload) };
      } catch {
        // Keep the original request if it is not JSON.
      }
    }

    return originalFetch(input, nextInit);
  };
}

function openCreatedClientProfile(): void {
  if (!pendingClientName) return;

  for (const row of Array.from(document.querySelectorAll<HTMLTableRowElement>('tbody tr'))) {
    if (!normaliseText(row).includes(pendingClientName)) continue;

    const profileButton = Array.from(row.querySelectorAll('button')).find(button =>
      ['Profile', 'View Profile', 'Open'].includes(normaliseText(button)),
    );

    if (profileButton) {
      pendingClientName = null;
      profileButton.click();
      return;
    }
  }
}

function simplifyRegistrationForm(): void {
  const registrationHeadings = Array.from(document.querySelectorAll('h2'))
    .filter(heading => normaliseText(heading) === 'Register Client');

  for (const heading of registrationHeadings) {
    const modal = heading.closest('div.fixed');
    const form = modal?.querySelector('form');
    if (!(form instanceof HTMLFormElement) || form.hasAttribute(SIMPLE_REGISTRATION_MARKER)) continue;

    const firstName = form.querySelector<HTMLInputElement>('input[placeholder="First Name"]');
    const lastName = form.querySelector<HTMLInputElement>('input[placeholder="Last Name"]');
    const dateOfBirth = form.querySelector<HTMLInputElement>('input[type="date"]');
    const addressLine1 = form.querySelector<HTMLInputElement>('input[placeholder="Address Line 1"]');
    const town = form.querySelector<HTMLInputElement>('input[placeholder="Town"]');
    const postcode = form.querySelector<HTMLInputElement>('input[placeholder="Postcode"]');
    const pidNumber = form.querySelector<HTMLInputElement>('input[name="pidNumber"]');

    if (!firstName || !lastName || !dateOfBirth || !addressLine1 || !town || !postcode || !pidNumber) continue;

    form.setAttribute(SIMPLE_REGISTRATION_MARKER, 'true');
    heading.textContent = 'Create Client';

    firstName.required = true;
    lastName.required = true;
    dateOfBirth.required = true;
    addressLine1.required = true;
    town.required = true;
    postcode.required = true;
    pidNumber.required = true;

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

    const identity = document.createElement('section');
    identity.className = 'space-y-4';
    const identityHeading = document.createElement('h3');
    identityHeading.className = 'text-[10px] font-bold text-emerald-500 uppercase tracking-widest';
    identityHeading.textContent = 'Client Details';
    identity.append(
      identityHeading,
      field('First Name', firstName),
      field('Last Name', lastName),
      field('Date of Birth', dateOfBirth),
      field('PID Number', pidNumber),
    );

    const address = document.createElement('section');
    address.className = 'space-y-4';
    const addressHeading = document.createElement('h3');
    addressHeading.className = 'text-[10px] font-bold text-emerald-500 uppercase tracking-widest';
    addressHeading.textContent = 'Address & Start Date';
    address.append(
      addressHeading,
      field('Address Line 1', addressLine1),
      field('Town / City', town),
      field('Postcode', postcode),
      field('Package Start Date', createStartDateInput()),
    );

    grid.append(identity, address);

    const existingGrid = form.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    if (existingGrid) existingGrid.replaceWith(grid);

    for (const element of Array.from(form.children)) {
      if (element !== grid && !element.querySelector('button[type="submit"]')) {
        if (!element.matches('.flex')) element.setAttribute('hidden', '');
      }
    }

    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) submit.textContent = 'Create Client';
  }
}

function apply(): void {
  simplifyRegistrationForm();
  openCreatedClientProfile();
}

export function enableSimplifiedClientRegistration(): () => void {
  patchCreateRequest();
  apply();

  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
