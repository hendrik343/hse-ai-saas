import { Routes } from '@angular/router';
import { AiAnalyzeComponent } from './ai-analyze/ai-analyze.component';
import { authGuard } from './auth.guard';
import { SetupPageComponent } from './components/setup-page/setup-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnboardingComponent } from './onboarding.component';
import { PricingComponent } from './pricing.component';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./landing-page/landing-page.module').then(m => m.LandingPageModule) },
  { path: 'try', component: AiAnalyzeComponent },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pricing', component: PricingComponent, canActivate: [authGuard] },
  { path: 'setup', component: SetupPageComponent, canActivate: [authGuard] },
  { path: 'analyze', component: AiAnalyzeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const routerConfig = { useHash: true ***REMOVED***
