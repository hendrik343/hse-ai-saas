// src/app/components/setup-page/setup-page.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';

@Component({
  selector: 'app-setup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.scss']
})
export class SetupPageComponent {
  // Modern dependency injection
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private cloudFunctions = inject(CloudFunctionsService);

  // State management with signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Form setup
  setupForm = this.fb.group({
    orgName: ['', [Validators.required, Validators.minLength(2)]],
    orgType: ['smb', Validators.required]
  });

  // Organization types for dropdown
  organizationTypes = [
    { value: 'startup', label: 'SETUP.ORG_TYPES.STARTUP' },
    { value: 'smb', label: 'SETUP.ORG_TYPES.SMB' },
    { value: 'enterprise', label: 'SETUP.ORG_TYPES.ENTERPRISE' }
  ];

  // Starter plan features
  starterFeatures = [
    { icon: 'file-text', label: 'SETUP.FEATURES.REPORTS_PER_MONTH' },
    { icon: 'users', label: 'SETUP.FEATURES.UP_TO_USERS' },
    { icon: 'layout-dashboard', label: 'SETUP.FEATURES.ANALYTICS_DASHBOARD' },
    { icon: 'mail', label: 'SETUP.FEATURES.EMAIL_SUPPORT' }
  ];

  /**
   * Handle form submission
   */
  async onSubmit() {
    if (this.setupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const formData = this.setupForm.value;
      
      // Create organization using Cloud Functions
      const result = await this.cloudFunctions.createUserOnboarding({
        organizationName: formData.orgName!,
        organizationType: formData.orgType!
      });

      if (result.success) {
        // Navigate to dashboard after successful creation
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error(result.message || 'Failed to create organization');
      }

    } catch (err: any) {
      console.error('Error creating organization:', err);
      this.error.set(
        err.message || 'Erro ao criar organização. Tente novamente.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Mark all form fields as touched for validation display
   */
  private markFormGroupTouched() {
    Object.keys(this.setupForm.controls).forEach(key => {
      const control = this.setupForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string | null {
    const field = this.setupForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return this.translate.instant('SETUP.ERRORS.FIELD_REQUIRED');
      }
      if (field.errors?.['minlength']) {
        return this.translate.instant('SETUP.ERRORS.MIN_LENGTH');
      }
    }
    return null;
  }
}
