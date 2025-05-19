import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { UserFormComponent } from './user-form.component';
import { UserService } from '../../services/user.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

describe('UserFormComponent', () => {
    const dummyUser = {
        id: 42,
        name: 'Alice',
        username: 'alice42',
        email: 'alice@example.com',
        phone: '555-1234',
        website: 'alice.com',
        company: { name: 'Wonderland Inc.' },
        address: {
            street: 'Rabbit Hole',
            suite: 'Apt. 1',
            city: 'Fantasia',
            zipcode: '00000'
        }
    };

    let fixture: ComponentFixture<UserFormComponent>;
    let component: UserFormComponent;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let router: Router;
    let messageService: NzMessageService;

    function createModule(routeId: string | null) {
        userServiceSpy = jasmine.createSpyObj('UserService', [
            'getUserById',
            'createUser',
            'updateUser'
        ]);
        TestBed.resetTestingModule();
        return TestBed.configureTestingModule({
            imports: [
                UserFormComponent,
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                NzFormModule,
                NzInputModule,
                NzButtonModule,
                NzCardModule,
                NzDividerModule,
                NzGridModule,
                NzMessageModule,
                NzIconModule
            ],
            providers: [
                { provide: UserService, useValue: userServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: { get: (_key: string) => routeId }
                        }
                    }
                }
            ]
        }).compileComponents();
    }

    describe('create mode', () => {
        beforeEach(waitForAsync(() => {
            createModule(null).then(() => {
                fixture = TestBed.createComponent(UserFormComponent);
                component = fixture.componentInstance;
                router = TestBed.inject(Router);
                messageService = TestBed.inject(NzMessageService);
                fixture.detectChanges(); // ngOnInit
            });
        }));

        it('should initialize in create mode with invalid form', () => {
            expect(component.isEdit).toBeFalse();
            expect(component.form.invalid).toBeTrue();
        });

        it('should create a user and navigate on success', fakeAsync(() => {
            userServiceSpy.createUser.and.returnValue(of(dummyUser));
            spyOn(messageService, 'success');
            spyOn(router, 'navigateByUrl');

            component.form.setValue({
                name: dummyUser.name,
                username: dummyUser.username,
                email: dummyUser.email,
                phone: dummyUser.phone,
                website: dummyUser.website,
                companyName: dummyUser.company.name,
                addressStreet: dummyUser.address.street,
                addressSuite: dummyUser.address.suite,
                addressCity: dummyUser.address.city,
                addressZipcode: dummyUser.address.zipcode
            });

            component.submitForm();
            tick();

            expect(userServiceSpy.createUser).toHaveBeenCalledWith({
                name: dummyUser.name,
                username: dummyUser.username,
                email: dummyUser.email,
                phone: dummyUser.phone,
                website: dummyUser.website,
                company: { name: dummyUser.company.name },
                address: {
                    street: dummyUser.address.street,
                    suite: dummyUser.address.suite,
                    city: dummyUser.address.city,
                    zipcode: dummyUser.address.zipcode
                }
            });
            expect(messageService.success).toHaveBeenCalledWith('Успешно сохранено');
            expect(router.navigateByUrl).toHaveBeenCalledWith('/');
        }));

        it('should show error message when create fails', fakeAsync(() => {
            userServiceSpy.createUser.and.returnValue(throwError(() => new Error('fail')));
            spyOn(messageService, 'error');

            component.form.patchValue({
                name: dummyUser.name,
                username: dummyUser.username,
                email: dummyUser.email,
                phone: dummyUser.phone,
                website: dummyUser.website,
                companyName: dummyUser.company.name,
                addressStreet: dummyUser.address.street,
                addressSuite: dummyUser.address.suite,
                addressCity: dummyUser.address.city,
                addressZipcode: dummyUser.address.zipcode
            });

            component.submitForm();
            tick();

            expect(messageService.error).toHaveBeenCalledWith('Ошибка при сохранении');
        }));
    });

    describe('edit mode', () => {
        beforeEach(waitForAsync(() => {
            createModule('42').then(() => {
                userServiceSpy.getUserById.and.returnValue(of(dummyUser));
                fixture = TestBed.createComponent(UserFormComponent);
                component = fixture.componentInstance;
                router = TestBed.inject(Router);
                messageService = TestBed.inject(NzMessageService);
                fixture.detectChanges(); // ngOnInit
            });
        }));

        it('should load user data and patch form', fakeAsync(() => {
            tick();
            expect(component.isEdit).toBeTrue();
            expect(component.userId).toBe(42);
            expect(component.form.value.name).toBe(dummyUser.name);
        }));

        it('should update user and navigate on success', fakeAsync(() => {
            userServiceSpy.getUserById.and.returnValue(of(dummyUser));
            userServiceSpy.updateUser.and.returnValue(of(dummyUser));
            spyOn(messageService, 'success');
            spyOn(router, 'navigateByUrl');

            fixture.detectChanges(); 
            tick();

            component.form.patchValue({
                name: 'Bob',
                username: dummyUser.username,
                email: dummyUser.email,
                phone: dummyUser.phone,
                website: dummyUser.website,
                companyName: dummyUser.company.name,
                addressStreet: dummyUser.address.street,
                addressSuite: dummyUser.address.suite,
                addressCity: dummyUser.address.city,
                addressZipcode: dummyUser.address.zipcode
            });

            component.submitForm();
            tick();

            expect(userServiceSpy.updateUser).toHaveBeenCalledWith(42, jasmine.any(Object));
            expect(messageService.success).toHaveBeenCalledWith('Успешно сохранено');
            expect(router.navigateByUrl).toHaveBeenCalledWith('/');
        }));

        it('should show error message when update fails', fakeAsync(() => {
            userServiceSpy.getUserById.and.returnValue(of(dummyUser));
            userServiceSpy.updateUser.and.returnValue(throwError(() => new Error()));
            spyOn(messageService, 'error');

            fixture.detectChanges(); 
            tick();

            component.form.patchValue({ name: dummyUser.name });
            component.submitForm();
            tick();

            expect(messageService.error).toHaveBeenCalledWith('Ошибка при сохранении');
        }));
    });
});
