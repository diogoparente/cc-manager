import { join } from 'node:path';
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'node:fs';
import type { Profile } from './types.js';

export function loadProfile(dir: string, name: string): Profile {
  const filePath = join(dir, `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Profile '${name}' not found`);
  }
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Profile;
}

export function saveProfile(dir: string, name: string, profile: Profile): void {
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(profile, null, 2));
}

export function deleteProfile(dir: string, name: string): void {
  const filePath = join(dir, `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Profile '${name}' not found`);
  }
  unlinkSync(filePath);
}

export function profileExists(dir: string, name: string): boolean {
  return existsSync(join(dir, `${name}.json`));
}

export function listProfiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files = readdirSync(dir);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}
