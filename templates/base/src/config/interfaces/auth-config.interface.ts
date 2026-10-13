import { StrategyOptions as StrategyOptionsGoogle } from 'passport-google-oauth20';

export interface AuthConfig {
  session: {
    secret: string;
    name: string;
    cookie: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: boolean | 'lax' | 'strict' | 'none';
      maxAge: number;
    };
  };
  oauth: {
    google: Partial<StrategyOptionsGoogle>;
  };
}
