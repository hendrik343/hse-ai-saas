import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';
import { CardSwapComponent, CardComponent } from './components/card-swap/card-swap.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent, CardSwapComponent, CardComponent],
  template: `
    <app-fluid-cursor></app-fluid-cursor>
    <router-outlet></router-outlet>
    <div style="height: 600px; position: relative;">
      <app-card-swap [cardDistance]="60" [verticalDistance]="70" [delay]="5000" [pauseOnHover]="false">
        <app-card (click)="navigateToAnalysis('legal')">
          <h3>🛑 Identificar violações legais</h3>
          <p>Com base na norma ISO/OSHA do país/indústria</p>
        </app-card>
        <app-card (click)="navigateToAnalysis('risk')">
          <h3>💥 Avaliar riscos e consequências</h3>
          <p>Análise detalhada dos perigos e impactos</p>
        </app-card>
        <app-card (click)="navigateToAnalysis('pdf')">
          <h3>📄 Gerar relatório PDF automático</h3>
          <p>Inclui todas as informações da análise</p>
        </app-card>
        <app-card (click)="navigateToAnalysis('adapt')">
          <h3>🌍 Análise adaptada à legislação</h3>
          <p>Personalizada para o país e setor industrial</p>
        </app-card>
      </app-card-swap>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
  `]
})
export class AppComponent {
  title = 'frontend';
  constructor(private router: Router) {}
  navigateToAnalysis(intent: string) {
    this.router.navigate(['/ai-analyze'], { queryParams: { intent } });
  }
}
