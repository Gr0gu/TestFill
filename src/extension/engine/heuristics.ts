import { ExtensionSettings } from '../../types/extension';
import { computeTestEmail } from './dateSuffix';

export interface MatchRule {
  fieldKey: string;
  typeMatch?: (type: string) => boolean;
  autocompleteMatch?: (val: string) => boolean;
  keywordMatch: RegExp;
  getValue: (settings: ExtensionSettings) => string;
}

export const MATCH_RULES: MatchRule[] = [
  // 1. Email with dynamic date suffix (type="email" or name/id/placeholder containing email)
  {
    fieldKey: 'email',
    typeMatch: (t) => t === 'email',
    autocompleteMatch: (a) => ['email', 'username'].includes(a),
    keywordMatch: /(e[-_]?mail|user[-_]?email|work[-_]?email|contact[-_]?email)/i,
    getValue: (s) => computeTestEmail(s)
  },
  // 2. First Name ("first", "first_name", "fname", etc.)
  {
    fieldKey: 'first_name',
    autocompleteMatch: (a) => a === 'given-name',
    keywordMatch: /(first|fname|given[-_]?name|forename)/i,
    getValue: (s) => s.firstName || 'Alex'
  },
  // 3. Last Name ("last", "last_name", "lname", etc.)
  {
    fieldKey: 'last_name',
    autocompleteMatch: (a) => a === 'family-name',
    keywordMatch: /(last|lname|family[-_]?name|surname)/i,
    getValue: (s) => s.lastName || 'Morgan'
  },
  // 4. Phone Number (type="tel" or phone keywords)
  {
    fieldKey: 'phone',
    typeMatch: (t) => t === 'tel',
    autocompleteMatch: (a) => ['tel', 'tel-national'].includes(a),
    keywordMatch: /(phone|mobile|tel|telephone|cell)/i,
    getValue: (s) => s.phone || '+1 (555) 234-5678'
  },
  // 5. Street Address ("street_address", "billing_address", etc.)
  {
    fieldKey: 'street_address',
    autocompleteMatch: (a) => ['street-address', 'address-line1'].includes(a),
    keywordMatch: /(street|address|billing[-_]?address|shipping[-_]?address|addr)/i,
    getValue: (s) => s.streetAddress || '742 Evergreen Terrace'
  },
  // 6. City
  {
    fieldKey: 'city',
    autocompleteMatch: (a) => a === 'address-level2',
    keywordMatch: /(city|town|locality)/i,
    getValue: (s) => s.city || 'San Francisco'
  },
  // 7. ZIP Code
  {
    fieldKey: 'zip_code',
    autocompleteMatch: (a) => a === 'postal-code',
    keywordMatch: /(zip|zip[-_]?code|postal|postal[-_]?code|postcode)/i,
    getValue: (s) => s.zipCode || '94107'
  },
  // 8. Country
  {
    fieldKey: 'country',
    autocompleteMatch: (a) => a === 'country',
    keywordMatch: /(country|nation)/i,
    getValue: (s) => s.country || 'United States'
  }
];

/**
 * Matches an input element against field heuristics
 */
export function matchFieldHeuristic(el: HTMLElement, settings: ExtensionSettings): string | null {
  const type = (el.getAttribute('type') || (el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text')).toLowerCase();
  const name = (el.getAttribute('name') || '').toLowerCase();
  const id = (el.id || el.getAttribute('id') || '').toLowerCase();
  const placeholder = (el.getAttribute('placeholder') || ('placeholder' in el ? (el as HTMLInputElement).placeholder : '') || '').toLowerCase();
  const autocomplete = (el.getAttribute('autocomplete') || ('autocomplete' in el ? (el as HTMLInputElement).autocomplete : '') || '').toLowerCase();

  for (const rule of MATCH_RULES) {
    if (rule.typeMatch && rule.typeMatch(type)) {
      return rule.getValue(settings);
    }
    if (autocomplete && rule.autocompleteMatch && rule.autocompleteMatch(autocomplete)) {
      return rule.getValue(settings);
    }
    if (name && rule.keywordMatch.test(name)) {
      return rule.getValue(settings);
    }
    if (id && rule.keywordMatch.test(id)) {
      return rule.getValue(settings);
    }
    if (placeholder && rule.keywordMatch.test(placeholder)) {
      return rule.getValue(settings);
    }
  }

  return null;
}
