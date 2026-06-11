import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import MarketingHeader from '../components/MarketingHeader'

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

  // Logged-out layout — standard marketing chrome
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
          <BlogList posts={posts} error={error} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
