import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from './supabase'

// Shared hook for all tool pages — saves responses to tool_responses
// and tracks last-shared timestamp for the UI.
export function useToolSave(toolSlug) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [lastShared, setLastShared] = useState(null)

  useEffect(() => {
    if (!user || !toolSlug) return
    supabase
      .from('tool_responses')
      .select('created_at')
      .eq('mentee_id', user.id)
      .eq('tool_slug', toolSlug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setLastShared(data.created_at) })
  }, [user, toolSlug])

  async function save(responses) {
    if (!user) return
    setSaving(true)
    setError('')

    // Link to active assignment if one exists
    const { data: assignment } = await supabase
      .from('tool_assignments')
      .select('id')
      .eq('mentee_id', user.id)
      .eq('tool_slug', toolSlug)
      .is('revoked_at', null)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error: insertErr } = await supabase.from('tool_responses').insert({
      mentee_id:     user.id,
      tool_slug:     toolSlug,
      assignment_id: assignment?.id ?? null,
      responses,
    })

    if (insertErr) {
      setError(`Could not share: ${insertErr.message}`)
    } else {
      setLastShared(new Date().toISOString())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return { save, saving, saved, error, lastShared }
}
