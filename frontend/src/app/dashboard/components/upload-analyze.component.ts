import { Component } from '@angular/core';
import { AnalysisService } from 'src/app/services/analysis.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-upload-analyze',
    templateUrl: './upload-analyze.component.html',
    styleUrls: ['./upload-analyze.component.scss']
})
export class UploadAnalyzeComponent {
    selectedImage: File | null = null;
    uploadProgress = 0;
    analysisResult: string | null = null;
    loading = false;

    constructor(
        private authService: AuthService,
        private analysisService: AnalysisService
    ) { }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.selectedImage = file;
            this.analysisResult = null;
        }
    }

    async uploadAndAnalyze() {
        if (!this.selectedImage) return;
        this.loading = true;

        const user = await this.authService.getCurrentUser();
        const result = await this.analysisService.uploadAndAnalyze(this.selectedImage, user.uid, (progress) => {
            this.uploadProgress = progress;
        });

        this.analysisResult = result;
        this.loading = false;
    }
}
