import { Component, ElementRef, HostListener, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface EnrollmentSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-enrollment-select',
  standalone: true,
  templateUrl: './enrollment-select.component.html',
  styleUrl: './enrollment-select.component.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: EnrollmentSelectComponent,
    multi: true,
  }],
})
export class EnrollmentSelectComponent implements ControlValueAccessor,OnDestroy {
  @Input('controlId') id = '';
  @Input() options: readonly EnrollmentSelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() invalid = false;
  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('optionList') optionList?: ElementRef<HTMLElement>;

  value = '';
  open = false;
  opensUp = false;
  disabled = false;
  activeIndex = -1;
  maxHeight = 240;
  listTop = 0;
  listLeft = 0;
  listWidth = 0;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private typeahead = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;
  private readonly scrollHandler = () => { if (this.open) this.positionList(); };

  get selectedLabel(): string {
    return this.options.find(option => option.value === this.value)?.label ?? this.placeholder;
  }

  get listId(): string {
    return `${this.id}-options`;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.activeIndex = this.options.findIndex(option => option.value === this.value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.open) {
      this.close();
    } else {
      this.openList();
    }
  }

  select(option: EnrollmentSelectOption): void {
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.close();
    this.trigger?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open) {
        this.openList(event.key === 'ArrowUp');
      } else {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        this.setActiveIndex(Math.max(0, Math.min(this.options.length - 1, this.activeIndex + direction)));
      }
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      if (!this.open) return;
      event.preventDefault();
      this.setActiveIndex(event.key === 'Home' ? 0 : this.options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.open) {
        this.openList();
      } else if (this.options[this.activeIndex]) {
        this.select(this.options[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.close();
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.search(event.key);
    }
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.close();
  }

  private openList(fromEnd = false): void {
    if (!this.options.length) return;
    this.open = true;
    const list=this.optionList?.nativeElement;
    if(list&&list.parentElement!==document.body)this.renderer.appendChild(document.body,list);
    const selectedIndex = this.options.findIndex(option => option.value === this.value);
    this.activeIndex = selectedIndex >= 0 ? selectedIndex : (fromEnd ? this.options.length - 1 : 0);
    requestAnimationFrame(() => this.positionList());
  }

  private close(): void {
    this.open = false;
    this.onTouched();
    const list=this.optionList?.nativeElement;
    if(list?.parentElement===document.body)this.renderer.appendChild(this.element.nativeElement,list);
  }

  @HostListener('window:resize')
  private positionList(): void {
    const trigger = this.trigger?.nativeElement;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const below = Math.max(0, window.innerHeight - rect.bottom - 8);
    const above = Math.max(0, rect.top - 8);
    const desiredHeight = Math.min(240, this.options.length * 40);
    this.opensUp = below < Math.min(desiredHeight, 160) && above > below;
    const available = this.opensUp ? above : below;
    this.maxHeight = Math.max(0, Math.min(240, available - 8));
    this.listWidth = rect.width;
    this.listLeft = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
    const listHeight = Math.min(this.maxHeight, desiredHeight);
    this.listTop = this.opensUp ? Math.max(8, rect.top - listHeight - 4) : rect.bottom + 4;
    const list = this.optionList?.nativeElement;
    if (list) {
      list.style.top = `${this.listTop}px`;
      list.style.left = `${this.listLeft}px`;
      list.style.width = `${this.listWidth}px`;
      list.style.maxHeight = `${this.maxHeight}px`;
    }
    const computed = getComputedStyle(trigger);
    for (const variable of ['--card', '--bd', '--tx', '--mu', '--lb', '--lb2', '--navy2', '--blue']) {
      const value = computed.getPropertyValue(variable).trim();
      if (value) this.optionList?.nativeElement.style.setProperty(variable, value);
    }
    this.scrollActiveOptionIntoView();
  }

  private setActiveIndex(index: number): void {
    this.activeIndex = index;
    requestAnimationFrame(() => this.scrollActiveOptionIntoView());
  }

  private scrollActiveOptionIntoView(): void {
    const option = this.optionList?.nativeElement.querySelector<HTMLElement>(`[data-option-index="${this.activeIndex}"]`);
    if (option && typeof option.scrollIntoView === 'function') {
      option.scrollIntoView({ block: 'nearest' });
    }
  }

  private search(character: string): void {
    this.typeahead += character.toLocaleLowerCase();
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => this.typeahead = '', 700);
    const start = this.activeIndex + 1;
    const ordered = [...this.options.slice(start), ...this.options.slice(0, start)];
    const match = ordered.find(option => option.label.toLocaleLowerCase().startsWith(this.typeahead));
    if (match) {
      if (!this.open) this.openList();
      this.setActiveIndex(this.options.indexOf(match));
    }
  }

  constructor(private element: ElementRef<HTMLElement>,private renderer:Renderer2) {
    window.addEventListener('scroll',this.scrollHandler,true);
  }

  ngOnDestroy():void {
    window.removeEventListener('scroll',this.scrollHandler,true);
    if(this.typeaheadTimer)clearTimeout(this.typeaheadTimer);
    const list=this.optionList?.nativeElement;
    if(list?.parentElement===document.body)this.renderer.appendChild(this.element.nativeElement,list);
  }
}
