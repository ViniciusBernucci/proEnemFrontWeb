import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { AuthCallbackComponent } from './pages/auth/callback/callback.component';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: '',
    canActivate: [authGuard],
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
        ],
      },
      {
        path: 'simulados',
        children: [
          {
            path: 'listar',
            loadComponent: () => import('./pages/cronograma/listar-cronograma/listar-cronograma.component').then((m) => m.ListarCronogramaComponent),
          },
          {
            path: 'criar',
            canActivate: [authGuard],
            loadComponent: () => import('./pages/cronograma/novo-cronograma/novo-cronograma.component').then((m) => m.NovoCronogramaComponent),
          },
        ],
      },
      {
        path: 'registro-estudos',
        children: [
          {
            path: 'tracker',
            canActivate: [authGuard],
            loadComponent: () => import('./features/registro-estudos/tracker/tracker.component').then((m) => m.TrackerComponent),
          },
        ],
      },
      {
        path: 'mentor',
        children: [
          {
            path: 'chat',
            canActivate: [authGuard],
            loadComponent: () => import('./features/mentor/chat/chat.component').then((m) => m.ChatComponent),
          },
        ],
      },
    ],
  },
];
