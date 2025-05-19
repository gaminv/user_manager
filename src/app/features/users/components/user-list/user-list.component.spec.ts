import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../services/user.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

describe('UserListComponent', () => {
    let fixture: ComponentFixture<UserListComponent>;
    let component: UserListComponent;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let modalServiceSpy: jasmine.SpyObj<NzModalService>;
    let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

    const mockUsers = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `User${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `000-${i + 1}`,
        address: { city: `City${i + 1}` }
    }));

    beforeEach(async () => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);
        userServiceSpy.getUsers.and.returnValue(of(mockUsers));
        userServiceSpy.deleteUser.and.returnValue(of(null));

        messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
        modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
        modalServiceSpy.confirm.and.callFake((opts?: any) => {
            if (opts && typeof opts.nzOnOk === 'function') {
                opts.nzOnOk();
            }
            return {} as any; 
        });

        await TestBed.configureTestingModule({
            imports: [
                UserListComponent,        
                RouterTestingModule,
                NoopAnimationsModule,
                HttpClientTestingModule
            ],
            schemas: [NO_ERRORS_SCHEMA]  
        })
            .overrideComponent(UserListComponent, {
                add: {
                    providers: [
                        { provide: UserService, useValue: userServiceSpy },
                        { provide: NzModalService, useValue: modalServiceSpy },
                        { provide: NzMessageService, useValue: messageServiceSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(UserListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); 
    });

    it('должен создаться и загрузить начальные данные', () => {
        expect(component).toBeTruthy();
        expect(component.isLoading).toBeFalse();
        expect(component.filteredUsers.length).toBe(mockUsers.length);
        expect(component.displayedUsers.length).toBe(component.pageSize);
        expect(component.totalPages).toBe(Math.ceil(mockUsers.length / component.pageSize));
    });

    it('фильтрация по тексту поиска сбрасывает pageIndex в 1', () => {
        component.pageIndex = 3;
        component.searchTerm = 'User1';
        component.onSearch();
        expect(component.pageIndex).toBe(1);
        expect(component.filteredUsers.every(u =>
            u.name.includes('User1') || u.email.includes('User1')
        )).toBeTrue();
    });

    it('фильтрация по домену email сбрасывает pageIndex в 1', () => {
        component.pageIndex = 2;
        const domain = mockUsers[0].email.split('@')[1];
        component.selectedEmailDomain = domain;
        component.applyFilters();
        expect(component.pageIndex).toBe(1);
        expect(component.filteredUsers.every(u =>
            u.email.endsWith(domain)
        )).toBeTrue();
    });

    it('сброс фильтров возвращает все данные', () => {
        component.searchTerm = 'abc';
        component.selectedEmailDomain = 'example.com';
        component.resetFilters();
        expect(component.searchTerm).toBe('');
        expect(component.selectedEmailDomain).toBe('');
        expect(component.filteredUsers.length).toBe(mockUsers.length);
    });

    it('пагинация next/previous работает корректно', () => {
        const total = component.totalPages;
        component.pageIndex = 1;
        component.onNextPage();
        expect(component.pageIndex).toBe(2);

        component.pageIndex = total;
        component.onNextPage();
        expect(component.pageIndex).toBe(1);

        component.pageIndex = 1;
        component.onPreviousPage();
        expect(component.pageIndex).toBe(total);
    });

    it('удаление пользователя через confirmDelete — успешный сценарий', fakeAsync(() => {
        const idToDelete = mockUsers[0].id;
        component.confirmDelete(idToDelete);
        tick();

        expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(idToDelete);
        expect(component.filteredUsers.find(u => u.id === idToDelete)).toBeUndefined();
        expect(messageServiceSpy.success).toHaveBeenCalledWith('Пользователь удалён');
        flush();
    }));

    it('уведомление об ошибке при неудачном удалении', fakeAsync(() => {
        userServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('fail')));
        component.confirmDelete(mockUsers[1].id);
        tick();

        expect(messageServiceSpy.error).toHaveBeenCalledWith('Ошибка при удалении пользователя');
        flush();
    }));
});
