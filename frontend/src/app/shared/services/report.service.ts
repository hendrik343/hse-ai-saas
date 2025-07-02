import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Timestamp, getDocs, orderBy, query, where } from 'firebase/firestore';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Suporte robusto para diferentes formatos de export do pdfmake em produção
// Compatível com pdfmake moderno: vfs está em pdfFonts.pdfMake.vfs
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

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
        };

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

    async getUserReports(userId: string) {
        const reportsRef = collection(this.firestore, 'reports');
        const q = query(reportsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export interface Report {
    id?: string;
    userId: string;
    createdAt: any;
    detections: any[];
    imageUrl: string;
    pdfUrl: string;
}
