import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeesComponent } from './features/employees/employees.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
      {
        path: 'auth/login',
        component: LoginComponent,
      },
      {
        path: 'auth/register',
        component: RegisterComponent,
      },
      {
        path: '',
        canActivate: [authGuard],
        component: MainLayoutComponent,

        children:[
            {path: 'dashboard',component: DashboardComponent,},
            {path: 'employees', component: EmployeesComponent,},
            {path: 'schedule', component: ScheduleComponent,}
        ]
      },

];
