import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnalysisService } from './analysis.service';

@Component({
    selector: 'app-upload-analyze',
    templateUrl: './upload-analyze.component.html',
    styleUrls: ['./upload-analyze.component.scss']
})
export class UploadAnalyzeComponent {
    selectedFile: File | null = null;
    uploading = false;
    result: any = null;

    constructor(private analysisService: AnalysisService) { }

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
}
