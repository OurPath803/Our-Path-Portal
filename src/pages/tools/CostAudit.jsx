/**
 * Cost Audit — name and assess the real cost of what you carry
 * Gated tool: ProtectedRoute required.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ShareWithMentor from '../../components/ShareWithMentor'
import { useToolSave } from '../../lib/useToolSave'

const COST_CATEGORIES = [
  { id: 'time',   label: 'Time',   description: 'How many hours per week does this take?' },
  { id: 'energy', label: 'Energy', description: 'Does this drain or restore you?' },
  { id: 'focus',  label: 'Focus',  description: "How much mental bandwidth does this hold even when you're not doing it?" },
  { id: 'joy',    label: 'Joy',    description: 'Does engaging with this feel purposeful, neutral, or heavy?' },
  { id: 'choice', label: 'Choice', description: 'Did you choose this, or did it accumulate?' },
]

const INITIAL_ITEM = { name: '', time: '', energy: '', focus: '', joy: '', choice: '' }

export default function CostAudit() {
  const { save, saving, saved, error, lastShared } = useToolSave('cost-audit')
  const [items, setItems] = useState([{ ...INITIAL_ITEM, id: 1 }])
  const [nextId, setNextId] = useState(2)

  function addItem() {
    setItems(prev => [...prev, { ...INITIAL_ITEM, id: nextId }])
    setNextId(n => n + 1)
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  return (
    <div className="portal-shell">
      <Sidebar />
      <div className="main-area">
        <div className="main-pad">
          <div className="journal-head">
            <div className="eyebrow">Cost Audit · Tool</div>
            <h1>Name the cost of what you carry.</h1>
            <p className="pull">
              List everything you&apos;re currently committed to — roles, responsibilities, relationships,
              obligations. Then name the real cost of each one honestly.
            </p>
          </div>

          {/* Reference: what to audit */}
          <div className="card" style={{ maxWidth: 680, marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              What to include
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {[
                'Work responsibilities',
                'Family roles',
                'Community commitments',
                'Religious obligations',
                'Personal projects',
                'Relationships you maintain',
                'Things you feel you should do',
                'Ongoing situations requiring your attention',
              ].map(t => (
                <div key={t} style={{ background: 'var(--off-white)', borderRadius: 4, padding: '8px 12px', fontSize: 13, color: 'var(--charcoal)' }}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Audit items */}
          <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, idx) => (
              <div key={item.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Item {String(idx + 1).padStart(2, '0')}
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer', fontSize: 18, padding: 0 }}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">What is it?</label>
                  <input
                    className="form-input"
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Name this commitment or role"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {COST_CATEGORIES.map(cat => (
                    <div key={cat.id} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{cat.label}</label>
                      <input
                        className="form-input"
                        type="text"
                        value={item[cat.id]}
                        onChange={e => updateItem(item.id, cat.id, e.target.value)}
                        placeholder={cat.description}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              style={{
                background: 'none',
                border: '1px dashed var(--gold)',
                color: 'var(--gold)',
                borderRadius: 6,
                padding: '14px',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              + Add another item
            </button>
          </div>

          <div className="card" style={{ maxWidth: 680, marginTop: 28, background: 'var(--off-white)' }}>
            <p style={{ fontSize: 14, color: 'var(--charcoal)', margin: 0, lineHeight: 1.7 }}>
              <strong>Next step:</strong> After completing your audit, bring it to your next session.
              Together you&apos;ll identify what to release, renegotiate, or recommit to.
            </p>
          </div>

          <ShareWithMentor
            onShare={() => save({ items })}
            saving={saving} saved={saved} error={error} lastShared={lastShared}
            hasContent={items.some(i => i.name.trim())}
          />

          <div style={{ marginTop: 20 }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
