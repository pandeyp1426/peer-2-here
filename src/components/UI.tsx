import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog.close(); document.body.style.overflow = previous } }, [])
  return <dialog ref={ref} className={`app-dialog ${wide ? 'dialog-wide' : ''}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose() } }}>
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5"><h2 className="text-xl font-semibold">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    <div className="p-6">{children}</div>
  </dialog>
}

const avatarColors = ['#e9d8c2', '#d9e6d9', '#dedbf1', '#f1dccf', '#d4e4e8', '#f2e8c0']
export function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const color = avatarColors[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarColors.length]
  return <span className={`avatar avatar-${size} ${className}`} style={{ background: color }} title={name}>{name.slice(0, 1).toUpperCase()}</span>
}
export function AvatarStack({ names }: { names: string[] }) { return <div className="flex -space-x-2">{names.slice(0, 3).map(name => <Avatar key={name} name={name} size="sm" className="border-2 border-white" />)}{names.length > 3 && <span className="avatar avatar-sm border-2 border-white bg-[#eeeee6] text-[9px]">+{names.length - 3}</span>}</div> }
export function Logo({ compact = false }: { compact?: boolean }) { return <span className="flex items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--forest)]"><svg width="29" height="29" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M13 14h5a6 6 0 0 1 0 12h-5v-6m14 6h-5a6 6 0 0 1 0-12h5v6" stroke="#fff9e9" strokeWidth="3" strokeLinecap="round" /></svg></span>{!compact && <span className="text-[21px] font-bold tracking-[-1px]">peer<span className="text-[var(--forest)]">2</span>here<span className="text-[var(--forest)]">.</span></span>}</span> }
