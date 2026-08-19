import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "dist", "public");
const destination = resolve(root, "docs");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(resolve(destination, "index.html"), resolve(destination, "404.html"));
await writeFile(resolve(destination, "CNAME"), "4dhotline.online\n", "utf8");
