import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
            {{ 'PRICING.TITLE' | translate }}
          </h2>
          <p class="mt-4 text-lg text-gray-600">
            {{ 'PRICING.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <!-- Free Plan -->
          <div class="relative bg-white rounded-lg shadow-md p-8">
            <div class="text-center">
              <h3 class="text-2xl font-semibold text-gray-900">{{ 'PLANS.FREE' | translate }}</h3>
              <p class="mt-4 text-sm text-gray-500">{{ 'PRICING.FREE_DESCRIPTION' | translate }}</p>
              <p class="mt-8">
                <span class="text-4xl font-bold text-gray-900">€0</span>
                <span class="text-base font-medium text-gray-500">/{{ 'PRICING.MONTH' | translate }}</span>
              </p>
            </div>
            
            <ul class="mt-8 space-y-3">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.FREE_FEATURES.REPORTS' | translate }}</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.FREE_FEATURES.AI_POWERED' | translate }}</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.FREE_FEATURES.BASIC_SUPPORT' | translate }}</span>
              </li>
            </ul>
            
            <div class="mt-8">
              <button 
                (click)="goToDashboard()"
                class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-medium transition-colors"
              >
                {{ 'PRICING.CURRENT_PLAN' | translate }}
              </button>
            </div>
          </div>

          <!-- Premium Plan -->
          <div class="relative bg-blue-50 rounded-lg shadow-md p-8 border-2 border-blue-200">
            <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ 'PRICING.RECOMMENDED' | translate }}
              </span>
            </div>
            
            <div class="text-center">
              <h3 class="text-2xl font-semibold text-gray-900">{{ 'PLANS.PREMIUM' | translate }}</h3>
              <p class="mt-4 text-sm text-gray-500">{{ 'PRICING.PREMIUM_DESCRIPTION' | translate }}</p>
              <p class="mt-8">
                <span class="text-4xl font-bold text-gray-900">€29</span>
                <span class="text-base font-medium text-gray-500">/{{ 'PRICING.MONTH' | translate }}</span>
              </p>
            </div>
            
            <ul class="mt-8 space-y-3">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.PREMIUM_FEATURES.UNLIMITED_REPORTS' | translate }}</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.PREMIUM_FEATURES.ADVANCED_AI' | translate }}</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.PREMIUM_FEATURES.PRIORITY_SUPPORT' | translate }}</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="ml-3 text-gray-700">{{ 'PRICING.PREMIUM_FEATURES.EXPORT_OPTIONS' | translate }}</span>
              </li>
            </ul>
            
            <div class="mt-8">
              <button 
                (click)="upgradeToPremium()"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                {{ 'PRICING.UPGRADE_NOW' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Back to Dashboard -->
        <div class="mt-12 text-center">
          <button 
            (click)="goToDashboard()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {{ 'PRICING.BACK_TO_DASHBOARD' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent {
  constructor(
    private router: Router,
    private translate: TranslateService
  ) {}

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  upgradeToPremium() {
    // Here you would implement the actual upgrade logic
    // For now, just show an alert
    alert(this.translate.instant('PRICING.UPGRADE_COMING_SOON'));
  }
}
