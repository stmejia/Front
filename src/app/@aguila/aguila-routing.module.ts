import { ConsultaComponent } from './components/usuario/consulta.component';
import { ImpresionComponent } from './components/usuario/impresion.component';
import { PermisosComponent } from './components/usuario/permisos.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosComponent } from './components/usuario/usuarios.component';
import { EmpresasComponent } from "./components/empresa/empresas.component";
import { EmpresaComponent } from "./components/empresa/empresa.component";
import { AjustesComponent } from "./components/ajustes/ajustes.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AguilaComponent } from "./aguila.component";
import { WelcomeComponent } from "./components/welcome/welcome.component";
import { AuthGuard } from './security/guards/auth.guard';
import { SucursalesComponent } from './components/sucursal/sucursales.component';
import { SucursalComponent } from './components/sucursal/sucursal.component';
import { EstacionestrabajoComponent } from './components/estaciontrabajo/estacionestrabajo.component';
import { EstaciontrabajoComponent } from './components/estaciontrabajo/estaciontrabajo.component';
import { RecursosComponent } from './components/recurso/recursos.component';
import { RecursoComponent } from './components/recurso/recurso.component';
import { ModulosComponent } from './components/modulo/modulos.component';
import { RolComponent } from './components/rol/rol.component';
import { RolesComponent } from './components/rol/roles.component';
import { ModuloComponent } from './components/modulo/modulo.component';
import { Error404Component } from '../@page/components/error404/error404.component';
import { ImagenrecursoconfiguracionComponent } from "./components/imagenrecursoconfiguracion/imagenrecursoconfiguracion.component";
import { ImagenesrecursosconfiguracionComponent } from './components/imagenrecursoconfiguracion/imagenesrecursosconfiguracion.component'

// Las rutas de rutas del form deben ser la misma ruta del listado enviando como parametro el ID del elemento que se va a consultar,
// si esta vacio se tomara como nuevo 
const routes: Routes = [
  {
    path: "",
    component: AguilaComponent,
    children: [
      {
        path: "welcome",
        component: WelcomeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "empresas",
        component: EmpresasComponent,
        canActivate: [AuthGuard], // [AuthGuard, RoleGuard]
      },
      {
        path: "empresas/:id",
        component: EmpresaComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "sucursales",
        component: SucursalesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "sucursales/:id",
        component: SucursalComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "usuarios",
        component: UsuariosComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "usuarios/:id",
        component: UsuarioComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "usuarios_permisos/:id",
        component: PermisosComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "usuarios_impresion/:id",
        component: ImpresionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "usuarios_consulta",
        component: ConsultaComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "ajustes",
        component: AjustesComponent
      },
      {
        path: "estaciones",
        component: EstacionestrabajoComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "estaciones/:id",
        component: EstaciontrabajoComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "recursos",
        component: RecursosComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "recursos/:id",
        component: RecursoComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "imagenesrecursosconfiguracion",
        component: ImagenesrecursosconfiguracionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "imagenesrecursosconfiguracion/:id",
        component: ImagenrecursoconfiguracionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "modulos",
        component: ModulosComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "modulos/:id",
        component: ModuloComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "roles",
        component: RolesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "roles/:id",
        component: RolComponent,
        canActivate: [AuthGuard],
      },
      { path: "", redirectTo: "welcome", pathMatch: "full" },
      { path: "404", component: Error404Component},
      { path: "**", redirectTo: "404", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AguilaRoutingModule { }
