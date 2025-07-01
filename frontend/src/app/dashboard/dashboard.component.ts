// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, signOut } from '@angular/fire/auth';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  limit,
  orderBy,
  query,
  where
} from '@angular/fire/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, map, of, switchMap } from 'rxjs';

// Models and Services
import { Report, ReportFormData, UserStats } from '../models/report.model';
import { AuthService } from '../services/auth.service';
import { CloudFunctionsService } from '../services/cloud-functions.service';
import { FirestoreService } from '../services/firestore.service';
import { ToastService } from '../services/toast.service';
import { AIAnalysisReport } from '../types/firestore.types';

// Component imports
import { CommonModule } from '@angular/common';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';
import { ToastComponent } from '../components/toast/toast.component';
import { UploadAnalyzeComponent } from './upload-analyze/upload-analyze.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent, ToastComponent, UploadAnalyzeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Modern dependency injection with inject()
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private auth = inject(Auth);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private cloudFunctions = inject(CloudFunctionsService);
  private toastService = inject(ToastService);
  private firestoreService = inject(FirestoreService);

  // --- State Management with Signals ---

  // Loading states
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showUpgradeModal = signal<boolean>(false);

  // User authentication state
  user$ = this.authService.user$;
  userProfile$ = this.authService.userProfile$;
  isAuthenticated = this.authService.isAuthenticated;

  // Reports signal - automatically updates when data changes in Firestore
  reports = toSignal<Report[], Report[]>(
    this.getReportsForOrganization(),
    { initialValue: [] }
  );

  // AI Analysis Reports signal
  aiAnalysisReports = toSignal<AIAnalysisReport[], AIAnalysisReport[]>(
    this.getAIAnalysisReports(),
    { initialValue: [] }
  );

  // User statistics signal
  userStats = toSignal<UserStats | null>(
    this.getUserStats(),
    { initialValue: null }
  );

  // Form for report generation
  reportForm = this.fb.group({
    prompt: ['', [Validators.required, Validators.minLength(10)]],
    title: [''],
    reportType: ['incident', Validators.required],
    organizationId: ['']
  });

  // Report types for dropdown
  reportTypes = [
    { value: 'incident', label: 'REPORT_TYPES.INCIDENT' },
    { value: 'safety', label: 'REPORT_TYPES.SAFETY' },
    { value: 'audit', label: 'REPORT_TYPES.AUDIT' },
    { value: 'risk', label: 'REPORT_TYPES.RISK' }
  ];

  // Organizations for dropdown (if user has access to multiple)
  organizations = toSignal(
    this.getOrganizations(),
    { initialValue: [] }
  );

  // Computed signals for UI state
  isGenerateButtonDisabled = computed(() =>
    this.loading() || this.reportForm.invalid || this.hasReachedLimit()
  );

  hasReachedLimit = computed(() => {
    const stats = this.userStats();
    if (!stats || stats.subscriptionPlan === 'premium') return false;
    return stats.monthlyReports >= (stats.monthlyLimit || 5);
  });

  dashboardState = computed(() => ({
    user: this.userProfile$(),
    currentOrganization: this.getCurrentOrganization(),
    isLoading: this.loading(),
    error: this.error()
  }));

  ngOnInit() {
    // Set initial organization ID if user has one
    const userProfile = this.userProfile$();
    if (userProfile?.organizationId) {
      this.reportForm.patchValue({
        organizationId: userProfile.organizationId
      });
    }
  }

  /**
   * Gets reports for the current user's organization
   */
  private getReportsForOrganization() {
    return this.authService.userProfile$Observable.pipe(
      switchMap(profile => {
        if (!profile?.organizationId) {
          return of([]);
        }

        const reportsCollection = collection(this.firestore, 'ai-reports');
        const q = query(
          reportsCollection,
          where('organizationId', '==', profile.organizationId),
          orderBy('createdAt', 'desc'),
          limit(10) // Limit to latest 10 reports
        );

        return collectionData(q, { idField: 'id' }).pipe(
          map(data => data as Report[]),
          catchError(error => {
            console.error('Error fetching reports:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Gets user statistics for the dashboard
   */
  private getUserStats() {
    return this.authService.userProfile$Observable.pipe(
      switchMap(profile => {
        if (!profile) return of(null);

        // Calculate monthly reports count
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const reportsCollection = collection(this.firestore, 'ai-reports');
        const monthlyQuery = query(
          reportsCollection,
          where('userId', '==', profile.uid),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
        );

        return collectionData(monthlyQuery).pipe(
          map(reports => ({
            organizationName: profile.organizationName || 'N/A',
            subscriptionPlan: profile.subscriptionPlan,
            monthlyReports: reports.length,
            monthlyLimit: profile.subscriptionPlan === 'premium' ? null : 5
          } as UserStats)),
          catchError(() => of({
            organizationName: profile.organizationName || 'N/A',
            subscriptionPlan: profile.subscriptionPlan,
            monthlyReports: 0,
            monthlyLimit: profile.subscriptionPlan === 'premium' ? null : 5
          } as UserStats))
        );
      })
    );
  }

  /**
   * Gets organizations user has access to
   */
  private getOrganizations() {
    return this.authService.userProfile$Observable.pipe(
      map(profile => {
        if (!profile) return [];

        // For now, return current organization
        // In future, could support multiple organizations
        return [{
          id: profile.organizationId,
          name: profile.organizationName || 'Organization'
        }];
      })
    );
  }

  /**
   * Gets current organization info
   */
  private getCurrentOrganization() {
    const profile = this.userProfile$();
    return profile ? {
      id: profile.organizationId,
      name: profile.organizationName || 'Organization'
    } : null;
  }

  /**
   * Gets AI analysis reports for the current user
   */
  private getAIAnalysisReports() {
    return this.authService.userProfile$Observable.pipe(
      switchMap(async (profile) => {
        if (!profile) return [];

        try {
          const reports = await this.firestoreService.getUserAIAnalysisReports();
          return reports;
        } catch (error) {
          console.error('Error fetching AI analysis reports:', error);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error in AI analysis reports stream:', error);
        return of([]);
      })
    );
  }

  /**
   * Load AI analysis reports manually (for refresh functionality)
   */
  async refreshAIAnalysisReports() {
    try {
      this.loading.set(true);
      const reports = await this.firestoreService.getUserAIAnalysisReports();
      // The signal will automatically update through the stream
      this.toastService.showSuccess('Reports refreshed successfully');
    } catch (error) {
      console.error('Error refreshing AI analysis reports:', error);
      this.toastService.showError('Failed to refresh reports');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Generates a new AI report with multilingual support
   */
  async generateReport() {
    if (this.isGenerateButtonDisabled()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const formData = this.reportForm.value as ReportFormData;
      const userProfile = this.userProfile$();

      if (!userProfile) {
        throw new Error('User not authenticated');
      }

      // Check monthly limit for free users
      if (this.hasReachedLimit()) {
        this.showUpgradeModal.set(true);
        return;
      }

      // Get multilingual base prompt
      const currentLang = this.translate.currentLang || 'pt';
      const basePromptKey = 'DASHBOARD.AI_BASE_PROMPT';
      const translatedBase = await firstValueFrom(this.translate.get(basePromptKey));

      const finalPrompt = `${translatedBase}\n\nTipo de relatório: ${formData.reportType}\nTítulo: ${formData.title || 'Relatório HSE'}\n\nDescrição da situação:\n${formData.prompt}`;

      // Use CloudFunctionsService instead of direct fetch
      const response = await this.cloudFunctions.generateAiReport({
        prompt: finalPrompt,
        reportType: formData.reportType || 'incident'
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate report');
      }

      // Save to Firestore
      const reportsRef = collection(this.firestore, 'ai-reports');
      await addDoc(reportsRef, {
        prompt: formData.prompt,
        response: response.result,
        title: formData.title || `Relatório ${formData.reportType}`,
        type: formData.reportType,
        createdAt: Timestamp.now(),
        userId: userProfile.uid,
        organizationId: userProfile.organizationId,
        aiGenerated: true
      });

      // Reset form on success
      this.reportForm.reset({
        reportType: 'incident',
        organizationId: userProfile.organizationId
      });

      // Show success message using ToastService
      this.toastService.showSuccess('Relatório gerado com sucesso!');

    } catch (err: any) {
      console.error('Error generating report:', err);
      this.error.set(
        err.message || 'Erro ao gerar relatório. Tente novamente.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Navigates to pricing page
   */
  navigateToPricing() {
    this.router.navigate(['/pricing']);
    this.showUpgradeModal.set(false);
  }

  /**
   * Closes upgrade modal
   */
  closeUpgradeModal() {
    this.showUpgradeModal.set(false);
  }

  /**
   * Logs out the user
   */
  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      // Optionally, you can store the file in a service or state for use in the AI Analyze page
      // For now, just navigate to the AI Analyze page
      this.router.navigate(['/ai-analyze']);
    }
  }
}
