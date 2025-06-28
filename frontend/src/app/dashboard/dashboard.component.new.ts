import { Component, OnInit, signal, computed } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService, UserProfile } from '../services/auth.service';
import { ImageService } from '../services/image.service';
import { AiService } from '../services/ai.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="user-info" *ngIf="userProfile()">
        <p>Bem-vindo, {{ userProfile()?.displayName || userProfile()?.email }}</p>
        <p>Organização: {{ userProfile()?.organizationName }}</p>
        <p>Plano: {{ userProfile()?.subscriptionPlan }}</p>
      </div>

      <div class="reports-section">
        <h2>Relatórios Recentes</h2>
        <div class="reports-list" *ngIf="reports().length > 0">
          <div class="report-item" *ngFor="let report of reports()">
            <img [src]="report.imageUrl" alt="Report image" class="report-image">
            <div class="report-details">
              <p><strong>Data:</strong> {{ report.createdAt | date }}</p>
              <p><strong>Email:</strong> {{ report.email }}</p>
            </div>
          </div>
        </div>
        <p *ngIf="reports().length === 0">Nenhum relatório encontrado.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .user-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .reports-section {
      margin-top: 20px;
    }
    
    .reports-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }
    
    .report-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
    }
    
    .report-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .report-details p {
      margin: 5px 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  reports = signal<any[]>([]);
  userProfile: any;

  constructor(
    private afs: AngularFirestore, 
    private auth: AuthService,
    private imageService: ImageService,
    private aiService: AiService
  ) {
    this.userProfile = this.auth.userProfile$;
  }

  ngOnInit() {
    const profile = this.auth.getCurrentUser();
    if (profile) {
      this.loadReports(profile.uid);
    }
  }

  private loadReports(userId: string) {
    this.afs.collection('reports', ref => ref.where('userId', '==', userId))
      .valueChanges()
      .subscribe(reports => {
        this.reports.set(reports);
      });
  }
} 