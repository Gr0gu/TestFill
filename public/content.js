/**
 * DevFill Content Script (Manifest V3)
 */

(function () {
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

  function setNativeValue(el, value) {
    try {
      const isTextarea = el.tagName.toLowerCase() === 'textarea';
      const proto = isTextarea ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      
      if (descriptor && descriptor.set) {
        descriptor.set.call(el, value);
      } else {
        el.value = value;
      }

      el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));

      // Visual flash feedback
      const prevBorder = el.style.borderColor;
      el.style.borderColor = '#FFB800';
      setTimeout(() => { el.style.borderColor = prevBorder; }, 800);
    } catch (e) {
      console.warn('[DevFill] Could not set input value', e);
    }
  }

  function matchFieldHeuristic(el, settings) {
    const type = (el.getAttribute('type') || (el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text')).toLowerCase();
    const name = (el.getAttribute('name') || '').toLowerCase();
    const id = (el.id || el.getAttribute('id') || '').toLowerCase();
    const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
    const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();

    // 1. Email with dynamic date suffix
    if (type === 'email' || autocomplete === 'email' || autocomplete === 'username' || /(e[-_]?mail|user[-_]?email|work[-_]?email|contact[-_]?email)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return computeTestEmail(settings);
    }

    // 2. First Name (checks for "first", "first_name", "fname", etc. in id, name, placeholder)
    if (autocomplete === 'given-name' || /(first|fname|given[-_]?name|forename)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.firstName || 'Alex';
    }

    // 3. Last Name (checks for "last", "last_name", "lname", etc. in id, name, placeholder)
    if (autocomplete === 'family-name' || /(last|lname|family[-_]?name|surname)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.lastName || 'Morgan';
    }

    // 4. Phone
    if (type === 'tel' || autocomplete.includes('tel') || /(phone|mobile|tel|telephone|cell)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.phone || '+1 (555) 234-5678';
    }

    // 5. Street Address
    if (autocomplete.includes('address') || /(street|address|billing[-_]?address|shipping[-_]?address|addr)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.streetAddress || '742 Evergreen Terrace';
    }

    // 6. City
    if (autocomplete === 'address-level2' || /(city|town|locality)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.city || 'San Francisco';
    }

    // 7. ZIP / Postal
    if (autocomplete === 'postal-code' || /(zip|zip[-_]?code|postal|postal[-_]?code|postcode)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.zipCode || '94107';
    }

    // 8. Country
    if (autocomplete === 'country' || /(country|nation)/i.test(name + ' ' + id + ' ' + placeholder)) {
      return settings.country || 'United States';
    }

    return null;
  }

  function executeAutoFill(settings, targetScope) {
    let elements = [];

    if (targetScope === 'focused_element') {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        elements = [active];
      }
    }

    if (elements.length === 0) {
      const active = document.activeElement;
      const form = active ? active.closest('form') : document.querySelector('form');
      const root = form || document;
      elements = Array.from(root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]), textarea:not([disabled])'));
    }

    let count = 0;
    for (const el of elements) {
      const val = matchFieldHeuristic(el, settings);
      if (val !== null) {
        setNativeValue(el, val);
        count++;
      }
    }
    return count;
  }

  function getStoredSettings(callback) {
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.get(['devfill_settings'], (result) => {
        const stored = result?.devfill_settings || {};
        callback({ ...DEFAULT_SETTINGS, ...stored });
      });
    } else {
      try {
        const raw = localStorage.getItem('devfill_settings');
        const stored = raw ? JSON.parse(raw) : {};
        callback({ ...DEFAULT_SETTINGS, ...stored });
      } catch (e) {
        callback(DEFAULT_SETTINGS);
      }
    }
  }

  // Handle messages from popup / background worker
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'DEVFILL_FILL_FORM') {
        getStoredSettings((settings) => {
          const filled = executeAutoFill(settings, message.target || 'active_form');
          sendResponse({ success: true, filledCount: filled });
        });
        return true;
      }
    });
  }

  // Keyboard shortcut listener: Alt+Shift+F
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      getStoredSettings((settings) => {
        executeAutoFill(settings, 'active_form');
      });
    }
  }, true);

  // In-page Floating Trigger using Shadow DOM
  function mountFloatingHUD() {
    getStoredSettings((settings) => {
      if (!settings.enableFloatingTrigger) return;
      if (document.getElementById('devfill-floating-trigger-host')) return;

      const host = document.createElement('div');
      host.id = 'devfill-floating-trigger-host';
      host.style.position = 'fixed';
      host.style.bottom = '20px';
      host.style.right = '20px';
      host.style.zIndex = '2147483647';
      host.style.pointerEvents = 'auto';

      const shadow = host.attachShadow({ mode: 'open' });
      const container = document.createElement('div');
      container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background: #141414;
        border: 1px solid #2E2E2E;
        border-radius: 28px;
        padding: 6px 10px 6px 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,184,0,0.25);
        font-family: system-ui, -apple-system, sans-serif;
        color: #F3F3F1;
      `;

      const btn = document.createElement('button');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#121212" stroke="#121212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>DevFill</span>`;
      btn.style.cssText = `
        display: flex;
        align-items: center;
        background: #FFB800;
        color: #121212;
        font-weight: 700;
        border: none;
        border-radius: 20px;
        padding: 7px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      btn.onclick = () => {
        getStoredSettings((curSettings) => {
          const count = executeAutoFill(curSettings, 'active_form');
          btn.innerHTML = `<span>Filled ${count}</span>`;
          setTimeout(() => { 
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#121212" stroke="#121212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>DevFill</span>`; 
          }, 2000);
        });
      };

      const emailLabel = document.createElement('span');
      emailLabel.textContent = computeTestEmail(settings);
      emailLabel.style.cssText = `
        font-size: 12px;
        font-family: monospace;
        color: #FFB800;
        max-width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 4px;
      `;

      container.appendChild(btn);
      container.appendChild(emailLabel);
      shadow.appendChild(container);
      document.body.appendChild(host);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountFloatingHUD);
  } else {
    mountFloatingHUD();
  }
})();
