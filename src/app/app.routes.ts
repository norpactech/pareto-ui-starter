import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { ProfileCompleteGuard } from './auth/guards/profile-complete.guard';
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { CompleteProfileComponent } from './profile/complete-profile.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)  },  {
    path: 'dashboard',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: DashboardComponent
  },  {
    path: 'complete-profile',
    canActivate: [AuthGuard],
    component: CompleteProfileComponent
  },  {
    path: 'profile',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: ProfileComponent
  },
  {
    path: 'settings',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: SettingsComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
