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
