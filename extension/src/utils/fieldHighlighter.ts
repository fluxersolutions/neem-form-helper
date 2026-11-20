const HIGHLIGHT_CLASS = 'neem-field-highlight';
const BADGE_ID = 'neem-step-badge';
const RING_COLOR = '#5B5BD6';

let previousElement: Element | null = null;
let previousOutline: string = '';
let previousPosition: string = '';
let previousZIndex: string = '';

function removePreviousBadge(): void {
  const existing = document.getElementById(BADGE_ID);
  if (existing) existing.remove();
}

function removePreviousHighlight(): void {
  if (previousElement instanceof HTMLElement) {
    previousElement.style.outline = previousOutline;
    previousElement.style.position = previousPosition;
    previousElement.style.zIndex = previousZIndex;
    previousElement.classList.remove(HIGHLIGHT_CLASS);
  }
  removePreviousBadge();
  previousElement = null;
}

export function highlightField(el: HTMLElement, stepNumber: number): void {
  removePreviousHighlight();

  // Save previous styles
  previousElement = el;
  previousOutline = el.style.outline;
  previousPosition = el.style.position;
  previousZIndex = el.style.zIndex;

  // Apply highlight ring
  el.style.outline = `3px solid ${RING_COLOR}`;
  el.style.outlineOffset = '2px';
  if (!el.style.position || el.style.position === 'static') {
    el.style.position = 'relative';
  }
  el.style.zIndex = '9998';
  el.classList.add(HIGHLIGHT_CLASS);

  // Create step badge
  const badge = document.createElement('span');
  badge.id = BADGE_ID;
  badge.textContent = String(stepNumber);
  badge.setAttribute('aria-label', `Step ${stepNumber}`);
  Object.assign(badge.style, {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: RING_COLOR,
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  });

  // Position relative to field
  const rect = el.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;

  const absoluteBadge = document.createElement('span');
  absoluteBadge.id = BADGE_ID;
  absoluteBadge.textContent = String(stepNumber);
  Object.assign(absoluteBadge.style, {
    position: 'fixed',
    top: `${rect.top - 10}px`,
    left: `${rect.left - 10}px`,
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: RING_COLOR,
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10000',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  });

  document.body.appendChild(absoluteBadge);

  // Scroll field into view
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
}

export function removeHighlight(): void {
  removePreviousHighlight();
}
