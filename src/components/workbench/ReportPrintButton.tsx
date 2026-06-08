"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportPrintedAction } from "@/app/app/actions";

export function ReportPrintButton({ assessmentId }: { assessmentId: string }) {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await reportPrintedAction(assessmentId);
        window.print();
      }}
      className="px-4 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print / save as PDF
    </Button>
  );
}
