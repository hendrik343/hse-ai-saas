import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { jsPDF } from 'jspdf';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent],
  template: `
    <app-fluid-cursor></app-fluid-cursor>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
    `
  ]
})
export class AppComponent {
  title = 'frontend';

  // Auth properties
  user$ = null;
  registerEmail = '';
  loginEmail = '';
  loading = false;
  error = null;

  capturedImage: string | null = null;
  assessmentData: any = null; // Supondo que já existe lógica para preencher isto

  constructor(private router: Router) { }

  generatePdfReport() {
    if (!this.assessmentData || !this.capturedImage) return;
    const doc = new jsPDF();
    // Título
    doc.setFontSize(22);
    doc.text('HSE AI Risk Assessment Report', 15, 20);
    // Resumo
    doc.setFontSize(14);
    doc.text('Summary:', 15, 35);
    doc.setFontSize(12);
    doc.text(this.assessmentData.summary || '', 15, 45, { maxWidth: 180 });
    // Foto
    doc.addImage(this.capturedImage, 'JPEG', 15, 55, 60, 45);
    let y = 105;
    // Lista de riscos e controlos
    doc.setFontSize(14);
    doc.text('Risks & Controls:', 15, y);
    y += 10;
    doc.setFontSize(12);
    (this.assessmentData.risks || []).forEach((risk: any, idx: number) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${idx + 1}. ${risk.title} - ${risk.control}`, 15, y, { maxWidth: 180 });
      y += 8;
    });
    doc.save('risk-assessment-report.pdf');
  }
}
