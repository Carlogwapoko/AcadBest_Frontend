import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../core/api-config';
import { routes } from '../../../app.routes';
import { PasswordRecoveryComponent } from './password-recovery.component';

describe('PasswordRecoveryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('requests a code and displays the six-digit verification interface', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PasswordRecoveryComponent);
    const component = fixture.componentInstance;
    component.email = ' Student@Example.com ';

    const request = component.requestOtp();
    const otpRequest = http.expectOne(`${API_BASE_URL}/auth/forgot-password`);
    expect(otpRequest.request.body).toEqual({ email: 'student@example.com' });
    otpRequest.flush({
      message: 'If an account exists for this email, you will receive a verification code shortly.',
      expires_in: 300,
      resend_after: 60,
    });
    await request;
    fixture.detectChanges();

    expect(component.step).toBe('otp');
    expect(component.expiresIn).toBe(300);
    expect(component.resendIn).toBe(60);
    expect(fixture.nativeElement.querySelectorAll('.otp-fields input').length).toBe(6);
  });

  it('resends a code after cooldown and resets the countdown', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PasswordRecoveryComponent);
    const component = fixture.componentInstance;
    component.step = 'otp';
    component.email = 'student@example.com';
    component.resendIn = 0;
    component.otpDigits = ['1', '2', '3', '4', '5', '6'];

    const request = component.resendOtp();
    const resend = http.expectOne(`${API_BASE_URL}/auth/resend-password-reset-otp`);
    expect(resend.request.body).toEqual({ email: 'student@example.com' });
    resend.flush({
      message: 'If an account exists for this email, you will receive a verification code shortly.',
      expires_in: 300,
      resend_after: 60,
    });
    await request;

    expect(component.otpDigits).toEqual(['', '', '', '', '', '']);
    expect(component.expiresIn).toBe(300);
    expect(component.resendIn).toBe(60);
  });

  it('verifies the code and submits a confirmed new password', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PasswordRecoveryComponent);
    const component = fixture.componentInstance;
    component.step = 'otp';
    component.email = 'student@example.com';
    component.otpDigits = ['1', '2', '3', '4', '5', '6'];
    component.expiresIn = 120;

    const verification = component.verifyOtp();
    const verifyRequest = http.expectOne(`${API_BASE_URL}/auth/verify-password-reset-otp`);
    expect(verifyRequest.request.body).toEqual({ email: 'student@example.com', otp: '123456' });
    verifyRequest.flush({ message: 'Your verification code has been confirmed.', reset_token: 'a'.repeat(64) });
    await verification;
    expect(component.step).toBe('password');
    expect(component.resetToken).toBe('a'.repeat(64));

    component.password = 'StrongSecurePass123';
    component.passwordConfirmation = 'StrongSecurePass123';
    const reset = component.resetPassword();
    const resetRequest = http.expectOne(`${API_BASE_URL}/auth/reset-password`);
    expect(resetRequest.request.body).toEqual({
      email: 'student@example.com',
      reset_token: 'a'.repeat(64),
      password: 'StrongSecurePass123',
      password_confirmation: 'StrongSecurePass123',
    });
    resetRequest.flush({ message: 'Your password has been reset.' });
    await reset;

    expect(component.step).toBe('complete');
  });

  it('shows a validation error without requesting a code when email is empty', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PasswordRecoveryComponent);

    await fixture.componentInstance.requestOtp();

    expect(fixture.componentInstance.error).toBe('Enter your email address.');
    http.expectNone(`${API_BASE_URL}/auth/forgot-password`);
  });

  it('requires all six digits before verifying', async () => {
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PasswordRecoveryComponent);
    fixture.componentInstance.otpDigits = ['1', '2', '', '', '', ''];

    await fixture.componentInstance.verifyOtp();

    expect(fixture.componentInstance.error).toBe('Enter the complete 6-digit verification code.');
    http.expectNone(`${API_BASE_URL}/auth/verify-password-reset-otp`);
  });
});
