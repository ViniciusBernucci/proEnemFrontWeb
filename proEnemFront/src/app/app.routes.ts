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
      loadComponent: () => import('./features/main-menu/super-admin/super-admin.component').then((m) => m.SuperAdminComponent),
      children: [
        {
          path: 'dashboard',
          loadComponent: () => import('./features/main-menu/super-admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        },
      ]
    },
  ]
},
];
