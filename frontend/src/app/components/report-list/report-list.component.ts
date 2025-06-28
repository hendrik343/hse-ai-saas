import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

interface Organization {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
}

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit, OnDestroy {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  loading = true;
  selectedOrganization: string = '';
  private subscription: Subscription = new Subscription();

  organizations: Organization[] = [
    { id: '', name: 'Todas as Organizações', nameEn: 'All Organizations', nameFr: 'Toutes les Organisations' },
    { id: 'luena', name: 'Luena', nameEn: 'Luena', nameFr: 'Luena' },
    { id: 'cabinda', name: 'Cabinda', nameEn: 'Cabinda', nameFr: 'Cabinda' },
    { id: 'huambo', name: 'Huambo', nameEn: 'Huambo', nameFr: 'Huambo' }
  ];

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private pdfService: PdfService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSelectedOrganization();
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSelectedOrganization(): void {
    const saved = localStorage.getItem('selectedOrganization');
    if (saved) {
      this.selectedOrganization = saved;
    }
  }

  saveSelectedOrganization(): void {
    localStorage.setItem('selectedOrganization', this.selectedOrganization);
  }

  loadReports(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.subscription.add(
        this.reportService.getReportsByUser(user.uid).subscribe({
          next: (reports) => {
            this.reports = reports as Report[];
            this.filterReports();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao carregar relatórios:', error);
            this.loading = false;
            this.toastr.error('Erro ao carregar relatórios', 'Erro');
          }
        })
      );
    }
  }

  onOrganizationChange(): void {
    this.saveSelectedOrganization();
    this.filterReports();
  }

  filterReports(): void {
    if (!this.selectedOrganization) {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter(report => 
        report.organizationId === this.selectedOrganization
      );
    }
  }

  getOrganizationName(org: Organization): string {
    const currentLang = localStorage.getItem('language') || 'pt';
    switch (currentLang) {
      case 'en':
        return org.nameEn;
      case 'fr':
        return org.nameFr;
      default:
        return org.name;
    }
  }

  async downloadPDF(report: Report): Promise<void> {
    try {
      this.toastr.info('Gerando PDF...', 'Aguarde');
      await this.pdfService.generateReportPDF(report);
      this.toastr.success('PDF gerado com sucesso!', 'Sucesso');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.toastr.error('Erro ao gerar PDF', 'Erro');
    }
  }

  getRiskColor(riskLevel: string): string {
    switch (riskLevel?.toLowerCase()) {
      case 'alto':
        return '#ef4444';
      case 'médio':
        return '#f59e0b';
      case 'baixo':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  getStatusColor(isCompliant: boolean): string {
    return isCompliant ? '#10b981' : '#ef4444';
  }

  formatDate(timestamp: any): string {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString('pt-BR');
    }
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }
}
