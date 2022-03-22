import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { EquipoRemolque } from 'src/app/@catalogos/data/models/equipoRemolque';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InspeccionContenedorService } from '../../data/services/inspeccion-contenedor.service';

@Component({
  selector: 'app-inspeccion-contenedor',
  templateUrl: './inspeccion-contenedor.component.html',
  styleUrls: ['./inspeccion-contenedor.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})
export class InspeccionContenedorComponent extends BaseComponent implements OnInit {

  imgRecursoFotos: ImagenRecursoConfiguracion = null;
  formCondicionActivo: FormGroup;
  formEquipo: FormGroup;
  formEmpleado: FormGroup;
  formDetalle: FormGroup;
  formDetalleRefrigerado: FormGroup;
  formAnotaciones: FormGroup;
  listaEstadosCondicion = new BehaviorSubject<Estados[]>([]);
  listaEstados: Estados[] = [];

  //Input Equipo
  filtrosAplicarEquipo: QueryFilter[] = [];
  filtrosEquipo: FiltrosC[] = [];
  columnasEquipo: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ['activoOperacion', 'coc'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  //Input Empleado
  filtrosAplicarEmpleados: QueryFilter[] = [];
  filtrosEmpleados: FiltrosC[] = [];
  columnasEmpleado: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  listaBooleanos: any[] = [
    { nombre: "✓", valor: true },
    { nombre: "X", valor: false },
  ]

  constructor(protected sw: SweetService, protected s: InspeccionContenedorService, protected r: Router, protected formBuilder: FormBuilder) {
    super("INSPECCION DE SEGURIDAD PARA CONTENEDORES", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  cargarComponent(): void {
    this.cargandoDatosDelComponente = true;
    this.headerComponent.opciones.push(
      { icono: 'clear', nombre: 'Regresar', disponible: true, idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn' },
      { icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' }
    );

    this.s.getImagenRecursoConfiguracion("Fotos").subscribe(res => {
      this.imgRecursoFotos = res;
      this.configurarFormulario();
    }, (error) => {
      this.configurarFormulario();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.s.paginaAnterior();
        break;
      case 2:
        this.guardarCondicion();
        break;
    }
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      condicionActivo: ["", [Validators.required]],

      tipoContenedor: ["S", [Validators.required]],
      exteriorMarcos: ["", [this.booleanValidator]],
      exteriorMarcosObs: [""],
      puertasInteriorExterior: ["", [this.booleanValidator]],
      puertasInteriorExteriorObs: [""],
      pisoInterior: ["", [this.booleanValidator]],
      pisoInteriorObs: [""],
      techoCubierta: ["", [this.booleanValidator]],
      techoCubiertaObs: [""],
      ladosIzquierdoDerecho: ["", [this.booleanValidator]],
      ladosIzquierdoDerechoObs: [""],
      paredFrontal: ["", [this.booleanValidator]],
      paredFrontalObs: [""],

      //Area Refrigerado
      areaCondesadorCompresor: [""],
      areaCondesadorCompresorObs: [""],
      areaEvaporador: [""],
      areaEvaporadorObs: [""],
      areaBateria: [""],
      areaBateriaObs: [""],
      cajaControlElectricoAutomatico: [""],
      cajaControlElectricoAutomaticoObs: [""],
      cablesConexionElectrica: [""],
      cablesConexionElectricaObs: [""],
    });

    this.formCondicionActivo = this.formBuilder.group({
      idUsuario: [this.s.getUsuarioActual().id],
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id],
      idActivo: ["", [Validators.required]],
      idEmpleado: ["", [Validators.required]],
      tipoCondicion: ["contenedor", [Validators.required]],
      movimiento: ["", [Validators.required]],
      idEstado: [1, [Validators.required]],
      fecha: [moment().format(this.s.getFormatoFechaHora()), [Validators.required]],

      observaciones: [""],

      ImagenFirmaPiloto: [""],
      fotos: [null]
    });

    this.formDetalle = this.formBuilder.group({
      exteriorMarcos: ["", [this.booleanValidator]],
      exteriorMarcosObs: [""],
      puertasInteriorExterior: ["", [this.booleanValidator]],
      puertasInteriorExteriorObs: [""],
      pisoInterior: ["", [this.booleanValidator]],
      pisoInteriorObs: [""],
      techoCubierta: ["", [this.booleanValidator]],
      techoCubiertaObs: [""],
      ladosIzquierdoDerecho: ["", [this.booleanValidator]],
      ladosIzquierdoDerechoObs: [""],
      paredFrontal: ["", [this.booleanValidator]],
      paredFrontalObs: [""],
    });

    this.formDetalleRefrigerado = this.formBuilder.group({
      areaCondesadorCompresor: ["", [this.booleanValidator]],
      areaCondesadorCompresorObs: [""],
      areaEvaporador: ["", [this.booleanValidator]],
      areaEvaporadorObs: [""],
      areaBateria: ["", [this.booleanValidator]],
      areaBateriaObs: [""],
      cajaControlElectricoAutomatico: ["", [this.booleanValidator]],
      cajaControlElectricoAutomaticoObs: [""],
      cablesConexionElectrica: ["", [this.booleanValidator]],
      cablesConexionElectricaObs: [""],
    });

    this.formEquipo = this.formBuilder.group({
      idActivo: ["", [Validators.required]],
      equipo: [""]
    });

    this.formEmpleado = this.formBuilder.group({
      idEmpleado: ["", [Validators.required]],
      empleado: [""]
    });

    this.formAnotaciones = this.formBuilder.group({
      fecha: [moment().format(this.s.getFormatoFechaHora()), [Validators.required]],
      movimiento: ["", [Validators.required]],
      //idEstado: ["", [Validators.required]],
      observaciones: [""],
    });

    this.formAnotaciones.controls["movimiento"].valueChanges.subscribe(res => {
      if (res == "Salida") {
        this.listaEstadosCondicion.next(this.listaEstados.filter(e => e.evento.toLowerCase().includes("condicionsalida")))
      }
      if (res == "Ingreso") {
        this.listaEstadosCondicion.next(this.listaEstados.filter(e => e.evento.toLowerCase().includes("condicioningreso")))
      }
    });

    this.formDetalle.valueChanges.subscribe(res => {
      if (this.formDetalle.valid) {
        this.form.patchValue(this.formDetalle.value);
      }
    });

    this.formDetalleRefrigerado.valueChanges.subscribe(res => {
      if (this.formDetalleRefrigerado.valid) {
        this.form.patchValue(this.formDetalleRefrigerado.value);
      }
    });

    this.formEmpleado.valueChanges.subscribe(res => {
      if (this.formEmpleado.valid) {
        this.formCondicionActivo.patchValue(this.formEmpleado.value);
      }
    });

    this.formEquipo.valueChanges.subscribe(res => {
      if (this.formEquipo.valid) {
        this.formCondicionActivo.patchValue(this.formEquipo.value);
      }
    });

    this.formAnotaciones.valueChanges.subscribe(res => {
      if (this.formAnotaciones.valid) {
        this.formCondicionActivo.patchValue(this.formAnotaciones.value);
      }
    });

    this.formCondicionActivo.valueChanges.subscribe(res => {
      if (this.formCondicionActivo.valid) {
        this.form.controls["condicionActivo"].setValue(this.formCondicionActivo.value);
      } else {
        this.form.controls["condicionActivo"].setValue(null);
      }
    });

    this.cargarDatos();
  }

  cargarDatos() {
    // forkJoin([
    //   this.s.getEstadosCondiciones().pipe(first())
    // ]).subscribe(res => {
    //   this.listaEstados = res[0];
    //   this.cargandoDatosDelComponente = false;
    // }, (error) => {
    //   console.log(error);
    //   this.sweetService.sweet_alerta("Error", "No es posible cargar los estados, vuelva a intentarlo más tarde.", "error");
    // });

    this.cargandoDatosDelComponente = false;
  }

  guardarCondicion() {
    if (this.form.valid) {
      this.s.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Inspección Registrada");

      }, (error) => {
        console.log(error);
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      console.log(this.form.value);

    }
  }

  getEquipo(equipo: EquipoRemolque) {
    if (equipo) {
      this.formEquipo.controls['idActivo'].setValue(equipo.activoOperacion.id);
      this.formEquipo.controls['equipo'].setValue(equipo);
    } else {
      this.formEquipo.reset();
    }
  }

  getEmpleado(empleado: Empleado) {
    if (empleado) {
      this.formEmpleado.controls['idEmpleado'].setValue(empleado.id);
      this.formEmpleado.controls['empleado'].setValue(empleado);
    } else {
      this.formEmpleado.reset();
    }
  }
}
