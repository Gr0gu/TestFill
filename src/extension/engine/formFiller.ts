import { ExtensionSettings } from '../../types/extension';
import { matchFieldHeuristic } from './heuristics';

/**
 * Sets native value on an input element and triggers bubbles input/change events
 * for React, Vue, and Angular forms.
 */
export function setNativeValue(el: HTMLElement, value: string): void {
  try {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    const proto = el.tagName.toLowerCase() === 'textarea' 
      ? HTMLTextAreaElement.prototype 
      : HTMLInputElement.prototype;

    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor?.set) {
      descriptor.set.call(inputEl, value);
    } else {
      inputEl.value = value;
    }

    // Trigger native input and change events with bubbling
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  } catch (err) {
    console.error('[DevFill] Error setting field value:', err);
  }
}

/**
 * Auto-fills targeted inputs (active form, focused element, or whole page)
 */
export function autoFillForm(
  settings: ExtensionSettings,
  targetScope: 'active_form' | 'focused_element' = 'active_form'
): { filledCount: number } {
  let elements: HTMLElement[] = [];

  if (targetScope === 'focused_element') {
    const active = document.activeElement as HTMLElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      elements = [active];
    }
  }

  if (elements.length === 0) {
    const activeEl = document.activeElement as HTMLElement | null;
    const activeForm = activeEl?.closest('form') || document.querySelector('form');
    const root = activeForm || document;
    
    elements = Array.from(root.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]), textarea:not([disabled])'
    ));
  }

  let count = 0;
  for (const el of elements) {
    const matchedValue = matchFieldHeuristic(el, settings);
    if (matchedValue !== null) {
      setNativeValue(el, matchedValue);
      count++;
    }
  }

  return { filledCount: count };
}
