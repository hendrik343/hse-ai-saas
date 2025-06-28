import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Auth, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  template: `
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
