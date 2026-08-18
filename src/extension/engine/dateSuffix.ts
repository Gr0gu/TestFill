import { DateSuffixFormat, ExtensionSettings } from '../../types/extension';

/**
 * Computes the dynamic date suffix based on the current system date.
 */
export function generateDateString(format: DateSuffixFormat = 'DDMMYYYY'): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  switch (format) {
    case 'DDMMYYYY':
      return `${day}${month}${year}`;
    case 'YYYYMMDD':
      return `${year}${month}${day}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${day}${month}${year}`;
  }
}

/**
 * Automatically computes base work email with dynamic date suffix (e.g. user+test18082026@company.com)
 */
export function computeTestEmail(settings: Partial<ExtensionSettings>): string {
  const baseEmail = (settings.baseEmail || 'user@company.com').trim();
  const prefix = settings.dateSuffixPrefix || '+test';
  const format = settings.dateSuffixFormat || 'DDMMYYYY';
  const dateStr = generateDateString(format);
  const suffix = `${prefix}${dateStr}`;

  if (!baseEmail.includes('@')) {
    return `${baseEmail}${suffix}@company.com`;
  }

  const [username, domain] = baseEmail.split('@');
  const cleanUsername = username.split('+')[0];

  return `${cleanUsername}${suffix}@${domain}`;
}
