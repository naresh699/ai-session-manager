import chalk from 'chalk';
import boxen from 'boxen';
import { readContext, contextExists } from './config.js';
import { buildResumePrompt } from './save.js';

export async function loadCommand(options) {
  if (!contextExists()) {
    console.log(chalk.yellow('\n⚠  No context found. Run `aic init` first.\n'));
    return;
  }

  const ctx = readContext();
  if (!ctx) {
    console.log(chalk.red('\n✗ Could not read context. File may be corrupted.\n'));
    return;
  }

  if (options.silent) {
    console.log(JSON.stringify(ctx, null, 2));
    return;
  }

  const { project, session } = ctx;
  const tool = options.tool?.toLowerCase() || 'claude';

  if (tool === 'chat' || tool === 'chatgpt' || tool === 'gemini') {
    const lines = [
      `Project: ${project.name}`,
      project.description || '',
      project.stack?.length ? `Stack: ${project.stack.join(', ')}` : '',
      '',
      `Context (last updated ${session.lastUpdated}):`,
      session.summary,
    ];

    if (session.decisions?.length) {
      lines.push('\nDecisions made:');
      session.decisions.forEach(d => lines.push(`- ${d}`));
    }
    if (session.inProgress?.length) {
      lines.push('\nIn progress:');
      session.inProgress.forEach(i => lines.push(`- ${i}`));
    }
    if (session.nextSteps?.length) {
      lines.push('\nNext steps:');
      session.nextSteps.forEach(n => lines.push(`- ${n}`));
    }
    if (session.blockers?.length) {
      lines.push('\nBlockers:');
      session.blockers.forEach(b => lines.push(`- ${b}`));
    }
    if (session.notes) {
      lines.push('\nNotes:', session.notes);
    }

    const copyable = lines.filter(Boolean).join('\n');
    console.log('\n' + boxen(copyable, {
      padding: 1,
      title: 'Copy and paste into Claude Chat / ChatGPT / Gemini',
      borderStyle: 'round'
    }));
    return;
  }

  console.log('\n' + buildResumePrompt(ctx));
  console.log(chalk.dim('\nTool files are kept in sync. Run `aic sync` if you edited .ai/context.json manually.\n'));
}
