# Form Guides

This directory contains pre-built, structured guides for common Indian government forms. Each guide lives in its own subdirectory and ships as two JSON files.

## Directory Layout

```
guides/
  <form-id>/
    guide.json            # Field-by-field explanations, documents needed, jargon glossary
    portal-patterns.json  # URL/title/form patterns that identify this form on the web
```

## How to Add a New Form Guide

### Step 1 — Create the directory

```bash
mkdir guides/<your-form-id>
```

Use lowercase kebab-case for the directory name (e.g. `caste-certificate`, `passport-renewal`).

---

### Step 2 — Create `guide.json`

Copy the structure below and fill in the values.

```jsonc
{
  "id": "your-form-id",          // must match directory name
  "title": "English title",
  "titleHi": "हिन्दी शीर्षक",
  "titleTa": "தமிழ் தலைப்பு",
  "purpose": "One sentence describing what the form does, in plain language.",
  "purposeHi": "...",
  "purposeTa": "...",
  "estimatedMinutes": 10,        // realistic time to fill the form
  "documentsNeeded": [
    {
      "name": "Document name (English)",
      "nameHi": "...",
      "nameTa": "...",
      "reason": "Why this document is needed / which field uses it"
    }
  ],
  "fields": [
    {
      // CSS selector(s) that identify the field on the target portal.
      // Use comma-separated alternatives; prefer id > name > label heuristics.
      "selector": "[name='field_name'], #field_id, label:contains('Label Text') ~ input",
      "label": "English label shown on the form",
      "explanation": "Plain-language explanation of what to enter (English, ≤ 60 words)",
      "explanationHi": "...",
      "explanationTa": "...",
      "example": "A realistic example value",
      "tip": "Optional extra tip (English)",
      "tipHi": "...",
      "tipTa": "..."
    }
  ],
  "jargonGlossary": {
    "term": {
      "en": "Plain English definition",
      "hi": "...",
      "ta": "..."
    }
  }
}
```

**Rules:**
- `explanation` must be ≤ 60 words and in plain language (no legal advice).
- Do **not** include the user's typed values anywhere.
- `selector` must be specific enough to avoid false matches. Test on the actual portal.
- Provide all three languages (`en`, `hi`, `ta`) for user-facing strings.

---

### Step 3 — Create `portal-patterns.json`

```jsonc
{
  "urlPatterns": [
    "example.gov.in",           // substring match against window.location.hostname
    "other-portal.nic.in"
  ],
  "titlePatterns": [
    "form title keyword",       // case-insensitive substring match against document.title
    "alternate title"
  ],
  "formPatterns": [
    "unique field name or id"   // case-insensitive substring match against form HTML
  ]
}
```

The content script uses these patterns to auto-detect which guide to load. At least one `urlPattern` **and** one `formPattern` are required.

---

### Step 4 — Test

1. Load the extension in Chrome (Developer mode → Load unpacked → `extension/` dir).
2. Navigate to the target portal.
3. Open DevTools → check the console for `[Neem] Matched guide: <your-form-id>`.
4. Verify all fields highlight correctly and explanations appear.

---

### Available Guides

| Directory | Form | Language coverage |
|---|---|---|
| `income-certificate/` | Income Certificate Application | EN / HI / TA |

---

> **Note:** Guides are bundled with the extension at build time. After adding a guide, run `pnpm build` in the `extension/` directory to include it.
