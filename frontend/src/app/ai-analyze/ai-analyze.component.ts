import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

// Services
import { ImageService } from '../services/image.service';
import { AiService, AiAnalysisResult } from '../services/ai.service';
import { ReportService } from '../services/report.service';
import { AuthService } from '../services/auth.service';

// PDF generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-ai-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ai-analyze.component.html',
  styleUrls: ['./ai-analyze.component.scss']
})
export class AiAnalyzeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private imageService = inject(ImageService);
  private aiService = inject(AiService);
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  // File handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Analysis state
  isAnalyzing = false;
  analysisComplete = false;
  analysisResult: AiAnalysisResult | null = null;
  imageUrl: string | null = null;
  error: string | null = null;
  
  // Trial mode
  isTrialMode = false;
  showSignupCTA = false;
  reportId: string | null = null;

  // Current date for PDF generation
  currentDate = new Date();

  ngOnInit() {
    // Check if this is trial mode (no auth required)
    this.route.url.subscribe(segments => {
      this.isTrialMode = segments.some(segment => segment.path === 'try');
    });

    if (!this.isTrialMode) {
      // Regular mode - require authentication
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.router.navigate(['/']);
      }
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type?.startsWith('image/')) {
      this.selectedFile = file;
      this.createImagePreview(file);
      this.error = null; // Clear previous errors
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type?.startsWith('image/')) {
        this.selectedFile = file;
        this.createImagePreview(file);
        this.error = null; // Clear previous errors
      }
    }
  }

  createImagePreview(file: File) {
    if (!file || !file.type?.startsWith('image/')) {
      console.error('Invalid file type selected');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && result.startsWith('data:image/')) {
        this.imagePreview = result;
      } else {
        console.error('Invalid image data');
      }
    ***REMOVED***
    reader.onerror = () => {
      console.error('Error reading file');
    ***REMOVED***
    reader.readAsDataURL(file);
  }

  async startAnalysis() {
    if (!this.selectedFile) return;

    this.isAnalyzing = true;
    this.error = null;
    this.analysisComplete = false;

    try {
      // Step 1: Upload image
      const uploadResult = await this.imageService.uploadImage(this.selectedFile) as { downloadURL: string; docRef: any ***REMOVED***
      this.imageUrl = uploadResult.downloadURL;

      // Step 2: Perform AI analysis
      this.analysisResult = await firstValueFrom(
        this.aiService.analyzeImageMock(uploadResult.downloadURL)
      );

      // Step 3: Save report (if not trial mode)
      if (!this.isTrialMode && this.imageUrl) {
        this.reportId = await this.reportService.saveReport(this.imageUrl, this.analysisResult);
      }

      this.analysisComplete = true;
      this.showSignupCTA = this.isTrialMode;

    } catch (err: any) {
      console.error('Analysis failed:', err);
      this.error = this.translate.instant('ERROR_OCCURRED') + ': ' + err.message;
    } finally {
      this.isAnalyzing = false;
    }
  }

  async downloadPDF() {
    if (!this.analysisResult) return;

    try {
      const element = document.getElementById('analysis-report');
      if (!element) {
        console.error('Report element not found');
        return;
      }

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`hse-analysis-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to browser print
      window.print();
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  analyzeAnother() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.analysisResult = null;
    this.analysisComplete = false;
    this.showSignupCTA = false;
    this.error = null;
    this.imageUrl = null;
    this.reportId = null;
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
