import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

export default function BetweenSessions() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [counterpartId, setCounterpartId] = useState(null)
  const [counterpartName, setCounterpartName] = useState('Shakil')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const feedRef = useRef(null)

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
    setCounterpartName(counterpart.full_name?.split(' ')[0] ?? (profile?.role === 'mentor' ? 'Mentee' : 'Shakil'))

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

  async function send() {
    if (!text.trim() || !counterpartId || sending) return
    setSending(true)
    const msg = {
      sender_id: user.id,
      recipient_id: counterpartId,
      body: text.trim(),
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
          fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_message',
              to: receiver.email,
              data: {
                senderName: profile?.full_name ?? 'Someone',
                snippet: msg.body,
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
                  ? lastMessage.body.slice(0, 80) + (lastMessage.body.length > 80 ? '…' : '')
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
                    {m.body}
                    <div className="t">{formatTime(m.created_at)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="msg-input">
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
                disabled={sending || !text.trim()}
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
