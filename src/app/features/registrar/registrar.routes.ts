import { Routes } from '@angular/router';
import { moduleGuard } from '../../core/guards';

/** Registrar pages – each page is lazy-loaded from its own folder. */
export const REGISTRAR_ROUTES:Routes=[
  {path:'requests',data:{title:'Request Queue'},canActivate:[moduleGuard('registrar',
    'rq')],loadComponent:()=>import('./request-queue/request-queue.component').then(m=>m.RequestQueueComponent)},
  {path:'enrollment',data:{title:'Enrollment Applications'},canActivate:[moduleGuard('registrar',
    'en')],loadComponent:()=>import('./enrollment/enrollment.component').then(m=>m.EnrollmentComponent)},
  {path:'subjects',data:{title:'Subjects & Units'},canActivate:[moduleGuard('registrar',
    'su')],loadComponent:()=>import('./subjects-units/subjects-units.component').then(m=>m.SubjectsUnitsComponent)},
  {path:'announcements',data:{title:'Post Announcement'},canActivate:[moduleGuard('registrar',
    'pa')],loadComponent:()=>import('./post-announcement/post-announcement.component').then(m=>m.PostAnnouncementComponent)},
    
  {path:'',pathMatch:'full',redirectTo:'requests'}
];
