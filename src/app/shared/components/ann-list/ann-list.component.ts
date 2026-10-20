import { Component,Input } from '@angular/core';
import { COMMON } from '../../common';
import { Ann,DataService } from '../../../core/data.service';

@Component({selector:'app-ann-list',standalone:true,imports:[COMMON],styleUrl:'./ann-list.component.css',templateUrl:'./ann-list.component.html'})
export class AnnListComponent{
  @Input() items:Ann[]=[];@Input() loading=false;
  @Input() emptyMessage='No records found. No announcements yet.';
  sel:Ann|null=null;
  constructor(public d:DataService){}
}
