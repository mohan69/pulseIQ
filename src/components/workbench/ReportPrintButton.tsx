"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportPrintButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="px-4 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print / save as PDF
    </Button>
  );
}
