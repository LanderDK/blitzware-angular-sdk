import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BlitzWareAuthUser } from './types';
import {
  generateAuthUrl,
  hasAuthParams,
  fetchUserInfo,
  isTokenValid,
  getToken,
  setToken,
  removeToken,
  setState,
  getState,
  removeState,
} from './utils';
import { nanoid } from 'nanoid';
import { BlitzWareAuthConfig } from './blitzware-auth.config';

@Injectable({
  providedIn: 'root',
})
export class BlitzWareAuthService {
  private authState = new BehaviorSubject<boolean>(isTokenValid());
  private user = new BehaviorSubject<BlitzWareAuthUser | null>(null);
  private loading = new BehaviorSubject<boolean>(true);

  constructor(
    @Inject(BlitzWareAuthConfig) private config: BlitzWareAuthConfig
  ) {
    this.initAuthState();
  }

  private initAuthState(): void {
    if (hasAuthParams()) {
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('state');
      if (state !== getState()) {
        this.authState.next(false);
        this.loading.next(false);
        return;
      }

      const access_token = urlParams.get('access_token');
      if (access_token) {
        setToken('access_token', access_token);
        this.authState.next(true);
        fetchUserInfo(access_token).then((user) => {
          this.user.next(user);
          this.loading.next(false);
        });
      } else {
        this.authState.next(false);
        this.loading.next(false);
      }

      const refresh_token = urlParams.get('refresh_token');
      if (refresh_token) setToken('refresh_token', refresh_token);
    } else {
      this.authState.next(isTokenValid());
      if (isTokenValid()) {
        fetchUserInfo(getToken('access_token') as string).then((user) => {
          this.user.next(user);
          this.loading.next(false);
        });
      }
    }
  }

  login(): void {
    const newState = nanoid();
    setState(newState);
    const newAuthUrl = generateAuthUrl(this.config, newState);
    window.location.href = newAuthUrl;
  }

  logout(): void {
    removeToken('access_token');
    removeToken('refresh_token');
    removeState();
    this.authState.next(false);
    this.user.next(null);
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
}
