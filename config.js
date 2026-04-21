import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import fsExtra from 'fs-extra';

const { ensureDirSync } = fsExtra;

export const AI_DIR = '.ai';
export const CONTEXT_FILE = 'context.json';

export function getProjectRoot() {
  return process.cwd();
}

export function getContextPath() {
  return join(getProjectRoot(), AI_DIR, CONTEXT_FILE);
}

export function contextExists() {
  return existsSync(getContextPath());
}

export function readContext() {
  const path = getContextPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

export function writeContext(data) {
  const path = getContextPath();
  ensureDirSync(join(getProjectRoot(), AI_DIR));
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

export function emptyContext(name = '') {
  return {
    version: '1.0',
    project: {
      name: name || 'my-project',
      description: '',
      stack: [],
      conventions: [],
      offLimits: []
    },
    session: {
      lastUpdated: new Date().toISOString(),
      summary: 'New session — no prior context',
      decisions: [],
      inProgress: [],
      blockers: [],
      nextSteps: [],
      notes: ''
    },
    team: [],
    tools: ['claude']
  };
}
