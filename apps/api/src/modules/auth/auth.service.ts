import { prisma } from "../../lib/prisma.js";
import { comparePassword } from "../../utils/password.js";

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return null;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((r) => r.role.code)
    };
  },

  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        orgId: true,
        email: true,
        name: true,
        status: true,
        lastLoginAt: true,
        roles: {
          select: {
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });
  }
};
