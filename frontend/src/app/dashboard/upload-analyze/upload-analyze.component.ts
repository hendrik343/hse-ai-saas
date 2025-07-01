import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../auth.service';
import { ReportService } from '../../shared/services/report.service';
import { AnalysisService } from './analysis.service';

@Component({
    selector: 'app-upload-analyze',
    standalone: true,
    imports: [CommonModule, JsonPipe],
    templateUrl: './upload-analyze.component.html',
    styleUrls: ['./upload-analyze.component.scss']
})
export class UploadAnalyzeComponent {
    selectedFile: File | null = null;
    uploading = false;
    result: any = null;

    constructor(
        private analysisService: AnalysisService,
        private reportService: ReportService,
        private authService: AuthService
    ) { }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0] || null;
    }

    uploadAndAnalyze() {
        if (!this.selectedFile) return;
        this.uploading = true;
        this.analysisService.uploadAndAnalyze(this.selectedFile)
            .pipe(finalize(() => this.uploading = false))
            .subscribe(res => {
                this.result = res;
            });
    }

    async exportarRelatorio() {
        const user = await this.authService.user$.pipe().toPromise();
        const userId = user?.uid;
        if (!userId || !this.result) {
            alert('Erro: sem dados ou utilizador');
            return;
        }
        const url = await this.reportService.exportReport(userId, {
            result: this.result,
            originalFileName: this.selectedFile?.name,
        });
        window.open(url, '_blank');
    }
}
