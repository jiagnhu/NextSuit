export type LeadStatus = "new" | "qualified" | "won" | "lost";

export type LeadItem = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budgetRange: string | null;
  interest: string | null;
  source: string | null;
  status: LeadStatus;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadDetail = LeadItem & {
  notes: string | null;
  activities: {
    id: string;
    actionType: string;
    note: string | null;
    createdAt: string;
    actorUser: {
      id: string;
      name: string;
      email: string;
    };
  }[];
};

export type LeadListParams = {
  page: number;
  pageSize: number;
  status?: LeadStatus;
  q?: string;
  source?: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LeadListResult = {
  items: LeadItem[];
  meta: PaginationMeta;
};
