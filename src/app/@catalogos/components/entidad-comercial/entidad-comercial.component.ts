import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { TipoLista } from '../../data/models/tipoLista';
import { ListaService } from '../../data/services/lista.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { first } from 'rxjs/operators';
import { EntidadComercialService } from '../../data/services/entidad-comercial.service';
import { EntidadComercial } from '../../data/models/entidadComercial';
import { CorporacionService } from '../../data/services/corporacion.service';

@Component({
  selector: 'app-entidad-comercial',
  templateUrl: './entidad-comercial.component.html',
  styleUrls: ['./entidad-comercial.component.css']
})
export class EntidadComercialComponent implements OnInit {

  @Input() entidadComercial: EntidadComercial = null;
  @Input() tipo: string;
  @Output() getEntidadComercial = new EventEmitter();
  @Output() direccionFiscal = new EventEmitter();

  cargandoDatos: boolean = true;
  form: FormGroup;
  tipoLista_ListaTipoNit: TipoLista;
  header: ItemHeaderComponent = {
    titulo: 'Datos Comerciales',
    opciones: []
  }

  codErrores = {
    nombre: "*Campo Requerido",
    razonSocial: "*Campo Requerido",
    //idDireccionFiscal: "*Campo Requerido",
    tipo: "*Campo Requerido",
    nit: "*Campo Requerido",
    tipoNit: "*Campo Requerido"
  };

  colTipoReparaciones: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  listaTipoNit: Lista[];

  colCorporacion: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ];

  constructor(private serviceComponent: EntidadComercialService, private sweetService: SweetService,
    private corporacionService: CorporacionService, private formBuilder: FormBuilder, private listaService: ListaService,
    private tipoListaService: TipoListaService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(first(value => value === false))
      .subscribe(() => {
        this.listaService.getCargando().pipe(first(value => value === false))
          .subscribe(() => {
            this.tipoListaService.getCargando().pipe(first(value => value === false))
              .subscribe(() => {
                this.corporacionService.getCargando().pipe(
                  first(value => value === false)
                ).subscribe(() => this.validarPermiso())
              });
          })
      });
  }

  ngOnChanges(cambios) {
    if (cambios.entidadComercial) {
      if (cambios.entidadComercial.currentValue) {
        if (cambios.entidadComercial.previousValue) {
          if (cambios.entidadComercial.currentValue.nit != cambios.entidadComercial.previousValue.nit) { //currentValue[0]
            this.cargarRegistro(cambios.entidadComercial.currentValue); //
          }
        } else {
          this.cargarRegistro(cambios.entidadComercial.currentValue); //
        }
      }
    }
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 2:
        this.guardarRegistro();
        break;
    }
  }

  cargarComponent() {
    this.header.opciones.push({
      icono: 'navigate_next', nombre: 'Siguiente', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Siguiente Paso', color: 'primary'
    });
    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.corporacionService.cargarPagina().pipe(first()).subscribe();
    this.cargarTiposLista();
  }

  guardarRegistro() {
    if (this.form.valid) {
      if (this.nitValido()) {
        this.getEntidadComercial.emit(this.form.value);
      }
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  modificarRegistro() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
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

  cargarTiposLista() {
    this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, 'tipoNit')
      .pipe(first())
      .subscribe(res => {
        if (res.length > 0) {
          this.tipoLista_ListaTipoNit = res[0];
          this.cargarListas();
        } else {
          this.sweetService.sweet_alerta('Error', 'El tipo de lista no ha sido creado', 'error');
          this.serviceComponent.paginaAnterior();
        }
      });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      razonSocial: ["", [Validators.required]],
      tipo: [""],
      nit: ["", [Validators.required]],
      idDireccionFiscal: [""],
      id: [0],
      fechaCreacion: [new Date()],
      direccionFiscal: [""],
      idCorporacion: [null],
      tipoNit: ["", [Validators.required]], //Lista
    });
    this.cargandoDatos = false;
    if (!this.isNuevo()) {
      this.cargarRegistro(this.entidadComercial);
    }
  }

  nitValido(): boolean {
    if (this.form.controls['tipoNit'].value.toLowerCase() === "n") {
      return this.validarNIT();
    } else {
      return true;
    }
  }

  validarNIT(): boolean {
    let nit: string = this.form.controls['nit'].value.toLowerCase();

    if (nit == "cf") {
      return true;
    }

    if (nit.includes("-")) {
      this.sweetService.sweet_alerta("Error", "El NIT no debe tener guiones (-)", 'error');
      return false;
    }

    let digitoVerificador = nit.charAt(nit.length - 1);
    let factorMultiplicacion: number = nit.length;
    let suma = 0;

    for (let i = 0; i < nit.length - 1; i++) {
      suma += Number(nit.charAt(i)) * factorMultiplicacion;
      factorMultiplicacion--;
    }

    let resultado = (11 - (suma % 11)) % 11;

    if ((resultado == 10 && digitoVerificador == "k") || resultado == Number(digitoVerificador)) {
      return true;
    } else {
      this.sweetService.sweet_alerta('Error', 'El NIT no es valido', 'error');
      return false;
    }

  }

  bucarNit() {
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.serviceComponent.getNit(this.form.controls['nit'].value, res.estacionTrabajo.sucursal.empresaId)
        .pipe(first()).subscribe(res => {
          if (res.length > 0) {
            if (this.tipo.toLocaleLowerCase() == "c") {
              if (res[0].tipo.toLocaleLowerCase() == "c" || res[0].tipo.toLocaleLowerCase() == "a") {
                this.errorNIT('Cliente');
              } else {
                this.form.setValue(res[0]);
                this.sweetService.sweet_notificacion('Listo', 2000);
              }
            }
            if (this.tipo.toLocaleLowerCase() == "p") {
              if (res[0].tipo.toLocaleLowerCase() == "p" || res[0].tipo.toLocaleLowerCase() == "a") {
                this.errorNIT('Proveedor');
              } else {
                this.form.setValue(res[0]);
                this.sweetService.sweet_notificacion('Listo', 2000);
              }
            }
          } else {
            this.sweetService.sweet_notificacion('Listo', 2000);
          }
        }, (error) => {
          this.sweetService.sweet_notificacion('No fue posible validar el NIT', 5000, 'error');
        });
    });
  }

  errorNIT(tipo: string) {
    this.sweetService.sweet_alerta(`${tipo} Duplicado`,
      `El NIT ingresado ya se encuentra registrado como ${tipo}, ingrese un NIT diferente`, 'error');
    this.form.controls['nit'].setValue('');
  }

  cargarListas() {
    this.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.listaService.cargarPagina(this.tipoLista_ListaTipoNit.id, res.estacionTrabajo.sucursal.empresaId)
        .pipe(first()).subscribe(res => {
          this.listaTipoNit = res;
          this.configurarFormulario();
        });
    })
  }

  cargarRegistro(entidadComercial: EntidadComercial) {
    if (this.entidadComercial && !this.cargandoDatos) {
      //await this.configurarFormulario();
      this.form.setValue(entidadComercial);
    }
  }

  getListaTipoNit() {
    return this.listaService.getDatos(true, this.tipoLista_ListaTipoNit.id);
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['nit'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['nit'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  edicionFormulario() {
    this.getEntidadComercial.emit(null);
  }

  isNuevo() {
    if (this.entidadComercial) {
      return false;
    } else {
      return true;
    }
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
    }
  }

  getEstacionTrabajo() {
    return this.serviceComponent.getEstacionTrabajo();
  }

  getCorporaciones() {
    return this.corporacionService.getDatos();
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
