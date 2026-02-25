import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node20",
  clean: true,
  sourcemap: true,
  minify: false,
  bundle: true,
  splitting: false,
  shims: true,
});
