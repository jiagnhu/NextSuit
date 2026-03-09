export type Locale = "en" | "zh-CN";

interface MessageTree {
  [key: string]: string | MessageTree;
}

type MessageVars = Record<string, string | number>;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_KEY = "nextsuit_marketing_locale";

export const localeOptions: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "中文" }
];

const messages: Record<Locale, MessageTree> = {
  en: {
    nav: {
      home: "Home",
      pricing: "Pricing",
      insights: "Insights",
      contact: "Contact"
    },
    footer: {
      line1: "NextSuit Growth Suite · Marketing Web",
      line2: "Built with Next.js App Router + real Node.js API data flow"
    },
    home: {
      heroKicker: "SaaS Product Studio",
      bookDemo: "Book Demo",
      contactTeam: "Contact Team",
      statLead: "Lead conversion uplift after redesign",
      statMvp: "Average MVP delivery cycle",
      statUptime: "Core API uptime target",
      feature1Title: "Design to Delivery",
      feature1Desc: "From UX strategy to frontend implementation with production deployment in mind.",
      feature2Title: "Real Data, Not Mock",
      feature2Desc: "Contact, subscription, and lead forms write directly into your CRM-ready backend.",
      feature3Title: "Composable Stack",
      feature3Desc: "Next.js frontend connected to a unified Node.js API for dashboard and content workflows.",
      demoTitle: "Book a Discovery Call",
      demoDesc: "Submit your project brief and budget range. This form writes into leads in real time.",
      newsletterTitle: "Join Newsletter",
      newsletterDesc: "Get release notes, architecture updates, and optimization tips. Stored in subscribers.",
      pricingKicker: "Pricing",
      pricingTitle: "Simple plans for growing teams",
      perMonth: "/month",
      talkToSales: "Talk to Sales",
      insightsKicker: "Insights",
      insightsTitle: "Latest published content from API",
      categoryFallback: "General",
      draft: "Draft",
      articleExcerptFallback: "Read the full article for detailed engineering notes.",
      openArticle: "Open Article",
      noArticlesTitle: "No published articles yet",
      noArticlesDesc: "Start API and seed data to render dynamic insight cards on this section."
    },
    contact: {
      kicker: "Contact",
      title: "Tell us about your project",
      desc: "This form writes into contacts table in the shared Node.js backend. Use it to demo real inbound workflow from website to admin dashboard.",
      formTitle: "Send Us a Message",
      expectationTitle: "Expected Response",
      item1: "Initial response within 24 hours",
      item2: "Scope clarification and milestones",
      item3: "Technical proposal with stack recommendation",
      item4: "Optional fixed-price or hourly delivery model"
    },
    form: {
      name: "Name",
      email: "Email",
      workEmail: "Work Email",
      company: "Company",
      subject: "Subject",
      message: "Message",
      notes: "Notes",
      projectType: "Project Type",
      budget: "Budget",
      selectOne: "Select one",
      selectRange: "Select range",
      submitContact: "Send Message",
      submitLead: "Book Discovery Call",
      submitSubscribe: "Subscribe",
      pending: "Submitting...",
      pendingHint: "Sending your request. A consultant will review it shortly.",
      placeholderName: "Alex Johnson",
      placeholderEmail: "you@company.com",
      placeholderCompany: "Acme Inc",
      placeholderSubject: "What do you need help with?",
      placeholderMessage: "Project goals, timeline, and budget context",
      placeholderNotes: "Brief scope and timeline"
    },
    action: {
      invalidEmail: "Please use a business email so we can send a tailored proposal.",
      subscriberSuccess: "You are in. Expect weekly growth playbooks and priority updates.",
      subscriberFailed: "Signup did not complete. Retry now and we will keep your slot.",
      contactRequired: "Please share your name, work email, and project details for an accurate reply.",
      contactSuccess: "Great, we received your brief. A consultant will reply within 24 hours.",
      contactFailed: "Submission failed. Please retry so we can secure your consultation slot.",
      leadRequired: "Please provide your name and work email to reserve a discovery call.",
      leadSuccess: "Discovery request received. We will contact you shortly to confirm scope.",
      leadFailed: "Request failed this time. Retry now and we will prioritize your booking."
    }
  },
  "zh-CN": {
    nav: {
      home: "首页",
      pricing: "价格",
      insights: "洞察",
      contact: "联系"
    },
    footer: {
      line1: "NextSuit Growth Suite · 营销站",
      line2: "基于 Next.js App Router，接入真实 Node.js API 数据流"
    },
    home: {
      heroKicker: "SaaS 产品工作室",
      bookDemo: "预约演示",
      contactTeam: "联系团队",
      statLead: "改版后线索转化提升",
      statMvp: "平均 MVP 交付周期",
      statUptime: "核心 API 可用性目标",
      feature1Title: "从设计到交付",
      feature1Desc: "从 UX 策略到前端落地，全程面向生产部署。",
      feature2Title: "真实数据，不是 Mock",
      feature2Desc: "联系、订阅、线索表单会直接写入后端，形成可追踪流程。",
      feature3Title: "可组合技术栈",
      feature3Desc: "Next.js 前端连接统一 Node.js API，覆盖后台与内容业务流。",
      demoTitle: "预约需求沟通",
      demoDesc: "提交项目范围与预算区间，此表单会实时写入 leads。",
      newsletterTitle: "订阅更新",
      newsletterDesc: "获取发布日志、架构更新和优化建议，数据写入 subscribers。",
      pricingKicker: "价格",
      pricingTitle: "为成长团队准备的简洁方案",
      perMonth: "/月",
      talkToSales: "联系销售",
      insightsKicker: "洞察",
      insightsTitle: "来自 API 的最新已发布内容",
      categoryFallback: "通用",
      draft: "草稿",
      articleExcerptFallback: "查看完整文章以获取详细工程实践。",
      openArticle: "查看文章",
      noArticlesTitle: "暂无已发布文章",
      noArticlesDesc: "启动 API 并执行 seed 后，这里会展示真实内容卡片。"
    },
    contact: {
      kicker: "联系",
      title: "告诉我们你的项目需求",
      desc: "该表单会写入共享 Node.js 后端的 contacts 表，用于演示从官网到后台的真实流转。",
      formTitle: "发送消息",
      expectationTitle: "响应方式",
      item1: "24 小时内首次响应",
      item2: "澄清范围并拆分里程碑",
      item3: "提供技术方案与栈建议",
      item4: "支持固定价或时薪合作"
    },
    form: {
      name: "姓名",
      email: "邮箱",
      workEmail: "工作邮箱",
      company: "公司",
      subject: "主题",
      message: "留言",
      notes: "备注",
      projectType: "项目类型",
      budget: "预算",
      selectOne: "请选择",
      selectRange: "请选择预算区间",
      submitContact: "发送消息",
      submitLead: "预约沟通",
      submitSubscribe: "订阅",
      pending: "提交中...",
      pendingHint: "正在提交，你的需求会立刻分配给顾问跟进。",
      placeholderName: "Alex Johnson",
      placeholderEmail: "you@company.com",
      placeholderCompany: "Acme Inc",
      placeholderSubject: "你希望我们帮助什么？",
      placeholderMessage: "请描述目标、时间与预算背景",
      placeholderNotes: "简要描述范围与时间计划"
    },
    action: {
      invalidEmail: "请填写工作邮箱，我们将发送更匹配的方案建议。",
      subscriberSuccess: "订阅成功，你将优先收到增长打法与上线建议。",
      subscriberFailed: "订阅未成功，请重试，我们会为你保留更新通知。",
      contactRequired: "请填写姓名、工作邮箱和需求描述，方便顾问给出准确建议。",
      contactSuccess: "我们已收到你的需求，顾问将在 24 小时内与你联系。",
      contactFailed: "提交失败，请重试，方便我们为你保留本周沟通档期。",
      leadRequired: "请填写姓名和工作邮箱，以便确认你的咨询档期。",
      leadSuccess: "预约已收到，我们会尽快联系你确认范围与时间。",
      leadFailed: "预约提交失败，请重试，我们会优先安排你的需求。"
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
