import { Routes } from '@angular/router';
import { moduleGuard } from '../../core/guards';

/** Student pages – each page is lazy-loaded from its own folder. */
export const STUDENT_ROUTES:Routes=[
  {path:'dashboard',data:{title:'Dashboard'},canActivate:[moduleGuard('student',
    'dash')],loadComponent:()=>import('./dashboard/dashboard.component').then(m=>m.StudentDashboardComponent)},
  {path:'grades',data:{title:'Grades & Schedule'},canActivate:[moduleGuard('student',
    'gs')],loadComponent:()=>import('./grades/grades.component').then(m=>m.StudentGradesComponent)},
  {path:'requests',data:{title:'Service Requests'},canActivate:[moduleGuard('student',
    'sr')],loadComponent:()=>import('./requests/requests.component').then(m=>m.StudentRequestsComponent)},
  {path:'announcements',data:{title:'Announcements'},canActivate:[moduleGuard('student',
    'ann')],loadComponent:()=>import('./announcements/announcements.component').then(m=>m.StudentAnnouncementsComponent)},
  {path:'notifications',data:{title:'Notifications'},canActivate:[moduleGuard('student',
    'nt')],loadComponent:()=>import('./notifications/notifications.component').then(m=>m.StudentNotificationsComponent)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}
];
