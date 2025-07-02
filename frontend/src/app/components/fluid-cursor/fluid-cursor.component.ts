import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-fluid-cursor',
  standalone: true,
  template: `
    <div class="fluid-cursor-container">
      <canvas
        #canvasRef
        id="fluid"
        class="fluid-canvas"
      ></canvas>
    </div>
  `,
  styles: [`
    .fluid-cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      pointer-events: none;
      width: 100%;
      height: 100%;
    }
    
    .fluid-canvas {
      width: 100vw;
      height: 100vh;
      display: block;
    }
  `]
})
export class FluidCursorComponent implements OnInit, OnDestroy {
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() enabled = true;
  @Input() color = '#ff6b6b';
  @Input() size = 20;
  @Input() trailLength = 10;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private mouseX = 0;
  private mouseY = 0;
  private trail: Array<{x: number, y: number, alpha: number}> = [];

  ngOnInit() {
    if (this.enabled) {
      this.initFluidCursor();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initFluidCursor() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.resizeCanvas();
    this.setupEventListeners();
    this.startAnimation();
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupEventListeners() {
    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Resize event
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.addToTrail(this.mouseX, this.mouseY);
  }

  private handleMouseDown(e: MouseEvent) {
    this.createSplash(e.clientX, e.clientY);
  }

  private handleMouseUp(e: MouseEvent) {
    // Optional: add any mouse up effects
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      this.addToTrail(this.mouseX, this.mouseY);
    }
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.createSplash(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    // Optional: add any touch end effects
  }

  private handleResize() {
    this.resizeCanvas();
  }

  private addToTrail(x: number, y: number) {
    this.trail.push({ x, y, alpha: 1.0 });
    
    // Keep trail length limited
    if (this.trail.length > this.trailLength) {
      this.trail.shift();
    }
  }

  private createSplash(x: number, y: number) {
    // Create a splash effect at the click/touch point
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const distance = Math.random() * 30 + 10;
      const splashX = x + Math.cos(angle) * distance;
      const splashY = y + Math.sin(angle) * distance;
      this.addToTrail(splashX, splashY);
    }
  }

  private startAnimation() {
    const animate = () => {
      this.updateFrame();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateFrame() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw trail
    this.drawTrail();
    
    // Update trail alpha
    this.updateTrailAlpha();
  }

  private drawTrail() {
    this.ctx.save();
    
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const size = this.size * (i / this.trail.length);
      
      // Create gradient
      const gradient = this.ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, size
      );
      
      gradient.addColorStop(0, `${this.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private updateTrailAlpha() {
    // Fade out trail points
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha *= 0.95;
    }
    
    // Remove fully transparent points
    this.trail = this.trail.filter(point => point.alpha > 0.01);
  }
} 