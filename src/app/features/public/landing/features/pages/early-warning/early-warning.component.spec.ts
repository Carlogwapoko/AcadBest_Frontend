import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EarlyWarningComponent } from './early-warning.component';

describe('EarlyWarningComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[EarlyWarningComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates',()=>{
    const fixture=TestBed.createComponent(EarlyWarningComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
