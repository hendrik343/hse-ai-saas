import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-grid-distortion',
  standalone: true,
  template: `
    <div #container class="w-full h-full overflow-hidden relative">
      <div
        style="
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 3rem;
          font-weight: bold;
          text-shadow: 2px 2px 10px black;
          z-index: 2;
        "
      >
        HEALTH AND SAFETY
      </div>
      <button
        style="
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          background: #16ff7a;
          color: #fff;
          font-size: 1.5rem;
          font-weight: bold;
          border: none;
          border-radius: 2rem;
          padding: 1rem 2.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 2;
        "
      >
        <span style="margin-right: 0.5rem;">📷</span>Tirar Foto Agora
      </button>
    </div>
  `,
  styleUrls: ['./grid-distortion.component.scss']
})
export class GridDistortionComponent implements AfterViewInit, OnDestroy {
  @Input() imageSrc: string = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop';
  @Input() grid: number = 32;
  @Input() mouse: number = 0.15;
  @Input() strength: number = 0.25;
  @Input() relaxation: number = 0.85;
  @Input() colorIntensity: number = 0.3;
  @Input() waveSpeed: number = 0.8;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private animationId: any;
  private uniforms: any;
  private dataTexture!: THREE.DataTexture;
  private plane!: THREE.Mesh;
  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.ShaderMaterial;
  private imageAspect: number = 1;
  private initialData!: Float32Array;
  private mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 ***REMOVED***

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    const container = this.containerRef.nativeElement;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    this.camera.position.z = 2;

    this.uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null },
      uDataTexture: { value: null },
    ***REMOVED***

    const vertexShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      uniform sampler2D uDataTexture;
      uniform sampler2D uTexture;
      uniform vec4 resolution;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        vec4 offset = texture2D(uDataTexture, vUv);
        gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
      }
    `;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.imageSrc, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      this.imageAspect = texture.image.width / texture.image.height;
      this.uniforms.uTexture.value = texture;
      handleResize();
    });

    const size = this.grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }
    this.initialData = new Float32Array(data);
    this.dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    this.dataTexture.needsUpdate = true;
    this.uniforms.uDataTexture.value = this.dataTexture;

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    this.geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    const handleResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const containerAspect = width / height;
      const imageAspect = this.imageAspect;
      this.renderer.setSize(width, height);
      const scale = Math.max(containerAspect / imageAspect, 1);
      this.plane.scale.set(imageAspect * scale, scale, 1);
      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      this.camera.left = -frustumWidth / 2;
      this.camera.right = frustumWidth / 2;
      this.camera.top = frustumHeight / 2;
      this.camera.bottom = -frustumHeight / 2;
      this.camera.updateProjectionMatrix();
      this.uniforms.resolution.value.set(width, height, 1, 1);
    ***REMOVED***

    const mouseState = this.mouseState;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    ***REMOVED***
    const onMouseLeave = () => {
      this.dataTexture.needsUpdate = true;
      Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 });
    ***REMOVED***
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.uniforms.time.value += 0.05;
      const data = this.dataTexture.image.data as Float32Array;
      for (let i = 0; i < size * size; i++) {
        data[i * 4] *= this.relaxation;
        data[i * 4 + 1] *= this.relaxation;
      }
      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * this.mouse;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distance = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
          if (distance < maxDist * maxDist) {
            const index = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distance), 10);
            data[index] += this.strength * 100 * mouseState.vX * power;
            data[index + 1] -= this.strength * 100 * mouseState.vY * power;
          }
        }
      }
      this.dataTexture.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
    ***REMOVED***
    animate();

    this.cleanup = () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', handleResize);
      this.renderer.dispose();
      this.geometry.dispose();
      this.material.dispose();
      this.dataTexture.dispose();
      if (this.uniforms.uTexture.value) this.uniforms.uTexture.value.dispose();
      cancelAnimationFrame(this.animationId);
    ***REMOVED***
  }

  private cleanup: (() => void) | null = null;

  ngOnDestroy(): void {
    if (this.cleanup) this.cleanup();
  }
} 