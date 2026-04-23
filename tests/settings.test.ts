import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  readSettings,
  writeSettings,
  mergeProfileEnv,
  detectActiveProfile,
} from '../src/settings.js';
import type { Profile } from '../src/types.js';

let testDir: string;
let testSettingsPath: string;
let testProfilesDir: string;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'cc-manager-settings-'));
  testSettingsPath = join(testDir, 'settings.json');
  testProfilesDir = join(testDir, 'profiles');
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

function writeSettingsFile(content: Record<string, unknown>) {
  writeFileSync(testSettingsPath, JSON.stringify(content, null, 2));
}

function writeProfile(name: string, profile: Profile) {
  mkdirSync(testProfilesDir, { recursive: true });
  writeFileSync(join(testProfilesDir, `${name}.json`), JSON.stringify(profile, null, 2));
}

describe('readSettings', () => {
  it('reads and parses settings.json', () => {
    writeSettingsFile({ env: { FOO: 'bar' }, permissions: { allow: [] } });
    const result = readSettings(testSettingsPath);
    expect(result).toEqual({ env: { FOO: 'bar' }, permissions: { allow: [] } });
  });

  it('returns empty object when file does not exist', () => {
    const result = readSettings(join(testDir, 'nope.json'));
    expect(result).toEqual({});
  });
});

describe('writeSettings', () => {
  it('writes settings to disk', () => {
    const settings = { env: { FOO: 'bar' } };
    writeSettings(testSettingsPath, settings);
    const raw = readFileSync(testSettingsPath, 'utf-8');
    expect(JSON.parse(raw)).toEqual(settings);
  });
});

describe('mergeProfileEnv', () => {
  it('deep-merges profile env into settings, preserving other keys', () => {
    writeSettingsFile({
      env: { OLD_KEY: 'old-value' },
      permissions: { allow: ['Bash(ls)'] },
    });

    const profile: Profile = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'new-token',
        ANTHROPIC_BASE_URL: 'https://new.example.com',
      },
    };

    mergeProfileEnv(testSettingsPath, profile);

    const result = JSON.parse(readFileSync(testSettingsPath, 'utf-8'));
    expect(result.env.ANTHROPIC_AUTH_TOKEN).toBe('new-token');
    expect(result.env.ANTHROPIC_BASE_URL).toBe('https://new.example.com');
    expect(result.env.OLD_KEY).toBe('old-value');
    expect(result.permissions).toEqual({ allow: ['Bash(ls)'] });
  });

  it('overwrites existing env keys with profile values', () => {
    writeSettingsFile({
      env: { ANTHROPIC_AUTH_TOKEN: 'old-token' },
    });

    const profile: Profile = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'new-token',
        ANTHROPIC_BASE_URL: 'https://example.com',
      },
    };

    mergeProfileEnv(testSettingsPath, profile);

    const result = JSON.parse(readFileSync(testSettingsPath, 'utf-8'));
    expect(result.env.ANTHROPIC_AUTH_TOKEN).toBe('new-token');
  });
});

describe('detectActiveProfile', () => {
  it('returns the profile name whose env matches settings.json env', () => {
    const profile: Profile = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'token-abc',
        ANTHROPIC_BASE_URL: 'https://api.example.com',
      },
    };

    writeSettingsFile({ env: { ...profile.env } });
    writeProfile('matched', profile);
    writeProfile('other', {
      env: { ANTHROPIC_AUTH_TOKEN: 'different', ANTHROPIC_BASE_URL: 'https://other.com' },
    });

    const result = detectActiveProfile(testSettingsPath, testProfilesDir);
    expect(result).toBe('matched');
  });

  it('returns null when no profile matches', () => {
    writeSettingsFile({ env: { ANTHROPIC_AUTH_TOKEN: 'lonely-token', ANTHROPIC_BASE_URL: 'https://lonely.com' } });

    const result = detectActiveProfile(testSettingsPath, testProfilesDir);
    expect(result).toBeNull();
  });

  it('returns null when settings has no env', () => {
    writeSettingsFile({ permissions: { allow: [] } });

    const result = detectActiveProfile(testSettingsPath, testProfilesDir);
    expect(result).toBeNull();
  });
});
