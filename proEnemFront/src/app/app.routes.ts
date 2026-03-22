import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterComponent,
  },
  {
  path: '',
  loadComponent: () => import('./features/features.component').then((m) => m.FeaturesComponent),
  children: [
    {
      path: 'user',
      loadComponent: () => import('./pages/user-dashboard/user-dashboard.component').then((m) => m.UserDashboardComponent),
      children: [
        {
          path: 'dashboard',
          loadComponent: () => import('./pages/user-dashboard/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        },
      ]
    },
  ]
},
];
