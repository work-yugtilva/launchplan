import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Directory that contains this config file (the Next.js app root). */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Parent folder (/Launchplan.dev) has another package-lock.json; without this,
  // Turbopack picks the wrong workspace root and `/` can hang at "Compiling ...".
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
