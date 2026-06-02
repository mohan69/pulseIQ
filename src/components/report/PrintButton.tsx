"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton({ 
  size = "sm" as const,
  variant = "default" as const,
  className = "",
  children
}: { 
  size?: "default" | "icon" | "sm" | "lg"; 
  variant?: "default" | "outline" | "ghost" | "destructive" | "success"; 
  className?: string; 
  children?: React.ReactNode 
}) {
  return (
    <Button 
      size={size}
      variant={variant}
      onClick={() => window.print()}
      className={className}
    >
      <Printer className="h-4 w-4 mr-1" />
      {children ?? "Print / Save as PDF"}
    </Button>
  );
}