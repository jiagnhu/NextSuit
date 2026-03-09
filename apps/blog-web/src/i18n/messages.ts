export type Locale = "en" | "zh-CN";

interface MessageTree {
  [key: string]: string | MessageTree;
}

type MessageVars = Record<string, string | number>;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_KEY = "nextsuit_blog_locale";

export const localeOptions: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "中文" }
];

const messages: Record<Locale, MessageTree> = {
  en: {
    layout: {
      subtitle: "Real data. Real content flow.",
      articles: "Articles",
      openCms: "Open CMS",
      footer: "Built for Upwork portfolio showcase. Blog data is served by NextSuit Core API.",
      language: "Language"
    },
    home: {
      eyebrow: "Portfolio-grade blog web app",
      indexedPosts: "published posts indexed",
      categories: "categories",
      tags: "tags",
      emptyTitle: "No published posts matched these filters",
      emptyDesc: "Try a broader keyword or clear category/tag constraints.",
      quickTopic: "Quick Topic Access"
    },
    filters: {
      title: "Search & Filter",
      reset: "Reset Filters",
      keyword: "Keyword",
      keywordPlaceholder: "Search title, excerpt or content",
      category: "Category",
      allCategories: "All Categories",
      tag: "Tag",
      allTags: "All Tags",
      apply: "Apply",
      applying: "Applying..."
    },
    articleCard: {
      uncategorized: "Uncategorized",
      noExcerpt: "No excerpt available yet.",
      minRead: "min read"
    },
    pagination: {
      aria: "Pagination",
      previous: "Previous",
      next: "Next"
    },
    subscribe: {
      title: "Weekly Delivery Notes",
      desc: "Get practical SaaS growth and frontend architecture insights based on real client projects.",
      button: "Subscribe",
      pending: "Subscribing...",
      invalidEmail: "Please use a valid business email so we can send practical playbooks.",
      success: "You are subscribed. Expect weekly growth insights and launch checklists.",
      failed: "Subscription failed. Retry now and we will keep your update slot."
    },
    articleDetail: {
      back: "Back to all posts",
      excerptFallback: "Detailed implementation notes and delivery lessons.",
      minRead: "min read"
    },
    notFound: {
      title: "Article not found",
      desc: "The requested post is unavailable or not published for the current organization.",
      back: "Go Back to Insights"
    }
  },
  "zh-CN": {
    layout: {
      subtitle: "真实数据，真实内容流转。",
      articles: "文章",
      openCms: "打开 CMS",
      footer: "用于 Upwork 作品集展示。博客数据由 NextSuit Core API 提供。",
      language: "语言"
    },
    home: {
      eyebrow: "作品集级博客站点",
      indexedPosts: "篇已索引发布文章",
      categories: "个分类",
      tags: "个标签",
      emptyTitle: "没有匹配当前筛选条件的已发布文章",
      emptyDesc: "请尝试更宽泛的关键词或清空分类/标签筛选。",
      quickTopic: "快速主题入口"
    },
    filters: {
      title: "搜索与筛选",
      reset: "重置筛选",
      keyword: "关键词",
      keywordPlaceholder: "搜索标题、摘要或正文",
      category: "分类",
      allCategories: "全部分类",
      tag: "标签",
      allTags: "全部标签",
      apply: "应用",
      applying: "应用中..."
    },
    articleCard: {
      uncategorized: "未分类",
      noExcerpt: "暂无摘要。",
      minRead: "分钟阅读"
    },
    pagination: {
      aria: "分页",
      previous: "上一页",
      next: "下一页"
    },
    subscribe: {
      title: "每周交付笔记",
      desc: "获取基于真实客户项目的 SaaS 增长和前端架构实践。",
      button: "订阅",
      pending: "订阅中...",
      invalidEmail: "请填写有效工作邮箱，便于接收可落地的增长清单。",
      success: "订阅成功，你将优先收到增长洞察与上线检查清单。",
      failed: "订阅失败，请立即重试，我们会为你保留更新名额。"
    },
    articleDetail: {
      back: "返回文章列表",
      excerptFallback: "这里是更详细的实现思路与交付经验。",
      minRead: "分钟阅读"
    },
    notFound: {
      title: "文章不存在",
      desc: "该文章未发布或在当前组织下不可访问。",
      back: "返回洞察首页"
    }
  }
};

const pick = (locale: Locale, key: string): string | undefined => {
  const segments = key.split(".");
  let cursor: unknown = messages[locale];

  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object" || !(segment in cursor)) {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return typeof cursor === "string" ? cursor : undefined;
};

const format = (template: string, vars?: MessageVars) => {
  if (!vars) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, token: string) => {
    const value = vars[token];
    return value === undefined ? `{${token}}` : String(value);
  });
};

export const resolveLocale = (input?: string | null): Locale => (input === "zh-CN" ? "zh-CN" : DEFAULT_LOCALE);

export const t = (locale: Locale, key: string, vars?: MessageVars) => {
  const message = pick(locale, key) ?? pick(DEFAULT_LOCALE, key) ?? key;
  return format(message, vars);
};
