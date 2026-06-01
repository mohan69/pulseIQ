import { NextResponse } from "next/server";
import { createAIEngine } from "@/lib/ai-engine";
import { seedAssessments } from "@/lib/data-seed";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assessment = seedAssessments.find((a) => a.id === id);

  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 }
    );
  }

  const engine = createAIEngine();

  const opportunities = await engine.generateOpportunities(
    assessment.enterpriseProfile,
    assessment.departments
  );

  const [futureModel, cockpit, roadmap] = await Promise.all([
    engine.generateFutureModel(assessment.enterpriseProfile, assessment.departments),
    engine.generateCockpit(assessment.enterpriseProfile, opportunities),
    engine.generateRoadmap(opportunities, assessment.enterpriseProfile),
  ]);

  return NextResponse.json({
    opportunities,
    futureModel,
    cockpit,
    roadmap,
  });
}
