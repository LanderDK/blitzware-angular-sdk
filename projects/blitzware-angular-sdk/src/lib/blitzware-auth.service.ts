import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BLITZWARE_AUTH_PARAMS,
} from './types';
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

@Injectable({
  providedIn: 'root',
})
export class BlitzWareAuthService {
  private authState = new BehaviorSubject<boolean>(isTokenValid());
  private user = new BehaviorSubject<BlitzWareAuthUser | null>(null);
  private loading = new BehaviorSubject<boolean>(true);

  constructor(
    @Inject(BLITZWARE_AUTH_PARAMS) private authParams: BlitzWareAuthParams
  ) {
    this.checkAuthState();
  }

  async checkAuthState(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (hasAuthParams()) {
        const urlParams = new URLSearchParams(window.location.search);

        const state = urlParams.get('state');
        if (state !== getState()) {
          this.authState.next(false);
          this.loading.next(false);
          resolve();
          return;
        }

        const access_token = urlParams.get('access_token');
        if (access_token) {
          setToken('access_token', access_token);
          const user = await fetchUserInfo(access_token);
          this.user.next(user);
          this.authState.next(true);
          this.loading.next(false);
        } else {
          this.authState.next(false);
          this.loading.next(false);
        }

        const refresh_token = urlParams.get('refresh_token');
        if (refresh_token) setToken('refresh_token', refresh_token);
      } else {
        if (isTokenValid()) {
          const user = await fetchUserInfo(getToken('access_token') as string);
          this.user.next(user);
          this.authState.next(true);
        }
        this.loading.next(false);
      }
      resolve();
    });
  }

  login(): void {
    const newState = nanoid();
    setState(newState);
    const newAuthUrl = generateAuthUrl(this.authParams, newState);
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
