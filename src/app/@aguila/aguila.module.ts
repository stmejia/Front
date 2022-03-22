import { RolComponent } from './components/rol/rol.component';
import { RolesComponent } from './components/rol/roles.component';
import { MaterialModule } from './../@page/material.module';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AguilaRoutingModule } from './aguila-routing.module';
import { AguilaComponent } from './aguila.component';
import { PageModule } from '../@page/page.module';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { EmpresasComponent } from './components/empresa/empresas.component';
import { AjustesComponent } from './components/ajustes/ajustes.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenInterceptor } from './security/interceptors/token.interceptor';
import { AuthInterceptor } from './security/interceptors/auth.interceptor';
import { SucursalComponent } from './components/sucursal/sucursal.component';
import { SucursalesComponent } from './components/sucursal/sucursales.component';
import { PermisosComponent } from './components/usuario/permisos.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosComponent } from './components/usuario/usuarios.component';
import { EstaciontrabajoComponent } from './components/estaciontrabajo/estaciontrabajo.component';
import { EstacionestrabajoComponent } from './components/estaciontrabajo/estacionestrabajo.component';
import { RecursoComponent } from './components/recurso/recurso.component';
import { RecursosComponent } from './components/recurso/recursos.component';
import { ModuloComponent } from './components/modulo/modulo.component';
import { ModulosComponent } from './components/modulo/modulos.component';
import { ImpresionComponent } from './components/usuario/impresion.component';
import { ReporteUsuarioComponent } from './components/reporte-usuario/reporte-usuario.component';
import { SelectEstacionComponent } from './config/components/select-estacion/select-estacion.component';
import { ConsultaComponent } from './components/usuario/consulta.component';
import { ImagenrecursoconfiguracionComponent } from "./components/imagenrecursoconfiguracion/imagenrecursoconfiguracion.component";
import { ImagenesrecursosconfiguracionComponent } from './components/imagenrecursoconfiguracion/imagenesrecursosconfiguracion.component';

@NgModule({
  declarations: [AguilaComponent, EmpresaComponent, EmpresasComponent, WelcomeComponent,
    AjustesComponent, SucursalesComponent, SucursalComponent, UsuarioComponent, UsuariosComponent,
    EstaciontrabajoComponent, EstacionestrabajoComponent, PermisosComponent, RecursoComponent,
    RecursosComponent, ModuloComponent, ModulosComponent, ImpresionComponent, RolesComponent,
    RolComponent, ReporteUsuarioComponent, SelectEstacionComponent, ConsultaComponent,
    ImagenrecursoconfiguracionComponent, ImagenesrecursosconfiguracionComponent],
  entryComponents: [SelectEstacionComponent],
  imports: [
    CommonModule,
    AguilaRoutingModule,
    PageModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class AguilaModule { }
