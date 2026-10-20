import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({selector:'app-profile',standalone:true,imports:[IconComponent],templateUrl:'./profile.component.html',styleUrl:'./profile.component.css'})
export class ProfileComponent{
  constructor(public a:AuthService){}
  get u(){return this.a.user!}
  get initials(){return this.u.name.replace(/^(Prof\.|Dr\.)\s*/,'').split(/\s+/).map(w=>w[0]).slice(0,
    2).join('').toUpperCase()}
}
