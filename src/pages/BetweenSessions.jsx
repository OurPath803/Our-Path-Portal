import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

export default function BetweenSessions() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [mentorId, setMentorId] = useState(null)
  const [mentorName, setMentorName] = useState('Shakil')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const feedRef = useRef(null)

  useEffect(() => {
    if (!user || !profile) return
    loadMentorAndMessages()
  }, [user, profile])

  async function loadMentorAndMessages() {
    // Find mentor — either from profile.mentor_id or look for any mentor
    let mId = profile?.mentor_id

    if (!mId) {
      const { data: mentors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'mentor')
        .limit(1)
        .maybeSingle()
      if (mentors) { mId = mentors.id; setMentorName(mentors.full_name?.split(' ')[0] ?? 'Shakil') }
    } else {
      const { data: m } = await supabase.from('profiles').select('full_name').eq('id', mId).maybeSingle()
      if (m) setMentorName(m.full_name?.split(' ')[0] ?? 'Shakil')
    }

    setMentorId(mId)
    if (!mId) { setLoading(false); return }

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${mId}),and(sender_id.eq.${mId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data ?? [])
    setLoading(false)
    scrollToBottom()

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', mId)
      .eq('read', false)

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
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
    if (!text.trim() || !mentorId || sending) return
    setSending(true)
    const msg = {
      sender_id: user.id,
      receiver_id: mentorId,
      content: text.trim(),
    }
    const { data } = await supabase.from('messages').insert(msg).select().single()
    if (data) {
      setMessages(ms => [...ms, data])
      scrollToBottom()

      // Notify the receiver (5-minute throttle handled server-side).
      try {
        const { data: receiver } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', mentorId)
          .maybeSingle()
        if (receiver?.email) {
          fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_message',
              to: receiver.email,
              data: {
                senderName: profile?.full_name ?? 'Your mentee',
                snippet: msg.content,
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

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="msg-shell" style={{ flex: 1 }}>
          {/* Thread list */}
          <div className="thread-list">
            <div className="thread-list-header">
              <h3>Between sessions</h3>
              <div className="small muted" style={{ marginTop: 3, fontStyle: 'italic' }}>
                Replies within 48 hours · weekdays
              </div>
            </div>
            <div className="thread on">
              <div className="nm">{mentorName} · Mentor</div>
              <div className="snip">
                {lastMessage
                  ? lastMessage.content.slice(0, 80) + (lastMessage.content.length > 80 ? '…' : '')
                  : 'Start your first message.'}
              </div>
              {lastMessage && (
                <div className="ts">{formatTime(lastMessage.created_at)}</div>
              )}
            </div>
          </div>

          {/* Message area */}
          <div className="msg-body">
            <div className="msg-head">
              <div className="nm">{mentorName}</div>
              <div className="meta">Your mentor · usually replies within 48 hours on weekdays</div>
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
                    {m.content}
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
