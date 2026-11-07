export type Category = 'Study' | 'Food & coffee' | 'Outdoors' | 'Games' | 'Sports' | 'Arts & culture'
export interface User { name: string; username: string; interests: string[] }
export interface Discussion { id: string; name: string; text: string; time: string; reply?: string }
export interface Activity {
  id: string
  title: string
  category: Category
  date: string
  startTime: string
  endTime: string
  location: string
  directions: string
  description: string
  cost: number
  capacity: number
  participants: string[]
  participantUsernames?: string[]
  host: string
  hostUsername: string
  audience: 'Campus community' | 'Selected students'
  invited: string[]
  image: string
  tag?: string
  accessibility: string
  discussion: Discussion[]
  update?: string
  canceled?: string
}
export interface ActivityFormProps {
  user: User
  initial?: Activity
  onPublish: (activity: Activity) => void
  onCancel: () => void
}
export interface AccountProps {
  onComplete: (user: User) => void
  onCancel: () => void
  initialMode?: 'signup' | 'login'
}
