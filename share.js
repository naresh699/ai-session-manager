import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { existsSync } from 'fs';
import { join } from 'path';
import { contextExists, getProjectRoot } from './config.js';

export async function shareCommand(options) {
  console.log(chalk.bold('\n🤝 Share Context with Team\n'));

  if (!contextExists()) {
    console.log(chalk.yellow('⚠  No context found. Run `aic init` first.\n'));
    return;
  }

  const root = getProjectRoot();
  const msg = options.message || `chore: update AI context — ${dayjs().format('MMM D HH:mm')}`;

  const filesToStage = [
    '.ai/context.json',
    'CLAUDE.md',
    '.cursorrules',
    '.github/copilot-instructions.md',
  ].filter(f => existsSync(join(root, f)));

  const spinner = ora('Committing and pushing...').start();

  try {
    execSync(`git add ${filesToStage.join(' ')}`, { cwd: root, stdio: 'ignore' });
    execSync(`git commit -m "${msg}"`, { cwd: root });
    execSync('git push', { cwd: root });
    spinner.succeed('Shared');
    console.log(chalk.dim('\nTeammates run: ') + chalk.white('git pull && aic load\n'));
  } catch (err) {
    spinner.fail('Share failed');
    console.log(chalk.red('\n' + (err.message || 'Unknown error') + '\n'));
  }
}
