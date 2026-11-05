import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceRequestsComponent } from './service-requests.component';

describe('ServiceRequestsComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ServiceRequestsComponent],
      providers:[provideRouter([])],
    }).compileComponents();
  });

  it('creates',()=>{
    const fixture=TestBed.createComponent(ServiceRequestsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
