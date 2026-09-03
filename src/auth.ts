import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

export type ProviderId = "google" | "facebook";

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  google: "Google",
  facebook: "Facebook",
};

/**
 * Un fournisseur n'est proposé que si ses identifiants sont renseignés.
 * L'application reste ainsi utilisable (progression locale) sur une
 * installation où l'authentification n'a pas été configurée.
 */
export function configuredProviders(): ProviderId[] {
  const ids: ProviderId[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ids.push("google");
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET)
    ids.push("facebook");
  return ids;
}

export function isAuthConfigured() {
  return Boolean(process.env.AUTH_SECRET) && configuredProviders().length > 0;
}

const enabled = configuredProviders();

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // Sessions en base : elles restent révocables côté serveur.
  session: { strategy: "database" },
  providers: [
    ...(enabled.includes("google") ? [Google] : []),
    ...(enabled.includes("facebook") ? [Facebook] : []),
  ],
  pages: { signIn: "/connexion", error: "/connexion" },
  callbacks: {
    session({ session, user }) {
      // L'identifiant utilisateur sert de clé à la progression enregistrée.
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
