export type UserRole = "user" | "sponsor" | "admin";
export type AccountStatus = "active" | "suspended";

export type Profile = {
  id: string;
  email: string | null;
  role: UserRole;
  status: AccountStatus;
  display_name: string | null;
  avatar_url: string | null;
};

export type AuthFormState = {
  error?: string;
  success?: string;
};
