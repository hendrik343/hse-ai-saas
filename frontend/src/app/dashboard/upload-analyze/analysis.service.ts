import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
    constructor(
        private storage: AngularFireStorage,
        private firestore: AngularFirestore
    ) { }

    uploadAndAnalyze(file: File): Observable<any> {
        const path = `uploads/${Date.now()}-${file.name}`;
        const ref = this.storage.ref(path);
        return from(this.storage.upload(path, file)).pipe(
            switchMap(() => ref.getDownloadURL()),
            switchMap((url) => {
                const fakeAnalysis = {
                    fileUrl: url,
                    risco: 'Capacete ausente',
                    severidade: 'Alta',
                    timestamp: new Date().toISOString()
                };
                return from(this.firestore.collection('analises').add(fakeAnalysis).then(() => fakeAnalysis));
            })
        );
    }
}
