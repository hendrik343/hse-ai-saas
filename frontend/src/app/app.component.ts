import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
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
        <app-card>
          <h3>Card 1</h3>
          <p>Your content here</p>
        </app-card>
        <app-card>
          <h3>Card 2</h3>
          <p>Your content here</p>
        </app-card>
        <app-card>
          <h3>Card 3</h3>
          <p>Your content here</p>
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
}
