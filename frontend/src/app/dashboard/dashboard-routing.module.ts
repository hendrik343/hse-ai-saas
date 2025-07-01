import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadAnalyzeComponent } from './upload-analyze/upload-analyze.component';

const routes: Routes = [
    { path: '', redirectTo: 'upload-analyze', pathMatch: 'full' },
    { path: 'upload-analyze', component: UploadAnalyzeComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
