import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';
import { StarBorderComponent } from './components/star-border/star-border.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent, StarBorderComponent],
  template: `
    <app-fluid-cursor></app-fluid-cursor>
    <app-star-border 
      color="cyan" 
      speed="5s"
      className="custom-class"
    >
      <button>Click me!</button>
    </app-star-border>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'frontend';
}
