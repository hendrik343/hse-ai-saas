// src/app/models/report.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Report {
  id: string;
  prompt: string;
  response: string;
  createdAt: Timestamp;
  userId: string;
  organizationId: string;
  title?: string;
  type?: string;
  aiGenerated?: boolean;
}

export interface ReportFormData {
  prompt: string;
  title?: string;
  reportType?: string;
  organizationId?: string;
}

export interface UserStats {
  organizationName: string;
  subscriptionPlan: 'free' | 'premium';
  monthlyReports: number;
  monthlyLimit: number | null;
}
