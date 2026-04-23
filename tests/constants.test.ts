import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('constants', () => {
  const originalEnv = process.env.CLAUDE_CONFIG_DIR;

  beforeEach(() => {
    delete process.env.CLAUDE_CONFIG_DIR;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CLAUDE_CONFIG_DIR = originalEnv;
    } else {
      delete process.env.CLAUDE_CONFIG_DIR;
    }
  });

  it('uses CLAUDE_CONFIG_DIR when set', async () => {
    process.env.CLAUDE_CONFIG_DIR = '/custom/claude/dir';
    const { PROFILES_DIR, SETTINGS_FILE } = await import('../src/constants.js');
    expect(PROFILES_DIR).toBe('/custom/claude/dir/profiles');
    expect(SETTINGS_FILE).toBe('/custom/claude/dir/settings.json');
  });

  it('falls back to ~/.claude when CLAUDE_CONFIG_DIR is not set', async () => {
    const { homedir } = await import('node:os');
    const { PROFILES_DIR, SETTINGS_FILE } = await import('../src/constants.js');
    const expectedDir = `${homedir()}/.claude`;
    expect(PROFILES_DIR).toBe(`${expectedDir}/profiles`);
    expect(SETTINGS_FILE).toBe(`${expectedDir}/settings.json`);
  });
});
