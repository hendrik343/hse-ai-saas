import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Timestamp } from 'firebase/firestore';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({ providedIn: 'root' })
export class ReportService {
    constructor(private firestore: Firestore, private storage: Storage) { }

    async exportReport(userId: string, data: any) {
        const timestamp = Timestamp.now().toDate().toISOString();

        // 1. Save JSON to Firestore
        const docRef = await addDoc(collection(this.firestore, 'reports'), {
            userId,
            createdAt: timestamp,
            ...data,
        });

        // 2. Create PDF
        const pdfDefinition: any = {
            content: [
                { text: 'Relatório HSE AI', style: 'header' },
                `Data: ${timestamp}`,
                `Utilizador: ${userId}`,
                '\n',
                { text: 'Resultado da Análise:', style: 'subheader' },
                JSON.stringify(data.result, null, 2),
            ],
            styles: {
                header: { fontSize: 22, bold: true },
                subheader: { fontSize: 16, margin: [0, 10, 0, 5] },
            },
        ***REMOVED***

        const pdfBlob = await pdfMake.createPdf(pdfDefinition).getBlob();

        // 3. Upload PDF to Firebase Storage
        const storageRef = ref(this.storage, `reports/${userId}/${docRef.id}.pdf`);
        await uploadBytes(storageRef, pdfBlob);
        const downloadUrl = await getDownloadURL(storageRef);

        // 4. Update Firestore with PDF URL
        await updateDoc(doc(this.firestore, 'reports', docRef.id), {
            pdfUrl: downloadUrl,
        });

        return downloadUrl;
    }
}
