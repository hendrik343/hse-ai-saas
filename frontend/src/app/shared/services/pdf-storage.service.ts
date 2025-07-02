import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Timestamp } from 'firebase/firestore';
import { finalize } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class PdfStorageService {
    constructor(
        private storage: AngularFireStorage,
        private firestore: AngularFirestore
    ) { }

    async uploadPdf(file: Blob, userId: string, detections: any[]): Promise<string> {
        const reportId = uuidv4();
        const filePath = `reports/${userId}/${reportId}.pdf`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        return new Promise<string>((resolve, reject) => {
            task.snapshotChanges().pipe(
                finalize(async () => {
                    const url = await fileRef.getDownloadURL().toPromise();
                    await this.saveReportData(reportId, userId, detections, url);
                    resolve(url);
                })
            ).subscribe();
        });
    }

    private async saveReportData(
        reportId: string,
        userId: string,
        detections: any[],
        pdfUrl: string
    ): Promise<void> {
        const data = {
            reportId,
            userId,
            pdfUrl,
            detections,
            createdAt: Timestamp.now(),
        ***REMOVED***
        await this.firestore.collection('reports').doc(reportId).set(data);
    }
}
