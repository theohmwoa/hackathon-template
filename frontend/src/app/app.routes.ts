import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'WebFlow Pro - Build Websites with AI'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - WebFlow Pro'
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
    title: 'Sign Up - WebFlow Pro'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - WebFlow Pro'
  },
  {
    path: 'editor/:projectId',
    loadComponent: () => import('./features/main-app/main-app.component').then(m => m.MainAppComponent),
    canActivate: [authGuard],
    title: 'Editor - WebFlow Pro'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
