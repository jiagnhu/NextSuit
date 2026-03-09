"use client";

import { FormEvent, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useBlogI18n } from "@/i18n/provider";
import type { CategoryItem, TagItem } from "@/lib/api-types";
import { buildPathWithQuery } from "@/lib/url";

type FiltersPanelProps = {
  search?: string;
  category?: string;
  tag?: string;
  categories: CategoryItem[];
  tags: TagItem[];
};

export const FiltersPanel = ({ search, category, tag, categories, tags }: FiltersPanelProps) => {
  const { translate: t } = useBlogI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get("search") ?? "").trim();
    const nextCategory = String(formData.get("category") ?? "").trim();
    const nextTag = String(formData.get("tag") ?? "").trim();

    const href = buildPathWithQuery(pathname || "/", {
      search: nextSearch || undefined,
      category: nextCategory || undefined,
      tag: nextTag || undefined,
      page: 1
    });

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  return (
    <section className="filter-panel reveal-up">
      <div className="filter-panel-head">
        <h3>{t("filters.title")}</h3>
        <Link href="/" className="inline-link" scroll={false}>
          {t("filters.reset")}
        </Link>
      </div>

      <form action="/" method="GET" className="filter-form" onSubmit={handleSubmit}>
        <label>
          <span>{t("filters.keyword")}</span>
          <input
            type="search"
            name="search"
            placeholder={t("filters.keywordPlaceholder")}
            defaultValue={search ?? ""}
          />
        </label>

        <label>
          <span>{t("filters.category")}</span>
          <select name="category" defaultValue={category ?? ""}>
            <option value="">{t("filters.allCategories")}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t("filters.tag")}</span>
          <select name="tag" defaultValue={tag ?? ""}>
            <option value="">{t("filters.allTags")}</option>
            {tags.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="primary-btn" disabled={isPending}>
          {isPending ? t("filters.applying") : t("filters.apply")}
        </button>
      </form>
    </section>
  );
};
