import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { SubjectsUnitsComponent } from './subjects-units.component';

describe('SubjectsUnitsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[SubjectsUnitsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Registrar Staff',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('uses separate time fields and leaves faculty assignment out of subject forms',()=>{
    const fixture=TestBed.createComponent(SubjectsUnitsComponent);
    fixture.componentInstance.openSub();
    fixture.detectChanges();
    const text=(fixture.nativeElement as HTMLElement).textContent||'';
    expect(text).toContain('Start Time');
    expect(text).toContain('End Time');
    expect(text).not.toContain('Instructor');
  });
});
