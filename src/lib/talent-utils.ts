import type { Certification, EmployeeProfile, PerformanceReview } from "@/types/talent";

export function getTenureYears(joinedOn: string) {
  const joined = new Date(joinedOn);
  const now = new Date("2026-05-12T00:00:00+09:00");
  const diff = now.getTime() - joined.getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(0, Math.floor(years * 10) / 10);
}

export function ratingTone(rating: string) {
  if (rating.startsWith("A")) {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }

  if (rating.startsWith("B")) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function certificationProgress(certifications: Certification[]) {
  if (certifications.length === 0) {
    return 0;
  }

  const active = certifications.filter((certification) => certification.status === "active").length;
  const expiring = certifications.filter((certification) => certification.status === "expiring").length;

  return Math.round(((active + expiring * 0.6) / certifications.length) * 100);
}

export function performanceTrend(reviews: PerformanceReview[]) {
  return [...reviews]
    .reverse()
    .map((review) => ({ period: review.period, score: review.score, rating: review.rating }));
}

export function nextAction(employee: EmployeeProfile) {
  const goal = [...employee.goals].sort((a, b) => a.progress - b.progress)[0];

  if (goal && goal.progress < 60) {
    return `次アクション: ${goal.title}`;
  }

  if (employee.nextInterviewOn) {
    return `次回面談: ${employee.nextInterviewOn}`;
  }

  return "次アクション: 面談日を設定";
}
