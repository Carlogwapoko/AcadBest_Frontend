import { Role } from './data.service';
export interface NavItem{path:string;label:string;icon:string;key:string}
export const HOME:Record<Role,string>={student:'/app/student/dashboard',faculty:'/app/faculty/dashboard',
  registrar:'/app/registrar/requests',admin:'/app/admin/users'};
/** Role-based sidebar navigation. `key` is the module id used by Access Control (profile opens from the avatar; log out is in the shell). */
export const NAV:Record<Role,NavItem[]>={
  student:[{path:'student/dashboard',label:'Dashboard',icon:'grid',key:'dash'},
    {path:'student/grades',label:'Grades & Schedule',icon:'book',key:'gs'},{path:'student/requests',
    label:'Service Requests',icon:'mail',key:'sr'},{path:'student/announcements',
    label:'Announcements',icon:'mega',key:'ann'},{path:'student/notifications',label:'Notifications',icon:'bell',key:'nt'}],
  faculty:[{path:'faculty/dashboard',label:'Dashboard',icon:'grid',key:'dash'},
    {path:'faculty/subjects',label:'Subjects',icon:'book',key:'subj'},{path:'faculty/grade-entry',
    label:'Grade Entry',icon:'edit',key:'ge'},{path:'faculty/at-risk',label:'At-Risk Advisees',icon:'alert',key:'risk'}],
  registrar:[{path:'registrar/requests',label:'Request Queue',icon:'list',key:'rq'},
    {path:'registrar/enrollment',label:'Enrollment Applications',icon:'clip',key:'en'},
    {path:'registrar/subjects',label:'Subjects & Units',icon:'book',key:'su'},{path:'registrar/announcements',
    label:'Post Announcement',icon:'mega',key:'pa'}],
  admin:[{path:'admin/users',label:'Users & Roles',icon:'users',key:'ur'},{path:'admin/rules',
    label:'Standing Rules',icon:'sliders',key:'sr2'},{path:'admin/access',label:'Access Control',icon:'shield',key:'ac'}]};
