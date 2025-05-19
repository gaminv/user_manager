import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/components/user-list/user-list.component';
import { UserFormComponent } from './features/users/components/user-form/user-form.component';
import { UserDetailComponent } from './features/users/components/user-detail/user-detail.component';

export const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'create', component: UserFormComponent },
    { path: 'edit/:id', component: UserFormComponent },
    { path: 'user/:id', component: UserDetailComponent }
];
