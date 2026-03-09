import Link from "next/link";

import { buildPathWithQuery } from "@/lib/url";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | undefined>;
  labels: {
    aria: string;
    previous: string;
    next: string;
  };
};

const createWindow = (page: number, totalPages: number) => {
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const values: number[] = [];

  for (let current = windowStart; current <= windowEnd; current += 1) {
    values.push(current);
  }

  return values;
};

export const Pagination = ({ page, totalPages, basePath, query, labels }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = createWindow(page, totalPages);

  return (
    <nav className="pagination" aria-label={labels.aria}>
      <Link
        href={buildPathWithQuery(basePath, {
          ...query,
          page: page - 1
        })}
        scroll={false}
        className={`page-btn ${page <= 1 ? "page-btn-disabled" : ""}`}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
      >
        {labels.previous}
      </Link>

      <div className="page-numbers">
        {pages.map((value) => (
          <Link
            key={value}
            href={buildPathWithQuery(basePath, {
              ...query,
              page: value
            })}
            scroll={false}
            className={`page-btn ${value === page ? "page-btn-active" : ""}`}
            aria-current={value === page ? "page" : undefined}
          >
            {value}
          </Link>
        ))}
      </div>

      <Link
        href={buildPathWithQuery(basePath, {
          ...query,
          page: page + 1
        })}
        scroll={false}
        className={`page-btn ${page >= totalPages ? "page-btn-disabled" : ""}`}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
      >
        {labels.next}
      </Link>
    </nav>
  );
};
