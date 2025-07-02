import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { AiAnalysisResult } from './ai.service';
import { AuthService } from './auth.service';

export interface Report {
  id?: string;
  userId: string;
  email: string;
  imageUrl: string;
  analysis: AiAnalysisResult;
  createdAt: Date;
  organizationId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AuthService,
    private toastr: ToastrService
  ) { }

  async saveReport(imageUrl: string, analysis: AiAnalysisResult): Promise<string> {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.toastr.error('Utilizador não autenticado.');
      throw new Error('User not authenticated');
    }

    const report: Omit<Report, 'id'> = {
      userId: user.uid,
      email: user.email,
      imageUrl,
      analysis,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() as unknown as Date,
      organizationId: user.organizationId
    ***REMOVED***

    try {
      const docRef = await this.firestore.collection('reports').add(report);
      this.toastr.success('Relatório guardado com sucesso!');
      return docRef.id;
    } catch (err) {
      this.toastr.error('Erro ao guardar relatório.');
      throw err;
    }
  }

  getReportsByUser(userId: string) {
    return this.firestore
      .collection('reports', ref => ref.where('userId', '==', userId).orderBy('createdAt', 'desc'))
      .valueChanges();
  }

  getReportsByOrganization(organizationId: string) {
    return this.firestore
      .collection('reports', ref => ref.where('organizationId', '==', organizationId).orderBy('createdAt', 'desc'))
      .valueChanges();
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.firestore.collection('reports').doc(reportId).delete();
  }

  async exportCatalogPdf(reports: any[]): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;

    for (const report of reports) {
      if (y > 270) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(12);
      doc.text(`Usuário: ${report.userId}`, 10, y);
      doc.text(`Data: ${new Date(report.timestamp).toLocaleString()}`, 10, y + 7);
      if (report.imageUrl) {
        const image = await this.loadImageAsDataURL(report.imageUrl);
        doc.addImage(image, 'JPEG', 10, y + 10, 50, 40);
      }
      y += 60;
    }

    doc.save(`catalogo-relatorios-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  private async loadImageAsDataURL(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}