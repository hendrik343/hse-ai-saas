import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.previewUrl = URL.createObjectURL(file);
      this.uploading = true;
      setTimeout(() => {
        this.uploading = false;
        // Exemplo: this.router.navigate(['/upload'], { state: { file } });
      }, 1200);
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
