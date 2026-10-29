#!/usr/bin/env node
// Renders prompt.template.md with a config file into the automation prompt.
// Usage: node scripts/build-prompt.mjs [config.json] [output.md]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultConfig = existsSync(join(root, "config.local.json")) ? "config.local.json" : "config.example.json";
const configPath = process.argv[2] ?? join(root, defaultConfig);
const outPath = process.argv[3];

const cfg = JSON.parse(readFileSync(configPath, "utf8"));
const template = readFileSync(join(root, "prompt.template.md"), "utf8");

const showList = (shows) =>
  shows.filter((s) => s.feed).map((s) => `- ${s.name}: ${s.feed}`).join("\n") || "- (none)";

const { digest, newsletters, podcasts } = cfg;
const forwarded = newsletters.forwardedFrom ?? [];
const eventDomains = newsletters.eventSenderDomains ?? [];

const values = {
  OWNER_NAME: digest.ownerName,
  RECIPIENT_EMAIL: digest.recipientEmail,
  TIMEZONE: digest.timezone,
  SEND_TIME: digest.sendTime,
  LOOKBACK_HOURS: String(digest.lookbackHours ?? 24),
  READER_FOCUS: digest.readerFocus,
  NEWSLETTER_GROUPS: (digest.newsletterGroups ?? ["Tech", "Finance", "Other"]).join(", "),
  SENDER_QUERY: newsletters.senders.join(" OR "),
  FORWARDED_NOTE: forwarded.length
    ? `Some newsletters arrive forwarded from ${forwarded.join(", ")}; treat a forwarded copy the same as the original and deduplicate by subject.`
    : "",
  EVENTS_STEP: eventDomains.length
    ? `Search: newer_than:1d from:(${eventDomains.join(" OR ")}). List upcoming events only: name, date/time, location, one-line description. Skip reminders for past events, "new message" chatter, and duplicates. Keep this section short.`
    : "Skip this step; leave the Upcoming events section out of the email.",
  PRIORITY_SHOWS: showList(podcasts.priority),
  ONELINER_SHOWS: showList(podcasts.oneLiner),
};

let prompt = template.replace(/\{\{(\w+)\}\}/g, (m, key) => {
  if (!(key in values)) throw new Error(`Unknown placeholder ${m}`);
  return values[key];
});
prompt = prompt.replace(/\n{3,}/g, "\n\n");

const missing = [...podcasts.priority, ...podcasts.oneLiner].filter((s) => !s.feed);
if (missing.length) console.error(`Skipped shows without a feed: ${missing.map((s) => s.name).join(", ")}`);

if (outPath) writeFileSync(outPath, prompt);
else process.stdout.write(prompt);
