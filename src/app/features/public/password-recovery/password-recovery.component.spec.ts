import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../core/api-config';
import { routes } from '../../../app.routes';
import { PasswordRecoveryComponent } from './password-recovery.component';

describe('PasswordRecoveryComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[PasswordRecoveryComponent],
      providers:[provideRouter(routes),provideHttpClient(),provideHttpClientTesting()],
    }).compileComponents();
  });

  it('submits an email and displays the generic reset confirmation',async()=>{
    const http=TestBed.inject(HttpTestingController);
    const fixture=TestBed.createComponent(PasswordRecoveryComponent);
    fixture.componentInstance.email='student@example.com';

    const request=fixture.componentInstance.submit();
    const resetRequest=http.expectOne(`${API_BASE_URL}/auth/forgot-password`);
    expect(resetRequest.request.body).toEqual({email:'student@example.com'});
    resetRequest.flush({message:'If an account exists for this email, you will receive a password reset link shortly.'});
    await request;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('If an account exists');
  });

  it('sends a reset request when the Send Reset Link button is clicked',async()=>{
    const http=TestBed.inject(HttpTestingController);
    const fixture=TestBed.createComponent(PasswordRecoveryComponent);
    fixture.componentInstance.email='student@example.com';
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button[type="submit"]').click();

    const request=http.expectOne(`${API_BASE_URL}/auth/forgot-password`);
    expect(request.request.body).toEqual({email:'student@example.com'});
    request.flush({message:'If an account exists for this email, you will receive a password reset link shortly.'});
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('If an account exists');
  });

  it('shows a validation error without making a request when email is empty',async()=>{
    const http=TestBed.inject(HttpTestingController);
    const fixture=TestBed.createComponent(PasswordRecoveryComponent);

    await fixture.componentInstance.submit();

    expect(fixture.componentInstance.error).toBe('Enter your email address.');
    http.expectNone(`${API_BASE_URL}/auth/forgot-password`);
  });
});
