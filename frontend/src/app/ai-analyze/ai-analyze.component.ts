import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

// Services
import { AiAnalysisResult, AiService, StreamingAnalysisResult } from '../services/ai.service';
import { AuthService } from '../services/auth.service';
import { ImageService } from '../services/image.service';
import { PdfService } from '../services/pdf.service';
import { ReportService } from '../services/report.service';
import { HuggingfaceService } from '../shared/services/huggingface.service';
import { PdfReportService } from '../shared/services/pdf-report.service';
import { PdfStorageService } from '../shared/services/pdf-storage.service';

// PDF generation
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  private pdfService = inject(PdfService);
  private hfService = inject(HuggingfaceService);
  private pdfReportService = inject(PdfReportService);
  private pdfStorageService = inject(PdfStorageService);

  // File handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Analysis state
  isAnalyzing = false;
  analysisComplete = false;
  analysisResult: AiAnalysisResult | null = null;
  streamingResult: StreamingAnalysisResult | null = null;
  imageUrl: string | null = null;
  error: string | null = null;

  // Streaming state
  streamingText = '';
  isStreaming = false;
  incidentDescription = '';

  // Trial mode
  isTrialMode = false;
  showSignupCTA = false;
  reportId: string | null = null;

  // Current date for PDF generation
  currentDate = new Date();

  // Progress tracking
  uploadProgress = 0;
  currentStep = 1;

  imageData: string = '';
  resultado: string = '';
  relatorio: any = {
    naoConformidades: '',
    normas: '',
    risco: ''
  ***REMOVED***

  intent: string = 'default';
  country: string | null = null;
  industry: string | null = null;

  // Object detection results
  results: any[] = [];
  loading = false;
  imageWidth = 0;
  imageHeight = 0;

  ngOnInit() {
    // Check if this is trial mode (no auth required)
    this.route.url.subscribe(segments => {
      this.isTrialMode = segments.some(segment => segment.path === 'try');
    });

    // Read intent from query params
    this.route.queryParams.subscribe(params => {
      this.intent = params['intent'] || 'default';
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
    console.log('File selected event triggered');
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    console.log('Selected file:', file);
    if (file && file.type?.startsWith('image/')) {
      this.selectedFile = file;
      this.createImagePreview(file);
      this.error = null; // Clear previous errors
      console.log('File processed successfully');
    } else {
      console.log('Invalid file type or no file selected');
    }
  }

  onFileDrop(event: DragEvent) {
    console.log('File drop event triggered');
    event.preventDefault();
    const files = event.dataTransfer?.files;
    console.log('Dropped files:', files);
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type?.startsWith('image/')) {
        this.selectedFile = file;
        this.createImagePreview(file);
        this.error = null; // Clear previous errors
        console.log('File dropped successfully');
      } else {
        console.log('Invalid file type dropped');
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

  // New streaming analysis method
  async startStreamingAnalysis() {
    if (!this.country || !this.industry) return;

    if (!this.incidentDescription.trim()) {
      this.error = this.translate.instant('PLEASE_ENTER_INCIDENT_DESCRIPTION');
      return;
    }

    this.isStreaming = true;
    this.isAnalyzing = true;
    this.error = null;
    this.analysisComplete = false;
    this.streamingText = '';
    this.streamingResult = null;

    try {
      // Start streaming analysis
      this.aiService.streamAnalysis(this.incidentDescription).subscribe({
        next: (chunk) => {
          this.streamingText = chunk;
          console.log('Streaming chunk:', chunk);
        },
        complete: () => {
          // Parse the final result
          this.streamingResult = this.aiService.parseStreamingResult(this.streamingText);
          if (this.streamingResult) {
            // Convert to legacy format for compatibility
            this.analysisResult = {
              summary: this.streamingResult.summary || 'N/A',
              severity: this.streamingResult.severity || { level: 'Low', justification: 'N/A' },
              rootCauses: this.streamingResult.rootCauses || [],
              preventiveActions: this.streamingResult.preventiveActions || [],
              complianceNotes: this.streamingResult.complianceNotes || [],
              legalViolations: this.streamingResult.legalViolations || [],
              pdfReport: this.streamingResult.pdfReport || {
                title: 'AI Safety Analysis Report',
                date: new Date().toISOString(),
                sections: []
              },
              violations: this.streamingResult.violations,
              risks: this.streamingResult.risks,
              recommendations: this.streamingResult.recommendations,
              complianceScore: this.streamingResult.complianceScore
            ***REMOVED***
          }
          this.analysisComplete = true;
          this.isStreaming = false;
          this.isAnalyzing = false;
          this.showSignupCTA = this.isTrialMode;
        },
        error: (err) => {
          console.error('Streaming analysis failed:', err);
          this.error = this.translate.instant('STREAMING_ANALYSIS_ERROR') + ': ' + err.message;
          this.isStreaming = false;
          this.isAnalyzing = false;
        }
      });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      this.error = this.translate.instant('ERROR_OCCURRED') + ': ' + err.message;
      this.isStreaming = false;
      this.isAnalyzing = false;
    }
  }

  // Legacy image analysis method (kept for compatibility)
  async startAnalysis() {
    if (!this.country || !this.industry) return;

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
    if (!this.analysisResult && !this.streamingResult) return;

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
    this.streamingResult = null;
    this.analysisComplete = false;
    this.showSignupCTA = false;
    this.error = null;
    this.imageUrl = null;
    this.reportId = null;
    this.streamingText = '';
    this.incidentDescription = '';
    this.isStreaming = false;
  }

  goToSignup() {
    this.router.navigate(['/']);
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }

  // Helper method to get severity color
  getSeverityColor(level: string): string {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444',
      'critical': '#DC2626'
    ***REMOVED***
    return colors[level as keyof typeof colors] || '#6B7280';
  }

  get hasRootCauses(): boolean {
    return Array.isArray(this.streamingResult?.rootCauses) && this.streamingResult.rootCauses.length > 0;
  }
  get hasPreventiveActions(): boolean {
    return Array.isArray(this.streamingResult?.preventiveActions) && this.streamingResult.preventiveActions.length > 0;
  }
  get hasComplianceNotes(): boolean {
    return Array.isArray(this.streamingResult?.complianceNotes) && this.streamingResult.complianceNotes.length > 0;
  }

  detectarNaoConformidades() {
    console.log('Detectar não conformidades clicked');
    this.resultado = this.aiService.detectarNaoConformidades(this.imageData);
    this.relatorio.naoConformidades = this.resultado;
    console.log('Resultado:', this.resultado);
  }

  verificarNormas() {
    console.log('Verificar normas clicked');
    this.resultado = this.aiService.verificarNormas(this.imageData);
    this.relatorio.normas = this.resultado;
    console.log('Resultado:', this.resultado);
  }

  analisarRisco() {
    console.log('Analisar risco clicked');
    this.resultado = this.aiService.analisarRisco(this.imageData);
    this.relatorio.risco = this.resultado;
    console.log('Resultado:', this.resultado);
  }

  gerarRelatorioPdf() {
    console.log('Gerar relatório PDF clicked');
    this.pdfService.gerarRelatorioPdf(this.relatorio);
    console.log('PDF generation completed');
  }

  // New object detection method
  detectObjects(): void {
    if (!this.imagePreview) return;
    this.loading = true;

    this.hfService.detectObjects(this.imagePreview).subscribe({
      next: (response: any) => {
        this.results = response;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro na API Hugging Face:', err);
        this.loading = false;
      }
    });
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      const img = new Image();
      img.onload = () => {
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        this.detectObjects();
      ***REMOVED***
      img.src = this.imagePreview!;
    ***REMOVED***

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  getBoxStyle(box: number[]): any {
    const [x, y, width, height] = box;
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    ***REMOVED***
  }

  async generatePdf() {
    if (!this.imagePreview || !this.results.length) {
      console.error('No image or detections to generate PDF');
      return;
    }
    await this.pdfReportService.generatePdf(this.imagePreview, this.results);
  }

  async generateAndUploadPdf() {
    if (!this.imagePreview || !this.results.length) {
      console.error('No image or detections to generate PDF');
      return;
    }
    // 1. Generate PDF as Blob
    const pdfBlob = await new Promise<Blob>(resolve => {
      (window as any).pdfMake.createPdf({
        content: [
          { text: 'Relatório de Análise de Imagem com IA', style: 'header' },
          { text: `Data: ${new Date().toLocaleString()}`, style: 'subheader' },
          { text: ' ', margin: [0, 10] },
          {
            image: this.imagePreview,
            width: 400,
            alignment: 'center',
          },
          { text: ' ', margin: [0, 10] },
          {
            ul: this.results.map(det => `• ${det.label} com confiança ${Math.round(det.score * 100)}%`),
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true },
          subheader: { fontSize: 12, italics: true },
        },
      }).getBlob((blob: Blob) => resolve(blob));
    });
    // 2. Get user
    const user = this.authService.user$();
    if (!user) {
      alert('Usuário não autenticado.');
      return;
    }
    // 3. Upload PDF and save metadata
    const url = await this.pdfStorageService.uploadPdf(pdfBlob, user.uid, this.results);
    console.log('PDF carregado e metadados guardados:', url);
    alert('Relatório PDF gerado e salvo com sucesso!');
  }
}
