import { SupplierEcosystemView } from "@/components/readiness/ReadinessViews";
import { loadAssessmentReadiness } from "@/lib/readiness/server";

export default async function SupplierEcosystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { readiness } = await loadAssessmentReadiness(id);
  return <SupplierEcosystemView readiness={readiness} />;
}

