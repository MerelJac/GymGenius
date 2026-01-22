import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        if (user.role) token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // 🔐 Guard for initial / partial JWT
      if (!token.id || !token.role) {
        return session;
      }

      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
