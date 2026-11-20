import type { Request, Response, NextFunction } from 'express';

// Patterns for PII detection
const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  {
    name: 'aadhaar',
    // 12-digit Aadhaar number (may be space/hyphen separated in groups of 4)
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[MASKED_AADHAAR]',
  },
  {
    name: 'pan',
    // PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    replacement: '[MASKED_PAN]',
  },
  {
    name: 'phone',
    // Indian mobile numbers: 10 digits, optionally starting with +91 or 0
    pattern: /(?:\+91|0)?[6-9]\d{9}\b/g,
    replacement: '[MASKED_PHONE]',
  },
  {
    name: 'email',
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[MASKED_EMAIL]',
  },
];

/**
 * Recursively mask PII in any string values within an object.
 */
function maskPII(value: unknown): unknown {
  if (typeof value === 'string') {
    let masked = value;
    for (const { pattern, replacement } of PII_PATTERNS) {
      masked = masked.replace(pattern, replacement);
    }
    return masked;
  }
  if (Array.isArray(value)) {
    return value.map(maskPII);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = maskPII(v);
    }
    return result;
  }
  return value;
}

/**
 * Middleware: mask PII in request body before it reaches handlers/LLM calls.
 */
export function piiMaskMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = maskPII(req.body);
  }
  next();
}
