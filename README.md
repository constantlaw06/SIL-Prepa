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
npm run db:push          # crée les tables (comptes et progression)
```

La base de données est Postgres, y compris en local : voir la section
[Comptes](#comptes-google--facebook) pour la mise en route et
[Déploiement](#déploiement-vercel) pour la mise en production.

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
- **Quiz** (`/quiz`, `/quiz/[theme]`, `/quiz/[theme]/[n]`) - 18 thèmes, 713
  questions : QCM à une ou plusieurs réponses, Vrai/Faux et questions
  ouvertes. Correction avec explications, score sur les questions notables et
  barre de progression. Un thème de plus de 15 questions est automatiquement
  découpé en plusieurs questionnaires équilibrés (voir « Questionnaires »
  ci-dessous) ; les thèmes restés sous ce seuil ne changent pas de route ni
  de comportement. Une question ouverte ne peut pas être corrigée
  automatiquement (texte libre) : après « Corriger », l'étudiant se juge
  lui-même contre la réponse modèle (« As-tu répondu correctement ? »).
  Avant ce geste, aucune couleur de succès n'apparaît - la réponse modèle est
  affichée neutre, jamais en vert par défaut, pour ne pas laisser croire à
  une bonne réponse. Un « Non » alimente le carnet d'erreurs comme une
  question notée ratée.
- **Exercices** (`/exercices`) - 38 sujets type-examen filtrables par
  catégorie et difficulté. Chaque exercice se rédige dans un brouillon avant
  d'afficher le corrigé, puis se soumet à une auto-évaluation (« As-tu
  répondu correctement ? », même mécanisme que les questions ouvertes) qui
  alimente une note globale (% de bonnes réponses parmi les exercices
  tentés) affichée en tête de page.
- **Fiches** (`/fiches`), **Méthode** (`/methode`), **Ressources**
  (`/ressources`) - contenus de révision statiques.

## Interface

Coquille de type ERP : barre latérale fixe (dépliable sur les thèmes de quiz,
en tiroir sous 1024 px), barre supérieure avec titre de page, recherche globale
(thèmes, questions, exercices), date d'examen et décompte, puis la zone de
contenu. Thème sombre par défaut, tokens de couleur définis dans
`src/app/globals.css` pour les deux modes.

### Logo et icônes

Les deux logos fournis (`public/LOGO SIL  PREPA1.svg` fond blanc, `public/LOGO
SIL PREPA2.svg` fond bleu) sont la source unique de toute l'iconographie de
marque. Des copies sans espace dans le nom (`logo-sil-prepa-light.svg` /
`-dark.svg`) servent aux références dans le code - la variante fond bleu est
utilisée dans la barre latérale (fond sombre), la variante fond blanc pour les
icônes de navigateur.

Favicon, icône PWA et icône iOS sont générées par rasterisation
(`sharp`) du logo fond blanc vers les conventions de fichiers de Next.js App
Router : `src/app/icon.svg`, `icon.png`, `apple-icon.png`, `favicon.ico` (ICO
moderne à image PNG embarquée) et `public/icon-192.png` / `icon-512.png` pour
`src/app/manifest.ts` (installation « Ajouter à l'écran d'accueil »). Pour
régénérer ces fichiers après un changement de logo, réutiliser le même script
de rasterisation (taille et conventions de nommage à respecter).

## Progression

Chaque clic sur « Corriger » enregistre le score de la série dans le
localStorage (clé `sil_results`) : dernier score par thème et historique des 30
dernières séries. C'est la seule source des chiffres du tableau de bord, qui
affiche un état vide tant qu'aucune série n'a été corrigée. Le store vit dans
`src/lib/results-store.ts` et se lit via `useSyncExternalStore`, comme la date
d'examen (`src/lib/exam-store.ts`).

L'auto-évaluation des exercices suit le même principe (localStorage `sil_exercises`,
`src/lib/exercise-store.ts`), indépendamment de la progression des quiz.

Sans compte, la progression ne quitte pas le navigateur. Avec un compte, elle
est aussi écrite en base et suit l'utilisateur d'un appareil à l'autre.

## Comptes (Google / Facebook)

Créer un compte est facultatif : l'application fonctionne entièrement sans, la
progression restant alors locale au navigateur.

### Mise en route

1. `cp .env.example .env.local`
2. Créer une base Postgres gratuite sur [neon.tech](https://neon.tech) (ou via
   Vercel, voir Déploiement) et coller la chaîne de connexion dans
   `DATABASE_URL`.
3. Générer `AUTH_SECRET` : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   et le coller dans `.env.local`.
   ⚠️ `npx auth secret`, documenté par Auth.js, installe en pratique le
   paquet npm `auth` d'un projet tiers (« Better Auth ») et produit une
   variable `BETTER_AUTH_SECRET` sans rapport - ne pas l'utiliser ici.
4. Créer les identifiants OAuth chez le ou les fournisseurs voulus. Un seul
   suffit : la page de connexion n'affiche que ceux qui sont configurés. Le
   menu **API et services → Identifiants** de Google s'appelle maintenant
   **Google Auth Platform** (renommé par Google en 2024) ; il n'apparaît que
   si au moins une API est activée sur le projet.
   - **Google** : Google Auth Platform > Clients > Créer un client, type
     « Application Web ». URI de redirection autorisée :
     `http://localhost:3000/api/auth/callback/google`.
   - **Facebook** : Meta for Developers > application > Connexion Facebook. URI
     de redirection : `http://localhost:3000/api/auth/callback/facebook`.
     Facebook impose HTTPS hors `localhost`.
5. `npm run db:push` pour créer les tables sur la base Postgres.
   ⚠️ La CLI Prisma ne lit **que** `.env` par défaut, jamais `.env.local` - le
   script passe donc par `dotenv-cli` (`db:push` et `db:studio` dans
   `package.json`) pour forcer la lecture de `.env.local`. Appeler `prisma`
   directement (`npx prisma db push`) sans ce détour échoue avec
   « DATABASE_URL resolved to an empty string », même si la variable est bien
   présente dans `.env.local`.
6. `npm run dev`, puis « Se connecter » dans la barre supérieure.

En production auto-hébergée, renseigner en plus `AUTH_URL` (ou
`AUTH_TRUST_HOST`), sans quoi Auth.js refuse les requêtes avec
`UntrustedHost`, et déclarer l'URI de redirection du domaine réel chez chaque
fournisseur.

### Fonctionnement

- Auth.js v5 avec l'adaptateur Prisma, sessions **en base** donc révocables
  côté serveur. Configuration dans `src/auth.ts`.
- À la connexion, les séries de quiz et les auto-évaluations d'exercices
  déjà enregistrées dans le navigateur sont envoyées au compte, puis la
  version fusionnée redescend (`src/components/auth/progress-sync.tsx`). Une
  série est identifiée par son thème et son horodatage, un exercice par son
  index : synchroniser deux fois ne crée pas de doublon.
- L'API `/api/progress` valide chaque entrée reçue, plafonne l'historique à 30
  séries par compte et ne renvoie jamais que les données du compte appelant.
- La liaison de comptes par e-mail est **désactivée** (défaut d'Auth.js) : la
  même adresse utilisée successivement sur Google puis Facebook donne deux
  comptes distincts, et la page de connexion l'explique au lieu d'échouer
  silencieusement. L'activer (`allowDangerousEmailAccountLinking`) ferait
  reposer la sécurité du compte sur la vérification d'e-mail du fournisseur.
- Seuls le nom, l'e-mail et l'avatar sont demandés.

### Base de données

Postgres (`prisma/schema.prisma`), en local comme en production : voir la
section Déploiement ci-dessous pour créer la base et renseigner
`DATABASE_URL`.

## Déploiement (Vercel)

Vercel n'a pas de disque persistant, ce qui exclut SQLite : la base de
données doit être une Postgres hébergée. [Neon](https://neon.tech) a un plan
gratuit qui suffit pour ce projet, et s'intègre nativement à Vercel.

### 1. Créer la base Postgres

Deux façons équivalentes d'obtenir un `DATABASE_URL` :

- **Depuis le tableau de bord Vercel** (le plus simple) : dans le projet,
  onglet **Storage → Create Database → Postgres (Neon)**. Vercel écrit alors
  `DATABASE_URL` directement dans les variables d'environnement du projet.
- **Depuis [neon.tech](https://neon.tech)** directement : créer un projet,
  copier la chaîne de connexion (`postgresql://...`).

Si la base est créée depuis le tableau de bord Vercel, `DATABASE_URL`
n'existe qu'**en tant que variable d'environnement Vercel** - pas dans le
projet en local. Pour créer les tables (étape suivante), copier cette valeur
depuis **Settings → Environment Variables** vers `.env.local`.

### 2. Créer les tables

```bash
# Coller le DATABASE_URL obtenu dans .env.local, puis :
npm run db:push
```

C'est la base pointée par ce `DATABASE_URL` qui doit contenir les tables -
celle que Vercel utilisera en production. Pousser le schéma vers une autre
base (ex. une base locale ou une base Neon créée « à côté ») laisse la base
de production sans tables : Auth.js échoue alors à l'étape de callback OAuth
avec l'erreur générique « La configuration de l'authentification est
incomplète côté serveur ».

### 3. Pousser le code sur GitHub

```bash
git add -A
git commit -m "message"
git push
```

### 4. Importer le projet dans Vercel

Sur [vercel.com/new](https://vercel.com/new), importer le dépôt GitHub.
Vercel détecte Next.js automatiquement (build : `next build`, déjà correct
dans `package.json`).

### 5. Variables d'environnement (Settings → Environment Variables)

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | déjà présente si créée via Storage à l'étape 1, sinon à ajouter |
| `AUTH_SECRET` | la même valeur que `.env.local`, ou en régénérer une avec `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ceux de la Google Cloud Console |
| `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | si utilisé |
| `AUTH_URL` | `https://prepa-sil.constantdansou.me` (à ajouter après l'étape 7) |

Auth.js détecte automatiquement qu'il tourne sur Vercel (`AUTH_TRUST_HOST` est
inféré), mais `AUTH_URL` reste recommandé pour un domaine personnalisé.

### 6. Déployer

Cliquer sur **Deploy**. Vercel donne d'abord une URL `*.vercel.app` : vérifier
que le site fonctionne avant de brancher le domaine personnalisé.

### 7. Brancher prepa-sil.constantdansou.me

1. Dans le projet Vercel : **Settings → Domains → Add**, saisir
   `prepa-sil.constantdansou.me`.
2. Vercel affiche un enregistrement à créer, du type :

   | Type | Nom | Valeur |
   |---|---|---|
   | CNAME | `prepa-sil` | `cname.vercel-dns.com.` |

   (la valeur exacte est donnée par Vercel - la copier telle quelle, point
   final inclus.)
3. Ajouter cet enregistrement chez le fournisseur DNS qui gère
   `constantdansou.me`. Propagation : quelques minutes en général, jusqu'à
   72 h dans le pire cas.
4. Vercel valide automatiquement dès que le DNS répond (« Valid
   Configuration » dans le tableau de bord).
5. Ajouter `AUTH_URL=https://prepa-sil.constantdansou.me` dans les variables
   d'environnement (étape 5), puis redéployer (**Deployments → ⋯ →
   Redeploy**).

### 8. Mettre à jour les identifiants OAuth

Le domaine ayant changé, retourner dans la console de chaque fournisseur et
ajouter les URI du domaine final, **en plus** de celles de `localhost` :

- **Google** : Origine JavaScript `https://prepa-sil.constantdansou.me` et
  URI de redirection `https://prepa-sil.constantdansou.me/api/auth/callback/google`.
- **Facebook** : URI de redirection
  `https://prepa-sil.constantdansou.me/api/auth/callback/facebook`.

### 9. Vérifier

- `https://prepa-sil.constantdansou.me` charge le tableau de bord.
- `/connexion` propose bien le bouton Google et la connexion aboutit.
- Une série de quiz corrigée reste visible après rechargement (persistance en
  base).

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

## Import de la banque QCM (QCM_Informatique.xlsx)

585 questions QCM (13 domaines × 45, difficulté Facile/Moyen/Difficile,
réponse unique parmi 4 choix, explication justifiée) ont été importées depuis
`QCM_Informatique.xlsx`, une banque fournie par l'auteur du projet. Chaque
domaine du classeur a été mappé sur `src/data/bank.ts` :

| Feuille du classeur | Thème | Traitement |
|---|---|---|
| Architecture, Réseaux, Bases de données, SQL, Numération, PHP, UML, Développement web | `archi`, `res`, `bd`, `sql`, `num`, `php`, `uml`, `web` | Questions ajoutées à la suite du thème existant |
| Algorithmique | `algo` | Nouveau thème |
| Systèmes exploitation | `sysexp` | Nouveau thème |
| POO concepts | `poogen` | Nouveau thème |
| C++ | `cpp` | Nouveau thème |
| POO Java | `poojava` | Nouveau thème |

Le texte de chaque question, option et explication a été échappé (`<`, `>`,
`&`) avant insertion : une partie du classeur contient des extraits de code
(`<?php`, `<main>`, `delete[]`...) qui, non échappés, seraient interprétés
comme du HTML par `RichText` au lieu de s'afficher tels quels.

Pour un futur réimport (nouvelle version du classeur, autres feuilles), le
script utilisé n'est pas conservé dans le dépôt (opération ponctuelle) ; sa
logique - lecture via `xlsx` (SheetJS), échappement HTML, insertion à la fin
du tableau `qs` du thème existant ou création d'un nouveau bloc `BANK[clé]`
avant la fin de l'objet - est réutilisable pour toute source similaire
(colonnes N°/Difficulté/Question/Choix A-D/Bonne réponse/Explication).

## Questionnaires

Un thème n'est jamais présenté comme une liste de plus de 15 questions :
`src/lib/quiz-sets.ts` découpe automatiquement `BANK[clé].qs` en plusieurs
questionnaires de taille équilibrée dès que le thème en compte davantage (18
questions → deux séries de 9, plutôt qu'une de 15 et une de 3 restante).
Aucune restructuration des données n'est nécessaire : ajouter des questions à
un thème dans `bank.ts` suffit, le découpage suit automatiquement.

- 1 seul questionnaire → `/quiz/<thème>` lance directement le quiz, comme
  avant (aucun changement de route ni de comportement pour les thèmes restés
  sous 15 questions).
- Plusieurs questionnaires → `/quiz/<thème>` affiche un sélecteur de série,
  chacune menant à `/quiz/<thème>/<n>`.

Chaque questionnaire a sa propre progression, indépendante des autres séries
du même thème : la clé de résultat est `<thème>` (série unique) ou
`<thème>-<n>` (ex. `web-2`), gérée par `setHref()` et `setProgressOf()` dans
`src/lib/mastery.ts`. Le tableau de bord et la barre latérale continuent de
raisonner par thème (moyenne des séries tentées) ; la prise de quiz, le
carnet d'erreurs et la recommandation du jour raisonnent au niveau du
questionnaire précis.

## Contrôle des contenus

`npm run verify:content` compare `src/data` au document d'origine
`Prepa_Examen_SIL.html` : présence et ordre de chaque thème, question, option,
bonne réponse, explication, exercice et corrigé, en rejouant les seules
transformations voulues (tirets simples, icône d'horloge sortie des données).
Pour les questions d'un thème, la comparaison tolère des ajouts en fin de
liste (contenu original écrit depuis la migration) : seuls un manque ou une
modification d'une question d'origine font échouer le contrôle. Le script
vérifie ensuite la cohérence interne : pas d'énoncé ni d'explication vide,
index de bonne réponse valide, réponse modèle présente pour chaque question
ouverte. Il sort en erreur au moindre écart, ce qui en fait un garde-fou utile
après toute modification des contenus.

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
