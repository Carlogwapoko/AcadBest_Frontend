import { Component,Input } from '@angular/core';

/** Label + control + reserved error line, so every form field aligns consistently. */
@Component({selector:'app-field',standalone:true,styleUrl:'./field.component.css',templateUrl:'./field.component.html'})
export class FieldComponent{@Input() label='';@Input() error:string|undefined='';}
