import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private router = inject(Router);

    user$ = user(this.auth);

    async login() {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(this.auth, provider);
        const userRef = doc(this.firestore, `users/${credential.user.uid}`);
        await setDoc(userRef, {
            uid: credential.user.uid,
            email: credential.user.email,
            displayName: credential.user.displayName,
            photoURL: credential.user.photoURL,
        }, { merge: true });
        this.router.navigate(['/dashboard']);
    }

    logout() {
        return signOut(this.auth).then(() => this.router.navigate(['/']));
    }
}
