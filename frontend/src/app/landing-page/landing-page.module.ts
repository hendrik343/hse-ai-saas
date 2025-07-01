import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from '../landing-page.component';

const routes: Routes = [
    { path: '', component: LandingPageComponent }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), LandingPageComponent],
})
export class LandingPageModule { }
