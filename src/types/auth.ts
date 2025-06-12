import { DefaultSession } from "next-auth";

type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";
type AvatarUrl = string | null;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatar?: AvatarUrl;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    avatar?: AvatarUrl;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    avatar?: AvatarUrl;
  }
}
