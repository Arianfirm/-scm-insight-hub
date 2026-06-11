-- ============================================================
-- SCM Insight Hub — Seed Data
-- Run AFTER 001_schema.sql
-- NOTE: Replace the user UUIDs with real auth.users IDs after
--       you create your first users via Auth
-- ============================================================

-- ─── Demo Profiles ─────────────────────────────────────────
-- These will be auto-created when users sign up.
-- For seeding, we insert directly (bypass trigger):

insert into profiles (id, email, full_name, role, department) values
  ('11111111-0000-0000-0000-000000000001', 'rina.sari@company.com', 'Rina Sari', 'manager', 'Warehouse'),
  ('11111111-0000-0000-0000-000000000002', 'budi.arifin@company.com', 'Budi Arifin', 'member', 'Logistics'),
  ('11111111-0000-0000-0000-000000000003', 'dian.pratiwi@company.com', 'Dian Pratiwi', 'member', 'Procurement'),
  ('11111111-0000-0000-0000-000000000004', 'sari.maulida@company.com', 'Sari Maulida', 'member', 'Fulfillment'),
  ('11111111-0000-0000-0000-000000000005', 'hendra.wibowo@company.com', 'Hendra Wibowo', 'manager', 'Planning'),
  ('11111111-0000-0000-0000-000000000006', 'farah.lestari@company.com', 'Farah Lestari', 'member', 'Marketplace'),
  ('11111111-0000-0000-0000-000000000007', 'anton.kurniawan@company.com', 'Anton Kurniawan', 'director', 'SCM Excellence'),
  ('11111111-0000-0000-0000-000000000008', 'maya.dewi@company.com', 'Maya Dewi', 'member', 'Inventory')
on conflict (id) do nothing;

-- ─── Meetings ─────────────────────────────────────────────────
insert into meetings (id, title, meeting_date, meeting_type, participants, summary, created_by) values
  ('22222222-0000-0000-0000-000000000001', 'Weekly SCM Review', '2026-06-10', 'weekly_review',
   ARRAY['Rina Sari','Budi Arifin','Dian Pratiwi','Sari Maulida','Hendra Wibowo','Anton Kurniawan'],
   'Reviewed weekly performance across all SCM functions. Key focus on OTIF declining trend and intercompany delays. 8 issues raised, 12 actions assigned.',
   '11111111-0000-0000-0000-000000000007'),

  ('22222222-0000-0000-0000-000000000002', 'Warehouse Performance Review', '2026-06-09', 'ops_review',
   ARRAY['Rina Sari','Dian Pratiwi','Anton Kurniawan'],
   'Warehouse throughput at 87% vs 95% target. Backlog in receiving dock increased by 15% WoW. Capacity constraint identified as root issue.',
   '11111111-0000-0000-0000-000000000001'),

  ('22222222-0000-0000-0000-000000000003', 'Intercompany Review', '2026-06-07', 'cross_function',
   ARRAY['Rina Sari','Budi Arifin','Sari Maulida'],
   'Intercompany lead time averaging 4.5 days vs 2-day SLA. Approval bottleneck identified at finance gate. Process redesign agreed.',
   '11111111-0000-0000-0000-000000000002'),

  ('22222222-0000-0000-0000-000000000004', 'S&OP Meeting', '2026-06-05', 'planning',
   ARRAY['Hendra Wibowo','Anton Kurniawan','Maya Dewi','Sari Maulida'],
   'June demand plan aligned. Inventory coverage reviewed — 3 SKUs at risk of stockout in 2 weeks. Fill rate target set at 96%.',
   '11111111-0000-0000-0000-000000000005'),

  ('22222222-0000-0000-0000-000000000005', 'Marketplace Operations Review', '2026-06-03', 'channel_ops',
   ARRAY['Farah Lestari','Budi Arifin','Anton Kurniawan'],
   'Marketplace SLA compliance at 88% vs 95% target. Late fulfillment from warehouse causing SLA breach. Escalation matrix defined.',
   '11111111-0000-0000-0000-000000000006')
on conflict (id) do nothing;

-- ─── Issues ────────────────────────────────────────────────────
insert into issues (id, meeting_id, title, category, description, impact_level, priority, status, owner_id) values
  ('33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000003',
   'Intercompany delivery delay — avg 4.5 days vs 2-day SLA',
   'intercompany',
   'Intercompany transfers consistently taking 4-5 days due to manual approval process at finance gate. Impacts downstream fulfillment and OTIF score.',
   'high', 'critical', 'in_progress',
   '11111111-0000-0000-0000-000000000001'),

  ('33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000004',
   'Stock out — SKU-A001 & SKU-A002 at zero inventory',
   'inventory',
   '2 high-velocity SKUs hit zero stock. Replenishment order delayed 5 days due to supplier lead time extension. 340 orders impacted.',
   'high', 'high', 'in_progress',
   '11111111-0000-0000-0000-000000000008'),

  ('33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000002',
   'Warehouse receiving backlog increased 15% WoW',
   'warehouse',
   'Receiving dock backlog grew from 200 to 230 pallets. Under-staffing on morning shift and arrival clustering causing bottleneck.',
   'high', 'high', 'open',
   '11111111-0000-0000-0000-000000000001'),

  ('33333333-0000-0000-0000-000000000004',
   '22222222-0000-0000-0000-000000000001',
   'OTIF below target — current 87% vs 95% target',
   'fulfillment',
   'OTIF dropped 3 points MoM to 87%. Root causes: intercompany delays (40%), stockout (35%), warehouse backlog (25%).',
   'high', 'critical', 'open',
   '11111111-0000-0000-0000-000000000004'),

  ('33333333-0000-0000-0000-000000000005',
   '22222222-0000-0000-0000-000000000005',
   'Marketplace SLA compliance at 88% vs 95% target',
   'marketplace',
   'Late fulfillment causing 7% SLA breach on marketplace orders. Main channel affected: Shopee (12% breach), Tokopedia (8% breach).',
   'medium', 'medium', 'in_progress',
   '11111111-0000-0000-0000-000000000006'),

  ('33333333-0000-0000-0000-000000000006',
   '22222222-0000-0000-0000-000000000004',
   'Demand forecast accuracy below threshold — 71% vs 85% target',
   'planning',
   'Forecast accuracy declined due to promotional activities not captured in baseline. June S&OP cycle shows 3 major variance spikes.',
   'medium', 'medium', 'open',
   '11111111-0000-0000-0000-000000000005'),

  ('33333333-0000-0000-0000-000000000007',
   '22222222-0000-0000-0000-000000000002',
   'Supplier delivery compliance at 78% — key raw material at risk',
   'procurement',
   'Primary packaging supplier delivered late 4 out of 5 POs this month. Risk of production line stoppage if not resolved within 7 days.',
   'high', 'high', 'open',
   '11111111-0000-0000-0000-000000000003'),

  ('33333333-0000-0000-0000-000000000008',
   '22222222-0000-0000-0000-000000000001',
   'Inbound freight cost spike — 23% above budget',
   'transportation',
   'Spot rate utilization increased due to contracted carrier capacity shortfall. Q2 freight spend exceeds budget by 23%.',
   'medium', 'high', 'open',
   '11111111-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ─── Root Cause Analysis ──────────────────────────────────────
insert into root_causes (issue_id, methodology, why_1, why_2, why_3, why_4, why_5, root_cause_statement, validated_by) values
  ('33333333-0000-0000-0000-000000000001', '5_why',
   'Intercompany delivery took 4.5 days on average',
   'Finance approval step took 2-3 days each cycle',
   'No defined SLA for approval turnaround at finance',
   'SOP was not updated after the 2025 org restructuring',
   'No process owner was assigned for cross-entity approvals post-reorg',
   'Absence of a designated process owner led to an undefined SLA, causing approval delays of 2-3 days per cycle in intercompany transfers.',
   'Anton Kurniawan'),

  ('33333333-0000-0000-0000-000000000001', 'fishbone',
   'Approver not trained on new ERP intercompany module',
   'No defined approval SLA in cross-entity process',
   'ERP workflow not configured for auto-escalation',
   'Transfer documents missing mandatory fields causing rework',
   'Post-reorg accountability matrix was not updated',
   'KPI for intercompany cycle time not tracked in dashboard',
   'Anton Kurniawan'),

  ('33333333-0000-0000-0000-000000000003', '5_why',
   'Receiving backlog grew 15% week-over-week',
   'Morning shift throughput 30% below standard rate',
   'Two operators on sick leave with no replacement arranged',
   'No cross-training coverage plan for receiving function',
   'Workforce flexibility SOP only covers outbound operations',
   'Cross-training and coverage SOP gap in inbound/receiving function results in throughput loss when absenteeism occurs.',
   'Rina Sari')
on conflict do nothing;

-- ─── Actions ──────────────────────────────────────────────────
insert into actions (id, issue_id, meeting_id, title, description, pic_id, due_date, priority, status) values
  ('44444444-0000-0000-0000-000000000001',
   '33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000003',
   'Define and document intercompany approval SLA',
   'Draft SLA document covering approval turnaround time (target: same day), escalation matrix, and responsible approvers per entity.',
   '11111111-0000-0000-0000-000000000001', '2026-06-15', 'critical', 'in_progress'),

  ('44444444-0000-0000-0000-000000000002',
   '33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000003',
   'Configure ERP auto-escalation for intercompany approvals',
   'IT to configure workflow: if approval not completed within 4 hours, auto-escalate to supervisor. Go-live target: June 20.',
   '11111111-0000-0000-0000-000000000002', '2026-06-20', 'high', 'open'),

  ('44444444-0000-0000-0000-000000000003',
   '33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000004',
   'Emergency replenishment order — SKU-A001 & SKU-A002',
   'Raise emergency PO for 500 units SKU-A001 and 300 units SKU-A002 via air freight. Estimated landing: June 13.',
   '11111111-0000-0000-0000-000000000008', '2026-06-11', 'critical', 'completed'),

  ('44444444-0000-0000-0000-000000000004',
   '33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000004',
   'Set safety stock review — top 20 velocity SKUs',
   'Review and update safety stock parameters for top 20 SKUs. Incorporate supplier lead time extension into reorder point formula.',
   '11111111-0000-0000-0000-000000000005', '2026-06-18', 'high', 'in_progress'),

  ('44444444-0000-0000-0000-000000000005',
   '33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000002',
   'Implement cross-training for receiving function',
   'Identify 3 outbound staff for cross-training on receiving operations. Complete training within 2 weeks.',
   '11111111-0000-0000-0000-000000000001', '2026-06-25', 'high', 'open'),

  ('44444444-0000-0000-0000-000000000006',
   '33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000002',
   'Stagger inbound truck arrival schedule',
   'Coordinate with logistics team to stagger inbound arrivals — max 3 trucks per hour window to prevent dock congestion.',
   '11111111-0000-0000-0000-000000000002', '2026-06-12', 'medium', 'open'),

  ('44444444-0000-0000-0000-000000000007',
   '33333333-0000-0000-0000-000000000004',
   '22222222-0000-0000-0000-000000000001',
   'Build OTIF root cause drill-down dashboard',
   'Create Power BI dashboard linking OTIF performance to root causes by category. Enable weekly review in SCM meeting.',
   '11111111-0000-0000-0000-000000000004', '2026-06-14', 'high', 'in_progress'),

  ('44444444-0000-0000-0000-000000000008',
   '33333333-0000-0000-0000-000000000005',
   '22222222-0000-0000-0000-000000000005',
   'Define marketplace SLA escalation matrix',
   'Agree and publish escalation contacts for each marketplace channel. Include SLA threshold triggers and response SLA per tier.',
   '11111111-0000-0000-0000-000000000006', '2026-06-07', 'medium', 'completed'),

  ('44444444-0000-0000-0000-000000000009',
   '33333333-0000-0000-0000-000000000006',
   '22222222-0000-0000-0000-000000000004',
   'Integrate promo calendar into demand planning tool',
   'Connect marketing promo calendar to demand planning system. Map promo uplift factors per SKU category.',
   '11111111-0000-0000-0000-000000000005', '2026-06-30', 'medium', 'open'),

  ('44444444-0000-0000-0000-000000000010',
   '33333333-0000-0000-0000-000000000007',
   '22222222-0000-0000-0000-000000000002',
   'Qualify backup supplier for primary packaging',
   'Identify and qualify 1 backup supplier for primary packaging to reduce single-source dependency. Complete audit by June 30.',
   '11111111-0000-0000-0000-000000000003', '2026-06-08', 'high', 'open'),

  ('44444444-0000-0000-0000-000000000011',
   '33333333-0000-0000-0000-000000000008',
   '22222222-0000-0000-0000-000000000001',
   'Renegotiate contracted carrier capacity for Q3',
   'Initiate commercial discussion with 3 contracted carriers to increase guaranteed capacity for Q3. Target: 80% coverage vs current 65%.',
   '11111111-0000-0000-0000-000000000002', '2026-06-20', 'high', 'open'),

  ('44444444-0000-0000-0000-000000000012',
   '33333333-0000-0000-0000-000000000004',
   '22222222-0000-0000-0000-000000000001',
   'Weekly OTIF pulse check — every Monday 8am',
   'Establish weekly OTIF pulse meeting (30 min) with fulfillment, warehouse, and logistics leads every Monday. Track to action closure.',
   '11111111-0000-0000-0000-000000000004', '2026-06-10', 'high', 'in_progress')
on conflict (id) do nothing;

-- ─── KPI Records ───────────────────────────────────────────────
insert into kpi_records (issue_id, action_id, metric_name, metric_unit, value_before, value_after, measured_at, notes) values
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001',
   'Intercompany Lead Time', 'days', 4.5, 1.8, '2026-06-01', 'Measured over 2-week post-implementation period'),

  ('33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000007',
   'OTIF', '%', 87, 93, '2026-06-01', 'Partial improvement — actions still in progress'),

  ('33333333-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000008',
   'Marketplace SLA Compliance', '%', 88, 95, '2026-06-08', 'Escalation matrix implemented, SLA improved immediately'),

  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003',
   'Fill Rate', '%', 91, 96, '2026-06-13', 'Emergency stock landed June 13, fill rate recovered'),

  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000006',
   'Receiving Throughput', 'pallets/hr', 18, 24, '2026-06-10', 'After staggered arrival implementation'),

  ('33333333-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000009',
   'Forecast Accuracy', '%', 71, 78, '2026-06-01', 'Promo calendar partially integrated — ongoing improvement expected')
on conflict do nothing;

-- ─── Decisions ─────────────────────────────────────────────────
insert into decisions (meeting_id, description, owner_id, decided_at) values
  ('22222222-0000-0000-0000-000000000003',
   'Intercompany approval SLA set at same-day turnaround (by 5pm). Finance VP to be accountable. Escalation to cross-entity GM after 4 hours.',
   '11111111-0000-0000-0000-000000000001', '2026-06-07'),

  ('22222222-0000-0000-0000-000000000002',
   'Receiving dock to operate 2 shifts (6am–2pm, 2pm–10pm) effective immediately to clear backlog.',
   '11111111-0000-0000-0000-000000000001', '2026-06-09'),

  ('22222222-0000-0000-0000-000000000001',
   'OTIF target revised from 95% to 92% for June as recovery plan is implemented. Return to 95% target from July.',
   '11111111-0000-0000-0000-000000000007', '2026-06-10'),

  ('22222222-0000-0000-0000-000000000004',
   'Safety stock policy updated: minimum 14-day cover for Top 50 SKUs (previously 7 days). Effective from July reorder cycle.',
   '11111111-0000-0000-0000-000000000005', '2026-06-05'),

  ('22222222-0000-0000-0000-000000000005',
   'Marketplace fulfillment SLA breach will trigger daily escalation report to GM level if breach > 5% for 2 consecutive days.',
   '11111111-0000-0000-0000-000000000006', '2026-06-03'),

  ('22222222-0000-0000-0000-000000000001',
   'All action items from weekly SCM review must be updated in SCM Insight Hub within 24 hours of meeting.',
   '11111111-0000-0000-0000-000000000007', '2026-06-10')
on conflict do nothing;

-- ─── Risks ─────────────────────────────────────────────────────
insert into risks (meeting_id, title, description, impact, probability, mitigation_plan, owner_id, status) values
  ('22222222-0000-0000-0000-000000000002',
   'Warehouse capacity overflow — peak season',
   'Current warehouse at 88% capacity utilization. June–July peak season expected to push to 105%, causing overflow and throughput loss.',
   5, 4,
   'Identify 3PL overflow partner. Activate overflow WH within 2 weeks. Cap inbound receipts at 95% utilization threshold.',
   '11111111-0000-0000-0000-000000000001', 'open'),

  ('22222222-0000-0000-0000-000000000004',
   'Single-source supplier dependency — packaging',
   'Primary packaging supplier accounts for 90% of supply. Recent delivery failures signal financial stress. Risk of supply discontinuity.',
   5, 3,
   'Qualify 1 backup supplier by June 30. Increase safety stock for packaging to 30-day cover. Monthly supplier health check.',
   '11111111-0000-0000-0000-000000000003', 'open'),

  ('22222222-0000-0000-0000-000000000001',
   'IT system downtime — ERP outage impact on order processing',
   'ERP experienced 2 unplanned outages in May. Each 4-hour outage caused 200+ order processing delay. No offline backup currently.',
   4, 2,
   'Deploy offline order processing SOP. IT to implement failover mechanism by Q3. Monthly DR drill.',
   '11111111-0000-0000-0000-000000000005', 'open'),

  ('22222222-0000-0000-0000-000000000005',
   'Marketplace algorithm change — sudden ranking drop',
   'Marketplace platforms periodically change ranking algorithms. Ranking drop of >10 positions has historically caused 30% GMV decline in week 1.',
   3, 3,
   'Maintain content score >90% on all listings. Monitor daily ranking. Build multi-channel GMV buffer (15% from non-marketplace).',
   '11111111-0000-0000-0000-000000000006', 'open'),

  ('22222222-0000-0000-0000-000000000003',
   'Key personnel departure — SCM analyst team',
   'Two experienced SCM analysts at risk of attrition (market offers received). Knowledge concentration risk in intercompany and demand planning.',
   3, 2,
   'Retention package proposal to HR. Knowledge transfer sessions scheduled. Cross-train backup for each critical function.',
   '11111111-0000-0000-0000-000000000007', 'open'),

  ('22222222-0000-0000-0000-000000000004',
   'Demand spike — unplanned promotional activity',
   'Sales team history of launching promotions without advance notice. Last event caused 400% demand spike, leading to 3-day stockout.',
   4, 3,
   'Enforce 2-week advance notice SOP for promotions. Build promotional buffer stock policy. S&OP gate review for all promotions.',
   '11111111-0000-0000-0000-000000000005', 'open')
on conflict do nothing;
