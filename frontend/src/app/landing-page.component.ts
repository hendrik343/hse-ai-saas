import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  selectedCountry: string = '';
  previewImage: string | null = null;
  showPreview: boolean = false;
  loading: boolean = false;

  onPhotoClick() {
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImage = e.target.result;
          this.showPreview = true;
        ***REMOVED***
        reader.readAsDataURL(file);
      }
    ***REMOVED***
    input.click();
  }

  confirmPhoto() {
    this.loading = true;
    // Simulate analysis or navigation
    setTimeout(() => {
      this.loading = false;
      this.showPreview = false;
      alert('Imagem confirmada! (Aqui você pode iniciar a análise ou navegar para outra página)');
    }, 1200);
  }

  retakePhoto() {
    this.previewImage = null;
    this.showPreview = false;
    this.onPhotoClick();
  }
}
