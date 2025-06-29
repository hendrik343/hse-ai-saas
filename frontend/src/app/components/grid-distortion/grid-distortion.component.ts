import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-grid-distortion',
  template: `<div #container class="w-full h-full fixed top-0 left-0 z-[-1]"></div>`,
  styles: [``]
})
export class GridDistortionComponent implements OnInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() imageSrc: string = '/assets/bg.jpg'; // Caminho local

  ngOnInit(): void {
    const container = this.containerRef.nativeElement;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    container.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const loader = new THREE.TextureLoader();

    loader.load(this.imageSrc, (texture) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float time;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            uv.y += 0.005 * sin(uv.x * 40.0 + time);
            gl_FragColor = texture2D(uTexture, uv);
          }
        `
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      function animate() {
        material.uniforms['time'].value += 0.01;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    });

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
} 