import {
  DashboardOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { Avatar, Card, Col, Divider, Image, List, Row, Space, Tag, Typography } from "antd";
import { useMemo, type ReactNode } from "react";

import { useI18n } from "@/i18n/i18n-provider";
import { env, withAppBasePath } from "@/lib/env";

type ProjectCard = {
  key: string;
  title: string;
  subtitle: string;
  stack: string[];
  highlights: string[];
  businessValue: string;
};

type LocaleContent = {
  title: string;
  subtitle: string;
  profile: {
    name: string;
    role: string;
    summary: string;
    location: string;
    email: string;
    website: string;
    websiteLabel: string;
    upwork: string;
    upworkLabel: string;
    github: string;
    githubLabel: string;
    phone: string;
  };
  sectionProjects: string;
  sectionFlow: string;
  sectionDataFlow: string;
  flowCaption: string;
  dataFlowCaption: string;
  proofPointsTitle: string;
  proofPoints: string[];
  projects: ProjectCard[];
};

const contentByLocale: Record<"en" | "zh-CN", LocaleContent> = {
  en: {
    title: "Portfolio Blueprint Overview",
    subtitle:
      "This page explains how the 4-project suite works as one business-ready system for real client delivery.",
    profile: {
      name: "Alex Tang",
      role: "Senior Frontend Engineer | Full-Stack SaaS Architect",
      summary:
        "8+ years in Web SaaS and admin systems. Focused on scalable Next.js delivery, data-driven UI, API integration, and practical product architecture for startup and SMB teams.",
      location: "ShenZhen, China (UTC+8)",
      email: "tyk954903159@gmail.com",
      website: "https://tangyikai.top/",
      websiteLabel: "tangyikai.top",
      upwork: "https://www.upwork.com/freelancers/~0146027b6450268d97?mp_source=share",
      upworkLabel: "View Profile",
      github: "https://github.com/jiagnhu",
      githubLabel: "github.com/jiagnhu",
      phone: "+86 186-8209-5792"
    },
    sectionProjects: "4 Projects in This Suite",
    sectionFlow: "Delivery Workflow Diagram",
    sectionDataFlow: "Real Data Flow Diagram",
    flowCaption:
      "From inbound traffic to lead capture, content operation, and admin follow-up, this flow shows the full delivery lifecycle.",
    dataFlowCaption:
      "Both Next.js frontends and React admin consume one API layer and one PostgreSQL database with shared business entities.",
    proofPointsTitle: "Why This Earns Client Trust",
    proofPoints: [
      "One backend powering three frontend products with shared data models",
      "Server-side pagination, search, filtering, and CRUD instead of local mock logic",
      "Real lead/contact/subscriber pipelines visible from submission to admin view",
      "Internationalized admin experience for bilingual team delivery",
      "Production-friendly structure with deploy-ready separation"
    ],
    projects: [
      {
        key: "api",
        title: "Core API Service",
        subtitle: "Express + Prisma + PostgreSQL unified backend",
        stack: ["Node.js", "Express", "Prisma", "PostgreSQL", "JWT", "Swagger"],
        highlights: [
          "Organization-scoped data model",
          "Leads / contacts / subscribers / articles modules",
          "Dashboard metrics and content analytics endpoints",
          "Upload endpoint for article cover images"
        ],
        businessValue: "Shows backend ownership and real system design, not static frontend demos."
      },
      {
        key: "admin",
        title: "Admin Web",
        subtitle: "React operations console for growth teams",
        stack: ["React", "Vite", "React Router", "Ant Design", "React Query"],
        highlights: [
          "Leads, contacts, subscribers, articles management",
          "Server-driven tables with pagination and filters",
          "Article markdown editor + detail dialogs",
          "Bilingual UI (English / Chinese)"
        ],
        businessValue: "Shows execution on complex internal tools and real operations workflows."
      },
      {
        key: "marketing",
        title: "Marketing Web",
        subtitle: "Next.js lead generation website",
        stack: ["Next.js", "TypeScript", "Server Actions", "ISR/SSR", "REST API"],
        highlights: [
          "Contact and lead forms connected to API",
          "SEO-focused landing sections and service pages",
          "Multi-language content copy",
          "Conversion-oriented CTA and trust sections"
        ],
        businessValue: "Shows business-facing website execution with measurable lead capture flow."
      },
      {
        key: "blog",
        title: "Blog Web",
        subtitle: "Next.js content platform for inbound growth",
        stack: ["Next.js", "TypeScript", "App Router", "Markdown rendering", "API caching"],
        highlights: [
          "Article listing, topic filtering, and detail pages",
          "Tag/category search and pagination",
          "Quick topic access and non-jumping UX tuning",
          "Connected content and cover image rendering"
        ],
        businessValue: "Shows content operations capability beyond brochure-level frontend work."
      }
    ]
  },
  "zh-CN": {
    title: "作品集系统总览",
    subtitle: "本页面用于说明这 4 个项目如何组成一个可交付、可演示、可商业化的真实系统。",
    profile: {
      name: "Alex Tang",
      role: "高级前端工程师 | 全栈 SaaS 架构顾问",
      summary:
        "8 年以上 Web SaaS 与后台系统经验，专注 Next.js 落地、数据驱动界面、API 集成与可维护工程架构，服务初创团队与中小企业。",
      location: "中国深圳 (UTC+8)",
      email: "tyk954903159@gmail.com",
      website: "https://tangyikai.top/",
      websiteLabel: "tangyikai.top",
      upwork: "https://www.upwork.com/freelancers/~0146027b6450268d97?mp_source=share",
      upworkLabel: "查看主页",
      github: "https://github.com/jiagnhu",
      githubLabel: "github.com/jiagnhu",
      phone: "+86 186-8209-5792"
    },
    sectionProjects: "本套系统的 4 个项目",
    sectionFlow: "业务交付流程图",
    sectionDataFlow: "真实数据流转示意图",
    flowCaption: "从流量进入、线索收集、内容运营到后台跟进，覆盖完整业务闭环。",
    dataFlowCaption: "三个前端项目共用同一套 API 与 PostgreSQL 数据库，数据结构统一、链路可追踪。",
    proofPointsTitle: "为什么这套方案能提升客户信任",
    proofPoints: [
      "一个后端服务支撑三个前端应用，数据模型统一",
      "列表页使用服务端分页、搜索、筛选，不是本地假分页",
      "联系表单/线索/订阅全链路可在后台查看与追踪",
      "管理后台支持中英文切换，适合国际协作交付",
      "结构贴近生产项目，部署路径清晰"
    ],
    projects: [
      {
        key: "api",
        title: "Core API Service",
        subtitle: "基于 Express + Prisma + PostgreSQL 的统一后端",
        stack: ["Node.js", "Express", "Prisma", "PostgreSQL", "JWT", "Swagger"],
        highlights: [
          "组织级数据隔离与上下文处理",
          "线索/联系/订阅/文章等模块化接口",
          "仪表盘统计与内容表现数据接口",
          "文章封面图上传接口"
        ],
        businessValue: "体现你不仅会前端，也能设计并落地真实后端业务模型。"
      },
      {
        key: "admin",
        title: "Admin Web",
        subtitle: "增长与运营团队使用的 React 管理端",
        stack: ["React", "Vite", "React Router", "Ant Design", "React Query"],
        highlights: [
          "线索、联系、订阅、文章统一管理",
          "服务端分页列表 + 筛选 + 详情弹窗",
          "文章富文本（Markdown）编辑能力",
          "中英文界面切换"
        ],
        businessValue: "体现复杂后台系统能力和真实运营流程理解。"
      },
      {
        key: "marketing",
        title: "Marketing Web",
        subtitle: "用于获客转化的 Next.js 官网",
        stack: ["Next.js", "TypeScript", "Server Actions", "ISR/SSR", "REST API"],
        highlights: [
          "联系表单/线索提交直连 API",
          "SEO 导向的落地页结构",
          "中英文内容支持",
          "强调转化的 CTA 与信任模块"
        ],
        businessValue: "体现你能做业务结果导向的官网，而不是纯视觉页面。"
      },
      {
        key: "blog",
        title: "Blog Web",
        subtitle: "用于内容增长的 Next.js 博客平台",
        stack: ["Next.js", "TypeScript", "App Router", "Markdown 渲染", "API 缓存"],
        highlights: [
          "文章列表、分类标签、详情页联动",
          "搜索、筛选、分页读取真实接口",
          "Quick Topic 体验优化（切换不重置滚动）",
          "文章封面图在前台展示"
        ],
        businessValue: "体现内容平台建设能力与长期增长思维。"
      }
    ]
  }
};

const iconByProjectKey: Record<string, ReactNode> = {
  api: <GlobalOutlined style={{ fontSize: 18 }} />,
  admin: <DashboardOutlined style={{ fontSize: 18 }} />,
  marketing: <MailOutlined style={{ fontSize: 18 }} />,
  blog: <FileTextOutlined style={{ fontSize: 18 }} />
};

export const AboutPage = () => {
  const { locale } = useI18n();
  const content = contentByLocale[locale];
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const suiteBasePath = useMemo(() => {
    if (env.appBasePath === "/") {
      return "";
    }

    return env.appBasePath.endsWith("/admin")
      ? env.appBasePath.slice(0, -"/admin".length)
      : env.appBasePath;
  }, []);

  const projectAccessLinks = useMemo(() => {
    const buildUrl = (suffix: string) => {
      const normalizedSuffix = suffix ? (suffix.startsWith("/") ? suffix : `/${suffix}`) : "";
      const pathname = `${suiteBasePath}${normalizedSuffix}` || "/";
      return origin ? `${origin}${pathname}` : pathname;
    };

    const apiDocs = `${env.apiBaseUrl.replace(/\/+$/, "")}/docs`;

    return {
      api: apiDocs,
      marketing: buildUrl(""),
      admin: buildUrl("/admin"),
      blog: buildUrl("/blog")
    } as const;
  }, [origin, suiteBasePath]);

  const contactItems = useMemo(
    () => [
      {
        key: "email",
        icon: <MailOutlined />,
        label: "Email",
        value: (
          <Typography.Link
            className="about-contact-link"
            href={`mailto:${content.profile.email}`}
            title={content.profile.email}
          >
            {content.profile.email}
          </Typography.Link>
        )
      },
      {
        key: "phone",
        icon: <PhoneOutlined />,
        label: locale === "zh-CN" ? "电话" : "Phone",
        value: <Typography.Text>{content.profile.phone}</Typography.Text>
      },
      {
        key: "website",
        icon: <GlobalOutlined />,
        label: locale === "zh-CN" ? "官网" : "Website",
        value: (
          <Typography.Link
            className="about-contact-link"
            href={content.profile.website}
            target="_blank"
            rel="noreferrer"
            title={content.profile.website}
          >
            {content.profile.websiteLabel}
          </Typography.Link>
        )
      },
      {
        key: "upwork",
        icon: <LinkOutlined />,
        label: "Upwork",
        value: (
          <Typography.Link
            className="about-contact-link"
            href={content.profile.upwork}
            target="_blank"
            rel="noreferrer"
            title={content.profile.upwork}
          >
            {content.profile.upworkLabel}
          </Typography.Link>
        )
      },
      {
        key: "github",
        icon: <LinkOutlined />,
        label: "GitHub",
        value: (
          <Typography.Link
            className="about-contact-link"
            href={content.profile.github}
            target="_blank"
            rel="noreferrer"
            title={content.profile.github}
          >
            {content.profile.githubLabel}
          </Typography.Link>
        )
      }
    ],
    [
      content.profile.email,
      content.profile.github,
      content.profile.githubLabel,
      content.profile.phone,
      content.profile.upwork,
      content.profile.upworkLabel,
      content.profile.website,
      content.profile.websiteLabel,
      locale
    ]
  );

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card className="about-hero-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} lg={5} style={{ textAlign: "center" }}>
            <Avatar src={withAppBasePath("/about-avatar.svg")} size={120} />
          </Col>
          <Col xs={24} md={18} lg={19}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {content.profile.name}
              </Typography.Title>
              <Typography.Text strong>{content.profile.role}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 6 }}>{content.profile.summary}</Typography.Paragraph>
              <Typography.Text type="secondary">{content.profile.location}</Typography.Text>
              <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                {contactItems.map((item) => (
                  <Col key={item.key} xs={24} sm={12} xl={8}>
                    <div className="about-contact-item">
                      <Space size={6} style={{ width: "100%" }}>
                        {item.icon}
                        <Typography.Text strong>{item.label}</Typography.Text>
                      </Space>
                      <div className="about-contact-value">{item.value}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {content.title}
        </Typography.Title>
        <Typography.Paragraph type="secondary">{content.subtitle}</Typography.Paragraph>
        <Divider style={{ margin: "12px 0" }} />
        <Typography.Title level={5}>{content.proofPointsTitle}</Typography.Title>
        <List
          size="small"
          dataSource={content.proofPoints}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>

      <Card title={content.sectionProjects}>
        <Row gutter={[16, 16]}>
          {content.projects.map((project) => (
            <Col key={project.key} xs={24} md={12}>
              <Card size="small" className="about-project-card">
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space size={8}>
                    {iconByProjectKey[project.key]}
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {project.title}
                    </Typography.Title>
                  </Space>
                  <Typography.Text type="secondary">{project.subtitle}</Typography.Text>
                  <Space size={[6, 6]} wrap>
                    {project.stack.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </Space>
                  <List
                    size="small"
                    dataSource={project.highlights}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  />
                  {project.key in projectAccessLinks ? (
                    <div>
                      <Typography.Text strong>
                        {project.key === "api"
                          ? locale === "zh-CN"
                            ? "文档地址："
                            : "Docs URL: "
                          : locale === "zh-CN"
                            ? "访问地址："
                            : "Live URL: "}
                      </Typography.Text>
                      <Typography.Link
                        href={projectAccessLinks[project.key as keyof typeof projectAccessLinks]}
                        target="_blank"
                        rel="noreferrer"
                        style={{ wordBreak: "break-all" }}
                      >
                        {projectAccessLinks[project.key as keyof typeof projectAccessLinks]}
                      </Typography.Link>
                    </div>
                  ) : null}
                  <Typography.Text strong>{project.businessValue}</Typography.Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title={content.sectionFlow}>
        <Typography.Paragraph type="secondary">{content.flowCaption}</Typography.Paragraph>
        <Image
          src={withAppBasePath("/about-flow.svg")}
          alt="project workflow diagram"
          preview={false}
          style={{ width: "100%"}}
        />
      </Card>

      <Card title={content.sectionDataFlow}>
        <Typography.Paragraph type="secondary">{content.dataFlowCaption}</Typography.Paragraph>
        <Image
          src={withAppBasePath("/about-dataflow.svg")}
          alt="project data flow diagram"
          preview={false}
          style={{ width: "100%" }}
        />
      </Card>
    </Space>
  );
};
