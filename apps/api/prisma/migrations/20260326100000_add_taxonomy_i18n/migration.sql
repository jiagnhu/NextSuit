ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Category" ADD COLUMN "nameZh" TEXT;

ALTER TABLE "Tag" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Tag" ADD COLUMN "nameZh" TEXT;

UPDATE "Category"
SET
  "nameEn" = COALESCE(NULLIF("nameEn", ''), "name"),
  "nameZh" = COALESCE(NULLIF("nameZh", ''), "name");

UPDATE "Category" SET "nameZh" = '工程' WHERE "slug" = 'engineering';
UPDATE "Category" SET "nameZh" = '增长' WHERE "slug" = 'growth';

UPDATE "Tag"
SET
  "nameEn" = COALESCE(NULLIF("nameEn", ''), "name"),
  "nameZh" = COALESCE(NULLIF("nameZh", ''), "name");

UPDATE "Tag" SET "nameZh" = '营销' WHERE "slug" = 'marketing';
UPDATE "Tag" SET "nameZh" = '架构' WHERE "slug" = 'architecture';
UPDATE "Tag" SET "nameZh" = '仪表盘' WHERE "slug" = 'dashboard';

ALTER TABLE "Category" ALTER COLUMN "nameEn" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "nameZh" SET NOT NULL;

ALTER TABLE "Tag" ALTER COLUMN "nameEn" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "nameZh" SET NOT NULL;
