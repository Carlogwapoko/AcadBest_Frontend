import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ReqDetailComponent } from './req-detail.component';

describe('ReqDetailComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ReqDetailComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(ReqDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('notifies the parent when the request dialog closes',()=>{
    const fixture=TestBed.createComponent(ReqDetailComponent);
    fixture.componentInstance.r={
      id:'REQ-1',sid:1,by:'Student',type:'Transcript',purpose:'Scholarship',
      copies:1,need:'2026-10-21',rem:'',st:'Pending',log:[],
    };
    const closed=vi.spyOn(fixture.componentInstance.closed,'emit');

    fixture.componentInstance.close();

    expect(fixture.componentInstance.r).toBeNull();
    expect(closed).toHaveBeenCalledOnce();
  });
});
