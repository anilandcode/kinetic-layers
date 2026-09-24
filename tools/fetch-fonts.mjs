#!/usr/bin/env node
/**
 * Puts General Sans into public/fonts/general-sans/ before a build.
 *
 * Why it is fetched rather than committed: General Sans is licensed under the
 * ITF Free Font License, which allows self-hosting on our own site (§01) but
 * forbids making the font files available through "a repository … or publicly
 * accessible servers" (§02). This repository is public on GitHub, so the files
 * must never be committed — the folder is in .gitignore. Each build downloads
 * the official release from Fontshare and serves it from our own origin, which
 * is exactly the self-hosting the licence permits. See docs/FONTS.md.
 *
 * Never fatal. If Fontshare cannot be reached the build carries on and the
 * type stack in styles/kl-foundations.css falls back to Geist.
 *
 * The font files are not modified, subset or converted — the licence forbids
 * that too — only copied out of the zip.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "fonts", "general-sans");
const SOURCE = "https://api.fontshare.com/v2/fonts/download/general-sans";
const WANTED = [
  "GeneralSans-Light.woff2",
  "GeneralSans-Regular.woff2",
  "GeneralSans-Medium.woff2",
  "GeneralSans-Semibold.woff2",
];

if (WANTED.every((name) => existsSync(join(OUT, name)))) {
  console.log("[fonts] General Sans already present");
  process.exit(0);
}

/** The few entries we want, out of a standard zip. Stored or deflated only. */
function extract(zip, names) {
  const found = new Map();
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip");
  const count = zip.readUInt16LE(eocd + 10);
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error("bad central directory");
    const method = zip.readUInt16LE(p + 10);
    const size = zip.readUInt32LE(p + 20);
    const nameLen = zip.readUInt16LE(p + 28);
    const extraLen = zip.readUInt16LE(p + 30);
    const commentLen = zip.readUInt16LE(p + 32);
    const local = zip.readUInt32LE(p + 42);
    const path = zip.toString("utf8", p + 46, p + 46 + nameLen);
    const base = path.split("/").pop();
    if (names.includes(base) && path.includes("/WEB/")) {
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const data = zip.subarray(start, start + size);
      found.set(base, method === 0 ? Buffer.from(data) : method === 8 ? inflateRawSync(data) : null);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return found;
}

try {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`Fontshare answered ${response.status}`);
  const files = extract(Buffer.from(await response.arrayBuffer()), WANTED);
  mkdirSync(OUT, { recursive: true });
  for (const name of WANTED) {
    const data = files.get(name);
    if (!data) throw new Error(`${name} missing from the release`);
    writeFileSync(join(OUT, name), data);
  }
  console.log(`[fonts] General Sans fetched from Fontshare → public/fonts/general-sans (${WANTED.length} files)`);
} catch (error) {
  console.warn(`[fonts] General Sans not fetched (${error.message}); the site will fall back to Geist.`);
}
