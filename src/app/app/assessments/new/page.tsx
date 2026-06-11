import Link from "next/link";
import { NewAssessmentForm } from "@/components/workbench/NewAssessmentForm";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewAssessmentPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/assessments"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to assessments
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">New assessment</h1>
        <p className="text-sm text-muted mt-1.5 max-w-xl">
          Start the RightSense 48-Hour Enterprise Intelligence, Compliance
          &amp; Standards Diagnostic. Capture the company and leadership
          targets here, then attach operating, ISO, technical standards,
          statutory, supplier, prequalification, and AI governance evidence.
        </p>
      </div>
      <Card className="p-6">
        <NewAssessmentForm />
      </Card>
    </div>
  );
}
