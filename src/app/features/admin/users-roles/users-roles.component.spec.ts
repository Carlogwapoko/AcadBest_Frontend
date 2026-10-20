import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { UsersRolesComponent } from './users-roles.component';

describe('UsersRolesComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[UsersRolesComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Admin',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(UsersRolesComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('opens the account form with the supported staff roles',()=>{
    const fixture=TestBed.createComponent(UsersRolesComponent);
    fixture.detectChanges();
    const component=fixture.componentInstance;
    component.open();
    fixture.detectChanges();
    expect(component.m.role).toBe('Faculty');
    expect(component.m).toMatchObject({id:0,role:'Faculty',status:'Active'});
  });

  it('toggles the password field accessibly and resets it when opening another account form',()=>{
    const fixture=TestBed.createComponent(UsersRolesComponent);
    fixture.detectChanges();
    const component=fixture.componentInstance;
    (fixture.nativeElement.querySelector('.row .btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    const input=fixture.nativeElement.querySelector('input[autocomplete="new-password"]') as HTMLInputElement;
    const toggle=fixture.nativeElement.querySelector('.password-toggle') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    input.value='temporary-secret';
    input.dispatchEvent(new Event('input'));
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(component.m.pw).toBe('temporary-secret');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    (fixture.nativeElement.querySelector('.row .btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('input[autocomplete="new-password"]') as HTMLInputElement).type).toBe('password');
  });
});
