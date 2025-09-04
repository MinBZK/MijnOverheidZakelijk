import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { updateKvkCookie } from "./utils/kvknummer";
import { profiles } from "./utils/profiles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    authorized: async ({ auth, request }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth && request.nextUrl.basePath != "/";
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.kvknummer = profile.kvknummer || null;
        token.preferred_username = profile.preferred_username;
        token.accessToken = account.access_token;

        updateKvkCookie(profiles[0].kvk);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.kvknummer = token.kvknummer as string;
      session.user.preferred_username = token.preferred_username as string;

      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  providers: [Keycloak],
});
