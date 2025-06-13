import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/signin',
    pathMatch: 'full'
  },  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: AppComponent
  },
  {
    path: '**',
    redirectTo: '/auth/signin'
  }
];
