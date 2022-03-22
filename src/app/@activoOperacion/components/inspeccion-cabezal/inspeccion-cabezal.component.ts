import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { CondicionLlanta } from '../../data/models/condicionLlanta';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { CondicionCabezalService } from '../../data/services/condicion-cabezal.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';

@Component({
  selector: 'app-inspeccion-cabezal',
  templateUrl: './inspeccion-cabezal.component.html',
  styleUrls: ['./inspeccion-cabezal.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})

export class InspeccionCabezalComponent implements OnInit {

  listaEstados: any[] = [
    { nombre: "Bueno", valor: "B" },
    { nombre: "Regular", valor: "R" },
    { nombre: "Malo", valor: "M" },
  ];

  listaNumeros: any[] = [
    { nombre: "1", valor: "1" },
    { nombre: "2", valor: "2" }
  ];

  listDanios: { [key: string]: any } = {};

  form: FormGroup;
  formCondicionActivo: FormGroup;
  private formatoFechaHora: string = environment.formatoFechaHora;
  estadosCondicion: Estados[] = [];
  cargando: boolean = true;

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

  imgRecursoFotos: ImagenRecursoConfiguracion = null;

  constructor(private formBuilder: FormBuilder, private service: CondicionCabezalService,
    private sweetService: SweetService,) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  agregarObservacion(parametro: string, valor:any){
    this.listDanios[parametro] = valor;
    let obs: string = "";
    for (let p in this.listDanios) {
      //const element = array[p];
      
      obs += `${p}: ${this.listDanios[p]} `
    }
    
    console.log(obs);
     
  }

  getObservacion(){
    let obs: string = "";
    for (let p in this.listDanios) {
      //const element = array[p];
      
      obs += `${p}: ${this.listDanios[p]} \n`
    }

    return obs;
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
        titulo: "Inspección De Cabezal",
        opciones: opt
      },
      isModal: false,
    });

    let tiposEquipos = this.service.getTiposVehiculosValue().filter(t => t.prefijo.startsWith("CA"));

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

    //Vehiculos
    this.filtrosAplicarVehiculo.push({ filtro: "idEmpresa", parametro: this.service.getEmpresa().id });
    this.filtrosAplicarVehiculo.push({ filtro: "idTipoVehiculo", parametro: tiposEquipos.length > 0 ? tiposEquipos[0].id : "0" });
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

    this.service.getImagenRecursoConfiguracion("Fotos").subscribe(res => {
      this.imgRecursoFotos = res;
      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      windShield: ["", [Validators.required]],
      plumillas: ["", [Validators.required]], //numero
      viscera: ["", [Validators.required]],
      rompeVientos: ["", [Validators.required]],
      persiana: ["", [Validators.required]],
      bumper: ["", [Validators.required]],
      capo: ["", [Validators.required]],
      retrovisor: ["", [Validators.required]], //numero
      ojoBuey: ["", [Validators.required]], //numero
      pataGallo: ["", [Validators.required]], //numero
      portaLlanta: ["", [Validators.required]],
      spoilers: ["", [Validators.required]], //numero
      salpicadera: ["", [Validators.required]], //numero
      guardaFango: ["", [Validators.required]], //numero
      taponCombustible: ["", [Validators.required]], //numero
      baterias: ["", [Validators.required]], //numero 4
      lucesDelanteras: ["", [Validators.required]],
      lucesTraseras: ["", [Validators.required]],
      pintura: ["", [Validators.required]],
      condicionActivo: [""],
      condicionesLlantas: [""],
      condicionesLlantasRepuesto: [""],
    });

    this.formCondicionActivo = this.formBuilder.group({
      idActivo: ["", [Validators.required]],
      idEmpleado: ["", [Validators.required]],
      tipoCondicion: ["cabezal", [Validators.required]],
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
      daniosObserv: [""],
      ubicacionIdEntrega: [null], //Lista
      //Inputs del Sistema
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id],
      idUsuario: [this.service.getUsuario().id],
      //Otros
      e: [""],
      fotos: [null],
      v: [""] //vehiculo
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

  getVehiculo(vehiculo: Vehiculo) {
    if (vehiculo) {
      this.formCondicionActivo.controls['idActivo'].setValue(vehiculo.idActivo);
      this.formCondicionActivo.controls['noLlantas'].setValue(vehiculo.llantas);
      this.formCondicionActivo.controls['prefijo'].setValue(vehiculo.activoOperacion.codigo.slice(0, 4));
      this.formCondicionActivo.controls['v'].setValue(vehiculo);
      this.buscarUltimaInspeccion(vehiculo.activoOperacion.id);
    } else {
      this.formCondicionActivo.controls['idActivo'].setValue(null);
      this.formCondicionActivo.controls['noLlantas'].setValue(0);
      this.formCondicionActivo.controls['prefijo'].setValue("");
      this.form.controls["condicionesLlantas"].setValue([]);
      this.form.controls["condicionesLlantasRepuesto"].setValue([]);
      this.formCondicionActivo.controls['v'].setValue(null);
    }
  }

  getEmpleado(empleado: Empleado) {
    if (empleado) {
      this.formCondicionActivo.controls['idEmpleado'].setValue(empleado.id);
      this.formCondicionActivo.controls['e'].setValue(empleado);
    } else {
      this.formCondicionActivo.controls['idEmpleado'].setValue(null);
      this.formCondicionActivo.controls['e'].setValue(null);
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
        // let inspec = this.form.value;
        // delete inspec.condicionActivo.e;
        // delete inspec.condicionActivo.v;
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
