'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { generateCaptions } from '@/lib/api'
import { Modal } from '@/components/Modal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { HumorFlavor, HumorFlavorStep } from '@/lib/database.types'
import {
  ArrowLeft, Plus, GripVertical, Edit2, Trash2,
  Loader2, FlaskConical, ImageIcon, ChevronDown, ChevronUp,
  Sparkles, Save, X, CheckCircle2,
} from 'lucide-react'

const TEST_IMAGES = [
  { label: 'Office meeting',  url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800' },
  { label: 'Dog at beach',    url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800' },
  { label: 'Awkward elevator',url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800' },
  { label: 'Cat judging you', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800' },
  { label: 'Custom URL…',     url: '' },
]

export default function FlavorDetailPage() {
  const router   = useRouter()
  const params   = useParams<{ id: string }>()
  const supabase = createClient()
  const { isAdmin, loading: authLoading, session } = useAuth()

  const [flavor,  setFlavor]  = useState<HumorFlavor | null>(null)
  const [steps,   setSteps]   = useState<HumorFlavorStep[]>([])
  const [loading, setLoading] = useState(true)

  // Step modal
  const [stepModal,    setStepModal]    = useState(false)
  const [editStep,     setEditStep]     = useState<HumorFlavorStep | null>(null)
  const [stepPrompt,   setStepPrompt]   = useState('')
  const [stepDesc,     setStepDesc]     = useState('')
  const [stepSaving,   setStepSaving]   = useState(false)
  const [stepError,    setStepError]    = useState('')

  // Delete
  const [deleteStep, setDeleteStep] = useState<HumorFlavorStep | null>(null)
  const [deleting,   setDeleting]   = useState(false)

  // Reorder saving
  const [reordering, setReordering] = useState(false)

  // Test panel
  const [testOpen,    setTestOpen]    = useState(false)
  const [imageChoice, setImageChoice] = useState(0)
  const [customUrl,   setCustomUrl]   = useState('')
  const [testing,     setTesting]     = useState(false)
  const [testResult,  setTestResult]  = useState<{ captions: { caption: string }[]; error?: string } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/login')
  }, [authLoading, isAdmin, router])

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: flavorData }, { data: stepsData }] = await Promise.all([
      supabase.from('humor_flavors').select('*').eq('id', params.id).single(),
      supabase.from('humor_flavor_steps').select('*').eq('flavor_id', params.id).order('step_order'),
    ])
    setFlavor(flavorData ?? null)
    setSteps(stepsData ?? [])
    setLoading(false)
  }, [supabase, params.id])

  useEffect(() => { if (isAdmin) load() }, [isAdmin, load])

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = steps.findIndex(s => s.id === active.id)
    const newIndex = steps.findIndex(s => s.id === over.id)
    const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({ ...s, step_order: i + 1 }))
    setSteps(reordered)
    setReordering(true)
    // Persist all changed orders
    await Promise.all(
      reordered.map(s =>
        supabase.from('humor_flavor_steps').update({ step_order: s.step_order, updated_at: new Date().toISOString() }).eq('id', s.id)
      )
    )
    setReordering(false)
  }

  const openAddStep = () => {
    setEditStep(null); setStepPrompt(''); setStepDesc(''); setStepError(''); setStepModal(true)
  }
  const openEditStep = (s: HumorFlavorStep) => {
    setEditStep(s); setStepPrompt(s.prompt); setStepDesc(s.description ?? ''); setStepError(''); setStepModal(true)
  }

  const handleSaveStep = async () => {
    if (!stepPrompt.trim()) { setStepError('Prompt is required'); return }
    setStepSaving(true); setStepError('')
    if (editStep) {
      const { error } = await supabase
        .from('humor_flavor_steps')
        .update({ prompt: stepPrompt.trim(), description: stepDesc.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', editStep.id)
      if (error) { setStepError(error.message); setStepSaving(false); return }
    } else {
      const nextOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) + 1 : 1
      const { error } = await supabase
        .from('humor_flavor_steps')
        .insert({ flavor_id: params.id, step_order: nextOrder, prompt: stepPrompt.trim(), description: stepDesc.trim() || null })
      if (error) { setStepError(error.message); setStepSaving(false); return }
    }
    setStepSaving(false); setStepModal(false); load()
  }

  const handleDeleteStep = async () => {
    if (!deleteStep) return
    setDeleting(true)
    await supabase.from('humor_flavor_steps').delete().eq('id', deleteStep.id)
    // Re-number remaining
    const remaining = steps.filter(s => s.id !== deleteStep.id)
    await Promise.all(
      remaining.map((s, i) =>
        supabase.from('humor_flavor_steps').update({ step_order: i + 1 }).eq('id', s.id)
      )
    )
    setDeleting(false); setDeleteStep(null); load()
  }

  const handleTest = async () => {
    const imageUrl = imageChoice === TEST_IMAGES.length - 1 ? customUrl : TEST_IMAGES[imageChoice].url
    if (!imageUrl.trim()) return
    if (!session?.access_token) return
    setTesting(true); setTestResult(null)
    const result = await generateCaptions({
      imageUrl,
      flavorId: params.id,
      steps,
      accessToken: session.access_token,
    })
    setTestResult(result)
    setTesting(false)
  }

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={24} className="animate-spin text-brand-500" />
    </div>
  )
  if (!isAdmin || !flavor) return null

  const activeImageUrl = imageChoice === TEST_IMAGES.length - 1 ? customUrl : TEST_IMAGES[imageChoice].url

  return (
    <div className="animate-fade-in">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-3">
          <ArrowLeft size={14} /> All flavors
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{flavor.name}</h1>
            {flavor.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{flavor.description}</p>
            )}
          </div>
          <button
            onClick={() => { setTestOpen(o => !o); setTestResult(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20 flex-shrink-0"
          >
            <FlaskConical size={15} />
            Test Flavor
            {testOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Test panel */}
      {testOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 animate-slide-up">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <FlaskConical size={16} className="text-emerald-500" />
            Generate Test Captions
          </h2>

          {/* Image picker */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2 block">
              Test Image
            </label>
            <div className="flex flex-wrap gap-2">
              {TEST_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageChoice(i)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    imageChoice === i
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600',
                  ].join(' ')}
                >
                  <ImageIcon size={11} />
                  {img.label}
                </button>
              ))}
            </div>
            {imageChoice === TEST_IMAGES.length - 1 && (
              <input
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-zinc-400"
              />
            )}
          </div>

          {/* Preview */}
          {activeImageUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageUrl}
                alt="test"
                className="h-40 w-auto rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}

          <button
            onClick={handleTest}
            disabled={testing || !activeImageUrl.trim() || steps.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {testing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {testing ? 'Generating…' : 'Generate Captions'}
          </button>
          {steps.length === 0 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Add at least one step before testing.</p>
          )}

          {/* Results */}
          {testResult && (
            <div className="mt-5 animate-slide-up">
              {testResult.error ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">API Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono">{testResult.error}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {testResult.captions.length} caption{testResult.captions.length !== 1 ? 's' : ''} generated
                  </p>
                  <div className="flex flex-col gap-2">
                    {testResult.captions.map((c, i) => (
                      <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-200">{c.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Steps header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          Steps
          {reordering && <Loader2 size={13} className="animate-spin text-brand-500" />}
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">drag to reorder</span>
        </h2>
        <button
          onClick={openAddStep}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus size={14} /> Add Step
        </button>
      </div>

      {/* Sortable step list */}
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">No steps yet.</p>
          <button onClick={openAddStep} className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Add the first step →
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {steps.map(s => (
                <SortableStep
                  key={s.id}
                  step={s}
                  onEdit={() => openEditStep(s)}
                  onDelete={() => setDeleteStep(s)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Step modal */}
      <Modal
        open={stepModal}
        onClose={() => setStepModal(false)}
        title={editStep ? `Edit Step ${editStep.step_order}` : 'New Step'}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Prompt *
            </label>
            <textarea
              autoFocus
              value={stepPrompt}
              onChange={e => setStepPrompt(e.target.value)}
              rows={5}
              placeholder={`e.g. Look at this image and write a detailed description of what you see.`}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400 resize-y font-mono"
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Use <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded">{'{{input}}'}</code> to reference the previous step&apos;s output.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Description <span className="font-normal normal-case text-zinc-400">(optional)</span>
            </label>
            <input
              value={stepDesc}
              onChange={e => setStepDesc(e.target.value)}
              placeholder="Short label, e.g. 'Describe the image'"
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400"
            />
          </div>
          {stepError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{stepError}</p>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setStepModal(false)} className="px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSaveStep}
              disabled={stepSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-colors"
            >
              {stepSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editStep ? 'Save changes' : 'Add step'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete step confirm */}
      <ConfirmDialog
        open={!!deleteStep}
        onClose={() => setDeleteStep(null)}
        onConfirm={handleDeleteStep}
        loading={deleting}
        title="Delete Step"
        message={`Delete step ${deleteStep?.step_order}? "${deleteStep?.description || deleteStep?.prompt.slice(0, 60)}…"`}
      />
    </div>
  )
}

/* ─── Sortable step row ────────────────────────────────────────── */
function SortableStep({
  step, onEdit, onDelete,
}: {
  step: HumorFlavorStep
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'group flex gap-3 p-4 bg-white dark:bg-zinc-900 border rounded-2xl transition-all',
        isDragging
          ? 'border-brand-400 shadow-2xl shadow-brand-500/20 z-10 scale-[1.01]'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-700',
      ].join(' ')}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 mt-0.5 touch-none"
      >
        <GripVertical size={18} />
      </button>

      {/* Step number */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">
        {step.step_order}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {step.description && (
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">{step.description}</p>
        )}
        <p className="text-sm text-zinc-700 dark:text-zinc-200 font-mono line-clamp-3">{step.prompt}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} title="Edit step" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} title="Delete step" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
