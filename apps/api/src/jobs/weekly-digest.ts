import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const WEEKLY_DIGEST_SETTING_KEY = "newsletter.weeklyDigest.lastSentWeekStart";
const TICK_INTERVAL_MS = 60 * 1000;

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7
};

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: keyof typeof WEEKDAY_INDEX;
  isoDate: string;
};

type DigestWindow = {
  localWeekday: keyof typeof WEEKDAY_INDEX;
  localHour: number;
  previousWeekStartIso: string;
  previousWeekEndIso: string;
  rangeStart: Date;
  rangeEnd: Date;
};

type DigestArticle = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
};

type WeeklyDigestResult = {
  orgId: string;
  orgSlug: string;
  status: "sent" | "skipped" | "error";
  reason?: string;
  recipients: number;
  sent: number;
  failed: number;
  weekStartIso: string;
  weekEndIso: string;
};

type WeeklyDigestDispatchOptions = {
  force?: boolean;
  dryRun?: boolean;
  recipientOverride?: string[];
  now?: Date;
};

const formatParts = (date: Date, timeZone: string): LocalDateParts => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const weekday = parts.weekday as keyof typeof WEEKDAY_INDEX;
  if (!weekday || !WEEKDAY_INDEX[weekday]) {
    throw new Error(`Unsupported weekday for timezone "${timeZone}": ${parts.weekday ?? "unknown"}`);
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  return {
    year,
    month,
    day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday,
    isoDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  };
};

const toIsoDate = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const addDaysToIsoDate = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
};

const resolveTimeZone = (candidate?: string | null) => {
  const fallback = env.WEEKLY_DIGEST_TIMEZONE;
  const timeZone = candidate?.trim() || fallback;

  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return fallback;
  }
};

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string) => {
  const parts = formatParts(date, timeZone);
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return Math.round((asIfUtc - date.getTime()) / 60000);
};

const zonedMidnightToUtc = (isoDate: string, timeZone: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const localMidnightAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);

  let utcTimestamp = localMidnightAsUtc;
  for (let i = 0; i < 2; i += 1) {
    const offset = getTimeZoneOffsetMinutes(new Date(utcTimestamp), timeZone);
    utcTimestamp = localMidnightAsUtc - offset * 60_000;
  }

  return new Date(utcTimestamp);
};

const buildDigestWindow = (now: Date, timeZone: string): DigestWindow => {
  const local = formatParts(now, timeZone);
  const daysSinceMonday = WEEKDAY_INDEX[local.weekday] - 1;
  const currentWeekStartIso = addDaysToIsoDate(local.isoDate, -daysSinceMonday);

  const previousWeekStartIso = addDaysToIsoDate(currentWeekStartIso, -7);
  const previousWeekEndIso = addDaysToIsoDate(currentWeekStartIso, -1);

  return {
    localWeekday: local.weekday,
    localHour: local.hour,
    previousWeekStartIso,
    previousWeekEndIso,
    rangeStart: zonedMidnightToUtc(previousWeekStartIso, timeZone),
    rangeEnd: zonedMidnightToUtc(currentWeekStartIso, timeZone)
  };
};

const normalizeRecipient = (email: string) => email.trim().toLowerCase();

const pickRecipients = (input: string[]) => {
  const unique = new Set<string>();
  for (const raw of input) {
    const normalized = normalizeRecipient(raw);
    if (!normalized) {
      continue;
    }
    unique.add(normalized);
  }
  return Array.from(unique);
};

const escapeHtml = (raw: string) =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const trimUrlRightSlash = (value: string) => value.replace(/\/+$/, "");

const buildArticleUrl = (slug: string) =>
  `${trimUrlRightSlash(env.BLOG_BASE_URL)}/articles/${encodeURIComponent(slug)}`;

const buildDigestSubject = (orgName: string, weekStartIso: string, weekEndIso: string) =>
  `[${orgName}] Weekly Delivery Notes · ${weekStartIso} ~ ${weekEndIso}`;

const buildDigestHtml = (
  orgName: string,
  weekStartIso: string,
  weekEndIso: string,
  articles: DigestArticle[]
) => {
  const title = escapeHtml(orgName);
  const range = `${weekStartIso} ~ ${weekEndIso}`;

  if (!articles.length) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Weekly Delivery Notes</h2>
        <p style="margin: 0 0 12px;">${title} · ${range}</p>
        <p style="margin: 0 0 12px;">No new published articles were released last week.</p>
        <p style="margin: 0;">
          You can still check the latest posts here:
          <a href="${trimUrlRightSlash(env.BLOG_BASE_URL)}" target="_blank" rel="noreferrer">
            ${escapeHtml(trimUrlRightSlash(env.BLOG_BASE_URL))}
          </a>
        </p>
      </div>
    `;
  }

  const items = articles
    .map((article) => {
      const headline = escapeHtml(article.title);
      const excerpt = escapeHtml(
        article.excerpt?.trim() || "Detailed implementation notes and delivery lessons."
      );
      const href = buildArticleUrl(article.slug);

      return `
        <li style="margin-bottom: 14px;">
          <a href="${href}" target="_blank" rel="noreferrer" style="font-weight: 600; color: #0f172a; text-decoration: none;">
            ${headline}
          </a>
          <p style="margin: 4px 0 0; color: #4b5563;">${excerpt}</p>
        </li>
      `;
    })
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Weekly Delivery Notes</h2>
      <p style="margin: 0 0 12px;">${title} · ${range}</p>
      <p style="margin: 0 0 14px;">Here are the published notes from last week:</p>
      <ul style="padding-left: 18px; margin: 0;">
        ${items}
      </ul>
      <p style="margin: 16px 0 0;">
        Browse all posts:
        <a href="${trimUrlRightSlash(env.BLOG_BASE_URL)}" target="_blank" rel="noreferrer">
          ${escapeHtml(trimUrlRightSlash(env.BLOG_BASE_URL))}
        </a>
      </p>
    </div>
  `;
};

const buildDigestText = (
  orgName: string,
  weekStartIso: string,
  weekEndIso: string,
  articles: DigestArticle[]
) => {
  const header = `${orgName} Weekly Delivery Notes (${weekStartIso} ~ ${weekEndIso})`;
  if (!articles.length) {
    return `${header}\n\nNo new published articles were released last week.\n${trimUrlRightSlash(env.BLOG_BASE_URL)}`;
  }

  const body = articles
    .map((article, index) => {
      const excerpt = article.excerpt?.trim() || "Detailed implementation notes and delivery lessons.";
      return `${index + 1}. ${article.title}\n${buildArticleUrl(article.slug)}\n${excerpt}`;
    })
    .join("\n\n");

  return `${header}\n\n${body}`;
};

const sendResendEmail = async (to: string, subject: string, html: string, text: string) => {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [to],
      reply_to: env.RESEND_REPLY_TO || undefined,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend API ${response.status}: ${detail}`);
  }
};

const readLastSentWeek = async (orgId: string) => {
  const setting = await prisma.setting.findUnique({
    where: {
      orgId_key: {
        orgId,
        key: WEEKLY_DIGEST_SETTING_KEY
      }
    },
    select: {
      valueJson: true
    }
  });

  if (!setting?.valueJson || typeof setting.valueJson !== "object" || Array.isArray(setting.valueJson)) {
    return null;
  }

  const weekStartIso = (setting.valueJson as Record<string, unknown>).weekStartIso;
  return typeof weekStartIso === "string" ? weekStartIso : null;
};

const saveLastSentWeek = async (
  orgId: string,
  weekStartIso: string,
  weekEndIso: string,
  sent: number,
  failed: number
) => {
  await prisma.setting.upsert({
    where: {
      orgId_key: {
        orgId,
        key: WEEKLY_DIGEST_SETTING_KEY
      }
    },
    update: {
      isPublic: false,
      valueJson: {
        weekStartIso,
        weekEndIso,
        sent,
        failed,
        sentAt: new Date().toISOString()
      }
    },
    create: {
      orgId,
      key: WEEKLY_DIGEST_SETTING_KEY,
      isPublic: false,
      valueJson: {
        weekStartIso,
        weekEndIso,
        sent,
        failed,
        sentAt: new Date().toISOString()
      }
    }
  });
};

const dispatchWeeklyDigestForOrg = async (
  org: { id: string; slug: string; name: string },
  options: WeeklyDigestDispatchOptions
): Promise<WeeklyDigestResult> => {
  const now = options.now ?? new Date();
  const timeZone = resolveTimeZone(env.WEEKLY_DIGEST_TIMEZONE);
  const window = buildDigestWindow(now, timeZone);
  const force = options.force ?? false;
  const dryRun = options.dryRun ?? false;

  if (!force) {
    if (window.localWeekday !== "Mon") {
      return {
        orgId: org.id,
        orgSlug: org.slug,
        status: "skipped",
        reason: "not-monday",
        recipients: 0,
        sent: 0,
        failed: 0,
        weekStartIso: window.previousWeekStartIso,
        weekEndIso: window.previousWeekEndIso
      };
    }

    if (window.localHour < env.WEEKLY_DIGEST_SEND_HOUR) {
      return {
        orgId: org.id,
        orgSlug: org.slug,
        status: "skipped",
        reason: "before-send-hour",
        recipients: 0,
        sent: 0,
        failed: 0,
        weekStartIso: window.previousWeekStartIso,
        weekEndIso: window.previousWeekEndIso
      };
    }

    const lastSentWeek = await readLastSentWeek(org.id);
    if (lastSentWeek === window.previousWeekStartIso) {
      return {
        orgId: org.id,
        orgSlug: org.slug,
        status: "skipped",
        reason: "already-sent",
        recipients: 0,
        sent: 0,
        failed: 0,
        weekStartIso: window.previousWeekStartIso,
        weekEndIso: window.previousWeekEndIso
      };
    }
  }

  const subscribers = await prisma.subscriber.findMany({
    where: {
      orgId: org.id,
      status: "active"
    },
    select: {
      email: true
    }
  });

  const recipients = options.recipientOverride?.length
    ? pickRecipients(options.recipientOverride)
    : pickRecipients([
        ...subscribers.map((item) => item.email),
        ...(env.WEEKLY_DIGEST_TEST_EMAIL ? [env.WEEKLY_DIGEST_TEST_EMAIL] : [])
      ]);

  if (!recipients.length) {
    return {
      orgId: org.id,
      orgSlug: org.slug,
      status: "skipped",
      reason: "no-recipient",
      recipients: 0,
      sent: 0,
      failed: 0,
      weekStartIso: window.previousWeekStartIso,
      weekEndIso: window.previousWeekEndIso
    };
  }

  const articles = await prisma.article.findMany({
    where: {
      orgId: org.id,
      status: "published",
      publishedAt: {
        gte: window.rangeStart,
        lt: window.rangeEnd
      }
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true
    },
    orderBy: {
      publishedAt: "desc"
    },
    take: 20
  });

  const subject = buildDigestSubject(org.name, window.previousWeekStartIso, window.previousWeekEndIso);
  const html = buildDigestHtml(org.name, window.previousWeekStartIso, window.previousWeekEndIso, articles);
  const text = buildDigestText(org.name, window.previousWeekStartIso, window.previousWeekEndIso, articles);

  if (dryRun) {
    return {
      orgId: org.id,
      orgSlug: org.slug,
      status: "sent",
      reason: "dry-run",
      recipients: recipients.length,
      sent: recipients.length,
      failed: 0,
      weekStartIso: window.previousWeekStartIso,
      weekEndIso: window.previousWeekEndIso
    };
  }

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sendResendEmail(recipient, subject, html, text);
      sent += 1;
    } catch (error) {
      failed += 1;
      // eslint-disable-next-line no-console
      console.error(`[weekly-digest] send failed for ${recipient}`, error);
    }
  }

  if (!force && sent > 0) {
    await saveLastSentWeek(org.id, window.previousWeekStartIso, window.previousWeekEndIso, sent, failed);
  }

  if (!sent) {
    return {
      orgId: org.id,
      orgSlug: org.slug,
      status: "error",
      reason: "all-send-failed",
      recipients: recipients.length,
      sent,
      failed,
      weekStartIso: window.previousWeekStartIso,
      weekEndIso: window.previousWeekEndIso
    };
  }

  return {
    orgId: org.id,
    orgSlug: org.slug,
    status: "sent",
    recipients: recipients.length,
    sent,
    failed,
    weekStartIso: window.previousWeekStartIso,
    weekEndIso: window.previousWeekEndIso
  };
};

export const dispatchWeeklyDigestForAllOrganizations = async (
  options: WeeklyDigestDispatchOptions = {}
) => {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      slug: true,
      name: true
    }
  });

  const results: WeeklyDigestResult[] = [];
  for (const org of organizations) {
    const result = await dispatchWeeklyDigestForOrg(org, options);
    results.push(result);
  }

  return {
    results,
    totalSent: results.reduce((sum, item) => sum + item.sent, 0),
    totalFailed: results.reduce((sum, item) => sum + item.failed, 0)
  };
};

export const startWeeklyDigestScheduler = () => {
  if (!env.WEEKLY_DIGEST_ENABLED) {
    // eslint-disable-next-line no-console
    console.log("[weekly-digest] scheduler disabled by WEEKLY_DIGEST_ENABLED=false");
    return () => undefined;
  }

  if (!env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("[weekly-digest] scheduler disabled because RESEND_API_KEY is missing");
    return () => undefined;
  }

  let running = false;
  const runTick = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      const summary = await dispatchWeeklyDigestForAllOrganizations();
      if (summary.totalSent > 0 || summary.totalFailed > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `[weekly-digest] sent=${summary.totalSent}, failed=${summary.totalFailed}, orgs=${summary.results.length}`
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[weekly-digest] scheduler tick failed", error);
    } finally {
      running = false;
    }
  };

  void runTick();
  const timer = setInterval(() => {
    void runTick();
  }, TICK_INTERVAL_MS);

  return () => {
    clearInterval(timer);
  };
};
