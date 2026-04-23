import chalk from 'chalk';
import { runWizard } from '../wizard.js';
import { loadProfile, saveProfile, profileExists } from '../profiles.js';
import { PROFILES_DIR } from '../constants.js';

export async function editCommand(name: string): Promise<void> {
  if (!profileExists(PROFILES_DIR, name)) {
    console.error(chalk.red(`Profile '${name}' not found.`));
    process.exit(1);
  }

  const existing = loadProfile(PROFILES_DIR, name);
  console.log(chalk.cyan(`Editing profile '${name}'...`));
  const updated = await runWizard(existing);
  saveProfile(PROFILES_DIR, name, updated);
  console.log(chalk.green(`Profile '${name}' updated.`));
}
