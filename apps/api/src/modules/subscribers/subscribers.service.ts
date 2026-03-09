import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

type ListSubscribersInput = {
  orgId: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

export const subscribersService = {
  async create(orgId: string, input: Prisma.SubscriberUncheckedCreateInput) {
    return prisma.subscriber.upsert({
      where: {
        orgId_email: {
          orgId,
          email: input.email
        }
      },
      update: {
        status: "active",
        sourcePage: input.sourcePage
      },
      create: {
        orgId,
        email: input.email,
        sourcePage: input.sourcePage,
        status: "active"
      },
      select: {
        id: true,
        email: true,
        sourcePage: true,
        status: true,
        createdAt: true
      }
    });
  },

  async list(input: ListSubscribersInput) {
    const { page, pageSize, skip, take } = getPagination(input);

    const where: Prisma.SubscriberWhereInput = {
      orgId: input.orgId,
      ...(input.q
        ? {
            email: {
              contains: input.q,
              mode: "insensitive"
            }
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          email: true,
          sourcePage: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.subscriber.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(page, pageSize, total)
    };
  },

  async updateStatus(orgId: string, id: string, status: "active" | "unsubscribed") {
    return prisma.subscriber.updateMany({
      where: { orgId, id },
      data: { status }
    });
  }
};
