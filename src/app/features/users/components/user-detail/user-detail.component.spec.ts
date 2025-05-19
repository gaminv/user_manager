import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { UserDetailComponent } from './user-detail.component';
import { UserService } from '../../services/user.service';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

describe('UserDetailComponent', () => {
    let component: UserDetailComponent;
    let fixture: ComponentFixture<UserDetailComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;

    const dummyUser = {
        id: 1,
        name: 'John Doe',
        username: 'johnd',
        email: 'john@example.com',
        phone: '123-456-7890',
        website: 'example.com',
        company: { name: 'Acme Inc.' },
        address: {
            street: 'Main St',
            suite: 'Apt. 1',
            city: 'Metropolis',
            zipcode: '12345'
        }
    };

    beforeEach(waitForAsync(() => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById']);

        TestBed.configureTestingModule({
            imports: [
                UserDetailComponent,
                RouterTestingModule,
                NzSpinModule,
                NzCardModule,
                NzDescriptionsModule
            ],
            providers: [
                { provide: UserService, useValue: userServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: { get: (_key: string) => '1' } }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        userServiceSpy.getUserById.and.returnValue(of(dummyUser));
        fixture.detectChanges(); 
        expect(component).toBeTruthy();
    });

    it('should load user and stop spinner on success', () => {
        userServiceSpy.getUserById.and.returnValue(of(dummyUser));
        fixture.detectChanges();

        expect(userServiceSpy.getUserById).toHaveBeenCalledWith(1);
        expect(component.user).toEqual(dummyUser);
        expect(component.isLoading).toBeFalse();

        fixture.detectChanges();
        const spinEl = fixture.nativeElement.querySelector('nz-spin');
        expect(spinEl.getAttribute('ng-reflect-nz-spinning')).toBe('false');

        const titleEl = fixture.nativeElement.querySelector('.ant-card-head-title');
        expect(titleEl.textContent.trim()).toBe(dummyUser.name);
    });

    it('should hide spinner and not render card on error', () => {
        userServiceSpy.getUserById.and.returnValue(throwError(() => new Error('fail')));
        fixture.detectChanges(); 

        expect(component.user).toBeUndefined();
        expect(component.isLoading).toBeFalse();

        fixture.detectChanges();
        const cardEl = fixture.nativeElement.querySelector('nz-card');
        expect(cardEl).toBeNull();
    });

    it('should render all description items correctly', () => {
        userServiceSpy.getUserById.and.returnValue(of(dummyUser));
        fixture.detectChanges(); 
        fixture.detectChanges();

        const labelEls = fixture.nativeElement.querySelectorAll('.ant-descriptions-item-label') as NodeListOf<HTMLElement>;
        const contentEls = fixture.nativeElement.querySelectorAll('.ant-descriptions-item-content') as NodeListOf<HTMLElement>;

        const labels = Array.from(labelEls).map(el => el.textContent!.trim());
        const contents = Array.from(contentEls).map(el =>
            el.textContent!.trim().replace(/\s+/g, ' ')
        );

        const expected: Record<string, string> = {
            Username: dummyUser.username,
            Email: dummyUser.email,
            Телефон: dummyUser.phone,
            Сайт: dummyUser.website,
            Компания: dummyUser.company.name,
            Адрес: `${dummyUser.address.street}, ${dummyUser.address.suite}, ${dummyUser.address.city} ${dummyUser.address.zipcode}`
        };

        labels.forEach((label, idx) => {
            expect(contents[idx]).toBe(expected[label]);
        });
    });
});
