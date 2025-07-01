import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { FormsModule } from '@angular/forms'; // imported for other form components, ngModel not used here
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  @HostBinding('class.loading') loading: boolean = false;
  @HostBinding('class.sucesso') sucesso: boolean = false;

  previewImage: string | null = null;
  showPreview: boolean = false;
  paisSelecionado: string = '';

  // For template file upload and translation features
  previewUrl?: string;
  uploading: boolean = false;
  uploadProgress: number | null = null;
  analysisResult: string | null = null;

  tirarFoto() {
    // Implementa a lógica para ir à página de upload ou ativar a câmara
    console.log("Botão 'Tirar Foto Agora' clicado!");
  }

  confirmPhoto(): void {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.showPreview = false;
      this.previewImage = null;
      this.sucesso = true;

      setTimeout(() => this.sucesso = false, 4000);
    }, 2000);
  }

  retakePhoto(): void {
    this.previewImage = null;
    this.showPreview = false;
    this.tirarFoto();
  }

  // Open hidden file input for upload
  abrirUpload(): void {
    const input = document.getElementById('fileInput') as HTMLInputElement | null;
    input?.click();
  }

  // Handle file selection
  onFileSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.previewUrl = URL.createObjectURL(file);
    // Example: start upload or analysis process
    console.log('File selected for analysis:', file.name);
  }

  // Final CTA click handler
  comecar(): void {
    console.log('CTA iniciar processo');
  }

  selecionarPais(pais: string): void {
    console.log('País selecionado:', pais);
    // Aqui podes guardar numa variável, ou alterar lógica com base no país
  }
}
