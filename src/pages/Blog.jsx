import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import MarketingHeader from '../components/MarketingHeader'

// ── Portal reading room (logged-in view) ────────────────────────────────────

function PortalPostCard({ post, views }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', borderBottom: 'none', display: 'block' }}
    >
      <article style={{
        padding: '22px 24px',
        background: 'var(--off-white)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--gold)'
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(30,58,95,0.07)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--line)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 10, flexWrap: 'wrap',
        }}>
          {post.date && (
            <span style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {post.members_only && (
            <span style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'var(--gold)', color: 'var(--navy)',
              padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            }}>
              Members
            </span>
          )}
          {views > 0 && (
            <span style={{ fontSize: 11, color: 'var(--mute)', marginLeft: 'auto' }}>
              {views} {views === 1 ? 'read' : 'reads'}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2,
          color: 'var(--navy)', margin: '0 0 8px', fontWeight: 500,
        }}>
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{
            fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6,
            margin: 0,
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
                color: 'var(--mute)',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}

function PortalReadingRoom({ posts, error, viewCounts }) {
  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--gold)', fontWeight: 600, marginBottom: 8,
            }}>
              Reading room
            </div>
            <h1 style={{ margin: '0 0 8px' }}>Reflections</h1>
            <p style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 520 }}>
              Writing on growth, clarity, and the questions beneath a managed life.
              Members unlock additional practitioner essays.
            </p>
          </div>

          {/* Content */}
          {error && (
            <div style={{
              padding: '16px 20px', borderRadius: 8,
              background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)',
              color: 'var(--danger)', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {!posts && !error && (
            <div className="loading">Loading…</div>
          )}

          {posts?.length === 0 && (
            <p style={{ color: 'var(--mute)', fontStyle: 'italic' }}>No posts published yet.</p>
          )}

          {posts?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map(post => (
                <PortalPostCard
                  key={post.id}
                  post={post}
                  views={viewCounts[post.slug] ?? 0}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Public marketing view (logged-out) ───────────────────────────────────────

function PublicPostCard({ post }) {
  return (
    <li key={post.id}>
      <Link
        to={`/blog/${post.slug}`}
        style={{
          display: 'block',
          background: 'var(--off-white)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          padding: '1.75rem 2rem',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem',
        }}>
          <span style={{ fontSize: '.85rem', color: 'var(--ink-soft)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {post.date ? new Date(post.date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            }) : ''}
          </span>
          {post.members_only && (
            <span style={{
              fontSize: '.7rem', letterSpacing: '0.1em',
              background: 'var(--gold)', color: 'var(--navy)',
              padding: '0.2rem 0.55rem', borderRadius: 4, textTransform: 'uppercase',
              fontWeight: 600,
            }}>Members</span>
          )}
        </div>
        <h2 style={{ fontSize: '1.5rem', lineHeight: 1.25, margin: '0 0 0.5rem' }}>
          {post.title}
        </h2>
        {post.excerpt && (
          <p style={{ color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>{post.excerpt}</p>
        )}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: '.72rem', letterSpacing: '0.05em',
                color: 'var(--ink-soft)', textTransform: 'uppercase',
              }}>#{tag}</span>
            ))}
          </div>
        )}
      </Link>
    </li>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function Blog() {
  const { user } = useAuth()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)
  const [viewCounts, setViewCounts] = useState({})

  useEffect(() => {
    fetch('/.netlify/functions/blog')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setPosts(d.posts || []))
      .catch(err => {
        console.error('blog list error', err)
        setError('Could not load posts. Please try again in a moment.')
      })

    // Fetch all view counts — public read, no auth needed
    supabase
      .from('blog_views')
      .select('slug, views')
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { map[row.slug] = row.views })
        setViewCounts(map)
      })
  }, [])

  // Portal reading room for authenticated users
  if (user) {
    return (
      <PortalReadingRoom
        posts={posts}
        error={error}
        viewCounts={viewCounts}
      />
    )
  }

  // Public marketing layout for visitors
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <MarketingHeader />
      <section className="workshops-hero">
        <div className="eyebrow">Reflections</div>
        <h1>Writing on growth, clarity, and development.</h1>
        <p>The real questions beneath the surface of a managed life.</p>
        <Link to="/triage-call" className="btn btn-gold">Book a Free Conversation</Link>
      </section>
      <section className="mkt-section">
        <div className="section-inner" style={{ maxWidth: 840 }}>
          {error && <p style={{ color: 'var(--ink-soft)' }}>{error}</p>}
          {!posts && !error && <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>}
          {posts?.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No posts published yet.</p>}
          {posts?.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.75rem' }}>
              {posts.map(post => <PublicPostCard key={post.id} post={post} />)}
            </ul>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}
