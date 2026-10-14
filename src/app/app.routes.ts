import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home-page').then((m) => m.HomePage), data: { lang: 'de' } },
  { path: 'en', loadComponent: () => import('./home/home-page').then((m) => m.HomePage), data: { lang: 'en' } },
  { path: '**', redirectTo: '' }
];
