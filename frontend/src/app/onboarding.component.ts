import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CloudFunctionsService, OnboardingData } from './services/cloud-functions.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-8m12 0V9m0 12h-2M7 3h10M12 7v8"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao HSE AI</h1>
          <p class="text-gray-600">Configure sua organização para começar a usar nossa plataforma de relatórios HSE com IA</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="organizationName" class="block text-sm font-medium text-gray-700 mb-2">
              Nome da Organização *
            </label>
            <input 
              type="text" 
              id="organizationName"
              [(ngModel)]="organizationName" 
              name="organizationName"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ex: Empresa ABC Ltda"
            >
          </div>

          <div>
            <label for="organizationType" class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Organização
            </label>
            <select 
              id="organizationType"
              [(ngModel)]="organizationType" 
              name="organizationType"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="startup">Startup</option>
              <option value="sme">Pequena/Média Empresa</option>
              <option value="enterprise">Grande Empresa</option>
              <option value="construction">Construção Civil</option>
              <option value="manufacturing">Indústria</option>
              <option value="oil-gas">Petróleo & Gás</option>
              <option value="mining">Mineração</option>
              <option value="healthcare">Saúde</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Plano Starter Gratuito inclui:</p>
                <ul class="list-disc list-inside space-y-1 text-blue-700">
                  <li>50 relatórios AI por mês</li>
                  <li>10 usuários máximo</li>
                  <li>Dashboard básico</li>
                  <li>Suporte por email</li>
                </ul>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loading || !organizationName"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            <span *ngIf="loading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Configurando...
            </span>
            <span *ngIf="!loading">Criar Organização</span>
          </button>

          <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OnboardingComponent {
  private cloudFunctions = inject(CloudFunctionsService);
  private router = inject(Router);

  organizationName = '';
  organizationType = 'startup';
  loading = false;
  error = '';

  async onSubmit() {
    if (!this.organizationName.trim()) {
      this.error = 'Nome da organização é obrigatório';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const onboardingData: OnboardingData = {
        organizationName: this.organizationName.trim(),
        organizationType: this.organizationType
      };

      const result = await this.cloudFunctions.createUserOnboarding(onboardingData);
      
      if (result.success) {
        console.log('✅ Onboarding completed:', result);
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.error = result.message || 'Erro ao criar organização';
      }
    } catch (error: any) {
      console.error('❌ Onboarding error:', error);
      this.error = error.message || 'Erro interno. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}