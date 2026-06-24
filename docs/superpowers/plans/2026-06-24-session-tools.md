# Session Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 15 OurPath tools as an interactive palette panel inside `MentorNotes.jsx`, where each tool expands inline, can be used during a session, and can push results to Commitments.

**Architecture:** A `ToolsPalette` component (new) is inserted between the existing Framework and Notes panels in `MentorNotes.jsx`. It renders a 2-column grid of all 15 tools; clicking a tool renders it inline above the palette. A shared `JournalPromptTool` component handles the 8 prompt-based tools. Tool state lives in `MentorNotes` and flushes to the `sessions.tool_results` JSONB column on "Save record".

**Tech Stack:** React 18 (hooks), Vite, Supabase JS client, TERRA design system (CSS variables — `var(--navy)`, `var(--cream)`, `var(--gold)`, `var(--line)`, `var(--off-white)`, `var(--mute)`, `var(--charcoal)`, `var(--font-display)`, `var(--font-body)`). No test framework — each task ends with a browser verification step.

**Note on CSS variables:** `var(--line)` is the border/divider colour. `var(--ink-soft)` is secondary text. `var(--off-white)` is card background. Check `src/index.css` or `src/App.css` for the full list before adding new ones.

---

## Task 1: Database migrations

**Files:**
- Modify: `supabase/schema.sql`
- Action: run SQL in Supabase dashboard

- [ ] **Step 1: Add `tool_results` column to `sessions` table**

In the Supabase dashboard → SQL Editor, run:

```sql
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS tool_results jsonb DEFAULT '{}';
```

- [ ] **Step 2: Add `source_tool` column to `commitments` table**

```sql
ALTER TABLE public.commitments
  ADD COLUMN IF NOT EXISTS source_tool text;
```

- [ ] **Step 3: Update `supabase/schema.sql` to document the additions**

At the end of the `-- 2. PORTAL v2` section in `supabase/schema.sql`, add:

```sql
-- session tools (v3) ----------------------------------------------------------
alter table public.sessions
  add column if not exists tool_results jsonb default '{}';

alter table public.commitments
  add column if not exists source_tool text;
```

- [ ] **Step 4: Verify**

In Supabase dashboard → Table Editor → `sessions`: confirm `tool_results` column exists with type `jsonb`.
In `commitments`: confirm `source_tool` column exists with type `text`.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add tool_results and source_tool columns"
```

---

## Task 2: Add SESSION_TOOLS constant to frameworks.js

**Files:**
- Modify: `src/lib/constants/frameworks.js`

- [ ] **Step 1: Append SESSION_TOOLS to the end of frameworks.js**

```js
// ── Session Tools (15 tools used during mentor sessions) ─────────────────────
// kind values: 'journal' | 'session-zero' | 'ocs' | 'domains' |
//              'buckets' | 'checklist' | 'commitment' | 'review' | 'post-session'
export const SESSION_TOOLS = [
  // ── Arrive ──
  {
    id: 't1', group: 'arrive', name: 'Session Zero',
    arabic: 'al-Tawajjuh', arabicEn: 'Turning Toward',
    kind: 'session-zero',
    description: 'Opening intake. Locate and orient the mentee before any developmental work begins.',
  },
  {
    id: 't2', group: 'arrive', name: 'Pre-Session Reflection',
    arabic: 'Muḥāsaba', arabicEn: 'Self-Audit',
    kind: 'journal',
    description: 'A short reflection on what the mentee is bringing into today.',
    prompts: [
      'What am I bringing into today?',
      'Where is my attention sitting right now?',
      'What moved since I last reflected?',
    ],
  },
  {
    id: 't3', group: 'arrive', name: 'OCS Check-In',
    arabic: 'Murāqaba', arabicEn: 'Watchful Awareness',
    kind: 'ocs',
    description: 'Score the mentee across all five OCS dimensions. Builds a longitudinal profile over time.',
  },
  // ── Explore ──
  {
    id: 't4', group: 'explore', name: 'Nine Reflection Domains',
    arabic: 'al-Kashf', arabicEn: 'Unveiling',
    kind: 'domains',
    description: 'Rate the mentee\'s current engagement across all nine life territories to identify where to focus.',
  },
  {
    id: 't5', group: 'explore', name: 'Clarity Map',
    arabic: 'al-Wuḍūḥ', arabicEn: 'Clarity',
    kind: 'journal',
    description: 'Work through where the mentee is clear and where the fog is thickest.',
    prompts: [
      'Where in my life am I genuinely clear right now?',
      'Where is the fog thickest — direction, values, or identity?',
      'What would one degree more clarity change this week?',
    ],
  },
  {
    id: 't6', group: 'explore', name: 'Responsibility Map',
    arabic: 'Fāʿiliyya / Tawakkul', arabicEn: 'Agency & Trust',
    kind: 'buckets',
    description: 'Sort what is in the room — Mine, Shared, or Not mine. Act on Mine; negotiate Shared; release Not mine (tawakkul).',
  },
  {
    id: 't7', group: 'explore', name: 'Decision Discernment',
    arabic: 'al-Istishāra', arabicEn: 'Considered Choice',
    kind: 'checklist',
    description: 'Test a live decision against six pass/fail questions. Two or more fails = redesign, not willpower.',
    checks: [
      'Does it fit my values?',
      'Does it align with my purpose?',
      'Is it sustainable for me right now?',
      'Have I accounted for its true costs (time, energy, identity)?',
      'Does it honour the people it will affect?',
      'Am I acting from agency — or from reaction?',
    ],
  },
  {
    id: 't8', group: 'explore', name: 'Values & Actions',
    arabic: 'Taqwā / Niyyah', arabicEn: 'Conviction in Action',
    kind: 'journal',
    description: 'Name non-negotiable values and test how far daily action expresses them.',
    prompts: [
      'Name three non-negotiable values. Why these?',
      'Where did my actions express my values this week?',
      'Where is the largest gap between what I believe and what I do?',
    ],
  },
  {
    id: 't9', group: 'explore', name: 'Energy & Capacity',
    arabic: 'Himma', arabicEn: 'Aspirational Energy',
    kind: 'journal',
    description: 'An honest audit of the resources the mentee actually has before new commitments are added.',
    prompts: [
      'What is currently consuming most of my energy?',
      'What genuinely restores me — and how often am I doing it?',
      'What must be released before anything new is added?',
    ],
  },
  {
    id: 't10', group: 'explore', name: 'Life Season',
    arabic: 'al-Aḥwāl', arabicEn: 'States & Stations',
    kind: 'journal',
    description: 'Locate the mentee in the current season of their life.',
    prompts: [
      'What season am I in, and what is it for?',
      'What is this chapter asking of me?',
      'What is this not the time for — and can I make peace with that?',
    ],
  },
  // ── Carry ──
  {
    id: 't11', group: 'carry', name: 'Between-Session Commitment',
    arabic: 'al-Takāmul', arabicEn: 'Integration',
    kind: 'commitment',
    description: 'A specific, owned commitment the mentee carries into daily life before the next session.',
  },
  // ── Review ──
  {
    id: 't12', group: 'review', name: 'Progress Review',
    arabic: 'al-Muḥāsaba', arabicEn: 'Taking Account',
    kind: 'review',
    description: 'A look back across check-ins: name movement, reinforce what is working, process setbacks.',
  },
  {
    id: 't13', group: 'review', name: 'Workshop Card',
    arabic: 'Ṣuḥba', arabicEn: 'Companionship',
    kind: 'journal',
    description: 'Record a workshop or gathering and what the mentee took from being among others.',
    prompts: [
      'What gathering or workshop did I attend?',
      'What did I take from being among others?',
      'What did I contribute?',
    ],
  },
  {
    id: 't14', group: 'review', name: 'Outcome Summary',
    arabic: 'al-Irsāl', arabicEn: 'Sending Forth',
    kind: 'journal',
    description: 'A closing synthesis at the end of a chapter: what changed, what was learned, what carries forward.',
    prompts: [
      'What has changed since this chapter began?',
      'What did I learn that I now own?',
      'What do I carry forward — and to whom will I offer it?',
    ],
  },
  {
    id: 't15', group: 'review', name: 'Post-Session Reflection',
    arabic: 'Murāqaba', arabicEn: 'Closing Awareness',
    kind: 'post-session',
    description: 'Re-score the OCS and name the one thing worth keeping from this session.',
    prompts: ['What is the one thing from today worth keeping?'],
  },
]

// Group colours used in the palette — matches TERRA palette
export const TOOL_GROUP_COLOURS = {
  arrive:  { bg: 'rgba(46,125,94,0.12)',    text: '#2e7d5e' },
  explore: { bg: 'rgba(201,168,76,0.15)',   text: '#7a6020' },
  carry:   { bg: 'rgba(27,43,75,0.1)',      text: 'var(--navy)' },
  review:  { bg: 'rgba(150,80,150,0.1)',    text: '#7b3d8a' },
}
```

- [ ] **Step 2: Verify**

Run `npm run dev` and open the browser. In DevTools console:

```js
import('/src/lib/constants/frameworks.js').then(m => console.log(m.SESSION_TOOLS.length))
// Expected: 15
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants/frameworks.js
git commit -m "feat: add SESSION_TOOLS constant to frameworks.js"
```

---

## Task 3: JournalPromptTool shared component

**Files:**
- Create: `src/components/session-tools/JournalPromptTool.jsx`

This is the shared rendering component for all 8 `kind: 'journal'` tools. Each journal tool file (Tasks 5a–5h) will import and delegate to this.

- [ ] **Step 1: Create the file**

```jsx
/**
 * JournalPromptTool — shared renderer for all journal-prompt tools.
 *
 * Props:
 *   tool        — SESSION_TOOLS entry (has .name, .arabic, .arabicEn, .prompts, .description)
 *   result      — { answers: { [prompt]: string } } from session.tool_results[tool.id]
 *   onChange    — fn(newResult) called on every keystroke; parent batches to DB
 *   onAddCommitment — fn(text, toolName) push an answer as a commitment
 */
import { useState } from 'react'

export default function JournalPromptTool({ tool, result, onChange, onAddCommitment }) {
  const answers = result?.answers ?? {}

  function setAnswer(prompt, value) {
    onChange({ answers: { ...answers, [prompt]: value } })
  }

  return (
    <div>
      <p style={{
        fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6,
        marginBottom: 18,
      }}>
        {tool.description}
      </p>

      {tool.prompts.map(prompt => (
        <div key={prompt} style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)',
            marginBottom: 6, lineHeight: 1.4,
          }}>
            {prompt}
          </label>
          <textarea
            style={{
              width: '100%', minHeight: 80, border: '1px solid var(--line)',
              borderRadius: 7, padding: '9px 12px',
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
            }}
            value={answers[prompt] ?? ''}
            onChange={e => setAnswer(prompt, e.target.value)}
            placeholder="Write here…"
          />
          {(answers[prompt] ?? '').trim().length > 0 && (
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <button
                onClick={() => onAddCommitment(answers[prompt].trim(), tool.name)}
                style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--navy)',
                  background: 'transparent', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '3px 10px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                → Add to Commitments
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify** (visual check after wiring — no standalone run needed yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/session-tools/JournalPromptTool.jsx
git commit -m "feat: add JournalPromptTool shared component"
```

---

## Task 4: ToolsPalette scaffold

**Files:**
- Create: `src/components/session-tools/ToolsPalette.jsx`

Renders the palette grid and manages which tools are open. Actual tool components are wired in Task 14 — for now, open tools show a placeholder.

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p /Users/shakil/Our-Path-Portal/src/components/session-tools/tools
```

- [ ] **Step 2: Create `ToolsPalette.jsx`**

```jsx
/**
 * ToolsPalette — session tools panel for MentorNotes.
 *
 * Renders a 2-column grid of all 15 OurPath tools. Clicking a tool toggles
 * it open; open tools render above the palette. Multiple tools can be open.
 *
 * Props:
 *   sessionId       — current session UUID (passed to tool components)
 *   menteeId        — mentee UUID (passed to tool components)
 *   toolResults     — { [toolId]: any } loaded from sessions.tool_results
 *   onToolResultChange — fn(toolId, data) called when a tool's state changes
 *   onAddCommitment — fn(text, sourceTool) pushes a commitment to MentorNotes
 *   checkinHistory  — array of past checkin rows for ProgressReview tool
 */
import { useState } from 'react'
import { SESSION_TOOLS, TOOL_GROUP_COLOURS } from '../../lib/constants/frameworks'

// Tool components are imported in Task 14. Placeholder used until then.
function ToolPlaceholder({ tool }) {
  return (
    <p style={{ fontSize: 13, color: 'var(--mute)', fontStyle: 'italic' }}>
      {tool.description}
    </p>
  )
}

// Tool renderer map — populated in Task 14
const TOOL_RENDERERS = {}

export default function ToolsPalette({
  sessionId, menteeId, toolResults, onToolResultChange, onAddCommitment, checkinHistory,
}) {
  const [openIds, setOpenIds] = useState(new Set())

  function toggle(toolId) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(toolId) ? next.delete(toolId) : next.add(toolId)
      return next
    })
  }

  const openTools = SESSION_TOOLS.filter(t => openIds.has(t.id))

  return (
    <div className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>OurPath Tools</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', margin: 0 }}>
            Session tools
          </h3>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mute)' }}>
          {SESSION_TOOLS.length} tools available
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 18, lineHeight: 1.5 }}>
        Open any tool during the session. Use it verbally or work through it together.
        Results can be pushed to Commitments below.
      </p>

      {/* Open tool panels — render above palette */}
      {openTools.map(tool => {
        const Renderer = TOOL_RENDERERS[tool.id] || ToolPlaceholder
        return (
          <div
            key={tool.id}
            style={{
              border: '1px solid var(--navy)', borderRadius: 10,
              background: 'rgba(245,238,217,0.6)', padding: '18px 20px', marginBottom: 14,
            }}
          >
            {/* Tool header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--navy)', fontWeight: 500 }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginTop: 2 }}>
                  {tool.arabic} — {tool.arabicEn}
                </div>
              </div>
              <button
                onClick={() => toggle(tool.id)}
                style={{
                  fontSize: 12, color: 'var(--mute)', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '4px 10px', background: 'var(--off-white)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                ✕ Close
              </button>
            </div>

            <Renderer
              tool={tool}
              result={toolResults[tool.id]}
              onChange={data => onToolResultChange(tool.id, data)}
              onAddCommitment={onAddCommitment}
              checkinHistory={checkinHistory}
            />
          </div>
        )
      })}

      {/* Palette grid */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 10 }}>
        All tools — click to open
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SESSION_TOOLS.map(tool => {
          const isOpen = openIds.has(tool.id)
          const gc = TOOL_GROUP_COLOURS[tool.group]
          return (
            <button
              key={tool.id}
              onClick={() => toggle(tool.id)}
              style={{
                textAlign: 'left', border: `1px solid ${isOpen ? 'var(--navy)' : 'var(--line)'}`,
                borderRadius: 8, padding: '11px 13px', cursor: 'pointer',
                background: isOpen ? 'rgba(245,238,217,0.8)' : 'var(--cream)',
                transition: 'border-color 0.12s',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>
                {tool.name}{isOpen ? ' ▾' : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                {tool.arabic}
              </div>
              <div style={{
                display: 'inline-block', marginTop: 5, fontSize: 9, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '1px 7px', borderRadius: 3,
                background: gc.bg, color: gc.text,
              }}>
                {tool.group}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/session-tools/ToolsPalette.jsx
git commit -m "feat: scaffold ToolsPalette with grid and open/close state"
```

---

## Task 5: Wire ToolsPalette into MentorNotes

**Files:**
- Modify: `src/pages/mentor/MentorNotes.jsx`

- [ ] **Step 1: Add imports at top of MentorNotes.jsx**

After the existing import block (around line 25), add:

```js
import ToolsPalette from '../../components/session-tools/ToolsPalette'
```

- [ ] **Step 2: Add state variables**

Inside `MentorNotes()`, after `const [error, setError] = useState('')` (around line 161), add:

```js
const [toolResults, setToolResults]       = useState({})
const [checkinHistory, setCheckinHistory] = useState([])
```

- [ ] **Step 3: Add handlers**

After the `setFramework` helpers (around line 260), add:

```js
function handleToolResultChange(toolId, data) {
  setToolResults(prev => ({ ...prev, [toolId]: data }))
}

async function handleToolCommitment(text, sourceTool) {
  if (!text.trim() || !selectedSessionId) return
  const { data, error } = await supabase
    .from('commitments')
    .insert({
      mentee_id:   menteeId,
      session_id:  selectedSessionId,
      text:        text.trim(),
      source_tool: sourceTool,
    })
    .select()
    .single()
  if (error) { console.error('Tool commitment failed:', error.message); return }
  if (data) setCommitments(cs => [...cs, data])
}
```

- [ ] **Step 4: Load `tool_results` and checkin history in `loadNoteAndCommitments`**

Inside `loadNoteAndCommitments`, after the `setFramework(...)` call (around line 212), add:

```js
// Load tool results from the session row itself
const sessionRow = sessions.find(s => s.id === sessionId)
setToolResults(sessionRow?.tool_results ?? {})

// Load checkin history for ProgressReview tool
const { data: checkins } = await supabase
  .from('checkins')
  .select('id, created_at, ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum')
  .eq('mentee_id', menteeId)
  .order('created_at', { ascending: true })
setCheckinHistory(checkins ?? [])
```

**Note:** If the `checkins` table doesn't exist yet (it's a future build item), the query will return an empty array without breaking anything.

- [ ] **Step 5: Extend `saveAll` to include `tool_results`**

Inside `saveAll`, in `frameworkPayload` (around line 268), add `tool_results` to the object:

```js
const frameworkPayload = {
  phase:            framework.phase || null,
  mentor_stance:    framework.mentor_stance || null,
  ocs_clarity:      framework.ocs_clarity || null,
  ocs_agency:       framework.ocs_agency || null,
  ocs_groundedness: framework.ocs_groundedness || null,
  ocs_energy:       framework.ocs_energy || null,
  ocs_momentum:     framework.ocs_momentum || null,
  domains_explored: framework.domains_explored.length > 0 ? framework.domains_explored : null,
  what_moved:       framework.what_moved || null,
  tool_results:     Object.keys(toolResults).length > 0 ? toolResults : null,
}
```

- [ ] **Step 6: Also extend the sessions query in `loadMenteeAndSessions` to include `tool_results`**

Find the `.select(...)` call (around line 187) and add `tool_results` to the select string:

```js
const { data: s } = await supabase
  .from('sessions')
  .select('id, scheduled_at, mode, status, phase, mentor_stance, ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum, domains_explored, what_moved, tool_results')
  .eq('mentee_id', menteeId)
  .order('scheduled_at', { ascending: false })
```

- [ ] **Step 7: Insert `<ToolsPalette>` in the JSX**

Find the comment `{/* ── Panel 2: Session content ── */}` (around line 452). Insert before it:

```jsx
{/* ── Tools palette ── */}
<ToolsPalette
  sessionId={selectedSessionId}
  menteeId={menteeId}
  toolResults={toolResults}
  onToolResultChange={handleToolResultChange}
  onAddCommitment={handleToolCommitment}
  checkinHistory={checkinHistory}
/>
```

- [ ] **Step 8: Verify in browser**

Run `npm run dev`. Open a mentee's session recording page (`/mentor/notes/:menteeId`). Confirm:
- "Session tools" card appears between Framework and Notes panels
- All 15 tools appear in the palette grid
- Clicking a tool shows the placeholder panel with its name + Arabic term
- Clicking the same tool again closes it
- Multiple tools can be open simultaneously

- [ ] **Step 9: Commit**

```bash
git add src/pages/mentor/MentorNotes.jsx
git commit -m "feat: wire ToolsPalette into MentorNotes"
```

---

## Task 6: Journal tool components (8 tools)

**Files:**
- Create: `src/components/session-tools/tools/PreSessionReflection.jsx`
- Create: `src/components/session-tools/tools/ClarityMap.jsx`
- Create: `src/components/session-tools/tools/ValuesAndActions.jsx`
- Create: `src/components/session-tools/tools/EnergyAndCapacity.jsx`
- Create: `src/components/session-tools/tools/LifeSeason.jsx`
- Create: `src/components/session-tools/tools/WorkshopCard.jsx`
- Create: `src/components/session-tools/tools/OutcomeSummary.jsx`

All 7 files follow the same pattern — thin wrapper delegating to `JournalPromptTool`. (PostSessionReflection also has journal prompts but adds OCS re-scoring, so it gets its own task.)

- [ ] **Step 1: Create all 7 files**

`src/components/session-tools/tools/PreSessionReflection.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function PreSessionReflection(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/ClarityMap.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function ClarityMap(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/ValuesAndActions.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function ValuesAndActions(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/EnergyAndCapacity.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function EnergyAndCapacity(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/LifeSeason.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function LifeSeason(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/WorkshopCard.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function WorkshopCard(props) { return <JournalPromptTool {...props} /> }
```

`src/components/session-tools/tools/OutcomeSummary.jsx`:
```jsx
import JournalPromptTool from '../JournalPromptTool'
export default function OutcomeSummary(props) { return <JournalPromptTool {...props} /> }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/
git commit -m "feat: add 7 journal prompt tool components"
```

---

## Task 7: SessionZero tool

**Files:**
- Create: `src/components/session-tools/tools/SessionZero.jsx`

Session Zero is a structured intake form (not free prompts), so it gets its own implementation.

- [ ] **Step 1: Create the file**

```jsx
/**
 * SessionZero — structured intake form used in the first session.
 * Captures presenting context, readiness level, and fitra baseline note.
 * kind: 'session-zero'
 */
export default function SessionZero({ tool, result, onChange, onAddCommitment }) {
  const data = result ?? { presenting: '', readiness: '', fitra: '' }

  function update(key, val) {
    onChange({ ...data, [key]: val })
  }

  const fields = [
    { key: 'presenting', label: 'Presenting context', placeholder: 'What brought them here? What are they naming as the problem or desire?' },
    { key: 'readiness',  label: 'Readiness for change', placeholder: 'How ready do they seem — and what might be getting in the way?' },
    { key: 'fitra',      label: 'Fitra baseline note', placeholder: 'What feels original and healthy in them — before the presenting layer?' },
  ]

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            {f.label}
          </label>
          <textarea
            style={{
              width: '100%', minHeight: 80, border: '1px solid var(--line)',
              borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--font-body)',
              fontSize: 13, color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
            }}
            value={data[f.key]}
            onChange={e => update(f.key, e.target.value)}
            placeholder={f.placeholder}
          />
        </div>
      ))}
      {(data.presenting || data.readiness || data.fitra) && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => onAddCommitment(`Session Zero noted: ${data.presenting.slice(0, 80)}`, tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, color: 'var(--navy)',
              background: 'transparent', border: '1px solid var(--line)',
              borderRadius: 5, padding: '4px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/SessionZero.jsx
git commit -m "feat: add SessionZero tool component"
```

---

## Task 8: OCSCheckin tool

**Files:**
- Create: `src/components/session-tools/tools/OCSCheckin.jsx`

Mirrors the OCS scorer in the Framework panel but is standalone within the tools palette. Useful for a mid-session re-check or for sessions where the mentee completes OCS here rather than in the Framework panel.

- [ ] **Step 1: Create the file**

```jsx
/**
 * OCSCheckin — standalone OCS scorer inside the tools palette.
 * kind: 'ocs'
 * result shape: { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}

const EMPTY = { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }

export default function OCSCheckin({ tool, result, onChange, onAddCommitment }) {
  const scores = result ?? EMPTY

  function setScore(dimId, val) {
    const key = KEY_MAP[dimId]
    onChange({ ...scores, [key]: scores[key] === val ? 0 : val })
  }

  const total = OCS_DIMENSIONS.reduce((t, d) => t + (scores[KEY_MAP[d.id]] ?? 0), 0)
  const lowestDim = OCS_DIMENSIONS.reduce((low, d) => {
    const v = scores[KEY_MAP[d.id]] ?? 0
    return (v > 0 && v < (scores[KEY_MAP[low.id]] || 6)) ? d : low
  }, OCS_DIMENSIONS[0])

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {OCS_DIMENSIONS.map(dim => {
        const val = scores[KEY_MAP[dim.id]] ?? 0
        const label = val > 0 ? OCS_SCALE.find(s => s.value === val)?.label : ''
        return (
          <div key={dim.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>
                {dim.label} <span style={{ fontSize: 11, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
              </span>
              {label && <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em' }}>{label}</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setScore(dim.id, v)}
                  style={{
                    flex: 1, padding: '7px 4px', fontSize: 14, cursor: 'pointer',
                    border: `1px solid ${val === v ? 'var(--navy)' : 'var(--line)'}`,
                    borderRadius: 4, fontFamily: 'var(--font-body)',
                    background: val === v ? 'var(--navy)' : 'var(--cream)',
                    color: val === v ? 'var(--cream)' : 'var(--charcoal)',
                    transition: 'all 0.12s',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {total > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, marginTop: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            Total: {total}/25 · Lowest: {lowestDim.label}
          </span>
          <button
            onClick={() => onAddCommitment(`Focus on ${lowestDim.label} (${lowestDim.arabic}) — currently ${scores[KEY_MAP[lowestDim.id]]}/5`, tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/OCSCheckin.jsx
git commit -m "feat: add OCSCheckin tool component"
```

---

## Task 9: NineReflectionDomains tool

**Files:**
- Create: `src/components/session-tools/tools/NineReflectionDomains.jsx`

**Distinct from the Framework panel.** The Framework panel records which domains were *covered* in the session. This tool rates the mentee's engagement across all nine life territories (1–3) to identify where developmental attention is needed.

- [ ] **Step 1: Create the file**

```jsx
/**
 * NineReflectionDomains — rate the mentee's current engagement across all 9 domains (1–3).
 * kind: 'domains'
 * result shape: { ratings: { [domainName]: 1|2|3 } }
 *
 * Distinct from domains_explored in the Framework panel — this is a life-territory assessment,
 * not a record of what was discussed in session.
 */
import { REFLECTION_DOMAINS } from '../../../lib/constants/frameworks'

const RATING_LABELS = { 1: 'Neglected', 2: 'Some attention', 3: 'Active' }

export default function NineReflectionDomains({ tool, result, onChange, onAddCommitment }) {
  const ratings = result?.ratings ?? {}

  function setRating(domain, val) {
    const current = ratings[domain]
    onChange({ ratings: { ...ratings, [domain]: current === val ? 0 : val } })
  }

  const neglected = REFLECTION_DOMAINS.filter(d => !ratings[d] || ratings[d] === 1)

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {REFLECTION_DOMAINS.map(domain => {
        const val = ratings[domain] ?? 0
        return (
          <div key={domain} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', background: 'var(--cream)', border: '1px solid var(--line)',
            borderRadius: 7, marginBottom: 6,
          }}>
            <span style={{ fontSize: 13, color: 'var(--charcoal)' }}>{domain}</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {val > 0 && (
                <span style={{ fontSize: 10, color: 'var(--mute)', marginRight: 4 }}>
                  {RATING_LABELS[val]}
                </span>
              )}
              {[1, 2, 3].map(v => (
                <button
                  key={v}
                  onClick={() => setRating(domain, v)}
                  title={RATING_LABELS[v]}
                  style={{
                    width: 28, height: 28, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: `1px solid ${val === v ? 'var(--navy)' : 'var(--line)'}`,
                    borderRadius: 5, fontFamily: 'var(--font-body)',
                    background: val === v ? 'var(--navy)' : 'var(--off-white)',
                    color: val === v ? 'var(--cream)' : 'var(--mute)',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {neglected.length > 0 && Object.keys(ratings).length > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, marginTop: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            Neglected territories: {neglected.slice(0, 2).join(', ')}{neglected.length > 2 ? ` + ${neglected.length - 2} more` : ''}
          </span>
          <button
            onClick={() => onAddCommitment(`Bring attention to: ${neglected[0]}`, tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/NineReflectionDomains.jsx
git commit -m "feat: add NineReflectionDomains tool component"
```

---

## Task 10: ResponsibilityMap tool

**Files:**
- Create: `src/components/session-tools/tools/ResponsibilityMap.jsx`

- [ ] **Step 1: Create the file**

```jsx
/**
 * ResponsibilityMap — sort concerns into Mine / Shared / Not mine.
 * kind: 'buckets'
 * result shape: { items: [{ text: string, bucket: 'mine'|'shared'|'not_mine' }] }
 */
import { useState } from 'react'

const BUCKETS = [
  { id: 'mine',     label: 'Mine',     hint: 'Act fully on these.' },
  { id: 'shared',   label: 'Shared',   hint: 'Negotiate — not yours alone to carry.' },
  { id: 'not_mine', label: 'Not mine', hint: 'Release with tawakkul.' },
]

export default function ResponsibilityMap({ tool, result, onChange, onAddCommitment }) {
  const [input, setInput] = useState('')
  const [bucket, setBucket] = useState('mine')

  const items = result?.items ?? []

  function addItem() {
    if (!input.trim()) return
    onChange({ items: [...items, { text: input.trim(), bucket }] })
    setInput('')
  }

  function removeItem(idx) {
    onChange({ items: items.filter((_, i) => i !== idx) })
  }

  const mineItems = items.filter(i => i.bucket === 'mine')

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
          placeholder="Add something to sort…"
          style={{
            flex: 1, border: '1px solid var(--line)', borderRadius: 7,
            padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
        <select
          value={bucket}
          onChange={e => setBucket(e.target.value)}
          style={{
            border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px',
            fontFamily: 'var(--font-body)', fontSize: 12, background: 'var(--cream)',
            color: 'var(--charcoal)',
          }}
        >
          {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <button
          onClick={addItem}
          disabled={!input.trim()}
          style={{
            background: 'var(--navy)', color: 'var(--cream)', border: 'none',
            borderRadius: 7, padding: '8px 14px', fontWeight: 700, fontSize: 12,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Add
        </button>
      </div>

      {/* Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {BUCKETS.map(b => (
          <div key={b.id} style={{
            border: '1.5px dashed var(--line)', borderRadius: 8, padding: 10, minHeight: 80,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 6, textAlign: 'center',
            }}>
              {b.label}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 8, textAlign: 'center' }}>
              {b.hint}
            </div>
            {items.filter(i => i.bucket === b.id).map((item, idx) => {
              const globalIdx = items.indexOf(item)
              return (
                <div key={idx} style={{
                  background: 'var(--cream)', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '4px 8px', fontSize: 11, marginBottom: 4,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4,
                }}>
                  <span>{item.text}</span>
                  <button
                    onClick={() => removeItem(globalIdx)}
                    style={{ fontSize: 10, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {mineItems.length > 0 && (
        <div style={{
          padding: '10px 14px', background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#7a6020' }}>
            {mineItems.length} item{mineItems.length > 1 ? 's' : ''} in Mine → add as commitment?
          </span>
          <button
            onClick={() => mineItems.forEach(i => onAddCommitment(i.text, tool.name))}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add all Mine to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/ResponsibilityMap.jsx
git commit -m "feat: add ResponsibilityMap tool component"
```

---

## Task 11: DecisionDiscernment tool

**Files:**
- Create: `src/components/session-tools/tools/DecisionDiscernment.jsx`

- [ ] **Step 1: Create the file**

```jsx
/**
 * DecisionDiscernment — test a live decision against 6 pass/fail questions.
 * kind: 'checklist'
 * result shape: { decision: string, answers: boolean[] (length 6) }
 */
import { SESSION_TOOLS } from '../../../lib/constants/frameworks'

const tool7 = SESSION_TOOLS.find(t => t.id === 't7')

export default function DecisionDiscernment({ tool, result, onChange, onAddCommitment }) {
  const decision = result?.decision ?? ''
  const answers  = result?.answers  ?? Array(tool.checks.length).fill(null)

  function setDecision(val) {
    onChange({ decision: val, answers })
  }

  function setAnswer(idx, val) {
    const next = [...answers]
    next[idx] = next[idx] === val ? null : val
    onChange({ decision, answers: next })
  }

  const failCount = answers.filter(a => a === false).length
  const allAnswered = answers.every(a => a !== null)

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
          Decision being tested
        </label>
        <input
          type="text"
          value={decision}
          onChange={e => setDecision(e.target.value)}
          placeholder="Name the decision clearly…"
          style={{
            width: '100%', border: '1px solid var(--line)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {tool.checks.map((check, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', background: 'var(--cream)',
            border: '1px solid var(--line)', borderRadius: 7,
          }}>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--charcoal)' }}>{check}</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {[
                { val: true,  label: '✓ Yes', onStyle: { background: 'rgba(46,125,94,0.15)', color: '#2e7d5e', borderColor: 'rgba(46,125,94,0.4)' } },
                { val: false, label: '✗ No',  onStyle: { background: 'rgba(192,57,43,0.12)', color: '#c0392b', borderColor: 'rgba(192,57,43,0.35)' } },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => setAnswer(idx, opt.val)}
                  style={{
                    padding: '4px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    border: '1px solid var(--line)', borderRadius: 5, fontFamily: 'var(--font-body)',
                    background: 'var(--off-white)', color: 'var(--mute)',
                    ...(answers[idx] === opt.val ? opt.onStyle : {}),
                    transition: 'all 0.1s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div style={{
          padding: '10px 14px',
          background: failCount >= 2 ? 'rgba(192,57,43,0.08)' : 'rgba(46,125,94,0.08)',
          border: `1px solid ${failCount >= 2 ? 'rgba(192,57,43,0.3)' : 'rgba(46,125,94,0.3)'}`,
          borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: failCount >= 2 ? '#c0392b' : '#2e7d5e', fontWeight: 600 }}>
            {failCount === 0
              ? 'All checks passed — proceed with intention.'
              : failCount === 1
              ? '1 check failed — worth sitting with.'
              : `${failCount} checks failed — this decision needs redesign, not willpower.`}
          </span>
          {decision.trim() && (
            <button
              onClick={() => onAddCommitment(
                failCount >= 2
                  ? `Redesign decision: "${decision}" — ${failCount} checks failed`
                  : `Carry forward: "${decision}" — passed discernment`,
                tool.name
              )}
              style={{
                fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
                border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', marginLeft: 10,
              }}
            >
              → Add to Commitments
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/DecisionDiscernment.jsx
git commit -m "feat: add DecisionDiscernment tool component"
```

---

## Task 12: BetweenSessionCommitment tool

**Files:**
- Create: `src/components/session-tools/tools/BetweenSessionCommitment.jsx`

- [ ] **Step 1: Create the file**

```jsx
/**
 * BetweenSessionCommitment — a direct commitment builder.
 * Typing here and clicking Add immediately pushes to the Commitments panel.
 * kind: 'commitment'
 * No persistent result needed — commitment lives in the commitments table.
 */
import { useState } from 'react'

export default function BetweenSessionCommitment({ tool, onAddCommitment }) {
  const [text, setText] = useState('')

  function add() {
    if (!text.trim()) return
    onAddCommitment(text.trim(), tool.name)
    setText('')
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="What will they do before the next session?"
          style={{
            flex: 1, border: '1px solid var(--line)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13,
            background: 'var(--cream)', color: 'var(--charcoal)',
          }}
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          style={{
            background: 'var(--navy)', color: 'var(--cream)', border: 'none',
            borderRadius: 7, padding: '9px 16px', fontWeight: 700, fontSize: 12,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Add to Commitments
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--mute)', marginTop: 8, fontStyle: 'italic' }}>
        Commitments appear in the panel below. They are visible to the mentee.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/BetweenSessionCommitment.jsx
git commit -m "feat: add BetweenSessionCommitment tool component"
```

---

## Task 13: ProgressReview tool

**Files:**
- Create: `src/components/session-tools/tools/ProgressReview.jsx`

Read-only. Shows the mentee's OCS trend across all check-ins. Uses `checkinHistory` prop passed from MentorNotes.

- [ ] **Step 1: Create the file**

```jsx
/**
 * ProgressReview — read-only OCS trend across past check-ins.
 * kind: 'review'
 * No result saved — purely derived from checkinHistory.
 *
 * checkinHistory: array of { created_at, ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}

function total(row) {
  return OCS_DIMENSIONS.reduce((t, d) => t + (row[KEY_MAP[d.id]] ?? 0), 0)
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ProgressReview({ tool, checkinHistory = [] }) {
  if (checkinHistory.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--mute)', fontStyle: 'italic' }}>
        No check-in history yet for this mentee.
      </p>
    )
  }

  const last = checkinHistory[checkinHistory.length - 1]
  const prev = checkinHistory.length >= 2 ? checkinHistory[checkinHistory.length - 2] : null
  const delta = prev ? total(last) - total(prev) : null

  // Lowest dimension in most recent check-in
  let lowDim = OCS_DIMENSIONS[0]
  OCS_DIMENSIONS.forEach(d => {
    if ((last[KEY_MAP[d.id]] ?? 0) < (last[KEY_MAP[lowDim.id]] ?? 0)) lowDim = d
  })
  const lowVal = last[KEY_MAP[lowDim.id]] ?? 0
  const lowLabel = OCS_SCALE.find(s => s.value === lowVal)?.label ?? '—'

  // Plateau detection: last 3 check-ins within 1 point of each other
  const last3 = checkinHistory.slice(-3).map(total)
  const plateau = last3.length === 3 && Math.max(...last3) - Math.min(...last3) <= 1

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {/* Summary row */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18,
      }}>
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Latest total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--navy)' }}>{total(last)}<span style={{ fontSize: 13 }}>/25</span></div>
          <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>{fmtDate(last.created_at)}</div>
        </div>
        {delta !== null && (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Change</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: delta >= 0 ? '#27AE60' : '#C0392B' }}>
              {delta >= 0 ? '+' : ''}{delta}
            </div>
            <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>since previous</div>
          </div>
        )}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 4 }}>Lowest dimension</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{lowDim.label}</div>
          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{lowVal}/5 — {lowLabel}</div>
        </div>
      </div>

      {/* Per-dimension scores for latest check-in */}
      {OCS_DIMENSIONS.map(dim => {
        const val = last[KEY_MAP[dim.id]] ?? 0
        const prevVal = prev ? (prev[KEY_MAP[dim.id]] ?? 0) : null
        return (
          <div key={dim.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {dim.label} <span style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
              </span>
              <span style={{ color: 'var(--mute)' }}>
                {val}/5
                {prevVal !== null && prevVal !== val && (
                  <span style={{ color: val > prevVal ? '#27AE60' : '#C0392B', marginLeft: 6 }}>
                    {val > prevVal ? '↑' : '↓'}
                  </span>
                )}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: 'var(--gold)', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        )
      })}

      {/* Flags */}
      {plateau && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 8, fontSize: 12, color: '#7a6020',
        }}>
          ⚠ Plateau across three check-ins — possible ceiling in current structure. Consider the Energy & Capacity audit.
        </div>
      )}
      {delta !== null && delta <= -4 && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
          borderRadius: 8, fontSize: 12, color: '#c0392b',
        }}>
          ⚠ Sharp drop since last check-in — prioritise the person over the plan.
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--mute)', marginTop: 14, fontStyle: 'italic' }}>
        {checkinHistory.length} check-in{checkinHistory.length !== 1 ? 's' : ''} recorded.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/ProgressReview.jsx
git commit -m "feat: add ProgressReview tool component"
```

---

## Task 14: PostSessionReflection tool

**Files:**
- Create: `src/components/session-tools/tools/PostSessionReflection.jsx`

Re-scores OCS + one freetext prompt. Uses the same scorer as OCSCheckin but paired with the closing prompt.

- [ ] **Step 1: Create the file**

```jsx
/**
 * PostSessionReflection — re-score OCS and name the one thing worth keeping.
 * kind: 'post-session'
 * result shape: { scores: { ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum },
 *                 keeping: string }
 */
import { OCS_DIMENSIONS, OCS_SCALE } from '../../../lib/constants/frameworks'

const KEY_MAP = {
  clarity: 'ocs_clarity', agency: 'ocs_agency',
  groundedness: 'ocs_groundedness', energy: 'ocs_energy', momentum: 'ocs_momentum',
}
const EMPTY_SCORES = { ocs_clarity: 0, ocs_agency: 0, ocs_groundedness: 0, ocs_energy: 0, ocs_momentum: 0 }

export default function PostSessionReflection({ tool, result, onChange, onAddCommitment }) {
  const scores  = result?.scores  ?? EMPTY_SCORES
  const keeping = result?.keeping ?? ''

  function setScore(dimId, val) {
    const key = KEY_MAP[dimId]
    const next = { ...scores, [key]: scores[key] === val ? 0 : val }
    onChange({ scores: next, keeping })
  }

  function setKeeping(val) {
    onChange({ scores, keeping: val })
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
        {tool.description}
      </p>

      {/* Re-score */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
          Re-score OCS at close of session
        </div>
        {OCS_DIMENSIONS.map(dim => {
          const val = scores[KEY_MAP[dim.id]] ?? 0
          const label = val > 0 ? OCS_SCALE.find(s => s.value === val)?.label : ''
          return (
            <div key={dim.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>
                  {dim.label} <span style={{ fontSize: 10, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
                </span>
                {label && <span style={{ fontSize: 11, color: 'var(--gold)' }}>{label}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => setScore(dim.id, v)}
                    style={{
                      flex: 1, padding: '7px 4px', fontSize: 14, cursor: 'pointer',
                      border: `1px solid ${val === v ? 'var(--navy)' : 'var(--line)'}`,
                      borderRadius: 4, fontFamily: 'var(--font-body)',
                      background: val === v ? 'var(--navy)' : 'var(--cream)',
                      color: val === v ? 'var(--cream)' : 'var(--charcoal)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Closing prompt */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
          {tool.prompts[0]}
        </label>
        <textarea
          style={{
            width: '100%', minHeight: 80, border: '1px solid var(--line)',
            borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--font-body)',
            fontSize: 13, color: 'var(--charcoal)', background: 'var(--cream)', resize: 'vertical',
          }}
          value={keeping}
          onChange={e => setKeeping(e.target.value)}
          placeholder="One thing — a sentence is enough."
        />
      </div>

      {keeping.trim() && (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => onAddCommitment(keeping.trim(), tool.name)}
            style={{
              fontSize: 11, fontWeight: 700, background: 'var(--navy)', color: 'var(--cream)',
              border: 'none', borderRadius: 5, padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            → Add to Commitments
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/session-tools/tools/PostSessionReflection.jsx
git commit -m "feat: add PostSessionReflection tool component"
```

---

## Task 15: Wire all tool components into ToolsPalette

**Files:**
- Modify: `src/components/session-tools/ToolsPalette.jsx`

Replace the placeholder `TOOL_RENDERERS` map and `ToolPlaceholder` with actual imports.

- [ ] **Step 1: Add all imports at top of `ToolsPalette.jsx`**

Replace the `// Tool components are imported in Task 14. Placeholder used until then.` comment and the `ToolPlaceholder` function with:

```jsx
import SessionZero             from './tools/SessionZero'
import PreSessionReflection    from './tools/PreSessionReflection'
import OCSCheckin              from './tools/OCSCheckin'
import NineReflectionDomains   from './tools/NineReflectionDomains'
import ClarityMap              from './tools/ClarityMap'
import ResponsibilityMap       from './tools/ResponsibilityMap'
import DecisionDiscernment     from './tools/DecisionDiscernment'
import ValuesAndActions        from './tools/ValuesAndActions'
import EnergyAndCapacity       from './tools/EnergyAndCapacity'
import LifeSeason              from './tools/LifeSeason'
import BetweenSessionCommitment from './tools/BetweenSessionCommitment'
import ProgressReview          from './tools/ProgressReview'
import WorkshopCard            from './tools/WorkshopCard'
import OutcomeSummary          from './tools/OutcomeSummary'
import PostSessionReflection   from './tools/PostSessionReflection'
```

- [ ] **Step 2: Replace `TOOL_RENDERERS` map**

Replace `const TOOL_RENDERERS = {}` with:

```js
const TOOL_RENDERERS = {
  t1:  SessionZero,
  t2:  PreSessionReflection,
  t3:  OCSCheckin,
  t4:  NineReflectionDomains,
  t5:  ClarityMap,
  t6:  ResponsibilityMap,
  t7:  DecisionDiscernment,
  t8:  ValuesAndActions,
  t9:  EnergyAndCapacity,
  t10: LifeSeason,
  t11: BetweenSessionCommitment,
  t12: ProgressReview,
  t13: WorkshopCard,
  t14: OutcomeSummary,
  t15: PostSessionReflection,
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Open a mentee's session page. Confirm:

1. All 15 tools appear in the palette grid with correct names, Arabic terms, and group colour tags
2. Clicking each tool opens it with its correct UI:
   - t1 Session Zero: 3 text areas (presenting, readiness, fitra)
   - t2 Pre-Session Reflection: 3 prompts with freetext areas
   - t3 OCS Check-In: 5 dimension scorers (1–5 buttons)
   - t4 Nine Reflection Domains: 9 domains with 1–3 rating buttons
   - t5 Clarity Map: 3 prompts
   - t6 Responsibility Map: input + bucket selector + 3 bucket columns
   - t7 Decision Discernment: decision text input + 6 yes/no rows
   - t8–t10: 3 prompts each
   - t11 Between-Session Commitment: single text input + Add button
   - t12 Progress Review: summary cards + per-dimension bars (or "no history" message)
   - t13–t14: 3 prompts each
   - t15 Post-Session Reflection: OCS re-scorer + one prompt
3. "→ Add to Commitments" works: commitment appears in Commitments panel below
4. Commitments added from tools show the source tool name (← from Responsibility Map)
5. Clicking "Save record" saves tool state — reload the page, select the same session, confirm tool data persists

- [ ] **Step 4: Commit**

```bash
git add src/components/session-tools/ToolsPalette.jsx
git commit -m "feat: wire all 15 tool components into ToolsPalette"
```

---

## Self-review notes

- **DB migrations** (Task 1) must be run before opening the session page — the Supabase update in `saveAll` will fail silently on `tool_results` if the column doesn't exist.
- **`source_tool`** in Commitments: the existing `MentorNotes` `addCommitment` function (line 314) does not pass `source_tool`. Only `handleToolCommitment` (added in Task 5) passes it. Manually-added commitments correctly leave `source_tool` as null — this is intentional.
- **`checkins` table**: `MentorNotes` queries it in Task 5. If it doesn't exist yet, the Supabase client returns an error that is silently caught (empty array used). ProgressReview shows "No check-in history" in that case.
- **Journal tool thin wrappers** (Task 6): each file is 3 lines that delegates to `JournalPromptTool`. The tool metadata (prompts, description) comes from `SESSION_TOOLS` via the `tool` prop passed by `ToolsPalette`, so the wrappers need no logic of their own.
