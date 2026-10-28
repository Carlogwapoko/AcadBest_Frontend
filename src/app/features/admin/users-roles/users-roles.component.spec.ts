import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
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

  it('keeps user-name values in their separate columns when legacy parts are incomplete',()=>{
    const data=TestBed.inject(DataService);
    data.users=[{
      id:2,name:'First Middle Last',first_name:'',middle_name:'Middle',last_name:'',
      email:'legacy@example.com',role:'Faculty',act:true,phone:'',
    }];
    const fixture=TestBed.createComponent(UsersRolesComponent);
    fixture.detectChanges();
    const cells=fixture.nativeElement.querySelectorAll(
      '.feature-content .tw tr:last-child td'
    ) as NodeListOf<HTMLTableCellElement>;
    cells[0].querySelector('.user-avatar')?.remove();

    expect(Array.from(cells).slice(0,3).map(cell=>cell.textContent?.trim()))
      .toEqual(['—','Middle','—']);
    expect(fixture.nativeElement.querySelector('td[colspan="3"]')).toBeNull();
  });

  it('keeps online enrollment account provisioning out of Admin Users & Roles',()=>{
    const fixture=TestBed.createComponent(UsersRolesComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Online enrollment applicants');
    expect(fixture.nativeElement.textContent).toContain('Add Users');
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
