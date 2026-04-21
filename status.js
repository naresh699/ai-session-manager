import chalk from 'chalk';
import dayjs from 'dayjs';
import { existsSync } from 'fs';
import { join } from 'path';
import { readContext, contextExists } from './config.js';

export async function statusCommand() {
  const root = process.cwd();

  console.log(chalk.bold('\n📊 AI Context Status\n'));

  const checks = [
    ['.ai/context.json', contextExists()],
    ['CLAUDE.md', existsSync(join(root, 'CLAUDE.md'))],
    ['.cursorrules', existsSync(join(root, '.cursorrules'))],
    ['.github/copilot-instructions.md', existsSync(join(root, '.github', 'copilot-instructions.md'))],
  ];

  checks.forEach(([label, ok]) => {
    console.log(`  ${ok ? chalk.green('✓') : chalk.dim('○')}  ${ok ? chalk.white(label) : chalk.dim(label)}`);
  });

  if (!contextExists()) {
    console.log(chalk.yellow('\n  Run `aic init` to get started\n'));
    return;
  }

  const ctx = readContext();
  if (!ctx) return;

  const { session, project } = ctx;

  console.log('');
  console.log(chalk.bold('Project: ') + chalk.white(project.name));
  if (project.stack?.length) console.log(chalk.dim('Stack:   ') + chalk.white(project.stack.join(', ')));
  if (ctx.tools?.length) console.log(chalk.dim('Tools:   ') + chalk.white(ctx.tools.join(', ')));

  console.log('');
  console.log(chalk.bold('Last session:'));
  console.log(chalk.dim('  Updated:  ') + chalk.white(dayjs(session.lastUpdated).format('MMM D, YYYY h:mm A')));
  console.log(chalk.dim('  Summary:  ') + chalk.white(session.summary));

  if (session.inProgress?.length) {
    const more = session.inProgress.length > 1 ? chalk.dim(` +${session.inProgress.length - 1} more`) : '';
    console.log(chalk.dim('  WIP:      ') + chalk.white(session.inProgress[0]) + more);
  }
  if (session.blockers?.length) {
    console.log(chalk.dim('  Blockers: ') + chalk.red(session.blockers[0]) + (session.blockers.length > 1 ? chalk.dim(` +${session.blockers.length - 1}`) : ''));
  }

  console.log('');
}
