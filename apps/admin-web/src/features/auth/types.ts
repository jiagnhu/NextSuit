export type RoleItem = {
  code: string;
  name: string;
};

export type MeProfile = {
  id: string;
  orgId: string;
  email: string;
  name: string;
  status: "active" | "disabled";
  lastLoginAt: string | null;
  roles: RoleItem[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResult = {
  id: string;
  orgId: string;
  email: string;
  name: string;
  status: "active" | "disabled";
  roles: string[];
};
