import { Component,EventEmitter,Input,Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({selector:'app-refresh-button',standalone:true,imports:[IconComponent],template:
  '<button class="btn sec sm" type="button" [disabled]="loading" (click)="refreshed.emit()"><app-icon name="refresh" [size]="15"/>Refresh</button>',
  styles:[':host{display:flex;justify-content:flex-end;margin:0 0 12px}']})
export class RefreshButtonComponent{
  @Input() loading=false;
  @Output() refreshed=new EventEmitter<void>();
}
