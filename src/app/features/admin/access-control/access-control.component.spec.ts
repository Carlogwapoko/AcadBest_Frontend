import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AccessControlComponent } from './access-control.component';

describe('AccessControlComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AccessControlComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Admin',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(AccessControlComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
