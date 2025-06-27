export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  adminUserId: string; // Changed from ownerId to match backend
  settings: {
    subscription: 'free' | 'pro' | 'enterprise'; // Moved subscription here
    maxUsers: number;
    maxReports: number;
    timezone?: string;
    language?: string;
    features?: string[];
  ***REMOVED***
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[];
}

export interface HSEReport {
  id: string;
  title: string;
  content: {
    title: string;
    summary: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
  } | string; // Allow both structured content and raw string
  type: 'incident' | 'safety' | 'environmental' | 'audit'; // Add type property
  generatedBy: string; // userId
  organizationId: string;
  aiGenerated: boolean;
  category: 'safety' | 'health' | 'environment' | 'compliance';
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    promptUsed?: string;
    aiModel?: string;
    tokens?: number;
  ***REMOVED***
}

export interface HSEData {
  id: string;
  type: 'incident' | 'inspection' | 'training' | 'audit';
  data: Record<string, any>;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisReport {
  id: string;
  userId: string;
  email: string | null;
  imageUrl: string;
  analysis: {
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
  ***REMOVED***
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: 'completed' | 'processing' | 'failed';
  type: 'ai_analysis';
}
