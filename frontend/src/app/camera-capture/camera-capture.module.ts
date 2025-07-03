import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CameraCaptureComponent } from './camera-capture.component';

@NgModule({
    declarations: [CameraCaptureComponent],
    imports: [CommonModule],
    exports: [CameraCaptureComponent] // ← permite usar noutros módulos
})
export class CameraCaptureModule { }
package.json
src/
tsconfig.spec.json