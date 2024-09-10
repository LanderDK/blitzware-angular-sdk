import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideBlitzWareAuth } from 'blitzware-angular-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideBlitzWareAuth({
      clientId: 'your-client-id',
      redirectUri: 'your-redirect-uri',
    }),
  ],
};
