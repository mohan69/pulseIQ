export const DEMO_GROWTH_ORG_ID = "demo-rightsense-org";
export const DEMO_GROWTH_USER_ID = "demo-admin-user";

export type GrowthRequestContext = {
  orgId: string;
  userId: string;
  role: "admin";
};

export async function getCurrentGrowthContext(): Promise<GrowthRequestContext> {
  return {
    orgId: DEMO_GROWTH_ORG_ID,
    userId: DEMO_GROWTH_USER_ID,
    role: "admin",
  };
}

export function canManageGrowthWorkspace(context: GrowthRequestContext) {
  return context.role === "admin";
}
