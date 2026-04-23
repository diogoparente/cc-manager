import { mkdirSync } from 'node:fs';
import chalk from 'chalk';
import { runWizard } from '../wizard.js';
import { saveProfile, profileExists } from '../profiles.js';
import { PROFILES_DIR } from '../constants.js';

export async function createCommand(name: string): Promise<void> {
  if (profileExists(PROFILES_DIR, name)) {
    console.error(chalk.red(`Profile '${name}' already exists. Use 'cc-manager edit ${name}' to modify it.`));
    process.exit(1);
  }

  mkdirSync(PROFILES_DIR, { recursive: true });

  console.log(chalk.cyan(`Creating profile '${name}'...`));
  const profile = await runWizard();
  saveProfile(PROFILES_DIR, name, profile);
  console.log(chalk.green(`Profile '${name}' created successfully.`));
}
