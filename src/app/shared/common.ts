import { FormsModule } from '@angular/forms';
import { FieldComponent } from './components/field/field.component';
import { IconComponent } from './components/icon/icon.component';
import { ModalComponent } from './components/modal/modal.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { RefreshButtonComponent } from './components/refresh-button/refresh-button.component';
/** Imports shared by every page component (forms, icons, field wrapper, modal). */
export const COMMON=[FormsModule,IconComponent,FieldComponent,ModalComponent,DropdownComponent,RefreshButtonComponent];
