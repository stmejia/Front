import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../@aguila/security/guards/auth.guard';
import { ActivoOperacionComponent } from './activo-operacion.component';
import { ListaComponent } from '../@catalogos/components/lista/lista.component';
import { ListasComponent } from '../@catalogos/components/lista/listas.component';
import { AjustesComponent } from '../@aguila/components/ajustes/ajustes.component';
import { Error404Component } from '../@page/components/error404/error404.component';
import { VehiculoComponent } from '../@catalogos/components/vehiculo/vehiculo.component';
import { VehiculosComponent } from '../@catalogos/components/vehiculo/vehiculos.component';
import { GeneradorComponent } from '../@catalogos/components/generador/generador.component';
import { GeneradoresComponent } from '../@catalogos/components/generador/generadores.component';
import { EquipoRemolqueComponent } from '../@catalogos/components/equipo-remolque/equipo-remolque.component';
import { EquiposRemolqueComponent } from '../@catalogos/components/equipo-remolque/equipos-remolque.component';
import { AdministracionVehiculoComponent } from './components/administracion-vehiculos/administracion-vehiculo.component';
import { AdministracionVehiculosComponent } from './components/administracion-vehiculos/administracion-vehiculos.component';
import { AdministracionEquiposRemolqueComponent } from './components/administracion-equipos-remolque/administracion-equipos-remolque.component';
import { AdministracionEquipoRemolqueComponent } from './components/administracion-equipos-remolque/administracion-equipo-remolque.component';
import { AdministracionGeneradoresComponent } from './components/administracion-generadores/administracion-generadores.component';
import { AdministracionGeneradorComponent } from './components/administracion-generadores/administracion-generador.component';
import { IEEquipoComponent } from './components/ieequipo/ieequipo.component';
import { ReportesVehiculosComponent } from './components/reportes-vehiculos/reportes-vehiculos.component';
import { InspeccionesCabezalComponent } from './components/inspeccion-cabezal/inspecciones-cabezal.component';
import { InspeccionCabezalComponent } from './components/inspeccion-cabezal/inspeccion-cabezal.component';
import { ReporteInventarioEquiposRemolqueComponent } from './components/reportes-equipos-remolque/reporte-inventario.component';
import { ReporteInventarioGeneradorComponent } from './components/reportes-generadores/reporte-inventario.component';
import { InspeccionesEquipoComponent } from './components/inspeccion-equipo/inspecciones-equipo.component';
import { InspeccionEquipoComponent } from './components/inspeccion-equipo/inspeccion-equipo.component';
import { InspeccionesGeneradorComponent } from './components/inspeccion-generador/inspecciones-generador.component';
import { InspeccionGeneradorComponent } from './components/inspeccion-generador/inspeccion-generador.component';
import { InspeccionesFurgonComponent } from './components/inspeccion-furgon/inspecciones-furgon.component';
import { InspeccionFurgonComponent } from './components/inspeccion-furgon/inspeccion-furgon.component';
import { ReporteMovimientosEquiposRemolqueComponent } from './components/reportes-equipos-remolque/reporte-movimientos.component';
import { InspeccionesTecnicaGeneradorComponent } from './components/inspeccion-tecnica-generador/inspecciones-tecnica-generador.component';
import { InspeccionTecnicaGeneradorComponent } from './components/inspeccion-tecnica-generador/inspeccion-tecnica-generador.component';
import { ReporteMovimientosGeneradorComponent } from './components/reportes-generadores/reporte-movimientos.component';
import { ReporteMovimientosVehiculosComponent } from './components/reportes-vehiculos/reporte-movimientos.component';
import { ControlEventosEquiposComponent } from './components/control-eventos-equipos/control-eventos-equipos.component';
import { ReporteInspeccionCabezalComponent } from './components/reportes-vehiculos/reporte-inspeccion-cabezal.component';
import { ReporteInspeccionEquipoComponent } from './components/reportes-equipos-remolque/reporte-inspeccion-equipo.component';
import { ReporteInspeccionFurgonComponent } from './components/reportes-equipos-remolque/reporte-inspeccion-furgon.component';
import { ReporteInspeccionGeneradorComponent } from './components/reportes-generadores/reporte-inspeccion-generador.component';
import { InspeccionContenedoresComponent } from './components/inspeccion-contenedor/inspeccion-contenedores.component';
import { InspeccionContenedorComponent } from './components/inspeccion-contenedor/inspeccion-contenedor.component';

const routes = [
  {
    path: "",
    component: ActivoOperacionComponent,
    children: [
      { path: "IEEquipo", component: IEEquipoComponent, canActivate: [AuthGuard] },
      /* Reportes */
      { path: "reporteInvenarioVehiculos", component: ReportesVehiculosComponent, canActivate: [AuthGuard] },
      { path: "reporteMovimientosVehiculos", component: ReporteMovimientosVehiculosComponent, canActivate: [AuthGuard] },
      { path: "reporteInvenarioEquipos", component: ReporteInventarioEquiposRemolqueComponent, canActivate: [AuthGuard] },
      { path: "reporteMovimientosEquipos", component: ReporteMovimientosEquiposRemolqueComponent, canActivate: [AuthGuard] },
      { path: "reporteGeneradores", component: ReporteInventarioGeneradorComponent, canActivate: [AuthGuard] },
      { path: "reporteMovimientosGenerador", component: ReporteMovimientosGeneradorComponent, canActivate: [AuthGuard] },
      { path: "reporteInspeccionesCabezal", component: ReporteInspeccionCabezalComponent, canActivate: [AuthGuard] },
      { path: "reporteInspeccionesEquipo", component: ReporteInspeccionEquipoComponent, canActivate: [AuthGuard] },
      { path: "reporteInspeccionesFurgon", component: ReporteInspeccionFurgonComponent, canActivate: [AuthGuard] },
      { path: "reporteInspeccionesGenerador", component: ReporteInspeccionGeneradorComponent, canActivate: [AuthGuard] },

      /* Condiciones */
      { path: "inspecciones/cabezal", component: InspeccionesCabezalComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/cabezal/:id", component: InspeccionCabezalComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/equipo", component: InspeccionesEquipoComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/equipo/:id", component: InspeccionEquipoComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/generador", component: InspeccionesGeneradorComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/generador/:id", component: InspeccionGeneradorComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/furgon", component: InspeccionesFurgonComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/furgon/:id", component: InspeccionFurgonComponent, canActivate: [AuthGuard] },
      { path: "inspeccionesTecnicas/generador", component: InspeccionesTecnicaGeneradorComponent, canActivate: [AuthGuard] },
      { path: "inspeccionesTecnicas/generador/:id", component: InspeccionTecnicaGeneradorComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/contenedor", component: InspeccionContenedoresComponent, canActivate: [AuthGuard] },
      { path: "inspecciones/contenedor/:id", component: InspeccionContenedorComponent, canActivate: [AuthGuard] },

      /* Administracion de Equipo */
      { path: "administracionVehiculos", component: AdministracionVehiculosComponent, canActivate: [AuthGuard] },
      { path: "administracionVehiculos/:id", component: AdministracionVehiculoComponent, canActivate: [AuthGuard] },
      { path: "administracionEquipoRemolque", component: AdministracionEquiposRemolqueComponent, canActivate: [AuthGuard] },
      { path: "administracionEquipoRemolque/:id", component: AdministracionEquipoRemolqueComponent, canActivate: [AuthGuard] },
      { path: "administracionGeneradores", component: AdministracionGeneradoresComponent, canActivate: [AuthGuard] },
      { path: "administracionGeneradores/:id", component: AdministracionGeneradorComponent, canActivate: [AuthGuard] },

      /* Otros */
      { path: "vehiculos", component: VehiculosComponent, canActivate: [AuthGuard] },
      { path: "vehiculos/:id", component: VehiculoComponent, canActivate: [AuthGuard] },
      { path: "equiposRemolque", component: EquiposRemolqueComponent, canActivate: [AuthGuard] },
      { path: "equiposRemolque/:id", component: EquipoRemolqueComponent, canActivate: [AuthGuard] },
      { path: "generadores", component: GeneradoresComponent, canActivate: [AuthGuard] },
      { path: "generadores/:id", component: GeneradorComponent, canActivate: [AuthGuard] },
      { path: "listas/:idTipoLista", component: ListasComponent, canActivate: [AuthGuard] },
      { path: "listas/:idTipoLista/:id", component: ListaComponent, canActivate: [AuthGuard] },
      { path: "controlEventosEquipos", component: ControlEventosEquiposComponent, canActivate: [AuthGuard] },
      { path: "ajustes", component: AjustesComponent, canActivate: [AuthGuard] },
      { path: "", redirectTo: "ajustes", pathMatch: "full" },
      { path: "404", component: Error404Component },
      { path: "**", redirectTo: "404", pathMatch: "full" },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ActivoOperacionRoutingModule { }
