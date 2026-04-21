# ai-context

> Cross-tool AI context layer — one source of truth for Claude, Cursor, Copilot, ChatGPT, Gemini, and more.

**The problem:** Every AI tool has its own memory. Switch from Claude to Cursor mid-task, start a new session, or hand off to a teammate — and context is gone. You re-explain from scratch every time.

**The fix:** One `.ai/context.json` file. One `aic save`. All your tools stay in sync.

---

## Install

```bash
npm install -g @naresh699/ai-context
```

---

## Supported tools

| Tool | Type | How context is delivered |
|---|---|---|
| Claude Code | IDE / CLI | Auto-loaded via `CLAUDE.md` |
| Cursor | IDE | Auto-loaded via `.cursorrules` |
| GitHub Copilot | IDE | Auto-loaded via `.github/copilot-instructions.md` |
| Claude Chat | Browser | Paste output of `aic load --tool chat` |
| ChatGPT | Browser | Paste output of `aic load --tool chatgpt` |
| Gemini | Browser | Paste output of `aic load --tool gemini` |

**IDE tools** get context automatically — no copy-paste needed. **Browser tools** get a clean, ready-to-paste prompt.

---

## How it works

```
.ai/context.json          ← single source of truth (commit this)
       │
       ├──► CLAUDE.md                        (Claude Code — auto-loaded)
       ├──► .cursorrules                     (Cursor — auto-loaded)
       ├──► .github/copilot-instructions.md  (GitHub Copilot — auto-loaded)
       │
       └──► aic load --tool chat             (Claude Chat / ChatGPT / Gemini — copy-paste)
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
aic load                       # formatted output for Claude Code / Cursor
aic load --tool chat           # copyable prompt for Claude Chat
aic load --tool chatgpt        # copyable prompt for ChatGPT
aic load --tool gemini         # copyable prompt for Gemini
aic load --silent              # raw JSON for scripting
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
- ChatGPT's memory doesn't know your codebase
- Gemini doesn't know what you decided yesterday
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
