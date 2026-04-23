export interface ProfileEnv {
  ANTHROPIC_AUTH_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL: string;
  API_TIMEOUT_MS?: string;
  ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
  ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
  ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
}

export interface Profile {
  env: ProfileEnv;
}

export type ApiProvider = 'anthropic' | 'openai' | 'google' | 'xai' | 'together' | 'mistral' | 'custom';

export interface WizardAnswers {
  provider: ApiProvider;
  hasApiKey: boolean;
  apiKey?: string;
  baseUrl: string;
  customBaseUrl?: string;
  timeout: string;
  sonnetModel: string;
  opusModel: string;
  haikuModel: string;
}
