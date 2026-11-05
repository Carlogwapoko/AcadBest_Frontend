import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FaqComponent } from './faq.component';

describe('FaqComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[FaqComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates and lists questions',()=>{
    const fixture=TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('details')).toHaveLength(4);
  });
});
