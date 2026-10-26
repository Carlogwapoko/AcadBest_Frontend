import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { EnrollmentComponent } from './enrollment.component';

describe('EnrollmentComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[EnrollmentComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps applicant name values in their separate table columns',()=>{
    TestBed.inject(DataService).enrollments=[{
      ref:'ENR-2026-ABC123',name:'First Middle Last',first_name:null,middle_name:'Middle',last_name:null,
      email:'legacy@example.com',phone:'',dob:'2007-01-01',sex:'Female',addr:'Address',
      prog:'BSIT',yr:1,type:'New Student',student_status:'Applicant',school:'School',
      gname:'Guardian',gph:'',st:'Pending',date:'Oct 23',note:'',acct:false,log:[],
    }];
    const fixture=TestBed.createComponent(EnrollmentComponent);
    fixture.detectChanges();
    const cells=fixture.nativeElement.querySelectorAll(
      '.tw tr:last-child td'
    ) as NodeListOf<HTMLTableCellElement>;

    expect(Array.from(cells).slice(1,4).map(cell=>cell.textContent?.trim()))
      .toEqual(['—','Middle','—']);
    expect(fixture.nativeElement.querySelector('td[colspan="3"]')).toBeNull();
  });
});
