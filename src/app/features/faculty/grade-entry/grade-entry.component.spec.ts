import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { GradeEntryComponent } from './grade-entry.component';

describe('GradeEntryComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[GradeEntryComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Faculty',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(GradeEntryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
