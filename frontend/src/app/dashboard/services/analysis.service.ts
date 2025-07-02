import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseStorage } from '@angular/fire/storage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
    constructor(
        private firestore: Firestore,
        private storage: FirebaseStorage
    ) { }

    async uploadAndAnalyzeImage(file: File): Promise<{ imageUrl: string; result: any }> {
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);
        await uploadBytes(fileRef, file);
        const imageUrl = await getDownloadURL(fileRef);

        // Simulação de análise
        const result = {
            issue: 'Capacete ausente',
            severity: 'Alta',
            recommendation: 'Utilizar capacete de proteção.'
        };

        await addDoc(collection(this.firestore, 'analises'), {
            imageUrl,
            result,
            timestamp: Timestamp.now(),
        });

        return { imageUrl, result };
    }
}
