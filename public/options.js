/**
 * DevFill Options Script
 */

const DEFAULT_SETTINGS = {
  baseEmail: "user@company.com",
  dateSuffixFormat: "DDMMYYYY",
  dateSuffixPrefix: "+test",
  firstName: "Alex",
  lastName: "Morgan",
  phone: "+1 (555) 234-5678",
  streetAddress: "742 Evergreen Terrace",
  city: "San Francisco",
  zipCode: "94107",
  country: "United States",
  enableFloatingTrigger: true
};

function generateDateString(format) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  switch (format) {
    case 'YYYYMMDD': return `${year}${month}${day}`;
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
    case 'DDMMYYYY':
    default:
      return `${day}${month}${year}`;
  }
}

function computeTestEmail(baseEmail, format) {
  const email = (baseEmail || 'user@company.com').trim();
  const dateStr = generateDateString(format || 'DDMMYYYY');
  const suffix = `+test${dateStr}`;

  if (!email.includes('@')) {
    return `${email}${suffix}@company.com`;
  }

  const [username, domain] = email.split('@');
  const cleanUsername = username.split('+')[0];
  return `${cleanUsername}${suffix}@${domain}`;
}

function updatePreview() {
  const baseEmail = document.getElementById('baseEmail').value;
  const format = document.getElementById('dateSuffixFormat').value;
  const display = document.getElementById('emailPreviewDisplay');
  if (display) display.textContent = computeTestEmail(baseEmail, format);
}

document.addEventListener('DOMContentLoaded', () => {
  // Load settings
  const load = (settings) => {
    document.getElementById('baseEmail').value = settings.baseEmail || 'user@company.com';
    document.getElementById('dateSuffixFormat').value = settings.dateSuffixFormat || 'DDMMYYYY';
    document.getElementById('firstName').value = settings.firstName || 'Alex';
    document.getElementById('lastName').value = settings.lastName || 'Morgan';
    document.getElementById('phone').value = settings.phone || '+1 (555) 234-5678';
    document.getElementById('streetAddress').value = settings.streetAddress || '742 Evergreen Terrace';
    document.getElementById('city').value = settings.city || 'San Francisco';
    document.getElementById('zipCode').value = settings.zipCode || '94107';
    document.getElementById('country').value = settings.country || 'United States';
    document.getElementById('enableFloatingTrigger').checked = settings.enableFloatingTrigger !== false;
    updatePreview();
  };

  if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    chrome.storage.local.get(['devfill_settings'], (result) => {
      load({ ...DEFAULT_SETTINGS, ...(result?.devfill_settings || {}) });
    });
  } else {
    try {
      const raw = localStorage.getItem('devfill_settings');
      load({ ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) });
    } catch(e) {
      load(DEFAULT_SETTINGS);
    }
  }

  // Live input preview
  document.getElementById('baseEmail').addEventListener('input', updatePreview);
  document.getElementById('dateSuffixFormat').addEventListener('change', updatePreview);

  // Form submit
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      baseEmail: document.getElementById('baseEmail').value,
      dateSuffixFormat: document.getElementById('dateSuffixFormat').value,
      dateSuffixPrefix: "+test",
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      phone: document.getElementById('phone').value,
      streetAddress: document.getElementById('streetAddress').value,
      city: document.getElementById('city').value,
      zipCode: document.getElementById('zipCode').value,
      country: document.getElementById('country').value,
      enableFloatingTrigger: document.getElementById('enableFloatingTrigger').checked
    };

    const onSaved = () => {
      const status = document.getElementById('saveStatus');
      if (status) {
        status.style.display = 'inline';
        setTimeout(() => { status.style.display = 'none'; }, 2500);
      }
    };

    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.set({ devfill_settings: updated }, onSaved);
    } else {
      localStorage.setItem('devfill_settings', JSON.stringify(updated));
      onSaved();
    }
  });
});
