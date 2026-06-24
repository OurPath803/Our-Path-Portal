/**
 * OurPath proprietary frameworks — single source of truth.
 * Used across Mentor Console, Client Portal, Practitioner Training, and Gift Series.
 *
 * Sections:
 *   AL_MASIR_PHASES      — The 6-phase developmental pathway (al-Masīr)
 *   OCS_DIMENSIONS       — OurPath Check-In Scale: 5 dimensions scored 1–5
 *   OCS_SCALE            — Score labels for OCS (1 = Absent … 5 = Integrated)
 *   MENTOR_STANCES       — Four mentor stances (Shāhid, Mirʾā, Dalīl, Rafīq)
 *   REFLECTION_DOMAINS   — Nine territories explored in sessions
 *   POSITION_MAP_DIMS    — Four dimensions of the Position Map tool
 *   PATHWAY_LEVELS       — Five levels of the Mentor Practitioner Pathway
 */

// ── al-Masīr: The Pathway (6 phases) ─────────────────────────────────────────
export const AL_MASIR_PHASES = [
  { id: 'orientation',   arabic: 'al-Tawajjuh',  label: 'Orientation'  },
  { id: 'excavation',    arabic: 'al-Kashf',     label: 'Excavation'   },
  { id: 'clarification', arabic: 'al-Wuḍūḥ',    label: 'Clarification' },
  { id: 'construction',  arabic: 'al-Bināʾ',     label: 'Construction' },
  { id: 'integration',   arabic: 'al-Takāmul',   label: 'Integration'  },
  { id: 'transmission',  arabic: 'al-Irsāl',     label: 'Transmission' },
]

// ── OCS: OurPath Check-In Scale (5 dimensions) ───────────────────────────────
// Each dimension scored 1–5 using OCS_SCALE below.
// Nine Reflection Domains are territories, not a scored scale — never conflate.
export const OCS_DIMENSIONS = [
  { id: 'clarity',      arabic: 'Wuḍūḥ',     label: 'Clarity'      },
  { id: 'agency',       arabic: 'Fāʿiliyya', label: 'Agency'       },
  { id: 'groundedness', arabic: 'Thubūt',    label: 'Groundedness' },
  { id: 'energy',       arabic: 'Himma',     label: 'Energy'       },
  { id: 'momentum',     arabic: 'Sīra',      label: 'Momentum'     },
]

export const OCS_SCALE = [
  { value: 1, label: 'Absent'             },
  { value: 2, label: 'Flickering'         },
  { value: 3, label: 'Present but fragile' },
  { value: 4, label: 'Stable'             },
  { value: 5, label: 'Integrated'         },
]

// ── Four Mentor Stances ───────────────────────────────────────────────────────
export const MENTOR_STANCES = [
  { id: 'shahid', arabic: 'Shāhid', label: 'Witness',   description: 'Hold space without interpretation'           },
  { id: 'miraa',  arabic: 'Mirʾā',  label: 'Mirror',    description: 'Reflect back with clarity'                   },
  { id: 'dalil',  arabic: 'Dalīl',  label: 'Guide',     description: 'Point direction in specific terrain'          },
  { id: 'rafiq',  arabic: 'Rafīq',  label: 'Companion', description: 'Walk alongside in the ongoing journey'        },
]

// ── Nine Reflection Domains ───────────────────────────────────────────────────
// These are territories for exploration in sessions, not a scoring instrument.
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

// ── Position Map dimensions ───────────────────────────────────────────────────
export const POSITION_MAP_DIMENSIONS = ['Clarity', 'Commitment', 'Capacity', 'Context']

// ── Five Mentor Practitioner Pathway Levels ───────────────────────────────────
export const PATHWAY_LEVELS = [
  { level: 1, id: 'asas',   arabic: 'Asās الأساس',      label: 'Foundation'    },
  { level: 2, id: 'taalum', arabic: 'Taʿallum التعلم',  label: 'Learning'      },
  { level: 3, id: 'tadbir', arabic: 'Tadbīr التدبير',   label: 'Practice'      },
  { level: 4, id: 'tamkin', arabic: 'Tamkīn التمكين',   label: 'Consolidation' },
  { level: 5, id: 'irshal', arabic: 'Irsāl الإرسال',    label: 'Transmission'  },
]

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
