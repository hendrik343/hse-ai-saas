import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera-capture.component.html',
})
export class CameraCaptureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @Output() photoCaptured = new EventEmitter<string>();

  error: string | null = null;
  isCameraInitializing: boolean = true;
  capturedImage: string | null = null;
  private stream: MediaStream | null = null;

  ngAfterViewInit() {
    // Defer camera access until view is ready and we can check for HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      this.error = "Camera access requires a secure (HTTPS) connection.";
      this.isCameraInitializing = false;
      return;
    }
    this.enableCamera();
  }

  ngOnDestroy() {
    this.stopStream();
  }

  private stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async enableCamera() {
    this.isCameraInitializing = true;
    this.error = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error = "Camera API is not supported by this browser.";
      this.isCameraInitializing = false;
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play(); // Explicit play call is crucial for mobile browsers
      this.error = null;
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = 'Could not access the camera. Please ensure you have a camera connected and have granted permission.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          message = 'Camera access was denied. Please grant permission in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          message = 'No camera was found on this device.';
        }
      }
      this.error = message;
    } finally {
      this.isCameraInitializing = false;
    }
  }

  capturePhoto() {
    if (!this.videoRef || !this.videoRef.nativeElement || !this.stream) return;

    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.capturedImage = dataUrl;
      this.photoCaptured.emit(dataUrl);
      this.stopStream(); // Stop the live camera feed
    }
  }

  clearPhoto() {
    this.capturedImage = null;
    // Use a timeout to ensure the DOM has updated (img removed, video re-added) before starting camera
    setTimeout(() => {
      this.enableCamera();
    });
  }
}
