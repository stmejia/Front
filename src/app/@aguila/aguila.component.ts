import { ConfigService } from './data/services/config.service';
import { Component, OnInit } from '@angular/core';
import { ITEMS_MENU_PRIVATE } from './aguila-menu';
import { SweetService } from '../@page/services/sweet.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-aguila',
  templateUrl: './aguila.component.html',
  styleUrls: ['./aguila.component.css']
})
export class AguilaComponent implements OnInit {

  menuItems = ITEMS_MENU_PRIVATE;
  loadigData: boolean = true;

  constructor(private configService: ConfigService, private sweetService: SweetService) {
    this.configService.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.loadigData = false;
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_carga("La aplicación no pudo cargar la configuración inicial, vuelva a cargar la pagina o intente mas tarde")
    });
  }

  ngOnInit(): void {
  }

}
