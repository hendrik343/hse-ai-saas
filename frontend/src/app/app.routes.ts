import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnboardingComponent } from './onboarding.component';
import { PricingComponent } from './pricing.component';
import { authGuard } from './auth.guard';
import { SetupPageComponent } from './components/setup-page/setup-page.component';
import { LandingPageComponent } from './landing-page.component';
import { AiAnalyzeComponent } from './ai-analyze/ai-analyze.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pricing', component: PricingComponent, canActivate: [authGuard] },
  { path: 'setup', component: SetupPageComponent, canActivate: [authGuard] },
  { path: 'analyze', component: AiAnalyzeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/' }
];
