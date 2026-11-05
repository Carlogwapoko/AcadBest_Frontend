import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FeaturesIndexComponent } from './features-index.component';

describe('FeaturesIndexComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[FeaturesIndexComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates and links to feature pages',()=>{
    const fixture=TestBed.createComponent(FeaturesIndexComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.feature-card')).toHaveLength(4);
  });
});
