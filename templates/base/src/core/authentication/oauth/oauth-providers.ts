import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthConfig } from '../../../config/interfaces/auth-config.interface.js';

export interface OAuthProfile {
  id: string;
  provider: string;
  emails?: { value: string; verified?: boolean }[];
  displayName?: string;
}

export type OAuthVerifyCallback = (
  accessToken: string,
  refreshToken: string,
  profile: OAuthProfile,
  done: (error: Error | null, user?: unknown) => void,
) => void;

export interface OAuthProviderDefinition {
  name: string;
  isEnabled(config: AuthConfig): boolean;
  buildStrategy(config: AuthConfig, verify: OAuthVerifyCallback): unknown;
}

const isConfigured = (value?: string): boolean =>
  value !== undefined && value !== '' && !value.startsWith('your-');

export const OAUTH_PROVIDERS: OAuthProviderDefinition[] = [
  {
    name: 'google',
    isEnabled: (config) =>
      isConfigured(config.oauth.google.clientID) &&
      isConfigured(config.oauth.google.clientSecret) &&
      isConfigured(config.oauth.google.callbackURL),
    buildStrategy: (config, verify) => {
      const { clientID, clientSecret, callbackURL, scope } = config.oauth.google;
      return new GoogleStrategy(
        {
          clientID: clientID!,
          clientSecret: clientSecret!,
          callbackURL: callbackURL!,
          scope,
        },
        verify as VerifyCallback,
      );
    },
  },
];
