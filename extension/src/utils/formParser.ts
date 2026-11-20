import type { FormField, FormSection } from '../types';

function getLabelForElement(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  // 1. aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim() ?? '';
  }

  // 2. aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // 3. <label for="id">
  if (el.id) {
    const labelEl = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`);
    if (labelEl) return labelEl.textContent?.trim() ?? '';
  }

  // 4. Closest wrapping <label>
  const closestLabel = el.closest('label');
  if (closestLabel) {
    // Clone and remove the input itself to get label text
    const clone = closestLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea').forEach((e) => e.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  // 5. placeholder
  if ('placeholder' in el && el.placeholder) return el.placeholder.trim();

  // 6. name attribute as fallback
  if (el.name) return el.name.replace(/[_-]/g, ' ');

  return 'Untitled field';
}

function getFieldType(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  if (el instanceof HTMLSelectElement) return 'select';
  if (el instanceof HTMLTextAreaElement) return 'textarea';
  return el.type || 'text';
}

function getSectionId(el: Element): string {
  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    return legend?.textContent?.trim() || fieldset.id || 'default';
  }
  // Try to find a containing section/div with an id or heading
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 5) {
    if (parent.tagName === 'SECTION' || parent.tagName === 'FIELDSET') {
      return parent.id || parent.querySelector('h1,h2,h3,h4')?.textContent?.trim() || 'default';
    }
    if (parent.id) return parent.id;
    parent = parent.parentElement;
    depth++;
  }
  return 'default';
}

export function parseForm(): FormSection[] {
  const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea';
  const elements = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selectors));

  const sectionMap = new Map<string, FormSection>();
  let stepIndex = 0;

  for (const el of elements) {
    if (!el.offsetParent && el.type !== 'radio' && el.type !== 'checkbox') continue; // skip hidden
    const sectionId = getSectionId(el);
    if (!sectionMap.has(sectionId)) {
      const fieldset = el.closest('fieldset');
      const legend = fieldset?.querySelector('legend')?.textContent?.trim();
      const heading = el.closest('[id]')?.querySelector('h1,h2,h3,h4')?.textContent?.trim();
      sectionMap.set(sectionId, {
        id: sectionId,
        title: legend || heading || sectionId === 'default' ? 'General Information' : sectionId,
        fields: [],
      });
    }

    // hasValue: boolean only — never expose the actual typed value
    const hasValue = (() => {
      if (el instanceof HTMLSelectElement) return el.selectedIndex > 0;
      if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
        return el.value.trim().length > 0;
      }
      if (el instanceof HTMLTextAreaElement) return el.value.trim().length > 0;
      return false;
    })();

    const field: FormField = {
      id: el.id || el.name || `field-${stepIndex}`,
      element: el,
      label: getLabelForElement(el),
      type: getFieldType(el),
      placeholder: 'placeholder' in el ? (el.placeholder ?? '') : '',
      required: el.required,
      value: '', // always empty string — typed values never sent
      hasValue,
      sectionId,
      stepIndex: stepIndex++,
    };

    sectionMap.get(sectionId)!.fields.push(field);
  }

  return Array.from(sectionMap.values());
}

export function hasFormElements(): boolean {
  const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea';
  return document.querySelectorAll(selectors).length > 0;
}

export function flattenFields(sections: FormSection[]): FormField[] {
  return sections.flatMap((s) => s.fields);
}
