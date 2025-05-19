import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeaderComponent } from './header.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

describe('HeaderComponent', () => {
    let fixture: ComponentFixture<HeaderComponent>;
    let component: HeaderComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HeaderComponent,        
                RouterTestingModule,    
                NzLayoutModule,
                NzButtonModule,
                NzIconModule,           
                HttpClientTestingModule 
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('должен создаться', () => {
        expect(component).toBeTruthy();
    });

    it('содержит область логотипа с routerLink="/" и текстом "UserCRM"', () => {
        const el: HTMLElement = fixture.nativeElement;
        const logo = el.querySelector('a.logo-area');
        expect(logo).toBeTruthy();
        expect(logo!.getAttribute('routerLink')).toBe('/');
        const title = logo!.querySelector('.site-title')!;
        expect(title.textContent).toContain('UserCRM');
    });

    it('кнопка "Новый пользователь" имеет routerLink="/create" и правильный текст', () => {
        const el: HTMLElement = fixture.nativeElement;
        const btn = el.querySelector('button.add-user-btn')!;
        expect(btn).toBeTruthy();
        expect(btn.getAttribute('routerLink')).toBe('/create');
        expect(btn.textContent!.trim()).toContain('Новый пользователь');
    });
});
