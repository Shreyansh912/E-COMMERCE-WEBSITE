import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Fetch user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        // 2. Fetch the password column dynamically regardless of exact column name
        const userRecord = user as any;
        const storedHash =
          userRecord.hashedPassword ||
          userRecord.passwordHash ||
          userRecord.password ||
          userRecord.hash;

        if (!storedHash) {
          return null;
        }

        // 3. Compare hashed password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, storedHash);
        if (!isValid) {
          return null;
        }

        // 4. Return distinct user identity (avoiding fallback default names)
        return {
          id: String(user.id),
          name: user.name || email.split("@")[0],
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) || (token.email as string)?.split("@")[0];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "shopsphere-secure-auth-secret-key-98234",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };