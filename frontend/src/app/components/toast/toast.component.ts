// src/app/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toastService.toasts$()" 
        class="toast"
        [ngClass]="'toast--' + toast.type"
        (click)="toastService.removeToast(toast.id)"
      >
        <div class="toast__content">
          <svg class="toast__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- Success Icon -->
            <path *ngIf="toast.type === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline *ngIf="toast.type === 'success'" points="22,4 12,14.01 9,11.01"></polyline>
            
            <!-- Error Icon -->
            <circle *ngIf="toast.type === 'error'" cx="12" cy="12" r="10"></circle>
            <line *ngIf="toast.type === 'error'" x1="15" y1="9" x2="9" y2="15"></line>
            <line *ngIf="toast.type === 'error'" x1="9" y1="9" x2="15" y2="15"></line>
            
            <!-- Info Icon -->
            <circle *ngIf="toast.type === 'info'" cx="12" cy="12" r="10"></circle>
            <path *ngIf="toast.type === 'info'" d="M12 16v-4"></path>
            <path *ngIf="toast.type === 'info'" d="M12 8h.01"></path>
            
            <!-- Warning Icon -->
            <path *ngIf="toast.type === 'warning'" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line *ngIf="toast.type === 'warning'" x1="12" y1="9" x2="12" y2="13"></line>
            <line *ngIf="toast.type === 'warning'" x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span class="toast__message">{{ toast.message }}</span>
        </div>
        <button 
          class="toast__close"
          (click)="toastService.removeToast(toast.id)"
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(8px);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      
      &--success {
        background-color: rgba(34, 197, 94, 0.9);
        color: white;
      }
      
      &--error {
        background-color: rgba(239, 68, 68, 0.9);
        color: white;
      }
      
      &--info {
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
      }
      
      &--warning {
        background-color: rgba(245, 158, 11, 0.9);
        color: white;
      }
    }

    .toast__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .toast__icon {
      flex-shrink: 0;
    }

    .toast__message {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .toast__close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}