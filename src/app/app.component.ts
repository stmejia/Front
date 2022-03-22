import { ConfigService } from './@aguila/data/services/config.service';
import { Component, HostBinding } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SweetService } from './@page/services/sweet.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AguilaApp';

  tema: string = 'default-theme';
  tipoTema: string = '';
  loadigData: boolean = true;

  @HostBinding('class') componentCssClass: any;

  constructor(public overlayContainer: OverlayContainer, private configService: ConfigService, private sweetService: SweetService) {
    if (localStorage.getItem('tema')) {
      if (localStorage.getItem('tipoTema')) {
        this.tema = localStorage.getItem('tema')! + localStorage.getItem('tipoTema')!;
      } else {
        this.tema = localStorage.getItem('tema')!;
      }
    } else {
      localStorage.setItem('tema', 'default-theme');
      localStorage.setItem('tipoTema', '');
      this.tema = localStorage.getItem('tema')! + localStorage.getItem('tipoTema')!;
    }
    this.aplicar();
    this.cargarServices();
  }

  async cargarServices() {
    this.configService.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.loadigData = false;
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_carga("La aplicación no pudo cargar la configuración inicial, vuelva a cargar la pagina o intente mas tarde")
    });
  }

  aplicar() {
    this.overlayContainer.getContainerElement().classList.add(this.tema);
    this.componentCssClass = this.tema;
  }
}
