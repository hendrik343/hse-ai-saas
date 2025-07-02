import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CameraCaptureComponent } from './camera-capture/camera-capture.component';

@NgModule({
    declarations: [AppComponent, CameraCaptureComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        LucideAngularModule.pick([
            'History', 'Calendar', 'User', 'FileDown'
        ])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
