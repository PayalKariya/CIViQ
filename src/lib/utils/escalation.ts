/**
 * Escalation logic for complaints
 * Auto-escalate complaints that haven't been resolved within SLA
 */

export interface EscalationRule {
  priority: 'low' | 'medium' | 'high' | 'critical';
  slaHours: number;
}

export const ESCALATION_RULES: EscalationRule[] = [
  { priority: 'critical', slaHours: 24 }, // 1 day
  { priority: 'high', slaHours: 72 }, // 3 days
  { priority: 'medium', slaHours: 168 }, // 7 days
  { priority: 'low', slaHours: 336 }, // 14 days
];

export function shouldEscalate(
  complaintCreatedAt: string,
  priority: string,
  currentStatus: string
): boolean {
  // Don't escalate if already resolved, rejected, or escalated
  if (['resolved', 'rejected', 'escalated'].includes(currentStatus)) {
    return false;
  }

  const rule = ESCALATION_RULES.find((r) => r.priority === priority);
  if (!rule) return false;

  const createdAt = new Date(complaintCreatedAt);
  const now = new Date();
  const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursPassed > rule.slaHours;
}

export function getEscalationStatus(
  complaintCreatedAt: string,
  priority: string,
  currentStatus: string
): {
  shouldEscalate: boolean;
  hoursRemaining: number;
  percentageComplete: number;
} {
  const rule = ESCALATION_RULES.find((r) => r.priority === priority);
  if (!rule) {
    return { shouldEscalate: false, hoursRemaining: 0, percentageComplete: 0 };
  }

  const createdAt = new Date(complaintCreatedAt);
  const now = new Date();
  const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, rule.slaHours - hoursPassed);
  const percentageComplete = Math.min(100, (hoursPassed / rule.slaHours) * 100);

  return {
    shouldEscalate: shouldEscalate(complaintCreatedAt, priority, currentStatus),
    hoursRemaining: Math.round(hoursRemaining),
    percentageComplete: Math.round(percentageComplete),
  };
}
