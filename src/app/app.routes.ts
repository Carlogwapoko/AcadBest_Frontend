import { Routes } from '@angular/router';
import { authGuard,roleGuard } from './core/guards';


export const routes:Routes=[
  {path:'',loadComponent:()=>import('./features/public/landing/landing.component').then(m=>m.LandingComponent)},
  {path:'login',loadComponent:()=>import('./features/public/login/login.component').then(m=>m.LoginComponent)},
  {path:'enroll',loadComponent:()=>import('./features/public/enroll/enroll.component').then(m=>m.EnrollComponent)},
  {path:'app',canActivate:[authGuard],loadComponent:()=>import('./layout/shell/shell.component').then(m=>m.ShellComponent),
    children:[
    {path:'profile',data:{title:'My Profile'},loadComponent:()=>import('./layout/profile/profile.component').then(m=>m.ProfileComponent)},

    {path:'student',canActivate:[roleGuard('student')],loadChildren:()=>import('./features/student/student.routes').then(m=>m.STUDENT_ROUTES)},

    {path:'faculty',canActivate:[roleGuard('faculty')],loadChildren:()=>import('./features/faculty/faculty.routes').then(m=>m.FACULTY_ROUTES)},

    {path:'registrar',canActivate:[roleGuard('registrar')],loadChildren:()=>import('./features/registrar/registrar.routes').then(m=>m.REGISTRAR_ROUTES)},

    {path:'admin',canActivate:[roleGuard('admin')],loadChildren:()=>import('./features/admin/admin.routes').then(m=>m.ADMIN_ROUTES)}]},

  {path:'**',redirectTo:''}];
