import type { Locale } from "@/i18n/messages";

import type { CategoryItem } from "./types";

type TaxonomyItem = Pick<CategoryItem, "name" | "nameEn" | "nameZh" | "slug">;

export const getLocalizedTaxonomyName = (item: TaxonomyItem, locale: Locale) => {
  if (locale === "zh-CN") {
    return item.nameZh?.trim() || item.name?.trim() || item.nameEn?.trim() || item.slug;
  }

  return item.nameEn?.trim() || item.name?.trim() || item.nameZh?.trim() || item.slug;
};
