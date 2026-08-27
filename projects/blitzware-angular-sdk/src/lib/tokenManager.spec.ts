import { BlitzWareAuthError } from './types';
import { createAccessTokenManager } from './tokenManager';

describe('access token manager', () => {
  const callbacks = {
    onSessionExpired: jasmine.createSpy('onSessionExpired'),
    onSessionRefreshed: jasmine.createSpy('onSessionRefreshed'),
  };
  const dependencies = {
    clearSession: jasmine.createSpy('clearSession'),
    getToken: jasmine.createSpy('getToken'),
    isTokenValid: jasmine.createSpy('isTokenValid'),
    tryRefreshToken: jasmine.createSpy('tryRefreshToken'),
  };
  const lockRequest = jasmine.createSpy('request').and.callFake(
    async (_name: string, callback: () => Promise<unknown>) => callback(),
  );

  const manager = () => createAccessTokenManager(
    { clientId: 'client', redirectUri: 'https://app.test/callback' },
    callbacks,
    dependencies,
  );

  beforeEach(() => {
    Object.values(callbacks).forEach((spy) => spy.calls.reset());
    Object.values(dependencies).forEach((spy) => spy.calls.reset());
    dependencies.getToken.and.callFake((type: string) =>
      type === 'refresh_token' ? 'refresh-token' : 'expired-token',
    );
    dependencies.isTokenValid.and.returnValue(false);
    lockRequest.calls.reset();
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: lockRequest },
    });
  });

  it('returns a token that is valid beyond the default safety window', async () => {
    dependencies.getToken.and.callFake((type: string) =>
      type === 'access_token' ? 'valid-token' : 'refresh-token',
    );
    dependencies.isTokenValid.and.returnValue(true);

    await expectAsync(manager().getAccessToken()).toBeResolvedTo('valid-token');
    expect(dependencies.isTokenValid).toHaveBeenCalledWith(60);
    expect(dependencies.tryRefreshToken).not.toHaveBeenCalled();
  });

  it('rechecks storage after taking the cross-tab lock', async () => {
    dependencies.getToken.and.returnValues('old-token', 'new-token');
    dependencies.isTokenValid.and.returnValues(false, true);

    await expectAsync(manager().getAccessToken()).toBeResolvedTo('new-token');
    expect(lockRequest).toHaveBeenCalledTimes(1);
    expect(dependencies.tryRefreshToken).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent refreshes', async () => {
    let resolveRefresh!: (value: { access_token: string }) => void;
    dependencies.tryRefreshToken.and.returnValue(new Promise((resolve) => {
      resolveRefresh = resolve;
    }));
    const tokenManager = manager();

    const first = tokenManager.getAccessToken();
    const second = tokenManager.getAccessToken();
    resolveRefresh({ access_token: 'renewed-token' });

    await expectAsync(Promise.all([first, second])).toBeResolvedTo([
      'renewed-token',
      'renewed-token',
    ]);
    expect(dependencies.tryRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('clears a terminal session but preserves a transiently failing one', async () => {
    dependencies.tryRefreshToken.and.rejectWith(new BlitzWareAuthError(
      'Refresh rejected',
      'invalid_grant',
    ));
    await expectAsync(manager().getAccessToken()).toBeResolvedTo(null);
    expect(dependencies.clearSession).toHaveBeenCalledTimes(1);
    expect(callbacks.onSessionExpired).toHaveBeenCalledTimes(1);

    dependencies.clearSession.calls.reset();
    callbacks.onSessionExpired.calls.reset();
    const transient = new BlitzWareAuthError('Unavailable', 'refresh_failed');
    dependencies.tryRefreshToken.and.rejectWith(transient);
    await expectAsync(manager().getAccessToken()).toBeRejectedWith(transient);
    expect(dependencies.clearSession).not.toHaveBeenCalled();
    expect(callbacks.onSessionExpired).not.toHaveBeenCalled();
  });

  it('does not create a background refresh timer', () => {
    const setIntervalSpy = spyOn(window, 'setInterval').and.callThrough();
    const tokenManager = manager();
    tokenManager.start();
    expect(setIntervalSpy).not.toHaveBeenCalled();
    tokenManager.dispose();
  });

  it('synchronizes logout and refreshed sessions from other tabs', () => {
    const tokenManager = manager();
    tokenManager.start();
    const dispatchStorage = (key: string) => {
      const event = new StorageEvent('storage', { key });
      Object.defineProperty(event, 'storageArea', { value: localStorage });
      window.dispatchEvent(event);
    };

    dependencies.getToken.and.returnValue(null);
    dispatchStorage('refresh_token');
    expect(callbacks.onSessionExpired).toHaveBeenCalledTimes(1);

    dependencies.getToken.and.callFake((type: string) =>
      type === 'access_token' ? 'new-token' : 'refresh-token',
    );
    dependencies.isTokenValid.and.returnValue(true);
    dispatchStorage('access_token');
    expect(callbacks.onSessionRefreshed).toHaveBeenCalledTimes(1);
    tokenManager.dispose();
  });
});
