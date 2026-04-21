import chalk from 'chalk';
import enquirer from 'enquirer';
import ora from 'ora';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { getProjectRoot, readContext, writeContext, contextExists, emptyContext } from './config.js';
import { syncAll } from './sync.js';

const { prompt } = enquirer;

export async function saveCommand(options) {
  console.log(chalk.bold('\n💾 Save Session Context\n'));

  const root = getProjectRoot();
  const ctx = contextExists() ? readContext() : emptyContext();
  const prev = ctx.session;

  const parseList = s => s ? s.split(',').map(i => i.trim()).filter(Boolean) : [];

  const answers = await prompt([
    {
      type: 'input',
      name: 'summary',
      message: 'Session summary',
      initial: options.message || prev.summary
    },
    {
      type: 'input',
      name: 'decisions',
      message: 'Decisions made (comma-separated)'
    },
    {
      type: 'input',
      name: 'inProgress',
      message: 'Work in progress (comma-separated)'
    },
    {
      type: 'input',
      name: 'blockers',
      message: 'Blockers (comma-separated, leave blank if none)'
    },
    {
      type: 'input',
      name: 'nextSteps',
      message: 'Next steps (comma-separated)'
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Free-form notes'
    }
  ]);

  ctx.session = {
    lastUpdated: dayjs().toISOString(),
    summary: answers.summary || prev.summary,
    decisions: parseList(answers.decisions).length ? parseList(answers.decisions) : prev.decisions,
    inProgress: parseList(answers.inProgress),
    blockers: parseList(answers.blockers),
    nextSteps: parseList(answers.nextSteps),
    notes: answers.notes || ''
  };

  const spinner = ora('Saving and syncing...').start();
  writeContext(ctx);
  const synced = syncAll(root, ctx);
  spinner.succeed(`Saved — synced ${synced.length} file${synced.length !== 1 ? 's' : ''}`);

  console.log(chalk.dim('  ' + synced.join(', ')));

  if (options.commit) {
    try {
      const msg = options.message || `chore: update AI context — ${answers.summary}`;
      execSync(`git add .ai/context.json ${synced.join(' ')}`, { cwd: root, stdio: 'ignore' });
      execSync(`git commit -m "${msg}"`, { cwd: root });
      console.log(chalk.green('\n✓ Committed to git'));
    } catch {
      console.log(chalk.yellow('\n⚠  Git commit skipped (no changes or not a git repo)'));
    }
  }

  console.log('\n' + buildResumePrompt(ctx) + '\n');
}

export function buildResumePrompt(ctx) {
  const { project, session } = ctx;
  const lines = [
    chalk.bold('─── Resume Prompt ───────────────────────────────────'),
    '',
    chalk.cyan(`Project: ${project.name}`) + (project.stack?.length ? chalk.dim(` (${project.stack.join(', ')})`) : ''),
    chalk.white(session.summary),
  ];

  if (session.inProgress?.length) {
    lines.push('', chalk.yellow('In progress:'));
    session.inProgress.forEach(i => lines.push(`  • ${i}`));
  }
  if (session.nextSteps?.length) {
    lines.push('', chalk.yellow('Next steps:'));
    session.nextSteps.forEach(n => lines.push(`  • ${n}`));
  }
  if (session.blockers?.length) {
    lines.push('', chalk.red('Blockers:'));
    session.blockers.forEach(b => lines.push(`  • ${b}`));
  }
  if (session.decisions?.length) {
    lines.push('', chalk.dim('Recent decisions:'));
    session.decisions.slice(0, 3).forEach(d => lines.push(chalk.dim(`  • ${d}`)));
  }

  lines.push('', chalk.bold('─────────────────────────────────────────────────────'));
  return lines.join('\n');
}
