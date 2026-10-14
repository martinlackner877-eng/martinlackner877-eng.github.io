import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Markiert, dass JS läuft: erst dann warten Einblende-Animationen auf ihren Auftritt.
document.documentElement.classList.add('js');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
