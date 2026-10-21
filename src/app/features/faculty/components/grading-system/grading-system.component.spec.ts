import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { AuthService } from '../../../../core/auth.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GradingSystemComponent } from './grading-system.component';

describe('GradingSystemComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[GradingSystemComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Faculty',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(GradingSystemComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('opens the grading editor with component weights and no period-weight section',()=>{
    const fixture=TestBed.createComponent(GradingSystemComponent);
    const component=fixture.componentInstance;
    component.d.subjects['IT101']={n:'Information Technology',u:3,d:'Mon/Wed',tm:'8:00–9:30 AM',
      start:'08:00',end:'09:30',r:'Lab 1',p:'All',y:'All',w:[25,35,40],cw:[30,50,20],
      f:TestBed.inject(AuthService).user!.id};
    fixture.detectChanges();
    component.open('IT101');
    fixture.detectChanges();
    expect(component.code).toBe('IT101');
    expect(fixture.debugElement.query(By.directive(ModalComponent)).componentInstance.open).toBe(true);
    expect(fixture.nativeElement.querySelector('.modal.on')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Grading System – IT101');
    expect(fixture.nativeElement.textContent).toContain('Written Works (%)');
    expect(fixture.nativeElement.textContent).toContain('Performance Tasks (%)');
    expect(fixture.nativeElement.textContent).toContain('Exams (%)');
    expect(fixture.nativeElement.textContent).toContain('Components in each selected term');
    expect(fixture.nativeElement.textContent).not.toContain('Grading period weights');
    expect(fixture.nativeElement.textContent).not.toContain('Prelim (%)');
    expect(component.cw).toEqual([30,50,20]);
  });
});
