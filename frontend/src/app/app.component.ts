import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Auth, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FluidCursorComponent } from './components/fluid-cursor/fluid-cursor.component';
import { AuroraComponent } from './components/aurora/aurora.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FluidCursorComponent, AuroraComponent],
  template: `
    <app-fluid-cursor></app-fluid-cursor>
    <app-aurora 
      [colorStops]="['#3A29FF', '#FF94B4', '#FF3232']"
      [blend]="0.5"
      [amplitude]="1.0"
      [speed]="0.5"
    ></app-aurora>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  user$: Observable<User | null> = user(this.auth);

  ngOnInit() {
    // Listen to auth state changes for protected routes
    this.user$.subscribe((user) => {
      if (user) {
        console.log('✅ User authenticated:', user.email);
      } else {
        console.log('❌ User not authenticated');
      }
    });
  }
}
