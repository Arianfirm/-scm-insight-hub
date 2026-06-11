import { cn } from '@/utils'
import { getInitials } from '@/utils'
import { LucideIcon } from 'lucide-react'

// ─── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-scm-blue',
    gray: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

export function Button({
  children, className, variant = 'secondary', size = 'md',
  icon: Icon, iconPosition = 'left', ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-scm-blue text-white border-scm-blue hover:bg-scm-blue-dark',
    secondary: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100',
    danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  }
  const sizes = {
    sm: 'h-7 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-5 text-sm gap-2',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium border rounded-lg transition-colors',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────
interface AvatarProps {
  name: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' }
  return (
    <div className={cn('rounded-full bg-scm-blue-light flex items-center justify-center font-semibold text-scm-blue flex-shrink-0', sizes[size], className)}>
      {getInitials(name)}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  accentColor?: string
  icon?: LucideIcon
}

export function StatCard({ label, value, delta, deltaType = 'neutral', accentColor = '#185FA5', icon: Icon }: StatCardProps) {
  const deltaColors = {
    positive: 'text-green-600',
    negative: 'text-red-500',
    neutral: 'text-gray-400',
  }
  return (
    <div className="scm-card p-4 relative overflow-hidden">
      <div
        className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r"
        style={{ backgroundColor: accentColor }}
      />
      <div className="pl-1">
        {Icon && <Icon className="w-4 h-4 mb-2" style={{ color: accentColor }} />}
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {delta && <p className={cn('text-xs mt-1', deltaColors[deltaType])}>{delta}</p>}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────
interface SectionCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, subtitle, action, children, className }: SectionCardProps) {
  return (
    <div className={cn('scm-card', className)}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-100 rounded', className)} />
}

// ─── Priority Badge ───────────────────────────────────────────
import type { Priority, IssueStatus, ActionStatus } from '@/types'
import { priorityClass, issueStatusClass, actionStatusClass } from '@/utils'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('status-pill', priorityClass(priority))}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={cn('status-pill', issueStatusClass(status))}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  )
}

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return (
    <span className={cn('status-pill', actionStatusClass(status))}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────
interface TabBarProps {
  tabs: { label: string; value: string; count?: number }[]
  active: string
  onChange: (value: string) => void
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-gray-200 mb-5 -mx-5 px-5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            active === tab.value
              ? 'border-scm-blue text-scm-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              active === tab.value ? 'bg-scm-blue-light text-scm-blue' : 'bg-gray-100 text-gray-500'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
