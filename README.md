# Podcast & Newsletter Daily Digest

A daily email that summarizes the newsletters and podcasts you subscribe to. It runs as a scheduled [Factory](https://factory.ai) automation: each morning a Droid reads approved newsletters from Gmail, checks your podcast RSS feeds for new episodes, and emails you one digest.

There is no server to run. This repo holds the configuration and the automation's instructions, plus two small helper scripts.

## What the digest contains

1. **Top 5 today**: the most important items across everything.
2. **Newsletters**: 3-5 takeaways per issue and a "why it matters" line, grouped by topic.
3. **Priority podcasts**: guests, a 4-6 bullet summary, and a "worth listening?" verdict.
4. **Other episodes**: one line each.
5. **Upcoming events**: from Luma, Partiful, and Eventbrite invites (optional).

Podcast summaries use published transcripts and show notes only. Audio is never downloaded or transcribed, which keeps runs fast and cheap. When notes are thin, the digest says so instead of guessing.

## How it works

- **Newsletters**: the Gmail connector reads only the senders you list in the config. Every other email is ignored, and the agent never changes, deletes, or forwards mail.
- **More than one inbox**: Factory connects one Gmail account at a time. To include another inbox, such as a work account, create a Gmail filter there that forwards your newsletter senders to the connected account.
- **Podcasts**: public RSS feeds. `scripts/resolve-feeds.mjs` finds feed links from show names.
- **Delivery**: the agent sends a single email to you with Gmail.

## Setup

Requires Node.js 18 or later and a Factory account.

1. **Create your config**
   ```sh
   cp config.example.json config.local.json
   ```
   Fill in your name, email, time zone, newsletter sender addresses, and shows. `config.local.json` is git-ignored.

2. **Find podcast feeds**
   ```sh
   node scripts/resolve-feeds.mjs "Acquired" "No Priors"
   # or one show name per line:
   node scripts/resolve-feeds.mjs --file shows.txt
   ```
   Check any match the script flags. Many shows share similar names.

3. **Build the automation prompt**
   ```sh
   node scripts/build-prompt.mjs config.local.json prompt.local.md
   ```

4. **Connect Gmail** in the Factory App under **Settings > Connectors**.

5. **Create the automation**: in a Droid session, ask Droid to create a scheduled cloud automation with the contents of `prompt.local.md`, running daily at your chosen time. Cloud automations run even when your computer is off.

## Customizing

- Move a show between `podcasts.priority` and `podcasts.oneLiner` to change how much detail it gets.
- Change `digest.readerFocus` to tune the "why it matters" lines, for example "a product manager" or "a biotech investor".
- Edit `prompt.template.md` to change the digest format, then rebuild the prompt and update the automation.

## Privacy

- Keep personal data in `config.local.json` and `prompt.local.md`. Both are git-ignored.
- **Never commit private feed links.** Paid podcasts (for example Stratechery or Patreon feeds) use personal URLs that work like passwords. Put them only in `config.local.json`.
- The agent is told to ignore instructions inside emails and feeds, and to send only the digest.

## Files

| File | Purpose |
| --- | --- |
| `config.example.json` | Sample configuration to copy |
| `prompt.template.md` | Automation instructions with placeholders |
| `scripts/build-prompt.mjs` | Fills the template from your config |
| `scripts/resolve-feeds.mjs` | Looks up podcast RSS feeds by show name |
