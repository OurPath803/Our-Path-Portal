import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'notfound' | 'error'

  useEffect(() => {
    setStatus('loading')
    fetch(`/.netlify/functions/blog?slug=${encodeURIComponent(slug)}`)
      .then(r => {
        if (r.status === 404) { setStatus('notfound'); return null }
        if (!r.ok) throw new Error('Fetch failed')
        return r.json()
      })
      .then(data => {
        if (!data) return
        setPost(data)
        setStatus('ready')
      })
      .catch(err => {
        console.error('blog post error', err)
        setStatus('error')
      })
  }, [slug])

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <header className="mkt-header">
        <div className="mkt-logo">OurPath<span> Guidance</span></div>
        <nav className="mkt-nav">
          <Link to="/" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Home</Link>
          <Link to="/blog" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Blog</Link>
          <Link to="/rhythms" style={{ borderBottom: 'none', color: 'var(--ink-soft)' }}>Rhythms</Link>
        </nav>
        <div className="mkt-cta-set">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/triage-call" className="btn btn-primary btn-sm">Book a triage call</Link>
        </div>
      </header>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/blog" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '.9rem' }}>
            ← All reflections
          </Link>
        </div>

        {status === 'loading' && <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>}
        {status === 'notfound' && (
          <div>
            <h1>Not found</h1>
            <p style={{ color: 'var(--ink-soft)' }}>
              That post doesn't exist (or hasn't been published yet).
            </p>
          </div>
        )}
        {status === 'error' && (
          <p style={{ color: 'var(--ink-soft)' }}>Couldn't load this post. Please try again in a moment.</p>
        )}

        {status === 'ready' && post && (
          <>
            <div style={{
              fontSize: '.8rem', color: 'var(--ink-soft)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '0.75rem',
            }}>
              {post.date && new Date(post.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
              {post.members_only && (
                <span style={{
                  marginLeft: '0.75rem', background: 'var(--gold, #C4993C)',
                  color: '#fff', padding: '0.2rem 0.55rem', borderRadius: 4,
                }}>Members only</span>
              )}
            </div>
            <h1 style={{ fontSize: '2.25rem', lineHeight: 1.15, margin: '0 0 1rem' }}>{post.title}</h1>
            {post.author && (
              <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: '2.5rem' }}>
                By {post.author}
              </p>
            )}
            {post.cover && (
              <img
                src={post.cover}
                alt=""
                style={{ width: '100%', borderRadius: 8, marginBottom: '2rem' }}
              />
            )}
            <div
              className="post-body"
              style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--ink, #1A2F36)' }}
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <hr style={{ margin: '3rem 0 2rem', border: 0, borderTop: '1px solid var(--rule, rgba(0,0,0,0.08))' }} />
            <div style={{ textAlign: 'center' }}>
              <Link to="/triage-call" className="btn btn-primary">Book a triage call</Link>
            </div>
          </>
        )}
      </article>

      <Footer />
    </div>
  )
}
