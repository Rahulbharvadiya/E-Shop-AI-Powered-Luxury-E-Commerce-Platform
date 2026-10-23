import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters for security'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters for security'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  WAREHOUSE_PINCODE: z.string().default('560001'),
  DEFAULT_USER_PINCODE: z.string().default('560035'),
  FREE_DELIVERY_ABOVE: z.coerce.number().default(499),
  DELIVERY_FEE: z.coerce.number().default(40),
  // Optional mail configurations
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  // Optional Gemini API Key
  GEMINI_API_KEY: z.string().optional()
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ FATAL: Invalid or missing required environment variables:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  process.exit(1);
}

export const env = parsedEnv;
