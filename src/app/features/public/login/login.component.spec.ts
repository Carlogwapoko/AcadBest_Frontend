import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter,Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { routes } from '../../../app.routes';
import { HOME } from '../../../core/nav';
import { API_BASE_URL } from '../../../core/api-config';
import { LoginComponent } from './login.component';

describe('LoginComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[LoginComponent],
      providers:[provideRouter(routes),provideHttpClient(),provideHttpClientTesting()],
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

  it('does not submit when required credentials are missing',async()=>{
    const auth=TestBed.inject(AuthService);
    const login=vi.spyOn(auth,'login');
    const fixture=TestBed.createComponent(LoginComponent);

    await fixture.componentInstance.go();

    expect(login).not.toHaveBeenCalled();
    expect(fixture.componentInstance.err).toBe('Enter your email address and password.');
  });

  it('redirects to the dashboard for the canonical role returned by the API',async()=>{
    const http=TestBed.inject(HttpTestingController);
    const router=TestBed.inject(Router);
    const navigate=vi.spyOn(router,'navigateByUrl').mockResolvedValue(true);
    const fixture=TestBed.createComponent(LoginComponent);
    fixture.componentInstance.email=' test@example.com ';
    fixture.componentInstance.pw='secret';

    const login=fixture.componentInstance.go();
    const request=http.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.body).toEqual({email:'test@example.com',password:'secret'});
    request.flush({token:'test-token',user:{
      id:1,name:'Test User',email:'test@example.com',role:'Registrar Staff',role_key:'registrar',active:true,
    }});
    await login;

    expect(TestBed.inject(AuthService).role).toBe('registrar');
    expect(navigate).toHaveBeenCalledWith(HOME.registrar);
    localStorage.removeItem('acadbest.api_token');
  });

  it('keeps login responsive and preserves credentials after an API failure',async()=>{
    const http=TestBed.inject(HttpTestingController);
    const fixture=TestBed.createComponent(LoginComponent);
    fixture.componentInstance.email='student@example.com';
    fixture.componentInstance.pw='entered-password';

    const operation=fixture.componentInstance.go();
    await fixture.componentInstance.go();
    const request=http.expectOne(`${API_BASE_URL}/auth/login`);
    request.flush({errors:{email:['The provided credentials are incorrect.']}},{
      status:422,statusText:'Unprocessable Content',
    });
    await operation;
    fixture.detectChanges();

    expect(fixture.componentInstance.busy).toBe(false);
    expect(fixture.componentInstance.email).toBe('student@example.com');
    expect(fixture.componentInstance.pw).toBe('entered-password');
    expect(fixture.componentInstance.err).toBe('The provided credentials are incorrect.');
    expect(fixture.nativeElement.querySelector('.btn').disabled).toBe(false);
  });
});
