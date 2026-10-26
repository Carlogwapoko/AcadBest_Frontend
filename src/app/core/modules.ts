import { Role } from './data.service';
export interface Mod{role:Role;key:string;label:string;locked?:boolean}
/** Modules that Access Control can switch on/off per role. Locked modules are always available. */
export const MODS:Mod[]=[
  {role:'student',key:'dash',label:'Dashboard',locked:true},{role:'student',
    key:'gs',label:'Grades & Schedule'},{role:'student',key:'sr',label:'Service Requests'},
    {role:'student',key:'ann',label:'Announcements'},{role:'student',key:'nt',label:'Notifications'},
  {role:'faculty',key:'dash',label:'Dashboard',locked:true},{role:'faculty',
    key:'subj',label:'Subjects'},{role:'faculty',key:'ge',label:'Grade Entry'},{role:'faculty',
    key:'risk',label:'At-Risk Advisees'},
  {role:'registrar',key:'rq',label:'Request Queue',locked:true},{role:'registrar',
    key:'en',label:'Enrollment Applications'},{role:'registrar',key:'su',label:'Subjects & Units'},
    {role:'registrar',key:'pa',label:'Post Announcement'},
  {role:'admin',key:'ur',label:'Users & Roles',locked:true},{role:'admin',key:'sr2',
    label:'Standing Rules'},{role:'admin',key:'ay',label:'Current Academic School Year'},
    {role:'admin',key:'ac',label:'Access Control',locked:true}];
/** What records each role may see (enforced by the data queries; a real backend must enforce this server-side). */
export const SCOPE:Record<Role,string>={student:'Own grades, schedule and requests only',
  faculty:'Assigned subjects and their students only',registrar:'All requests, applications and subjects',
  admin:'User accounts and system rules'};
