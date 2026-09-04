/*
 * Contrôle de parité entre le document d'origine (Prepa_Examen_SIL.html) et les
 * données de l'application (src/data). Vérifie que chaque question, chaque
 * option, chaque réponse et chaque corrigé a bien été repris, puis que rien
 * n'est vide ni incohérent.
 *
 *   node scripts/verify-content.mjs      (ou : npm run verify:content)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "Prepa_Examen_SIL.html");

const problems = [];
const fail = (msg) => problems.push(msg);

/* ---------- lecture du document d'origine ---------- */

function literal(html, re, name) {
  const m = html.match(re);
  if (!m) throw new Error(`Bloc ${name} introuvable dans le document source`);
  return m[1];
}

/**
 * Transformations appliquées lors de la migration, à rejouer sur la source
 * pour comparer ce qui est comparable.
 */
function normalizeSource(code) {
  return code
    .replace(/[–—]/g, "-") // tirets cadratins -> tiret simple
    .replace(/diff:"⏱ /g, 'diff:"'); // l'icône horloge est rendue par l'UI
}

function evalLiteral(code) {
  return new Function(`return (${code});`)();
}

/* ---------- lecture des données de l'application ---------- */

function loadData(file, names) {
  const code = fs
    .readFileSync(path.join(ROOT, "src/data", file), "utf8")
    .replace(/^import[^;]*;\s*/gm, "")
    .replace(/export const (\w+)(\s*:\s*[^=]+?)?\s*=/g, "const $1 =");
  return new Function(`${code}\nreturn { ${names.join(", ")} };`)();
}

/* ---------- comparaison ---------- */

function compare(label, expected, actual) {
  const a = JSON.stringify(expected);
  const b = JSON.stringify(actual);
  if (a === b) return true;
  fail(`${label} : contenu différent de la source`);
  return false;
}

/**
 * Comme diffLists, mais tolère des entrées ajoutées après celles de la
 * source (contenu original écrit depuis, ex. de nouvelles questions) : seul
 * un manque ou une modification d'une entrée d'origine est un échec.
 */
function diffPrefix(label, expected, actual, key) {
  if (actual.length < expected.length) {
    fail(
      `${label} : ${actual.length} entrées dans l'application, moins que les ${expected.length} de la source`,
    );
  }
  for (let i = 0; i < expected.length; i++) {
    const e = expected[i];
    const a = actual[i];
    if (!a) {
      fail(`${label} #${i + 1} manquant : ${key(e)}`);
      continue;
    }
    if (JSON.stringify(e) !== JSON.stringify(a)) {
      fail(`${label} #${i + 1} modifié : ${key(e)}`);
    }
  }
  return actual.length - expected.length;
}

function diffLists(label, expected, actual, key) {
  if (expected.length !== actual.length) {
    fail(
      `${label} : ${actual.length} entrées dans l'application contre ${expected.length} dans la source`,
    );
  }
  const max = Math.max(expected.length, actual.length);
  for (let i = 0; i < max; i++) {
    const e = expected[i];
    const a = actual[i];
    if (!e) {
      fail(`${label} #${i + 1} : présent dans l'application mais absent de la source`);
      continue;
    }
    if (!a) {
      fail(`${label} #${i + 1} manquant : ${key(e)}`);
      continue;
    }
    if (JSON.stringify(e) !== JSON.stringify(a)) {
      fail(`${label} #${i + 1} modifié : ${key(e)}`);
    }
  }
}

/* ---------- contrôles de cohérence interne ---------- */

function checkQuestion(themeKey, index, q) {
  const at = `${themeKey} Q${index + 1}`;
  if (!q.q?.trim()) fail(`${at} : énoncé vide`);
  if (!q.e?.trim()) fail(`${at} : explication manquante`);

  if (q.type === "qcm" || q.type === "multi") {
    if (!Array.isArray(q.o) || q.o.length < 2) fail(`${at} : moins de 2 options`);
    if (q.o?.some((o) => !String(o).trim())) fail(`${at} : option vide`);
  }

  switch (q.type) {
    case "qcm":
      if (typeof q.a !== "number" || !q.o?.[q.a])
        fail(`${at} : index de bonne réponse invalide (${q.a})`);
      break;
    case "multi":
      if (!Array.isArray(q.a) || q.a.length === 0)
        fail(`${at} : aucune bonne réponse déclarée`);
      else if (q.a.some((i) => !q.o?.[i]))
        fail(`${at} : index de bonne réponse hors des options (${q.a})`);
      break;
    case "vf":
      if (typeof q.a !== "boolean") fail(`${at} : réponse vrai/faux non booléenne`);
      break;
    case "short":
      if (!String(q.a ?? "").trim()) fail(`${at} : réponse modèle manquante`);
      break;
    default:
      fail(`${at} : type inconnu « ${q.type} »`);
  }
}

function checkExo(index, exo) {
  const at = `Exercice #${index + 1} (${exo.titre ?? "sans titre"})`;
  for (const field of ["cat", "diff", "titre", "enonce", "corrige"]) {
    if (!String(exo[field] ?? "").trim()) fail(`${at} : champ « ${field} » vide`);
  }
}

/* ---------- exécution ---------- */

const html = fs.readFileSync(SOURCE, "utf8");

const srcPlan = evalLiteral(
  normalizeSource(
    literal(html, /const PLAN=(\[[\s\S]*?\n\]);\s*\nfunction renderPlan/, "PLAN"),
  ),
);
const srcBank = evalLiteral(
  normalizeSource(
    literal(html, /const BANK=(\{[\s\S]*?\n\});\s*\n\s*\/\* -+ Quiz engine/, "BANK"),
  ),
);
const srcExos = evalLiteral(
  normalizeSource(
    literal(html, /const EXOS=(\[[\s\S]*?\n\]);\s*\nfunction renderExos/, "EXOS"),
  ),
);

const { BANK } = loadData("bank.ts", ["BANK"]);
const { EXOS } = loadData("exos.ts", ["EXOS"]);
const { PLAN } = loadData("plan.ts", ["PLAN"]);

const srcThemes = Object.keys(srcBank);
const appThemes = Object.keys(BANK);

for (const key of srcThemes) {
  if (!appThemes.includes(key)) fail(`Thème « ${key} » absent de l'application`);
}
for (const key of appThemes) {
  if (!srcThemes.includes(key)) fail(`Thème « ${key} » absent de la source`);
}

let addedQuestions = 0;
for (const key of srcThemes.filter((k) => appThemes.includes(k))) {
  if (srcBank[key].title !== BANK[key].title)
    fail(`Thème « ${key} » : titre différent de la source`);
  addedQuestions += diffPrefix(
    `Thème ${key}`,
    srcBank[key].qs,
    BANK[key].qs,
    (q) => `${q.type} - ${String(q.q).slice(0, 60)}`,
  );
}

diffLists("Exercice", srcExos, EXOS, (e) => `${e.cat} - ${e.titre}`);
compare("Plan de révision", srcPlan, PLAN);

for (const [key, theme] of Object.entries(BANK)) {
  theme.qs.forEach((q, i) => checkQuestion(key, i, q));
}
EXOS.forEach((e, i) => checkExo(i, e));

/* ---------- rapport ---------- */

const totals = Object.values(BANK).reduce(
  (acc, t) => {
    acc.questions += t.qs.length;
    for (const q of t.qs) acc.byType[q.type] = (acc.byType[q.type] ?? 0) + 1;
    return acc;
  },
  { questions: 0, byType: {} },
);

console.log(`Themes            : ${appThemes.length} (source : ${srcThemes.length})`);
console.log(
  `Questions         : ${totals.questions}` +
    (addedQuestions > 0 ? ` (dont ${addedQuestions} ajoutées depuis la source)` : ""),
);
for (const [type, n] of Object.entries(totals.byType)) {
  console.log(`  - ${type.padEnd(6)}      : ${n}`);
}
console.log(`Exercices         : ${EXOS.length} (source : ${srcExos.length})`);
console.log(`Entrees de plan   : ${PLAN.length} (source : ${srcPlan.length})`);

if (problems.length) {
  console.error(`\n${problems.length} probleme(s) :`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nParite complete avec le document source : OK");
