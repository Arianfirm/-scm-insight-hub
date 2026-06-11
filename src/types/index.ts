// ============================================================
// SCM Insight Hub — Core Types
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ─── Enums ───────────────────────────────────────────────────

export type MeetingType =
  | 'weekly_review'
  | 'ops_review'
  | 'cross_function'
  | 'planning'
  | 'channel_ops'
  | 'ad_hoc'

export type IssueCategory =
  | 'intercompany'
  | 'warehouse'
  | 'inventory'
  | 'fulfillment'
  | 'transportation'
  | 'marketplace'
  | 'planning'
  | 'procurement'

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type RcaMethodology = '5_why' | 'fishbone'
export type FishboneCategory = 'man' | 'method' | 'machine' | 'material' | 'environment' | 'measurement'

// ─── Database Row Types ──────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  department: string | null
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string
  meeting_type: MeetingType
  participants: string[]
  summary: string | null
  attachment_urls: string[]
  created_by: string
  created_at: string
  updated_at: string
  // Joined
  _issues_count?: number
  _actions_count?: number
  _decisions_count?: number
}

export interface Issue {
  id: string
  meeting_id: string | null
  title: string
  category: IssueCategory
  description: string | null
  impact_level: ImpactLevel
  priority: Priority
  status: IssueStatus
  owner_id: string | null
  created_at: string
  updated_at: string
  // Joined
  meeting?: Pick<Meeting, 'id' | 'title' | 'meeting_date'>
  owner?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  _actions_count?: number
}

export interface RootCause {
  id: string
  issue_id: string
  methodology: RcaMethodology
  // 5 Why
  why_1: string | null
  why_2: string | null
  why_3: string | null
  why_4: string | null
  why_5: string | null
  root_cause_statement: string | null
  // Fishbone
  fishbone_man: string | null
  fishbone_method: string | null
  fishbone_machine: string | null
  fishbone_material: string | null
  fishbone_environment: string | null
  fishbone_measurement: string | null
  // Meta
  validated_by: string | null
  created_at: string
  updated_at: string
  // Joined
  issue?: Pick<Issue, 'id' | 'title' | 'category'>
}

export interface Action {
  id: string
  issue_id: string | null
  meeting_id: string | null
  title: string
  description: string | null
  pic_id: string | null
  due_date: string | null
  priority: Priority
  status: ActionStatus
  completion_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  issue?: Pick<Issue, 'id' | 'title' | 'category'>
  meeting?: Pick<Meeting, 'id' | 'title'>
  pic?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  is_overdue?: boolean
}

export interface KpiRecord {
  id: string
  issue_id: string | null
  action_id: string | null
  metric_name: string
  metric_unit: string | null
  value_before: number | null
  value_after: number | null
  improvement_pct: number | null
  measured_at: string | null
  notes: string | null
  created_at: string
  // Joined
  issue?: Pick<Issue, 'id' | 'title'>
  action?: Pick<Action, 'id' | 'title'>
}

export interface Decision {
  id: string
  meeting_id: string
  description: string
  owner_id: string | null
  decided_at: string
  created_at: string
  // Joined
  meeting?: Pick<Meeting, 'id' | 'title' | 'meeting_date'>
  owner?: Pick<Profile, 'id' | 'full_name'>
}

export interface Risk {
  id: string
  meeting_id: string | null
  title: string
  description: string | null
  impact: number // 1-5
  probability: number // 1-5
  risk_score: number // impact * probability
  risk_level: RiskLevel
  mitigation_plan: string | null
  owner_id: string | null
  status: 'open' | 'mitigated' | 'accepted' | 'closed'
  created_at: string
  updated_at: string
  // Joined
  owner?: Pick<Profile, 'id' | 'full_name'>
}

// ─── Dashboard / Aggregated ──────────────────────────────────

export interface DashboardStats {
  total_meetings: number
  total_issues: number
  total_actions: number
  open_actions: number
  in_progress_actions: number
  completed_actions: number
  overdue_actions: number
  closure_rate: number
  avg_resolution_days: number
}

export interface ActionTrendPoint {
  month: string
  completed: number
  opened: number
  closure_rate: number
}

export interface IssueByCategoryPoint {
  category: IssueCategory
  count: number
}

// ─── Form Types ───────────────────────────────────────────────

export interface MeetingFormValues {
  title: string
  meeting_date: string
  meeting_type: MeetingType
  participants: string[]
  summary: string
}

export interface IssueFormValues {
  meeting_id: string
  title: string
  category: IssueCategory
  description: string
  impact_level: ImpactLevel
  priority: Priority
  status: IssueStatus
  owner_id: string
}

export interface ActionFormValues {
  issue_id: string
  meeting_id: string
  title: string
  description: string
  pic_id: string
  due_date: string
  priority: Priority
  status: ActionStatus
}

export interface RiskFormValues {
  title: string
  description: string
  impact: number
  probability: number
  mitigation_plan: string
  owner_id: string
}

export interface KpiFormValues {
  issue_id: string
  action_id: string
  metric_name: string
  metric_unit: string
  value_before: number
  value_after: number
  notes: string
}

// ─── AI-Ready (Future) ────────────────────────────────────────

export interface AiSummaryJob {
  id: string
  meeting_id: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  transcript_url: string | null
  summary_output: string | null
  action_items_output: Json
  risk_flags_output: Json
  created_at: string
}
