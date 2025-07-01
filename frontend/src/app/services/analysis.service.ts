import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseStorage } from '@angular/fire/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
    constructor(
        private firestore: Firestore,
        private storage: FirebaseStorage
    ) { }

    async uploadAndAnalyze(file: File, userId: string, onProgress: (value: number) => void): Promise<string> {
        const filePath = `uploads/${userId}/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);

        const task = uploadBytesResumable(fileRef, file);

        return new Promise((resolve, reject) => {
            task.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(Math.round(progress));
                },
                reject,
                async () => {
                    const downloadURL = await getDownloadURL(task.snapshot.ref);

                    const analysis = 'Simulação: Detetado capacete, colete e luvas';

                    await addDoc(collection(this.firestore, 'analises'), {
                        userId,
                        imageUrl: downloadURL,
                        result: analysis,
                        timestamp: Timestamp.now(),
                    });

                    resolve(analysis);
                }
            );
        });
    }
}
