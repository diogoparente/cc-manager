import inquirer from 'inquirer';
import chalk from 'chalk';
import { deleteProfile, profileExists } from '../profiles.js';
import { detectActiveProfile } from '../settings.js';
import { PROFILES_DIR, SETTINGS_FILE } from '../constants.js';

export async function deleteCommand(name: string): Promise<void> {
  if (!profileExists(PROFILES_DIR, name)) {
    console.error(chalk.red(`Profile '${name}' not found.`));
    process.exit(1);
  }

  const activeName = detectActiveProfile(SETTINGS_FILE, PROFILES_DIR);
  if (name === activeName) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Profile '${name}' is currently active. Delete anyway?`,
        default: false,
      },
    ]);
    if (!confirm) {
      console.log(chalk.yellow('Cancelled.'));
      return;
    }
  } else {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete profile '${name}'?`,
        default: false,
      },
    ]);
    if (!confirm) {
      console.log(chalk.yellow('Cancelled.'));
      return;
    }
  }

  deleteProfile(PROFILES_DIR, name);
  console.log(chalk.green(`Profile '${name}' deleted.`));
}
