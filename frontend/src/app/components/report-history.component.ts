import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PdfService } from '../services/pdf.service';
import { ReportService } from '../shared/services/report.service';

@Component({
    selector: 'app-report-history',
    templateUrl: './report-history.component.html',
    styleUrls: ['./report-history.component.scss'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
    ],
})
export class ReportHistoryComponent implements OnInit {
    reports$: Observable<any[]> = new Observable();
    reports: any[] = [];
    filteredReports: any[] = [];
    searchTerm: string = '';
    startDate: string = '';
    endDate: string = '';
    filenameFilter = '';
    minSizeFilter: number = 0;
    sortField: string = 'timestamp';
    sortDirection: 'asc' | 'desc' = 'desc';
    userFilter: string = '';

    constructor(
        private reportService: ReportService,
        private authService: AuthService,
        private pdfService: PdfService
    ) { }

    ngOnInit(): void {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            this.reportService.getUserReports(userId).subscribe((reports: any[]) => {
                this.reports = reports;
                this.filteredReports = reports; // Initialize filteredReports
            });
        }
    }

    get filteredAndSortedReports() {
        return this.filteredReports
            .filter(report => {
                const search = this.searchTerm?.toLowerCase() || '';
                const userMatch = report.userId?.toLowerCase().includes(search);
                const dateMatch = report.timestamp?.toDate()?.toLocaleString().toLowerCase().includes(search);
                const date = report.timestamp?.toDate ? report.timestamp.toDate() : new Date(report.timestamp);
                const afterStart = this.startDate ? date >= new Date(this.startDate) : true;
                const beforeEnd = this.endDate ? date <= new Date(this.endDate + 'T23:59:59') : true;
                const matchUser = this.userFilter ? report.userId.includes(this.userFilter) : true;
                const matchFilename = this.filenameFilter ? report.pdfUrl?.includes(this.filenameFilter) : true;
                const matchSize = report.size ? report.size > (this.minSizeFilter * 1024) : true;
                return (userMatch || dateMatch) && afterStart && beforeEnd && matchUser && matchFilename && matchSize;
            })
            .sort((a, b) => {
                const aVal = a[this.sortField]?.toMillis ? a[this.sortField].toMillis() : a[this.sortField];
                const bVal = b[this.sortField]?.toMillis ? b[this.sortField].toMillis() : b[this.sortField];
                if (aVal === bVal) return 0;
                return this.sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
            });
    }

    exportCatalogAsPdf(): void {
        this.pdfService.exportCatalogPdf(this.filteredReports);
    }

    toggleSort(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.sortReports();
    }

    sortReports() {
        this.filteredReports.sort((a, b) => {
            const aVal = a[this.sortField];
            const bVal = b[this.sortField];
            return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    applyFilters(): void {
        this.filteredReports = this.reports.filter(report => {
            const matchUser = this.userFilter ? report.userId.includes(this.userFilter) : true;
            const matchFilename = this.filenameFilter ? report.pdfUrl?.includes(this.filenameFilter) : true;
            const matchSize = report.size ? report.size > (this.minSizeFilter * 1024) : true;
            const matchStart = this.startDate ? new Date(report.timestamp) >= new Date(this.startDate) : true;
            const matchEnd = this.endDate ? new Date(report.timestamp) <= new Date(this.endDate) : true;
            return matchUser && matchFilename && matchSize && matchStart && matchEnd;
        });
        this.sortReports();
    }

    exportFilteredToCSV() {
        if (!this.filteredReports.length) return;
        const header = Object.keys(this.filteredReports[0]).join(',');
        const rows = this.filteredReports.map(r => Object.values(r).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `relatorios-hse-${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportFilteredToJSON() {
        if (!this.filteredReports.length) return;
        const blob = new Blob([
            JSON.stringify(this.filteredReports, null, 2)
        ], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `relatorios-hse-${date}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
