import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { routes } from '../../../app.routes';
import { LoginComponent } from './login.component';

describe('LoginComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[LoginComponent],
      providers:[provideRouter(routes)],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('renders the authentication fields',()=>{
    const fixture=TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[placeholder="Enter your email address"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type=password]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Sign in as');
  });

  it('toggles password visibility without changing the password value',()=>{
    const fixture=TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const input=fixture.nativeElement.querySelector('input[autocomplete="current-password"]') as HTMLInputElement;
    input.value='secret';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.password-toggle').click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(fixture.componentInstance.pw).toBe('secret');
    fixture.nativeElement.querySelector('.password-toggle').click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });
});
