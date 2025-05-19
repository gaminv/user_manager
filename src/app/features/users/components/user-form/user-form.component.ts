import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzGridModule,
    NzMessageModule,
    NzIconModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  form!: FormGroup;
  isEdit = false;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      website: [''],
      companyName: [''],
      addressStreet: [''],
      addressSuite: [''],
      addressCity: [''],
      addressZipcode: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = +id;
      this.userService.getUserById(this.userId).subscribe({
        next: user => {
          this.form.patchValue({
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            website: user.website,
            companyName: user.company?.name,
            addressStreet: user.address?.street,
            addressSuite: user.address?.suite,
            addressCity: user.address?.city,
            addressZipcode: user.address?.zipcode
          });
        },
        error: () => {
          this.message.error('Ошибка загрузки пользователя');
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/');
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    const user = {
      name: value.name,
      username: value.username,
      email: value.email,
      phone: value.phone,
      website: value.website,
      company: { name: value.companyName },
      address: {
        street: value.addressStreet,
        suite: value.addressSuite,
        city: value.addressCity,
        zipcode: value.addressZipcode
      }
    };
    const request = this.isEdit
      ? this.userService.updateUser(this.userId, user)
      : this.userService.createUser(user);
    request.subscribe({
      next: () => {
        this.message.success('Успешно сохранено');
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.message.error('Ошибка при сохранении');
      }
    });
  }
}
