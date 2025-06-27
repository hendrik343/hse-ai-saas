// src/app/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Auth, user, User, signInAnonymously } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  organizationId: string;
  organizationName?: string;
  subscriptionPlan: 'free' | 'premium';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Signal para o usuário autenticado
  user$ = toSignal(user(this.auth), { initialValue: null });

  // Signal computado para verificar se está logado
  isAuthenticated = computed(() => !!this.user$());

  // Signal para o perfil completo do usuário
  userProfile$ = toSignal(
    user(this.auth).pipe(
      switchMap(user => {
        if (!user) return of(null);
        
        // Busca o perfil do usuário no Firestore
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            return {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || userData['displayName'] || '',
              organizationId: userData['organizationId'] || '',
              organizationName: userData['organizationName'] || '',
              subscriptionPlan: userData['subscriptionPlan'] || 'free'
            } as UserProfile;
          }
          return null;
        });
      })
    ),
    { initialValue: null }
  );

  // Observable version for use with pipes
  userProfile$Observable = user(this.auth).pipe(
    switchMap(user => {
      if (!user) return of(null);
      
      // Busca o perfil do usuário no Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      return getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          return {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || userData['displayName'] || '',
            organizationId: userData['organizationId'] || '',
            organizationName: userData['organizationName'] || '',
            subscriptionPlan: userData['subscriptionPlan'] || 'free'
          } as UserProfile;
        }
        return null;
      });
    })
  );

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): UserProfile | null {
    return this.userProfile$();
  }

  /**
   * Retorna o ID da organização do usuário atual
   */
  getCurrentOrganizationId(): string {
    const profile = this.userProfile$();
    return profile?.organizationId || '';
  }

  /**
   * Retorna o ID do usuário atual
   */
  getCurrentUserId(): string {
    const user = this.user$();
    return user?.uid || '';
  }

  /**
   * Verifica se o usuário tem plano premium
   */
  isPremiumUser(): boolean {
    const profile = this.userProfile$();
    return profile?.subscriptionPlan === 'premium';
  }

  // Ensure anonymous authentication (similar to the user's code)
  async ensureAnonymousAuth(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      try {
        await signInAnonymously(this.auth);
        console.log('Anonymous authentication successful');
      } catch (error) {
        console.error('Anonymous authentication failed:', error);
        throw error;
      }
    }
  }
}
