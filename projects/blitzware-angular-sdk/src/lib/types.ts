import { InjectionToken } from '@angular/core';

export interface BlitzWareAuthContextType {
  user: BlitzWareAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

export interface BlitzWareAuthParams {
  responseType?: 'code' | 'token';
  clientId: string;
  redirectUri: string;
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
