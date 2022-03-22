import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { Reparacion } from 'src/app/@catalogos/data/models/reparacion';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones, MenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador, Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InspeccionIngresoVehiculo } from '../../data/models/condicionTallerVehiculo';
import { DetalleInspeccion } from '../../data/models/detalleCondicion';
import { InspeccionIngresoVehiculosService } from '../../data/services/inspeccion-ingreso-vehiculos.service';

@Component({
  selector: 'app-inspeccion-ingreso-vehiculo',
  templateUrl: './inspeccion-ingreso-vehiculo.component.html',
  styleUrls: ['./inspeccion-ingreso-vehiculo.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})
export class InspeccionIngresoVehiculoComponent extends BaseComponent implements OnInit {
  imgRecursoFotos: ImagenRecursoConfiguracion = null;
  formEncabezado: FormGroup;
  formDetalle: FormGroup;
  formPiloto: FormGroup;
  formEquipo: FormGroup;
  formDetalleInspeccion: FormGroup;
  listaDetalleReparaciones: DetalleInspeccion[] = [];

  //Input Empleado
  filtrosAplicarEmpleados: QueryFilter[] = [];
  filtrosEmpleados: FiltrosC[] = [];
  columnasEmpleado: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  //Input Vehiculo
  filtrosAplicarVehiculo: QueryFilter[] = [];
  filtrosVehiculo: FiltrosC[] = [];
  columnasVehiculo: ColumnaTabla[] = [
    { titulo: 'Código', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  //Input Reparacion
  filtrosAplicarReparaciones: QueryFilter[] = [];
  filtrosReparaciones: FiltrosC[] = [];
  columnasReparaciones: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Descripción', target: ['descripcion'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  //DetalleInspeccion
  cargandoDetalle: boolean = true;
  columnasDetalle: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
    { titulo: 'Fecha', target: ['fechaCreacion'], tipo: 'fecha', aligment: 'left', visible: true },
    { titulo: 'Código', target: ['reparaciones', 'codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombre', target: ['reparaciones', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Cantidad', target: ['cantidad'], tipo: 'fecha', aligment: 'left', visible: true },
    { titulo: 'Autorizado', target: ['aprobado'], tipo: 'boolean', aligment: 'left', visible: true },
    { titulo: 'Autoriza', target: ['nombreAutoriza'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Fecha De Autorizado', target: ['fechaAprobacion'], tipo: 'fecha', aligment: 'left', visible: true },
    { titulo: 'Observaciones', target: ['observaciones'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Usuario Autoriza', target: ['usuarioAutoriza', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Registrado Por', target: ['usuarios', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
  ];
  datosDetalle = new BehaviorSubject<DetalleInspeccion[]>([]);
  paginadorDetalle = new BehaviorSubject<Paginador>(null);
  opcionesDetalle: MenuOpciones[] = [];

  constructor(protected s: InspeccionIngresoVehiculosService, protected sw: SweetService,
    protected ar: ActivatedRoute, protected formBuilder: FormBuilder, protected r: Router) {
    super("Condición Ingreso Vehículo", s, sw, ar);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.s.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
      case 3:
        this.modificarRegistro();
        break;
    }
  }

  eventosTablaDetalleInspeccion(event: EventoMenuOpciones) {
    console.log(event);
    let detalle = event.objeto as DetalleInspeccion;
    if (detalle.aprobado === true) {
      this.sw.sweet_alerta("Error", "La reparacion ya se encuentra aprobada", "error");
      return;
    }

    if (detalle.aprobado === false) {
      this.sw.sweet_alerta("Error", "La reparacion ya se encuentra rechazada", "error");
      return;
    }

    switch (event.idEvento) {
      case 1: //Autorizar
        this.sw.sweet_input(`¿Desea autorizar la reparación ${detalle.reparaciones.codigo} - ${detalle.reparaciones.nombre}?`, `Ingrese el nombre de la persona que autoriza la reparación.`,
          'text', 'Debe ingresar el nombre de la persona que autoriza la reparación', true).then(res => {
            if (res) {
              detalle.nombreAutoriza = res as string;
              delete detalle.reparaciones;
              delete detalle.usuarioAutoriza;
              delete detalle.usuarios;
              this.s.autorizarReparacion(detalle).subscribe(res => {
                this.sw.sweet_notificacion("Registro Actualizado", 5000, 'success');
                this.cargarDetalle();
              }, (error) => {
                console.log(error);
                this.sw.sweet_Error(error);
              });
            }
          });
        break;
      case 2: //Rechazar
        this.sw.sweet_input(`¿Desea rechazar la reparación ${detalle.reparaciones.codigo} - ${detalle.reparaciones.nombre}?`, `Ingrese el nombre de la persona que rechaza la reparación.`,
          'text', 'Debe ingresar el nombre de la persona que rechaza la reparación', true).then(res => {
            if (res) {
              detalle.nombreAutoriza = res as string;
              this.s.rechazarReparacion(detalle).subscribe(res => {
                this.sw.sweet_notificacion("Registro Actualizado", 5000, 'success');
                this.cargarDetalle();
              }, (error) => {
                console.log(error);
                this.sw.sweet_Error(error);
              });
            }
          });
        break;
    }
  }

  eventoPaginadorDetalle(event: EventoPaginador) {
    this.queryFilters.forEach(f => {
      if (f.filtro == "PageNumber") {
        f.parametro = event.noPagina;
      }
    });
    this.cargarDetalle();
  }

  cargarComponent() {
    this.cargandoDatosDelComponente = true;

    /* IMPLEMENTAR CUANDO EL RECURSO DE FOTOS ESTE DISPONIBLE */
    // this.s.getImagenRecursoConfiguracion("").subscribe(res => {
    //   this.imgRecursoFotos = res;
    //   this.configurarFormulario();
    // }, (error) => {
    //   console.log(error);
    //   this.sw.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
    //   this.configurarFormulario();
    // });

    //Empleados
    this.filtrosAplicarEmpleados = [{ filtro: "idEmpresa", parametro: this.service.getEmpresa().id }, { filtro: "estado", parametro: "1" }];

    this.filtrosEmpleados = [{
      activo: true,
      nombre: "Nombre",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "nombres", parametro: "" }],
      valores: [],
      tipoInput: "string"
    }];

    //Vehiculos
    this.filtrosAplicarVehiculo.push({ filtro: "idEmpresa", parametro: this.service.getEmpresa().id });
    this.filtrosVehiculo.push({
      activo: true,
      nombre: "Placa",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "placa", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });
    this.filtrosVehiculo.push({
      activo: false,
      nombre: "Equipo Activo",
      filters: [{ filtro: "equipoActivo", parametro: true }],
      tipo: "lista",
      requerido: true,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Si", valor: true },
        { nombre: "No", valor: false }]
    });

    //Reparaciones
    this.filtrosAplicarReparaciones.push({ filtro: "idEmpresa", parametro: this.service.getEmpresa().id });
    this.filtrosReparaciones.push({
      activo: true,
      nombre: "Código",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "codigo", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });
    this.filtrosReparaciones.push({
      activo: true,
      nombre: "Nombre",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "nombre", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });

    //DetalleReparaciones
    this.opcionesDetalle.push({ icono: "verified_user", nombre: "Autorizar Reparación", disponible: this.opcionDisponible('Autorizar Reparación'), idEvento: 1 });
    this.opcionesDetalle.push({ icono: "gpp_bad", nombre: "Rechazar Reparación", disponible: this.opcionDisponible('Rechazar Reparación'), idEvento: 2 });
    this.queryFilters = [{ filtro: "PageNumber", parametro: 1 }];
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [""],
      idActivo: ["", [Validators.required]],
      idEmpleado: ["", [Validators.required]],
      //idUsuario: ["", [Validators.required]], Token
      idEstacionTrabajo: ["", [Validators.required]],
      tipoActivo: ["V", [Validators.required]],
      serie: ["", [Validators.required]],
      numero: ["", [Validators.required]],
      fechaIngreso: ["", [Validators.required]],
      fechaSalida: [null],
      fechaRechazo: [null],

      //Detalle
      vidrios: [null],
      llantas: [null],
      tanqueCombustible: [null],
      observaciones: [null],

      detalleInspeccion: [""],

      fotos: [""]
    });

    this.formEncabezado = this.formBuilder.group({
      idEstacionTrabajo: [this.s.getEstacionTrabajo().id, [Validators.required]],
      serie: ["", [Validators.required]],
      numero: ["", [Validators.required]],
      fechaIngreso: ["", [Validators.required]],
      fechaSalida: [null],
      fechaRechazo: [null],
      fechaCreacion: [null],
    });

    this.formPiloto = this.formBuilder.group({
      idEmpleado: ["", [Validators.required]],
      empleados: [""],
    });

    this.formEquipo = this.formBuilder.group({
      idActivo: ["", [Validators.required]],
      vehiculos: [""],
    });

    this.formDetalle = this.formBuilder.group({
      vidrios: [null],
      llantas: [null],
      tanqueCombustible: [null],
      observaciones: [null],
    });

    this.formDetalleInspeccion = this.formBuilder.group({
      idCondicion: ["", [Validators.required]],
      idReparacion: ["", [Validators.required]],
      reparacion: [],
      cantidad: ["", [Validators.required]],
      aprobado: [""],
      nombreAutoriza: [""],
      observaciones: [""],
      fechaAprobado: [""],
      fechaEstimadoReparacion: ["", [Validators.required]],
      fechaFinalizacionRep: [""],
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.rutaComponent = this.r.url;
    this.cargandoDatosDelComponente = true;
    this.header.opciones = [{ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' }];
    if (this.validarParametro("id")) {
      this.s.consultar<InspeccionIngresoVehiculo>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          this.form.patchValue(res);
          this.formEncabezado.patchValue(res);
          this.formPiloto.patchValue(res);
          this.formEquipo.patchValue(res);
          this.formDetalle.patchValue(res);
          this.cargarDetalle();
        }, (error) => {
          console.log(error);
          if (error.status == 404) {
            this.sweetService.sweet_alerta("Error", "Registro no existe.", "error");
            this.header.opciones[1].disponible = this.opcionDisponible("Agregar");
            this.header.opciones[1].nombre = "Guardar";
            this.header.opciones[1].idEvento = 2;
            this.cargandoDatosDelComponente = false;
            return;
          }
          this.sweetService.sweet_Error(error);
        });
    } else {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' })
      this.cargandoDatosDelComponente = false;
    }
  }

  cargarDetalle() {
    this.s.getDetalleInspeccion(this.form.controls["id"].value, this.queryFilters).subscribe(res => {
      this.datosDetalle.next(res.aguilaData);
      this.configurarPaginador(res);
      this.cargandoDatosDelComponente = false;
      this.cargandoDetalle = false;
      this.sw.sweet_notificacion("Listo", 1500, "info");
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_alerta("Error", "Error al consultar detalle. " + error, "error");

    });
  }

  configurarPaginador(res: any): void {
    var pa: number[] = [];
    for (let i = res.meta.currentPage - 2; i <= res.meta.currentPage + 2; i++) {
      if (i > 0 && i <= res.meta.totalPages) {
        pa.push(i);
      }
    }
    let paginador = res.meta as Paginador;
    paginador.paginas = pa;
    this.paginadorDetalle.next(paginador);
  }

  setActivo(vehiculo: Vehiculo) {
    if (vehiculo) {
      this.formEquipo.controls["idActivo"].setValue(vehiculo.idActivo);
      this.formEquipo.controls["vehiculos"].setValue(vehiculo);
    } else {
      this.formEquipo.reset();
    }
  }

  setEmpleado(empleado: Empleado) {
    if (empleado) {
      this.formPiloto.controls["idEmpleado"].setValue(empleado.id);
      this.formPiloto.controls["empleados"].setValue(empleado);
    } else {
      this.formPiloto.reset();
    }
  }

  reiniciarFormularios() {
    this.form.controls["id"].enable();

    this.form.reset();
    this.formEncabezado.reset();
    this.formEquipo.reset();
    this.formPiloto.reset();
    this.formDetalle.reset();

    this.form.controls['tipoActivo'].setValue("V");
    this.formEncabezado.controls['idEstacionTrabajo'].setValue(this.s.getEstacionTrabajo().id);
  }

  setReparacion(reparacion: Reparacion) {
    console.log(reparacion);
    if (reparacion) {
      this.formDetalleInspeccion.controls["idReparacion"].setValue(reparacion.id);
      this.formDetalleInspeccion.controls["reparacion"].setValue(reparacion);
    } else {
      this.formDetalleInspeccion.controls["idReparacion"].setValue(null);
      this.formDetalleInspeccion.controls["reparacion"].setValue(null);
    }
  }

  guardarRegistro() {
    this.form.patchValue(this.formEncabezado.value);
    this.form.patchValue(this.formPiloto.value);
    this.form.patchValue(this.formEquipo.value);
    this.form.patchValue(this.formDetalle.value);
    this.form.controls["id"].disable();
    if (this.form.valid) {
      this.s.crear(this.form.value).subscribe((res: any) => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.reiniciarFormularios();
        this.sw.sweet_confirmacion("Registro Guardado", "¿Desea agregar detalles a la condición?", 'question').then(resSW => {
          if (resSW.isConfirmed) {
            this.s.navegar([this.rutaComponent, res.id]);
            this.cargarDatos();
          }
        });
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
      this.formEncabezado.markAllAsTouched();
      this.formPiloto.markAllAsTouched();
      this.formEquipo.markAllAsTouched();
      this.formDetalle.markAllAsTouched();
    }
  }

  modificarRegistro() {
    this.form.controls["id"].enable();
    if (this.form.valid) {
      this.s.modificar(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.cargarDatos();
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
      this.formEncabezado.markAllAsTouched();
      this.formPiloto.markAllAsTouched();
      this.formEquipo.markAllAsTouched();
      this.formDetalle.markAllAsTouched();
    }
  }

  guardarDetalleInspeccion() {
    this.formDetalleInspeccion.controls['idCondicion'].setValue(this.form.controls["id"].value);

    if (this.formDetalleInspeccion.valid) {
      this.s.agregarDetalleInspeccion(this.formDetalleInspeccion.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.formDetalleInspeccion.reset();
        this.cargarDetalle();
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      })
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.formDetalleInspeccion.markAllAsTouched();
    }
  }
}
