import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Observable, of } from 'rxjs';
import type { AnalysisResult } from '../models/analysis.model';

// Updated interfaces to match template and code usage
export interface Severity {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  justification: string;
}

export interface PdfReportSection {
  title: string;
  content: string;
}

export interface PdfReport {
  title: string;
  date: string;
  sections: PdfReportSection[];
}

export interface AiAnalysisResult {
  summary: string;
  severity: Severity;
  rootCauses: string[];
  preventiveActions: string[];
  complianceNotes: string[];
  legalViolations: string[];
  pdfReport: PdfReport;
  violations?: string[];
  risks?: string[];
  recommendations?: string[];
  complianceScore?: number;
}

export interface StreamingAnalysisResult {
  summary: string;
  severity: Severity;
  rootCauses: string[];
  preventiveActions: string[];
  complianceNotes: string[];
  legalViolations: string[];
  pdfReport: PdfReport;
  violations?: string[];
  risks?: string[];
  recommendations?: string[];
  complianceScore?: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private genAI = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' }); // Substitui pela tua key real

  private buildPrompt(description: string, intent: string, country: string, industry: string): string {
    return `
      Act as a certified Health, Safety, and Environment (HSE) AI specialist.
      You are analyzing an incident report or image context submitted by a user.

      🌍 COUNTRY: ${country}
      🏭 INDUSTRY: ${industry}
      🎯 INTENT: ${intent}
      
      Based on the country and industry, apply the correct legislation (e.g., ISO 45001, OSHA, or country-specific law) to evaluate:

      1. ✅ Any **safety non-conformities** visible or described.
      2. ⚠️ Any **legal violations** based on local/international norms.
      3. 💣 A **risk severity score** and potential consequences.
      4. 📄 Provide **recommendations** to prevent recurrence.
      5. 📜 Suggest any laws, norms or standards that apply.

      Respond **strictly** in the following JSON format (no intro text!):

      {
        "summary": "...",
        "severity": {
          "level": "Low" | "Medium" | "High" | "Critical",
          "justification": "..."
        },
        "rootCauses": ["..."],
        "preventiveActions": ["..."],
        "complianceNotes": ["..."],
        "legalViolations": ["..."],
        "pdfReport": {
          "title": "AI Safety Analysis Report",
          "date": "ISO_DATE_HERE",
          "sections": [
            { "title": "Resumo", "content": "..." },
            { "title": "Gravidade e Justificação", "content": "..." },
            { "title": "Violações Legais", "content": "..." },
            { "title": "Causas Raiz", "content": "..." },
            { "title": "Ações Preventivas", "content": "..." },
            { "title": "Normas Aplicáveis", "content": "..." }
          ]
        }
      }

      === INPUT CONTEXT ===
      "${description}"
    `;
  }

  async analyze(
    description: string,
    intent: string,
    country: string,
    industry: string,
    onChunk: (partial: string) => void
  ): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(description, intent, country, industry);
    let accumulated = '';

    const stream = await this.genAI.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    for await (const chunk of stream) {
      if (chunk?.text) {
        accumulated += chunk.text;
        onChunk(accumulated); // Stream live updates
      }
    }

    // Remove code fences if present
    const fence = accumulated.match(/^```(?:json)?\n([\s\S]+?)\n```$/);
    const jsonString = fence ? fence[1] : accumulated;

    try {
      const data = JSON.parse(jsonString);
      if (!data.summary || !data.severity || !data.pdfReport) {
        throw new Error('Missing key fields in analysis result');
      }
      return data as AnalysisResult;
    } catch (err) {
      console.error('AI returned malformed JSON:', accumulated);
      throw new Error('A resposta da IA não está num formato válido. Reformula o conteúdo.');
    }
  }

  // Add missing methods that are being called
  streamAnalysis(description: string): Observable<string> {
    // Mock implementation - replace with actual streaming logic
    return of('Mock streaming analysis result');
  }

  parseStreamingResult(text: string): StreamingAnalysisResult {
    // Mock implementation - replace with actual parsing logic
    return {
      summary: 'Mock summary',
      severity: { level: 'Medium', justification: 'Mock justification' },
      rootCauses: ['Mock root cause'],
      preventiveActions: ['Mock preventive action'],
      complianceNotes: ['Mock compliance note'],
      legalViolations: ['Mock legal violation'],
      pdfReport: {
        title: 'AI Safety Analysis Report',
        date: new Date().toISOString(),
        sections: [
          { title: 'Resumo', content: '...' },
          { title: 'Gravidade e Justificação', content: '...' },
          { title: 'Violações Legais', content: '...' },
          { title: 'Causas Raiz', content: '...' },
          { title: 'Ações Preventivas', content: '...' },
          { title: 'Normas Aplicáveis', content: '...' }
        ]
      },
      violations: ['Mock violation'],
      risks: ['Mock risk'],
      recommendations: ['Mock recommendation'],
      complianceScore: 75
    ***REMOVED***
  }

  analyzeImageMock(imageUrl: string): Observable<AiAnalysisResult> {
    // Mock implementation
    return of({
      summary: 'Mock image summary',
      severity: { level: 'Low', justification: 'Mock image justification' },
      rootCauses: ['Mock image root cause'],
      preventiveActions: ['Mock image preventive action'],
      complianceNotes: ['Mock image compliance note'],
      legalViolations: ['Mock image legal violation'],
      pdfReport: {
        title: 'AI Safety Analysis Report',
        date: new Date().toISOString(),
        sections: [
          { title: 'Resumo', content: '...' },
          { title: 'Gravidade e Justificação', content: '...' },
          { title: 'Violações Legais', content: '...' },
          { title: 'Causas Raiz', content: '...' },
          { title: 'Ações Preventivas', content: '...' },
          { title: 'Normas Aplicáveis', content: '...' }
        ]
      },
      violations: ['Mock image violation'],
      risks: ['Mock image risk'],
      recommendations: ['Mock image recommendation'],
      complianceScore: 80
    });
  }

  detectarNaoConformidades(imageData: string): string {
    // Mock implementation
    return 'Mock non-conformities detection result';
  }

  verificarNormas(imageData: string): string {
    // Mock implementation
    return 'Mock norms verification result';
  }

  analisarRisco(imageData: string): string {
    // Mock implementation
    return 'Mock risk analysis result';
  }
} 