/**
 * Trust score calculation utilities
 * Bayesian core + behavior-based adjustments for users and authorities.
 *
 * All public functions return scores on a 0–100 scale and are pure (no DB access).
 */

const MIN_SCORE = 0;
const MAX_SCORE = 100;

function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(score)));
}

/**
 * Core Bayesian-adjusted feedback score (0–100 scale).
 *
 * adjustedRating = (μ * k + r̄ * n) / (k + n)
 * baseScore = (adjustedRating / 5) * 100
 */
export interface FeedbackTrustInput {
  userAverageRating: number; // 0–5
  globalAverageRating: number; // 0–5 (μ)
  ratingCount: number; // n
  priorCount?: number; // k (default 10)
}

export function calculateBaseTrustScoreFromFeedback({
  userAverageRating,
  globalAverageRating,
  ratingCount,
  priorCount = 10,
}: FeedbackTrustInput): number {
  const n = Math.max(0, ratingCount);
  const k = Math.max(0, priorCount);

  // If there is absolutely no data anywhere, fall back to neutral 50.
  if (n === 0 && k === 0) {
    return 50;
  }

  const mu = Math.min(5, Math.max(0, globalAverageRating || 0));
  const rBar = Math.min(5, Math.max(0, userAverageRating || 0));

  const adjustedRating = (mu * k + rBar * n) / (k + n);
  const baseScore = (adjustedRating / 5) * 100;

  return clampScore(baseScore);
}

/**
 * Citizen trust score based on:
 * - baseScore: Bayesian feedback-based score (0–100)
 * - totalComplaints: number of complaints submitted by the citizen
 * - lastActivityDaysAgo: days since last relevant activity (optional)
 *
 * Uses small bonuses so that feedback remains the primary driver.
 */
export interface CitizenTrustFactors {
  baseScore: number; // 0–100
  totalComplaints: number;
  maxSubmissions?: number; // Normalization cap for submissions (default 20)
  lastActivityDaysAgo?: number | null;
}

export function calculateCitizenTrustScore(factors: CitizenTrustFactors): number {
  const {
    baseScore,
    totalComplaints,
    maxSubmissions = 20,
    lastActivityDaysAgo,
  } = factors;

  // Activity: more submissions (up to maxSubmissions) give a small boost
  const submissions = Math.max(0, totalComplaints);
  const maxSubs = Math.max(1, maxSubmissions);
  const S = Math.min(1, submissions / maxSubs); // [0,1]

  // Recency: recent activity gives a small boost
  let R = 0.5; // Neutral default
  if (typeof lastActivityDaysAgo === 'number' && lastActivityDaysAgo >= 0) {
    const tau = 90; // decay horizon in days
    R = Math.exp(-lastActivityDaysAgo / tau); // (0,1]
  }

  // Small behavior adjustments (max ~ +10)
  const bonus = 5 * S + 5 * R;

  const score = baseScore + bonus;
  return clampScore(score);
}

/**
 * Authority trust score based on:
 * - baseScore: Bayesian feedback-based score (0–100)
 * - assignedComplaints: total complaints assigned
 * - resolvedComplaints: how many were resolved
 * - escalatedComplaints: how many were escalated
 * - avgResponseHours: average response/resolve time in hours (optional)
 */
export interface AuthorityTrustFactors {
  baseScore: number; // 0–100
  assignedComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
  avgResponseHours?: number | null;
}

export function calculateAuthorityTrustScore(factors: AuthorityTrustFactors): number {
  const {
    baseScore,
    assignedComplaints,
    resolvedComplaints,
    escalatedComplaints,
    avgResponseHours,
  } = factors;

  const assigned = Math.max(0, assignedComplaints);
  const resolved = Math.max(0, resolvedComplaints);
  const escalated = Math.max(0, escalatedComplaints);

  const resolutionRate = assigned > 0 ? resolved / assigned : 0; // [0,1]
  const escalationRate = assigned > 0 ? escalated / assigned : 0; // [0,1]

  // Response speed: faster average response → closer to 1
  let responseSpeed = 0.5; // Neutral default
  if (typeof avgResponseHours === 'number' && avgResponseHours >= 0) {
    const tauResp = 48; // 2 days characteristic time
    responseSpeed = Math.exp(-avgResponseHours / tauResp); // (0,1]
  }

  // Bonuses and penalties (max adjustments are modest so feedback still dominates)
  const bonus = 10 * resolutionRate + 5 * responseSpeed;
  const penalty = 15 * escalationRate;

  const score = baseScore + bonus - penalty;
  return clampScore(score);
}

/**
 * Get trust score color for UI
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get trust score badge label
 */
export function getTrustScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}
