const CLIENT_LABEL = 'Clients';

function normaliseLabel(element: Element): string {
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function applyClientOnlyMode(): void {
  const sidebar = document.querySelector('div.fixed.left-0.top-0');
  if (!sidebar) return;

  const buttons = Array.from(sidebar.querySelectorAll('button'));
  const clientButton = buttons.find(button => normaliseLabel(button) === CLIENT_LABEL);

  for (const button of buttons) {
    const label = normaliseLabel(button);
    const allowed = label === CLIENT_LABEL || label === 'Logout';
    button.toggleAttribute('hidden', !allowed);
  }

  // Remove the now-empty settings section and its heading from the shell.
  for (const heading of Array.from(sidebar.querySelectorAll('h2'))) {
    if (normaliseLabel(heading) === 'Settings') {
      const section = heading.parentElement;
      if (section) section.setAttribute('hidden', '');
    }
  }

  // Client Profiles is the only available landing page in this beta mode.
  if (clientButton && !clientButton.classList.contains('sidebar-link-active')) {
    clientButton.click();
  }
}

export function enableClientOnlyMode(): () => void {
  applyClientOnlyMode();

  const observer = new MutationObserver(() => applyClientOnlyMode());
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
