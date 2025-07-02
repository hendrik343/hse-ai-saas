import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
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
