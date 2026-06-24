/**
 * ToolsPalette — session tools panel for MentorNotes.
 *
 * Renders a 2-column grid of all 15 OurPath tools. Clicking a tool toggles
 * it open; open tools render above the palette. Multiple tools can be open.
 *
 * Props:
 *   sessionId          — current session UUID
 *   menteeId           — mentee UUID
 *   toolResults        — { [toolId]: any } loaded from sessions.tool_results
 *   onToolResultChange — fn(toolId, data) called when a tool's state changes
 *   onAddCommitment    — fn(text, sourceTool) pushes a commitment to MentorNotes
 *   checkinHistory     — array of past checkin rows for ProgressReview tool
 */
import { useState } from 'react'
import { SESSION_TOOLS, TOOL_GROUP_COLOURS } from '../../lib/constants/frameworks'

// Tool renderer map — populated in Task 15 after all tool components exist
const TOOL_RENDERERS = {}

function ToolPlaceholder({ tool }) {
  return (
    <p style={{ fontSize: 13, color: 'var(--mute)', fontStyle: 'italic' }}>
      {tool.description}
    </p>
  )
}

export default function ToolsPalette({
  sessionId, menteeId, toolResults, onToolResultChange, onAddCommitment, checkinHistory,
}) {
  const [openIds, setOpenIds] = useState(new Set())

  function toggle(toolId) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(toolId) ? next.delete(toolId) : next.add(toolId)
      return next
    })
  }

  const openTools = SESSION_TOOLS.filter(t => openIds.has(t.id))

  return (
    <div className="card" style={{ marginBottom: 20, padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>OurPath Tools</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', margin: 0 }}>
            Session tools
          </h3>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mute)' }}>
          {SESSION_TOOLS.length} tools available
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 18, lineHeight: 1.5 }}>
        Open any tool during the session. Use it verbally or work through it together.
        Results can be pushed to Commitments below.
      </p>

      {/* Open tool panels — render above palette */}
      {openTools.map(tool => {
        const Renderer = TOOL_RENDERERS[tool.id] || ToolPlaceholder
        return (
          <div
            key={tool.id}
            style={{
              border: '1px solid var(--navy)', borderRadius: 10,
              background: 'rgba(245,238,217,0.6)', padding: '18px 20px', marginBottom: 14,
            }}
          >
            {/* Tool header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--navy)', fontWeight: 500 }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginTop: 2 }}>
                  {tool.arabic} — {tool.arabicEn}
                </div>
              </div>
              <button
                onClick={() => toggle(tool.id)}
                style={{
                  fontSize: 12, color: 'var(--mute)', border: '1px solid var(--line)',
                  borderRadius: 5, padding: '4px 10px', background: 'var(--off-white)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                ✕ Close
              </button>
            </div>

            <Renderer
              tool={tool}
              result={toolResults[tool.id]}
              onChange={data => onToolResultChange(tool.id, data)}
              onAddCommitment={onAddCommitment}
              checkinHistory={checkinHistory}
            />
          </div>
        )
      })}

      {/* Palette grid */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mute)', marginBottom: 10 }}>
        All tools — click to open
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SESSION_TOOLS.map(tool => {
          const isOpen = openIds.has(tool.id)
          const gc = TOOL_GROUP_COLOURS[tool.group]
          return (
            <button
              key={tool.id}
              onClick={() => toggle(tool.id)}
              style={{
                textAlign: 'left', border: `1px solid ${isOpen ? 'var(--navy)' : 'var(--line)'}`,
                borderRadius: 8, padding: '11px 13px', cursor: 'pointer',
                background: isOpen ? 'rgba(245,238,217,0.8)' : 'var(--cream)',
                transition: 'border-color 0.12s',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>
                {tool.name}{isOpen ? ' ▾' : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                {tool.arabic}
              </div>
              <div style={{
                display: 'inline-block', marginTop: 5, fontSize: 9, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '1px 7px', borderRadius: 3,
                background: gc.bg, color: gc.text,
              }}>
                {tool.group}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
