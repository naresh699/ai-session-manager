import chalk from 'chalk';
import boxen from 'boxen';
import enquirer from 'enquirer';
import { writeFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import fsExtra from 'fs-extra';
import { getProjectRoot, AI_DIR, emptyContext, writeContext, contextExists } from './config.js';
import { syncAll } from './sync.js';

const { prompt } = enquirer;
const { ensureDirSync } = fsExtra;

const SUPPORTED_TOOLS = ['claude', 'cursor', 'copilot'];

export async function initCommand(options) {
  const root = getProjectRoot();

  console.log(chalk.bold('\n🔧 Init AI Context\n'));

  if (contextExists()) {
    const { overwrite } = await prompt({
      type: 'confirm',
      name: 'overwrite',
      message: 'Context already exists. Re-initialise?',
      initial: false
    });
    if (!overwrite) return;
  }

  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name',
      initial: root.split('/').pop()
    },
    {
      type: 'input',
      name: 'description',
      message: 'Short description'
    },
    {
      type: 'input',
      name: 'stack',
      message: 'Tech stack (comma-separated, e.g. Node.js, React, PostgreSQL)'
    },
    {
      type: 'input',
      name: 'tools',
      message: 'AI tools to sync (comma-separated: claude, cursor, copilot)',
      initial: 'claude'
    }
  ]);

  const parseList = s => s ? s.split(',').map(i => i.trim().toLowerCase()).filter(Boolean) : [];

  const ctx = emptyContext(answers.name);
  ctx.project.description = answers.description || '';
  ctx.project.stack = parseList(answers.stack);
  ctx.tools = parseList(answers.tools).filter(t => SUPPORTED_TOOLS.includes(t));
  if (!ctx.tools.length) ctx.tools = ['claude'];

  ensureDirSync(join(root, AI_DIR));
  writeContext(ctx);

  writeFileSync(
    join(root, AI_DIR, 'settings.json'),
    JSON.stringify({ team: options.team || false, createdAt: new Date().toISOString() }, null, 2),
    'utf8'
  );

  const synced = syncAll(root, ctx);

  const gitignorePath = join(root, '.gitignore');
  const entry = '\n# AI context — settings are local\n.ai/settings.json\n';
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.ai/settings.json')) appendFileSync(gitignorePath, entry);
  } else {
    writeFileSync(gitignorePath, entry.trim() + '\n', 'utf8');
  }

  console.log('\n' + boxen(
    chalk.green.bold('✓ AI context initialised\n\n') +
    chalk.dim('Context:   ') + chalk.white('.ai/context.json\n') +
    chalk.dim('Tools:     ') + chalk.white(ctx.tools.join(', ') + '\n') +
    chalk.dim('Synced:    ') + chalk.white(synced.join(', ') || 'none'),
    { padding: 1, borderColor: 'green', borderStyle: 'round' }
  ));

  console.log(chalk.dim('\nNext:'));
  console.log(chalk.dim('  aic save     — save session state after your first session'));
  console.log(chalk.dim('  aic sync     — regenerate tool files after editing .ai/context.json\n'));
}
