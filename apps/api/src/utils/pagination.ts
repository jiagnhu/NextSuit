export type PaginationInput = {
  page?: number | string;
  pageSize?: number | string;
};

export const getPagination = (input: PaginationInput, maxSize = 100) => {
  const page = Math.max(1, Number(input.page) || 1);
  const pageSize = Math.min(maxSize, Math.max(1, Number(input.pageSize) || 20));
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    take: pageSize
  };
};

export const paginationMeta = (page: number, pageSize: number, total: number) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize))
});
