import { ExtensionMessage, ExtensionResponse, ExtensionSettings } from '../types/extension';
import { storage } from './storage';
import { autoFillForm } from './engine/formFiller';

/**
 * Type-safe extension messaging handler
 */
export async function sendExtensionMessage<T = unknown>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response || { success: true };
    } catch (e) {
      console.warn('[DevFill] Runtime message fallback:', e);
    }
  }

  return handleLocalMessage<T>(message);
}

export async function handleLocalMessage<T = unknown>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  switch (message.type) {
    case 'DEVFILL_GET_SETTINGS': {
      const settings = await storage.getSettings();
      return { success: true, data: settings as unknown as T };
    }
    case 'DEVFILL_SAVE_SETTINGS': {
      const updated = await storage.saveSettings(message.payload);
      return { success: true, data: updated as unknown as T };
    }
    case 'DEVFILL_FILL_FORM': {
      const settings = await storage.getSettings();
      const result = autoFillForm(settings, message.target || 'active_form');
      return { success: true, data: result as unknown as T };
    }
    default:
      return { success: false, error: 'Unknown action' };
  }
}
