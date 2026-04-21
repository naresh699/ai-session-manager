# ai-context

> Cross-tool AI context layer — one source of truth for Claude, Cursor, Copilot, and more.

**The problem:** Every AI tool has its own memory. Switch from Claude to Cursor mid-task, start a new session, or hand off to a teammate — and context is gone. You re-explain from scratch every time.

**The fix:** One `.ai/context.json` file. One `aic save`. All your tools stay in sync.

---

## Install

```bash
npm install -g @naresh699/ai-context
```

---

## How it works

```
.ai/context.json          ← single source of truth (commit this)
       │
       ├──► CLAUDE.md                        (Claude Code)
       ├──► .cursorrules                     (Cursor)
       └──► .github/copilot-instructions.md  (GitHub Copilot)
```

You edit context once. `aic sync` (or `aic save`) regenerates all tool files automatically.

---

## Quick start

```bash
# 1. Init in your project
aic init

# 2. End of session — save and sync
aic save

# 3. Start of next session — print resume prompt
aic load

# 4. Paste the prompt as your first message in Claude / Cursor / ChatGPT
```

---

## Commands

### `aic init`
Scaffolds `.ai/context.json` and generates tool-specific files for the tools you choose.

```bash
aic init           # interactive setup
aic init --team    # enable team sharing (commits context.json)
```

### `aic save`
Interactively captures session state, writes to `.ai/context.json`, and syncs all tool files.

```bash
aic save
aic save --commit                    # save + git commit
aic save -m "end of LP-13157"        # save with message
```

Captures: summary, decisions, work in progress, blockers, next steps, notes.

### `aic load`
Reads context and prints a formatted resume prompt.

```bash
aic load                  # for Claude Code / Cursor (formatted)
aic load --tool chat      # copyable plain-text prompt for Claude Chat / ChatGPT / Gemini
aic load --silent         # raw JSON for scripting
```

### `aic sync`
Regenerates all tool files from `.ai/context.json` without prompting. Use this after editing the JSON directly.

```bash
aic sync
```

### `aic status`
Shows which files exist and summarises the last saved session.

```bash
aic status
```

### `aic share`
Commits context and tool files to git and pushes for team access.

```bash
aic share
aic share -m "EOD handoff — LP-13157 in progress"
```

Teammates:
```bash
git pull && aic load
```

---

## File structure

```
your-project/
├── .ai/
│   ├── context.json          ← commit this (shared context)
│   └── settings.json         ← local only (gitignored)
├── CLAUDE.md                 ← generated (Claude Code)
├── .cursorrules              ← generated (Cursor)
└── .github/
    └── copilot-instructions.md  ← generated (GitHub Copilot)
```

Commit `.ai/context.json` and the generated tool files. Keep `.ai/settings.json` gitignored (it's local config).

---

## Team workflow

```bash
# Developer A — end of day
aic save
aic share -m "EOD: LP-13157 in progress, blocked on token refresh"

# Developer B — next morning
git pull
aic load
# Paste resume prompt → picks up exactly where A left off
```

---

## Why not just use each tool's native memory?

- Claude's memory doesn't follow you to Cursor
- Cursor's rules don't sync to Copilot
- None of them share state across teammates
- All of them lose session-level context (decisions, WIP, blockers) when a conversation ends

`ai-context` is the neutral layer that none of them will build because they each want to be your only tool.

---

## Requirements

- Node.js 18+
- Git (for `share` command)

---

## License

MIT
