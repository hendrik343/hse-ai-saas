import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { DocumentData, Firestore, collection, collectionData, orderBy, query } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

interface Report {
    id?: string;
    filename: string;
    downloadURL: string;
    createdAt: any;
    result?: any;
}

@Component({
    selector: 'app-report-history',
    templateUrl: './report-history.component.html',
    styleUrls: ['./report-history.component.scss']
})
export class ReportHistoryComponent implements OnInit {
    reports$: Observable<Report[]> = of([]);
    filter = '';
    filteredReports: Report[] = [];

    constructor(private firestore: Firestore, private auth: Auth) { }

    async ngOnInit() {
        const user = await this.auth.currentUser;
        if (!user) return;
        const reportsRef = collection(this.firestore, `reports`);
        // Para granularidade por user: `users/${user.uid}/reports`
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        collectionData(q, { idField: 'id' }).subscribe((docs: DocumentData[]) => {
            this.filteredReports = docs.filter((r: any) => r && r.filename) as Report[];
        });
    }

    get filtered() {
        if (!this.filter) return this.filteredReports;
        const f = this.filter.toLowerCase();
        return this.filteredReports.filter(r =>
            (r.filename && r.filename.toLowerCase().includes(f)) ||
            (r.result && JSON.stringify(r.result).toLowerCase().includes(f)) ||
            (r.createdAt && r.createdAt.toString().includes(f))
        );
    }
}
