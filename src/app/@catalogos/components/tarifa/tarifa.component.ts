import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { LatLng } from 'src/app/@page/models/latlng';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { DataClienteTarifa } from '../../data/models/dataClienteTarifa';
import { Lista } from '../../data/models/lista';
import { Ruta } from '../../data/models/ruta';
import { Servicio } from '../../data/models/servicio';
import { TipoLista } from '../../data/models/tipoLista';
import { Ubicacion } from '../../data/models/ubicacion';
import { ClienteTarifaService } from '../../data/services/cliente-tarifa.service';
import { ListaService } from '../../data/services/lista.service';
import { RutaService } from '../../data/services/ruta.service';
import { TarifaService } from '../../data/services/tarifa.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { UbicacionService } from '../../data/services/ubicacion.service';
import { ClienteTarifaComponent } from '../cliente/cliente-tarifa.component';
import { RutasComponent } from '../ruta/rutas.component';
import { UbicacionesComponent } from '../ubicacion/ubicaciones.component';

@Component({
  selector: 'app-tarifa',
  templateUrl: './tarifa.component.html',
  styleUrls: ['./tarifa.component.css']
})
export class TarifaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  idEmpresa: number;
  mostrarRutas: boolean = false;

  TL_TipoCarga: TipoLista;
  TL_TipoMovimiento: TipoLista;
  TL_TipoViaje: TipoLista;
  TL_Segmento: TipoLista;

  listaTipoCarga: Lista[];
  listaTipoMovimiento: Lista[];
  listaTipoViaje: Lista[];
  listaSegmento: Lista[];

  ubicacionOrigen: Ubicacion;
  ubicacionDestino: Ubicacion;
  ruta: Ruta;
  origen: LatLng;
  destino: LatLng;
  ubicaciones: LatLng[] = [];
  servicio: Servicio;

  header: ItemHeaderComponent = {
    titulo: 'Tarifa',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  colTipoEquipoRemolque: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  codErrores = {
    codigo: "*Campo Requerido",
    tipoCarga: "",
    tipoMovimiento: "",
    tipoViaje: "",
    segmento: "",
    combustibleGls: "",
    precio: "",
    kmRecorridosCargado: "",
    kmRecorridosVacio: "",
    esEspecializado: "",
    fechaVigencia: "",
  };

  public colClientetarifa: Columna[] = [
    { nombre: 'Código de Cliente', targetOpt: ['cliente', 'codigo'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Cliente', targetOpt: ['cliente', 'entidadComercial', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Precio Pactado', targetId: 'precio', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' },
    { nombre: 'Vigente Hasta', targetId: 'vigenciaHasta', tipo: 'fecha', aligment: 'center' },
  ];

  constructor(private serviceComponent: TarifaService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private tipoListaService: TipoListaService, private listaService: ListaService,
    private ubicacionService: UbicacionService, private rutaService: RutaService,
    private clienteTarifaService: ClienteTarifaService, public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.rutaService.getCargando().pipe(first(val => val == false)),
      this.ubicacionService.getCargando().pipe(first(val => val == false)),
      this.tipoListaService.getCargando().pipe(first(val => val == false)),
      this.listaService.getCargando().pipe(first(val => val == false)),
      this.clienteTarifaService.getCargando()
    ]).subscribe(() => this.validarPermiso(), (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar los servicios", 'error');
      this.serviceComponent.paginaAnterior();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.serviceComponent.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
      case 3:
        this.modificarRegistro();
        break;
    }
  }

  cargarComponent() {
    if (this.isNuevo()) {
      this.header.opciones.push({
        icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'),
        idEvento: 2, toolTip: 'Guardar Registro', color: 'primary'
      });
    } else {
      this.header.opciones.push({
        icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'),
        idEvento: 3, toolTip: 'Guardar Registro', color: 'primary'
      });
    }
    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });

    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
      this.cargarTipoListas();
      this.clienteTarifaService.setDatos([]);
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "No es posible acceder a la empresa", 'error');
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarTipoListas() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoCarga").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoMovimiento").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoViaje").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "segmentoTarifa").pipe(first()),
    ]).subscribe(res => {
      this.TL_TipoCarga = res[0][0];
      this.TL_TipoMovimiento = res[1][0];
      this.TL_TipoViaje = res[2][0];
      this.TL_Segmento = res[3][0];
      this.cargarListas();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Tipos de Lista");
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_TipoCarga.id, this.idEmpresa).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoMovimiento.id, this.idEmpresa).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoViaje.id, this.idEmpresa).pipe(first()),
      this.listaService.cargarPagina(this.TL_Segmento.id, this.idEmpresa).pipe(first()),
    ]).subscribe(res => {
      this.listaTipoCarga = res[0];
      this.listaTipoMovimiento = res[1];
      this.listaTipoViaje = res[2];
      this.listaSegmento = res[3];
      this.configurarFormulario();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Listas");
      this.serviceComponent.paginaAnterior();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigo: [""],
      tipoCarga: [""],
      tipoMovimiento: [""],
      segmento: [""],
      idUbicacionOrigen: [""],
      idUbicacionDestino: [""],
      idRuta: [""],
      idServicio: [""],
      idEmpresa: [this.idEmpresa],
      combustibleGls: [""],
      precio: [""],
      kmRecorridosCargado: [""],
      kmRecorridosVacio: [""],
      esEspecializado: [""],
      tipoViaje: [""],
      fechaVigencia: [""],
    });

    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl());
      this.form.addControl("servicio", new FormControl());
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).subscribe(tarifa => {
      this.form.setValue(tarifa);
      if (tarifa.idRuta) {
        this.cargarUbicacionesRutas();
      } else {
        this.bloquearInputs();
        this.cargandoDatos = false;
      }
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar el registro", "error");
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarUbicacionesRutas() {
    forkJoin([
      this.ubicacionService.getId(this.form.controls["idUbicacionOrigen"].value).pipe(first()),
      this.ubicacionService.getId(this.form.controls["idUbicacionDestino"].value),
      this.rutaService.getId(this.form.controls["idRuta"].value).pipe(first())
    ]).subscribe(res => {
      this.ubicacionOrigen = res[0];
      this.ubicacionDestino = res[1];
      this.ruta = res[2];

      if (this.ubicacionOrigen.latitud && this.ubicacionOrigen.longitud) {
        this.origen = { nombre: "Ubicación de Origen", latitud: this.ubicacionOrigen.latitud, longitud: this.ubicacionOrigen.longitud }
      }
      if (this.ubicacionDestino.latitud && this.ubicacionDestino.longitud) {
        this.destino = { nombre: "Ubicación de Destino", latitud: this.ubicacionDestino.latitud, longitud: this.ubicacionDestino.longitud }
      }
      this.bloquearInputs();
      this.agregarUbicaciones();

      let f: QueryFilter[] = [];
      f.push({ filtro: "PageNumber", parametro: 1 });
      f.push({ filtro: "idTarifa", parametro: this.form.controls["id"].value });
      f.push({ filtro: "activa", parametro: true });
      this.clienteTarifaService.cargarPagina(f);
    });
  }

  abrirModalUbicacionOrigen() {
    this.ubicacionService.abrirModal(false, "Seleccione una Ubicación", UbicacionesComponent).subscribe((res: Ubicacion[]) => {
      if (res) {
        if (res[0].latitud && res[0].longitud) {
          this.origen = { nombre: "Ubicación de Origen", latitud: res[0].latitud, longitud: res[0].longitud };
          this.agregarUbicaciones();
        }
        this.form.controls['idUbicacionOrigen'].setValue(res[0].id);
        this.ubicacionOrigen = res[0];
      }
    });
  }

  abrirModalUbicacionDestino() {
    this.ubicacionService.abrirModal(false, "Seleccione una Ubicación", UbicacionesComponent).subscribe((res: Ubicacion[]) => {
      if (res) {
        if (res[0].latitud && res[0].longitud) {
          this.destino = { nombre: "Ubicación de Destino", latitud: res[0].latitud, longitud: res[0].longitud };
          this.agregarUbicaciones();
        }
        this.form.controls['idUbicacionDestino'].setValue(res[0].id);
        this.ubicacionDestino = res[0];
      }
    });
  }

  abrirModalRutas() {
    this.rutaService.abrirModal(false, "Seleccione una Ruta", RutasComponent, this.idEmpresa).subscribe((res: Ruta[]) => {
      if (res) {
        this.ruta = res[0];
        this.form.controls["idRuta"].setValue(this.ruta.id);
        this.agregarUbicaciones();
      }
    })
  }

  agregarUbicaciones() {
    let ub = [];
    if (this.origen) {
      ub.push(this.origen);
      if (this.ruta) {
        forkJoin([
          this.ubicacionService.getId(this.ruta.idUbicacionOrigen).pipe(first()),
          this.ubicacionService.getId(this.ruta.idUbicacionDestino).pipe(first()),
        ]).subscribe(res => {
          let ro: LatLng = { nombre: "Ruta Origen", latitud: res[0].latitud, longitud: res[0].longitud };
          let rd: LatLng = { nombre: "Ruta Destino", latitud: res[1].latitud, longitud: res[1].longitud };
          ub.push(ro);
          ub.push(rd);
          //this.ubicaciones.push({ nombre: "Ruta Origen", latitud: res[0].latitud, longitud: res[0].longitud });
          //this.ubicaciones.push({ nombre: "Ruta Destino", latitud: res[1].latitud, longitud: res[1].longitud });
          if (this.destino) {
            ub.push(this.destino)
          }
          this.ubicaciones = ub;
        })
      }
    }
    this.cargandoDatos = false;

  }

  getUbicacionString(ubicacion: Ubicacion): string {
    if (ubicacion) {
      return `${ubicacion.lugar}, ${ubicacion.esPuerto ? 'Es Puerto' : 'No Es Puerto'}, 
      Cód. Postal ${ubicacion.codigoPostal}, `;
    } else {
      return "";
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Completado",
          "Registro guardado"
        );
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  getClienteTarifa() {
    return this.clienteTarifaService.getDatos();
  }

  getPaginadorCT() {
    return this.clienteTarifaService.getPaginador();
  }

  eventoPaginadorCT(event: EventoPaginador) {
    let f: QueryFilter[] = [];
    f.push({ filtro: "PageNumber", parametro: event.noPagina });
    f.push({ filtro: "idTarifa", parametro: this.form.controls["id"].value });
    f.push({ filtro: "activa", parametro: true });
    this.clienteTarifaService.cargarPagina(f);
  }

  abrirModalClienteTarifa() {
    let datos: DataClienteTarifa = {
      objeto: this.form.value,
      titulo: 'Asignar Cliente A Tarifa',
      tipo: 'tarifa'
    }
    let dialogRef = this.dialog.open(ClienteTarifaComponent, {
      data: datos
    });

    dialogRef.afterClosed().pipe(first()).subscribe();
  }

  selectServicio(item: Servicio) {
    this.form.controls['idServicio'].setValue(item.id);
    this.mostrarRutas = item.ruta;
  }

  modificarRegistro() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        this.bloquearInputs();
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Agregar - Modificar - Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  bloquearInputs() {
    this.form.controls['fechaCreacion'].disable();
    this.form.controls['fechaVigencia'].disable();
    this.form.controls['codigo'].disable();
  }

  habilitarInputs() {
    this.form.controls['fechaCreacion'].enable();
    this.form.controls['codigo'].enable();
    this.form.controls['fechaVigencia'].enable();
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  errores(validaciones: []) {
    for (const validacion in validaciones) {
      var error = validaciones[validacion];
      for (const codError in this.codErrores) {
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
  }

}
