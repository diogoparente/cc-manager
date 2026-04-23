import inquirer from 'inquirer';
import type { Profile, ProfileEnv, WizardAnswers, ApiProvider } from './types.js';

const PROVIDER_DEFAULTS: Record<ApiProvider, string> = {
  anthropic: 'https://api.anthropic.com',
  openai: 'https://api.openai.com/v1',
  google: 'https://generativelanguage.googleapis.com',
  xai: 'https://api.x.ai/v1',
  together: 'https://api.together.xyz/v1',
  mistral: 'https://api.mistral.ai/v1',
  custom: '',
};

export async function runWizard(existing?: Profile): Promise<Profile> {
  const existingEnv = existing?.env;

  // @ts-expect-error inquirer v13 types don't support prompt with array properly
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'API Provider (anthropic, openai, google, xai, together, custom):',
      choices: [
        { name: 'anthropic', value: 'anthropic' as ApiProvider },
        { name: 'openai', value: 'openai' as ApiProvider },
        { name: 'google', value: 'google' as ApiProvider },
        { name: 'xai', value: 'xai' as ApiProvider },
        { name: 'together', value: 'together' as ApiProvider },
        { name: 'mistral', value: 'custom' as ApiProvider }, // Map mistral to custom for now
        { name: 'custom', value: 'custom' as ApiProvider },
      ],
      default: existingEnv ? 'custom' : 'anthropic',
    },
    {
      type: 'confirm',
      name: 'hasApiKey',
      message: 'Does this API require an authentication key?',
      default: true,
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key:',
      mask: '*',
      validate: (input: string) => (input.trim() ? true : 'API Key is required'),
      when: (answers: any) => answers.hasApiKey,
    },
    {
      type: 'list',
      name: 'baseUrl',
      message: 'Base URL:',
      choices: (answers: any) => {
        const providerDefault = PROVIDER_DEFAULTS[answers.provider as ApiProvider];

        let suggestions: Array<{ name: string; value: string }>;
        if (!answers.hasApiKey) {
          // Prioritize local URLs when no API key is required
          suggestions = [
            { name: 'http://127.0.0.1:1234 (local LM Studio/Ollama)', value: 'http://127.0.0.1:1234' },
            { name: 'http://localhost:11434 (Ollama)', value: 'http://localhost:11434' },
            { name: 'http://localhost:8000 (local server)', value: 'http://localhost:8000' },
            { name: `${providerDefault} (cloud provider)`, value: providerDefault },
            { name: 'Custom...', value: 'custom' },
          ];
        } else {
          // Show cloud providers first when API key is required
          suggestions = [
            { name: `${providerDefault} (default)`, value: providerDefault },
            { name: 'http://127.0.0.1:1234 (local LM Studio/Ollama)', value: 'http://127.0.0.1:1234' },
            { name: 'http://localhost:8000 (local server)', value: 'http://localhost:8000' },
            { name: 'http://localhost:11434 (Ollama)', value: 'http://localhost:11434' },
            { name: 'Custom...', value: 'custom' },
          ];
        }

        // If editing existing profile, add current value as first choice
        if (existingEnv?.ANTHROPIC_BASE_URL) {
          const currentValue = existingEnv.ANTHROPIC_BASE_URL;
          const currentChoice = suggestions.find(s => s.value === currentValue);
          if (!currentChoice) {
            suggestions.unshift({
              name: `${currentValue} (current)`,
              value: currentValue
            });
          }
        }

        return suggestions;
      },
      default: (answers: Partial<WizardAnswers>) => {
        // If editing existing profile, use current value
        if (existingEnv?.ANTHROPIC_BASE_URL) {
          return existingEnv.ANTHROPIC_BASE_URL;
        }
        // If no API key required, default to local URL
        if (!answers.hasApiKey) {
          return 'http://127.0.0.1:1234';
        }
        // Otherwise use provider default
        return PROVIDER_DEFAULTS[answers.provider as ApiProvider];
      },
    },
    {
      type: 'input',
      name: 'customBaseUrl',
      message: 'Enter custom Base URL:',
      when: (answers: any) => answers.baseUrl === 'custom',
      validate: (input: string) => (input.trim() ? true : 'Base URL is required'),
      default: existingEnv?.ANTHROPIC_BASE_URL,
    },
    {
      type: 'input',
      name: 'timeout',
      message: 'API Timeout (ms):',
      default: existingEnv?.API_TIMEOUT_MS ?? '600000',
    },
    {
      type: 'input',
      name: 'sonnetModel',
      message: 'Default Sonnet Model (optional, enter to skip):',
      default: existingEnv?.ANTHROPIC_DEFAULT_SONNET_MODEL ?? '',
    },
    {
      type: 'input',
      name: 'opusModel',
      message: 'Default Opus Model (optional, enter to skip):',
      default: existingEnv?.ANTHROPIC_DEFAULT_OPUS_MODEL ?? '',
    },
    {
      type: 'input',
      name: 'haikuModel',
      message: 'Default Haiku Model (optional, enter to skip):',
      default: existingEnv?.ANTHROPIC_DEFAULT_HAIKU_MODEL ?? '',
    },
  ]) as WizardAnswers;

  const env: ProfileEnv = {
    ANTHROPIC_BASE_URL: answers.baseUrl === 'custom' ? answers.customBaseUrl! : answers.baseUrl,
  };

  if (answers.hasApiKey && answers.apiKey) {
    env.ANTHROPIC_AUTH_TOKEN = answers.apiKey;
  }

  if (answers.timeout) {
    env.API_TIMEOUT_MS = answers.timeout;
  }
  if (answers.sonnetModel) {
    env.ANTHROPIC_DEFAULT_SONNET_MODEL = answers.sonnetModel;
  }
  if (answers.opusModel) {
    env.ANTHROPIC_DEFAULT_OPUS_MODEL = answers.opusModel;
  }
  if (answers.haikuModel) {
    env.ANTHROPIC_DEFAULT_HAIKU_MODEL = answers.haikuModel;
  }

  return { env };
}
