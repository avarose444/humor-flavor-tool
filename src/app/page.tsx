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
import { Plus, Loader2, Edit2, Trash2, ChevronRight, Layers, Search, Copy, Sparkles } from 'lucide-react'

type FlavorWithCount = HumorFlavor & { step_count: number }

function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')!
  const pieces: any[] = []
  const colors = ['#f2a7b8','#c2185b','#c9a84c','#e8d48a','#fce4ec','#f7e7ce','#ffffff']
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    })
  }
  let frame = 0
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV
      p.vy += 0.1; p.alpha -= 0.007
      if (p.alpha <= 0) return
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot * Math.PI / 180)
      ctx.fillStyle = p.color
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    })
    frame++
    if (frame < 200) requestAnimationFrame(animate)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  animate()
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#f2a7b8]/30 dark:border-[#3d2f38] bg-[#fdf6f0] dark:bg-[#1a1015] text-[#1a1015] dark:text-[#f7e7ce] text-sm focus:outline-none focus:border-[#f2a7b8] dark:focus:border-[#f2a7b8]/60 transition-all placeholder:text-[#c8a97e]/60 font-body"

export default function HomePage() {
  const router   = useRouter()
  const supabase = createClient()
  const { isAdmin, loading: authLoading, user } = useAuth()

  const [flavors,     setFlavors]     = useState<FlavorWithCount[]>([])
  const [loading,     setLoading]     = useState(true)
  const [query,       setQuery]       = useState('')
  const [duplicating, setDuplicating] = useState<number | null>(null)

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
      fireConfetti()
    }
    setSaving(false); setModalOpen(false); loadFlavors()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('humor_flavors').delete().eq('id', deleteTarget.id)
    setDeleting(false); setDeleteTarget(null); loadFlavors()
  }

  const handleDuplicate = async (f: HumorFlavor) => {
    if (!user) return
    setDuplicating(f.id)
    const newSlug = `${f.slug}-copy-${Date.now().toString().slice(-4)}`
    const { data: newFlavor, error } = await supabase
      .from('humor_flavors')
      .insert({ slug: newSlug, description: f.description, created_by_user_id: user.id, modified_by_user_id: user.id })
      .select().single()
    if (error || !newFlavor) { setDuplicating(null); return }
    const { data: existingSteps } = await supabase
      .from('humor_flavor_steps').select('*').eq('humor_flavor_id', f.id).order('order_by')
    if (existingSteps && existingSteps.length > 0) {
      for (const s of existingSteps) {
        await supabase.from('humor_flavor_steps').insert({
          humor_flavor_id: newFlavor.id,
          order_by: s.order_by,
          llm_system_prompt: s.llm_system_prompt,
          llm_user_prompt: s.llm_user_prompt,
          description: s.description,
          llm_temperature: s.llm_temperature,
          llm_model_id: s.llm_model_id,
          llm_input_type_id: s.llm_input_type_id,
          llm_output_type_id: s.llm_output_type_id,
          humor_flavor_step_type_id: s.humor_flavor_step_type_id,
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
        } as any)
      }
    }
    setDuplicating(null); loadFlavors()
  }

  const filtered = flavors.filter(f =>
    f.slug.toLowerCase().includes(query.toLowerCase()) ||
    (f.description ?? '').toLowerCase().includes(query.toLowerCase())
  )

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={24} className="animate-spin text-[#f2a7b8]" />
    </div>
  )
  if (!isAdmin) return null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="relative mb-12 pt-2">
        <div className="absolute -top-8 left-0 w-80 h-40 bg-[#f2a7b8] opacity-10 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#c8a97e] dark:text-[#6a4a5a] font-body mb-1">
              ✦ Your collection ✦
            </p>
            <h1 className="text-4xl font-display italic text-[#1a1015] dark:text-[#f7e7ce]">
              Humor Flavors
            </h1>
            <p className="mt-1.5 text-sm text-[#c8a97e] dark:text-[#6a4a5a] font-body">
              Prompt chains that turn images into captions.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#f2a7b8] to-[#c2185b] hover:from-[#c2185b] hover:to-[#ad1457] text-white rounded-full font-body text-sm font-medium transition-all flex-shrink-0 shadow-lg shadow-[#f2a7b8]/30"
          >
            <Plus size={15} /> New Flavor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c8a97e]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search flavors…"
          className="w-full pl-11 pr-4 py-3 rounded-full border border-[#f2a7b8]/30 dark:border-[#3d2f38] bg-white/80 dark:bg-[#2d1f28]/80 text-sm focus:outline-none focus:border-[#f2a7b8] dark:focus:border-[#f2a7b8]/60 transition-all placeholder:text-[#c8a97e]/60 text-[#1a1015] dark:text-[#f7e7ce] font-body shadow-sm"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#f2a7b8]" />
            <p className="text-xs text-[#c8a97e] tracking-wider font-body">Loading your flavors…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fce4ec] to-[#f2a7b8] dark:from-[#3d2f38] dark:to-[#2d1f28] flex items-center justify-center animate-float">
            <Sparkles size={24} className="text-[#c2185b] dark:text-[#f2a7b8]" />
          </div>
          <p className="text-[#c8a97e] font-body text-sm">
            {query ? 'No flavors match your search.' : 'No flavors yet. Create your first one!'}
          </p>
          {!query && (
            <button onClick={openCreate} className="text-sm text-[#c2185b] dark:text-[#f2a7b8] hover:underline font-body font-medium">
              Create a flavor →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((f, i) => (
            <div
              key={f.id}
              className="group relative bg-white/80 dark:bg-[#2d1f28]/80 border border-[#f2a7b8]/20 dark:border-[#3d2f38] rounded-2xl overflow-hidden hover:border-[#f2a7b8]/60 dark:hover:border-[#f2a7b8]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#f2a7b8]/10 animate-slide-up backdrop-blur-sm"
              style={{animationDelay: `${i * 0.04}s`}}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f2a7b8]/30 to-transparent group-hover:via-[#f2a7b8] transition-all duration-300" />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display italic text-[#1a1015] dark:text-[#f7e7ce] truncate group-hover:text-[#c2185b] dark:group-hover:text-[#f2a7b8] transition-colors text-lg">
                      {f.slug}
                    </h3>
                    {f.description && (
                      <p className="mt-1 text-xs text-[#c8a97e] dark:text-[#6a4a5a] line-clamp-2 leading-relaxed font-body">{f.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-[#c8a97e] dark:text-[#6a4a5a] font-body">
                      <span className="flex items-center gap-1.5">
                        <Layers size={10} className="text-[#f2a7b8]" />
                        {f.step_count} step{f.step_count !== 1 ? 's' : ''}
                      </span>
                      <span className="opacity-40">·</span>
                      <span>{new Date(f.modified_datetime_utc).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(f)} title="Edit" className="p-2 rounded-full hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDuplicate(f)} disabled={duplicating === f.id} title="Duplicate" className="p-2 rounded-full hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors disabled:opacity-30">
                      {duplicating === f.id ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
                    </button>
                    <button onClick={() => setDeleteTarget(f)} title="Delete" className="p-2 rounded-full hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <Link href={`/flavors/${f.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-body text-[#c2185b] dark:text-[#f2a7b8] hover:gap-2.5 transition-all font-medium">
                  Manage steps <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editFlavor ? 'Edit Flavor' : 'New Humor Flavor'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body uppercase tracking-widest text-[#c8a97e]">Slug *</label>
            <input autoFocus value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. absurdist-roast" className={inputCls} />
            <p className="text-xs text-[#c8a97e]/60 font-body">Lowercase letters and hyphens only.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body uppercase tracking-widest text-[#c8a97e]">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What vibe does this flavor give?" className={inputCls + ' resize-none'} />
          </div>
          {formError && <p className="text-xs text-[#c2185b] bg-[#fce4ec] dark:bg-[#3d2f38] px-3 py-2 rounded-xl font-body">{formError}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-full border border-[#f2a7b8]/30 dark:border-[#3d2f38] hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors font-body">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm rounded-full bg-gradient-to-r from-[#f2a7b8] to-[#c2185b] hover:from-[#c2185b] hover:to-[#ad1457] disabled:opacity-60 text-white font-body font-medium transition-all shadow-md shadow-[#f2a7b8]/20">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editFlavor ? 'Save changes' : 'Create flavor'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Flavor"
        message={`Delete "${deleteTarget?.slug}"? This can't be undone.`}
      />
    </div>
  )
}