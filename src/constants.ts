import { homedir } from 'node:os';
import { join } from 'node:path';

function getClaudeConfigDir(): string {
  if (process.env.CLAUDE_CONFIG_DIR) {
    return process.env.CLAUDE_CONFIG_DIR;
  }
  return join(homedir(), '.claude');
}

const CLAUDE_DIR = getClaudeConfigDir();

export const PROFILES_DIR = join(CLAUDE_DIR, 'profiles');
export const SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json');
