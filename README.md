# Neem - AI Form Helper

> A Chrome extension that sits quietly on government e-form portals and helps people understand and fill them out, field by field, in the language they are most comfortable with.

---

## Why We Built This

Anyone who has filled out a government form in India knows the feeling: you open the portal, stare at a field labeled "Domicile Certificate Reference Number" or "Annexure B Self-Attestation Code," and have no idea what to put in or where to get it from. If English is not your first language, it gets harder. If this is your first time filing for a scholarship, an income certificate, or a caste certificate, it gets overwhelming.

People end up paying agents, making costly errors, or just giving up.

Neem is an open-source Chrome extension that changes that. When you visit a supported government form, a small floating button appears. Click it, pick your language (English, Hindi, or Tamil to start), and Neem walks you through the form field by field. It explains what each field means in plain words, gives you a realistic example of what to type, and warns you about common mistakes before you make them.

You always fill and submit the form yourself. Neem never touches your Aadhaar number, PAN, income, or any other data you type. It only reads the structure of the form, not your answers.

---

## What Neem Does

- **Floating assistant icon** that appears on government form pages and stays out of the way until you need it. You can drag it anywhere on the screen.
- **Form overview** shown upfront: what this form is for, which documents to keep ready, and roughly how long it will take.
- **Field-by-field guidance** that highlights the current field, explains it in plain language, gives an example answer, and flags common mistakes.
- **Ask a question** chat panel where you can type any question about the form and get an answer in your chosen language.
- **Review screen** before you submit, showing which required fields still need attention.
- **Language support** for English, Hindi, and Tamil, with more Indian languages planned.
- **Dark mode and adjustable text size** for readability.

---

## What Neem Does NOT Do

Neem is a guide, not an agent. It will never:

- Submit forms on your behalf
- Solve or bypass CAPTCHAs and OTPs
- Read the values you type into fields
- Send your personal data to any server
- Give legal, tax, or eligibility advice

---

## Project Structure

This is a monorepo with three main parts:

```
neem-form-helper/
|
+-- extension/          Chrome extension (WXT + React + Tailwind, Manifest V3)
|   +-- src/
|       +-- ai/             AI adapter with Gemini, Grok, and OpenRouter fallback
|       +-- components/     Panel, floating button, views (summary, guide, chat, review, settings)
|       +-- entrypoints/    Content script, background service worker, popup
|       +-- i18n/           UI strings in English, Hindi, and Tamil
|       +-- utils/          Form parser (DOM scanner), field highlighter, storage wrapper
|       +-- types/          Shared TypeScript types
|
+-- backend/            Thin Node.js proxy for AI API calls and rate limiting
|   +-- src/
|       +-- handlers/       /explain, /chat, /summary endpoints
|       +-- middleware/      PII masking (runs before every outbound AI call)
|       +-- providers.ts     Gemini -> Grok -> OpenRouter fallback chain
|
+-- packages/
|   +-- form-parser/    Shared types for the DOM-to-field-schema parser
|
+-- guides/             Per-form JSON guides for known government portals
|   +-- income-certificate/   First built-in guide (EN, HI, TA)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension framework | [WXT](https://wxt.dev/) with TypeScript, Manifest V3 |
| UI | React 18, Tailwind CSS, Shadow DOM isolation |
| Form parsing | DOM scan using labels, `aria-*` attributes, placeholders |
| AI providers | Gemini (primary), Grok, OpenRouter (free tier fallback) |
| Backend | Express.js, rate limiting, PII masking middleware |
| Languages | English, Hindi, Tamil at launch |

---

## How It Works

### Inside the browser

When you open a government form page, the content script scans the DOM for form fields. It reads labels, placeholder text, and `aria-*` attributes. It does not read anything you type. The form structure (labels, field types, help text) is sent to the backend. Your typed values never leave your device.

The extension runs in a Shadow DOM, which means its styles and scripts are completely isolated from the page. It cannot break the government portal, and the portal's CSS cannot break Neem.

### On the backend

The backend is a small Express proxy. Its only job is to hold the AI API keys (so they are never exposed in the extension bundle), apply rate limits, and strip any PII patterns that might have slipped through before sending a prompt to the AI.

The fallback chain tries Gemini first, then Grok, then OpenRouter. If all three are down, Neem gracefully shows the raw field labels from the form guide (or from the DOM scan) instead of an error.

### Form guides

For well-known government forms, we ship pre-written JSON guides in the `guides/` directory. These override or enrich the AI output with verified, plain-language explanations reviewed by native speakers. This means common forms work reliably even without a live AI connection.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later (`npm install -g pnpm`)
- A Chromium-based browser (Chrome, Edge, Brave)

### 1. Clone the repo

```bash
git clone https://github.com/fluxersolutions/neem-form-helper.git
cd neem-form-helper
```

### 2. Install dependencies

```bash
# Extension
cd extension
pnpm install

# Backend
cd ../backend
pnpm install
```

### 3. Set up the backend

Copy the example environment file and fill in your API keys:

```bash
cd backend
cp .env.example .env
```

Open `.env` and add at least one AI provider key:

```
GEMINI_API_KEY=your_key_here
GROK_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
ALLOWED_EXTENSION_ID=your_chrome_extension_id
PORT=3001
```

You only need one key to get started. The extension tries Gemini first, then falls back to the others.

### 4. Start the backend

```bash
cd backend
pnpm dev
```

The proxy will be running at `http://localhost:3001`.

### 5. Build and load the extension

```bash
cd extension
pnpm dev
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Turn on "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/.output/chrome-mv3` directory

### 6. Try it out

Open any government e-form portal. The Neem floating button will appear if the page has form fields. Click it to get started.

---

## Running Tests

```bash
# Extension (lint + type check)
cd extension
pnpm build

# Backend
cd backend
pnpm build
```

End-to-end tests with Playwright are planned for a later milestone. See the roadmap below.

---

## Contributing

We would love your help, and you do not need to be a developer to contribute.

### Adding a form guide (no coding required)

If you know a specific government form well and want to write plain-language explanations for it, you can contribute a guide file. See [guides/README.md](guides/README.md) for the full instructions. In short:

1. Create a new directory under `guides/` using the form's name in lowercase kebab-case.
2. Add a `guide.json` with field explanations in English, Hindi, and Tamil.
3. Add a `portal-patterns.json` so Neem knows which URL and form HTML to match it against.
4. Test it by loading the extension in Developer mode and visiting the form.
5. Open a pull request. Someone from the relevant language community will review the translations.

### Improving the code

1. Fork the repo and create a branch from `main`.
2. Make your changes with tests where it makes sense.
3. Run the build to check for type errors.
4. Open a pull request with a clear description of what you changed and why.

Please follow the existing code style (TypeScript strict mode, explicit types, no inline styles outside of Shadow DOM components).

### Translating the UI

The UI strings live in `extension/src/i18n/`. Each language is a single TypeScript file. If you want to add a new Indian language, copy `en.ts` and translate the values. Then register it in `extension/src/i18n/index.ts`.

### Reporting bugs or requesting features

Open an issue on GitHub. For bugs, please include:
- Which portal or form you were on
- What you expected to happen
- What actually happened
- Browser version and OS

---

## Privacy and Security

We take this seriously because government forms contain sensitive personal information.

**What we send to the AI:**
- Field labels and help text from the form (the structure)
- The question you type in the chat panel (masked for PII first)

**What we never send:**
- Anything you type into the form fields
- Your Aadhaar, PAN, phone number, email, or any other identifying value
- Cookies or session tokens from the portal

**PII masking** runs twice: once in the extension before the request leaves the browser, and once again on the backend as a second layer. Patterns matched include 12-digit Aadhaar numbers, PAN format, Indian mobile numbers, and email addresses.

**API keys** are stored only on the backend server. They are never bundled into the Chrome extension.

**No accounts, no analytics.** We do not create user accounts or track which forms you visit at the MVP stage.

---

## Supported Forms

| Guide | Form | Languages |
|---|---|---|
| `income-certificate` | Income Certificate Application | English, Hindi, Tamil |

More guides are being written. If you want to request a specific form, open an issue. If you want to write one yourself, see the contributing section above.

---

## Roadmap

**Phase 1 (current): Core scaffold**
- [x] WXT + React + Tailwind extension scaffold
- [x] Shadow DOM isolation
- [x] Floating button with draggable positioning
- [x] Panel with five views (summary, guided fill, chat, review, settings)
- [x] Express backend with Gemini, Grok, OpenRouter fallback chain
- [x] PII masking middleware
- [x] English, Hindi, Tamil UI strings
- [x] Income certificate guide (first form)

**Phase 2: Pilot form testing**
- [ ] Choose one real portal as the pilot target
- [ ] Save HTML snapshots of the pilot form for parser tests
- [ ] End-to-end tests with Playwright
- [ ] Prompt evaluation set for field explanations
- [ ] Usability sessions with real users

**Phase 3: Community launch**
- [ ] CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- [ ] GitHub Actions for lint, test, and build on every pull request
- [ ] "Good first issue" labels
- [ ] Form guide contribution from the community

**Phase 4: Extended support**
- [ ] Firefox and Safari builds
- [ ] Voice input and read-aloud
- [ ] PDF and scanned form support (pdf.js and OCR)
- [ ] More Indian languages

---

## License

Copyright 2026 Fluxer Solutions Private Limited

Licensed under the [Apache License, Version 2.0](LICENSE). You may use, copy, modify, and distribute this software under the terms of that license.

This is an open-source project. Form guides contributed by the community are also licensed under Apache 2.0.

---

## Acknowledgements

Built by the team at Fluxer Solutions Private Limited. Inspired by the millions of people in India who navigate complex government portals every day, often without help.

If Neem has saved you time or confusion, tell someone who might need it too.

---

*Neem provides guidance only. It is not legal, tax, or eligibility advice. For official instructions, refer to the portal itself.*
