import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Coffee, Eye, EyeOff, Gamepad2, Heart, Leaf, MapPin, Sparkles, Users } from 'lucide-react'
import type { AccountProps, User } from '../types'

const interests = ['Study', 'Food & coffee', 'Outdoors', 'Games', 'Sports', 'Arts & culture']
const steps = ['Account details', 'Your profile', 'Review']

export default function Account({ onComplete, onCancel, initialMode = 'signup' }: AccountProps) {
  const [mode, setMode] = useState(initialMode)
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const form = useRef<HTMLFormElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const completion = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (completion.current) clearTimeout(completion.current) }, [])
  useEffect(() => { if (createdUser) heading.current?.focus() }, [createdUser])

  const changeMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup')
    setStep(0)
    setErrors({})
    setPassword('')
  }

  const changeStep = (next: number) => {
    setStep(next)
    setErrors({})
    requestAnimationFrame(() => heading.current?.focus())
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (mode === 'login') {
      if (!username.trim()) nextErrors.username = 'Enter your username.'
      if (!password) nextErrors.password = 'Enter your password.'
      if (username.trim() && password && (username.trim().toLowerCase() !== 'zaria' || password !== 'peer2here')) {
        nextErrors.login = 'We could not log you in. Use the demo username and password shown below.'
      }
    } else if (step === 0) {
      if (!username.trim()) nextErrors.username = 'Choose a username.'
      else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) nextErrors.username = 'Use 3–20 letters, numbers, or underscores.'
      else if (['zaria', 'shiloh', 'admin'].includes(username.trim().toLowerCase())) nextErrors.username = 'That username is taken. Try adding a few numbers.'
      if (password.length < 8) nextErrors.password = 'Use at least 8 characters for your password.'
    } else if (step === 1 && !name.trim()) {
      nextErrors.name = 'Enter a display name.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus())
      return
    }
    if (mode === 'signup' && step < 2) {
      changeStep(step + 1)
      return
    }
    setBusy(true)
    completion.current = setTimeout(() => {
      const accountUser = mode === 'login'
        ? { name: 'Zaria', username: 'zaria', interests: ['Study', 'Food & coffee'] }
        : { name: name.trim(), username: username.trim().toLowerCase(), interests: selected }
      if (mode === 'login') onComplete(accountUser)
      else {
        setCreatedUser(accountUser)
        setPassword('')
        setBusy(false)
      }
    }, 550)
  }

  const fieldError = (field: string) => errors[field] ? <p className="mt-2 text-sm text-red-700" id={`${field}-error`} role="alert">{errors[field]}</p> : null

  if (createdUser) return <div className="mx-auto max-w-2xl px-5 py-12 md:py-20">
    <section className="rounded-[28px] border border-[#dfe5db] bg-white px-7 py-12 text-center sm:p-14" aria-labelledby="account-created-heading">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#e9efdf] text-[#205a45]"><Check size={34} strokeWidth={1.5} /></span>
      <p className="eyebrow mt-7 text-[#74826e]">YOUR NEXT CHAPTER STARTS HERE</p>
      <h1 ref={heading} tabIndex={-1} id="account-created-heading" className="mt-3 font-serif text-4xl text-[#253d30] outline-none">Account created.</h1>
      <p className="mt-5 text-lg font-semibold text-[#35523e]">Welcome, {createdUser.name}.</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#75806e]">You’re ready to find a little company. Explore a plan, join a conversation, or start something of your own.</p>
      <button className="btn-primary mx-auto mt-8 flex items-center justify-center gap-2" onClick={() => onComplete(createdUser)}>Explore activities <ArrowRight size={17} /></button>
      <p className="mt-6 text-xs text-[#798371]">A little hello goes a long way.</p>
    </section>
  </div>

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
      <button className="btn-ghost mb-7 inline-flex items-center gap-2" onClick={onCancel}><ArrowLeft size={17} /> Back to exploring</button>
      <div className="grid overflow-hidden rounded-[28px] border border-[#dfe5db] bg-white md:min-h-[680px] md:grid-cols-[0.9fr_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-[#e9efdf] p-8 md:p-11 lg:p-12">
          <div className="eyebrow flex items-center gap-2 text-[#35634c]"><MapPin size={15} /> YOUR CAMPUS. YOUR PEOPLE.</div>
          <h1 className="relative z-10 mt-7 max-w-sm font-serif text-[42px] leading-[1.08] tracking-[-1.5px] text-[#253d30] md:text-[50px]">Good things start<br />with <span className="italic">a little hello.</span></h1>
          <p className="relative z-10 mt-5 max-w-xs text-[15px] leading-7 text-[#5f6e5c]">A study buddy, a coffee break, a new familiar face. Find your kind of company at UW–Stout.</p>
          <div className="relative mt-12 hidden h-60 md:block" aria-hidden="true">
            <div className="absolute left-2 top-2 flex w-60 -rotate-6 items-center gap-4 rounded-2xl border border-[#d2daca] bg-[#fffdf8] p-5 shadow-[0_10px_30px_#243e2b0d]">
              <div className="grid size-12 place-items-center rounded-full bg-[#f5e2bc] text-[#8d6434]"><Coffee size={24} /></div>
              <div><p className="text-sm font-semibold text-[#2c4435]">Coffee & a catch-up</p><p className="mt-1 text-xs text-[#76816e]">A little break, together.</p></div>
            </div>
            <div className="absolute right-0 top-[91px] flex w-60 rotate-6 items-center gap-4 rounded-2xl border border-[#d2daca] bg-[#fffdf8] p-5 shadow-[0_10px_30px_#243e2b0d]">
              <div className="grid size-12 place-items-center rounded-full bg-[#dce6f0] text-[#57748a]"><BookOpen size={24} /></div>
              <div><p className="text-sm font-semibold text-[#2c4435]">Better study buddies</p><p className="mt-1 text-xs text-[#76816e]">Figure it out together.</p></div>
            </div>
            <Sparkles className="absolute right-3 -top-5 text-[#b29849]" size={29} />
            <Leaf className="absolute bottom-0 left-8 -rotate-12 text-[#719062]" size={44} />
            <Heart className="absolute bottom-0 right-5 rotate-12 text-[#b9866b]" size={24} />
          </div>
          <div className="mt-auto hidden items-center gap-2 border-t border-[#cbd6bd] pt-5 text-xs text-[#63745c] md:flex"><Users size={16} /> Small plans. Real connections.</div>
        </aside>

        <section className="p-7 sm:p-10 lg:p-12" aria-labelledby="account-heading">
          {mode === 'signup' && <div className="mb-9 flex items-center" aria-label={`Step ${step + 1} of 3`}>
            {steps.map((label, index) => <div key={label} className={`flex min-w-0 items-center ${index < 2 ? 'flex-1' : ''}`}>
              <span aria-current={index === step ? 'step' : undefined} className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${index <= step ? 'bg-[#205a45] text-white' : 'bg-[#f0f2eb] text-[#798273]'}`}>{index < step ? <Check size={15} /> : index + 1}</span>
              {index < 2 && <span className={`mx-3 h-px flex-1 ${index < step ? 'bg-[#205a45]' : 'bg-[#e3e7dd]'}`} />}
            </div>)}
          </div>}
          <div className="eyebrow text-[#74826e]">{mode === 'login' ? 'NICE TO SEE YOU AGAIN' : `STEP ${step + 1} OF 3 · ${steps[step].toUpperCase()}`}</div>
          <h2 ref={heading} tabIndex={-1} id="account-heading" className="mt-3 font-serif text-[32px] leading-tight tracking-[-0.7px] text-[#253d30] outline-none">
            {mode === 'login' ? 'Welcome back.' : ['Find your people.', 'Make yourself at home.', 'Looking good, ' + name.trim() + '.'][step]}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#75806e]">{mode === 'login' ? 'Your next good plan is waiting for you.' : ['Your next connection is just a few small steps away.', 'Give your classmates a name to say hello to.', 'Take a moment to check your details before joining.'][step]}</p>

          <form ref={form} onSubmit={submit} noValidate className="mt-8">
            {(mode === 'login' || step === 0) && <div className="space-y-5">
              <div>
                <label className="field-label" htmlFor="account-username">Username</label>
                <input id="account-username" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose your username" aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} required />
                {fieldError('username')}
              </div>
              <div>
                <label className="field-label" htmlFor="account-password">Password</label>
                <div className="relative">
                  <input id="account-password" className="input pr-12" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : 'password-help'} required />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-[#75806e]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {fieldError('password')}
                <p id="password-help" className="mt-2 text-xs leading-5 text-[#798371]">{mode === 'login' ? 'You can paste your password or use autofill.' : 'Use at least 8 characters. Pasting and password managers are welcome.'}</p>
              </div>
              {mode === 'login' && <div className="rounded-xl border border-[#e1e6d8] bg-[#f6f8f1] p-4 text-sm leading-6 text-[#5f6e59]"><span className="font-semibold text-[#35523e]">Try the demo account</span><br />Username: <strong>zaria</strong> · Password: <strong>peer2here</strong></div>}
              {errors.login && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{errors.login}</p>}
            </div>}

            {mode === 'signup' && step === 1 && <div className="space-y-6">
              <div>
                <label className="field-label" htmlFor="account-name">Display name</label>
                <input id="account-name" className="input" autoComplete="nickname" value={name} maxLength={50} onChange={e => setName(e.target.value)} placeholder="What should we call you?" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error name-help' : 'name-help'} required />
                {fieldError('name')}
                <p id="name-help" className="mt-2 text-xs leading-5 text-[#798371]">Students will see this name on your profile, activities, and discussion posts.</p>
              </div>
              <fieldset>
                <legend className="field-label">What are you into? <span className="font-normal text-[#84907b]">(optional)</span></legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {interests.map((interest, index) => {
                    const Icon = [BookOpen, Coffee, Leaf, Gamepad2, Users, Sparkles][index]
                    const active = selected.includes(interest)
                    return <button key={interest} type="button" aria-pressed={active} onClick={() => setSelected(active ? selected.filter(i => i !== interest) : [...selected, interest])} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${active ? 'border-[#205a45] bg-[#e9f0e5] text-[#205a45]' : 'border-[#e2e6dd] text-[#687460] hover:border-[#96af8e]'}`}><Icon size={15} />{interest}{active && <Check size={13} />}</button>
                  })}
                </div>
                <p className="mt-3 text-xs leading-5 text-[#798371]">No pressure. You can add or change these later.</p>
              </fieldset>
            </div>}

            {mode === 'signup' && step === 2 && <div className="overflow-hidden rounded-xl border border-[#e2e6dc]">
              <div className="flex items-center gap-4 bg-[#f5f7f0] p-5"><div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e0e9d4] font-serif text-xl text-[#44643b]">{name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="break-words font-semibold text-[#304830]">{name}</p><p className="break-words text-sm text-[#75806e]">@{username}</p></div></div>
              <div className="space-y-4 p-5 text-sm">
                <div className="flex items-center justify-between gap-4"><span className="text-[#75806e]">Account details</span><button className="min-h-10 font-semibold text-[#205a45] underline decoration-[#b5c7a8] underline-offset-4" type="button" onClick={() => changeStep(0)}>Edit account</button></div>
                <div className="flex justify-between"><span className="text-[#75806e]">Password</span><span aria-label="Password hidden">••••••••</span></div>
                <div className="border-t border-[#e7eadf] pt-3"><div className="flex items-center justify-between"><span className="text-[#75806e]">Your interests</span><button className="min-h-10 font-semibold text-[#205a45] underline decoration-[#b5c7a8] underline-offset-4" type="button" onClick={() => changeStep(1)}>Edit profile</button></div><p className="mt-1 leading-6 text-[#44553c]">{selected.length ? selected.join(' · ') : 'You can add these whenever you like.'}</p></div>
              </div>
            </div>}

            <div className="mt-7 flex items-center gap-3">
              {mode === 'signup' && step > 0 && <button className="btn-secondary" type="button" disabled={busy} onClick={() => changeStep(step - 1)}>Back</button>}
              <button className="btn-primary flex flex-1 items-center justify-center gap-2" type="submit" disabled={busy}>
                {busy ? (mode === 'login' ? 'Logging in…' : 'Creating account…') : (mode === 'login' ? 'Log in' : ['Continue', 'Review account', 'Create account'][step])}
                {!busy && <ArrowRight size={17} />}
              </button>
            </div>
            {mode === 'signup' && step === 1 && <button type="button" className="mt-3 min-h-11 w-full text-center text-sm text-[#687460] underline underline-offset-4" onClick={() => { setSelected([]); if (!name.trim()) { setErrors({ name: 'Enter a display name.' }); form.current?.querySelector<HTMLInputElement>('#account-name')?.focus() } else changeStep(2) }}>Skip interests for now</button>}
            <div role="status" className="sr-only">{busy ? (mode === 'login' ? 'Logging in' : 'Creating account') : ''}</div>
          </form>
          <p className="mt-7 text-center text-sm text-[#798371]">{mode === 'signup' ? 'Already part of the community?' : 'New around here?'}{' '}<button disabled={busy} onClick={changeMode} className="min-h-10 font-semibold text-[#205a45] underline decoration-[#b5c7a8] underline-offset-4">{mode === 'signup' ? 'Log in' : 'Create account'}</button></p>
          <p className="mt-4 text-center text-[11px] leading-5 text-[#8a9383]">Prototype preview · Account details stay in this session.<br />Use a made-up password for this demo.</p>
        </section>
      </div>
    </div>
  )
}
