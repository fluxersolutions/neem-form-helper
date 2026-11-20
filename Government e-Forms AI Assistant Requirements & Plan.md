# Government e-Forms AI Assistant: Requirements & Plan

## Overview

We are building a browser extension with a floating helper that explains government e-forms in plain language, in the user's own language, and guides them field by field until they finish.

**Problem.** Government forms are cluttered and full of jargon (domicile, nativity, annexure, self-attested). First-time and non-English users abandon forms, make errors that cause rejections, or pay agents to fill them in.

**Solution.** When a user opens a form, a floating icon (like Grammarly's) offers to summarise what the form needs, explain each field, translate everything into Hindi, Tamil and other Indian languages, and walk them through it step by step. The user always types and submits themselves.

**Where we are.** The Figma UI is almost complete. Development starts with a Chrome/Edge extension, and the project will be released as open source.

## Goals and non-goals

The MVP must let a first-time user complete one real government web form, in their own language, with no outside help.

**Goals**

- Explain every field and section of a web form in plain language.
- Summarise up front what the form needs: documents, details, eligibility.
- Support English, Hindi and Tamil at launch, with a path to more Indian languages.
- Guide the user field by field, with validation hints and common-mistake warnings.
- Keep user data on the user's device. Never auto-submit.
- Ship as open source so volunteers can add forms and languages.

**Non-goals (MVP)**

- Filing forms on the user's behalf or bypassing CAPTCHAs and OTPs.
- PDF and scanned-form support (phase 4).
- Legal, tax or eligibility advice. The tool explains forms; it does not advise.
- Mobile apps. Browser extension first.

## Users and key scenarios

The core user is someone who must use a government portal but is not comfortable with its language or jargon.

| Persona | Situation | What they need |
| --- | --- | --- |
| First-time filer | Student applying for a scholarship or certificate | A checklist of documents and plain meanings of each field |
| Native-language user | Reads Tamil or Hindi better than English | The form and hints in their own language |
| Assisted filer | Helps parents or neighbours fill forms | Clear guidance they can pass on, and fewer errors |
| Volunteer contributor | Knows a form well | A simple way to write and translate a form guide |

**Primary scenario.** The user opens a portal form and clicks the floating icon. The assistant shows a short summary of what the form needs, the user picks a language, and the guide highlights each field in turn with a plain explanation. The user types their own answers and submits the form themselves.

## Functional requirements

P0 items define the MVP; P1 follows once the pilot form works; P2 is later.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | Floating icon injected on supported pages, draggable, collapsible, and hidden on unsupported sites | P0 |
| FR-2 | Detect form fields and read labels, placeholders, `aria-*` attributes, help text and validation rules | P0 |
| FR-3 | Show a form summary: purpose, required documents, key details to keep ready | P0 |
| FR-4 | Explain each field in plain language, with an example of a valid entry | P0 |
| FR-5 | Translate summary, explanations and UI into English, Hindi and Tamil | P0 |
| FR-6 | Step-by-step guide mode: highlight the current field, move to the next, show progress | P0 |
| FR-7 | Warn about format errors and common mistakes before the user submits | P1 |
| FR-8 | Curated form guides (JSON/YAML) that override or enrich AI output for known forms | P1 |
| FR-9 | Ask-a-question chat panel about the current form | P1 |
| FR-10 | Settings: language, text size, enable or disable per site | P1 |
| FR-11 | Optional autofill of non-sensitive fields, only with explicit user confirmation | P2 |
| FR-12 | Voice input and read-aloud for low-literacy users | P2 |
| FR-13 | PDF and scanned-form support through pdf.js and OCR | P2 |
| FR-14 | Firefox and Safari builds | P2 |

## Non-functional requirements

The tool must feel light, work on messy government sites, and be usable by people with low digital literacy. Targets below are proposals to confirm during the pilot.

| Area | Requirement |
| --- | --- |
| Performance | Widget appears without visibly slowing page load; first explanation shown within about 3 seconds; field explanations cached per form |
| Compatibility | Chrome and Edge (Manifest V3) at MVP; Firefox later; works on desktop and responsive layouts |
| Isolation | UI in Shadow DOM so site CSS and scripts cannot break it, and it cannot break the site |
| Accessibility | Keyboard navigable, screen-reader labels, WCAG 2.1 AA contrast, adjustable text size |
| Languages | English, Hindi, Tamil at launch; architecture supports adding a language by adding a translation file |
| Reliability | Graceful fallback when the AI service is down: show the form's raw labels and any curated guide |
| Offline and cost | Cache curated guides locally; control LLM cost with caching and per-user rate limits |
| Maintainability | TypeScript, typed schemas, unit and end-to-end tests, CI on every pull request |

## Architecture and tech stack

A thin backend proxy is the only server component; everything that touches user input stays inside the extension.

&#91;embedded content: architecture · 2 containers, 6 components\]

The form parser strips typed values and masks ID-like text, the service worker sends only labels to the proxy, and the widget shows the result and highlights fields on the portal.

| Layer | Choice |
| --- | --- |
| Extension framework | WXT with TypeScript, Manifest V3 (check WXT's current maintenance before committing) |
| UI | React and Tailwind inside Shadow DOM, ported from the Figma designs |
| Form parsing | DOM scan using labels, `aria-*` attributes and placeholders; pdf.js and OCR later |
| AI | LLM called through the proxy only; provider to be chosen |
| Translation | Bhashini, IndicTrans2 or an LLM; verify availability and licences first |
| Backend | Small proxy service for keys and rate limits; hosting to be chosen |

## Privacy, security and compliance

Government forms hold Aadhaar, PAN, income and address details, so the rule is simple: the AI sees the form's structure, never the user's answers.

**Data handling**

- Send only field labels, instructions and help text to the LLM. Never send values the user has typed.
- Detect and mask ID-like patterns (Aadhaar, PAN, phone, email) before anything leaves the device.
- No accounts at MVP, no analytics on form content, and no storage of form data on our servers.
- Never auto-submit, and never automate around CAPTCHAs or OTPs.

**Extension security**

- Request minimal permissions, ideally an allow-list of portals plus on-demand activation.
- Keep API keys on a thin backend proxy, never in the extension bundle.
- Sanitise all AI output before rendering, and keep a strict content security policy.
- Pin and audit dependencies, and publish a `SECURITY.md` with a disclosure process.

**Legal and trust**

- Review obligations under India's Digital Personal Data Protection Act, 2023 and its rules with qualified counsel, since commencement is phased.
- Check each target portal's terms of use for assistive tools.
- Show a disclaimer that explanations are guidance, not legal advice, and link to the official instructions.
- Publish a plain-language privacy policy, translated into the supported languages.

## Open-source plan

We will publish under Apache 2.0 and make form guides plain data files, so non-coders can contribute translations and form explanations.

**Decisions to make before the first public commit**

| Decision | Recommendation | Why |
| --- | --- | --- |
| Licence | Apache 2.0 | Permissive, includes a patent grant, easy for adopters. MIT is simpler; AGPL only if we want to block closed SaaS forks. |
| IP check | Confirm with SRM's incubation programme | Incubation terms may cover IP and licensing choices. |
| Governance | Maintainers list in `GOVERNANCE.md` | Enough for a small project; revisit as it grows. |
| Secrets | Scan history before publishing | Git history is permanent. |

**Repository layout (monorepo)**

```
extension/        browser extension (WXT, React, Tailwind)
backend/          thin LLM proxy and rate limiting
packages/form-parser/   DOM scan to field schema
packages/i18n/    UI strings and translations
guides/           per-form JSON/YAML guides, one folder per portal
docs/             architecture, contributor guides
```

**Repo essentials:** README with a demo GIF, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue and PR templates, GitHub Actions for lint, test and build, and "good first issue" labels.

**Community model.** A volunteer who knows the passport form can add a guide file and a Tamil translation without touching the extension code. Each guide gets a reviewer from the target language community before merge.

## Roadmap and milestones

Five phases take the project from an empty repo to a public beta, and each ends in a gate that must pass before the next one starts. Durations are indicative for a small student team and should be confirmed once the pilot form is chosen.

&#91;embedded content: roadmap · 5 phases, 5 gates\]

Pick one real portal form as the pilot. A tool that works well on one form is worth more than one that works poorly on a hundred, and the pilot gives us real HTML to test the parser against.

## Success metrics and validation

The pilot succeeds if real users finish the pilot form faster and with fewer mistakes than without the assistant. Numeric targets are set after a baseline test with 5 to 10 users.

| Metric | How we measure it |
| --- | --- |
| Task completion | Share of test users who finish the pilot form unaided |
| Time to complete | Median minutes, with and without the assistant |
| Error rate | Field-level errors or rejections per attempt |
| Comprehension | Users rate how clear each explanation is, in their language |
| Translation quality | Native-speaker review of a sample of Hindi and Tamil outputs |
| Privacy | Zero user-entered values in outbound requests, checked by automated tests |

**Testing approach**

- Unit tests for the form parser against saved HTML snapshots of the pilot portal.
- End-to-end tests with Playwright against the extension build.
- A prompt evaluation set: known fields with reference explanations, re-run whenever prompts or models change.
- Usability sessions with students and family members who match the personas.
- Manual accessibility audit with keyboard-only and screen-reader runs.

## Risks, open questions and next steps

The biggest risks are wrong explanations on a legal form and portals that change their markup.

| Risk | Mitigation |
| --- | --- |
| AI explains a field wrongly | Curated guides override AI output; show a disclaimer and link to the official instructions; evaluation set for prompts |
| Portals change their HTML | Resilient selectors based on labels and `aria-*`; saved snapshots in tests; fast guide updates |
| Poor translation quality | Native-speaker review before a language ships; community corrections |
| User data leaks to the LLM | Send structure only, mask ID patterns, test outbound requests automatically |
| LLM cost grows | Cache explanations per form; rate limits; later a bring-your-own-key or local-model option |
| Portal terms restrict assistive tools | Review terms per portal; start with portals that allow it |
| Web Store review delays | Minimal permissions, clear privacy policy, early submission |

**Open questions**

- [ ] Which single form is the pilot (scholarship portal, passport, income or community certificate)?
- [ ] Which LLM and translation providers do we use, and what is the budget?
- [ ] Who reviews Hindi and Tamil translations?
- [ ] What is the project name and domain?

**Next steps (first two weeks)**

- [ ] Choose the pilot form and save HTML snapshots of it
- [ ] Create the repo with the licence and community files
- [ ] Scaffold the WXT extension and the Shadow DOM widget shell
- [ ] Export design tokens and components from Figma
- [ ] Draft the field schema and the first curated guide
