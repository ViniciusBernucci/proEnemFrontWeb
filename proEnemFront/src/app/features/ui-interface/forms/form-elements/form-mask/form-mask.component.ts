import { Component } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { RouterLink } from '@angular/router';
import { routes } from '../../../../../shared/routes/routes';


@Component({
    selector: 'app-form-mask',
    templateUrl: './form-mask.component.html',
    styleUrls: ['./form-mask.component.scss'],
    imports: [NgxMaskDirective, NgxMaskPipe, RouterLink],
    providers: [provideNgxMask()]
})
export class FormMaskComponent{
  routes = routes
}
 