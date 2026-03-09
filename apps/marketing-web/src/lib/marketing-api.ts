import { apiRequest } from "./api-client";

export type PublicSetting = {
  key: string;
  valueJson: unknown;
  updatedAt: string;
};

export type MarketingHero = {
  title: string;
  subtitle: string;
};

export type PricingPlan = {
  name: string;
  price: number;
};

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  category: { id: string; name: string; slug: string } | null;
  articleTags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

const defaultHero: MarketingHero = {
  title: "Build Better SaaS Experiences",
  subtitle: "Unified growth suite powered by Next.js and Node.js"
};

const defaultPlans: PricingPlan[] = [
  { name: "Starter", price: 49 },
  { name: "Growth", price: 149 },
  { name: "Scale", price: 299 }
];

const readSettingValue = <T>(settings: PublicSetting[], key: string, fallback: T): T => {
  const found = settings.find((item) => item.key === key);

  if (!found || found.valueJson == null) {
    return fallback;
  }

  return found.valueJson as T;
};

export const getMarketingHomeData = async () => {
  try {
    const [settingsRes, articlesRes] = await Promise.all([
      apiRequest<PublicSetting[]>("/settings/public", {
        method: "GET",
        revalidate: 120
      }),
      apiRequest<ArticleSummary[]>("/articles", {
        method: "GET",
        query: { page: 1, pageSize: 3 },
        revalidate: 120
      })
    ]);

    const heroValue = readSettingValue<Partial<MarketingHero>>(settingsRes.data, "marketing.home.hero", {});
    const pricingValue = readSettingValue<{ plans?: PricingPlan[] }>(settingsRes.data, "marketing.pricing", {});

    return {
      hero: {
        title: heroValue.title ?? defaultHero.title,
        subtitle: heroValue.subtitle ?? defaultHero.subtitle
      },
      plans: pricingValue.plans?.length ? pricingValue.plans : defaultPlans,
      featuredArticles: articlesRes.data
    };
  } catch {
    return {
      hero: defaultHero,
      plans: defaultPlans,
      featuredArticles: []
    };
  }
};
