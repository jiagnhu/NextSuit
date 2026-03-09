import type { TablePaginationConfig } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { buildQueryString, toPositiveInt } from "@/lib/search-params";

type PaginationMetaLike = {
  page: number;
  pageSize: number;
  total: number;
};

type UseListPageOptions = {
  defaultPage?: number;
  defaultPageSize?: number;
  pageKey?: string;
  pageSizeKey?: string;
};

export const useListPage = (options: UseListPageOptions = {}) => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    pageKey = "page",
    pageSizeKey = "pageSize"
  } = options;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const page = toPositiveInt(searchParams.get(pageKey), defaultPage);
  const pageSize = toPositiveInt(searchParams.get(pageSizeKey), defaultPageSize);

  const updateParams = (updates: Record<string, string | number | undefined | null>) => {
    const query = buildQueryString(searchParams, updates);
    navigate(
      {
        pathname: location.pathname,
        search: query ? `?${query}` : ""
      },
      { replace: true }
    );
  };

  const onTableChange = (pagination: TablePaginationConfig) => {
    updateParams({
      [pageKey]: pagination.current ?? page,
      [pageSizeKey]: pagination.pageSize ?? pageSize
    });
  };

  const buildPagination = (meta?: PaginationMetaLike): TablePaginationConfig => ({
    current: meta?.page ?? page,
    pageSize: meta?.pageSize ?? pageSize,
    total: meta?.total ?? 0,
    showSizeChanger: true
  });

  return {
    searchParams,
    page,
    pageSize,
    updateParams,
    onTableChange,
    buildPagination
  };
};
