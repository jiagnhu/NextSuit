export type SubscriberStatus = "active" | "unsubscribed";

export type SubscriberItem = {
  id: string;
  email: string;
  sourcePage: string | null;
  status: SubscriberStatus;
  createdAt: string;
};

export type SubscriberListParams = {
  page: number;
  pageSize: number;
  q?: string;
};

export type SubscriberListResult = {
  items: SubscriberItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
