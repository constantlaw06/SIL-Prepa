# Prépa SIL - quiz interactif

Application de révision pour l'Examen National de Licence, filière **Système
Informatique et Logiciel** (tronc commun + spécialité). Portage en Next.js /
shadcn-ui du fichier autonome `Prepa_Examen_SIL.html`, conservé comme source
d'origine des contenus.

## Démarrage

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # build de production (pages pré-générées)
npm run lint
npm run verify:content   # parité des contenus avec le document d'origine
npm run db:push          # crée la base locale (comptes et progression)
```

La date d'examen par défaut est le **29 septembre 2026**
(`DEFAULT_EXAM_DATE` dans `src/lib/exam-date.ts`). Elle se change dans la barre
supérieure et le choix est mémorisé dans le navigateur. Le plan couvrant 24
jours, tant que l'examen est plus lointain le tableau de bord annonce dans
combien de jours le plan démarre.

## Fonctionnalités

- **Tableau de bord** (`/`) - indicateurs de préparation calculés à partir de
  ta progression réelle : jours restants, thèmes travaillés, score moyen et
  variation, thèmes maîtrisés, courbe des scores, alertes sur les thèmes faibles
  ou jamais tentés, file des séries à reprendre.
- **Plan J-24** (`/plan`) - calendrier de révision en 3 phases, avec décompte
  jusqu'à la date d'examen (modifiable, mémorisée dans le navigateur) et mise en
  évidence de la journée courante.
- **Quiz** (`/quiz`, `/quiz/[theme]`) - 13 thèmes, 118 questions : QCM à une ou
  plusieurs réponses, Vrai/Faux et questions ouvertes. Correction avec
  explications, score sur les questions notables et barre de progression.
- **Exercices** (`/exercices`) - 38 sujets type-examen filtrables par catégorie,
  chaque corrigé se dépliant à la demande.
- **Fiches** (`/fiches`), **Méthode** (`/methode`), **Ressources**
  (`/ressources`) - contenus de révision statiques.

## Interface

Coquille de type ERP : barre latérale fixe (dépliable sur les 13 thèmes de quiz,
en tiroir sous 1024 px), barre supérieure avec titre de page, recherche globale
(thèmes, questions, exercices), date d'examen et décompte, puis la zone de
contenu. Thème sombre par défaut, tokens de couleur définis dans
`src/app/globals.css` pour les deux modes.

## Progression

Chaque clic sur « Corriger » enregistre le score de la série dans le
localStorage (clé `sil_results`) : dernier score par thème et historique des 30
dernières séries. C'est la seule source des chiffres du tableau de bord, qui
affiche un état vide tant qu'aucune série n'a été corrigée. Le store vit dans
`src/lib/results-store.ts` et se lit via `useSyncExternalStore`, comme la date
d'examen (`src/lib/exam-store.ts`).

Sans compte, la progression ne quitte pas le navigateur. Avec un compte, elle
est aussi écrite en base et suit l'utilisateur d'un appareil à l'autre.

## Comptes (Google / Facebook)

Créer un compte est facultatif : l'application fonctionne entièrement sans, la
progression restant alors locale au navigateur.

### Mise en route

1. `cp .env.example .env.local`
2. `npx auth secret` pour générer `AUTH_SECRET`.
3. Créer les identifiants OAuth chez le ou les fournisseurs voulus. Un seul
   suffit : la page de connexion n'affiche que ceux qui sont configurés.
   - **Google** : Google Cloud Console > API et services > Identifiants > ID
     client OAuth 2.0, type « Application Web ». URI de redirection autorisée :
     `http://localhost:3000/api/auth/callback/google`.
   - **Facebook** : Meta for Developers > application > Connexion Facebook. URI
     de redirection : `http://localhost:3000/api/auth/callback/facebook`.
     Facebook impose HTTPS hors `localhost`.
4. `npm run db:push` pour créer la base SQLite locale (`prisma/dev.db`).
5. `npm run dev`, puis « Se connecter » dans la barre supérieure.

En production auto-hébergée, renseigner en plus `AUTH_URL` (ou
`AUTH_TRUST_HOST`), sans quoi Auth.js refuse les requêtes avec
`UntrustedHost`, et déclarer l'URI de redirection du domaine réel chez chaque
fournisseur.

### Fonctionnement

- Auth.js v5 avec l'adaptateur Prisma, sessions **en base** donc révocables
  côté serveur. Configuration dans `src/auth.ts`.
- À la connexion, les séries déjà enregistrées dans le navigateur sont envoyées
  au compte, puis la progression fusionnée redescend
  (`src/components/auth/progress-sync.tsx`). Une série est identifiée par son
  thème et son horodatage : synchroniser deux fois ne crée pas de doublon.
- L'API `/api/progress` valide chaque entrée reçue, plafonne l'historique à 30
  séries par compte et ne renvoie jamais que les données du compte appelant.
- La liaison de comptes par e-mail est **désactivée** (défaut d'Auth.js) : la
  même adresse utilisée successivement sur Google puis Facebook donne deux
  comptes distincts, et la page de connexion l'explique au lieu d'échouer
  silencieusement. L'activer (`allowDangerousEmailAccountLinking`) ferait
  reposer la sécurité du compte sur la vérification d'e-mail du fournisseur.
- Seuls le nom, l'e-mail et l'avatar sont demandés.

### Base de données

SQLite en local (`prisma/schema.prisma`). Pour un déploiement, passer le
`provider` du bloc `datasource` à `postgresql` et faire pointer `DATABASE_URL`
sur la base hébergée : les modèles sont portables tels quels.

## Structure

```
src/
├── app/                  # routes App Router (une page par entrée de menu)
│   └── quiz/[theme]/     # série de questions, pré-générée par thème
├── components/
│   ├── ui/               # primitives shadcn/ui
│   ├── app-shell.tsx     # sidebar + topbar + zone de contenu
│   ├── app-sidebar.tsx   # navigation latérale
│   ├── topbar.tsx        # titre, recherche, date d'examen
│   ├── dashboard/        # cartes KPI, bandeaux d'alerte, courbe des scores
│   ├── auth/             # menu de compte, synchronisation, marques OAuth
│   ├── quiz-runner.tsx   # état des réponses + correction
│   ├── question-card.tsx # rendu d'une question selon son type
│   ├── plan-view.tsx     # calendrier J-24
│   ├── exo-list.tsx      # exercices + filtres
│   ├── section-title.tsx # titre de section + type `IconComponent`
│   └── rich-text.tsx     # rendu du HTML pédagogique (classe `.rich`)
├── data/                 # contenus : bank.ts, exos.ts, plan.ts, content.ts
├── auth.ts               # configuration Auth.js (Google, Facebook)
├── app/api/              # /api/auth/[...nextauth] et /api/progress
├── hooks/                # use-exam-date.ts, use-results.ts
└── lib/                  # types, notation, dates, navigation, stores localStorage
```

## Ajouter du contenu

- **Une question** : ajouter une entrée dans le tableau `qs` du thème visé dans
  `src/data/bank.ts`. Les types disponibles (`qcm`, `multi`, `vf`, `short`) et la
  forme du champ `a` sont décrits dans `src/lib/types.ts`.
- **Un thème** : ajouter une clé à `BANK` ; la route `/quiz/<clé>`, la page
  d'accueil des quiz et les liens du plan la reprennent automatiquement.
- **Un exercice** : ajouter un objet `{cat, diff, titre, enonce, corrige}` à
  `src/data/exos.ts`.

Les champs `q`, `e`, `enonce`, `corrige` et les fiches acceptent du HTML (mise en
forme, `<code>`, tableaux). Il est rendu tel quel par `RichText` : n'y placer que
du contenu écrit dans le dépôt, jamais de saisie utilisateur.

## Contrôle des contenus

`npm run verify:content` compare `src/data` au document d'origine
`Prepa_Examen_SIL.html` : présence et ordre de chaque thème, question, option,
bonne réponse, explication, exercice et corrigé, en rejouant les seules
transformations voulues (tirets simples, icône d'horloge sortie des données).
Le script vérifie ensuite la cohérence interne : pas d'énoncé ni d'explication
vide, index de bonne réponse valide, réponse modèle présente pour chaque
question ouverte. Il sort en erreur au moindre écart, ce qui en fait un garde-fou
utile après toute modification des contenus.

## Icônes

L'interface n'utilise **que des icônes [Heroicons](https://heroicons.com)**
(`@heroicons/react/24/outline`) - aucun émoji, y compris dans les données. Les
icônes décoratives portent `aria-hidden="true"`, le sens étant toujours porté par
le texte voisin.

`components.json` conserve `iconLibrary: "lucide"`, valeur par défaut du registre
shadcn : les composants ajoutés plus tard via `npx shadcn add` arriveront donc
avec des icônes lucide, à remplacer par leur équivalent Heroicons (c'est ce qui a
été fait pour `ui/accordion.tsx`). Le paquet `lucide-react` a été désinstallé, un
import oublié provoque donc une erreur de build plutôt qu'un mélange silencieux.
