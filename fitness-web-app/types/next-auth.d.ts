import NextAuth, { DefaultSession, DefaultUser } from "@/types/next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string; 
    role: string; 
    token: string; 
  }

  interface Session extends DefaultSession {
    user?: User; 
  }

  interface JWT {
    id: string; 
    role: string; 
    token: string;
  }
}
