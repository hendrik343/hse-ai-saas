import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { Organization, UserProfile, HSEReport, HSEData } from '../types/firestore.types';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Organization methods
  async createOrganization(orgData: Partial<Organization>): Promise<string> {
    const orgRef = doc(collection(this.firestore, 'organizations'));
    const organization: Organization = {
      id: orgRef.id,
      name: orgData.name || 'Nova Organização',
      createdAt: new Date(),
      updatedAt: new Date(),
      adminUserId: this.auth.currentUser?.uid || '',
      settings: {
        subscription: 'free',
        maxUsers: 5,
        maxReports: 10,
        timezone: 'Europe/Lisbon',
        language: 'pt',
        features: ['basic_reports', 'incident_tracking']
      },
      ...orgData
    ***REMOVED***
    
    await setDoc(orgRef, organization);
    return orgRef.id;
  }

  // User Profile methods
  async createUserProfile(orgId: string, userProfile: Partial<UserProfile>): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(this.firestore, `organizations/${orgId}/users`, userId);
    const profile: UserProfile = {
      id: userId,
      email: this.auth.currentUser?.email || '',
      role: 'owner',
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['all'],
      ...userProfile
    ***REMOVED***

    await setDoc(userRef, profile);
  }

  getUserProfile(userId: string): Observable<UserProfile | null> {
    const userRef = doc(this.firestore, 'userProfiles', userId);
    return from(getDoc(userRef).then(userSnap => 
      userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as UserProfile : null
    ));
  }

  getOrganization(orgId: string): Observable<Organization | null> {
    const orgRef = doc(this.firestore, 'organizations', orgId);
    return from(getDoc(orgRef).then(orgSnap => 
      orgSnap.exists() ? { id: orgSnap.id, ...orgSnap.data() } as Organization : null
    ));
  }

  // HSE Data methods
  async createHSEData(orgId: string, hseData: Partial<HSEData>): Promise<string> {
    const dataRef = doc(collection(this.firestore, `organizations/${orgId}/data`));
    const data: HSEData = {
      id: dataRef.id,
      type: 'incident',
      data: {},
      organizationId: orgId,
      createdBy: this.auth.currentUser?.uid || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...hseData
    ***REMOVED***

    await setDoc(dataRef, data);
    return dataRef.id;
  }

  async getHSEData(orgId: string, type?: string): Promise<HSEData[]> {
    const dataCollection = collection(this.firestore, `organizations/${orgId}/data`);
    const q = type 
      ? query(dataCollection, where('type', '==', type), orderBy('createdAt', 'desc'))
      : query(dataCollection, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HSEData));
  }

  // HSE Reports methods
  async createHSEReport(orgId: string, report: Partial<HSEReport>): Promise<string> {
    const reportRef = doc(collection(this.firestore, `organizations/${orgId}/reports`));
    const hseReport: HSEReport = {
      id: reportRef.id,
      title: 'Novo Relatório',
      content: '',
      type: 'incident', // Ensure type is always set
      generatedBy: this.auth.currentUser?.uid || '',
      organizationId: orgId,
      aiGenerated: false,
      category: 'safety',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      ...report
    ***REMOVED***

    await setDoc(reportRef, hseReport);
    return reportRef.id;
  }

  getHSEReports(orgId: string): Observable<HSEReport[]> {
    const reportsCollection = collection(this.firestore, `organizations/${orgId}/reports`);
    const q = query(reportsCollection, orderBy('createdAt', 'desc'));
    
    return from(getDocs(q).then(querySnapshot => 
      querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HSEReport))
    ));
  }

  async updateHSEReport(orgId: string, reportId: string, updates: Partial<HSEReport>): Promise<void> {
    const reportRef = doc(this.firestore, `organizations/${orgId}/reports`, reportId);
    await updateDoc(reportRef, { ...updates, updatedAt: new Date() });
  }

  // Organization lookup by user
  async getUserOrganizations(): Promise<Organization[]> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return [];

    // Query all organizations where user is owner or member
    const orgsCollection = collection(this.firestore, 'organizations');
    const q = query(orgsCollection, where('ownerId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
  }
}
