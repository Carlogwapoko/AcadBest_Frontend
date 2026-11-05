import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HowItWorksComponent } from './how-it-works.component';

describe('HowItWorksComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[HowItWorksComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates',()=>{
    const fixture=TestBed.createComponent(HowItWorksComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
