# CLAUDE.md — OurPath OS

## Persistent briefing for Claude Code. Read this at the start of every session.

---

## 1. What is OurPath?

**OurPath Guidance Ltd** is a developmental mentoring service registered in the UK (Companies House). It operates at the intersection of Islamic psychospiritual tradition and Western developmental science, positioned within Camden's Voluntary Sector tier.

The founder and sole director is **Sawon Moazzem** — Director, Lead Mentor, ʿĀlim (Islamic scholarly qualification), OT apprentice, and imam. He works across multiple roles simultaneously, so build time is limited and sessions must be efficient. He is not a developer. Code should be clean, well-commented, and easy to extend without deep technical knowledge.

**Website:** ourpathguidance.co.uk

**Business email:** hello@ourpathguidance.co.uk

**Registered in England & Wales**

---

## 2. What is OurPath OS?

OurPath OS is a unified operational platform that consolidates everything into one Next.js + Supabase system:

Module
Description

**Public website**
9-page marketing site (currently live on Netlify)

**Client Portal**
Authenticated area for clients — session history, tools, documents

**Mentor Console**
Sawon's session recording dashboard using OurPath frameworks

**Barakah Base**
Podcast hub — Series 1, 8 episodes, July–Oct 2026

**Gift Series**
4-workshop programme (Mind, Heart, Soul, Hands)

**Practitioner Training**
5-level Mentor Practitioner Pathway (course delivery)

**Admin Panel**
Client management, applications, discharge, payments

---

## 3. Tech Stack

Layer
Tool
Notes

Frontend
**React + Vite**
JavaScript (portal), HTML/CSS (website)

Database
**Supabase**
Auth + Postgres + Row Level Security — schema v2 already applied

Hosting
**Netlify**
Both repos deploy via Netlify continuous deployment (GitHub → auto-deploy)

Payments
**Stripe**
4 payment links live

Scheduling
**Calendly**
hello-ourpathguidance, Saturdays 10am–5pm

Email
**Google Workspace**
hello@ourpathguidance.co.uk, 12 Gmail templates

Serverless
**Netlify Functions**
Already in portal repo for Calendly webhook + Notion blog

Design system
**TERRA**
See Section 5 — not yet applied to portal, must be added

---

## 4. Database Schema (Supabase)

Mirror the existing Notion CRM structure. These are the core tables:

### `applications`

```
id, created_at, full_name, email, phone, referral_source,
presenting_concern, preferred_days, consent_given, status
(status: pending | screened | accepted | declined)
```

### `clients`

```
id, created_at, application_id (FK), full_name, email, phone,
package_type (single|4|8|12), sessions_total, sessions_remaining,
stripe_customer_id, status (active|maintenance|community|discharged),
start_date, review_date, assigned_mentor
```

### `sessions`

```
id, created_at, client_id (FK), session_number, session_date,
phase (orientation|excavation|clarification|construction|integration|transmission),
mentor_stance (shahid|miraa|dalil|rafiq),
ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum,
(all OCS scores: integer 1-5)
domains_explored (text array — from Nine Reflection Domains),
session_notes, what_moved, mentor_observations, next_session_intention
```

### `discharge`

```
id, created_at, client_id (FK), discharge_date, reason,
final_phase, summary_narrative, outcomes_noted, follow_up_agreed
```

### `group_sessions`

```
id, created_at, group_name, session_date, facilitator,
gift_theme (mind|heart|soul|hands), attendance_count,
session_notes, cole_steps_completed
```

### `course_enrolments`

```
id, created_at, user_id (FK), level (1|2|3|4|5),
level_name (asas|taalum|tadbir|tamkin|irshal),
enrolment_date, status (active|paused|complete|certified),
portfolio_submitted, assessment_passed, certificate_issued
```

**Row Level Security:** Always implement RLS. Clients see only their own records. Mentors see assigned clients. Admin sees everything.

---

## 5. TERRA Design System

Apply consistently to every UI element.

### Colours

```
Navy:  #1B2B4B  — primary, text, authority
Cream: #F5EED9  — background, canvas
Gold:  #C9A84C  — accent, dividers, highlights (use sparingly)
```

Supporting:

```
Charcoal: #2C2C2C  — body text on cream
Off-white: #FAF7F0  — cards, surfaces on navy
Error red: #C0392B
Success green: #27AE60
```

### Typography

```
Display / Headings: Cormorant Garamond (elegant serif) — Google Fonts
Body / UI / Labels: DM Sans (clean grotesque) — Google Fonts
```

Never use sans-only treatment on hero headings. Generous whitespace. Quiet confidence — scholarly, calm, premium. Not corporate, not wellness-influencer.

### CSS Variables (add to globals.css)

```
:root {
  --navy: #1B2B4B;
  --cream: #F5EED9;
  --gold: #C9A84C;
  --charcoal: #2C2C2C;
  --off-white: #FAF7F0;
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'DM Sans', sans-serif;
}
```

### Tone

Understated authority. Thin gold rules, not heavy borders. No drop shadows. No gradients. No clip-art. Motif: restrained geometric or arch element (Islamic-geometry-inspired line).

---

## 6. OurPath Frameworks (encode as constants)

These are the proprietary frameworks used throughout the platform — in the Mentor Console, Client Portal tools, and training course.

### The Pathway — al-Masīr (6 phases)

```
export const AL_MASIR_PHASES = [
  { id: 'orientation',    arabic: 'al-Tawajjuh',  label: 'Orientation' },
  { id: 'excavation',     arabic: 'al-Kashf',     label: 'Excavation' },
  { id: 'clarification',  arabic: 'al-Wuḍūḥ',    label: 'Clarification' },
  { id: 'construction',   arabic: 'al-Bināʾ',     label: 'Construction' },
  { id: 'integration',    arabic: 'al-Takāmul',   label: 'Integration' },
  { id: 'transmission',   arabic: 'al-Irsāl',     label: 'Transmission' },
]
```

### OurPath Check-In Scale — OCS (5 dimensions, scored 1–5)

```
export const OCS_DIMENSIONS = [
  { id: 'clarity',       arabic: 'Wuḍūḥ',      label: 'Clarity' },
  { id: 'agency',        arabic: 'Fāʿiliyya',   label: 'Agency' },
  { id: 'groundedness',  arabic: 'Thubūt',      label: 'Groundedness' },
  { id: 'energy',        arabic: 'Himma',        label: 'Energy' },
  { id: 'momentum',      arabic: 'Sīra',         label: 'Momentum' },
]

export const OCS_SCALE = [
  { value: 1, label: 'Absent' },
  { value: 2, label: 'Flickering' },
  { value: 3, label: 'Present but fragile' },
  { value: 4, label: 'Stable' },
  { value: 5, label: 'Integrated' },
]
```

### Four Mentor Stances

```
export const MENTOR_STANCES = [
  { id: 'shahid',  arabic: 'Shāhid',  label: 'Witness',    description: 'Hold space without interpretation' },
  { id: 'miraa',   arabic: 'Mirʾā',   label: 'Mirror',     description: 'Reflect back with clarity' },
  { id: 'dalil',   arabic: 'Dalīl',   label: 'Guide',      description: 'Point direction in specific terrain' },
  { id: 'rafiq',   arabic: 'Rafīq',   label: 'Companion',  description: 'Walk alongside in the ongoing journey' },
]
```

### Nine Reflection Domains

```
export const REFLECTION_DOMAINS = [
  'Identity & Origin',
  'Values & Conviction',
  'Purpose & Direction',
  'Relationships & Community',
  'Work & Contribution',
  'Inner State & Spiritual Life',
  'Obstacles & Patterns',
  'Growth & Learning',
  'Legacy & Contribution',
]
```

### Position Map (4 dimensions)

```
export const POSITION_MAP_DIMENSIONS = ['Clarity', 'Commitment', 'Capacity', 'Context']
```

### Five Practitioner Pathway Levels

```
export const PATHWAY_LEVELS = [
  { level: 1, id: 'asas',   arabic: 'Asās الأساس',     label: 'Foundation' },
  { level: 2, id: 'taalum', arabic: 'Taʿallum التعلم', label: 'Learning' },
  { level: 3, id: 'tadbir', arabic: 'Tadbīr التدبير',  label: 'Practice' },
  { level: 4, id: 'tamkin', arabic: 'Tamkīn التمكين',  label: 'Consolidation' },
  { level: 5, id: 'irshal', arabic: 'Irsāl الإرسال',   label: 'Transmission' },
]
```

---

## 7. Current Live Integrations

Service
Status
Notes

Stripe
✅ Live
Single £30, 4-pack £120, 8-pack £240, 12-pack £360

Calendly
✅ Live
hello-ourpathguidance, Saturdays 10am–5pm

Netlify
✅ Live
Current 9-page site hosted here

Netlify Forms
✅ Live
Referral/intake form, contact form

Google Workspace
✅ Live
hello@ourpathguidance.co.uk

Supabase
✅ Connected
Project exists, schema to be built

Notion
✅ Live
Operational workspace + CRM planning

Google Drive
✅ Live
Document archive

---

## 8. GitHub Repositories & Netlify Deployment

### The two active repos (both under github.com/OurPath803)

**`website`** — Public marketing site

- Stack: plain HTML, CSS, JavaScript

- Pages: index, blog, contact, mentoring, our-story, referral, workshops + logo assets

- Deploys to: `ourpathguidance.co.uk` via Netlify

- How to deploy: push to main branch → Netlify auto-builds and deploys in ~30 seconds

- Do not convert to React — keep as HTML/CSS for speed and simplicity

**`Our-Path-Portal`** — The authenticated app (primary build target)

- Stack: React + Vite, JavaScript, Supabase, Netlify Functions

- Deploys to: `portal.ourpathguidance.co.uk` (or subdomain TBC) via Netlify

- How to deploy: push to main branch → Netlify builds React app and deploys automatically

- This is the OurPath OS foundation — all new portal/console/admin work goes here

**`ourpath-connect`** — Retired (Lovable-built TypeScript attempt)

- Do not build into this repo

- Can be mined for schema ideas but treat as archived

- Uses a separate Supabase project (Frankfurt: zdirvcfzpesilafydbrr) — do not confuse with portal's Supabase project

### Netlify → GitHub connection (one-time setup if not done)

1. Go to netlify.com → site settings → Build & Deploy → Link to Git

2. Connect to GitHub → select the relevant repo

3. Build command for portal: `npm run build`

4. Publish directory for portal: `dist`

5. For website: no build command, publish directory is `/` (root)

6. After linking, every `git push` to main triggers an automatic deploy

### Local workflow for Claude Code

```
git clone https://github.com/OurPath803/Our-Path-Portal
cd Our-Path-Portal
# drop CLAUDE.md in here
npm install
npm run dev        ← local preview at localhost:5173
# make changes
git add .
git commit -m "description"
git push           ← triggers Netlify auto-deploy
```

## 9. What's Already Built in `Our-Path-Portal`

This repo is the primary build target. The following is already scaffolded and working:

**Client (mentee) pages:**

- `Landing.jsx` — public landing / login entry point

- `Login.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` — full auth flow

- `Dashboard.jsx` — client home dashboard

- `Sessions.jsx` — session history

- `Journal.jsx` — structured + freewrite journal

- `Notes.jsx` — session notes view

- `BetweenSessions.jsx` — between-session commitments

- `Rhythms.jsx` — session rhythm preferences

- `Settings.jsx` — account settings

- `TriageCall.jsx` — triage/screening call booking

- `Blog.jsx`, `BlogPost.jsx` — Notion-powered blog

- `legal/` — legal pages (privacy, safeguarding etc.)

**Mentor pages:**

- `MentorDashboard.jsx` — mentor home

- `MentorApplications.jsx` — review and manage applications

- `MentorNotes.jsx` — session notes with messaging

- `MentorJournal.jsx` — view shared mentee journals

- `MentorManage.jsx` — concierge controls, pricing management, automations A–G

**Infrastructure already in place:**

- `AuthContext` — Supabase auth with profile row handling

- `ProtectedRoute.jsx` — client auth guard

- `MentorRoute.jsx` — mentor/admin auth guard

- `Sidebar.jsx` — navigation sidebar

- `Footer.jsx` — with safeguarding policy

- `Netlify Functions` — Calendly webhook + Notion blog integration

- `supabase/schema.sql` — v2 schema with all tables and RLS

**What is NOT yet done (build these next):**

- TERRA design system — currently uses default CSS, needs navy/cream/gold applied

- OurPath framework constants — al-Masīr, OCS, Four Stances not yet in codebase

- OCS check-in tool in client portal

- Mentor session recording form with full framework fields (phase, stance, OCS scores, domains)

- Gift Series pages

- Barakah Base podcast hub

- Practitioner Training course delivery

- Admin panel (beyond MentorManage)

---

## 10. Build Priorities (in order)

When Sawon asks to build something, default to this sequence unless he says otherwise:

1. **TERRA** — apply design system to all existing portal pages (navy/cream/gold, Cormorant Garamond/DM Sans)

2. **Framework constants** — add `src/lib/constants/frameworks.js` with all OurPath constants from Section 6

3. **Mentor session recording** — upgrade MentorNotes to full session recording form (phase, stance, OCS, domains, what moved)

4. **OCS check-in tool** — add to client Dashboard so clients can self-report each session

5. **Schema additions** — add missing columns to sessions table (phase, stance, OCS scores, domains_explored)

6. **Website (separate repo)** — apply TERRA styling updates to HTML/CSS site

7. **Payments** — Stripe webhook → auto-create client record on successful payment

8. **Gift Series** — gated workshop content pages

9. **Barakah Base** — podcast hub

10. **Practitioner Training** — course delivery with level progression

11. **Admin panel** — full CRM beyond current MentorManage

---

## 10. Rules — Never Break These

- **Always use the TERRA design system.** No default blues or greys.

- **Never break existing pages.** Migrations must maintain URLs and content.

- **Always implement Supabase RLS.** Never expose one client's data to another.

- **Non-clinical boundary must be visible.** Any client-facing health-adjacent content must include: *"OurPath is non-clinical developmental mentoring, not therapy or medical treatment."*

- **Arabic terms** — use the canonical spelling from Section 6. Do not guess or transliterate differently.

- **Framework integrity** — OCS is 5 dimensions scored 1–5. Nine Domains are territories, not a scored scale. Never conflate them.

- **Comments in code** — always comment component purpose and any OurPath-specific logic. Sawon is not a developer.

- **One thing at a time** — build, confirm, then proceed. Do not make large unconfirmed changes.

---

## 11. File Structure (target)

```
/ourpath-os
  /app
    /page.tsx                  ← home
    /about/page.tsx
    /mentoring/page.tsx
    /book/page.tsx
    /portal/
      /page.tsx                ← client dashboard
      /sessions/page.tsx
      /tools/ocs/page.tsx
    /mentor/
      /page.tsx                ← mentor console
      /session/[id]/page.tsx
    /admin/
      /page.tsx
      /clients/page.tsx
    /training/
      /page.tsx
      /[level]/page.tsx
    /barakah-base/page.tsx
    /gift-series/page.tsx
  /components
    /ui/                       ← TERRA component library
    /portal/
    /mentor/
    /admin/
  /lib
    /supabase.ts
    /stripe.ts
    /constants/
      frameworks.ts            ← all OurPath constants from Section 6
      packages.ts
  /styles
    globals.css                ← TERRA CSS variables
  CLAUDE.md                    ← this file
```

---

## 12. How Sawon Works With Claude Code

- Sawon will describe what he wants to add in plain language

- He will drop in files (existing HTML, CSVs, documents) when relevant

- He will confirm before each significant step

- He does not want large unilateral changes

- If something is ambiguous, ask before building

- After each session, update the `## Progress Log` section below

---

## Progress Log

*(Claude Code: append a dated entry after each build session)*

- **2026-06-10** — CLAUDE.md created and updated. Three repos identified: `website` (live HTML site), `Our-Path-Portal` (primary build target — React/Vite, substantial portal already built), `ourpath-connect` (retired Lovable attempt). Netlify continuous deployment documented. Next step: clone Our-Path-Portal locally, drop CLAUDE.md in root, run `npm install`, then apply TERRA design system.

---

*OurPath Guidance Ltd · ourpathguidance.co.uk · TERRA design system*

*navy #1B2B4B / cream #F5EED9 / gold #C9A84C · Cormorant Garamond + DM Sans*
