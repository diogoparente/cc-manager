#!/usr/bin/env node
import { Command } from 'commander';
import { createCommand } from '../commands/create.js';
import { editCommand } from '../commands/edit.js';
import { useCommand } from '../commands/use.js';
import { listCommand } from '../commands/list.js';
import { deleteCommand } from '../commands/delete.js';

const program = new Command();

program
  .name('cc-manager')
  .description('Manage Claude Code profiles')
  .version('1.0.0');

program
  .command('create <name>')
  .description('Create a new profile')
  .action(async (name: string) => {
    await createCommand(name);
  });

program
  .command('edit <name>')
  .description('Edit an existing profile')
  .action(async (name: string) => {
    await editCommand(name);
  });

program
  .command('use <name>')
  .description('Switch to a profile')
  .action((name: string) => {
    useCommand(name);
  });

program
  .command('list')
  .description('List all profiles')
  .action(() => {
    listCommand();
  });

program
  .command('delete <name>')
  .description('Delete a profile')
  .action(async (name: string) => {
    await deleteCommand(name);
  });

program.parse();
