import { ElementRef, Injectable } from '@angular/core';
import { Camera, Geometry, Mesh, Program, Renderer, Transform, Vec2 } from 'ogl';

interface AuroraOptions {
  colorStops?: string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuroraService {
  private renderer: Renderer | null = null;
  private animationId: number | null = null;
  private startTime: number = Date.now();

  createAurora(container: ElementRef<HTMLElement>, options: AuroraOptions = {}) {
    const {
      colorStops = ["#3A29FF", "#FF94B4", "#FF3232"],
      blend = 0.5,
      amplitude = 1.0,
      speed = 0.5
    } = options;

    // Setup renderer
    this.renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
      antialias: true
    });

    const gl = this.renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // Add canvas to container
    container.nativeElement.appendChild(gl.canvas);

    // Setup camera
    const camera = new Camera(gl);
    camera.position.z = 1;

    // Create scene
    const scene = new Transform();

    // Vertex shader
    const vertex = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `;

    // Fragment shader with aurora effect
    const fragment = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uBlend;
      uniform float uAmplitude;
      uniform float uSpeed;
      varying vec2 vUv;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 inter = fract(p);
        inter = inter * inter * (3.0 - 2.0 * inter);
        
        float a = noise(floor(p));
        float b = noise(floor(p) + vec2(1.0, 0.0));
        float c = noise(floor(p) + vec2(0.0, 1.0));
        float d = noise(floor(p) + vec2(1.0, 1.0));
        
        return mix(mix(a, b, inter.x), mix(c, d, inter.x), inter.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 5; i++) {
          value += amplitude * smoothNoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= uResolution.x / uResolution.y;

        float time = uTime * uSpeed;
        
        // Create flowing aurora pattern
        float noise1 = fbm(p * 2.0 + vec2(time * 0.1, time * 0.2)) * uAmplitude;
        float noise2 = fbm(p * 3.0 + vec2(time * 0.15, -time * 0.1)) * uAmplitude;
        float noise3 = fbm(p * 1.5 + vec2(-time * 0.05, time * 0.25)) * uAmplitude;
        
        // Combine noises for aurora effect
        float aurora = (noise1 + noise2 * 0.7 + noise3 * 0.5) / 2.2;
        aurora = smoothstep(0.0, 1.0, aurora);
        
        // Create color gradient
        float hue = 0.7 + aurora * 0.3 + sin(time * 0.5) * 0.1;
        float saturation = 0.8 + aurora * 0.2;
        float brightness = aurora * 0.8;
        
        vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
        
        // Add some sparkle
        float sparkle = smoothNoise(p * 20.0 + time);
        sparkle = smoothstep(0.95, 1.0, sparkle);
        color += sparkle * 0.3;
        
        gl_FragColor = vec4(color, aurora * uBlend);
      }
    `;

    // Create program
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uBlend: { value: blend },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed }
      },
      transparent: true
    });

    // Create geometry (fullscreen quad)
    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    // Handle resize
    const resize = () => {
      const { clientWidth, clientHeight } = container.nativeElement;
      this.renderer!.setSize(clientWidth, clientHeight);
      camera.perspective({ aspect: clientWidth / clientHeight });
      program.uniforms['uResolution'].value.set(clientWidth, clientHeight);
    ***REMOVED***

    // Initial resize
    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    const animate = () => {
      const time = (Date.now() - this.startTime) * 0.001;
      program.uniforms['uTime'].value = time;

      this.renderer!.render({ scene, camera });
      this.animationId = requestAnimationFrame(animate);
    ***REMOVED***

    animate();

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', resize);
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    ***REMOVED***
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.renderer = null;
  }
}
