import { InjectionToken } from '@angular/core';

export interface BlitzWareAuthParams {
  responseType?: 'code' | 'token';
  clientId: string;
  redirectUri: string;
  authBaseUrl?: string;
}

export interface GetAccessTokenOptions {
  minValiditySeconds?: number;
  forceRefresh?: boolean;
  rejectedToken?: string;
}

export const BLITZWARE_AUTH_PARAMS = new InjectionToken<BlitzWareAuthParams>(
  'BlitzWareAuthParams'
);

export interface BlitzWareAuthProviderParams {
  authParams: BlitzWareAuthParams;
}

export interface BlitzWareAuthUser {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
}

/**
 * RFC 7662 OAuth2 Token Introspection Response
 */
export interface TokenIntrospectionResponse {
  active: boolean;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;
  scope?: string;
}

/**
 * Clean authentication context interface
 * Following industry standards for simplicity
 */
export interface BlitzWareAuthContextType {
  user: BlitzWareAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: (options?: GetAccessTokenOptions) => Promise<string | null>;
}

export class BlitzWareAuthError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(message: string, code: string, details?: Record<string, any>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'BlitzWareAuthError';
  }
}
