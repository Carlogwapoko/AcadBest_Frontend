import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalComponent } from './modal.component';

describe('ModalComponent',()=>{
  beforeEach(async()=>{
    await TestBed.configureTestingModule({
      imports:[ModalComponent],
      providers:[provideRouter([])],
    }).compileComponents();
    TestBed.inject(AuthService).user = {id:1,name:'Test User',email:'test@example.com',phone:'',role:'Student',act:true};
  });

  it('creates and renders the standalone component',()=>{
    const fixture=TestBed.createComponent(ModalComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.componentInstance).toBe(fixture.componentInstance);
  });

  it('keeps the title outside the scrollable modal content',()=>{
    const fixture=TestBed.createComponent(ModalComponent);
    fixture.componentInstance.open=true;
    fixture.componentInstance.title='Edit User';
    fixture.componentInstance.maxWidth=640;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-header h3')?.textContent).toBe('Edit User');
    expect(fixture.nativeElement.querySelector('.modal-content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.mb')?.style.getPropertyValue('--modal-width')).toBe('640px');
  });

  it('prevents dismissing an active dialog while its request is processing',()=>{
    const fixture=TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('open',true);
    fixture.componentRef.setInput('disableClose',true);
    fixture.detectChanges();
    const closed=vi.spyOn(fixture.componentInstance.closed,'emit');

    fixture.componentInstance.esc();
    fixture.componentInstance.back(new MouseEvent('click'));
    (fixture.nativeElement.querySelector('.lx') as HTMLButtonElement).click();

    expect(closed).not.toHaveBeenCalled();
    expect((fixture.nativeElement.querySelector('.lx') as HTMLButtonElement).disabled).toBe(true);

    fixture.componentRef.setInput('disableClose',false);
    fixture.detectChanges();
    fixture.componentInstance.esc();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('locks background scrolling only while the modal is open',()=>{
    document.body.style.overflow='auto';
    const fixture=TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('open',true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.componentRef.setInput('open',false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow='';
  });

  it('keeps background scrolling locked until every open modal closes',()=>{
    document.body.style.overflow='auto';
    const first=TestBed.createComponent(ModalComponent);
    const second=TestBed.createComponent(ModalComponent);
    first.componentRef.setInput('open',true);
    second.componentRef.setInput('open',true);
    first.detectChanges();
    second.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    first.componentRef.setInput('open',false);
    first.detectChanges();
    first.destroy();
    expect(document.body.style.overflow).toBe('hidden');

    second.destroy();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow='';
  });
});
