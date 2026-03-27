import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {
      userId: string;
      orgId: string;
      email: string;
      roles?: string[];
    }

    interface Request {
      user?: UserPayload;
      orgId?: string;
    }
  }
}

export {};
