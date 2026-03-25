// @ts-nocheck
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { HumorFlavor } from '@/lib/database.types'
import { Plus, Sparkles, Loader2, Edit2, Trash2, ChevronRight, Layers, Search } from 'lucide-react'

type FlavorWithCount = HumorFlavor & { step_count: number }

export default function HomePage() {
  const router   = useRouter()
  const supabase = createClient()
  const { isAdmin, loading: authLoading, user } = useAuth()

  const [flavors,  setFlavors]  = useState<FlavorWithCount[]>([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editFlavor,  setEditFlavor]  = useState<HumorFlavor | null>(null)
  const [slug,        setSlug]        = useState('')
  const [description, setDescription] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')

  const [deleteTarget, setDeleteTarget] = useState<HumorFlavor | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/login')
  }, [authLoading, isAdmin, router])

  const loadFlavors = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('humor_flavors')
      .select('*, humor_flavor_steps(count)')
      .order('modified_datetime_utc', { ascending: false })
    const mapped = (data ?? []).map((f: any) => ({
      ...f,
      step_count: f.humor_flavor_steps?.[0]?.count ?? 0,
    }))
    setFlavors(mapped)
    setLoading(false)
  }, [supabase])

  useEffect(() => { if (isAdmin) loadFlavors() }, [isAdmin, loadFlavors])

  const openCreate = () => {
    setEditFlavor(null); setSlug(''); setDescription(''); setFormError(''); setModalOpen(true)
  }
  const openEdit = (f: HumorFlavor) => {
    setEditFlavor(f); setSlug(f.slug); setDescription(f.description ?? ''); setFormError(''); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!slug.trim()) { setFormError('Slug is required'); return }
    if (!user) return
    setSaving(true); setFormError('')
    const now = new Date().toISOString()
    if (editFlavor) {
      const { error } = await supabase
        .from('humor_flavors')
        .update({ slug: slug.trim(), description: description.trim() || null, modified_by_user_id: user.id, modified_datetime_utc: now })
        .eq('id', editFlavor.id)
      if (error) { setFormError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase
        .from('humor_flavors')
        .insert({ slug: slug.trim(), description: description.trim() || null, created_by_user_id: user.id, modified_by_user_id: user.id })
      if (error) { setFormError(error.message); setSaving(false); return }
    }
    setSaving(false); setModalOpen(false); loadFlavors()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('humor_flavors').delete().eq('id', deleteTarget.id)
    setDeleting(false); setDeleteTarget(null); loadFlavors()
  }

  const filtered = flavors.filter(f =>
    f.slug.toLowerCase().includes(query.toLowerCase()) ||
    (f.description ?? '').toLowerCase().includes(query.toLowerCase())
  )

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={24} className="animate-spin text-brand-500" />
    </div>
  )
  if (!isAdmin) return null

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles size={28} className="text-brand-500" />
            Humor Flavors
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage prompt chains that transform images into captions.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-brand-600/20 flex-shrink-0"
        >
          <Plus size={16} /> New Flavor
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search flavors…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Sparkles size={28} className="text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {query ? 'No flavors match your search.' : 'No flavors yet. Create your first one!'}
          </p>
          {!query && (
            <button onClick={openCreate} className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
              Create a flavor →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(f => (
            <div key={f.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/5 animate-slide-up">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-mono">
                    {f.slug}
                  </h3>
                  {f.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{f.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1"><Layers size={11} />{f.step_count} step{f.step_count !== 1 ? 's' : ''}</span>
                    <span>{new Date(f.modified_datetime_utc).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(f)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(f)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <Link href={`/flavors/${f.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-2 transition-all">
                Manage steps <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editFlavor ? 'Edit Flavor' : 'New Humor Flavor'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Slug *</label>
            <input
              autoFocus value={slug} onChange={e => setSlug(e.target.value)}
              placeholder="e.g. absurdist-roast"
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400 font-mono"
            />
            <p className="text-xs text-zinc-400">Use lowercase letters and hyphens only</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="What style of humor does this flavor produce?"
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400 resize-none"
            />
          </div>
          {formError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{formError}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editFlavor ? 'Save changes' : 'Create flavor'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Flavor" message={`Delete "${deleteTarget?.slug}"? All steps will be permanently removed.`}
      />
    </div>
  )
}