import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactComponent } from './contact.component';

describe('ContactComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ContactComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates and shows the contact channels',()=>{
    const fixture=TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.contact-card')).toHaveLength(4);
  });
});
