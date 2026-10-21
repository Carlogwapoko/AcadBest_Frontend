import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMMON } from '../../../shared/common';
import { NAV } from '../../../core/nav';

@Component({selector:'app-landing',standalone:true,imports:[COMMON,RouterLink],
  styleUrl:'./landing.component.css',templateUrl:'./landing.component.html'})
export class LandingComponent{
  feat:any=null;legal='';
  features=[
    {t:'Grades & Schedule',i:'book',s:'View weighted grades, class schedules, and enrollment any time.',
      m:'Students see only their own records. Instructors record component scores separately for each selected term.'},
    {t:'Service Requests',i:'mail',s:'Request certificates, transcripts, and clearance online and track every status.',
      m:'Submit once, then follow each step of the approval trail without queuing at the registrar.'},
    {t:'Targeted Announcements',i:'mega',s:'Notices reach the right program, year level, and section.',
      m:'Registrar staff choose the audience; students see matching notices in their account.'},
    {t:'Academic Early Warning',i:'alert',s:'Rule-based standing alerts help faculty support at-risk advisees early.',
      m:'Administrators configure grade thresholds; faculty see who needs help.'}];
  roles=[{k:'student',n:'Student'},{k:'faculty',n:'Faculty'},{k:'registrar',
    n:'Registrar Staff'},{k:'admin',n:'Admin'}].map(r=>({...r,items:NAV[r.k as 'student'].map(n=>n.label).join(', ')}));
  faq=[['Who creates my portal account?','Only the system administrator creates and issues accounts for students, faculty, staff, and administrators.'],
    ['How do I enroll?','Use Enroll Now to submit the application. The registrar will review your information and follow up about your application.'],
    ['How are my grades computed?','Each instructor records component scores for the selected term. Your standing is based on thresholds set by the school.'],
    ['Can I request documents online?','Yes. Enrolled students can request certificates, transcripts, and clearance from the portal and track each status.']];
  sc(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
}
