import bcrypt from "bcryptjs";

export const hashPassword = async (raw: string) => bcrypt.hash(raw, 10);

export const comparePassword = async (raw: string, hashed: string) => bcrypt.compare(raw, hashed);
