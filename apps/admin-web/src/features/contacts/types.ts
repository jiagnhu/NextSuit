export type ContactStatus = "new" | "in_progress" | "resolved" | "spam";

export type ContactItem = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string | null;
  message: string;
  sourcePage: string | null;
  status: ContactStatus;
  createdAt: string;
};

export type ContactListParams = {
  page: number;
  pageSize: number;
  q?: string;
  status?: ContactStatus;
};

export type ContactListResult = {
  items: ContactItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
