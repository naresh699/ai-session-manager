#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { initCommand } from './init.js';
import { saveCommand } from './save.js';
import { loadCommand } from './load.js';
import { statusCommand } from './status.js';
import { shareCommand } from './share.js';
import { syncCommand } from './sync.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

program
  .name('aic')
  .description('Cross-tool AI context — one source of truth for Claude, Cursor, Copilot, and more')
  .version(pkg.version);

program
  .command('init')
  .description('Initialise AI context in the current project')
  .option('--team', 'Enable team sharing via git')
  .action(initCommand);

program
  .command('save')
  .description('Save current session state to .ai/context.json and sync all tool files')
  .option('-m, --message <message>', 'Session summary')
  .option('--commit', 'Auto-commit to git after saving')
  .action(saveCommand);

program
  .command('load')
  .description('Print a resume prompt for your AI tool')
  .option('--tool <tool>', 'Target tool: claude | cursor | chat | chatgpt | gemini', 'claude')
  .option('--silent', 'Output raw JSON only (for scripting)')
  .action(loadCommand);

program
  .command('sync')
  .description('Regenerate all tool-specific files from .ai/context.json')
  .action(syncCommand);

program
  .command('status')
  .description('Show current context state and which tool files are present')
  .action(statusCommand);

program
  .command('share')
  .description('Commit and push context for team access')
  .option('-m, --message <message>', 'Git commit message')
  .action(shareCommand);

program.parse();
