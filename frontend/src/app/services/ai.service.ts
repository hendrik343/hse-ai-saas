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

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  analyzeImage(imageUrl: string): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>('https://your-ai-endpoint.com/analyze', { imageUrl });
  }

  // Mock method for development/testing
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
} 