import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GradesScheduleComponent } from './grades-schedule.component';

describe('GradesScheduleComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[GradesScheduleComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates',()=>{
    const fixture=TestBed.createComponent(GradesScheduleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
