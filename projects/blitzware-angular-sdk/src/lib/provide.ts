import { Provider } from '@angular/core';
import { BlitzWareAuthParams, BLITZWARE_AUTH_PARAMS } from './types';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { BlitzWareAuthGuard } from './blitzware-auth.guard';
import { BlitzWareLoginGuard } from './blitzware-login.guard';

export function provideBlitzWareAuth(
  authParams?: BlitzWareAuthParams
): Provider[] {
  return [
    BlitzWareAuthService,
    BlitzWareAuthGuard,
    BlitzWareLoginGuard,
    {
      provide: BLITZWARE_AUTH_PARAMS,
      useValue: authParams,
    },
  ];
}
