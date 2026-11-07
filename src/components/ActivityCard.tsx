import { ArrowUpRight, CalendarDays, MapPin, Bookmark, Check } from 'lucide-react'
import type { Activity } from '../types'
import { formatDate, formatTime } from '../data'
import { AvatarStack } from './UI'

export default function ActivityCard({ activity, onOpen, saved, onSave, joined }: { activity: Activity; onOpen: () => void; saved: boolean; onSave: () => void; joined: boolean }) {
  const available = activity.capacity - activity.participants.length
  return <article className="activity-card group">
    <div className="relative overflow-hidden rounded-t-[18px]">
      <button className="block w-full overflow-hidden text-left" onClick={onOpen} aria-label={`View ${activity.title}`}><img src={activity.image} alt="" className="h-[172px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" /></button>
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold tracking-[.02em]">{activity.category}</span>
      <button className={`save-button absolute right-4 top-4 ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${activity.title}`} aria-pressed={saved} onClick={onSave}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button>
      {activity.canceled && <span className="absolute bottom-3 left-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-800">Canceled</span>}
    </div>
    <div className="px-5 pb-4 pt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.11em] text-[var(--muted)]">{activity.tag || 'A plan worth sharing'}</p>
      <button onClick={onOpen} className="mb-3 text-left"><h3 className="text-[18px] font-semibold leading-snug tracking-[-.5px] transition-colors group-hover:text-[var(--forest)]">{activity.title}</h3></button>
      <div className="space-y-2 text-[12px] text-[var(--muted)]"><p className="flex items-center gap-2"><CalendarDays size={14} /><span>{formatDate(activity.date)} <span className="mx-1">·</span> {formatTime(activity.startTime)} – {formatTime(activity.endTime)}</span></p><p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /><span>{activity.location}</span></p></div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3"><div className="flex items-center gap-2"><AvatarStack names={activity.participants} /><span className={`text-[11px] font-medium ${!available ? 'text-[#9a7655]' : 'text-[var(--muted)]'}`}>{joined ? <span className="flex items-center gap-1 text-[var(--forest)]"><Check size={12} /> Joined</span> : available ? `${available} spots open` : 'Full'}</span></div><span className="flex items-center gap-3 text-xs font-semibold">{activity.cost === 0 ? 'Free' : `~$${activity.cost}`}<button onClick={onOpen} aria-label={`Open ${activity.title}`} className="card-arrow"><ArrowUpRight size={16} /></button></span></div>
    </div>
  </article>
}
