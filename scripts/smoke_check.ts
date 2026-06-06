import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const markers = [
  "Genesys Contact Center Risk Router",
  "Customer queue pressure becomes a revenue-risk route",
  "Enterprise renewal escalation",
  "Primary recommendation"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

console.log("smoke ok");
