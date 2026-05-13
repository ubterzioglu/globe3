const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

const env: Record<EnvVar, string> = {} as Record<EnvVar, string>;

const missing: string[] = [];

for (const key of requiredEnvVars) {
  const value = import.meta.env[key];
  if (!value || typeof value !== 'string') {
    missing.push(key);
  } else {
    env[key] = value;
  }
}

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    `Copy .env.example to .env.local and fill in the values.`,
  );
}

export const SUPABASE_URL = env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
