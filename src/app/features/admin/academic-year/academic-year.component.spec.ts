import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AcademicYearComponent } from './academic-year.component';

describe('AcademicYearComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AcademicYearComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Admin',act:true};
  });

  it('renders a separate current academic year setting',()=>{
    const fixture=TestBed.createComponent(AcademicYearComponent);
    fixture.detectChanges();
    const element=fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Current academic school year');
    expect(element.textContent).not.toContain('Academic standing thresholds');
  });
});
