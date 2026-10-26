import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { StandingRulesComponent } from './standing-rules.component';

describe('StandingRulesComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[StandingRulesComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Admin',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(StandingRulesComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Academic standing thresholds');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Current Academic School Year');
  });
});
