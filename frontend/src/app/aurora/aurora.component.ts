import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuroraService } from '../services/aurora.service';

@Component({
    selector: 'app-aurora',
    standalone: true,
    template: `<div #auroraCanvas class="aurora-canvas"></div>`,
    styleUrls: ['./aurora.component.scss']
})
export class AuroraComponent implements OnInit, OnDestroy {
    @ViewChild('auroraCanvas', { static: true }) auroraCanvas!: ElementRef<HTMLElement>;
    @Input() colorStops: string[] = ['#3A29FF', '#FF94B4', '#FF3232'];
    @Input() amplitude: number = 1.0;
    @Input() blend: number = 0.5;
    @Input() speed: number = 0.5;

    constructor(private auroraService: AuroraService) { }

    private auroraCleanup: (() => void) | null = null;

    ngOnInit() {
        this.auroraCleanup = this.auroraService.createAurora(this.auroraCanvas, {
            colorStops: this.colorStops,
            amplitude: this.amplitude,
            blend: this.blend,
            speed: this.speed
        });
    }

    ngOnDestroy() {
        if (this.auroraCleanup) this.auroraCleanup();
        this.auroraService.destroy();
    }
}
