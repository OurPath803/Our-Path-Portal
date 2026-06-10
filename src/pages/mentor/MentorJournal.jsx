import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const QUESTION_LABELS = {
  question_1_current_reality: '01 · Current Reality',
  question_2_pressure_cost:   '02 · Pressure & Cost',
  question_3_clarity_learning: '03 · Clarity & Learning',
  question_4_direction:       '04 · Direction',
  question_5_orientation:     '05 · Orientation',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function MentorJournal() {
  const { menteeId } = useParams()
  const { user } = useAuth()

  const [mentee, setMentee] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !menteeId) return
    load()
  }, [user, menteeId])

  async function load() {
    setLoading(true)
    setError('')

    const { data: m, error: mErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', menteeId)
      .maybeSingle()

    if (mErr || !m) {
      setError('Mentee not found, or you do not have access to this mentee.')
      setLoading(false)
      return
    }
    setMentee(m)

    // RLS policy "mentor reads shared journal via mentor_id" lets us read
    // shared_with_mentor = true entries for our assigned mentees.
    const { data: e } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('mentee_id', menteeId)
      .eq('shared_with_mentor', true)
      .order('created_at', { ascending: false })

    setEntries(e ?? [])
    setLoading(false)
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
            <div className="loading">Loading journal…</div>
          ) : error ? (
            <div className="auth-error">{error}</div>
          ) : (
            <>
              <div className="journal-head">
                <div className="eyebrow">Shared journal · {mentee?.full_name ?? mentee?.email}</div>
                <h1>What they've chosen to share</h1>
                <p className="pull">
                  Only entries marked "Share with Ustadh Shakil" are shown here. Their unshared entries
                  remain private to them.
                </p>
              </div>

              {entries.length === 0 ? (
                <div className="empty-state">
                  No shared entries yet. They'll appear here when {mentee?.full_name ?? 'your mentee'} shares one.
                </div>
              ) : (
                entries.map(entry => (
                  <div key={entry.id} className="card" style={{ marginBottom: 22 }}>
                    <div className="card-title">
                      <h3>{formatDate(entry.created_at)}</h3>
                      <span className="tag">
                        {entry.mode === 'freewrite' ? 'Freewrite' : 'Five questions'}
                      </span>
                    </div>

                    {entry.mode === 'freewrite' ? (
                      entry.freewrite_text ? (
                        <p style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: 16,
                          lineHeight: 1.7,
                          color: 'var(--ink-soft)',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {entry.freewrite_text}
                        </p>
                      ) : (
                        <p style={{ fontStyle: 'italic', color: 'var(--mute)' }}>
                          (Empty freewrite.)
                        </p>
                      )
                    ) : (
                      <div>
                        {Object.entries(QUESTION_LABELS).map(([col, label]) => {
                          const val = entry[col]
                          if (!val || !val.trim()) return null
                          return (
                            <div key={col} style={{ marginBottom: 18 }}>
                              <div style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: 12,
                                color: 'var(--gold)',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                marginBottom: 6,
                              }}>
                                {label}
                              </div>
                              <p style={{
                                fontSize: 15,
                                lineHeight: 1.65,
                                color: 'var(--ink-soft)',
                                whiteSpace: 'pre-wrap',
                                margin: 0,
                              }}>
                                {val}
                              </p>
                            </div>
                          )
                        })}

                        {!Object.keys(QUESTION_LABELS).some(col => entry[col]?.trim()) && (
                          <p style={{ fontStyle: 'italic', color: 'var(--mute)' }}>
                            (No questions answered in this entry.)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
