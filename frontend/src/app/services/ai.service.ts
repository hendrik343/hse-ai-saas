import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiAnalysisResult {
  violations: string[];
  risks: string[];
  recommendations: string[];
  complianceScore: number;
  reportUrl?: string;
}

export interface StreamingAnalysisResult {
  summary: string;
  severity: {
    level: 'low' | 'medium' | 'high' | 'critical';
    justification: string;
  ***REMOVED***
  rootCauses: string[];
  preventiveActions: string[];
  complianceNotes: string[];
  violations: string[];
  risks: string[];
  recommendations: string[];
  complianceScore: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiKey = 'AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ'; // Replace with your actual API key
  private url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(private http: HttpClient) {}

  // Streaming analysis with real-time response
  streamAnalysis(incidentDescription: string): Observable<string> {
    const prompt = {
      contents: [{
        parts: [{ text: `
You are a workplace safety expert analyzing HSE (Health, Safety, Environment) incidents. 
Analyze the following incident and provide a comprehensive safety assessment:

"${incidentDescription}"

Respond in the following JSON format:
{
  "summary": "Brief summary of the incident",
  "severity": {
    "level": "low|medium|high|critical",
    "justification": "Why this severity level"
  },
  "rootCauses": ["cause1", "cause2", "cause3"],
  "preventiveActions": ["action1", "action2", "action3"],
  "complianceNotes": ["compliance1", "compliance2"],
  "violations": ["violation1", "violation2"],
  "risks": ["risk1", "risk2", "risk3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "complianceScore": 85
}

Focus on:
- Safety regulations compliance
- Risk assessment
- Preventive measures
- Legal implications
- Best practices
        `}]
      }]
    ***REMOVED***

    return new Observable<string>(observer => {
      fetch(`${this.url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            
            // Try to extract JSON from the accumulated response
            const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              observer.next(jsonMatch[0]);
            } else {
              observer.next(accumulated);
            }
          }
        } catch (error) {
          observer.error(error);
        } finally {
          observer.complete();
        }
      }).catch(err => {
        console.error('Streaming error:', err);
        observer.error(err);
      });
    });
  }

  // Legacy method for backward compatibility
  analyzeImage(imageUrl: string): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>('https://your-ai-endpoint.com/analyze', { imageUrl });
  }

  // Mock method for development/testing (fallback)
  analyzeImageMock(imageUrl: string): Observable<AiAnalysisResult> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          violations: [
            'Falta de equipamento de proteção individual (EPI)',
            'Área de trabalho desorganizada',
            'Ausência de sinalização de segurança'
          ],
          risks: [
            'Risco de queda de objetos',
            'Exposição a produtos químicos',
            'Lesões por equipamentos não protegidos'
          ],
          recommendations: [
            'Fornecer EPI adequado para todos os trabalhadores',
            'Implementar sistema de organização 5S',
            'Instalar sinalização de segurança visível'
          ],
          complianceScore: 65,
          reportUrl: 'https://example.com/report.pdf'
        });
        observer.complete();
      }, 2000);
    });
  }

  // Parse streaming result to structured format
  parseStreamingResult(streamingText: string): StreamingAnalysisResult | null {
    try {
      // Try to extract JSON from the streaming response
      const jsonMatch = streamingText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing streaming result:', error);
      return null;
    }
  }

  detectarNaoConformidades(imageData: string): string {
    return 'Foram detectadas 3 não conformidades nesta imagem.';
  }
  verificarNormas(imageData: string): string {
    return 'Violação das normas ISO 45001: Uso incorreto de EPI.';
  }
  analisarRisco(imageData: string): string {
    return 'Risco Alto: Consequência possível - fratura grave por queda de altura.';
  }
} 