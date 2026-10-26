// GitHub Pages no té rewrites: copiam index.html a cada ruta i a 404.html
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

const dist = new URL("../dist/", import.meta.url);
const index = new URL("index.html", dist);
const source = readFileSync(new URL("../src/content/projects.ts", import.meta.url), "utf8");
const slugs = [...source.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);

copyFileSync(index, new URL("404.html", dist));
for (const slug of slugs) {
  const dir = new URL(`projectes/${slug}/`, dist);
  mkdirSync(dir, { recursive: true });
  copyFileSync(index, new URL("index.html", dir));
}

const urls = ["", ...slugs.map((s) => `projectes/${s}/`)].map((p) => `  <url><loc>https://muntaner.game/${p}</loc></url>`);
import("node:fs").then(({ writeFileSync }) =>
  writeFileSync(
    new URL("sitemap.xml", dist),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
  ),
);
console.log(`postbuild: 404.html + ${slugs.length} rutes + sitemap.xml`);
