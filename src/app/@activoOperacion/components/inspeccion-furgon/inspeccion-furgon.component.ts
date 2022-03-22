import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { EquipoRemolque } from 'src/app/@catalogos/data/models/equipoRemolque';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { CondicionLlanta } from '../../data/models/condicionLlanta';
import { CondicionFurgonService } from '../../data/services/condicion-furgon.service';

@Component({
  selector: 'app-inspeccion-furgon',
  templateUrl: './inspeccion-furgon.component.html',
  styleUrls: ['./inspeccion-furgon.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})
export class InspeccionFurgonComponent implements OnInit {

  form: FormGroup;
  formCondicionActivo: FormGroup;
  private formatoFechaHora: string = environment.formatoFechaHora;
  imgRecursoFotos: ImagenRecursoConfiguracion = null;
  estadosCondicion: Estados[] = [];
  cargando: boolean = true;

  listaEstados: any[] = [
    { nombre: "Bueno", valor: "B" },
    { nombre: "Regular", valor: "R" },
    { nombre: "Malo", valor: "M" },
    //{ nombre: "No Tiene", valor: "NT" },
  ];

  listaEstadosBM: any[] = [
    { nombre: "Bueno", valor: "B" },
    { nombre: "Malo", valor: "M" },
  ]

  listaBooleanos: any[] = [
    { nombre: "Si", valor: true },
    { nombre: "No", valor: false },
  ]

  //Input Empleado
  filtrosAplicarEmpleados: QueryFilter[] = [];
  filtrosEmpleados: FiltrosC[] = [];
  columnasEmpleado: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
  ]

  //Input Equipo
  filtrosAplicarEquipo: QueryFilter[] = [];
  filtrosEquipo: FiltrosC[] = [];
  columnasEquipo: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ['activoOperacion', 'coc'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  constructor(private formBuilder: FormBuilder, private service: CondicionFurgonService,
    private sweetService: SweetService,) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.service.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
    }
  }

  cargarComponent() {
    let opt: any[] = [
      { icono: 'clear', nombre: 'Regresar', disponible: true, idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn' },
      { icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' }
    ];

    this.service.setConfiguracionComponent({
      header: {
        titulo: "Inspección De Furgón",
        opciones: opt
      },
      isModal: false,
    });

    this.service.getImagenRecursoConfiguracion("Fotos").subscribe(res => {
      this.imgRecursoFotos = res;
      this.cargarDatosInputs();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.cargarDatosInputs();
    });

  }

  cargarDatosInputs() {
    forkJoin([
      this.service.getTiposEquiposRemolque(),
    ]).subscribe(res => {
      //Empleados
      this.filtrosAplicarEmpleados.push({ filtro: "idEmpresa", parametro: this.service.getEmpresa().id });
      this.filtrosAplicarEmpleados.push({ filtro: "estado", parametro: "1" });
      this.filtrosEmpleados.push({
        activo: true,
        nombre: "Nombre",
        requerido: false,
        tipo: "input",
        filters: [{ filtro: "nombres", parametro: "" }],
        valores: [],
        tipoInput: "string"
      });

      //Equipo Remolque
      this.filtrosEquipo.push(
        {
          activo: true, nombre: "Tipo Equipo Remolque", requerido: true, tipo: "lista",
          filters: [{ filtro: "idEquipoRemolque", parametro: "" }],
          valores: res[0].aguilaData.filter(te => { if (te.prefijo.startsWith("FU")) return true }).map(te => { return { nombre: te.prefijo + "-" + te.descripcion, valor: te.id } })
        }
      );

      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      //Revision Externa
      revExtGolpe: ["", [this.booleanValidator]],
      revExtSeparacion: ["", [this.booleanValidator]],
      revExtRoturas: ["", [this.booleanValidator]],

      //Revision Interna
      revIntGolpes: ["", [this.booleanValidator]],
      revIntSeparacion: ["", [this.booleanValidator]],
      revIntFiltra: ["", [this.booleanValidator]],
      revIntRotura: ["", [this.booleanValidator]],
      revIntPisoH: ["", [this.booleanValidator]],
      revIntManchas: ["", [this.booleanValidator]],
      revIntOlores: ["", [this.booleanValidator]],

      //Revision de Puertas
      revPuertaCerrado: ["", [Validators.required]],
      revPuertaEmpaque: ["", [Validators.required]],
      revPuertaCinta: ["", [Validators.required]],

      //Limpieza
      limpPiso: ["", [this.booleanValidator]],
      limpTecho: ["", [this.booleanValidator]],
      limpLateral: ["", [this.booleanValidator]],
      limpExt: ["", [this.booleanValidator]],
      limpPuerta: ["", [this.booleanValidator]],
      limpMancha: ["", [this.booleanValidator]],
      limpOlor: ["", [this.booleanValidator]],
      limpRefuerzo: ["", [this.booleanValidator]],

      //Luces
      lucesA: ["", [this.booleanValidator]],
      lucesB: ["", [this.booleanValidator]],
      lucesC: ["", [this.booleanValidator]],
      lucesD: ["", [this.booleanValidator]],
      lucesE: ["", [this.booleanValidator]],
      lucesF: ["", [this.booleanValidator]],
      lucesG: ["", [this.booleanValidator]],
      lucesH: ["", [this.booleanValidator]],
      lucesI: ["", [this.booleanValidator]],
      lucesJ: ["", [this.booleanValidator]],
      lucesK: ["", [this.booleanValidator]],
      lucesL: ["", [this.booleanValidator]],
      lucesM: ["", [this.booleanValidator]],
      lucesN: ["", [this.booleanValidator]],
      lucesO: ["", [this.booleanValidator]],

      //Guardafangos
      guardaFangosI: ["", [this.booleanValidator]],
      guardaFangosD: ["", [this.booleanValidator]],

      fricciones: ["", [Validators.required]],
      placaPatin: ["", [this.booleanValidator]],
      senalizacion: ["", [Validators.required]],

      condicionActivo: [""],
      condicionesLlantas: [""],
      condicionesLlantasRepuesto: [""]
    });

    this.formCondicionActivo = this.formBuilder.group({
      idActivo: ["", [Validators.required]],
      idEmpleado: ["", [Validators.required]],
      tipoCondicion: ["furgon", [Validators.required]],
      movimiento: ["", [Validators.required]],
      cargado: ["", [this.booleanValidator, Validators.required]],
      idEstado: ["", [Validators.required]],
      fecha: [moment().format(this.formatoFechaHora), [Validators.required]],
      disponible: ["", [this.booleanValidator, Validators.required]], //
      inspecVeriOrden: ["", [this.booleanValidator, Validators.required]],
      observaciones: [""], //
      noLlantas: [0],
      prefijo: [""],
      ImagenFirmaPiloto: [""],
      irregularidadesObserv: [""],
      ubicacionIdEntrega: [null], //Lista
      //Inputs del Sistema
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id],
      idUsuario: [this.service.getUsuario().id],
      //Otros
      empleados: [""],
      fotos: [null],
    });

    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin([
      this.service.getEstadosCondiciones().pipe(first())
    ]).subscribe(res => {
      this.estadosCondicion = res[0];
      this.cargando = false;
    });
  }

  getCondicionesLlantas(condiciones: CondicionLlanta[]) {
    this.form.controls["condicionesLlantas"].setValue(condiciones);
  }

  getCondicionesLlantasR(condiciones: CondicionLlanta[]) {
    this.form.controls["condicionesLlantasRepuesto"].setValue(condiciones);
  }

  getEquipo(equipoRemolque: EquipoRemolque) {//Input Equipo Remolque
    if (equipoRemolque) {
      this.formCondicionActivo.controls['idActivo'].setValue(equipoRemolque.idActivo);
      this.formCondicionActivo.controls['noLlantas'].setValue((Number.parseInt(equipoRemolque.noEjes)) * 4);
      this.formCondicionActivo.controls['prefijo'].setValue(equipoRemolque.activoOperacion.codigo.slice(0, 4));
      this.buscarUltimaInspeccion(equipoRemolque.activoOperacion.id);
    } else {
      this.formCondicionActivo.controls['idActivo'].setValue(null);
      this.formCondicionActivo.controls['noLlantas'].setValue(0);
      this.formCondicionActivo.controls['prefijo'].setValue("");
      this.form.controls["condicionesLlantas"].setValue([]);
      this.form.controls["condicionesLlantasRepuesto"].setValue([]);
    }
  }

  getEmpleado(empleado: Empleado) {
    if (empleado) {
      this.formCondicionActivo.controls['idEmpleado'].setValue(empleado.id);
      this.formCondicionActivo.controls['empleados'].setValue(empleado);
    } else {
      this.formCondicionActivo.controls['idEmpleado'].setValue(null);
      this.formCondicionActivo.controls['empleados'].setValue(null);
    }
  }

  buscarUltimaInspeccion(idActivo: number | string) {
    this.service.getUltimaCondicion(idActivo).subscribe(res => {
      this.form.patchValue(res);
    }, (error) => {
      this.form.reset();
      this.form.controls['condicionesLlantas'].setValue([]);
      this.form.controls['condicionesLlantasRepuesto'].setValue([]);
    });
  }

  guardarRegistro() {
    if (this.form.valid && this.formCondicionActivo.valid) {
      this.form.controls["condicionActivo"].setValue(this.formCondicionActivo.value);
      this.formCondicionActivo.controls["fecha"]
        .setValue(moment(this.formCondicionActivo.controls["fecha"].value).format(this.formatoFechaHora));
      this.service.crear(this.form.value).subscribe(res => {
        this.service.paginaAnterior();
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los datos", "error");
      this.form.markAllAsTouched();
      this.formCondicionActivo.markAllAsTouched();
    }
  }

  validarPermiso() {
    if (this.service.validarPermiso('Agregar')) {
      this.cargarComponent();
    } else {
      this.service.errorPermiso("Agregar");
      this.service.paginaAnterior();
    }
  }

  getNumeroLlantas() {
    return Number.parseInt(this.formCondicionActivo.controls["noLlantas"].value);
  }

  getPrefijo() {
    return this.formCondicionActivo.controls['prefijo'].value;
  }

  getFirma(firma) {
    this.formCondicionActivo.controls["ImagenFirmaPiloto"].setValue({
      imagenes: firma
    });
  }

  getListaEstados() {
    if (this.formCondicionActivo.controls['movimiento'].value == "Salida") {
      return this.estadosCondicion.filter(e => e.evento.toLowerCase().includes('condicionsalida'));
    }
    if (this.formCondicionActivo.controls['movimiento'].value == "Ingreso") {
      return this.estadosCondicion.filter(e => e.evento.toLowerCase().includes('condicioningreso'));
    }
  }

  opcionDisponible(opcion: string): boolean {
    return this.service.validarPermiso(opcion);
  }

  booleanValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (typeof (control.value) !== "boolean") {
      return { 'boolean': true }
    }
    return null;
  }

  get configuracionComponent() {
    return this.service.getConfiguracionComponent();
  }


}
