#!/usr/bin/env node
// Intent : List the modules nothing imports, so what deserves existing can be decided.
// Pattern: Run it, then grep one name it flags. There should be no importer.
// Signed. Claude / 2026-09-06 22:05 UTC
//
// Written the hour after being burned by exactly this. A component in
// comfortcurators/Host called three API routes that return 503, and a whole
// finding was written about "blog likes are dead in the UI" — before checking
// that nothing imports the component. It is in no built chunk. The endpoint and
// the caller were both dead and agreed with each other.
//
// The org law is `an import edge is not an execution`. This tool is the weaker,
// cheaper half of that: NO import edge is definitely not an execution.
//
// It resolves real import/require/dynamic-import specifiers rather than grepping
// for filenames, because a basename grep counts a comment or a similarly-named
// variable as a reference and quietly under-reports.
//
// It is a CANDIDATE list, not a delete list. Read the caveats it prints.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, extname } from "node:path";

const ROOT = resolve(process.argv.find((a) => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1]) ?? process.cwd());
const AS_JSON = process.argv.includes("--json");

const CODE = /\.(m|c)?[jt]sx?$/;
const SKIP = new Set(["node_modules", "dist", "build", ".git", ".wrangler", "coverage", "public"]);

// Files that are reachable by definition — a bundler, a runtime or a test
// runner enters here, so "nothing imports it" says nothing about them.
const ENTRY = [
  /(^|\/)(index|main|app|worker|server|client)\.(m|c)?[jt]sx?$/i,
  /\.(test|spec)\.(m|c)?[jt]sx?$/,
  /(^|\/)(vite|craco|tailwind|postcss|eslint|vitest|jest)\.config\./,
  /(^|\/)setup(Tests)?\./i,
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    const p = join(dir, name);
    let s; try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, out);
    else if (CODE.test(name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const known = new Set(files.map((f) => resolve(f)));

/** Resolve a relative specifier the way a bundler would: extensions, then /index. */
function resolveSpecifier(fromFile, spec) {
  if (!spec.startsWith(".")) return null; // bare specifier — a package, not ours
  const base = resolve(dirname(fromFile), spec);
  const candidates = [base];
  const ext = extname(base);
  if (!ext) {
    for (const e of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]) candidates.push(base + e);
    for (const e of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]) candidates.push(join(base, "index" + e));
  } else if ([".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
    // TypeScript ESM writes `import "./app.hono.js"` for a file named
    // `app.hono.ts` — the specifier names the EMITTED file, not the source.
    // Without this, every such import resolves to nothing and the importee is
    // reported as an orphan. It reported SuperhostOS's own mounted app that way,
    // and inflated that package's count from 9 to 64.
    const stem = base.slice(0, -ext.length);
    for (const e of [".ts", ".tsx", ".mts", ".cts"]) candidates.push(stem + e);
  }
  for (const c of candidates) if (known.has(c) && existsSync(c)) return c;
  return null;
}

const SPECIFIER = [
  /\bfrom\s+["'`]([^"'`]+)["'`]/g,          // import x from "y" / export … from "y"
  /\bimport\s*\(\s*["'`]([^"'`]+)["'`]/g,   // dynamic import("y")
  /\brequire\s*\(\s*["'`]([^"'`]+)["'`]/g,  // require("y")
  /\bimport\s+["'`]([^"'`]+)["'`]/g,        // side-effect import "y"
];

const imported = new Set();
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const re of SPECIFIER) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const target = resolveSpecifier(file, m[1]);
      if (target) imported.add(target);
    }
  }
}

const orphans = files
  .map((f) => resolve(f))
  .filter((f) => !imported.has(f))
  .filter((f) => !ENTRY.some((re) => re.test(relative(ROOT, f))))
  .map((f) => relative(ROOT, f))
  .sort();

if (AS_JSON) {
  process.stdout.write(JSON.stringify({
    generated_at: new Date().toISOString(), root: ROOT,
    files: files.length, imported: imported.size, orphans,
  }, null, 2) + "\n");
} else {
  console.log(`${files.length} modules · ${imported.size} imported by something · ${orphans.length} imported by nothing\n`);
  for (const o of orphans) console.log(`  ${o}`);
  console.log(`
  These are CANDIDATES, not a delete list. It cannot see: a module referenced
  only from HTML or a config value, one loaded by a string built at runtime, or
  one another repository imports. Confirm each before removing it — and removing
  a module is a decision, not a cleanup.`);
}
