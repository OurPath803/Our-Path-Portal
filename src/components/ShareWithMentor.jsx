// Reusable "Share with mentor" panel — used at the bottom of every tool page.
// Props:
//   onShare    — function that collects current state and calls useToolSave.save()
//   saving     — boolean from useToolSave
//   saved      — boolean from useToolSave (shows ✓ briefly after save)
//   error      — string from useToolSave
//   lastShared — ISO timestamp of most recent submission (null if never shared)
//   hasContent — boolean: is there anything worth sharing yet?
export default function ShareWithMentor({ onShare, saving, saved, error, lastShared, hasContent }) {
  function fmt(ts) {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div style={{
      maxWidth: 640, marginTop: 32,
      padding: '20px 24px',
      background: 'var(--navy)', borderRadius: 4,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 16,
            color: 'var(--gold)', marginBottom: 4,
          }}>
            Share with your mentor
          </div>
          <div style={{ fontSize: 13, color: 'rgba(245,238,217,0.65)' }}>
            {lastShared
              ? `Last shared ${fmt(lastShared)} · Share again to update`
              : 'Your responses will be visible to Ustadh Shakil before your next session.'}
          </div>
          {error && (
            <div style={{ fontSize: 13, color: '#e74c3c', marginTop: 6 }}>{error}</div>
          )}
        </div>
        <button
          onClick={onShare}
          disabled={saving || !hasContent}
          className="btn btn-gold btn-sm"
          style={{ flexShrink: 0 }}
        >
          {saving ? 'Sharing…' : saved ? '✓ Shared' : lastShared ? 'Share again' : 'Share with mentor'}
        </button>
      </div>
    </div>
  )
}
