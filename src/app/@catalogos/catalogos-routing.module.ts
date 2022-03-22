import { TipoMecanicoComponent } from './components/tipo-mecanico/tipo-mecanico.component';
import { TiposMecanicosComponent } from './components/tipo-mecanico/tipos-mecanicos.component';
import { TiposGeneradorComponent } from './components/tipo-generador/tipos-generador.component';
import { TipoGeneradorComponent } from './components/tipo-generador/tipo-generador.component';
import { LlantaTipoComponent } from './components/llanta-tipo/llanta-tipo.component';
import { LlantasTiposComponent } from './components/llanta-tipo/llantas-tipos.component';
import { TipoVehiculoComponent } from './components/tipo-vehiculo/tipo-vehiculo.component';
import { TiposVehiculosComponent } from './components/tipo-vehiculo/tipos-vehiculos.component';
import { TipoEquipoRemolqueComponent } from './components/tipo-equipo-remolque/tipo-equipo-remolque.component';
import { TiposEquiposRemolquesComponent } from './components/tipo-equipo-remolque/tipos-equipos-remolques.component';
import { TipoProveedorComponent } from './components/tipo-proveedor/tipo-proveedor.component';
import { TiposProveedoresComponent } from './components/tipo-proveedor/tipos-proveedores.component';
import { PilotoTipoComponent } from './components/piloto-tipo/piloto-tipo.component';
import { PilotosTiposComponent } from './components/piloto-tipo/pilotos-tipos.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { ClientesComponent } from './components/cliente/clientes.component';
import { TipoActivoComponent } from './components/tipo-activo/tipo-activo.component';
import { TiposActivosComponent } from './components/tipo-activo/tipos-activos.component';
import { TipoClienteComponent } from './components/tipo-cliente/tipo-cliente.component';
import { TiposClientesComponent } from './components/tipo-cliente/tipos-clientes.component';
import { CorporacionComponent } from './components/corporacion/corporacion.component';
import { EntidadComercialComponent } from './components/entidad-comercial/entidad-comercial.component';
import { EntidadesComercialesComponent } from './components/entidad-comercial/entidades-comerciales.component';
import { DireccionComponent } from './components/direccion/direccion.component';
import { DireccionesComponent } from './components/direccion/direcciones.component';
import { UbicacionComponent } from './components/ubicacion/ubicacion.component';
import { UbicacionesComponent } from './components/ubicacion/ubicaciones.component';
import { TipoReparacionesComponent } from './components/tipo-reparaciones/tipo-reparaciones.component';
import { TiposReparacionesComponent } from './components/tipo-reparaciones/tipos-reparaciones.component';
import { ListaComponent } from './components/lista/lista.component';
import { ListasComponent } from './components/lista/listas.component';
import { MunicipioComponent } from './components/municipio/municipio.component';
import { MunicipiosComponent } from './components/municipio/municipios.component';
import { DepartamentoComponent } from './components/departamento/departamento.component';
import { DepartamentosComponent } from './components/departamento/departamentos.component';
import { TiposListasComponent } from './components/tipos-listas/tipos-listas.component';
import { PaisComponent } from './components/pais/pais.component';
import { CatalogosComponent } from './catalogos.component';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthGuard } from '../@aguila/security/guards/auth.guard';
import { Error404Component } from '../@page/components/error404/error404.component';
import { AjustesComponent } from '../@aguila/components/ajustes/ajustes.component';
import { PaisesComponent } from './components/pais/paises.component';
import { TipoListaComponent } from './components/tipos-listas/tipo-lista.component';
import { ReparacionesComponent } from './components/reparacion/reparaciones.component';
import { ReparacionComponent } from './components/reparacion/reparacion.component';
import { CorporacionesComponent } from './components/corporacion/corporaciones.component';
import { ProveedoresComponent } from './components/proveedor/proveedores.component';
import { ProveedorComponent } from './components/proveedor/proveedor.component';
import { TransportesComponent } from './components/transporte/transportes.component';
import { TransporteComponent } from './components/transporte/transporte.component';
import { RutasComponent } from './components/ruta/rutas.component';
import { RutaComponent } from './components/ruta/ruta.component';
import { ServiciosComponent } from './components/servicio/servicios.component';
import { ServicioComponent } from './components/servicio/servicio.component';
import { EmpleadosComponent } from './components/empleado/empleados.component';
import { EmpleadoComponent } from './components/empleado/empleado.component';
import { AsesoresComponent } from './components/asesor/asesores.component';
import { AsesorComponent } from './components/asesor/asesor.component';
import { PilotosComponent } from './components/piloto/pilotos.component';
import { PilotoComponent } from './components/piloto/piloto.component';
import { VehiculosComponent } from './components/vehiculo/vehiculos.component';
import { VehiculoComponent } from './components/vehiculo/vehiculo.component';
import { EquiposRemolqueComponent } from './components/equipo-remolque/equipos-remolque.component';
import { EquipoRemolqueComponent } from './components/equipo-remolque/equipo-remolque.component';
import { InventarioCategoriasComponent } from './components/inventario-categoria/inventario-categorias.component';
import { InventarioCategoriaComponent } from './components/inventario-categoria/inventario-categoria.component';
import { InventarioSubcategoriaComponent } from './components/inventario-subcategoria/inventario-subcategoria.component';
import { InventarioSubcategoriasComponent } from './components/inventario-subcategoria/inventario-subcategorias.component';
import { GeneradoresComponent } from './components/generador/generadores.component';
import { GeneradorComponent } from './components/generador/generador.component';
import { MedidasComponent } from './components/medida/medidas.component';
import { MedidaComponent } from './components/medida/medida.component';
import { ProductosComponent } from './components/producto/productos.component';
import { ProductoComponent } from './components/producto/producto.component';
import { MecanicosComponent } from './components/mecanico/mecanicos.component';
import { MecanicoComponent } from './components/mecanico/mecanico.component';
import { EstadosComponent } from './components/estados/estados.component';
import { EstadoComponent } from './components/estados/estado.component';
import { LlantasComponent } from './components/llanta/llantas.component';
import { LlantaComponent } from './components/llanta/llanta.component';
import { TarifaComponent } from './components/tarifa/tarifa.component';
import { TarifasComponent } from './components/tarifa/tarifas.component';

const routes = [
  {
    path: "",
    component: CatalogosComponent,
    children: [
      /* Generales */
      { path: "paises", component: PaisesComponent, canActivate: [AuthGuard] },
      { path: "paises/:id", component: PaisComponent, canActivate: [AuthGuard] },
      { path: "departamentos", component: DepartamentosComponent, canActivate: [AuthGuard] },
      { path: "departamentos/:id", component: DepartamentoComponent, canActivate: [AuthGuard] },
      { path: "municipios", component: MunicipiosComponent, canActivate: [AuthGuard] },
      { path: "municipios/:id", component: MunicipioComponent, canActivate: [AuthGuard] },
      { path: "ubicaciones", component: UbicacionesComponent, canActivate: [AuthGuard] },
      { path: "ubicaciones/:id", component: UbicacionComponent, canActivate: [AuthGuard] },
      { path: "direcciones", component: DireccionesComponent, canActivate: [AuthGuard] },
      { path: "direcciones/:id", component: DireccionComponent, canActivate: [AuthGuard] },
      { path: "tiposListas", component: TiposListasComponent, canActivate: [AuthGuard] },
      { path: "tiposListas/:id", component: TipoListaComponent, canActivate: [AuthGuard] },
      { path: "listas/:idTipoLista", component: ListasComponent, canActivate: [AuthGuard] },
      { path: "listas/:idTipoLista/:id", component: ListaComponent, canActivate: [AuthGuard] },
      { path: "vehiculos", component: VehiculosComponent, canActivate: [AuthGuard] },
      { path: "vehiculos/:id", component: VehiculoComponent, canActivate: [AuthGuard] },
      { path: "equiposRemolque", component: EquiposRemolqueComponent, canActivate: [AuthGuard] },
      { path: "equiposRemolque/:id", component: EquipoRemolqueComponent, canActivate: [AuthGuard] },
      { path: "generadores", component: GeneradoresComponent, canActivate: [AuthGuard] },
      { path: "generadores/:id", component: GeneradorComponent, canActivate: [AuthGuard] },
      { path: "estados/:tipo", component: EstadosComponent, canActivate: [AuthGuard] },
      { path: "estados/:tipo/:id", component: EstadoComponent, canActivate: [AuthGuard] },

      /* Llantas */
      { path: "llantasTipos", component: LlantasTiposComponent, canActivate: [AuthGuard] },
      { path: "llantasTipos/:id", component: LlantaTipoComponent, canActivate: [AuthGuard] },
      { path: "llantas", component: LlantasComponent, canActivate: [AuthGuard] },
      { path: "llantas/:id", component: LlantaComponent, canActivate: [AuthGuard] },

      /* Comercializacion */
      { path: "entidadesComerciales", component: EntidadesComercialesComponent, canActivate: [AuthGuard] },
      { path: "entidadesComerciales/:id", component: EntidadComercialComponent, canActivate: [AuthGuard] },
      { path: "corporaciones", component: CorporacionesComponent, canActivate: [AuthGuard] },
      { path: "corporaciones/:id", component: CorporacionComponent, canActivate: [AuthGuard] },
      { path: "tipoClientes", component: TiposClientesComponent, canActivate: [AuthGuard] },
      { path: "tipoClientes/:id", component: TipoClienteComponent, canActivate: [AuthGuard] },
      { path: "clientes", component: ClientesComponent, canActivate: [AuthGuard] },
      { path: "clientes/:id", component: ClienteComponent, canActivate: [AuthGuard] },
      { path: "tipoActivos", component: TiposActivosComponent, canActivate: [AuthGuard] },
      { path: "tipoActivos/:id", component: TipoActivoComponent, canActivate: [AuthGuard] },
      { path: "tipoProveedores", component: TiposProveedoresComponent, canActivate: [AuthGuard] },
      { path: "tipoProveedores/:id", component: TipoProveedorComponent, canActivate: [AuthGuard] },
      { path: "proveedores", component: ProveedoresComponent, canActivate: [AuthGuard] },
      { path: "proveedores/:id", component: ProveedorComponent, canActivate: [AuthGuard] },
      { path: "transportes", component: TransportesComponent, canActivate: [AuthGuard] },
      { path: "transportes/:id", component: TransporteComponent, canActivate: [AuthGuard] },
      { path: "rutas", component: RutasComponent, canActivate: [AuthGuard] },
      { path: "rutas/:id", component: RutaComponent, canActivate: [AuthGuard] },
      { path: "servicios", component: ServiciosComponent, canActivate: [AuthGuard] },
      { path: "servicios/:id", component: ServicioComponent, canActivate: [AuthGuard] },
      { path: "empleados", component: EmpleadosComponent, canActivate: [AuthGuard] },
      { path: "empleados/:id", component: EmpleadoComponent, canActivate: [AuthGuard] },
      { path: "asesores", component: AsesoresComponent, canActivate: [AuthGuard] },
      { path: "asesores/:id", component: AsesorComponent, canActivate: [AuthGuard] },
      { path: "tarifas", component: TarifasComponent, canActivate: [AuthGuard] },
      { path: "tarifas/:id", component: TarifaComponent, canActivate: [AuthGuard] },

      /* Taller */
      { path: "tipoReparaciones", component: TiposReparacionesComponent, canActivate: [AuthGuard] },
      { path: "tipoReparaciones/:id", component: TipoReparacionesComponent, canActivate: [AuthGuard] },
      { path: "reparaciones", component: ReparacionesComponent, canActivate: [AuthGuard] },
      { path: "reparaciones/:id", component: ReparacionComponent, canActivate: [AuthGuard] },
      { path: "pilotosTipos", component: PilotosTiposComponent, canActivate: [AuthGuard] },
      { path: "pilotosTipos/:id", component: PilotoTipoComponent, canActivate: [AuthGuard] },
      { path: "tiposEquiposRemolques", component: TiposEquiposRemolquesComponent, canActivate: [AuthGuard] },
      { path: "tiposEquiposRemolques/:id", component: TipoEquipoRemolqueComponent, canActivate: [AuthGuard] },
      { path: "tiposVehiculos", component: TiposVehiculosComponent, canActivate: [AuthGuard] },
      { path: "tiposVehiculos/:id", component: TipoVehiculoComponent, canActivate: [AuthGuard] },
      { path: "tiposGeneradores", component: TiposGeneradorComponent, canActivate: [AuthGuard] },
      { path: "tiposGeneradores/:id", component: TipoGeneradorComponent, canActivate: [AuthGuard] },
      { path: "tiposMecanicos", component: TiposMecanicosComponent, canActivate: [AuthGuard] },
      { path: "tiposMecanicos/:id", component: TipoMecanicoComponent, canActivate: [AuthGuard] },
      { path: "pilotos", component: PilotosComponent, canActivate: [AuthGuard] },
      { path: "pilotos/:id", component: PilotoComponent, canActivate: [AuthGuard] },
      { path: "mecanicos", component: MecanicosComponent, canActivate: [AuthGuard] },
      { path: "mecanicos/:id", component: MecanicoComponent, canActivate: [AuthGuard] },

      /* Bodega*/
      { path: "invCategorias", component: InventarioCategoriasComponent, canActive: [AuthGuard] },
      { path: "invCategorias/:id", component: InventarioCategoriaComponent, canActive: [AuthGuard] },
      { path: "invSubCategorias", component: InventarioSubcategoriasComponent, canActive: [AuthGuard] },
      { path: "invSubCategorias/:id", component: InventarioSubcategoriaComponent, canActive: [AuthGuard] },
      { path: "medidas", component: MedidasComponent, canActive: [AuthGuard] },
      { path: "medidas/:id", component: MedidaComponent, canActive: [AuthGuard] },
      { path: "productos", component: ProductosComponent, canActive: [AuthGuard] },
      { path: "productos/:id", component: ProductoComponent, canActive: [AuthGuard] },

      /* Otros */
      {
        path: "ajustes",
        component: AjustesComponent,
        canActivate: [AuthGuard]
      },
      { path: "", redirectTo: "ajustes", pathMatch: "full" },
      { path: "404", component: Error404Component },
      { path: "**", redirectTo: "404", pathMatch: "full" },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogosRoutingModule { }
