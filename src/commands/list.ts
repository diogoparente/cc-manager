import chalk from 'chalk';
import { listProfiles, loadProfile } from '../profiles.js';
import { detectActiveProfile } from '../settings.js';
import { PROFILES_DIR, SETTINGS_FILE } from '../constants.js';

export function listCommand(): void {
  const profiles = listProfiles(PROFILES_DIR);

  if (profiles.length === 0) {
    console.log(chalk.yellow('No profiles found. Create one with: cc-manager create <name>'));
    return;
  }

  const activeName = detectActiveProfile(SETTINGS_FILE, PROFILES_DIR);

  for (const name of profiles) {
    const profile = loadProfile(PROFILES_DIR, name);
    const isActive = name === activeName;
    const prefix = isActive ? chalk.green('*') : ' ';
    const paddedName = name.padEnd(12);
    const label = isActive ? chalk.green(paddedName) : paddedName;

    const host = extractHost(profile.env.ANTHROPIC_BASE_URL);
    const paddedHost = host.padEnd(24);
    const model = profile.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? '(default models)';

    console.log(`${prefix} ${label}${paddedHost}${model}`);
  }
}

function extractHost(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}
