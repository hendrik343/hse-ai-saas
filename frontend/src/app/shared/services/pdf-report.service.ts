import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({ providedIn: 'root' })
export class PdfReportService {
    async generatePdf(imageDataUrl: string, detections: any[]): Promise<void> {
        const content = [
            { text: 'Relatório de Análise de Imagem com IA', style: 'header' },
            { text: `Data: ${new Date().toLocaleString()}`, style: 'subheader' },
            { text: ' ', margin: [0, 10] },
            {
                image: imageDataUrl,
                width: 400,
                alignment: 'center',
            },
            { text: ' ', margin: [0, 10] },
            {
                ul: detections.map(det => `• ${det.label} com confiança ${Math.round(det.score * 100)}%`),
            },
        ];

        const docDefinition = {
            content,
            styles: {
                header: { fontSize: 18, bold: true },
                subheader: { fontSize: 12, italics: true },
            },
        ***REMOVED***

        pdfMake.createPdf(docDefinition).download(`relatorio-${Date.now()}.pdf`);
    }
}
