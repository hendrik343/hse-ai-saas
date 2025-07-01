import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress: number | null = null;
  analysisResult: string | null = null;

  private storage = inject(getStorage);
  private firestore = inject(getFirestore);
  private auth = inject(getAuth);

  constructor(private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    // Detect browser language and persist user choice
    const savedLang = localStorage.getItem('lang');
    const browserLang = navigator.language.split('-')[0];
    const supported = ['en', 'pt', 'fr'];
    const lang = savedLang || (supported.includes(browserLang) ? browserLang : 'en');
    this.translate.use(lang);
  }

  tirarFoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        ***REMOVED***
        reader.readAsDataURL(file);
      }
    ***REMOVED***
    input.click();
  }

  confirmPhoto(): void {
    this.uploading = true;
    setTimeout(() => {
      this.uploading = false;
      alert('Foto enviada com sucesso!');
    }, 2000);
  }

  retakePhoto(): void {
    this.previewUrl = null;
    this.tirarFoto();
  }

  comecar() {
    this.router.navigate(['/upload']);
  }

  abrirUpload() {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) input.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.previewUrl = URL.createObjectURL(file);
      this.uploading = true;
      this.uploadProgress = 0;
      this.analysisResult = null;
      try {
        // 1. Upload to Firebase Storage
        const storageRef = ref(this.storage, `uploads/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', (snapshot) => {
          this.uploadProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        });
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        // 2. Simulate analysis (replace with real AI call later)
        await new Promise(res => setTimeout(res, 2000));
        const result = `Ausência de capacete identificado\nRisco de queda (altura sem proteção)\nRecomendação: aplicar sinalização de segurança e EPI obrigatório`;
        this.analysisResult = result;
        // 3. Save to Firestore
        const user = this.auth.currentUser;
        await addDoc(collection(this.firestore, 'analyses'), {
          imageUrl: downloadURL,
          result,
          userId: user ? user.uid : null,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        this.analysisResult = 'Erro ao enviar ou analisar a imagem.';
      } finally {
        this.uploading = false;
        this.uploadProgress = null;
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.classList.add('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('dragover');
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.previewUrl = URL.createObjectURL(file);
      this.uploading = true;
      setTimeout(() => {
        this.uploading = false;
        // Exemplo: this.router.navigate(['/upload'], { state: { file } });
      }, 1200);
    }
  }

  tirarFotoAgora() {
    // TODO: Redirecionar para rota de upload ou autenticação
    console.log('Tirar foto agora clicado!');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}
