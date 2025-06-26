import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth';
import { 
  Organization, 
  HSEReport, 
  UserStats, 
  ReportGenerationRequest, 
  ApiResponse,
  FREE_LIMIT 
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://us-central1-hse-ai-saas.cloudfunctions.net';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  /**
   * Get authenticated headers with Firebase ID token
   */
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.auth.currentUser?.getIdToken() || Promise.resolve('')).pipe(
      map(token => new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }))
    );
  }

  /**
   * Get user organizations
   */
  getOrganizations(): Observable<Organization[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ApiResponse<Organization[]>>(`${this.baseUrl}/getOrganizations`, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erro ao carregar organizações');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new organization
   */
  createOrganization(organization: Partial<Organization>): Observable<Organization> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<ApiResponse<Organization>>(`${this.baseUrl}/createOrganization`, organization, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erro ao criar organização');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user reports with pagination
   */
  getReports(organizationId?: string, limit: number = 10): Observable<HSEReport[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    params.append('limit', limit.toString());

    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ApiResponse<HSEReport[]>>(`${this.baseUrl}/getReports?${params}`, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erro ao carregar relatórios');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Generate AI HSE report
   */
  generateReport(request: ReportGenerationRequest): Observable<HSEReport> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.post<ApiResponse<HSEReport>>(`${this.baseUrl}/generateHSEReport`, request, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erro ao gerar relatório');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user statistics and plan info
   */
  getUserStats(): Observable<UserStats> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ApiResponse<any>>(`${this.baseUrl}/getUserStats`, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          const data = response.data;
          return {
            totalReports: data.totalReports || 0,
            monthlyReports: data.monthlyReports || 0,
            activeOrganizations: data.activeOrganizations || 0,
            lastReportDate: data.lastReportDate,
            reportsThisMonth: data.reportsThisMonth || 0,
            isFreePlan: data.isFreePlan !== false, // Default to free plan
            freeReportsLimit: FREE_LIMIT
          } as UserStats;
        }
        throw new Error(response.error || 'Erro ao carregar estatísticas');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete organization
   */
  deleteOrganization(organizationId: string): Observable<boolean> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete<ApiResponse<any>>(`${this.baseUrl}/deleteOrganization/${organizationId}`, { headers })
      ),
      map(response => {
        if (response.success) {
          return true;
        }
        throw new Error(response.error || 'Erro ao excluir organização');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update organization
   */
  updateOrganization(organizationId: string, updates: Partial<Organization>): Observable<Organization> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.put<ApiResponse<Organization>>(`${this.baseUrl}/updateOrganization/${organizationId}`, updates, { headers })
      ),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erro ao atualizar organização');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete report
   */
  deleteReport(reportId: string): Observable<boolean> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete<ApiResponse<any>>(`${this.baseUrl}/deleteReport/${reportId}`, { headers })
      ),
      map(response => {
        if (response.success) {
          return true;
        }
        throw new Error(response.error || 'Erro ao excluir relatório');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Check if user has reached monthly limit
   */
  checkMonthlyLimit(): Observable<boolean> {
    return this.getUserStats().pipe(
      map(stats => stats.isFreePlan && stats.reportsThisMonth >= stats.freeReportsLimit)
    );
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return user(this.auth);
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Não autorizado. Faça login novamente.';
    } else if (error.status === 403) {
      errorMessage = 'Acesso negado. Verifique suas permissões.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso não encontrado.';
    } else if (error.status === 429) {
      errorMessage = 'Muitas requisições. Tente novamente em alguns minutos.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
    }

    return throwError(() => new Error(errorMessage));
  ***REMOVED***
}
