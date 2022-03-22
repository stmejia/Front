import { Select2AguilaComponent } from './components/select2-aguila/select2-aguila.component';
import { SelectAguilaComponent } from './components/select-aguila/select-aguila.component';
import { TablaAguilaComponent } from './components/tabla-aguila/tabla-aguila.component';
import { HeaderComponentComponent } from './components/header-component/header-component.component';
import { HeadTablaComponent } from './components/head-tabla/head-tabla.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListaRapidaComponent } from './components/lista-rapida/lista-rapida.component';
import { CaracterUtf8Pipe } from './../@aguila/config/pipes/caracter-utf-8.pipe';
import { FechaPipe } from './../@aguila/config/pipes/fecha.pipe';
import { Error404Component } from './components/error404/error404.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Standar1LayoutComponent } from './layouts/standar1-layout/standar1-layout.component';
import { MaterialModule } from "./material.module";
import { PanelStatusComponent } from './components/panel-status/panel-status.component';
import { InputCodeAguilaComponent } from './components/input-code-aguila/input-code-aguila.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { TablaGridAguilaComponent } from './components/tabla-grid-aguila/tabla-grid-aguila.component';
import { InputVehiculoComponent } from '../@catalogos/components/vehiculo/input-vehiculo.component';
import { InputEmpleadoComponent } from '../@catalogos/components/empleado/input-empleado.component';
import { InputPilotoComponent } from '../@catalogos/components/piloto/input-piloto.component';
import { FirmaComponent } from './components/firma/firma.component';
import { EscanerQRComponent } from './components/escaner-qr/escaner-qr.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { InputEquipoComponent } from '../@catalogos/components/equipo-remolque/input-equipo.component';
import { InputLlantaComponent } from '../@catalogos/components/llanta/input-llanta.component';
import { ChasisComponent } from './components/chasis/chasis.component';
import { AguilaTablaComponent } from './components/aguila-tabla/aguila-tabla.component';
import { ArbolComponent } from './components/tabla-grid-aguila/arbol.component';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { InputGeneradorComponent } from '../@catalogos/components/generador/input-generador.component';
import { Chasis2Component } from './components/chasis/chasis2.component';
import { CabezalComponent } from './components/cabezal/cabezal.component';
import { FurgonComponent } from './components/furgon/furgon.component';
import { Furgon2Component } from './components/furgon/furgon2.component';
import { ChartsModule } from 'ng2-charts';
import { SelectFilesImagesComponent } from './components/select-files/select-files-images.component';
import { VisorImagenesComponent } from './components/visor-imagenes/visor-imagenes.component';
import { AguilaTablaModalComponent } from './components/aguila-tabla-modal/aguila-tabla-modal.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ImagenesComponent } from './components/imagenes/imagenes.component';
import { InputReparacionComponent } from '../@catalogos/components/reparacion/input-reparacion.component';
import { InputEquipoRemolqueComponent } from '../@catalogos/components/equipo-remolque/input-equipo-remolque.component';

const COMPONENTS = [
  Standar1LayoutComponent, HeaderComponent, FooterComponent, SidebarComponent, Error404Component, PanelStatusComponent,
  FechaPipe, CaracterUtf8Pipe, ListaRapidaComponent, HeadTablaComponent, HeaderComponentComponent,
  TablaAguilaComponent, SelectAguilaComponent, Select2AguilaComponent, InputCodeAguilaComponent, MapaComponent,
  TablaGridAguilaComponent, InputVehiculoComponent, InputEmpleadoComponent, InputPilotoComponent, FirmaComponent, EscanerQRComponent,
  InputEquipoComponent, InputLlantaComponent, ChasisComponent, AguilaTablaComponent, ArbolComponent, FiltrosComponent, InputGeneradorComponent,
  Chasis2Component, CabezalComponent, FurgonComponent, Furgon2Component, SelectFilesImagesComponent, InputReparacionComponent,
   AguilaTablaModalComponent,ImagenesComponent, VisorImagenesComponent, InputEquipoRemolqueComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ZXingScannerModule,
    ChartsModule,
    NgxQRCodeModule,
  ],
  exports: [CommonModule, COMPONENTS, ChartsModule],
  providers: [
    //{ provide: ErrorHandler, useClass: GlobalError}
  ]
})
export class PageModule { }
