import { Injectable, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BLITZWARE_AUTH_PARAMS,
  GetAccessTokenOptions,
} from './types';
import {
  generateAuthUrl,
  hasAuthParams,
  isTokenValid,
  setToken,
  setState,
  getState,
  fetchUserInfo,
  exchangeCodeForToken,
  generateSecureState,
  logoutFromService,
  clearSession,
} from './utils';
import { createAccessTokenManager } from './tokenManager';

@Injectable({
  providedIn: 'root',
})
export class BlitzWareAuthService implements OnDestroy {
  private authState = new BehaviorSubject<boolean>(isTokenValid());
  private user = new BehaviorSubject<BlitzWareAuthUser | null>(null);
  private loading = new BehaviorSubject<boolean>(true);
  private didInitialize = false;
  private state: string;
  private accessTokenManager: ReturnType<typeof createAccessTokenManager>;

  constructor(
    @Inject(BLITZWARE_AUTH_PARAMS) private authParams: BlitzWareAuthParams
  ) {
    this.state = getState() || generateSecureState();
    this.accessTokenManager = createAccessTokenManager(authParams, {
      onSessionExpired: () => {
        this.authState.next(false);
        this.user.next(null);
      },
      onSessionRefreshed: () => this.authState.next(true),
    });
    this.accessTokenManager.start();
    this.initializeAuth();
  }

  ngOnDestroy(): void {
    this.accessTokenManager.dispose();
  }

  private async initializeAuth(): Promise<void> {
    if (this.didInitialize) return;
    this.didInitialize = true;

    try {
      if (!hasAuthParams()) {
        if (isTokenValid()) {
          const userData = await fetchUserInfo(
            this.authParams.clientId,
            undefined,
            this.authParams.authBaseUrl
          );
          this.user.next(userData);
          this.authState.next(true);
        } else {
          try {
            const token = await this.getAccessToken({ minValiditySeconds: 0 });
            if (!token) return;
            const userData = await fetchUserInfo(
              this.authParams.clientId,
              undefined,
              this.authParams.authBaseUrl
            );
            this.user.next(userData);
            this.authState.next(true);
          } catch (error) {
            console.error('Failed to refresh token or fetch user info:', error);
          }
        }
      } else {
        await this.handleAuthCallback();
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      clearSession();
      this.authState.next(false);
      this.user.next(null);
    } finally {
      this.loading.next(false);
    }
  }

  private async handleAuthCallback(): Promise<void> {
    try {
      if (hasAuthParams()) {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for error
        const error = urlParams.get('error');
        if (error) {
          const errorDescription = urlParams.get('error_description');
          throw new Error(errorDescription || `OAuth error: ${error}`);
        }

        const state = urlParams.get('state');
        if (state !== this.state) {
          throw new Error('Invalid state parameter');
        }

        const code = urlParams.get('code');
        if (code) {
          // Handle authorization code flow with PKCE
          const tokenResponse = await exchangeCodeForToken(
            code,
            this.authParams.clientId,
            this.authParams.redirectUri,
            this.authParams.authBaseUrl
          );

          // Store tokens
          setToken('access_token', tokenResponse.access_token);
          if (tokenResponse.refresh_token) {
            setToken('refresh_token', tokenResponse.refresh_token);
          }
          if (tokenResponse.id_token) {
            setToken('id_token', tokenResponse.id_token);
          }

          // Fetch user info
          const userData = await fetchUserInfo(
            this.authParams.clientId,
            undefined,
            this.authParams.authBaseUrl
          );
          this.user.next(userData);
          this.authState.next(true);

          // Clean URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }

        // Handle Implicit flow
        const access_token = urlParams.get('access_token');
        if (access_token) {
          setToken('access_token', access_token);
          this.authState.next(true);

          try {
            const userData = await fetchUserInfo(
              this.authParams.clientId,
              undefined,
              this.authParams.authBaseUrl
            );
            this.user.next(userData);
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            clearSession();
            this.authState.next(false);
            this.user.next(null);
          }
        } else {
          this.authState.next(false);
        }

        const refresh_token = urlParams.get('refresh_token');
        if (refresh_token) setToken('refresh_token', refresh_token);

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      console.error('Failed to handle authorization callback:', error);
      clearSession();
      this.authState.next(false);
      this.user.next(null);
    }
  }

  async login(): Promise<void> {
    try {
      const newState = generateSecureState();
      setState(newState);
      this.state = newState;
      const newAuthUrl = await generateAuthUrl(this.authParams, newState);
      window.location.href = newAuthUrl;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.loading.next(true);

    try {
      await logoutFromService(this.authParams.clientId, this.authParams.authBaseUrl);
    } catch (error) {
      // Log the error but continue with local cleanup
      console.error('Failed to logout from service:', error);
    }

    // Always clear local state regardless of service call result
    clearSession();
    this.authState.next(false);
    this.user.next(null);
    this.loading.next(false);
  }

  getAccessToken(options?: GetAccessTokenOptions): Promise<string | null> {
    return this.accessTokenManager.getAccessToken(options);
  }

  get isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  get currentUser(): Observable<BlitzWareAuthUser | null> {
    return this.user.asObservable();
  }

  get isLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  // Synchronous getters for immediate access (similar to React hooks)
  get isAuthenticatedValue(): boolean {
    return this.authState.value;
  }

  get currentUserValue(): BlitzWareAuthUser | null {
    return this.user.value;
  }

  get isLoadingValue(): boolean {
    return this.loading.value;
  }

  /**
   * Check if the current user has the required role(s).
   * @param role - Single role or array of roles to check
   * @param requireAllRoles - If true, user must have ALL roles (AND logic), if false, user needs ANY role (OR logic)
   * @returns True if user has the required role(s), false otherwise.
   */
  hasRole(role?: string | string[], requireAllRoles: boolean = false): boolean {
    const user = this.currentUserValue;
    
    if (!user || !user.roles || !role) {
      return false;
    }

    const userRoles = user.roles;
    const requiredRoles = Array.isArray(role) ? role : [role];

    if (requireAllRoles) {
      // User must have ALL required roles (AND logic)
      return requiredRoles.every(requiredRole => userRoles.includes(requiredRole));
    } else {
      // User must have at least ONE required role (OR logic)
      return requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
    }
  }
}
