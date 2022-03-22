import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Generador } from 'src/app/@catalogos/data/models/generador';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { CondicionGeneradorService } from '../../data/services/condicion-generador.service';

@Component({
  selector: 'app-inspeccion-generador',
  templateUrl: './inspeccion-generador.component.html',
  styleUrls: ['./inspeccion-generador.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})
export class InspeccionGeneradorComponent implements OnInit {

  form: FormGroup;
  formCondicionActivo: FormGroup;
  private formatoFechaHora: string = environment.formatoFechaHora;
  estadosCondicion: Estados[] = [];
  cargando: boolean = true;
  imgRecursoFotos: ImagenRecursoConfiguracion = null;

  //Input Generador
  filtrosAplicarGenerador: QueryFilter[] = [];
  filtrosGenerador: FiltrosC[] = [];
  columnasGenerador: ColumnaTabla[] = [
    { titulo: 'Código', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Color', target: ['activoOperacion', 'color'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  listaBooleanos: any[] = [
    { nombre: "Si", valor: true },
    { nombre: "No", valor: false },
  ];

  //Input Empleado
  filtrosAplicarEmpleados: QueryFilter[] = [];
  filtrosEmpleados: FiltrosC[] = [];
  columnasEmpleado: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
  ];

  constructor(private formBuilder: FormBuilder, private service: CondicionGeneradorService,
    private sweetService: SweetService) { }

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
    let filtrosInput: FiltrosC[] = [];
    let tiposEquipos = this.service.getTiposGeneradorValue().filter(t => t.prefijo.startsWith(""));

    let fTE: FiltrosC = {
      activo: true,
      nombre: "Tipo Equipo",
      requerido: true,
      tipo: "lista",
      filters: [{ filtro: "idTipoGenerador", parametro: "" }],
      valores: []
    };
    tiposEquipos.forEach(t => {
      fTE.valores.push({ nombre: t.prefijo + "-" + t.descripcion, valor: t.id });
    });
    filtrosInput.push(fTE);
    filtrosInput.push({
      activo: true,
      nombre: "Flota",
      filters: [{ filtro: "flota", parametro: "GT" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "GT", valor: "GT" },
        { nombre: "SV", valor: "SV" },
        { nombre: "HN", valor: "HN" }]
    });
    filtrosInput.push({
      activo: false,
      nombre: "Equipo Activo",
      filters: [{ filtro: "equipoActivo", parametro: true }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Si", valor: true },
        { nombre: "No", valor: false }]
    });
    this.service.setFiltrosComponentGeneradores(filtrosInput);

    this.service.setConfiguracionComponent({
      header: {
        titulo: "Inspección De Generador",
        opciones: opt
      },
      isModal: false,
    });

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

    this.service.getImagenRecursoConfiguracion("Fotos").subscribe(res => {
      this.imgRecursoFotos = res;
      this.setFiltrosGenerador();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.setFiltrosGenerador();
    });
  }

  setFiltrosGenerador(){
    forkJoin([
      this.service.getTiposGenerador()
    ]).subscribe(res => {
      this.filtrosGenerador.push(
        { nombre: "Tipos de generador", tipo: "lista", requerido: false, filters: [{filtro:"idTipoGenerador", parametro:""}], activo: true,
         valores: res[0].map(tg => {
           return {nombre: tg.descripcion, valor: tg.id}
         })},
        { nombre: "Código", tipo: "input", tipoInput: "string", requerido: false, filters: [{filtro:"codigo", parametro:""}], activo: true},
        { nombre: "Equipo Propio", tipo: "lista", requerido: false, filters: [{filtro:"propio", parametro:""}], activo: true,
          valores: [{nombre:"Todos", valor: ""},{nombre:"Si", valor:true},{nombre:"No", valor:false}]
        }
      )
      this.filtrosAplicarGenerador.push({filtro: "idEmpresa", parametro: this.service.getEmpresa().id});  
      this.configurarFormulario();
    })
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      //Revision Exterior
      estExPuertasGolpeadas: ["", [this.booleanValidator]],
      estExPuertasQuebradas: ["", [this.booleanValidator]],
      estExPuertasFaltantes: ["", [this.booleanValidator]],
      estExPuertasSueltas: ["", [this.booleanValidator]],
      estExBisagrasQuebradas: ["", [this.booleanValidator]],

      //Panel Electrico
      panelGolpes: ["", [this.booleanValidator]],
      panelTornillosFaltantes: ["", [this.booleanValidator]],
      panelOtros: ["", [this.booleanValidator]],

      //Soporte Del Marco
      soporteGolpes: ["", [this.booleanValidator]],
      soporteTornillosFaltantes: ["", [this.booleanValidator]],
      soporteMarcoQuebrado: ["", [this.booleanValidator]],
      soporteMarcoFlojo: ["", [this.booleanValidator]],
      soporteBisagrasQuebradas: ["", [this.booleanValidator]],
      soporteSoldaduraEstado: ["", [this.booleanValidator]],

      //Revision Interna
      revIntCablesQuemados: ["", [this.booleanValidator]],
      revIntCablesSueltos: ["", [this.booleanValidator]],
      revIntReparacionesImpropias: ["", [this.booleanValidator]],

      //Tanque de combustible
      tanqueAgujeros: ["", [this.booleanValidator]],
      tanqueSoporteDanado: ["", [this.booleanValidator]],
      tanqueMedidorDiesel: ["", [this.booleanValidator]],
      tanqueCodoQuebrado: ["", [this.booleanValidator]],
      tanqueTapon: ["", [this.booleanValidator]],
      tanqueTuberia: ["", [this.booleanValidator]],
      horometro: ["", [Validators.required]],
      dieselEntradaSalida: ["", [Validators.required]],

      //Piezas Faltantes
      pFaltMedidorAceite: ["", [this.booleanValidator]],
      pFaltTapaAceite: ["", [this.booleanValidator]],
      pFaltTaponRadiador: ["", [this.booleanValidator]],

      //-----\\
      galonesRequeridos: [null],
      galonesGenSet: [null],
      galonesCompletar: [null],
      //horometro: [null],
      horaEncendida: [null],
      horaApagada: [null],
      //dieselEntradaSalida: [null],
      dieselConsumido: [null],
      horasTrabajadas: [null],


      condicionActivo: [""],
      //condicionesLlantas: [""],
      //condicionesLlantasRepuesto: [""],
    });

    this.formCondicionActivo = this.formBuilder.group({
      idActivo: ["", [Validators.required]],
      idEmpleado: ["", [Validators.required]],
      tipoCondicion: ["generador", [Validators.required]],
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
      generador: [""],
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

  getGenerador(equipoRemolque: Generador) {//Input Equipo Remolque
    if (equipoRemolque) {
      this.formCondicionActivo.controls['idActivo'].setValue(equipoRemolque.idActivo);
      this.formCondicionActivo.controls['generador'].setValue(equipoRemolque);
      this.buscarUltimaInspeccion(equipoRemolque.activoOperacion.id);
    } else {
      this.formCondicionActivo.controls['idActivo'].setValue(null);
      this.formCondicionActivo.controls['noLlantas'].setValue(0);
      this.formCondicionActivo.controls['prefijo'].setValue("");
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
