import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Profile } from './types.js';

export function readSettings(settingsPath: string): Record<string, unknown> {
  if (!existsSync(settingsPath)) {
    return {};
  }
  const raw = readFileSync(settingsPath, 'utf-8');
  return JSON.parse(raw) as Record<string, unknown>;
}

export function writeSettings(settingsPath: string, settings: Record<string, unknown>): void {
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

export function mergeProfileEnv(settingsPath: string, profile: Profile): void {
  const settings = readSettings(settingsPath);
  const currentEnv = (settings.env as Record<string, string>) ?? {};
  settings.env = { ...currentEnv, ...profile.env };
  writeSettings(settingsPath, settings);
}

export function detectActiveProfile(
  settingsPath: string,
  profilesDir: string,
): string | null {
  const settings = readSettings(settingsPath);
  const settingsEnv = settings.env as Record<string, string> | undefined;

  if (!settingsEnv || Object.keys(settingsEnv).length === 0) {
    return null;
  }

  if (!existsSync(profilesDir)) {
    return null;
  }

  const files = readdirSync(profilesDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const name = file.replace(/\.json$/, '');
    const raw = readFileSync(join(profilesDir, file), 'utf-8');
    const profile = JSON.parse(raw) as Profile;
    const profileEnv = profile.env;

    if (isEnvMatch(settingsEnv, profileEnv as unknown as Record<string, string>)) {
      return name;
    }
  }

  return null;
}

function isEnvMatch(
  settingsEnv: Record<string, string>,
  profileEnv: Record<string, string | undefined>,
): boolean {
  const profileKeys = Object.keys(profileEnv).filter((key) => profileEnv[key] !== undefined);
  if (profileKeys.length === 0) return false;

  return profileKeys.every(
    (key) => key in settingsEnv && settingsEnv[key] === profileEnv[key],
  );
}
