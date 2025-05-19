import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    const apiUrl = 'https://jsonplaceholder.typicode.com/users';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('должен создаться сервис', () => {
        expect(service).toBeTruthy();
    });

    it('getUsers: GET всех пользователей', () => {
        const mockUsers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

        service.getUsers().subscribe(users => {
            expect(users).toEqual(mockUsers);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
    });

    it('getUserById: GET одного пользователя по ID', () => {
        const mockUser = { id: 42, name: 'Charlie' };

        service.getUserById(42).subscribe(user => {
            expect(user).toEqual(mockUser);
        });

        const req = httpMock.expectOne(`${apiUrl}/42`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
    });

    it('createUser: POST создание нового пользователя', () => {
        const newUser = { name: 'Dave' };
        const mockResponse = { id: 99, ...newUser };

        service.createUser(newUser).subscribe(resp => {
            expect(resp).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newUser);
        req.flush(mockResponse);
    });

    it('updateUser: PUT обновление пользователя', () => {
        const update = { name: 'Eve' };
        const mockResponse = { id: 5, ...update };

        service.updateUser(5, update).subscribe(resp => {
            expect(resp).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${apiUrl}/5`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(update);
        req.flush(mockResponse);
    });

    it('deleteUser: DELETE удаление пользователя', () => {
        service.deleteUser(7).subscribe(resp => {
            expect(resp).toBeNull(); 
        });

        const req = httpMock.expectOne(`${apiUrl}/7`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
