import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJwt } from "@/services/services";

export const authController: NextAuthOptions = {
    providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "name@provider.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
        const loginResponse = await fetch(
          "https://afefitness2023.azurewebsites.net/api/Users/login",
          {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json();
          throw new Error(errorData?.message || "Failed to login.");
        }


        const data = await loginResponse.json();
        const token = decodeJwt(data?.jwt);

        if (token) {
          console.log("Decoded Token:", token);
          return {
            id: token.UserId,
            name: token.Name,
            email: credentials?.email,
            role: token.Role,
            token: data?.jwt, 
          };
        }
       throw new Error("Invalid token structure.");
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          role: user.role as string,
          token: user.token as string,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        token: token.token as string,
      };
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};