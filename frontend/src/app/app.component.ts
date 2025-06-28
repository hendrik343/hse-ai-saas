import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';
import { StarBorderComponent } from './components/star-border/star-border.component';
import { GridDistortionComponent } from './components/grid-distortion/grid-distortion.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent, StarBorderComponent, GridDistortionComponent],
  template: `
    <div style="width: 100%; height: 600px; position: relative;">
      <app-grid-distortion
        imageSrc="https://picsum.photos/1920/1080?grayscale"
        [grid]="10"
        [mouse]="0.1"
        [strength]="0.15"
        [relaxation]="0.9"
        className="custom-class"
      ></app-grid-distortion>
    </div>
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
