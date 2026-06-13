import {
  isBharatDemoAssessment,
  isPublicDomainAssessment,
} from "./presentation";
import type { Assessment } from "./types";

const FEATURED_PUBLIC_DOMAIN_NAMES = [
  "DECON Technologies Public-Domain Sample Diagnostic",
  "IMI CCI / IMI Critical Engineering India Public-Domain Sample Diagnostic",
  "Bray Controls India / Bray India Public-Domain Sample Diagnostic",
  "Microfinish Group / Microfinish Valves / Microfinish Pumps Public-Domain Sample Diagnostic",
] as const;

export type AssessmentCardPresentation = {
  kind: "public-domain" | "internal-demo" | "standard";
  label?: string;
  description?: string;
};

export function orderAssessmentsForDisplay(
  assessments: Assessment[],
): Assessment[] {
  const featuredOrder = new Map<string, number>(
    FEATURED_PUBLIC_DOMAIN_NAMES.map((name, index) => [name, index]),
  );
  return [...assessments].sort((left, right) => {
    const leftPriority = featuredOrder.get(left.companyName);
    const rightPriority = featuredOrder.get(right.companyName);
    if (leftPriority !== undefined || rightPriority !== undefined) {
      if (leftPriority === undefined) return 1;
      if (rightPriority === undefined) return -1;
      return leftPriority - rightPriority;
    }
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
}

export function featuredDashboardAssessments(
  assessments: Assessment[],
): Assessment[] {
  return orderAssessmentsForDisplay(assessments).slice(0, 4);
}

export function dashboardAssessmentSummary(assessments: Assessment[]): {
  visibleCount: number;
  featured: Assessment[];
} {
  return {
    visibleCount: assessments.length,
    featured: featuredDashboardAssessments(assessments),
  };
}

export function assessmentCardPresentation(
  assessment: Assessment,
): AssessmentCardPresentation {
  if (isPublicDomainAssessment(assessment)) {
    return {
      kind: "public-domain",
      label: "Public-domain sample",
      description:
        "Financial baseline requires internal validation. No internal financial data used.",
    };
  }
  if (isBharatDemoAssessment(assessment)) {
    return {
      kind: "internal-demo",
      label: "Seeded internal demo",
      description: "Financial targets are seeded demo assumptions.",
    };
  }
  return { kind: "standard" };
}
