import { Injectable } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';

export interface OnboardingData {
  organizationName: string;
  organizationType?: string;
}

export interface OnboardingResult {
  success: boolean;
  organizationId: string;
  message: string;
}

export interface UserData {
  success: boolean;
  user: any;
  organization: any;
  needsOnboarding: boolean;
}

export interface ReportsData {
  success: boolean;
  reports: any[];
  hasMore: boolean;
}

export interface AIReportData {
  prompt: string;
  reportType?: string;
}

export interface AIReportResult {
  success: boolean;
  reportId: string;
  result: string;
  message: string;
  usage?: {
    monthlyReports: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CloudFunctionsService {

  constructor(private functions: Functions) { }

  // 🚀 Criar onboarding do usuário
  async createUserOnboarding(data: OnboardingData): Promise<OnboardingResult> {
    const callable = httpsCallable<OnboardingData, OnboardingResult>(this.functions, 'createUserOnboarding');
    const result: HttpsCallableResult<OnboardingResult> = await callable(data);
    return result.data;
  }

  // 🔍 Obter dados do usuário
  async getUserData(): Promise<UserData> {
    const callable = httpsCallable<any, UserData>(this.functions, 'getUserData');
    const result: HttpsCallableResult<UserData> = await callable({});
    return result.data;
  }

  // 📊 Obter relatórios da organização
  async getOrganizationReports(limit: number = 10, lastDoc?: string): Promise<ReportsData> {
    const callable = httpsCallable<any, ReportsData>(this.functions, 'getOrganizationReports');
    const result: HttpsCallableResult<ReportsData> = await callable({ limit, lastDoc });
    return result.data;
  }

  // 🤖 Gerar relatório AI
  async generateAiReport(data: AIReportData): Promise<AIReportResult> {
    const callable = httpsCallable<AIReportData, AIReportResult>(this.functions, 'generateAiReport');
    const result: HttpsCallableResult<AIReportResult> = await callable(data);
    return result.data;
  }
}
