import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Scroll-Restauration übernimmt der TransitionService (ScrollSmoother),
    // der Router soll nicht dazwischenfunken.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }))
  ]
};
