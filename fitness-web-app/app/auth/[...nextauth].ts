import NextAuth from "next-auth";
import { authController } from "./authController"; 

const handler = NextAuth(authController);

export { handler as GET, handler as POST };
