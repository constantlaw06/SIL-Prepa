import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { FacebookMark, GoogleMark } from "@/components/auth/brand-marks";
import { Button } from "@/components/ui/button";
import { PROVIDER_LABELS, auth, configuredProviders, isAuthConfigured, signIn } from "@/auth";

export const metadata = { title: "Créer un compte - Prépa SIL" };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "Cette adresse est déjà associée à un compte créé avec l'autre fournisseur. Connecte-toi avec celui que tu as utilisé la première fois.",
  AccessDenied: "L'accès a été refusé par le fournisseur.",
  Configuration:
    "La configuration de l'authentification est incomplète côté serveur. Voir la section « Comptes » du README.",
  Verification: "Le lien de connexion a expiré. Recommence.",
};

const ARGUMENTS = [
  {
    icon: CloudArrowUpIcon,
    text: "Ta progression est enregistrée sur ton compte au lieu de ce seul navigateur.",
  },
  {
    icon: DevicePhoneMobileIcon,
    text: "Tu la retrouves sur un autre appareil, et un vidage du cache ne l'efface plus.",
  },
  {
    icon: CheckCircleIcon,
    text: "Les scores déjà obtenus dans ce navigateur sont repris au moment de la connexion.",
  },
];

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : null;
  const configured = isAuthConfigured();
  const providers = configuredProviders();
  const session = configured ? await auth() : null;

  return (
    <div className="mx-auto max-w-lg space-y-4 py-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Retour au tableau de bord
      </Link>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Suivre ma progression</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crée ton compte en un clic avec Google ou Facebook. Aucun mot de passe à
          retenir : c&apos;est le fournisseur choisi qui t&apos;identifie.
        </p>

        <ul className="mt-5 space-y-3">
          {ARGUMENTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm">
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>

        {errorCode && (
          <p className="mt-5 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <ExclamationTriangleIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-destructive"
            />
            <span>
              {ERRORS[errorCode] ?? "La connexion a échoué. Réessaie."}
            </span>
          </p>
        )}

        {session?.user ? (
          <div className="mt-6 rounded-md border border-success/40 bg-success/10 p-3 text-sm">
            <p className="font-medium">
              Déjà connecté en tant que {session.user.name ?? session.user.email}.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/">Aller au tableau de bord</Link>
            </Button>
          </div>
        ) : configured ? (
          <div className="mt-6 space-y-2">
            {providers.map((id) => (
              <form
                key={id}
                action={async () => {
                  "use server";
                  await signIn(id, { redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="lg" className="w-full">
                  {id === "google" ? (
                    <GoogleMark className="size-4.5" />
                  ) : (
                    <FacebookMark className="size-4.5" />
                  )}
                  Continuer avec {PROVIDER_LABELS[id]}
                </Button>
              </form>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <p className="font-medium">Authentification non configurée</p>
            <p className="mt-1 text-muted-foreground">
              Renseigne <code className="font-mono">AUTH_SECRET</code> et les
              identifiants Google ou Facebook dans{" "}
              <code className="font-mono">.env.local</code> (voir{" "}
              <code className="font-mono">.env.example</code> et la section
              « Comptes » du README), puis relance le serveur. En attendant, la
              progression reste enregistrée dans ce navigateur.
            </p>
          </div>
        )}

        <p className="mt-5 text-xs text-muted-foreground">
          Seuls ton nom, ton adresse e-mail et ton avatar sont récupérés, afin
          d&apos;identifier ton compte. Sans connexion, l&apos;application reste
          utilisable : la progression est alors gardée dans ce navigateur.
        </p>
      </section>
    </div>
  );
}
