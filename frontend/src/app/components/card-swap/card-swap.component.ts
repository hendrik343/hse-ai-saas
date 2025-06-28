import { Component, ContentChildren, QueryList, AfterViewInit, Input, ElementRef, ViewChildren, Renderer2, OnDestroy } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<div class="card"><ng-content></ng-content></div>`,
  styles: [`
    .card {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 12px;
      border: 1px solid #fff;
      background: #000;
      color: #fff;
      transform-style: preserve-3d;
      will-change: transform;
      backface-visibility: hidden;
      min-width: 300px;
      min-height: 200px;
      padding: 32px 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      font-size: 1.2rem;
      z-index: 1;
    }
  `]
})
export class CardComponent {}

@Component({
  selector: 'app-card-swap',
  standalone: true,
  template: `
    <div #container class="card-swap-container" [style.width.px]="width" [style.height.px]="height">
      <ng-content select="app-card"></ng-content>
    </div>
  `,
  styles: [`
    .card-swap-container {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translate(5%, 20%);
      transform-origin: bottom right;
      perspective: 900px;
      overflow: visible;
    }
    @media (max-width: 768px) {
      .card-swap-container {
        transform: scale(0.75) translate(25%, 25%);
      }
    }
    @media (max-width: 480px) {
      .card-swap-container {
        transform: scale(0.55) translate(25%, 25%);
      }
    }
  `]
})
export class CardSwapComponent implements AfterViewInit, OnDestroy {
  @Input() width = 500;
  @Input() height = 400;
  @Input() cardDistance = 60;
  @Input() verticalDistance = 70;
  @Input() delay = 5000;
  @Input() pauseOnHover = false;
  @Input() skewAmount = 6;
  @Input() easing: 'elastic' | 'power1' = 'elastic';

  @ContentChildren(CardComponent, { descendants: true, read: ElementRef }) cards!: QueryList<ElementRef>;
  private order: number[] = [];
  private intervalId: any;
  private tl: gsap.core.Timeline | null = null;

  constructor(private renderer: Renderer2, private host: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.init(), 0);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private makeSlot(i: number, distX: number, distY: number, total: number) {
    return {
      x: i * distX,
      y: -i * distY,
      z: -i * distX * 1.5,
      zIndex: total - i,
    };
  }

  private placeNow(el: HTMLElement, slot: any, skew: number) {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true,
    });
  }

  private getConfig() {
    return this.easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };
  }

  private init() {
    const cardsArr = this.cards.toArray().map(ref => ref.nativeElement);
    this.order = Array.from({ length: cardsArr.length }, (_, i) => i);
    const config = this.getConfig();
    cardsArr.forEach((el, i) =>
      this.placeNow(el, this.makeSlot(i, this.cardDistance, this.verticalDistance, cardsArr.length), this.skewAmount)
    );
    const swap = () => {
      if (this.order.length < 2) return;
      const [front, ...rest] = this.order;
      const elFront = cardsArr[front];
      const tl = gsap.timeline();
      this.tl = tl;
      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = cardsArr[idx];
        const slot = this.makeSlot(i, this.cardDistance, this.verticalDistance, cardsArr.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`
        );
      });
      const backSlot = this.makeSlot(cardsArr.length - 1, this.cardDistance, this.verticalDistance, cardsArr.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => {
        gsap.set(elFront, { zIndex: backSlot.zIndex });
      }, undefined, "return");
      tl.set(elFront, { x: backSlot.x, z: backSlot.z }, "return");
      tl.to(
        elFront,
        {
          y: backSlot.y,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return"
      );
      tl.call(() => {
        this.order = [...rest, front];
      });
    };
    swap();
    this.intervalId = setInterval(swap, this.delay);
    if (this.pauseOnHover) {
      const node = this.host.nativeElement.querySelector('.card-swap-container');
      const pause = () => {
        this.tl?.pause();
        clearInterval(this.intervalId);
      };
      const resume = () => {
        this.tl?.play();
        this.intervalId = setInterval(swap, this.delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
    }
  }
} 