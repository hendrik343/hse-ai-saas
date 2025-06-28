import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit, OnDestroy {
  reports: Report[] = [];
  loading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private pdfService: PdfService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadReports(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.subscription.add(
        this.reportService.getReportsByUser(user.uid).subscribe({
          next: (reports) => {
            this.reports = reports as Report[];
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
