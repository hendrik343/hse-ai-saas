import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera-capture',
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.css']
})
export class CameraCaptureComponent {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  photoDataUrl: string | null = null;
  errorMessage: string | null = null;

  async startCamera() {
    try {
      this.errorMessage = null;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      this.videoRef.nativeElement.srcObject = stream;
      this.videoRef.nativeElement.play();
    } catch (err: any) {
      this.errorMessage = 'Erro ao aceder à câmara. Verifica as permissões do navegador.';
      console.error('Erro na câmara:', err);
    }
  }

  capturePhoto() {
    try {
      const video = this.videoRef.nativeElement;
      const canvas = this.canvasRef.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context inválido');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.photoDataUrl = canvas.toDataURL('image/png');
    } catch (err: any) {
      this.errorMessage = 'Erro ao capturar imagem.';
      console.error(err);
    }
  }
}
