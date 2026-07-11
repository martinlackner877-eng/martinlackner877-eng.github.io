import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
    title: 'Martin Lackner — Security × Code × AI × Design'
  },
  {
    path: 'work/:slug',
    loadComponent: () => import('./features/project/project-page').then((m) => m.ProjectPage)
  },
  { path: '**', redirectTo: '' }
];
