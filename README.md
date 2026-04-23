# cc-manager

**Switch between Claude Code API configs in one command.**

Claude Code reads its API connection from a single global settings file. If you use multiple providers, keys, or model overrides, you're stuck editing `~/.claude/settings.json` by hand every time you switch. cc-manager gives you named profiles and instant switching instead.

Common scenarios:

- **Multiple providers** — Anthropic, OpenAI, Google, xAI, Mistral, or a local model server (Ollama, LM Studio)
- **Work vs. personal** — separate API keys on the same provider
- **Model overrides** — point the "sonnet" or "opus" tier at specific model versions per project
- **Local vs. cloud** — `127.0.0.1:1234` for testing, `api.anthropic.com` for production

## Install

```bash
npm install -g @diogoparente/cc-manager
```

## Run without installing

```bash
npx @diogoparente/cc-manager <command>
```

## Usage

### Create a profile

```bash
cc-manager create <my-profile-name>
```

Interactive wizard will prompt for:

- API Provider (Anthropic, OpenAI, Google, xAI, Mistral, Together AI, or Custom)
- API Key (masked input)
- Base URL
- API Timeout
- Default model overrides (optional)

### Switch to a profile

```bash
cc-manager use <my-profile-name>
```

Merges the profile's environment variables into Claude Code's `settings.json`. Persists until you switch again.

### List profiles

```bash
cc-manager list
```

Shows all profiles with an `*` next to the active one.

### Edit a profile

```bash
cc-manager edit <my-profile-name>
```

Re-runs the wizard with current values pre-filled.

### Delete a profile

```bash
cc-manager delete <my-profile-name>
```

Prompts for confirmation. Warns if the profile is currently active.

## Profile Storage

Profiles are stored as JSON files in `<claude-config-dir>/profiles/<name>.json`.

### Config directory resolution

`cc-manager` resolves the Claude Code config directory in this order:

1. **`CLAUDE_CONFIG_DIR`** environment variable (if set)
2. **`~/.claude`** (default on all platforms)

This works out of the box on macOS, Linux, and Windows.

## License

MIT
