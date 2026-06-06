#!/usr/bin/env node
import { loadRouter, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: genesys-contact-center-risk-router <input.json> [--format markdown|json]");
  process.exit(1);
}

const router = await loadRouter(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(router, null, 2) : renderMarkdown(router));
