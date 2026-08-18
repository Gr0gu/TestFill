import { ExtensionSettings } from '../types/extension';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  baseEmail: 'user@company.com',
  dateSuffixFormat: 'DDMMYYYY',
  dateSuffixPrefix: '+test',
  firstName: 'Alex',
  lastName: 'Morgan',
  phone: '+1 (555) 234-5678',
  streetAddress: '742 Evergreen Terrace',
  city: 'San Francisco',
  zipCode: '94107',
  country: 'United States',
  keyboardShortcut: 'Alt+Shift+F',
  enableFloatingTrigger: true,
};

const STORAGE_KEY = 'devfill_settings';

class ChromeStorageAdapter {
  private isExtensionEnv(): boolean {
    return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
  }

  async getSettings(): Promise<ExtensionSettings> {
    try {
      if (this.isExtensionEnv()) {
        const result: Record<string, any> = await chrome.storage.local.get([STORAGE_KEY]);
        if (result && typeof result[STORAGE_KEY] === 'object' && result[STORAGE_KEY] !== null) {
          return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEY] as Partial<ExtensionSettings>) };
        }
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        }
      }
    } catch (e) {
      console.warn('[DevFill] Storage read warning:', e);
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
    const current = await this.getSettings();
    const updated: ExtensionSettings = { ...current, ...partial };

    try {
      if (this.isExtensionEnv()) {
        await chrome.storage.local.set({ [STORAGE_KEY]: updated });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('devfill:storage-changed', { detail: updated }));
      }
    } catch (e) {
      console.error('[DevFill] Storage save error:', e);
    }

    return updated;
  }

  onSettingsChange(callback: (settings: ExtensionSettings) => void): () => void {
    if (this.isExtensionEnv()) {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
        if (area === 'local' && changes[STORAGE_KEY]?.newValue) {
          callback(changes[STORAGE_KEY].newValue as ExtensionSettings);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    } else {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<ExtensionSettings>;
        if (customEvent.detail) callback(customEvent.detail);
      };
      window.addEventListener('devfill:storage-changed', handler);
      return () => window.removeEventListener('devfill:storage-changed', handler);
    }
  }
}

export const storage = new ChromeStorageAdapter();
