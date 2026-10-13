import { registerAs } from '@nestjs/config';
import { CsrfConfig } from './interfaces/csrf-config.interface.js';

export default registerAs(
  'csrf',
  (): CsrfConfig => ({
    // Comma-separated list of origins allowed to send cross-origin,
    // state-changing requests, e.g.
    // CSRF_TRUSTED_ORIGINS="https://app.example.com,http://localhost:5173".
    // Falls back to FRONTEND_URL so local dev works with zero config.
    // Each entry must be `scheme://host[:port]` without path or wildcard;
    // invalid entries fail fast at startup in enableCsrfProtection().
    trustedOrigins: (process.env.CSRF_TRUSTED_ORIGINS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }),
);
