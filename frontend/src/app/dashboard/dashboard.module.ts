import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { UploadAnalyzeComponent } from './upload-analyze/upload-analyze.component';

@NgModule({
    declarations: [
        UploadAnalyzeComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule
    ]
})
export class DashboardModule { }
