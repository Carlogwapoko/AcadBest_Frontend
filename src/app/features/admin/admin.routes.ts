import { Routes } from '@angular/router';
import { moduleGuard } from '../../core/guards';

/** Admin pages – each page is lazy-loaded from its own folder. */
export const ADMIN_ROUTES:Routes=[
  {path:'users',data:{title:'Users & Roles'},canActivate:[moduleGuard('admin',
    'ur')],loadComponent:()=>import('./users-roles/users-roles.component').then(m=>m.UsersRolesComponent)},
  {path:'rules',data:{title:'Standing Rules'},canActivate:[moduleGuard('admin',
    'sr2')],loadComponent:()=>import('./standing-rules/standing-rules.component').then(m=>m.StandingRulesComponent)},
  {path:'access',data:{title:'Access Control'},canActivate:[moduleGuard('admin',
    'ac')],loadComponent:()=>import('./access-control/access-control.component').then(m=>m.AccessControlComponent)},
  {path:'',pathMatch:'full',redirectTo:'users'}
];
