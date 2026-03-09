import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

type ListLeadInput = {
  orgId: string;
  page?: number;
  pageSize?: number;
  status?: "new" | "qualified" | "won" | "lost";
  source?: string;
  q?: string;
};

export const leadsService = {
  async create(orgId: string, input: Prisma.LeadUncheckedCreateInput) {
    return prisma.lead.create({
      data: {
        ...input,
        orgId,
        source: input.source ?? "book-demo"
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        source: true,
        createdAt: true
      }
    });
  },

  async list(input: ListLeadInput) {
    const { page, pageSize, skip, take } = getPagination(input);

    const where: Prisma.LeadWhereInput = {
      orgId: input.orgId,
      ...(input.status ? { status: input.status } : {}),
      ...(input.source ? { source: input.source } : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { email: { contains: input.q, mode: "insensitive" } },
              { company: { contains: input.q, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          budgetRange: true,
          interest: true,
          source: true,
          status: true,
          ownerUserId: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.lead.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(page, pageSize, total)
    };
  },

  async findById(orgId: string, id: string) {
    return prisma.lead.findFirst({
      where: { orgId, id },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            actorUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  },

  async updateStatus(orgId: string, id: string, status: "new" | "qualified" | "won" | "lost", notes?: string) {
    return prisma.lead.updateMany({
      where: { orgId, id },
      data: {
        status,
        notes,
        lastContactedAt: new Date()
      }
    });
  },

  async createActivity(leadId: string, actorUserId: string, actionType: string, note?: string) {
    return prisma.leadActivity.create({
      data: {
        leadId,
        actorUserId,
        actionType,
        note
      },
      select: {
        id: true,
        leadId: true,
        actionType: true,
        note: true,
        createdAt: true
      }
    });
  }
};
