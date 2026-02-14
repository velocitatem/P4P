import { z } from 'zod';

type Env = z.infer<typeof envSchema>;
const envSchema = z.object({
    STORE_MODE: z.enum(['hotel', 'airline'], {
        message: 'STORE_MODE must be either "hotel" or "airline"'
    }),
    NEXT_PUBLIC_API_BASE: z.string().url({
        message: 'NEXT_PUBLIC_API_BASE must be a valid URL (e.g., http://localhost:3000)'
    }),
    NEXT_PUBLIC_APP_ENV: z.enum(['dev', 'prod'], {
        message: 'NEXT_PUBLIC_APP_ENV must be either "dev" or "prod"'
    }),
    BACKEND_URL: z.string().url({
        message: 'BACKEND_URL must be a valid URL for event ingestion backend'
    }).optional(),
    PRICING_PROVIDER_URL: z.string().url({
        message: 'PRICING_PROVIDER_URL must be a valid URL for pricing service'
    }).optional(),
    NEXT_PUBLIC_HOVER_THRESHOLD: z.coerce.number().int().min(0).default(1200),
});

// parse and validate env at module load, fail fast with descriptive errors
const parseEnv = (): Env => {
    const result = envSchema.safeParse({
        STORE_MODE: process.env.NEXT_PUBLIC_STORE_MODE || process.env.STORE_MODE,
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        BACKEND_URL: process.env.BACKEND_URL,
        PRICING_PROVIDER_URL: process.env.PRICING_PROVIDER_URL,
        NEXT_PUBLIC_HOVER_THRESHOLD: process.env.NEXT_PUBLIC_HOVER_THRESHOLD,
    });
    if (!result.success) {
        const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
        throw new Error(`Environment validation failed:\n${errors}`);
    }
    return result.data;
};

export const config: Env = parseEnv();

// runtime helpers for typed access
export const getBackendUrl = () => config.BACKEND_URL || 'http://localhost:5000';
export const getPricingProviderUrl = () => config.PRICING_PROVIDER_URL || 'http://localhost:5001';
export const getHoverThreshold = () => config.NEXT_PUBLIC_HOVER_THRESHOLD;
