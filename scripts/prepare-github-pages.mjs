import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "dist", "public");
const destination = resolve(root, "docs");
const rootAssets = resolve(root, "assets");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(resolve(destination, "index.html"), resolve(destination, "404.html"));
await writeFile(resolve(destination, "CNAME"), "4dhotline.online\n", "utf8");

await rm(rootAssets, { recursive: true, force: true });
await cp(resolve(destination, "assets"), rootAssets, { recursive: true });
await cp(resolve(destination, "index.html"), resolve(root, "index.html"));
await cp(resolve(destination, "404.html"), resolve(root, "404.html"));
await cp(resolve(destination, "robots.txt"), resolve(root, "robots.txt"));
await cp(resolve(destination, "sitemap.xml"), resolve(root, "sitemap.xml"));
await writeFile(resolve(root, "CNAME"), "4dhotline.online\n", "utf8");
