import { Routes } from '@angular/router';
import { moduleGuard } from '../../core/guards';

/** Faculty pages – each page is lazy-loaded from its own folder. */
export const FACULTY_ROUTES:Routes=[
  {path:'dashboard',data:{title:'Dashboard'},canActivate:[moduleGuard('faculty',
    'dash')],loadComponent:()=>import('./dashboard/dashboard.component').then(m=>m.FacultyDashboardComponent)},
  {path:'subjects',data:{title:'Subjects'},canActivate:[moduleGuard('faculty',
    'subj')],loadComponent:()=>import('./subjects/subjects.component').then(m=>m.FacultySubjectsComponent)},
  {path:'grade-entry',data:{title:'Grade Entry'},canActivate:[moduleGuard('faculty',
    'ge')],loadComponent:()=>import('./grade-entry/grade-entry.component').then(m=>m.GradeEntryComponent)},
  {path:'at-risk',data:{title:'At-Risk Advisees'},canActivate:[moduleGuard('faculty',
    'risk')],loadComponent:()=>import('./at-risk/at-risk.component').then(m=>m.AtRiskComponent)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}
];
