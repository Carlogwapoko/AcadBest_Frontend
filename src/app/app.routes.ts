import { Routes } from '@angular/router';
import { authGuard,roleGuard } from './core/guards';


export const routes:Routes=[
  {path:'',loadComponent:()=>import('./features/public/landing/landing.component').then(m=>m.LandingComponent)},
  {path:'features',loadComponent:()=>import('./features/public/landing/features/features-index.component').then(m=>m.FeaturesIndexComponent)},
  {path:'how-it-works',loadComponent:()=>import('./features/public/landing/pages/how-it-works/how-it-works.component').then(m=>m.HowItWorksComponent)},
  {path:'faq',loadComponent:()=>import('./features/public/landing/pages/faq/faq.component').then(m=>m.FaqComponent)},
  {path:'contact',loadComponent:()=>import('./features/public/landing/pages/contact/contact.component').then(m=>m.ContactComponent)},
  {path:'login',loadComponent:()=>import('./features/public/login/login.component').then(m=>m.LoginComponent)},
  {path:'forgot-password',loadComponent:()=>import('./features/public/password-recovery/password-recovery.component').then(m=>m.PasswordRecoveryComponent)},
  {path:'reset-password',loadComponent:()=>import('./features/public/password-recovery/password-recovery.component').then(m=>m.PasswordRecoveryComponent)},
  {path:'enroll',loadComponent:()=>import('./features/public/enroll/enroll.component').then(m=>m.EnrollComponent)},
  {path:'features/grades-schedule',loadComponent:()=>import('./features/public/landing/features/pages/grades-schedule/grades-schedule.component').then(m=>m.GradesScheduleComponent)},
  {path:'features/service-requests',loadComponent:()=>import('./features/public/landing/features/pages/service-requests/service-requests.component').then(m=>m.ServiceRequestsComponent)},
  {path:'features/announcements',loadComponent:()=>import('./features/public/landing/features/pages/announcements/announcements.component').then(m=>m.AnnouncementsComponent)},
  {path:'features/early-warning',loadComponent:()=>import('./features/public/landing/features/pages/early-warning/early-warning.component').then(m=>m.EarlyWarningComponent)},
  {path:'app',canActivate:[authGuard],loadComponent:()=>import('./layout/shell/shell.component').then(m=>m.ShellComponent),
    children:[
    {path:'profile',data:{title:'My Profile'},loadComponent:()=>import('./layout/profile/profile.component').then(m=>m.ProfileComponent)},
    {path:'notifications',data:{title:'Notifications'},loadComponent:()=>import('./shared/components/portal-notifications/portal-notifications.component').then(m=>m.PortalNotificationsComponent)},

    {path:'student',canActivate:[roleGuard('student')],loadChildren:()=>import('./features/student/student.routes').then(m=>m.STUDENT_ROUTES)},

    {path:'faculty',canActivate:[roleGuard('faculty')],loadChildren:()=>import('./features/faculty/faculty.routes').then(m=>m.FACULTY_ROUTES)},

    {path:'registrar',canActivate:[roleGuard('registrar')],loadChildren:()=>import('./features/registrar/registrar.routes').then(m=>m.REGISTRAR_ROUTES)},

    {path:'admin',canActivate:[roleGuard('admin')],loadChildren:()=>import('./features/admin/admin.routes').then(m=>m.ADMIN_ROUTES)}]},

  {path:'**',redirectTo:''}];
