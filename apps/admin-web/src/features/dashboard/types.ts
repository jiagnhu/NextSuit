export type DashboardOverview = {
  totalLeads: number;
  newLeads: number;
  totalContacts: number;
  totalSubscribers: number;
  publishedArticles: number;
  totalPageViews: number;
};

export type RecentLead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "new" | "qualified" | "won" | "lost";
  source: string | null;
  createdAt: string;
};

export type ContentPerformance = {
  days: number;
  since: string;
  totalViews: number;
  uniquePaths: number;
  topPaths: Array<{
    path: string;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    views: number;
  }>;
  topArticles: Array<{
    slug: string;
    title: string;
    path: string;
    views: number;
  }>;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
};
