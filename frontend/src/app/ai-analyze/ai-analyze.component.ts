import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from '@angular/fire/storage';
import { Auth, user } from '@angular/fire/auth';
import { FirestoreService } from '../services/firestore.service';
import { AIAnalysisReport } from '../types/firestore.types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisResult {
  compliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  ***REMOVED***
  risk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  ***REMOVED***
  legal: {
    violations: string[];
    requirements: string[];
    penalties: string[];
  ***REMOVED***
}

@Component({
  selector: 'app-ai-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-analyze.component.html',
  styleUrls: ['./ai-analyze.component.scss']
})
export class AiAnalyzeComponent implements OnInit {
  private storage = inject(Storage);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private firestoreService = inject(FirestoreService);

  user$ = user(this.auth);
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isAnalyzing = false;
  analysisComplete = false;
  analysisResult: AnalysisResult | null = null;
  uploadProgress = 0;
  currentStep = 1;
  
  // New properties for the conversion flow
  isTrialMode = false;
  showSignupCTA = false;
  reportId: string | null = null;

  ngOnInit() {
    // Check if this is trial mode (no auth required)
    this.route.url.subscribe(segments => {
      this.isTrialMode = segments.some(segment => segment.path === 'try');
    });

    if (!this.isTrialMode) {
      // Regular mode - require authentication
      this.user$.subscribe((user) => {
        if (!user) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type?.startsWith('image/')) {
      this.selectedFile = file;
      this.createImagePreview(file);
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
    this.currentStep = 2;

    try {
      // Step 1: Upload image to Firebase Storage
      const imageURL = await this.uploadImage();
      this.uploadProgress = 50;

      // Step 2: Perform AI analysis (mock for now)
      const analysisResult = await this.performAIAnalysis();
      this.uploadProgress = 75;

      // Step 3: Generate PDF report
      const pdfURL = await this.generatePDF(analysisResult);
      this.uploadProgress = 90;

      // Step 4: Save to Firestore (if authenticated) or show results
      if (this.isTrialMode) {
        // In trial mode, just show results without saving
        this.analysisResult = analysisResult;
        this.analysisComplete = true;
        this.currentStep = 3;
        this.showSignupCTA = true;
      } else {
        // Regular mode - save to Firestore
        await this.saveToFirestore(imageURL, analysisResult, pdfURL);
        this.analysisResult = analysisResult;
        this.analysisComplete = true;
        this.currentStep = 3;
      }

      this.uploadProgress = 100;

    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error appropriately - you might want to show a toast message
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async ensureUserAuthenticated(): Promise<void> {
    const user = await this.user$.toPromise();
    if (!user) {
      // If no user, you could implement anonymous auth here
      // For now, we'll throw an error
      throw new Error('User must be authenticated to perform analysis');
    }
  }

  private async uploadImage(): Promise<string> {
    if (!this.selectedFile) throw new Error('No file selected');

    if (this.isTrialMode) {
      // In trial mode, create a temporary URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        ***REMOVED***
        reader.readAsDataURL(this.selectedFile!);
      });
    }

    const user = await this.user$.toPromise();
    if (!user) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const fileName = `uploads/${user.uid}/${timestamp}_${this.selectedFile.name}`;
    const storageRef = ref(this.storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, this.selectedFile);
    return await getDownloadURL(snapshot.ref);
  }

  private async performAIAnalysis(): Promise<AnalysisResult> {
    // Mock AI analysis - replace with actual AI API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      compliance: {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        issues: [
          'Missing safety signage in hazardous areas',
          'Inadequate personal protective equipment',
          'Unsafe storage of chemicals'
        ],
        recommendations: [
          'Install clear safety signage in all hazardous zones',
          'Provide appropriate PPE for all workers',
          'Implement proper chemical storage protocols'
        ]
      },
      risk: {
        level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        factors: [
          'Exposure to hazardous materials',
          'Inadequate emergency procedures',
          'Poor housekeeping practices'
        ],
        mitigation: [
          'Implement proper ventilation systems',
          'Develop comprehensive emergency response plan',
          'Establish regular cleaning schedules'
        ]
      },
      legal: {
        violations: [
          'OSHA regulation 1910.1200 - Hazard Communication',
          'OSHA regulation 1910.132 - Personal Protective Equipment'
        ],
        requirements: [
          'Maintain safety data sheets for all chemicals',
          'Provide training on chemical hazards',
          'Ensure proper PPE availability and use'
        ],
        penalties: [
          'Fines up to $13,653 per violation',
          'Potential criminal charges for willful violations'
        ]
      }
    ***REMOVED***
  }

  private async generatePDF(analysisResult: AnalysisResult): Promise<string> {
    if (this.isTrialMode) {
      // In trial mode, just return a placeholder URL
      return 'trial-mode-pdf';
    }

    const user = await this.user$.toPromise();
    if (!user) throw new Error('User not authenticated');

    // Create PDF with professional template
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    // Header with logo and title
    pdf.setFillColor(139, 92, 246); // Purple background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HSE AI', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Safety Analysis Report', margin, 35);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Report metadata
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Report Generated: ${currentDate}`, pageWidth - margin - 80, 25);
    pdf.text(`User ID: ${user.uid.substring(0, 8)}...`, pageWidth - margin - 80, 30);
    
    let yPosition = 60;
    
    // Executive Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`This report provides a comprehensive analysis of workplace safety compliance based on AI-powered image analysis.`, margin, yPosition);
    yPosition += 10;
    
    // Compliance Score
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Compliance Score', margin, yPosition);
    yPosition += 10;
    
    // Draw compliance score circle
    const scoreX = margin + 30;
    const scoreY = yPosition + 5;
    pdf.setDrawColor(139, 92, 246);
    pdf.setLineWidth(2);
    pdf.circle(scoreX, scoreY, 15, 'D');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${analysisResult.compliance.score}%`, scoreX - 8, scoreY + 3);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Overall safety compliance rating', scoreX + 20, scoreY);
    yPosition += 30;
    
    // Risk Assessment
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment', margin, yPosition);
    yPosition += 10;
    
    const riskColor = analysisResult.risk.level === 'high' ? [220, 38, 127] : 
                     analysisResult.risk.level === 'medium' ? [245, 158, 11] : [34, 197, 94];
    
    pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.rect(margin, yPosition - 5, 30, 8, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(analysisResult.risk.level.toUpperCase(), margin + 2, yPosition + 2);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Risk Level', margin + 35, yPosition + 2);
    yPosition += 15;
    
    // Risk Factors
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Factors:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    analysisResult.risk.factors.forEach((factor: string) => {
      pdf.text(`• ${factor}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Identified Issues
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Identified Issues', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    analysisResult.compliance.issues.forEach((issue: string) => {
      pdf.setTextColor(220, 38, 127); // Red for issues
      pdf.text(`• ${issue}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Recommendations
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    analysisResult.compliance.recommendations.forEach((rec: string) => {
      pdf.setTextColor(34, 197, 94); // Green for recommendations
      pdf.text(`• ${rec}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Legal Compliance
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Legal Compliance', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Violations Found:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(245, 158, 11); // Orange for violations
    analysisResult.legal.violations.forEach((violation: string) => {
      pdf.text(`• ${violation}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
    
    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text('Generated by HSE AI Platform - AI-powered safety analysis', margin, pageHeight - 10);
    pdf.text('For questions or support, contact: support@hse-ai.com', margin, pageHeight - 5);

    // Convert to blob and upload
    const pdfBlob = pdf.output('blob');
    const timestamp = Date.now();
    const fileName = `reports/${user.uid}/${timestamp}_analysis_report.pdf`;
    const storageRef = ref(this.storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, pdfBlob);
    return await getDownloadURL(snapshot.ref);
  }

  private async saveToFirestore(imageURL: string, analysisResult: AnalysisResult, pdfURL: string) {
    try {
      const reportId = await this.firestoreService.saveAIAnalysisReport({
        imageUrl: imageURL,
        analysis: analysisResult,
        pdfUrl: pdfURL,
        email: null // You can modify this to include user email if needed
      });
      
      console.log('Report saved successfully with ID:', reportId);
    } catch (error) {
      console.error('Error saving report to Firestore:', error);
      throw error;
    }
  }

  downloadPDF() {
    if (this.analysisResult) {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('HSE AI Analysis Report', 20, 20);
      
      // Compliance Score
      pdf.setFontSize(16);
      pdf.text(`Compliance Score: ${this.analysisResult.compliance.score}%`, 20, 40);
      
      // Issues
      pdf.setFontSize(14);
      pdf.text('Identified Issues:', 20, 60);
      this.analysisResult.compliance.issues.forEach((issue: string, index: number) => {
        pdf.setFontSize(10);
        pdf.text(`• ${issue}`, 25, 75 + (index * 8));
      });

      // Risk Level
      pdf.setFontSize(14);
      pdf.text(`Risk Level: ${this.analysisResult.risk.level.toUpperCase()}`, 20, 120);
      
      // Legal Violations
      pdf.setFontSize(14);
      pdf.text('Legal Violations:', 20, 140);
      this.analysisResult.legal.violations.forEach((violation: string, index: number) => {
        pdf.setFontSize(10);
        pdf.text(`• ${violation}`, 25, 155 + (index * 8));
      });

      pdf.save('hse-analysis-report.pdf');
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  analyzeAnother() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.isAnalyzing = false;
    this.analysisComplete = false;
    this.analysisResult = null;
    this.uploadProgress = 0;
    this.currentStep = 1;
    this.showSignupCTA = false;
  }

  // New methods for the conversion flow
  goToSignup() {
    this.router.navigate(['/onboarding']);
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
