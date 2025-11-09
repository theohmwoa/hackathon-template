import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full'
  },
  {
    path: 'app',
    loadComponent: () => import('./features/main-app/main-app.component').then(m => m.MainAppComponent),
    canActivate: [authGuard],
    title: 'Collabolt - AI Chat'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Collabolt'
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
    title: 'Sign Up - Collabolt'
  },
  {
    path: '**',
    redirectTo: '/app'
  }
];
