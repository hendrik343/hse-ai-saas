// Dashboard Models
export interface Organization {
  id: string;
  name: string;
  type: 'factory' | 'office' | 'construction' | 'logistics' | 'other';
  address?: string;
  contact?: string;
  createdAt: string;
  isActive: boolean;
}

export interface HSEReport {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  type: 'risk_assessment' | 'incident_report' | 'safety_audit' | 'training_record';
  status: 'draft' | 'completed' | 'reviewed' | 'approved';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserStats {
  totalReports: number;
  monthlyReports: number;
  activeOrganizations: number;
  lastReportDate?: string;
  reportsThisMonth: number;
  isFreePlan: boolean;
  freeReportsLimit: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'month' | 'year';
  features: string[];
  reportsLimit: number | null; // null = unlimited
  organizationsLimit: number | null;
  isPopular?: boolean;
}

export interface ReportGenerationRequest {
  type: string;
  organizationId: string;
  title: string;
  description?: string;
  customPrompt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardState {
  isLoading: boolean;
  organizations: Organization[];
  recentReports: HSEReport[];
  userStats: UserStats;
  selectedOrganization?: Organization;
  hasReachedLimit: boolean;
}

// Constants
export const FREE_LIMIT = 5;
export const REPORT_TYPES = [
  'risk_assessment',
  'incident_report',
  'safety_audit',
  'training_record'
] as const;

export const ORGANIZATION_TYPES = [
  'factory',
  'office',
  'construction',
  'logistics',
  'other'
] as const;

// Type guards
export function isValidReportType(type: string): type is HSEReport['type'] {
  return REPORT_TYPES.includes(type as any);
}

export function isValidOrganizationType(type: string): type is Organization['type'] {
  return ORGANIZATION_TYPES.includes(type as any);
}
