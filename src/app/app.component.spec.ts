// src/app/app.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppComponent,           
                RouterTestingModule,    
                NzLayoutModule,
                NzButtonModule,
                NzIconModule,
                HttpClientTestingModule  
            ],
            schemas: [NO_ERRORS_SCHEMA] 
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('должен создаться', () => {
        expect(component).toBeTruthy();
    });

    it('должен рендерить <app-header>', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('app-header')).toBeTruthy();
    });

    it('должен рендерить <router-outlet> внутри .main-content', () => {
        const el = fixture.nativeElement as HTMLElement;
        const main = el.querySelector('.main-content');
        expect(main).toBeTruthy();
        expect(main!.querySelector('router-outlet')).toBeTruthy();
    });
});
