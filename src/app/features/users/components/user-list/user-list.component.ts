import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzMessageModule,
    NzSelectModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  displayedUsers: any[] = [];

  isLoading = true;
  searchTerm = '';
  selectedEmailDomain = '';
  emailDomains: string[] = [];

  pageSize = 5;
  pageIndex = 1;

  constructor(
    private userService: UserService,
    private modal: NzModalService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.emailDomains = Array.from(
        new Set(this.users.map(u => u.email.split('@')[1]))
      ).sort();

      this.filteredUsers = [...this.users];
      this.updateDisplayedUsers();
      this.isLoading = false;
    });
  }

  updateDisplayedUsers(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedUsers = this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const domain = email.split('@')[1] || '';

      const matchSearch = name.includes(term) || email.includes(term);
      const matchDomain = this.selectedEmailDomain
        ? domain === this.selectedEmailDomain
        : true;

      return matchSearch && matchDomain;
    });

    this.pageIndex = 1;
    this.updateDisplayedUsers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedEmailDomain = '';
    this.applyFilters();
  }

  onNextPage(): void {
    this.pageIndex = this.pageIndex >= this.totalPages ? 1 : this.pageIndex + 1;
    this.updateDisplayedUsers();
  }

  onPreviousPage(): void {
    this.pageIndex = this.pageIndex <= 1 ? this.totalPages : this.pageIndex - 1;
    this.updateDisplayedUsers();
  }

  confirmDelete(userId: number): void {
    this.modal.confirm({
      nzTitle: 'Вы уверены, что хотите удалить этого пользователя?',
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== userId);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== userId);
            if ((this.pageIndex - 1) * this.pageSize >= this.filteredUsers.length && this.pageIndex > 1) {
              this.pageIndex--;
            }
            this.updateDisplayedUsers();
            this.message.success('Пользователь удалён');
          },
          error: () => {
            this.message.error('Ошибка при удалении пользователя');
          }
        });
      }
    });
  }
}
