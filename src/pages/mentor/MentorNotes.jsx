/**
 * MentorNotes — full session recording form.
 *
 * Three panels:
 *   1. Framework — al-Masīr phase, mentor stance, OCS scores, domains explored
 *   2. Session content — notes, what moved, next session intention
 *   3. Commitments — what the mentee named they would do
 *
 * Framework fields (phase, stance, OCS, domains) save to the `sessions` table.
 * Session content saves to `session_notes` table.
 * Commitments save to `commitments` table.
 *
 * MentorRoute required.
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import {
  AL_MASIR_PHASES,
  MENTOR_STANCES,
  OCS_DIMENSIONS,
  REFLECTION_DOMAINS,
} from '../../lib/constants/frameworks'

const EMPTY_NOTE = {
  ground_covered: '',
  what_was_named: '',
  to_sit_with: '',
}

const EMPTY_FRAMEWORK = {
  phase: '',
  mentor_stance: '',
  ocs_clarity: 0,
  ocs_agency: 0,
  ocs_groundedness: 0,
  ocs_energy: 0,
  ocs_momentum: 0,
  domains_explored: [],
  what_moved: '',
}

const OCS_KEY_MAP = {
  clarity:      'ocs_clarity',
  agency:       'ocs_agency',
  groundedness: 'ocs_groundedness',
  energy:       'ocs_energy',
  momentum:     'ocs_momentum',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', margin: 0 }}>
        {title}
      </h3>
    </div>
  )
}

// ── Selector row (phase / stance) ─────────────────────────────────────────────
function SelectorRow({ options, value, onChange, labelKey = 'label', subKey = null }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(value === o.id ? '' : o.id)}
          style={{
            padding: '8px 14px',
            fontFamily: 'var(--font-body)', fontSize: 13,
            border: `1px solid ${value === o.id ? 'var(--navy)' : 'var(--line)'}`,
            borderRadius: 4,
            background: value === o.id ? 'var(--navy)' : 'var(--off-white)',
            color: value === o.id ? 'var(--cream)' : 'var(--charcoal)',
            cursor: 'pointer', transition: 'all 0.12s',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
          }}
        >
          <span style={{ fontWeight: value === o.id ? 600 : 400 }}>{o[labelKey]}</span>
          {subKey && (
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-display)', fontStyle: 'italic',
              color: value === o.id ? 'rgba(245,238,217,0.7)' : 'var(--mute)',
            }}>
              {o[subKey]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── OCS scorer for one dimension ──────────────────────────────────────────────
function OCSRow({ dim, value, onChange }) {
  const OCS_LABELS = { 1: 'Absent', 2: 'Flickering', 3: 'Present but fragile', 4: 'Stable', 5: 'Integrated' }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>
          {dim.label} <span style={{ fontSize: 11, color: 'var(--mute)', fontStyle: 'italic' }}>{dim.arabic}</span>
        </span>
        {value > 0 && (
          <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em' }}>
            {OCS_LABELS[value]}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => onChange(value === v ? 0 : v)}
            style={{
              flex: 1, padding: '7px 4px', fontSize: 14,
              border: `1px solid ${value === v ? 'var(--navy)' : 'var(--line)'}`,
              borderRadius: 4,
              background: value === v ? 'var(--navy)' : 'var(--cream)',
              color: value === v ? 'var(--cream)' : 'var(--charcoal)',
              fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MentorNotes() {
  const { menteeId } = useParams()
  const { user } = useAuth()

  const [mentee, setMentee] = useState(null)
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [noteRowId, setNoteRowId] = useState(null)
  const [note, setNote] = useState(EMPTY_NOTE)
  const [framework, setFramework] = useState(EMPTY_FRAMEWORK)
  const [commitments, setCommitments] = useState([])
  const [newCommitment, setNewCommitment] = useState('')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [commitError, setCommitError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !menteeId) return
    loadMenteeAndSessions()
  }, [user, menteeId])

  useEffect(() => {
    if (selectedSessionId) loadNoteAndCommitments(selectedSessionId)
  }, [selectedSessionId])

  async function loadMenteeAndSessions() {
    setLoading(true)
    setError('')

    const { data: m, error: mErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', menteeId)
      .maybeSingle()

    if (mErr || !m) { setError('Mentee not found.'); setLoading(false); return }
    setMentee(m)

    const { data: s } = await supabase
      .from('sessions')
      .select('id, scheduled_at, mode, status, phase, mentor_stance, ocs_clarity, ocs_agency, ocs_groundedness, ocs_energy, ocs_momentum, domains_explored, what_moved')
      .eq('mentee_id', menteeId)
      .order('scheduled_at', { ascending: false })

    setSessions(s ?? [])
    if (s && s.length > 0) setSelectedSessionId(s[0].id)
    setLoading(false)
  }

  async function loadNoteAndCommitments(sessionId) {
    // Load framework data from the session row itself
    const sessionRow = sessions.find(s => s.id === sessionId)
    if (sessionRow) {
      setFramework({
        phase:            sessionRow.phase ?? '',
        mentor_stance:    sessionRow.mentor_stance ?? '',
        ocs_clarity:      sessionRow.ocs_clarity ?? 0,
        ocs_agency:       sessionRow.ocs_agency ?? 0,
        ocs_groundedness: sessionRow.ocs_groundedness ?? 0,
        ocs_energy:       sessionRow.ocs_energy ?? 0,
        ocs_momentum:     sessionRow.ocs_momentum ?? 0,
        domains_explored: sessionRow.domains_explored ?? [],
        what_moved:       sessionRow.what_moved ?? '',
      })
    } else {
      setFramework(EMPTY_FRAMEWORK)
    }

    // Load narrative note from session_notes
    const { data: existing } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existing) {
      setNoteRowId(existing.id)
      setNote({
        ground_covered: existing.ground_covered ?? '',
        what_was_named: existing.what_was_named ?? '',
        to_sit_with:    existing.to_sit_with ?? '',
      })
    } else {
      setNoteRowId(null)
      setNote(EMPTY_NOTE)
    }

    const { data: c } = await supabase
      .from('commitments')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    setCommitments(c ?? [])
  }

  function updateNote(key, val) { setNote(n => ({ ...n, [key]: val })) }

  function setPhase(val) { setFramework(f => ({ ...f, phase: val })) }
  function setStance(val) { setFramework(f => ({ ...f, mentor_stance: val })) }
  function setOCS(dimId, val) {
    const key = OCS_KEY_MAP[dimId]
    setFramework(f => ({ ...f, [key]: val }))
  }
  function toggleDomain(domain) {
    setFramework(f => {
      const current = f.domains_explored ?? []
      return {
        ...f,
        domains_explored: current.includes(domain)
          ? current.filter(d => d !== domain)
          : [...current, domain],
      }
    })
  }

  async function saveAll() {
    if (!selectedSessionId) return
    setSaving(true)
    setSaveError('')

    // Save framework to sessions table
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
    }
    const { error: sesErr } = await supabase
      .from('sessions')
      .update(frameworkPayload)
      .eq('id', selectedSessionId)

    if (sesErr) {
      setSaveError(`Framework save failed: ${sesErr.message}`)
      setSaving(false)
      return
    }

    // Save narrative to session_notes
    const notePayload = {
      session_id:     selectedSessionId,
      ground_covered: note.ground_covered || null,
      what_was_named: note.what_was_named || null,
      to_sit_with:    note.to_sit_with || null,
    }
    let noteResult
    if (noteRowId) {
      noteResult = await supabase.from('session_notes').update(notePayload).eq('id', noteRowId).select().single()
    } else {
      noteResult = await supabase.from('session_notes').insert(notePayload).select().single()
      if (noteResult.data) setNoteRowId(noteResult.data.id)
    }

    setSaving(false)
    if (noteResult.error) {
      setSaveError(`Notes save failed: ${noteResult.error.message}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function addCommitment() {
    if (!newCommitment.trim() || !selectedSessionId) return
    setCommitError('')
    const { data, error } = await supabase.from('commitments').insert({
      mentee_id: menteeId,
      session_id: selectedSessionId,
      text: newCommitment.trim(),
    }).select().single()
    if (error) { setCommitError(`Add failed: ${error.message}`); return }
    if (!data) { setCommitError('Insert returned no data — likely an RLS block.'); return }
    setCommitments(cs => [...cs, data])
    setNewCommitment('')
  }

  async function removeCommitment(id) {
    const { error } = await supabase.from('commitments').delete().eq('id', id)
    if (error) { setCommitError(`Delete failed: ${error.message}`); return }
    setCommitments(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div style={{ marginBottom: 12 }}>
            <Link to="/mentor" style={{ fontSize: 13 }}>← All mentees</Link>
          </div>

          {loading ? (
            <div className="loading">Loading…</div>
          ) : error ? (
            <div className="auth-error">{error}</div>
          ) : (
            <>
              <div className="journal-head">
                <div className="eyebrow">Session Recording · {mentee?.full_name ?? mentee?.email}</div>
                <h1>Record session</h1>
                <p className="pull">
                  Framework first, then narrative, then commitments.
                </p>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state">No sessions yet. Notes will appear once a session is booked.</div>
              ) : (
                <>
                  {/* Session selector */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                    {sessions.map(s => (
                      <button
                        key={s.id}
                        className={'btn btn-sm ' + (selectedSessionId === s.id ? 'btn-primary' : 'btn-ghost')}
                        onClick={() => setSelectedSessionId(s.id)}
                      >
                        {formatDate(s.scheduled_at)}
                      </button>
                    ))}
                  </div>

                  {/* ── Panel 1: Framework ── */}
                  <div className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
                    <SectionHead eyebrow="al-Masīr Framework" title="Session framework" />

                    {/* Phase */}
                    <div style={{ marginBottom: 24 }}>
                      <div className="form-row" style={{ marginBottom: 10 }}>
                        <label>Phase — al-Masīr</label>
                      </div>
                      <SelectorRow
                        options={AL_MASIR_PHASES}
                        value={framework.phase}
                        onChange={setPhase}
                        labelKey="label"
                        subKey="arabic"
                      />
                    </div>

                    {/* Mentor stance */}
                    <div style={{ marginBottom: 24 }}>
                      <div className="form-row" style={{ marginBottom: 10 }}>
                        <label>Mentor stance</label>
                      </div>
                      <SelectorRow
                        options={MENTOR_STANCES}
                        value={framework.mentor_stance}
                        onChange={setStance}
                        labelKey="label"
                        subKey="description"
                      />
                    </div>

                    {/* OCS scores */}
                    <div style={{ marginBottom: 24 }}>
                      <div className="form-row" style={{ marginBottom: 14 }}>
                        <label>OCS Check-In — client scores (1 = Absent · 5 = Integrated)</label>
                      </div>
                      {OCS_DIMENSIONS.map(dim => (
                        <OCSRow
                          key={dim.id}
                          dim={dim}
                          value={framework[OCS_KEY_MAP[dim.id]]}
                          onChange={val => setOCS(dim.id, val)}
                        />
                      ))}
                    </div>

                    {/* Nine Reflection Domains */}
                    <div>
                      <div className="form-row" style={{ marginBottom: 12 }}>
                        <label>Domains explored in this session</label>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {REFLECTION_DOMAINS.map(domain => {
                          const selected = (framework.domains_explored ?? []).includes(domain)
                          return (
                            <button
                              key={domain}
                              onClick={() => toggleDomain(domain)}
                              style={{
                                padding: '6px 12px', fontSize: 13,
                                fontFamily: 'var(--font-body)',
                                border: `1px solid ${selected ? 'var(--gold)' : 'var(--line)'}`,
                                borderRadius: 3,
                                background: selected ? 'rgba(201,168,76,0.12)' : 'var(--off-white)',
                                color: selected ? 'var(--navy)' : 'var(--ink-soft)',
                                cursor: 'pointer', transition: 'all 0.12s',
                                fontWeight: selected ? 500 : 400,
                              }}
                            >
                              {domain}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Panel 2: Session content ── */}
                  <div className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
                    <SectionHead eyebrow="Session Content" title="Notes" />

                    <div className="form-row">
                      <label>Ground covered</label>
                      <textarea
                        style={{ minHeight: 100 }}
                        value={note.ground_covered}
                        onChange={e => updateNote('ground_covered', e.target.value)}
                        placeholder="What did this session actually cover?"
                      />
                    </div>

                    <div className="form-row">
                      <label>What was named</label>
                      <textarea
                        style={{ minHeight: 90 }}
                        value={note.what_was_named}
                        onChange={e => updateNote('what_was_named', e.target.value)}
                        placeholder="What the mentee articulated — one per line."
                      />
                      <div className="hint">Each new line becomes its own bullet for the mentee.</div>
                    </div>

                    <div className="form-row">
                      <label>What moved</label>
                      <textarea
                        style={{ minHeight: 80 }}
                        value={framework.what_moved}
                        onChange={e => setFramework(f => ({ ...f, what_moved: e.target.value }))}
                        placeholder="Not what was said — what shifted. Energy, posture, recognition."
                      />
                    </div>

                    <div className="form-row">
                      <label>Next session intention</label>
                      <textarea
                        style={{ minHeight: 70 }}
                        value={note.to_sit_with}
                        onChange={e => updateNote('to_sit_with', e.target.value)}
                        placeholder="A question to carry, or a direction for the next session."
                      />
                    </div>

                    {saveError && <div className="auth-error">{saveError}</div>}

                    <button
                      className="btn btn-primary"
                      onClick={saveAll}
                      disabled={saving}
                      style={{ marginTop: 8 }}
                    >
                      {saving ? 'Saving…' : saved ? '✓ Saved' : (noteRowId ? 'Update record' : 'Save record')}
                    </button>
                  </div>

                  {/* ── Panel 3: Commitments ── */}
                  <div className="card" style={{ padding: '28px 32px' }}>
                    <SectionHead eyebrow="Commitments" title="What the mentee named they would do" />

                    {commitments.length === 0 ? (
                      <p style={{ fontSize: 14, color: 'var(--mute)', fontStyle: 'italic', marginBottom: 14 }}>
                        No commitments yet for this session.
                      </p>
                    ) : (
                      commitments.map(c => (
                        <div key={c.id} className={'commit' + (c.completed ? ' done' : '')}>
                          <div className="check" />
                          <div className="t">{c.text}</div>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginLeft: 8, fontSize: 11, padding: '4px 8px' }}
                            onClick={() => removeCommitment(c.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}

                    <div className="form-row" style={{ marginTop: 16 }}>
                      <label>Add a commitment</label>
                      <input
                        type="text"
                        value={newCommitment}
                        onChange={e => setNewCommitment(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCommitment() } }}
                        placeholder="What did they say they'd do?"
                      />
                    </div>
                    {commitError && <div className="auth-error">{commitError}</div>}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={addCommitment}
                      disabled={!newCommitment.trim()}
                    >
                      Add commitment
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
