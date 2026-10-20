import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth.service';
import { AppComponent } from './app.component';

describe('AppComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[AppComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
    expect(fixture.nativeElement.querySelector('app-ui-host')).toBeTruthy();
  });
});
