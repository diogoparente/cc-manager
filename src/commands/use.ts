import chalk from 'chalk';
import { loadProfile, profileExists } from '../profiles.js';
import { mergeProfileEnv } from '../settings.js';
import { PROFILES_DIR, SETTINGS_FILE } from '../constants.js';

export function useCommand(name: string): void {
  if (!profileExists(PROFILES_DIR, name)) {
    console.error(chalk.red(`Profile '${name}' not found.`));
    process.exit(1);
  }

  const profile = loadProfile(PROFILES_DIR, name);
  mergeProfileEnv(SETTINGS_FILE, profile);
  console.log(chalk.green(`Switched to profile '${name}'.`));
}
