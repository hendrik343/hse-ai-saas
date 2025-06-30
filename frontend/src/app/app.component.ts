import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent],
  template: `
    <app-fluid-cursor></app-fluid-cursor>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }
    `
  ]
})
export class AppComponent {
  title = 'frontend';

  // Auth properties
  user$ = null;
  registerEmail = '';
  loginEmail = '';
  loading = false;
  error = null;

  constructor(private router: Router) { }
}
