import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

// Between-session reflection prompts by theme.
// Mentor can point the mentee to a relevant theme in conversation.
const REFLECTION_PROMPTS = [
  { theme: 'Clarity', prompt: 'This week, notice where you say "I don\'t know" when you may actually mean "I do know — but I do not want to act on it yet." What is that place?' },
  { theme: 'Responsibility', prompt: 'Notice one place where you are waiting for clarity before acting. What small responsible action is already available to you?' },
  { theme: 'Avoidance', prompt: 'Write down three moments where you avoided something. What emotion appeared just before the avoidance?' },
  { theme: 'Alignment', prompt: 'Where did your actions match your values this week? Where did they drift?' },
  { theme: 'Faith', prompt: 'Where did you remember Allah in your decision-making this week, and where did you leave Him out?' },
  { theme: 'Direction', prompt: 'What gave you a sense of direction this week, even briefly? What was present in that moment that is absent at other times?' },
  { theme: 'Pressure', prompt: 'Notice where you acted from fear of people\'s expectations. What would have looked different if you had acted from your own convictions?' },
]

function ReflectionPromptsPanel() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div style={{
      borderBottom: '1px solid var(--line)',
      background: 'var(--cream)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', padding: '12px 18px',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
          Reflection Prompts
        </span>
        <span style={{ fontSize: 12, color: 'var(--mute)' }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {REFLECTION_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelected(selected === i ? null : i)}
                style={{
                  padding: '5px 10px', fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  background: selected === i ? 'var(--navy)' : 'var(--off-white)',
                  color: selected === i ? 'var(--cream)' : 'var(--ink-soft)',
                  border: `1px solid ${selected === i ? 'var(--navy)' : 'var(--line)'}`,
                  borderRadius: 3, cursor: 'pointer',
                }}
              >
                {p.theme}
              </button>
            ))}
          </div>
          {selected !== null && (
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 14, color: 'var(--navy)', lineHeight: 1.65,
              margin: 0, padding: '12px 14px',
              background: 'var(--off-white)', borderLeft: '2px solid var(--gold)',
            }}>
              {REFLECTION_PROMPTS[selected].prompt}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function BetweenSessions() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [counterpartId, setCounterpartId] = useState(null)
  const [counterpartName, setCounterpartName] = useState('Ustadh Shakil')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [attachFile, setAttachFile] = useState(null)  // File | null
  const [uploadErr, setUploadErr] = useState('')
  const feedRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user || !profile) return
    loadCounterpartAndMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile])

  async function loadCounterpartAndMessages() {
    // The counterpart depends on role:
    //   • mentee  → their assigned mentor (profiles.mentor_id)
    //   • mentor  → if a `with` query param is present, that mentee; otherwise
    //               the most-recent mentee they have an assignment with.
    let counterpart = null

    const isStaff = profile?.role === 'mentor' || profile?.role === 'admin'
    if (isStaff) {
      const params = new URLSearchParams(window.location.search)
      const withId = params.get('with')
      if (withId) {
        const { data } = await supabase
          .from('profiles').select('id, full_name')
          .eq('id', withId).maybeSingle()
        counterpart = data
      }
      if (!counterpart) {
        // Admins fall back to most-recent mentee in the system; mentors get
        // their own assigned mentee.
        const query = supabase
          .from('profiles').select('id, full_name')
          .eq('role', 'mentee')
          .order('created_at', { ascending: false }).limit(1)
        if (profile?.role === 'mentor') query.eq('mentor_id', user.id)
        const { data } = await query.maybeSingle()
        counterpart = data
      }
    } else {
      // Mentee branch
      let mId = profile?.mentor_id
      if (!mId) {
        const { data } = await supabase
          .from('profiles').select('id, full_name')
          .eq('role', 'mentor').order('created_at', { ascending: false })
          .limit(1).maybeSingle()
        counterpart = data
      } else {
        const { data } = await supabase
          .from('profiles').select('id, full_name')
          .eq('id', mId).maybeSingle()
        counterpart = data
      }
    }

    if (!counterpart) {
      setLoading(false)
      return
    }

    setCounterpartId(counterpart.id)
    // Display name: keep the title prefix for honorifics so "Ustadh Shakil
    // Moazzem" reads as "Ustadh Shakil" rather than just "Ustadh".
    const parts = (counterpart.full_name ?? '').split(' ').filter(Boolean)
    const TITLES = ['Ustadh', 'Shaykh', 'Shaikh', 'Sheikh', 'Imam', 'Dr', 'Mr', 'Mrs', 'Ms', 'Mx']
    const display = parts.length === 0
      ? (profile?.role === 'mentor' || profile?.role === 'admin' ? 'Mentee' : 'Ustadh Shakil')
      : (TITLES.includes(parts[0]) && parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0])
    setCounterpartName(display)

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${counterpart.id}),and(sender_id.eq.${counterpart.id},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data ?? [])
    setLoading(false)
    scrollToBottom()

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .eq('sender_id', counterpart.id)
      .is('read_at', null)

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        setMessages(ms => [...ms, payload.new])
        scrollToBottom()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
    }, 50)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('File too large — maximum 10 MB.')
      return
    }
    setUploadErr('')
    setAttachFile(file)
    // Reset input so the same file can be reselected if removed
    e.target.value = ''
  }

  async function send() {
    if ((!text.trim() && !attachFile) || !counterpartId || sending) return
    setSending(true)
    setUploadErr('')

    let attachment_url = null
    let attachment_name = null

    // Upload attachment to Supabase Storage if present
    if (attachFile) {
      const ext = attachFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('message-attachments')
        .upload(path, attachFile, { cacheControl: '3600', upsert: false })
      if (upErr) {
        setUploadErr(`Upload failed: ${upErr.message}`)
        setSending(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(path)
      attachment_url  = publicUrl
      attachment_name = attachFile.name
      setAttachFile(null)
    }

    const msg = {
      sender_id:   user.id,
      recipient_id: counterpartId,
      body:        text.trim() || '',
      ...(attachment_url && { attachment_url, attachment_name }),
    }
    const { data } = await supabase.from('messages').insert(msg).select().single()
    if (data) {
      setMessages(ms => [...ms, data])
      scrollToBottom()

      // Notify the recipient (5-minute throttle handled server-side).
      try {
        const { data: receiver } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', counterpartId)
          .maybeSingle()
        if (receiver?.email) {
          const snippet = msg.body || (attachment_name ? `📎 ${attachment_name}` : '')
          fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_message',
              to: receiver.email,
              data: {
                senderName: profile?.full_name ?? 'Someone',
                snippet,
              },
            }),
          }).catch(() => {})
        }
      } catch (_) { /* best effort */ }
    }
    setText('')
    setSending(false)
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return `Today · ${time}`
    if (diffDays === 1) return `Yesterday · ${time}`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ` · ${time}`
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const lastMessage = messages.length ? messages[messages.length - 1] : null
  const isMentor = profile?.role === 'mentor' || profile?.role === 'admin'

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ReflectionPromptsPanel />
        <div className="msg-shell" style={{ flex: 1 }}>
          <div className="thread-list">
            <div className="thread-list-header">
              <h3>Between sessions</h3>
              <div className="small muted" style={{ marginTop: 3, fontStyle: 'italic' }}>
                Replies within 48 hours · weekdays
              </div>
            </div>
            <div className="thread on">
              <div className="nm">{counterpartName} · {isMentor ? 'Mentee' : 'Mentor'}</div>
              <div className="snip">
                {lastMessage
                  ? (lastMessage.body
                      ? lastMessage.body.slice(0, 80) + (lastMessage.body.length > 80 ? '…' : '')
                      : lastMessage.attachment_name ? `📎 ${lastMessage.attachment_name}` : '')
                  : 'Start your first message.'}
              </div>
              {lastMessage && (
                <div className="ts">{formatTime(lastMessage.created_at)}</div>
              )}
            </div>
          </div>

          <div className="msg-body">
            <div className="msg-head">
              <div className="nm">{counterpartName}</div>
              <div className="meta">
                {isMentor
                  ? 'Your mentee · weekday replies'
                  : 'Your mentor · usually replies within 48 hours on weekdays'}
              </div>
            </div>

            <div className="msg-feed" ref={feedRef}>
              {loading ? (
                <div className="loading">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="empty-state">
                  No messages yet. Send something — no pressure for polish. A few lines is enough.
                </div>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={'bubble ' + (m.sender_id === user.id ? 'u' : 'm')}
                  >
                    {m.body && <div>{m.body}</div>}
                    {m.attachment_url && (
                      <a
                        href={m.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          marginTop: m.body ? 8 : 0,
                          fontSize: 13, textDecoration: 'none',
                          color: m.sender_id === user.id ? 'rgba(250,250,248,0.9)' : 'var(--navy)',
                          background: m.sender_id === user.id ? 'rgba(0,0,0,0.15)' : 'var(--cream-deep)',
                          padding: '6px 10px', borderRadius: 4,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span style={{ textDecoration: 'underline' }}>{m.attachment_name || 'Attachment'}</span>
                      </a>
                    )}
                    <div className="t">{formatTime(m.created_at)}</div>
                  </div>
                ))
              )}
            </div>

            {/* File attachment preview + error */}
            {(attachFile || uploadErr) && (
              <div style={{
                padding: '6px 14px',
                background: uploadErr ? 'rgba(192,57,43,0.07)' : 'var(--cream-deep)',
                borderTop: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              }}>
                {uploadErr ? (
                  <span style={{ color: 'var(--error)' }}>{uploadErr}</span>
                ) : (
                  <>
                    <span style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                      {attachFile.name}
                    </span>
                    <button
                      onClick={() => { setAttachFile(null); setUploadErr('') }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--mute)', fontSize: 16, lineHeight: 1, padding: 0,
                      }}
                      title="Remove attachment"
                    >×</button>
                  </>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
            />

            <div className="msg-input">
              {/* Paperclip button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 8px', alignSelf: 'center', flexShrink: 0, lineHeight: 1,
                  color: 'var(--mute)', display: 'flex', alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="No pressure for polish. A few lines is enough."
                rows={1}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'stretch' }}
                onClick={send}
                disabled={sending || (!text.trim() && !attachFile)}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
