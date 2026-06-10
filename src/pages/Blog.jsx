import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

// CTA target for all new-visitor links throughout the blog
const PROFILE_URL = '/triage-call'

function BlogList({ posts, error }) {
  return (
    <>
      {error && <p style={{ color: 'var(--ink-soft)' }}>{error}</p>}
      {!posts && !error && <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>}
      {posts && posts.length === 0 && (
        <p style={{ color: 'var(--ink-soft)' }}>No posts published yet.</p>
      )}
      {posts && posts.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.75rem' }}>
          {posts.map(post => (
            <li key={post.id}>
              <Link
                to={`/blog/${post.slug}`}
                style={{
                  display: 'block',
                  background: 'var(--surface, #fff)',
                  border: '1px solid var(--rule, rgba(0,0,0,0.08))',
                  borderRadius: 12,
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
                      background: 'var(--gold, #C9A84C)', color: '#fff',
                      padding: '0.2rem 0.55rem', borderRadius: 4, textTransform: 'uppercase',
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
          ))}
        </ul>
      )}
    </>
  )
}

export default function Blog() {
  const { user } = useAuth()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/.netlify/functions/blog')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setPosts(d.posts || []))
      .catch(err => {
        console.error('blog list error', err)
        setError('Could not load posts. Please try again in a moment.')
      })
  }, [])

  // Logged-in layout — sits inside the portal shell with the sidebar
  if (user) {
    return (
      <div className="portal-shell">
        <Sidebar />
        <div className="main-area">
          <div className="main-pad">
            <div className="topline">
              <div className="hello">
                <div className="date">Reflections</div>
                <h1>Reading room</h1>
                <div className="greet-line">
                  Writing on growth, clarity, and development. Members see additional practitioner essays.
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <BlogList posts={posts} error={error} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged-out layout — public marketing chrome with a "create profile" CTA
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <header className="mkt-header">
        <div className="mkt-logo">OurPath<span> Guidance</span></div>
        <nav className="mkt-nav">
          <Link to="/" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Home</Link>
          <Link to="/blog" style={{ borderBottom: 'none', color: 'var(--ink)' }}>Blog</Link>
          <Link to="/rhythms" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Rhythms</Link>
        </nav>
        <div className="mkt-cta-set">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to={PROFILE_URL} className="btn btn-primary btn-sm">Create your profile</Link>
        </div>
      </header>

      <div className="hero" style={{ paddingBottom: '2rem' }}>
        <div className="eyebrow">Reflections</div>
        <h1>Writing on growth, clarity, and development.</h1>
        <p className="lede">
          The real questions beneath the surface of a managed life.
        </p>
      </div>

      <section style={{ padding: '2rem 0 5rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem' }}>
          <BlogList posts={posts} error={error} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
