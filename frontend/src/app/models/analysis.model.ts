export interface AnalysisResult {
  summary: string;
  severity: {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    justification: string;
  ***REMOVED***
  rootCauses: string[];
  preventiveActions: string[];
  complianceNotes: string[];
  legalViolations: string[];
  pdfReport: {
    title: string;
    date: string;
    sections: { title: string; content: string }[];
  ***REMOVED***
} 