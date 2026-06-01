"use client";

import { create } from "zustand";
import type { Assessment } from "@/types/assessment";
import { seedAssessments } from "@/lib/data-seed";

interface AssessmentState {
  assessments: Assessment[];
  getAssessment: (id: string) => Assessment | undefined;
  updateAssessment: (id: string, data: Partial<Assessment>) => void;
  createAssessment: (assessment: Assessment) => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: seedAssessments,

  getAssessment: (id: string) => {
    return get().assessments.find((a) => a.id === id);
  },

  updateAssessment: (id: string, data: Partial<Assessment>) => {
    set((state) => ({
      assessments: state.assessments.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },

  createAssessment: (assessment: Assessment) => {
    set((state) => ({
      assessments: [...state.assessments, assessment],
    }));
  },
}));
