import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

type ListContactsInput = {
  orgId: string;
  page?: number;
  pageSize?: number;
  status?: "new" | "in_progress" | "resolved" | "spam";
  q?: string;
};

export const contactsService = {
  async create(orgId: string, input: Prisma.ContactUncheckedCreateInput) {
    return prisma.contact.create({
      data: {
        ...input,
        orgId
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        subject: true,
        status: true,
        createdAt: true
      }
    });
  },

  async list(input: ListContactsInput) {
    const { page, pageSize, skip, take } = getPagination(input);

    const where: Prisma.ContactWhereInput = {
      orgId: input.orgId,
      ...(input.status ? { status: input.status } : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { email: { contains: input.q, mode: "insensitive" } },
              { company: { contains: input.q, mode: "insensitive" } },
              { message: { contains: input.q, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          subject: true,
          message: true,
          sourcePage: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.contact.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(page, pageSize, total)
    };
  },

  async updateStatus(orgId: string, id: string, status: "new" | "in_progress" | "resolved" | "spam") {
    return prisma.contact.updateMany({
      where: { orgId, id },
      data: { status }
    });
  }
};
