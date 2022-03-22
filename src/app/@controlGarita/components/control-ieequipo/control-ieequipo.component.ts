import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones, MenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ControlIEEquipoService } from '../../data/services/control-ieequipo.service';

@Component({
  selector: 'app-control-ieequipo',
  templateUrl: './control-ieequipo.component.html',
  styleUrls: ['./control-ieequipo.component.css']
})
export class ControlIEEquipoComponent implements OnInit {

  form: FormGroup;
  formEquipo: FormGroup;
  cargando: boolean = true;

  codErrores = {
    movimiento: "*Campo Requerido",
    piloto: "*Campo Requerido",
    marchamo: "*"
  }

  tiposEquipos: any[] = [
    { tipo: 1, nombre: "Cabezal" },
    { tipo: 2, nombre: "Furgon / Contenedor" },
    { tipo: 3, nombre: "Chasis" },
    { tipo: 4, nombre: "Generador" }
  ]

  tamanoEquipos: any[] = [
    { tipo: 20, nombre: "20 Pies" },
    { tipo: 40, nombre: "40 Pies" },
    { tipo: 24, nombre: "20-40 Pies" },
  ];

  listaEquiposPrincipal = new BehaviorSubject<any[]>([]);

  columnasListaEquipos: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: "No.", target: ["id"], tipo: "texto", aligment: "center", visible: true },
    { titulo: "Código", target: ["codigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Tamaño De Equipo", target: ["tamanoEquipo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "¿Es Propio?", target: ["propio"], tipo: "boolean", aligment: "center", visible: true },
  ];

  listaOptEquipos: MenuOpciones[] = [
    { icono: 'create', nombre: 'Modificar', disponible: true, idEvento: 1 },
    { icono: 'delete', nombre: 'Eliminar', disponible: true, idEvento: 2 },
  ];

  constructor(private service: ControlIEEquipoService, private sweetService: SweetService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.formEquipo.patchValue(event.objeto);
        break;

      case 2:
        this.listaEquiposPrincipal.next(this.listaEquiposPrincipal.value.filter(item => item.id != event.objeto.id));
        break;
    }
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
        titulo: "Ingreso Y Egreso De Equipo Intermodal",
        opciones: opt
      },
      isModal: false,
    });
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      movimiento: ["", [Validators.required]],
      piloto: ["", [Validators.required]],
      equipos: ["", [Validators.required]],
      marchamo: [""],
      origendestino: [""],
      empresa: ["", [Validators.required]],
      atc: [false],
      lleno: [false],
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id],
      idEmpresa: [this.service.getEmpresa().id]
    });

    this.formEquipo = this.formBuilder.group({
      id: [],
      idActivo: [null],
      tipoEquipo: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      tamanoEquipo: [""],
      propio: [true],
      activo: [null]
    })
    this.cargando = false;
  }

  agregarEquipo() {
    if (this.formEquipo.valid) {
      if (this.formEquipo.controls["propio"].value) {
        this.buscarEquipo();
        return;
      }
      this.agregarEquipoLista();
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos", "error");
      this.formEquipo.markAllAsTouched();
    }
  }

  buscarEquipo() {
    // let prefijo: string = this.formEquipo.controls["codigo"].value.toString().substr(0, 4);
    // let correlativo: string = this.formEquipo.controls["codigo"].value.toString().substr(4);
    // if (correlativo.length < 4) {
    //   for (let i = correlativo.length; i <= 3; i++) {
    //     prefijo = prefijo + (0).toString();
    //   }
    // }
    // let codigo = prefijo + correlativo;
    let codigo = this.formEquipo.controls["codigo"].value;
    this.service.getEquipoCodigo(codigo).subscribe(res => {
      this.formEquipo.controls["activo"].setValue(res);
      this.formEquipo.controls["idActivo"].setValue(res.idActivo);
      this.formEquipo.controls["codigo"].setValue(codigo.toUpperCase());
      this.agregarEquipoLista();
    }, (error) => {
      this.formEquipo.controls["propio"].setValue(false);
      this.agregarEquipoLista();
    });
  }

  agregarEquipoLista() {
    let indexEquipo = this.listaEquiposPrincipal.value.findIndex(item => item.id == this.formEquipo.controls["id"].value);
    if (indexEquipo >= 0) {
      this.listaEquiposPrincipal.value[indexEquipo] = this.formEquipo.value;
      this.sweetService.sweet_notificacion("Registro Actualizado");
      this.formEquipo.reset();
      this.formEquipo.controls["propio"].setValue(true);
      return;
    }

    if (this.listaEquiposPrincipal.value.filter(i => i.codigo == this.formEquipo.controls["codigo"].value).length > 0) {
      this.sweetService.sweet_alerta("Error", "El equipo ya se encuentra en la lista", "error");
      this.formEquipo.controls["codigo"].setValue("");
      return
    }
    this.formEquipo.controls["id"].setValue(this.listaEquiposPrincipal.value.length + 1);
    this.listaEquiposPrincipal.value.push(this.formEquipo.value);
    this.sweetService.sweet_notificacion("Registro Agregado");
    this.formEquipo.reset();
    this.formEquipo.controls["propio"].setValue(true);
  }

  guardarRegistro() {
    this.form.controls["equipos"].setValue(this.listaEquiposPrincipal.value);
    if (this.form.valid) {
      this.service.guardarRegistro(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000);
        this.reiniciarFormulario();
      }, (error) => {
        if (error.status == 400) {
          this.mostrarErrores(error.error.aguilaErrores[0].validacionErrores);
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los datos", "error");
      this.form.markAllAsTouched();
    }

  }

  reiniciarFormulario() {
    this.form.reset();
    this.formEquipo.reset();
    this.form.controls["idEstacionTrabajo"].setValue(this.service.getEstacionTrabajo().id);
    this.form.controls["idEmpresa"].setValue(this.service.getEmpresa().id);
    this.formEquipo.controls["propio"].setValue(false);
    this.form.controls["atc"].setValue(false);
    this.form.controls["lleno"].setValue(false);
    this.listaEquiposPrincipal.next([]);
  }

  mostrarErrores(validaciones: any[]) {
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

  opcionDisponible(opcion: string): boolean {
    return this.service.validarPermiso(opcion);
  }

  validarPermiso() {
    if (this.service.validarPermiso('Agregar')) {
      this.cargarComponent();
    } else {
      this.service.errorPermiso("Agregar");
      this.service.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.service.getConfiguracionComponent();
  }
}
