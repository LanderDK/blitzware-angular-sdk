import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BlitzWareAuthModule } from 'blitzware-angular-sdk';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BlitzWareAuthModule.forRoot({
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:4200/callback',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
