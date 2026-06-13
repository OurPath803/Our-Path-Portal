# OurPath Portal — Navigation Manual

*For Sawon's reference. Last updated June 2026.*

---

## How the system is divided

There are three distinct areas:

1. **Public site** — anyone can visit, no login needed
2. **Client portal** — mentees log in here
3. **Mentor console** — only you (and any admin) can access this

The portal and public site are the same app. The same URL, different pages depending on whether someone is logged in and what role they have.

---

## 1. Public Site

No login required. Anyone visiting the site lands here.

### `/` — Home (Landing)
The main marketing page. Explains what OurPath is, the three pillars (1-1 mentoring, workshops, journal), and points people toward booking.

### `/triage-call` — Mentoring page
Explains how 1-1 mentoring works, the four stages, pricing (£30 / £120 / £240 / £360), FAQ, and Session Zero reflection questions. Has two CTAs: **Create Your Profile** (→ referral form) and **Get in Touch** (→ contact).

### `/referral` — Referral & Intake Form
The main entry point for new clients. They fill in personal details, what they're navigating, preferences (format, frequency), and give consent. Submits to the `applications` table in the database. You get a notification email when one comes in.

### `/workshops` — Gift Series page
Information about the four-workshop programme (Mind, Heart, Soul, Hands).

### `/training` — Practitioner Training page
Information about the five-level Mentor Practitioner Pathway.

### `/barakah-base` — Barakah Base
Podcast hub page. Series 1 placeholder (July–Oct 2026).

### `/our-story` — Our Story
About OurPath, the founder, the framework.

### `/blog` — Blog
Pulls posts from Notion via a Netlify Function.

### `/contact` — Contact
Contact form. Submissions go to hello@ourpathguidance.co.uk.

### `/rhythms` — Rhythms
Explains the session packages and cadences. Has Stripe payment links. Clients land here when they're ready to commit.

---

## 2. Client Portal

Mentees log in at `/login`. After logging in they land on `/dashboard`.

The sidebar on the left is their navigation. Here is every page:

### `/dashboard` — Dashboard
Their home screen. Shows a welcome, quick links to journal and messaging, and an OCS check-in card (self-reported wellbeing scores). If they have upcoming sessions, they appear here.

### `/journal` — Journal
Two modes: **Structured** (5 guided reflection questions) and **Freewrite** (open text). They can mark entries as shared with you. You see shared entries in your mentor console.

### `/sessions` — Sessions
If they have an active subscription, the Calendly booking widget appears here so they can book their next session. If no subscription is active, it directs them to `/rhythms` to choose a package.

### `/between` — Between Sessions (Messaging)
The messaging thread between the mentee and you. They can send text and attach files (PDFs, documents, images — up to 10 MB). You reply from your side. Both sides get email notifications when a new message arrives.

### `/notes` — Notes
Read-only view of session notes you have written for them (the notes you mark as shared in your console).

### `/profile` — Profile
Their account details. Name, email, phone. They can update basic information here.

### `/settings` — Settings
Account settings. Password change and notification preferences.

---

### Tools (`/tools/...`)

All tools are accessible to logged-in clients. They are structured reflection exercises that support the mentoring work.

| Tool | URL | What it does |
|------|-----|--------------|
| OCS Check-In | `/tools/ocs-checkin` | Self-score on 5 dimensions: Clarity, Agency, Groundedness, Energy, Momentum (1–5 scale) |
| Nine Domains | `/tools/nine-domains` | Reflect across the nine life territories |
| Progress Review | `/tools/progress-review` | Review movement across the al-Masīr phases |
| Clarity Map | `/tools/clarity-map` | Sort what's clear vs unclear in a situation |
| Decision Sheet | `/tools/decision-sheet` | Structured decision-making framework |
| Energy Audit | `/tools/energy-audit` | Map what drains vs restores energy |
| Values Alignment | `/tools/values-alignment` | Check actions against stated values |
| Position Map | `/tools/position-map` | Score across Clarity, Commitment, Capacity, Context |
| Cost Audit | `/tools/cost-audit` | Examine the real cost of staying stuck |
| Integration Filter | `/tools/integration-filter` | Test whether insights have been embodied |
| Orientation Framework | `/tools/orientation` | Full al-Masīr orientation exercise |

---

## 3. Mentor Console

Only accessible when logged in with a mentor or admin account. These pages are at `/mentor/...`.

### `/mentor` — Mentor Dashboard
Your home screen. Lists all active mentees. Click a mentee's name to go to their management page. Also shows a summary of recent activity.

### `/mentor/applications` — Applications
Lists all referral form submissions (from `/referral`). For each application you can:
- View what they submitted
- Change their status: **pending → screened → accepted → declined**
- Accepting an application creates their client record and sends them a welcome email with portal access

### `/mentor/manage/:menteeId` — Manage a Mentee
The control centre for one mentee. From here you can:
- View their client record (package, sessions remaining, status)
- **Send induction pack** — creates a unique link and emails it to them. The link opens a form they fill in before Session Zero (no login required)
- View and copy their induction form link manually if the email fails
- See induction form responses once submitted
- Manage their subscription status
- Run automations A–G (email sequences, reminders)

### `/mentor/notes/:menteeId` — Session Notes
Where you write session records for a mentee. Each note can capture:
- Session number, date, phase (al-Masīr), mentor stance
- OCS scores (Clarity, Agency, Groundedness, Energy, Momentum)
- Reflection domains covered
- What moved, observations, next intention

No messaging here — session recording only.

### `/between?with=:menteeId` — Messaging (mentor side)
Same page clients use, but when you're logged in as mentor it detects your role and sets the mentee as your counterpart. Access this via the **Messages** button next to each mentee on the Mentor Dashboard. Full attachment support — paperclip button lets you send PDFs, documents, and images up to 10 MB.

### `/mentor/journal/:menteeId` — View Mentee Journal
Read-only view of entries the mentee has chosen to share with you.

---

## 4. Entry/Auth Pages

| Page | Purpose |
|------|---------|
| `/login` | Email + password login for clients and mentor |
| `/forgot-password` | Sends a password reset email |
| `/reset-password` | Link from that email — set new password |
| `/induction/:token` | Induction form for new clients. No login needed. Token is unique per person — you send the link via MentorManage |

---

## 5. Legal Pages

All linked from the footer.

| Page | Content |
|------|---------|
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/cookies` | Cookie policy |
| `/safeguarding` | Safeguarding statement |

---

## Quick reference — who can see what

| Area | Who has access |
|------|---------------|
| Public site (`/`, `/triage-call`, `/referral`, etc.) | Everyone |
| `/dashboard`, `/journal`, `/sessions`, `/between`, `/notes`, `/tools/*` | Logged-in clients only |
| `/mentor`, `/mentor/*` | Mentor / admin only |
| `/induction/:token` | Anyone with the unique link (no login) |

---

*This document lives at `NAVIGATION.md` in the portal repo root.*
