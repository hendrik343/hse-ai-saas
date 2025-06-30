import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuroraComponent } from './aurora/aurora.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AuroraComponent, LanguageSwitcherComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  paisSelecionado: string = '';
  previewImage: string | null = null;
  showPreview: boolean = false;
  loading: boolean = false;

  constructor(private router: Router) { }

  tirarFoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result as string;
          this.showPreview = true;
        ***REMOVED***
        reader.readAsDataURL(file);
      }
    ***REMOVED***
    input.click();
  }

  confirmPhoto(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.showPreview = false;
      alert('Foto enviada com sucesso!');
    }, 2000);
  }

  retakePhoto(): void {
    this.previewImage = null;
    this.showPreview = false;
    this.tirarFoto();
  }

  selecionarPais(): void {
    console.log('País selecionado:', this.paisSelecionado);
  }

  comecar() {
    this.router.navigate(['/upload']);
  }
}
