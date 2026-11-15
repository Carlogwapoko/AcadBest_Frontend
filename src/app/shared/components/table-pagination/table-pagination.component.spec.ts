import { TestBed } from '@angular/core/testing';
import { TablePaginationComponent } from './table-pagination.component';

describe('TablePaginationComponent', () => {
  it('emits bounded previous and next page changes', async () => {
    await TestBed.configureTestingModule({
      imports: [TablePaginationComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TablePaginationComponent);
    const changes: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => changes.push(page));
    fixture.componentRef.setInput('totalItems', 23);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
    buttons[1].click();
    expect(changes).toEqual([2]);

    fixture.componentRef.setInput('page', 3);
    fixture.detectChanges();
    buttons[1].click();
    expect(changes).toEqual([2]);
    buttons[0].click();
    expect(changes).toEqual([2, 2]);
  });
});
