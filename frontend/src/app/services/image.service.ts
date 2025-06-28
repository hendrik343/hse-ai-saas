import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private auth: AuthService
  ) {}

  async uploadImage(file: File) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const filePath = `images/${user.uid}_${Date.now()}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          const docRef = await this.firestore.collection('reports').add({
            userId: user.uid,
            email: user.email,
            imageUrl: downloadURL,
            createdAt: new Date(),
          });
          resolve({ downloadURL, docRef });
        })
      ).subscribe();
    });
  }
} 