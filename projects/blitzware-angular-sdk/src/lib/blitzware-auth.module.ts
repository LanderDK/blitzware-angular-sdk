// src/lib/blitzware-auth.module.ts
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlitzWareAuthService } from './blitzware-auth.service';
import { BlitzWareAuthConfig } from './blitzware-auth.config';
import { BlitzWareAuthParams } from './types';

@NgModule({
  imports: [CommonModule],
  providers: [BlitzWareAuthService],
})
export class BlitzWareAuthModule {
  static forRoot(
    authParams: BlitzWareAuthParams
  ): ModuleWithProviders<BlitzWareAuthModule> {
    return {
      ngModule: BlitzWareAuthModule,
      providers: [{ provide: BlitzWareAuthConfig, useValue: authParams }],
    };
  }
}
