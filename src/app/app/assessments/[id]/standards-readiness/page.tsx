import { StandardsReadinessView } from "@/components/readiness/ReadinessViews";
import { loadAssessmentReadiness } from "@/lib/readiness/server";

export default async function StandardsReadinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { readiness } = await loadAssessmentReadiness(id);
  return <StandardsReadinessView readiness={readiness} />;
}

