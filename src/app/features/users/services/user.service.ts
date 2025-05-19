import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

    constructor(private http: HttpClient) { }

    // Получить всех пользователей
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    // Получить одного пользователя
    getUserById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    // Создать нового пользователя
    createUser(user: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, user);
    }

    // Обновить пользователя
    updateUser(id: number, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, user);
    }

    // Удалить пользователя
    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
