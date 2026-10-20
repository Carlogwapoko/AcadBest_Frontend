import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { UiService } from '../../../core/ui.service';
import { ModalComponent } from '../modal/modal.component';
import { UiHostComponent } from './ui-host.component';

describe('UiHostComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[UiHostComponent,ModalComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(UiHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('locks background scrolling while a confirmation overlay is open',async()=>{
    document.body.style.overflow='auto';
    const fixture=TestBed.createComponent(UiHostComponent);
    const ui=TestBed.inject(UiService);
    fixture.detectChanges();
    const answer=ui.confirm('Confirm','Continue?');
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
    ui.answer(false);
    fixture.detectChanges();
    await answer;
    expect(document.body.style.overflow).toBe('auto');
    fixture.destroy();
    document.body.style.overflow='';
  });

  it('keeps scrolling locked when a confirmation closes over an open feature modal',async()=>{
    document.body.style.overflow='auto';
    const modal=TestBed.createComponent(ModalComponent);
    modal.componentRef.setInput('open',true);
    modal.detectChanges();
    const fixture=TestBed.createComponent(UiHostComponent);
    const ui=TestBed.inject(UiService);
    fixture.detectChanges();

    const answer=ui.confirm('Confirm','Continue?');
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    ui.answer(false);
    fixture.detectChanges();
    await answer;
    expect(document.body.style.overflow).toBe('hidden');

    modal.destroy();
    expect(document.body.style.overflow).toBe('auto');
    fixture.destroy();
    document.body.style.overflow='';
  });
});
