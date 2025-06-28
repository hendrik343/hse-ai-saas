import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { AiService, AiAnalysisResult } from './ai.service';
import firebase from 'firebase/compat/app';
import { ToastrService } from 'ngx-toastr';

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
  ) {}

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
} 