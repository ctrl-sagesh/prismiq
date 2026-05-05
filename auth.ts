import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getOrCreateUser } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/" },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        try {
          await getOrCreateUser(user.email, user.name ?? undefined, user.image ?? undefined);
        } catch (e) {
          console.error("Failed to upsert user:", e);
        }
      }
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
