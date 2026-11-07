import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, Globe2, HeartHandshake, Info, MapPin, Pencil, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import type { Activity, ActivityFormProps, Category } from '../types'
import { DEMO_DATE } from '../data'

const categories: Category[] = ['Study', 'Food & coffee', 'Outdoors', 'Games', 'Sports', 'Arts & culture']
const images: Record<Category, string> = { Study: '/images/study.svg', 'Food & coffee': '/images/coffee.svg', Outdoors: '/images/outdoors.svg', Games: '/images/games.svg', Sports: '/images/sports.svg', 'Arts & culture': '/images/arts.svg' }
const students = [
  { name: 'Shiloh', username: 'shiloh', detail: 'English · Senior', color: '#e5ddf1' },
  { name: 'Caleb', username: 'caleb', detail: 'Computer science · Junior', color: '#e0ebd8' },
  { name: 'Chloe', username: 'chloe', detail: 'Graphic design · Junior', color: '#f5dfcc' },
  { name: 'Maya', username: 'maya', detail: 'Psychology · Sophomore', color: '#f3dfdf' },
  { name: 'Zaria', username: 'zaria', detail: 'Computer science · Freshman', color: '#e0e9ed' },
  { name: 'Noah', username: 'noah', detail: 'Business · Junior', color: '#ece4d0' },
  { name: 'Jordan', username: 'jordan', detail: 'Industrial design · Sophomore', color: '#dce7df' },
]

interface FormValues {
  title: string; category: Category; description: string; date: string; startTime: string; endTime: string
  location: string; directions: string; cost: string; capacity: string; audience: Activity['audience']; invited: string[]; accessibility: string; updateNote: string
}

function Field({ id, label, hint, error, children, optional = false }: { id: string; label: string; hint?: string; error?: string; children: ReactNode; optional?: boolean }) {
  return <div>
    <label className="field-label" htmlFor={id}>{label}{optional && <span className="ml-2 font-normal text-[#727b73]">optional</span>}</label>
    {children}
    {(hint || error) && <p id={`${id}-help`} className={`mt-2 text-xs leading-relaxed ${error ? 'font-medium text-[#a33832]' : 'text-[#727b73]'}`}>{error || hint}</p>}
  </div>
}

function prettyDate(value: string) {
  if (!value) return 'Choose a date'
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function prettyTime(value: string) {
  if (!value) return '—'
  const [hours, minutes] = value.split(':').map(Number)
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

export default function ActivityForm({ user, initial, onPublish, onCancel }: ActivityFormProps) {
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const publishTimer = useRef<number | undefined>(undefined)
  const [values, setValues] = useState<FormValues>({
    title: initial?.title || '', category: initial?.category || 'Study', description: initial?.description || '',
    date: initial?.date || DEMO_DATE, startTime: initial?.startTime || '16:00', endTime: initial?.endTime || '17:00',
    location: initial?.location || '', directions: initial?.directions || '', cost: String(initial?.cost ?? 0),
    capacity: String(initial?.capacity ?? 4), audience: initial?.audience || 'Campus community', invited: initial ? [...new Set([...initial.invited, ...(initial.audience === 'Selected students' ? initial.participants.filter(name => name !== initial.host) : [])])] : [],
    accessibility: initial?.accessibility || '', updateNote: '',
  })
  const steps = ['The details', 'People & audience', 'Review your plan']
  const changedLocation = !!initial && (initial.location !== values.location.trim() || initial.directions !== values.directions.trim())
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [step])
  useEffect(() => () => window.clearTimeout(publishTimer.current), [])

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (step === 0) {
      if (!values.title.trim()) nextErrors.title = 'Give your activity a title.'
      if (!values.description.trim()) nextErrors.description = 'Tell people a little about the plan.'
      const parsedDate = Date.parse(`${values.date}T12:00:00Z`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(parsedDate) || new Date(parsedDate).toISOString().slice(0, 10) !== values.date) nextErrors.date = 'Choose a valid date for your activity.'
      else if (values.date < DEMO_DATE) nextErrors.date = 'Choose November 6, 2026 or later.'
      if (!values.startTime) nextErrors.startTime = 'Choose a start time.'
      if (!values.endTime || values.endTime <= values.startTime) nextErrors.endTime = 'End time must be after start time.'
      if (!values.location.trim()) nextErrors.location = 'Enter a meeting place.'
      if (!values.directions.trim()) nextErrors.directions = 'Add a few directions so everyone can find you.'
      if (!/^(?:\d+|\d*\.\d{1,2})$/.test(values.cost) || !Number.isFinite(Number(values.cost))) nextErrors.cost = 'Enter a cost of $0 or more, with up to 2 decimal places.'
    } else if (step === 1) {
      const capacity = Number(values.capacity)
      const minimum = Math.max(2, initial?.participants.length || 0)
      if (!Number.isInteger(capacity) || capacity < minimum || capacity > 50) nextErrors.capacity = `Choose ${minimum}–50 people, including you${initial ? ' and current participants' : ''}.`
      if (values.audience === 'Selected students' && !values.invited.length) nextErrors.invited = 'Select at least one student to invite.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0]
      requestAnimationFrame(() => document.getElementById(`activity-${first}`)?.focus())
      return false
    }
    return true
  }

  function moveTo(next: number) { setErrors({}); setStep(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  function publish() {
    if (busy || publishTimer.current !== undefined) return
    setBusy(true)
    const activity: Activity = {
      ...initial,
      id: initial?.id || crypto.randomUUID(), title: values.title.trim(), category: values.category, description: values.description.trim(),
      date: values.date, startTime: values.startTime, endTime: values.endTime, location: values.location.trim(), directions: values.directions.trim(),
      cost: Number(values.cost), capacity: Number(values.capacity), audience: values.audience,
      invited: values.audience === 'Selected students' ? values.invited : [],
      host: initial?.host || user.name, hostUsername: initial?.hostUsername || user.username,
      participants: initial?.participants || [user.name], participantUsernames: initial?.participantUsernames || (initial ? initial.participants.map(name => name.toLowerCase()) : [user.username]), image: images[values.category],
      accessibility: values.accessibility.trim() || 'No venue accessibility details added. Ask the organizer if you have questions.',
      discussion: initial?.discussion || [],
      update: changedLocation ? `Meeting place updated: ${values.updateNote.trim() || `We’re now meeting at ${values.location.trim()}. ${values.directions.trim()}`}` : initial ? values.updateNote.trim() || 'Activity details updated. Please review the current plan before heading over.' : undefined,
    }
    publishTimer.current = window.setTimeout(() => {
      publishTimer.current = undefined
      onPublish(activity)
    }, 450)
  }

  function inputProps(key: keyof FormValues) {
    const hasDescription = !!errors[key] || ['description', 'cost', 'directions', 'accessibility', 'capacity', 'updateNote'].includes(key)
    return { id: `activity-${key}`, className: 'input', 'aria-invalid': !!errors[key], 'aria-describedby': hasDescription ? `activity-${key}-help` : undefined }
  }

  return <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 sm:py-12">
    <button type="button" onClick={onCancel} disabled={busy} className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#637067] hover:text-[#205a45]"><ArrowLeft size={16} /> {initial ? 'Back to activity' : 'Back to activities'}</button>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow mb-3">A little initiative goes a long way</p><h1 className="page-heading">{initial ? 'Make a little change.' : 'Good company starts with a plan.'}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b746c]">{initial ? 'Keep everyone in the loop. Review your changes before sharing the update.' : 'A study break, a coffee, a new connection. You bring the idea.'}</p></div>
      <span className="rounded-full border border-[#dce3d8] bg-white px-3 py-1.5 text-xs text-[#637067]">{initial ? 'Edit activity' : 'Create activity'}</span>
    </div>

    <ol className="mb-8 grid max-w-[720px] grid-cols-3 gap-2 sm:gap-6" aria-label="Creation progress">
      {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>
        <div className={`mb-3 h-1 rounded-full ${index <= step ? 'bg-[#205a45]' : 'bg-[#e3e7de]'}`} />
        <button type="button" disabled={index >= step || busy} onClick={() => moveTo(index)} className={`flex min-h-11 items-center gap-2 text-left text-xs sm:text-sm ${index === step ? 'font-semibold text-[#205a45]' : 'text-[#737e72]'} disabled:cursor-default`}>
          <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${index <= step ? 'bg-[#205a45] text-white' : 'bg-[#e8ece4]'}`}>{index < step ? <Check size={13} /> : index + 1}</span><span>{label}</span>
        </button>
      </li>)}
    </ol>

    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form noValidate aria-busy={busy} onSubmit={event => { event.preventDefault(); if (step < 2) { if (validate()) moveTo(step + 1) } else publish() }} className="panel overflow-hidden">
        <div className="border-b border-[#e8ebe3] px-5 py-6 sm:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#84907d]">Step {step + 1} of 3</p>
          <h2 ref={headingRef} tabIndex={-1} className="font-serif text-[27px] leading-tight text-[#25372f] outline-none">{step === 0 ? 'What’s the plan?' : step === 1 ? 'Who’s coming along?' : 'Looking good. One last check.'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#748072]">{step === 0 ? 'Help your people picture the get-together.' : step === 1 ? 'Keep it small, or make room for a few more.' : 'This is what students will see in your invitation.'}</p>
        </div>
        <div className="space-y-6 px-5 py-7 sm:px-8">
          {Object.values(errors).some(Boolean) && <p role="alert" className="rounded-xl bg-[#fff1eb] px-4 py-3 text-sm text-[#a33832]">A couple of details need your attention. Your other entries are saved.</p>}
          {step === 0 && <>
            <Field id="activity-title" label="Activity title" error={errors.title}><input {...inputProps('title')} value={values.title} onChange={e => set('title', e.target.value)} placeholder="e.g. A little code, a little coffee" maxLength={90} required /></Field>
            <Field id="activity-category" label="What kind of activity?"><select {...inputProps('category')} value={values.category} onChange={e => set('category', e.target.value as Category)}>{categories.map(category => <option key={category}>{category}</option>)}</select></Field>
            <Field id="activity-description" label="A little about the plan" error={errors.description} hint="What will you do? Are beginners welcome? Anything to bring?"><textarea {...inputProps('description')} rows={4} value={values.description} onChange={e => set('description', e.target.value)} placeholder="A relaxed hour working through programming problems together. All experience levels welcome — we’re learning together!" required /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field id="activity-date" label="Date" error={errors.date}><input {...inputProps('date')} type="date" min={DEMO_DATE} value={values.date} onChange={e => set('date', e.target.value)} required /></Field><Field id="activity-cost" label="Cost per person ($)" error={errors.cost} hint="Enter 0 if it’s free."><input {...inputProps('cost')} type="number" min="0" step="0.01" value={values.cost} onChange={e => set('cost', e.target.value)} required /></Field></div>
            <div><div className="grid grid-cols-2 gap-5"><Field id="activity-startTime" label="Starts at" error={errors.startTime}><input {...inputProps('startTime')} type="time" value={values.startTime} onChange={e => set('startTime', e.target.value)} required /></Field><Field id="activity-endTime" label="Ends at" error={errors.endTime}><input {...inputProps('endTime')} type="time" value={values.endTime} onChange={e => set('endTime', e.target.value)} required /></Field></div><p className="mt-2 text-xs text-[#727b73]">All times are in Central Time.</p></div>
            <Field id="activity-location" label="Meeting place" error={errors.location}><input {...inputProps('location')} value={values.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Campus library, first-floor tables" required /></Field>
            <Field id="activity-directions" label="How to find you" error={errors.directions} hint="A familiar landmark helps someone who’s new to campus."><textarea {...inputProps('directions')} rows={2} value={values.directions} onChange={e => set('directions', e.target.value)} placeholder="Come through the main entrance. We’ll be by the information desk." required /></Field>
            <Field id="activity-accessibility" label="Venue accessibility" optional hint="Share what you know, like a step-free entrance or elevator. Details are organizer-provided."><textarea {...inputProps('accessibility')} rows={2} value={values.accessibility} onChange={e => set('accessibility', e.target.value)} placeholder="e.g. Step-free entrance on the north side, elevator to upper floors." /></Field>
            {initial && <Field id="activity-updateNote" label="A note about the change" optional hint="Participants will see this update with their activity."><textarea {...inputProps('updateNote')} rows={2} value={values.updateNote} onChange={e => set('updateNote', e.target.value)} placeholder="Let everyone know what’s changing and why." /></Field>}
          </>}
          {step === 1 && <>
            <Field id="activity-capacity" label="How many people in total?" error={errors.capacity} hint={`This includes you, leaving ${Math.max(0, Number(values.capacity) - 1) || 0} places for other students.`}><input {...inputProps('capacity')} type="number" min={Math.max(2, initial?.participants.length || 0)} max={50} value={values.capacity} onChange={e => set('capacity', e.target.value)} required /></Field>
            <fieldset><legend className="field-label mb-3">Who can see this invitation?</legend><div className="space-y-3">
              {(['Campus community', 'Selected students'] as const).map(audience => <label key={audience} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${values.audience === audience ? 'border-[#205a45] bg-[#f0f5ec]' : 'border-[#dfe4da] bg-white hover:border-[#9aad96]'}`}>
                <input className="mt-1 size-4 accent-[#205a45]" type="radio" name="audience" value={audience} checked={values.audience === audience} onChange={() => { set('audience', audience); if (audience === 'Selected students' && initial) set('invited', [...new Set([...values.invited, ...initial.participants.filter(name => name !== initial.host)])]) }} />
                <span className="flex-1"><span className="flex items-center gap-2 text-sm font-semibold">{audience === 'Campus community' ? <Globe2 size={16} /> : <Users size={16} />}{audience}</span><span className="mt-1.5 block text-xs leading-relaxed text-[#6c766a]">{audience === 'Campus community' ? 'Registered UW–Stout students can find your activity and read its discussion. A chance to meet someone new.' : 'Only you and the students you select can view the invitation and its discussion.'}</span></span>
              </label>)}
            </div></fieldset>
            {values.audience === 'Selected students' && <div>
              <Field id="activity-invited" label="Choose students" error={errors.invited}><div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-[#7c8778]" /><input {...inputProps('invited')} style={{ paddingLeft: 38 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or username" /></div></Field>
              <div className="mt-3 divide-y divide-[#ecede8] rounded-xl border border-[#e2e6dc] px-3">
                {students.filter(student => student.username !== user.username && `${student.name} ${student.username}`.toLowerCase().includes(query.toLowerCase())).map(student => <label key={student.username} className="flex cursor-pointer items-center gap-3 py-3">
                  <span className="flex size-9 items-center justify-center rounded-full text-xs font-semibold" style={{ background: student.color }}>{student.name.slice(0, 1)}</span>
                  <span className="flex-1"><span className="block text-sm font-semibold">{student.name} <span className="font-normal text-[#84907d]">@{student.username}</span></span><span className="text-xs text-[#7b8575]">{student.detail}</span></span>
                  <input type="checkbox" className="size-4 accent-[#205a45]" checked={values.invited.includes(student.name)} disabled={initial?.participants.includes(student.name)} onChange={() => set('invited', values.invited.includes(student.name) ? values.invited.filter(name => name !== student.name) : [...values.invited, student.name])} />
                </label>)}
                {!students.some(student => student.username !== user.username && `${student.name} ${student.username}`.toLowerCase().includes(query.toLowerCase())) && <p className="py-5 text-center text-sm text-[#7b8575]">No students match that search.</p>}
              </div>
              {!!values.invited.length && <p className="mt-3 text-xs font-medium text-[#205a45]">{values.invited.length} selected: {values.invited.join(', ')}</p>}
              {initial && initial.participants.length > 1 && <p className="mt-2 text-xs leading-relaxed text-[#727b73]">Current participants stay selected so they can keep accessing the plan and its discussion.</p>}
            </div>}
            <div className="flex gap-3 rounded-xl bg-[#f6f5ec] p-4"><Info size={18} className="mt-0.5 shrink-0 text-[#8b865c]" /><p className="text-xs leading-relaxed text-[#73725d]">An invitation is just an invitation. Students only count as participants after they choose to join.</p></div>
          </>}
          {step === 2 && <>
            <div className="flex items-center justify-between"><span className="rounded-full bg-[#edf2e7] px-3 py-1.5 text-xs font-semibold text-[#42613d]">{values.category}</span><button type="button" disabled={busy} onClick={() => moveTo(0)} className="flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[#205a45]"><Pencil size={13} /> Edit details</button></div>
            <div><h3 className="font-serif text-3xl leading-tight">{values.title}</h3><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6b7669]">{values.description}</p></div>
            <div className="grid gap-5 border-y border-[#e7eae1] py-5 sm:grid-cols-2"><div className="flex items-start gap-3"><Clock3 size={19} className="mt-0.5 shrink-0 text-[#74856c]" /><div className="text-sm"><p className="font-semibold">{prettyDate(values.date)}</p><p className="mt-1 text-[#748072]">{prettyTime(values.startTime)} – {prettyTime(values.endTime)}</p><p className="mt-1 text-xs text-[#899180]">Central Time</p></div></div><div className="flex items-start gap-3"><MapPin size={19} className="mt-0.5 shrink-0 text-[#74856c]" /><div className="text-sm"><p className="font-semibold">{values.location}</p><p className="mt-1 leading-relaxed text-[#748072]">{values.directions}</p></div></div></div>
            {initial && changedLocation && <div className="rounded-xl bg-[#faf4df] p-4 text-sm leading-relaxed text-[#7b692e]"><p className="font-semibold">Meeting place updated</p><p className="mt-2"><strong>Previously:</strong> {initial.location}</p><p className="text-xs">{initial.directions}</p><p className="mt-2"><strong>Now:</strong> {values.location}</p><p className="text-xs">{values.directions}</p>{values.updateNote && <p className="mt-2">{values.updateNote}</p>}<p className="mt-2 text-xs">Participants will see the updated meeting place in My activities.</p></div>}
            {initial && !changedLocation && <div className="rounded-xl bg-[#f1f4eb] p-4 text-sm leading-relaxed text-[#5d7057]"><p className="font-semibold">Update for participants</p><p className="mt-2">{values.updateNote.trim() || 'Activity details updated. Please review the current plan before heading over.'}</p><p className="mt-2 text-xs">Participants can find this update in My activities.</p></div>}
            <dl className="grid grid-cols-2 gap-5 text-sm"><div><dt className="text-[#829079]">Cost per person</dt><dd className="mt-1.5 font-semibold">{Number(values.cost) === 0 ? 'Free — just bring yourself' : `$${Number(values.cost).toFixed(2)}`}</dd></div><div><dt className="text-[#829079]">Group size</dt><dd className="mt-1.5 font-semibold">{values.capacity} people, including you</dd></div></dl>
            {values.accessibility && <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#829079]">Venue accessibility · Organizer-provided</p><p className="text-sm leading-relaxed text-[#6b7669]">{values.accessibility}</p></div>}
            <div className="rounded-xl border border-[#dce5d6] bg-[#f3f7ef] p-4"><div className="flex items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold text-[#205a45]">{values.audience === 'Campus community' ? <Globe2 size={17} /> : <ShieldCheck size={17} />}{values.audience}</p><button type="button" disabled={busy} onClick={() => moveTo(1)} className="flex min-h-10 items-center gap-1 text-xs font-semibold text-[#205a45]"><Pencil size={12} /> Edit audience</button></div><p className="mt-1 text-xs leading-relaxed text-[#6b7d63]">{values.audience === 'Campus community' ? 'Registered campus students can see your invitation and its discussion.' : `Only you and ${values.invited.join(', ')} can see your invitation and its discussion.`}</p><p className="mt-2 text-xs leading-relaxed text-[#6b7d63]">{initial ? `${initial.participants.length} confirmed participant${initial.participants.length === 1 ? '' : 's'} will remain on the activity.` : 'You’re the first participant. Invited students will need to choose to join.'}</p></div>
          </>}
        </div>
        <span className="sr-only" role="status">{busy ? initial ? 'Saving activity changes. Please wait.' : 'Publishing your invitation. Please wait.' : ''}</span>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ebe3] bg-[#fcfdf9] px-5 py-5 sm:px-8">
          <button type="button" className="btn-ghost" onClick={() => step === 0 ? onCancel() : moveTo(step - 1)} disabled={busy}>{step === 0 ? 'Cancel' : <><ArrowLeft size={15} /> Back</>}</button>
          <button className="btn-primary" type="submit" disabled={busy}>{busy ? initial ? 'Saving changes…' : 'Publishing…' : step === 2 ? initial ? 'Save changes' : 'Publish invitation' : step === 1 ? 'Review activity' : 'Continue'}{!busy && (step === 2 ? <CheckCircle2 size={17} /> : <ArrowRight size={17} />)}</button>
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-2xl border border-[#dce5d3] bg-[#edf3e7]">
          <div className="relative flex h-[134px] items-center justify-center overflow-hidden bg-[#e0eacb]">
            <div className="absolute -left-6 -top-7 size-28 rounded-full border border-[#a9bb90]/40" /><div className="absolute -right-5 -bottom-6 size-36 rounded-full border border-[#a9bb90]/40" />
            <span className="flex size-20 -rotate-6 items-center justify-center rounded-[24px] bg-[#f9f9ed] text-[#3c6449] shadow-[5px_6px_0_#c7d7b4]"><HeartHandshake size={38} strokeWidth={1.4} /></span><Sparkles size={23} className="absolute right-14 top-6 text-[#6c8851]" />
          </div>
          <div className="p-6"><p className="eyebrow mb-2">Your invitation</p><h3 className="font-serif text-[23px] leading-tight">{values.title || 'Something good is coming.'}</h3><div className="mt-5 space-y-3 text-xs text-[#6c7b61]"><p className="flex items-center gap-2"><Clock3 size={14} />{prettyDate(values.date)}</p><p className="flex items-center gap-2"><MapPin size={14} /><span className="truncate">{values.location || 'Your favorite campus spot'}</span></p><p className="flex items-center gap-2"><Users size={14} />{values.capacity || 4} people · {Number(values.cost) === 0 ? 'Free to join' : `$${Number(values.cost).toFixed(2)} per person`}</p></div></div>
        </div>
        <div className="rounded-2xl border border-[#e4e7dc] bg-white p-6"><p className="mb-4 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-[#87985e]" /> A good invitation feels easy.</p><ul className="space-y-4 text-xs leading-relaxed text-[#79816e]">{['Be specific about where to meet.', 'Let beginners know they’re welcome.', 'A small group can be a great start.'].map(tip => <li className="flex gap-2" key={tip}><ChevronRight size={14} className="mt-0.5 shrink-0 text-[#a4ae92]" />{tip}</li>)}</ul></div>
      </aside>
    </div>
  </div>
}
