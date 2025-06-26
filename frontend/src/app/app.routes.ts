import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnboardingComponent } from './onboarding.component';
import { PricingComponent } from './pricing.component';
import { authGuard } from './auth.guard';
import { SetupPageComponent } from './components/setup-page/setup-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pricing', component: PricingComponent, canActivate: [authGuard] },
  { path: 'setup', component: SetupPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
