import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CloudFunctionsService } from './services/cloud-functions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <ng-container *ngIf="!(user$ | async); else authenticated">
        <!-- Auth Screen -->
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-indigo-600 mb-2">HSE AI SaaS</h1>
              <p class="text-gray-600">Plataforma de Relatórios HSE com Inteligência Artificial</p>
            </div>

            <div class="space-y-6">
              <!-- Register Form -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-gray-800">Criar Conta</h2>
                <form (ngSubmit)="register()" class="space-y-3">
                  <input 
                    class="input" 
                    type="email" 
                    [(ngModel)]="registerEmail" 
                    name="registerEmail" 
                    placeholder="Email" 
                    required
                  >
                  <input 
                    class="input" 
                    type="password" 
                    [(ngModel)]="registerPassword" 
                    name="registerPassword" 
                    placeholder="Password (min 6 caracteres)" 
                    required
                    minlength="6"
                  >
                  <button class="btn-primary" type="submit" [disabled]="loading">
                    {{ loading ? 'Criando...' : 'Registar' }}
                  </button>
                </form>
              </div>

              <!-- Login Form -->
              <div class="bg-white p-6 rounded-lg border border-gray-200">
                <h2 class="text-xl font-semibold mb-4 text-gray-800">Fazer Login</h2>
                <form (ngSubmit)="login()" class="space-y-3">
                  <input 
                    class="input" 
                    type="email" 
                    [(ngModel)]="loginEmail" 
                    name="loginEmail" 
                    placeholder="Email" 
                    required
                  >
                  <input 
                    class="input" 
                    type="password" 
                    [(ngModel)]="loginPassword" 
                    name="loginPassword" 
                    placeholder="Password" 
                    required
                  >
                  <button class="btn-secondary" type="submit" [disabled]="loading">
                    {{ loading ? 'Entrando...' : 'Login' }}
                  </button>
                </form>
              </div>

              <!-- Error Display -->
              <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #authenticated>
        <!-- Authenticated - Show Router Outlet -->
        <router-outlet></router-outlet>
      </ng-template>
    </div>
  `,
  styles: [`
    .input { 
      @apply w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors;
    }
    .btn-primary {
      @apply w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
    }
    .btn-secondary {
      @apply w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
    }
    .btn-danger {
      @apply bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors;
    }
  `]
})
export class AppComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private cloudFunctions = inject(CloudFunctionsService);

  user$: Observable<User | null> = user(this.auth);

  registerEmail = '';
  registerPassword = '';
  loginEmail = '';
  loginPassword = '';
  loading = false;
  error = '';

  ngOnInit() {
    // Listen to auth state changes
    this.user$.subscribe(async (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email);
        await this.checkOnboarding();
      } else {
        console.log('❌ User not authenticated');
        this.router.navigate(['/']);
      }
    });
  }

  async checkOnboarding() {
    try {
      const userData = await this.cloudFunctions.getUserData();
      
      if (userData.needsOnboarding) {
        console.log('🔄 User needs onboarding');
        this.router.navigate(['/onboarding']);
      } else {
        console.log('✅ User onboarding complete');
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('❌ Error checking onboarding:', error);
      // If there's an error, redirect to onboarding to be safe
      this.router.navigate(['/onboarding']);
    }
  }

  async register() {
    if (!this.registerEmail || !this.registerPassword) {
      this.error = 'Por favor preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await createUserWithEmailAndPassword(this.auth, this.registerEmail, this.registerPassword);
      console.log('✅ User registered successfully');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      this.error = this.getFirebaseErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  async login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.error = 'Por favor preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await signInWithEmailAndPassword(this.auth, this.loginEmail, this.loginPassword);
      console.log('✅ User logged in successfully');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      this.error = this.getFirebaseErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/weak-password':
        return 'Password muito fraca (mínimo 6 caracteres)';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-not-found':
        return 'Utilizador não encontrado';
      case 'auth/wrong-password':
        return 'Password incorreta';
      case 'auth/invalid-credential':
        return 'Credenciais inválidas';
      default:
        return 'Erro de autenticação. Tente novamente.';
    }
  }
}
