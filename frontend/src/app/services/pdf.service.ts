import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  async generateReportPDF(report: Report): Promise<void> {
    try {
      // Criar elemento temporário para renderizar o relatório
      const reportElement = this.createReportElement(report);
      document.body.appendChild(reportElement);

      // Aguardar um momento para o DOM ser renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar o elemento como canvas
      const canvas = await html2canvas(reportElement, {
        useCORS: true,
        allowTaint: true
      });

      // Remover elemento temporário
      document.body.removeChild(reportElement);

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar PDF
      const fileName = `relatorio_${report.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF do relatório');
    }
  }

  private createReportElement(report: Report): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: Arial, sans-serif;
      color: #333;
    `;

    // Converter Timestamp para Date
    const createdAt = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt as any);

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Relatório de Análise de Segurança</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0;">HSE AI - Workplace Safety Analysis</p>
      </div>

      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Informações Gerais</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px;">ID do Relatório:</td>
            <td style="padding: 8px 0;">${report.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Data de Criação:</td>
            <td style="padding: 8px 0;">${createdAt.toLocaleDateString('pt-BR')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Organização:</td>
            <td style="padding: 8px 0;">${report.organizationId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Usuário:</td>
            <td style="padding: 8px 0;">${report.userId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Título:</td>
            <td style="padding: 8px 0;">${report.title || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Tipo:</td>
            <td style="padding: 8px 0;">${report.type || 'Geral'}</td>
          </tr>
        </table>
      </div>

      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Prompt da Análise</h2>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <span style="font-weight: bold;">Pergunta/Descrição:</span>
          <p style="margin: 10px 0 0 0; line-height: 1.5;">${report.prompt}</p>
        </div>
      </div>

      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Resposta da IA</h2>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0; line-height: 1.5; white-space: pre-wrap;">${report.response}</p>
        </div>
      </div>

      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Metadados</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px;">Gerado por IA:</td>
            <td style="padding: 8px 0;">${report.aiGenerated ? 'Sim' : 'Não'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Tipo de Relatório:</td>
            <td style="padding: 8px 0;">${report.type || 'Geral'}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Relatório gerado automaticamente pelo HSE AI</p>
        <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    return element;
  }

  private getRiskColor(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
      case 'alto':
        return '#ef4444';
      case 'médio':
        return '#f59e0b';
      case 'baixo':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }
} 