import { error } from 'console';
import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV == 'test') {
    config({ path: '.env.test' });
} else {
    config();
}

const createEnvSchema = z.object({
    DATABASE_URL: z.string(),
    DATABASE_CLIENT: z.string()
});


const _env = createEnvSchema.safeParse(process.env);

if (_env.success == false) {
    console.error('Environment variable is invalid or missing!', _env.error.format());
    throw new Error('Environment variable is invalid or missing!');
}

export const env = _env.data;