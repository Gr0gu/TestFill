/**
 * DevFill Popup Script
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
  country: "United States"
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

function computeTestEmail(settings) {
  const baseEmail = (settings?.baseEmail || 'user@company.com').trim();
  const prefix = settings?.dateSuffixPrefix || '+test';
  const format = settings?.dateSuffixFormat || 'DDMMYYYY';
  const dateStr = generateDateString(format);
  const suffix = `${prefix}${dateStr}`;

  if (!baseEmail.includes('@')) {
    return `${baseEmail}${suffix}@company.com`;
  }

  const [username, domain] = baseEmail.split('@');
  const cleanUsername = username.split('+')[0];
  return `${cleanUsername}${suffix}@${domain}`;
}

function getSettings(callback) {
  if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    chrome.storage.local.get(['devfill_settings'], (result) => {
      callback({ ...DEFAULT_SETTINGS, ...(result?.devfill_settings || {}) });
    });
  } else {
    try {
      const raw = localStorage.getItem('devfill_settings');
      callback({ ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) });
    } catch (e) {
      callback(DEFAULT_SETTINGS);
    }
  }
}

function showStatus(text) {
  const el = document.getElementById('statusMsg');
  if (el) {
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getSettings((settings) => {
    const email = computeTestEmail(settings);
    const emailEl = document.getElementById('dynamicEmailDisplay');
    const suffixTag = document.getElementById('dateSuffixTag');

    if (emailEl) emailEl.textContent = email;
    if (suffixTag) suffixTag.textContent = `+${generateDateString(settings.dateSuffixFormat)}`;

    // Copy email handler
    document.getElementById('copyEmailBox')?.addEventListener('click', () => {
      navigator.clipboard.writeText(email);
      const feedback = document.getElementById('copyFeedback');
      if (feedback) {
        feedback.textContent = 'Copied!';
        feedback.style.color = '#00D084';
        setTimeout(() => {
          feedback.textContent = 'Copy';
          feedback.style.color = '#777777';
        }, 1500);
      }
    });

    // Fill form handler
    document.getElementById('fillFormBtn')?.addEventListener('click', async () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'DEVFILL_FILL_FORM', target: 'active_form' }, (res) => {
            showStatus(res?.filledCount ? `✓ Filled ${res.filledCount} fields` : '✓ Form auto-filled');
          });
        }
      }
    });

    // Fill focused input handler
    document.getElementById('fillFocusedBtn')?.addEventListener('click', async () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'DEVFILL_FILL_FORM', target: 'focused_element' }, () => {
            showStatus('✓ Injected focused field');
          });
        }
      }
    });

    // Open options handler
    document.getElementById('openOptions')?.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open('options.html', '_blank');
      }
    });
  });
});
