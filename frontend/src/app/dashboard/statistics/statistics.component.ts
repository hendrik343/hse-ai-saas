import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, ChartConfiguration, ChartData } from 'chart.js/auto';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { Report } from '../../services/report.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('reportsChart') reportsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  reports: Report[] = [];
  loading = true;
  error: string | null = null;

  // Chart instances
  private reportsChart: Chart | null = null;
  private riskChart: Chart | null = null;
  private trendChart: Chart | null = null;

  // Statistics data
  totalReports = 0;
  highRiskReports = 0;
  mediumRiskReports = 0;
  lowRiskReports = 0;
  averageRiskScore = 0;

  ngOnInit() {
    this.loadReports();
  }

  ngAfterViewInit() {
    // Charts will be initialized after data loads
  }

  async loadReports() {
    try {
      this.loading = true;
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.error = this.translate.instant('STATISTICS.USER_NOT_AUTHENTICATED');
        return;
      }

      // Get reports for the current user
      const reportsObservable = this.reportService.getReportsByUser(user.uid);
      reportsObservable.subscribe({
        next: (reports) => {
          this.reports = reports as Report[];
          this.calculateStatistics();
          this.initializeCharts();
        },
        error: (error) => {
          console.error('Error loading reports:', error);
          this.error = this.translate.instant('STATISTICS.ERROR_LOADING_REPORTS');
        }
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      this.error = this.translate.instant('STATISTICS.ERROR_LOADING_REPORTS');
    } finally {
      this.loading = false;
    }
  }

  calculateStatistics() {
    this.totalReports = this.reports.length;
    
    // Calculate risk levels based on analysis results
    this.highRiskReports = this.reports.filter(r => this.getRiskLevel(r) === 'high').length;
    this.mediumRiskReports = this.reports.filter(r => this.getRiskLevel(r) === 'medium').length;
    this.lowRiskReports = this.reports.filter(r => this.getRiskLevel(r) === 'low').length;
    
    if (this.totalReports > 0) {
      const totalRiskScore = this.reports.reduce((sum, report) => sum + this.getRiskScore(report), 0);
      this.averageRiskScore = Math.round(totalRiskScore / this.totalReports);
    }
  }

  getRiskLevel(report: Report): string {
    // Determine risk level based on analysis results
    const analysis = report.analysis;
    if (!analysis) return 'low';
    
    const violations = analysis.violations?.join(' ').toLowerCase() || '';
    const risks = analysis.risks?.join(' ').toLowerCase() || '';
    const allText = violations + ' ' + risks;
    
    if (allText.includes('high risk') || allText.includes('critical') || allText.includes('immediate')) {
      return 'high';
    } else if (allText.includes('medium risk') || allText.includes('moderate')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getRiskScore(report: Report): number {
    // Calculate risk score based on analysis content
    const analysis = report.analysis;
    if (!analysis) return 0;
    
    const violations = analysis.violations?.join(' ').toLowerCase() || '';
    const risks = analysis.risks?.join(' ').toLowerCase() || '';
    const allText = violations + ' ' + risks;
    
    let score = 0;
    if (allText.includes('high risk') || allText.includes('critical')) score += 8;
    if (allText.includes('medium risk') || allText.includes('moderate')) score += 5;
    if (allText.includes('low risk') || allText.includes('minor')) score += 2;
    if (allText.includes('immediate')) score += 3;
    if (allText.includes('urgent')) score += 2;
    
    // Add score based on compliance score
    if (analysis.complianceScore < 50) score += 3;
    else if (analysis.complianceScore < 70) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  }

  initializeCharts() {
    this.createReportsByOrganizationChart();
    this.createRiskDistributionChart();
    this.createTrendChart();
  }

  createReportsByOrganizationChart() {
    if (!this.reportsChartRef?.nativeElement) return;

    const orgData = this.getReportsByOrganization();
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: orgData.labels,
        datasets: [{
          data: orgData.data,
          backgroundColor: [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6'  // Purple
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: this.translate.instant('STATISTICS.REPORTS_BY_ORGANIZATION'),
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    ***REMOVED***

    this.reportsChart = new Chart(this.reportsChartRef.nativeElement, config);
  }

  createRiskDistributionChart() {
    if (!this.riskChartRef?.nativeElement) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [
          this.translate.instant('STATISTICS.LOW_RISK'),
          this.translate.instant('STATISTICS.MEDIUM_RISK'),
          this.translate.instant('STATISTICS.HIGH_RISK')
        ],
        datasets: [{
          label: this.translate.instant('STATISTICS.NUMBER_OF_REPORTS'),
          data: [this.lowRiskReports, this.mediumRiskReports, this.highRiskReports],
          backgroundColor: [
            '#10B981', // Green for low risk
            '#F59E0B', // Yellow for medium risk
            '#EF4444'  // Red for high risk
          ],
          borderColor: [
            '#059669',
            '#D97706',
            '#DC2626'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: this.translate.instant('STATISTICS.RISK_DISTRIBUTION'),
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    ***REMOVED***

    this.riskChart = new Chart(this.riskChartRef.nativeElement, config);
  }

  createTrendChart() {
    if (!this.trendChartRef?.nativeElement) return;

    const trendData = this.getReportsTrend();
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: this.translate.instant('STATISTICS.REPORTS_PER_DAY'),
          data: trendData.data,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: this.translate.instant('STATISTICS.REPORTS_TREND_LAST_7_DAYS'),
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    ***REMOVED***

    this.trendChart = new Chart(this.trendChartRef.nativeElement, config);
  }

  getReportsByOrganization() {
    const orgCounts: { [key: string]: number } = {***REMOVED***
    
    this.reports.forEach(report => {
      const org = report.organizationId || 'Unknown';
      orgCounts[org] = (orgCounts[org] || 0) + 1;
    });

    return {
      labels: Object.keys(orgCounts).map(org => this.getOrganizationName(org)),
      data: Object.values(orgCounts)
    ***REMOVED***
  }

  getReportsTrend() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyCounts = last7Days.map(date => {
      return this.reports.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        return reportDate === date;
      }).length;
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString()),
      data: dailyCounts
    ***REMOVED***
  }

  getOrganizationName(orgId: string): string {
    const orgNames: { [key: string]: string } = {
      'luena': this.translate.instant('STATISTICS.LUENA'),
      'cabinda': this.translate.instant('STATISTICS.CABINDA'),
      'huambo': this.translate.instant('STATISTICS.HUAMBO'),
      'Unknown': this.translate.instant('STATISTICS.UNKNOWN')
    ***REMOVED***
    return orgNames[orgId] || orgId;
  }

  getRiskLevelColor(level: string): string {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    ***REMOVED***
    return colors[level as keyof typeof colors] || '#6B7280';
  }

  ngOnDestroy() {
    // Clean up charts
    if (this.reportsChart) {
      this.reportsChart.destroy();
    }
    if (this.riskChart) {
      this.riskChart.destroy();
    }
    if (this.trendChart) {
      this.trendChart.destroy();
    }
  }
}
