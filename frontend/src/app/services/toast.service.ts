// src/app/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  
  // Public readonly signal for components
  readonly toasts$ = this.toasts.asReadonly();

  /**
   * Show a success toast
   */
  showSuccess(message: string, duration = 5000) {
    this.addToast('success', message, duration);
  }

  /**
   * Show an error toast
   */
  showError(message: string, duration = 7000) {
    this.addToast('error', message, duration);
  }

  /**
   * Show an info toast
   */
  showInfo(message: string, duration = 5000) {
    this.addToast('info', message, duration);
  }

  /**
   * Show a warning toast
   */
  showWarning(message: string, duration = 6000) {
    this.addToast('warning', message, duration);
  }

  /**
   * Remove a toast by ID
   */
  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.toasts.set([]);
  }

  /**
   * Add a new toast
   */
  private addToast(type: Toast['type'], message: string, duration: number) {
    const id = this.generateId();
    const toast: Toast = { id, type, message, duration ***REMOVED***
    
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  /**
   * Generate a unique ID for toasts
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}