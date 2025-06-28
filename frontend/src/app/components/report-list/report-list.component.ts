import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, Report } from 'src/app/services/report.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  reports: Report[] = [];

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.reportService.getReportsByUser(user.uid).subscribe(data => {
        this.reports = data as Report[];
      });
    }
  }
}
