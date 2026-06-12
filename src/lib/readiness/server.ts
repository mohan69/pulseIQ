import { notFound } from "next/navigation";
import { getAssessment, getSources } from "@/lib/assessment/store";
import { getAssessmentReadiness } from "@/lib/readiness";

export async function loadAssessmentReadiness(assessmentId: string) {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) notFound();
  const sources = await getSources(assessmentId);
  return {
    assessment,
    sources,
    readiness: getAssessmentReadiness(assessment, sources),
  };
}

