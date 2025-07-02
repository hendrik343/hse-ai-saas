import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { 
  Organization, 
  HSEReport, 
  UserStats, 
  DashboardState, 
  ReportGenerationRequest,
  FREE_LIMIT 
} from '../models/dashboard.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // State management
  private dashboardStateSubject = new BehaviorSubject<DashboardState>({
    isLoading: false,
    organizations: [],
    recentReports: [],
    userStats: {
      totalReports: 0,
      monthlyReports: 0,
      activeOrganizations: 0,
      reportsThisMonth: 0,
      isFreePlan: true,
      freeReportsLimit: FREE_LIMIT
    },
    hasReachedLimit: false
  });

  public dashboardState$ = this.dashboardStateSubject.asObservable();

  // Individual observables for components
  public organizations$ = this.dashboardState$.pipe(map(state => state.organizations));
  public recentReports$ = this.dashboardState$.pipe(map(state => state.recentReports));
  public userStats$ = this.dashboardState$.pipe(map(state => state.userStats));
  public isLoading$ = this.dashboardState$.pipe(map(state => state.isLoading));
  public hasReachedLimit$ = this.dashboardState$.pipe(map(state => state.hasReachedLimit));

  constructor(
    private apiService: ApiService,
    private translate: TranslateService
  ) {}

  /**
   * Get current dashboard state
   */
  getCurrentState(): DashboardState {
    return this.dashboardStateSubject.value;
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * Update dashboard state
   */
  private updateState(updates: Partial<DashboardState>): void {
    const currentState = this.getCurrentState();
    this.dashboardStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Initialize dashboard data
   */
  initializeDashboard(): Observable<DashboardState> {
    this.setLoading(true);

    return combineLatest([
      this.loadOrganizations(),
      this.loadUserStats(),
      this.loadRecentReports()
    ]).pipe(
      map(([organizations, userStats, recentReports]) => {
        const hasReachedLimit = userStats.isFreePlan && 
          userStats.reportsThisMonth >= userStats.freeReportsLimit;

        const newState: DashboardState = {
          isLoading: false,
          organizations,
          recentReports,
          userStats,
          hasReachedLimit
        };

        this.dashboardStateSubject.next(newState);
        return newState;
      }),
      catchError(error => {
        this.setLoading(false);
        console.error('Error initializing dashboard:', error);
        throw error;
      })
    );
  }

  /**
   * Load organizations
   */
  loadOrganizations(): Observable<Organization[]> {
    return this.apiService.getOrganizations().pipe(
      tap(organizations => {
        this.updateState({ organizations });
      }),
      catchError(error => {
        console.error('Error loading organizations:', error);
        return of([]);
      })
    );
  }

  /**
   * Load user statistics
   */
  loadUserStats(): Observable<UserStats> {
    return this.apiService.getUserStats().pipe(
      tap(userStats => {
        const hasReachedLimit = userStats.isFreePlan && 
          userStats.reportsThisMonth >= userStats.freeReportsLimit;
        this.updateState({ userStats, hasReachedLimit });
      }),
      catchError(error => {
        console.error('Error loading user stats:', error);
        return of({
          totalReports: 0,
          monthlyReports: 0,
          activeOrganizations: 0,
          reportsThisMonth: 0,
          isFreePlan: true,
          freeReportsLimit: FREE_LIMIT
        });
      })
    );
  }

  /**
   * Load recent reports
   */
  loadRecentReports(): Observable<HSEReport[]> {
    return this.apiService.getReports(undefined, 5).pipe(
      tap(recentReports => {
        this.updateState({ recentReports });
      }),
      catchError(error => {
        console.error('Error loading recent reports:', error);
        return of([]);
      })
    );
  }

  /**
   * Create new organization
   */
  createOrganization(organization: Partial<Organization>): Observable<Organization> {
    this.setLoading(true);

    return this.apiService.createOrganization(organization).pipe(
      tap(newOrg => {
        const currentState = this.getCurrentState();
        const updatedOrgs = [...currentState.organizations, newOrg];
        const updatedStats = {
          ...currentState.userStats,
          activeOrganizations: updatedOrgs.length
        };
        
        this.updateState({
          organizations: updatedOrgs,
          userStats: updatedStats,
          isLoading: false
        });
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Generate HSE report
   */
  generateReport(request: ReportGenerationRequest): Observable<HSEReport> {
    const currentState = this.getCurrentState();
    
    // Check if user has reached limit
    if (currentState.hasReachedLimit) {
      const errorMessage = this.translate.instant('dashboard.limitReached');
      throw new Error(errorMessage);
    }

    this.setLoading(true);

    return this.apiService.generateReport(request).pipe(
      switchMap(newReport => {
        // Refresh stats after generating report
        return this.loadUserStats().pipe(
          switchMap(() => this.loadRecentReports()),
          map(() => newReport)
        );
      }),
      tap(() => {
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Delete organization
   */
  deleteOrganization(organizationId: string): Observable<boolean> {
    this.setLoading(true);

    return this.apiService.deleteOrganization(organizationId).pipe(
      tap(() => {
        const currentState = this.getCurrentState();
        const updatedOrgs = currentState.organizations.filter(org => org.id !== organizationId);
        const updatedStats = {
          ...currentState.userStats,
          activeOrganizations: updatedOrgs.length
        };

        this.updateState({
          organizations: updatedOrgs,
          userStats: updatedStats,
          isLoading: false
        });
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Update organization
   */
  updateOrganization(organizationId: string, updates: Partial<Organization>): Observable<Organization> {
    this.setLoading(true);

    return this.apiService.updateOrganization(organizationId, updates).pipe(
      tap(updatedOrg => {
        const currentState = this.getCurrentState();
        const updatedOrgs = currentState.organizations.map(org => 
          org.id === organizationId ? updatedOrg : org
        );

        this.updateState({
          organizations: updatedOrgs,
          isLoading: false
        });
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Delete report
   */
  deleteReport(reportId: string): Observable<boolean> {
    this.setLoading(true);

    return this.apiService.deleteReport(reportId).pipe(
      switchMap(() => {
        // Refresh both stats and recent reports
        return combineLatest([
          this.loadUserStats(),
          this.loadRecentReports()
        ]);
      }),
      map(() => {
        this.setLoading(false);
        return true;
      }),
      catchError(error => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Refresh all dashboard data
   */
  refreshDashboard(): Observable<DashboardState> {
    return this.initializeDashboard();
  }

  /**
   * Get reports remaining for free users
   */
  getReportsRemaining(): Observable<number> {
    return this.userStats$.pipe(
      map(stats => {
        if (!stats.isFreePlan) return -1; // Unlimited for paid users
        return Math.max(0, stats.freeReportsLimit - stats.reportsThisMonth);
      })
    );
  }

  /**
   * Check if user can generate report
   */
  canGenerateReport(): Observable<boolean> {
    return this.userStats$.pipe(
      map(stats => !stats.isFreePlan || stats.reportsThisMonth < stats.freeReportsLimit)
    );
  }

  /**
   * Get upgrade message based on current state
   */
  getUpgradeMessage(): Observable<string> {
    return this.userStats$.pipe(
      map(stats => {
        if (!stats.isFreePlan) return '';
        
        const remaining = stats.freeReportsLimit - stats.reportsThisMonth;
        
        if (remaining <= 0) {
          return this.translate.instant('dashboard.upgradeMessage.limitReached');
        } else if (remaining <= 2) {
          return this.translate.instant('dashboard.upgradeMessage.almostLimit', { remaining });
        } else {
          return this.translate.instant('dashboard.upgradeMessage.hasReports', { remaining });
        }
      })
    );
  }

  /**
   * Set selected organization
   */
  setSelectedOrganization(organization: Organization | undefined): void {
    this.updateState({ selectedOrganization: organization });
  }

  /**
   * Get selected organization
   */
  getSelectedOrganization(): Observable<Organization | undefined> {
    return this.dashboardState$.pipe(map(state => state.selectedOrganization));
  }
}
