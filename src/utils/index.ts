import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { Priority, IssueStatus, ActionStatus, RiskLevel, IssueCategory, MeetingType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Helpers ─────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: idLocale })
}

export function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale })
}

export function isOverdue(dueDate: string | null, status: ActionStatus): boolean {
  if (!dueDate || status === 'completed' || status === 'cancelled') return false
  return isPast(parseISO(dueDate))
}

// ─── Label Maps ───────────────────────────────────────────────

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  intercompany: 'Intercompany',
  warehouse: 'Warehouse',
  inventory: 'Inventory',
  fulfillment: 'Fulfillment',
  transportation: 'Transportation',
  marketplace: 'Marketplace',
  planning: 'Planning',
  procurement: 'Procurement',
}

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  weekly_review: 'Weekly Review',
  ops_review: 'Ops Review',
  cross_function: 'Cross Function',
  planning: 'Planning',
  channel_ops: 'Channel Ops',
  ad_hoc: 'Ad Hoc',
}

// ─── Badge Color Classes ──────────────────────────────────────

export function priorityClass(priority: Priority): string {
  return {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-50 text-scm-blue',
    high: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  }[priority]
}

export function issueStatusClass(status: IssueStatus): string {
  return {
    open: 'bg-blue-50 text-scm-blue',
    in_progress: 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
    closed: 'bg-gray-100 text-gray-500',
  }[status]
}

export function actionStatusClass(status: ActionStatus): string {
  return {
    open: 'bg-blue-50 text-scm-blue',
    in_progress: 'bg-amber-50 text-amber-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }[status]
}

export function riskLevelClass(level: RiskLevel): string {
  return {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700',
  }[level]
}

export function categoryColor(category: IssueCategory): string {
  return {
    intercompany: '#185FA5',
    warehouse: '#1D9E75',
    inventory: '#7F77DD',
    fulfillment: '#EF9F27',
    transportation: '#D4537E',
    marketplace: '#E24B4A',
    planning: '#0F6E56',
    procurement: '#854F0B',
  }[category] ?? '#888'
}

export function meetingTypeColor(type: MeetingType): string {
  return {
    weekly_review: '#185FA5',
    ops_review: '#1D9E75',
    cross_function: '#7F77DD',
    planning: '#EF9F27',
    channel_ops: '#D4537E',
    ad_hoc: '#888',
  }[type] ?? '#888'
}

// ─── Risk Score ───────────────────────────────────────────────

export function riskLevel(impact: number, probability: number): RiskLevel {
  const score = impact * probability
  if (score >= 15) return 'critical'
  if (score >= 8) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

export function riskHeatmapColor(impact: number, probability: number): string {
  const level = riskLevel(impact, probability)
  return {
    low: '#C0DD97',
    medium: '#FAC775',
    high: '#F09595',
    critical: '#E24B4A',
  }[level]
}

// ─── Misc ─────────────────────────────────────────────────────

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function improvementPct(before: number, after: number): number {
  if (before === 0) return 0
  return Math.round(((after - before) / before) * 100)
}
