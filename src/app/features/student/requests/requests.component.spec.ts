import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { UiService } from '../../../core/ui.service';
import { StudentRequestsComponent } from './requests.component';

describe('StudentRequestsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[StudentRequestsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(StudentRequestsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('requires and submits a custom description for Others',async()=>{
    const data=TestBed.inject(DataService);
    data.today='2026-10-10';
    vi.spyOn(data,'loadRequests').mockResolvedValue({
      data:[],current_page:1,last_page:1,per_page:25,total:0,
    });
    const saveRequest=vi.spyOn(data,'saveRequest').mockResolvedValue('REQ-OTHER');
    vi.spyOn(TestBed.inject(UiService),'confirm').mockResolvedValue(true);
    const fixture=TestBed.createComponent(StudentRequestsComponent);
    fixture.detectChanges();
    const component=fixture.componentInstance;
    component.f.type='Others';
    component.f.otherType='';
    component.f.purpose='Scholarship application';
    component.f.copies=1;
    component.f.need='2026-10-12';
    component.f.rem='';
    await component.submit();
    expect(component.e.otherType).toContain('at least 3 characters');
    expect(saveRequest).not.toHaveBeenCalled();

    component.f.otherType='Enrollment verification letter';
    await component.submit();
    expect(saveRequest).toHaveBeenCalledWith({
      type:'Others',other_type:'Enrollment verification letter',
      purpose:'Scholarship application',copies:1,date_needed:'2026-10-12',remarks:'',
    });
  });
});
