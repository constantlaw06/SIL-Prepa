/*
 * Régénère les icônes de l'application à partir des logos SIL Prépa
 * (public/LOGO SIL  PREPA1.svg, fond blanc) vers les conventions de fichiers
 * de Next.js App Router, plus un favicon.ico classique construit à la main.
 *
 * À relancer après tout changement de logo :
 *   npm install sharp   (dépendance non conservée en permanence dans le projet)
 *   node scripts/gen-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = path.join(ROOT, "public/LOGO SIL  PREPA1.svg"); // fond blanc, icône bleue

async function png(size, out) {
  await sharp(LOGO, { density: 384 }).resize(size, size).png().toFile(out);
  console.log("png", size, "->", path.relative(ROOT, out));
}

/** Construit un .ico valide (format moderne : une entrée PNG 32 bits). */
function buildIco(pngPath, outPath) {
  const image = fs.readFileSync(pngPath);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type = icône
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // largeur (32px ; 0 signifierait 256px)
  entry.writeUInt8(32, 1); // hauteur
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // réservé
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits par pixel
  entry.writeUInt32LE(image.length, 8); // taille des données
  entry.writeUInt32LE(6 + 16, 12); // offset des données

  fs.writeFileSync(outPath, Buffer.concat([header, entry, image]));
  console.log("ico ->", path.relative(ROOT, outPath));
}

const appDir = path.join(ROOT, "src/app");

await png(32, path.join(appDir, "icon.png"));
await png(180, path.join(appDir, "apple-icon.png"));
await png(512, path.join(ROOT, "public/icon-512.png"));
await png(192, path.join(ROOT, "public/icon-192.png"));

buildIco(path.join(appDir, "icon.png"), path.join(appDir, "favicon.ico"));

fs.copyFileSync(LOGO, path.join(appDir, "icon.svg"));
console.log("svg -> src/app/icon.svg");

console.log("\nTerminé.");
