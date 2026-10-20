import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { IconComponent } from './icon.component';

describe('IconComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[IconComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(IconComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });
});
