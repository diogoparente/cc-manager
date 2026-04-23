import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  loadProfile,
  saveProfile,
  listProfiles,
  deleteProfile,
  profileExists,
} from '../src/profiles.js';
import type { Profile } from '../src/types.js';

let testDir: string;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'cc-manager-test-'));
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

function writeTestProfile(name: string, profile: Profile) {
  writeFileSync(join(testDir, `${name}.json`), JSON.stringify(profile, null, 2));
}

describe('loadProfile', () => {
  it('loads and parses a profile JSON file', () => {
    const profile: Profile = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'test-token',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
      },
    };
    writeTestProfile('myprofile', profile);

    const result = loadProfile(testDir, 'myprofile');
    expect(result).toEqual(profile);
  });

  it('throws if profile does not exist', () => {
    expect(() => loadProfile(testDir, 'nonexistent')).toThrow(/not found/);
  });
});

describe('saveProfile', () => {
  it('writes a profile JSON file', () => {
    const profile: Profile = {
      env: {
        ANTHROPIC_AUTH_TOKEN: 'test-token',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
      },
    };

    saveProfile(testDir, 'newprofile', profile);

    const raw = readFileSync(join(testDir, 'newprofile.json'), 'utf-8');
    expect(JSON.parse(raw)).toEqual(profile);
  });
});

describe('listProfiles', () => {
  it('returns an empty array when no profiles exist', () => {
    expect(listProfiles(testDir)).toEqual([]);
  });

  it('returns sorted profile names', () => {
    writeTestProfile('zai', { env: { ANTHROPIC_AUTH_TOKEN: 'a', ANTHROPIC_BASE_URL: 'b' } });
    writeTestProfile('nano', { env: { ANTHROPIC_AUTH_TOKEN: 'c', ANTHROPIC_BASE_URL: 'd' } });

    const names = listProfiles(testDir);
    expect(names).toEqual(['nano', 'zai']);
  });
});

describe('deleteProfile', () => {
  it('removes a profile file', () => {
    writeTestProfile('todelete', { env: { ANTHROPIC_AUTH_TOKEN: 'a', ANTHROPIC_BASE_URL: 'b' } });
    expect(existsSync(join(testDir, 'todelete.json'))).toBe(true);

    deleteProfile(testDir, 'todelete');

    expect(existsSync(join(testDir, 'todelete.json'))).toBe(false);
  });

  it('throws if profile does not exist', () => {
    expect(() => deleteProfile(testDir, 'nonexistent')).toThrow(/not found/);
  });
});

describe('profileExists', () => {
  it('returns true when profile exists', () => {
    writeTestProfile('exists', { env: { ANTHROPIC_AUTH_TOKEN: 'a', ANTHROPIC_BASE_URL: 'b' } });
    expect(profileExists(testDir, 'exists')).toBe(true);
  });

  it('returns false when profile does not exist', () => {
    expect(profileExists(testDir, 'nope')).toBe(false);
  });
});
