import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-grid-distortion',
  standalone: true,
  template: `
    <div #containerRef class="distortion-container" [class]="className"></div>
  `,
  styles: [`
    .distortion-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `]
})
export class GridDistortionComponent implements OnInit, OnDestroy {
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  
  @Input() grid = 15;
  @Input() mouse = 0.1;
  @Input() strength = 0.15;
  @Input() relaxation = 0.9;
  @Input() imageSrc = 'https://picsum.photos/1920/1080?grayscale';
  @Input() className = '';

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private material!: THREE.ShaderMaterial;
  private geometry!: THREE.PlaneGeometry;
  private mesh!: THREE.Mesh;
  private dataTexture!: THREE.DataTexture;
  private initialData!: Float32Array;
  private imageAspect = 1;
  private animationId = 0;
  private mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 ***REMOVED***

  // Shader sources
  private readonly vertexShader = `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  private readonly fragmentShader = `
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

  ngOnInit() {
    this.initThreeJS();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initThreeJS() {
    const container = this.containerRef.nativeElement;
    if (!container) return;

    // Create scene
    this.scene = new THREE.Scene();

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Create camera
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    this.camera.position.z = 2;

    // Create uniforms
    const uniforms: any = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as any },
      uDataTexture: { value: null as any },
    ***REMOVED***

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.imageSrc, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      this.imageAspect = texture.image.width / texture.image.height;
      uniforms.uTexture.value = texture;
      this.handleResize();
    });

    // Create data texture
    const size = this.grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }

    this.initialData = new Float32Array(data);

    this.dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    this.dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = this.dataTexture;

    // Create material
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    // Create geometry and mesh
    this.geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Setup event listeners
    this.setupEventListeners();

    // Start animation
    this.animate();
  }

  private setupEventListeners() {
    const container = this.containerRef.nativeElement;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      this.mouseState.vX = x - this.mouseState.prevX;
      this.mouseState.vY = y - this.mouseState.prevY;
      Object.assign(this.mouseState, { x, y, prevX: x, prevY: y });
    ***REMOVED***

    const handleMouseLeave = () => {
      this.dataTexture.needsUpdate = true;
      Object.assign(this.mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 });
    ***REMOVED***

    const handleResize = () => {
      this.handleResize();
    ***REMOVED***

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Store cleanup function
    this.cleanup = () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      this.renderer.dispose();
      this.geometry.dispose();
      this.material.dispose();
      this.dataTexture.dispose();
      if (this.material.uniforms['uTexture'].value) {
        this.material.uniforms['uTexture'].value.dispose();
      }
    ***REMOVED***
  }

  private handleResize() {
    const container = this.containerRef.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const containerAspect = width / height;

    this.renderer.setSize(width, height);

    const scale = Math.max(containerAspect / this.imageAspect, 1);
    this.mesh.scale.set(this.imageAspect * scale, scale, 1);

    const frustumHeight = 1;
    const frustumWidth = frustumHeight * containerAspect;
    this.camera.left = -frustumWidth / 2;
    this.camera.right = frustumWidth / 2;
    this.camera.top = frustumHeight / 2;
    this.camera.bottom = -frustumHeight / 2;
    this.camera.updateProjectionMatrix();

    this.material.uniforms['resolution'].value.set(width, height, 1, 1);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    this.material.uniforms['time'].value += 0.05;

    const data = this.dataTexture.image.data as Float32Array;
    for (let i = 0; i < this.grid * this.grid; i++) {
      data[i * 4] *= this.relaxation;
      data[i * 4 + 1] *= this.relaxation;
    }

    const gridMouseX = this.grid * this.mouseState.x;
    const gridMouseY = this.grid * this.mouseState.y;
    const maxDist = this.grid * this.mouse;

    for (let i = 0; i < this.grid; i++) {
      for (let j = 0; j < this.grid; j++) {
        const distance = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
        if (distance < maxDist * maxDist) {
          const index = 4 * (i + this.grid * j);
          const power = Math.min(maxDist / Math.sqrt(distance), 10);
          data[index] += this.strength * 100 * this.mouseState.vX * power;
          data[index + 1] -= this.strength * 100 * this.mouseState.vY * power;
        }
      }
    }

    this.dataTexture.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  ***REMOVED***

  private cleanup = () => {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  ***REMOVED***
} 