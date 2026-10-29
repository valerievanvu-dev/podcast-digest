#!/usr/bin/env node
// Looks up podcast RSS feed links through the public Apple Podcasts search API.
// Usage: node scripts/resolve-feeds.mjs "Show One" "Show Two"   or   node scripts/resolve-feeds.mjs --file shows.txt
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const names = args[0] === "--file"
  ? readFileSync(args[1], "utf8").split("\n").map((l) => l.trim()).filter(Boolean)
  : args;

if (!names.length) {
  console.error('Usage: node scripts/resolve-feeds.mjs "Show name" ... | --file shows.txt');
  process.exit(1);
}

const lookup = async (name) => {
  const url = `https://itunes.apple.com/search?media=podcast&entity=podcast&limit=3&term=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) return { name, error: `HTTP ${res.status}` };
  const { results = [] } = await res.json();
  return {
    name,
    feed: results[0]?.feedUrl ?? null,
    matched: results[0]?.collectionName ?? null,
    alternatives: results.slice(1).map((r) => ({ title: r.collectionName, author: r.artistName, feed: r.feedUrl })),
  };
};

const out = [];
for (const name of names) out.push(await lookup(name));
console.log(JSON.stringify(out, null, 2));
const unsure = out.filter((r) => !r.feed || r.matched?.toLowerCase() !== r.name.toLowerCase());
if (unsure.length) console.error(`Check these matches by hand: ${unsure.map((r) => r.name).join(", ")}`);
