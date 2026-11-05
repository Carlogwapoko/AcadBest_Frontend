import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DropdownComponent } from './dropdown.component';

@Component({standalone:true,imports:[FormsModule,DropdownComponent],template:`
  <app-dropdown ariaLabel="Test dropdown" [(ngModel)]="value">
    <option value="">Choose</option>
    <option value="first">First option</option>
    <option value="second">Second option</option>
  </app-dropdown>
`})
class DropdownTestHost{value='first'}

describe('DropdownComponent',()=>{
  it('renders options outside clipping containers and supports keyboard selection',async()=>{
    await TestBed.configureTestingModule({imports:[DropdownTestHost]}).compileComponents();
    const fixture=TestBed.createComponent(DropdownTestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const trigger:HTMLButtonElement=fixture.nativeElement.querySelector('[role="combobox"]');
    expect(fixture.componentInstance.value).toBe('first');
    const dropdown=fixture.debugElement.query(By.directive(DropdownComponent)).componentInstance as DropdownComponent;
    expect(dropdown.value).toBe('first');
    expect(trigger.textContent).toContain('First option');
    expect(trigger.getAttribute('aria-label')).toBe('Test dropdown');
    vi.spyOn(trigger,'getBoundingClientRect').mockReturnValue({
      x:100,y:300,left:100,right:280,top:300,bottom:340,width:180,height:40,
      toJSON:()=>({}),
    } as DOMRect);
    trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
    fixture.detectChanges();
    await new Promise(resolve=>setTimeout(resolve,25));
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(dropdown.listWidth).toBe(180);

    const list=document.getElementById(`${dropdown.id}-options`);
    expect(list?.parentElement).toBe(document.body);
    expect(list?.querySelectorAll('[role="option"]').length).toBe(3);
    expect(list?.style.width).toBe('180px');

    trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
    trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('second');
    expect(trigger.textContent).toContain('Second option');
    expect(list?.parentElement).not.toBe(document.body);

    fixture.destroy();
  });
});
