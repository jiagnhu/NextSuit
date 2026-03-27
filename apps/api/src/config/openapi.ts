import { env } from "./env.js";

const normalizeBasePath = (value: string | undefined) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const serverUrl = (() => {
  const basePath = normalizeBasePath(env.PUBLIC_BASE_PATH);

  if (env.PUBLIC_BASE_URL) {
    const configured = trimTrailingSlash(env.PUBLIC_BASE_URL);
    return `${configured}${basePath}${env.API_PREFIX}`;
  }

  return `http://localhost:${env.PORT}${env.API_PREFIX}`;
})();

const successResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ApiSuccess"
      }
    }
  }
});

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ApiError"
      }
    }
  }
});

const baseOpenApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "NextSuit Core API",
    version: "0.2.0",
    description: "统一后端服务（管理后台、营销站、博客平台）/ Unified backend for admin, marketing and blog apps."
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: "Health", description: "健康检查接口" },
    { name: "Auth", description: "登录、登出、当前用户信息" },
    { name: "Dashboard", description: "仪表盘统计与内容表现数据" },
    { name: "Leads", description: "线索收集与线索管理" },
    { name: "Contacts", description: "联系表单提交与后台处理" },
    { name: "Subscribers", description: "订阅邮箱管理" },
    { name: "Articles", description: "文章 CRUD、发布与查询" },
    { name: "Categories", description: "文章分类管理" },
    { name: "Tags", description: "文章标签管理" },
    { name: "Settings", description: "系统配置与公开配置" },
    { name: "Uploads", description: "文件上传（文章封面）" },
    { name: "Page Views", description: "页面访问埋点上报" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: env.COOKIE_NAME
      },
      orgSlugHeader: {
        type: "apiKey",
        in: "header",
        name: "x-org-slug"
      }
    },
    parameters: {
      OrgSlugHeader: {
        name: "x-org-slug",
        in: "header",
        required: true,
        schema: { type: "string", example: "nextsuit-demo" },
        description: "组织标识（多租户上下文），示例：nextsuit-demo。"
      },
      Page: {
        name: "page",
        in: "query",
        description: "页码（从 1 开始）。",
        schema: { type: "integer", minimum: 1, default: 1 }
      },
      PageSize: {
        name: "pageSize",
        in: "query",
        description: "每页条数。",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }
      },
      Search: {
        name: "search",
        in: "query",
        description: "关键字搜索。",
        schema: { type: "string" }
      },
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        description: "资源 ID（UUID）。",
        schema: { type: "string", format: "uuid" }
      },
      SlugParam: {
        name: "slug",
        in: "path",
        required: true,
        description: "资源 slug。",
        schema: { type: "string" }
      },
      SettingKeyParam: {
        name: "key",
        in: "path",
        required: true,
        description: "配置键名。",
        schema: { type: "string" }
      }
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        description: "统一成功响应结构。",
        properties: {
          success: { type: "boolean", example: true, description: "是否成功。" },
          data: { type: "object", nullable: true, description: "业务数据。" },
          meta: { $ref: "#/components/schemas/PaginationMeta", nullable: true, description: "分页元信息。" }
        }
      },
      ApiError: {
        type: "object",
        description: "统一错误响应结构。",
        properties: {
          success: { type: "boolean", example: false, description: "是否成功。" },
          error: {
            type: "object",
            properties: {
              message: { type: "string", description: "错误消息。" },
              code: { type: "string", description: "错误码。" },
              details: { type: "object", nullable: true, description: "错误详情（可选）。" }
            }
          }
        }
      },
      PaginationMeta: {
        type: "object",
        description: "分页结果元信息。",
        properties: {
          page: { type: "integer", example: 1, description: "当前页。" },
          pageSize: { type: "integer", example: 10, description: "每页条数。" },
          total: { type: "integer", example: 87, description: "总条数。" },
          totalPages: { type: "integer", example: 9, description: "总页数。" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        }
      },
      LeadCreateRequest: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          company: { type: "string", nullable: true },
          source: { type: "string", nullable: true },
          notes: { type: "string", nullable: true }
        }
      },
      ContactCreateRequest: {
        type: "object",
        required: ["name", "email", "message"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          company: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          message: { type: "string" },
          sourcePage: { type: "string", nullable: true },
          honey: { type: "string", nullable: true, description: "Honeypot field, should be empty." }
        }
      },
      SubscriberCreateRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
          sourcePage: { type: "string", nullable: true }
        }
      },
      ArticleCreateRequest: {
        type: "object",
        required: ["title", "slug", "contentMd"],
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          excerpt: { type: "string", nullable: true, maxLength: 5000 },
          contentMd: { type: "string", minLength: 20, maxLength: 5000 },
          coverImage: { type: "string", nullable: true },
          status: { type: "string", enum: ["draft", "published", "archived"], nullable: true },
          categoryId: { type: "string", format: "uuid", nullable: true },
          tagIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            nullable: true
          },
          seoTitle: { type: "string", nullable: true },
          seoDescription: { type: "string", nullable: true }
        }
      },
      ArticleUpdateRequest: {
        allOf: [{ $ref: "#/components/schemas/ArticleCreateRequest" }]
      },
      PublishArticleRequest: {
        type: "object",
        required: ["publish"],
        properties: {
          publish: { type: "boolean" }
        }
      },
      StatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string" },
          notes: { type: "string", nullable: true }
        }
      },
      CategoryCreateRequest: {
        type: "object",
        required: ["nameEn", "nameZh", "slug"],
        properties: {
          nameEn: { type: "string" },
          nameZh: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true }
        }
      },
      TagCreateRequest: {
        type: "object",
        required: ["nameEn", "nameZh", "slug"],
        properties: {
          nameEn: { type: "string" },
          nameZh: { type: "string" },
          slug: { type: "string" }
        }
      },
      SettingPatchRequest: {
        type: "object",
        required: ["valueJson"],
        properties: {
          valueJson: { type: "object" },
          isPublic: { type: "boolean", nullable: true }
        }
      },
      LeadActivityCreateRequest: {
        type: "object",
        required: ["actionType"],
        properties: {
          actionType: { type: "string" },
          note: { type: "string", nullable: true }
        }
      },
      PageViewCreateRequest: {
        type: "object",
        required: ["path"],
        properties: {
          path: { type: "string" },
          referrer: { type: "string", nullable: true },
          source: { type: "string", nullable: true },
          articleId: { type: "string", format: "uuid", nullable: true },
          articleSlug: { type: "string", nullable: true },
          userAgent: { type: "string", nullable: true }
        }
      }
    }
  },
  security: [{ orgSlugHeader: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        responses: {
          200: successResponse("Healthy"),
          503: successResponse("Degraded")
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and set session cookie",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Login success"),
          401: errorResponse("Invalid credentials")
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear session cookie",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        responses: {
          200: successResponse("Logout success")
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        responses: {
          200: successResponse("Current profile"),
          401: errorResponse("Unauthorized")
        }
      }
    },
    "/dashboard/overview": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard aggregate metrics",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        responses: {
          200: successResponse("Overview metrics")
        }
      }
    },
    "/dashboard/recent-leads": {
      get: {
        tags: ["Dashboard"],
        summary: "Get recent leads",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 50 } }],
        responses: {
          200: successResponse("Recent leads list")
        }
      }
    },
    "/dashboard/content-performance": {
      get: {
        tags: ["Dashboard"],
        summary: "Get article/page-view performance",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ name: "days", in: "query", schema: { type: "integer", default: 14, minimum: 1 } }],
        responses: {
          200: successResponse("Content performance")
        }
      }
    },
    "/leads": {
      post: {
        tags: ["Leads"],
        summary: "Create a lead (public form)",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LeadCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Lead created"),
          400: errorResponse("Validation error")
        }
      },
      get: {
        tags: ["Leads"],
        summary: "List leads (admin)",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PageSize" },
          { $ref: "#/components/parameters/Search" },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: successResponse("Lead list with pagination")
        }
      }
    },
    "/leads/{id}": {
      get: {
        tags: ["Leads"],
        summary: "Get lead detail",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: successResponse("Lead detail"),
          404: errorResponse("Lead not found")
        }
      }
    },
    "/leads/{id}/status": {
      patch: {
        tags: ["Leads"],
        summary: "Update lead status",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Lead status updated"),
          404: errorResponse("Lead not found")
        }
      }
    },
    "/leads/{id}/activities": {
      post: {
        tags: ["Leads"],
        summary: "Create lead activity",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LeadActivityCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Lead activity created")
        }
      }
    },
    "/contacts": {
      post: {
        tags: ["Contacts"],
        summary: "Submit contact form (public)",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Contact created"),
          400: errorResponse("Invalid submission")
        }
      },
      get: {
        tags: ["Contacts"],
        summary: "List contacts (admin)",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PageSize" },
          { $ref: "#/components/parameters/Search" },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: successResponse("Contact list")
        }
      }
    },
    "/contacts/{id}/status": {
      patch: {
        tags: ["Contacts"],
        summary: "Update contact status",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Contact status updated")
        }
      }
    },
    "/subscribers": {
      post: {
        tags: ["Subscribers"],
        summary: "Subscribe email (public)",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubscriberCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Subscribed")
        }
      },
      get: {
        tags: ["Subscribers"],
        summary: "List subscribers (admin)",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PageSize" },
          { $ref: "#/components/parameters/Search" },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: successResponse("Subscriber list")
        }
      }
    },
    "/subscribers/{id}/status": {
      patch: {
        tags: ["Subscribers"],
        summary: "Update subscriber status",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Subscriber status updated")
        }
      }
    },
    "/articles": {
      get: {
        tags: ["Articles"],
        summary: "List public articles",
        parameters: [
          { $ref: "#/components/parameters/OrgSlugHeader" },
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PageSize" },
          { $ref: "#/components/parameters/Search" },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "tag", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: successResponse("Public article list")
        }
      },
      post: {
        tags: ["Articles"],
        summary: "Create article",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArticleCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Article created")
        }
      }
    },
    "/articles/admin": {
      get: {
        tags: ["Articles"],
        summary: "List admin articles",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PageSize" },
          { $ref: "#/components/parameters/Search" },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: successResponse("Admin article list")
        }
      }
    },
    "/articles/admin/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Get article detail for admin",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: successResponse("Article detail"),
          404: errorResponse("Article not found")
        }
      }
    },
    "/articles/{slug}": {
      get: {
        tags: ["Articles"],
        summary: "Get public article detail by slug",
        parameters: [
          { $ref: "#/components/parameters/OrgSlugHeader" },
          { $ref: "#/components/parameters/SlugParam" }
        ],
        responses: {
          200: successResponse("Public article detail"),
          404: errorResponse("Article not found")
        }
      }
    },
    "/articles/{id}": {
      patch: {
        tags: ["Articles"],
        summary: "Update article",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArticleUpdateRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Article updated"),
          404: errorResponse("Article not found")
        }
      },
      delete: {
        tags: ["Articles"],
        summary: "Delete article",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: successResponse("Article deleted"),
          404: errorResponse("Article not found")
        }
      }
    },
    "/articles/{id}/publish": {
      patch: {
        tags: ["Articles"],
        summary: "Publish/unpublish article",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PublishArticleRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Article publish status updated")
        }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        responses: {
          200: successResponse("Category list")
        }
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Category created")
        }
      }
    },
    "/categories/{id}": {
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: successResponse("Category deleted")
        }
      }
    },
    "/tags": {
      get: {
        tags: ["Tags"],
        summary: "List tags",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        responses: {
          200: successResponse("Tag list")
        }
      },
      post: {
        tags: ["Tags"],
        summary: "Create tag",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TagCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Tag created")
        }
      }
    },
    "/tags/{id}": {
      delete: {
        tags: ["Tags"],
        summary: "Delete tag",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: successResponse("Tag deleted")
        }
      }
    },
    "/settings/public": {
      get: {
        tags: ["Settings"],
        summary: "Get public settings",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        responses: {
          200: successResponse("Public settings")
        }
      }
    },
    "/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get all settings",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        responses: {
          200: successResponse("All settings")
        }
      }
    },
    "/settings/{key}": {
      patch: {
        tags: ["Settings"],
        summary: "Create or update setting by key",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/SettingKeyParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SettingPatchRequest" }
            }
          }
        },
        responses: {
          200: successResponse("Setting updated")
        }
      }
    },
    "/uploads/images": {
      post: {
        tags: ["Uploads"],
        summary: "Upload article cover image",
        security: [{ cookieAuth: [] }, { orgSlugHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          201: successResponse("Image uploaded"),
          400: errorResponse("Invalid file")
        }
      }
    },
    "/page-views": {
      post: {
        tags: ["Page Views"],
        summary: "Track page view",
        parameters: [{ $ref: "#/components/parameters/OrgSlugHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PageViewCreateRequest" }
            }
          }
        },
        responses: {
          201: successResponse("Page view tracked")
        }
      }
    }
  }
};

type HttpMethod = "get" | "post" | "patch" | "put" | "delete";
type OperationItem = {
  summary?: string;
  description?: string;
};

const zhSummaryByOperation: Record<string, string> = {
  "GET /health": "健康检查",
  "POST /auth/login": "登录并写入会话 Cookie",
  "POST /auth/logout": "退出登录并清除会话",
  "GET /auth/me": "获取当前登录用户信息",
  "GET /dashboard/overview": "获取仪表盘汇总数据",
  "GET /dashboard/recent-leads": "获取最近线索",
  "GET /dashboard/content-performance": "获取内容表现统计",
  "POST /leads": "提交线索（公开表单）",
  "GET /leads": "分页查询线索（后台）",
  "GET /leads/{id}": "获取线索详情",
  "PATCH /leads/{id}/status": "更新线索状态",
  "POST /leads/{id}/activities": "新增线索跟进记录",
  "POST /contacts": "提交联系表单（公开）",
  "GET /contacts": "分页查询联系记录（后台）",
  "PATCH /contacts/{id}/status": "更新联系记录状态",
  "POST /subscribers": "订阅邮箱（公开）",
  "GET /subscribers": "分页查询订阅用户（后台）",
  "PATCH /subscribers/{id}/status": "更新订阅状态",
  "GET /articles": "获取公开文章列表",
  "POST /articles": "创建文章",
  "GET /articles/admin": "后台文章列表",
  "GET /articles/admin/{id}": "后台获取文章详情",
  "GET /articles/{slug}": "按 slug 获取文章详情（公开）",
  "PATCH /articles/{id}": "更新文章",
  "DELETE /articles/{id}": "删除文章",
  "PATCH /articles/{id}/publish": "发布/取消发布文章",
  "GET /categories": "获取分类列表",
  "POST /categories": "创建分类",
  "DELETE /categories/{id}": "删除分类",
  "GET /tags": "获取标签列表",
  "POST /tags": "创建标签",
  "DELETE /tags/{id}": "删除标签",
  "GET /settings/public": "获取公开配置",
  "GET /settings": "获取全部配置",
  "PATCH /settings/{key}": "按 key 更新配置",
  "POST /uploads/images": "上传文章封面图",
  "POST /page-views": "上报页面访问埋点"
};

const withChineseAnnotations = (spec: typeof baseOpenApiSpec) => {
  const paths = spec.paths as Record<string, Partial<Record<HttpMethod, OperationItem>>>;
  const methods: HttpMethod[] = ["get", "post", "patch", "put", "delete"];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      const key = `${method.toUpperCase()} ${path}`;
      const zhSummary = zhSummaryByOperation[key];

      if (!zhSummary) {
        continue;
      }

      const enSummary = operation.summary?.trim();
      operation.summary = enSummary ? `${zhSummary} / ${enSummary}` : zhSummary;
      operation.description = zhSummary;
    }
  }

  return spec;
};

export const openApiSpec = withChineseAnnotations(baseOpenApiSpec);
