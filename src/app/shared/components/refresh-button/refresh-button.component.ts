import { Component,EventEmitter,Input,Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({selector:'app-refresh-button',standalone:true,imports:[IconComponent],template:
  '<button class="refresh-control btn sec sm" type="button" [disabled]="loading" [attr.aria-label]="loading?\'Refreshing…\':\'Refresh\'" (click)="refreshed.emit()"><app-icon name="refresh" [size]="16"/><span>{{loading?\'Refreshing…\':\'Refresh\'}}</span></button>',
  styles:[':host{display:flex;justify-content:flex-end;margin:0 0 14px}.refresh-control{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-width:102px;height:36px;padding:0 13px}.refresh-control app-icon{flex:0 0 auto}']})
export class RefreshButtonComponent{
  @Input() loading=false;
  @Output() refreshed=new EventEmitter<void>();
}
