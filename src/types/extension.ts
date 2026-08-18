/**
 * DevFill Manifest V3 Extension Types
 */

export type DateSuffixFormat = 'DDMMYYYY' | 'YYYYMMDD' | 'YYYY-MM-DD' | 'DD-MM-YYYY';

export interface ExtensionSettings {
  // Base Work Email
  baseEmail: string;
  
  // Dynamic Date Suffix
  dateSuffixFormat: DateSuffixFormat;
  dateSuffixPrefix: string; // e.g. "+test"

  // Default Test Profile Data
  firstName: string;
  lastName: string;
  phone: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  country: string;

  // Trigger Options
  keyboardShortcut: string; // "Alt+Shift+F"
  enableFloatingTrigger: boolean;
}

export type ExtensionMessage = 
  | { type: 'DEVFILL_GET_SETTINGS' }
  | { type: 'DEVFILL_SAVE_SETTINGS'; payload: Partial<ExtensionSettings> }
  | { type: 'DEVFILL_FILL_FORM'; target?: 'active_form' | 'focused_element' }
  | { type: 'DEVFILL_CLEAR_FORM' };

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
