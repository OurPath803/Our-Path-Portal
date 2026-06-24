# Session Tools — Design Spec
**Date:** 2026-06-24  
**Status:** Approved  
**Location:** `Our-Path-Portal` (React + Vite + Supabase)

---

## 1. Problem

`MentorNotes.jsx` handles session recording (phase, stance, OCS, domains, notes, commitments) but has no way to use the 15 OurPath tools (Responsibility Map, Decision Discernment, Clarity Map, etc.) during a session. Sawon must mentally hold all tool content or consult external documents while recording.

---

## 2. Solution

Add a **Tools panel** to `MentorNotes.jsx` between the Framework panel and the Notes panel. The panel contains:

1. A **2-column palette grid** of all 15 tools, grouped by colour (Arrive / Explore / Carry / Review)
2. Click a tool → it **expands inline** above the palette as an interactive panel
3. Multiple tools can be open simultaneously
4. Each open tool has a **"→ Add to Commitments"** action that pushes a commitment to the session record with the source tool noted
5. Tool state is saved to the session record when Sawon clicks "Save record"

---

## 3. Architecture

### 3.1 New file structure

```
src/
  components/
    session-tools/
      ToolsPalette.jsx          ← orchestrator: grid + open tool state
      tools/
        SessionZero.jsx
        PreSessionReflection.jsx
        OCSCheckin.jsx
        NineReflectionDomains.jsx
        ClarityMap.jsx
        ResponsibilityMap.jsx
        DecisionDiscernment.jsx
        ValuesAndActions.jsx
        EnergyAndCapacity.jsx
        LifeSeason.jsx
        BetweenSessionCommitment.jsx
        ProgressReview.jsx
        WorkshopCard.jsx
        OutcomeSummary.jsx
        PostSessionReflection.jsx
```

### 3.2 MentorNotes.jsx change

Insert `<ToolsPalette>` between Panel 1 (Framework) and Panel 2 (Notes):

```jsx
{/* Panel 1: Framework */}
{/* NEW: Tools panel */}
<ToolsPalette
  sessionId={selectedSessionId}
  menteeId={menteeId}
  onAddCommitment={handleToolCommitment}
  toolResults={toolResults}
  onToolResultChange={handleToolResultChange}
/>
{/* Panel 2: Notes */}
{/* Panel 3: Commitments */}
```

### 3.3 ToolsPalette props

| Prop | Type | Purpose |
|---|---|---|
| `sessionId` | string | Current session — tools save against this |
| `menteeId` | string | Needed for Commitments insert |
| `onAddCommitment` | fn(text, sourceToolName) | Parent adds to commitments list |
| `toolResults` | object | `{ [toolId]: any }` — loaded from session row |
| `onToolResultChange` | fn(toolId, data) | Parent saves to session row |

---

## 4. Tool Definitions

All 15 tools, grouped as they appear in the palette:

### Arrive (3 tools)
| Tool | ID | Kind | Interactive element |
|---|---|---|---|
| Session Zero | t1 | Info + form | Structured intake fields (presenting context, readiness, fitra baseline) |
| Pre-Session Reflection | t2 | Journal prompts | 3 prompts, freetext answers |
| OCS Check-In | t3 | Scorer | 5 dimensions, 1–5 buttons (mirrors Framework panel but standalone) |

### Explore (7 tools)
| Tool | ID | Kind | Interactive element |
|---|---|---|---|
| Nine Reflection Domains | t4 | Selector | 9 domain chips; rate each 1–3; output = which to explore. **Distinct from the Framework panel** — the Framework records which domains were *covered* in session; this tool rates the client's life across all 9 to identify where to focus. |
| Clarity Map | t5 | Journal prompts | 3 prompts, freetext |
| Responsibility Map | t6 | Buckets | Text input + Mine/Shared/Not Mine select → items list per bucket |
| Decision Discernment | t7 | Checklist | Decision text input + 6 yes/no questions; fail count shown |
| Values & Actions | t8 | Journal prompts | 3 prompts, freetext |
| Energy & Capacity | t9 | Journal prompts | 3 prompts, freetext |
| Life Season | t10 | Journal prompts | 3 prompts, freetext |

### Carry (1 tool)
| Tool | ID | Kind | Interactive element |
|---|---|---|---|
| Between-Session Commitment | t11 | Commitment builder | Text input → directly adds to Commitments |

### Review (4 tools)
| Tool | ID | Kind | Interactive element |
|---|---|---|---|
| Progress Review | t12 | Read-only insights | Shows OCS trend + heuristic insights (no input) |
| Workshop Card | t13 | Journal prompts | 3 prompts, freetext |
| Outcome Summary | t14 | Journal prompts | 3 prompts, freetext |
| Post-Session Reflection | t15 | Re-scorer + prompt | Re-score OCS + "one thing worth keeping" freetext |

---

## 5. Tool Component Interface

Every tool component receives the same props:

```jsx
function SomeTool({ result, onChange, onAddCommitment }) {
  // result          — saved state for this tool (from session.tool_results[toolId])
  // onChange        — call with updated state; parent batches to DB on "Save record"
  // onAddCommitment — call with (text, toolName) to push a commitment to parent
}
```

`sessionId` and `menteeId` are **not** passed to individual tools — the parent `ToolsPalette` holds them and the `onAddCommitment` closure in `MentorNotes` captures them. This keeps tool components stateless and testable in isolation.

Exception: `ProgressReview` (t12) needs historical OCS data. It receives an additional `checkinHistory` prop, loaded by `MentorNotes` from the `checkins` table when the session is selected.

The parent (`ToolsPalette`) handles open/close state. Each tool is only rendered when open, so there is no performance cost for unused tools.

---

## 6. Push-to-Commitments flow

1. Tool surfaces a `→ Add to Commitments` button when there is actionable output (e.g., a "Mine" item in Responsibility Map, a failed discernment question, a journal answer)
2. Clicking calls `onAddCommitment(text, toolName)`
3. `MentorNotes` appends the commitment to its `commitments` state and inserts to Supabase `commitments` table
4. Commitment row displays a source label: `← from Responsibility Map`
5. Source is stored in `commitments.source_tool` column (new nullable text column)

---

## 7. Data model

### 7.1 `sessions` table — one new column

```sql
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS tool_results jsonb DEFAULT '{}';
```

Shape: `{ "t6": { items: [...], buckets: {...} }, "t7": { decision: "...", answers: [...] }, ... }`

### 7.2 `commitments` table — one new column

```sql
ALTER TABLE commitments
  ADD COLUMN IF NOT EXISTS source_tool text;
```

Nullable. Populated only when commitment originates from a tool.

### 7.3 No new tables needed.

---

## 8. Save behaviour

- `MentorNotes.saveAll()` already saves framework fields and notes
- `tool_results` is added to the session update payload in `saveAll()`
- Tools call `onToolResultChange(toolId, data)` on every change — this updates local state only (no immediate DB write to avoid excessive round-trips)
- All tool state flushes to DB on "Save record" alongside notes

---

## 9. UX details

- Palette items show: tool name, Arabic term (italic, gold), group tag (colour-coded)
- Open tools show a `✕ Close` button top-right
- Open indicator: palette item gets a navy border + `▾` suffix on name
- Multiple tools can be open simultaneously — they stack above the palette
- Tool panels use TERRA colours: navy/cream/gold, Cormorant Garamond display headings, DM Sans body
- "→ Add to Commitments" bar only appears when the tool has produced actionable output

---

## 10. Out of scope

- Client-facing tool access (separate feature — OCS check-in tool in client Dashboard is listed as Build Priority #4)
- AI reflection augmentation (the prototype's optional API key feature)
- Tool usage analytics / reporting
- Drag-and-drop reordering of palette items

---

## 11. Files changed

| File | Change |
|---|---|
| `src/pages/mentor/MentorNotes.jsx` | Add `ToolsPalette` import + insert panel; extend `saveAll` to include `tool_results`; add `handleToolCommitment` and `handleToolResultChange` handlers; load `tool_results` from session row |
| `src/components/session-tools/ToolsPalette.jsx` | New — orchestrates open state, renders palette grid + open tool components |
| `src/components/session-tools/tools/*.jsx` | New — 15 tool components |
| `src/lib/constants/frameworks.js` | Verify `TOOLS` constant exists; add if missing |
| `supabase/schema.sql` | Add `tool_results` to sessions; add `source_tool` to commitments |
| Supabase dashboard | Run the two ALTER TABLE migrations |
