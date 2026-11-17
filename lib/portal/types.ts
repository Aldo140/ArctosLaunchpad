export type PortalStatus = "planning" | "in-progress" | "review" | "live" | "paused";
export type BillingStatus = "not-started" | "trialing" | "active" | "past-due" | "paused" | "cancelled";

export interface PortalMilestone {
  id: string;
  title: string;
  detail: string;
  status: "done" | "current" | "upcoming";
  date: string | null;
}

export interface PortalDocument {
  id: string;
  name: string;
  kind: "contract" | "invoice" | "proposal" | "brief" | "report" | "other";
  url: string;
  updatedAt: number;
  size: string | null;
}

export interface PortalActivity {
  id: string;
  at: number;
  title: string;
  detail: string;
  kind: "project" | "billing" | "document" | "message";
}

export interface ClientAccount {
  id: string;
  email: string;
  clientName: string;
  company: string;
  firstName: string;
  projectName: string;
  projectSummary: string;
  status: PortalStatus;
  services: string[];
  leadContact: { name: string; email: string };
  nextStep: { title: string; detail: string; due: string | null } | null;
  milestones: PortalMilestone[];
  documents: PortalDocument[];
  activity: PortalActivity[];
  billing: {
    status: BillingStatus;
    currency: "cad" | "usd";
    monthlyAmount: number;
    planName: string;
    nextPaymentAt: number | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    cancelAtPeriodEnd: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export interface PortalSnapshot {
  account: Omit<ClientAccount, "billing"> & {
    billing: Omit<ClientAccount["billing"], "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & { canStart: boolean; canManage: boolean };
  };
}
