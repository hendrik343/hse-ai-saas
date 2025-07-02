import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

declare module 'pdfmake/build/pdfmake';
declare module 'pdfmake/build/vfs_fonts';

@Injectable({ providedIn: 'root' })
export class HuggingfaceService {
    private apiUrl = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50';
    private apiToken: string | null = null;

    constructor(private http: HttpClient) { }

    setToken(token: string) {
        this.apiToken = token;
    }

    detectObjects(imageDataUrl: string): Observable<any[]> {
        // Convert base64 to Blob
        const base64 = imageDataUrl.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const headers: any = {
            Accept: 'application/json',
        ***REMOVED***
        if (this.apiToken) {
            headers['Authorization'] = `Bearer ${this.apiToken}`;
        }

        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        // For demo, return mock data if no token
        if (!this.apiToken) {
            return of([
                { label: 'capacete', score: 0.98, box: [50, 50, 100, 100] },
                { label: 'colete', score: 0.92, box: [200, 80, 120, 160] },
            ]);
        }

        return new Observable<any[]>(observer => {
            this.http.post<any>(this.apiUrl, formData, { headers }).subscribe({
                next: (response) => {
                    // Parse Hugging Face DETR output
                    const results = (response as any[]).map(obj => ({
                        label: obj.label || obj.class || 'objeto',
                        score: obj.score,
                        box: obj.box || obj.bbox || [0, 0, 0, 0],
                    }));
                    observer.next(results);
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
}
