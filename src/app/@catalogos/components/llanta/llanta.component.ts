import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { TipoLista } from '../../data/models/tipoLista';
import { EstadosService } from '../../data/services/estados.service';
import { ListaService } from '../../data/services/lista.service';
import { LlantaTiposService } from '../../data/services/llanta-tipos.service';
import { LlantaService } from '../../data/services/llanta.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';

@Component({
  selector: 'app-llanta',
  templateUrl: './llanta.component.html',
  styleUrls: ['./llanta.component.css']
})
export class LlantaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  idEmpresa: number;

  header: ItemHeaderComponent = {
    titulo: 'Llanta',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    codigo: "*Campo Requerido",
    marca: "*Campo Requerido",
    serie: "*Campo Requerido",
    precio: "*Campo Requerido",
    medidas: "*Campo Requerido",
    propositoIngreso: "*Campo Requerido",
    reencaucheIngreso: "*Campo Requerido",
    proveedorId: "*Campo Requerido"
  };

  colLlantaTipo: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", tipo: "texto" },
  ];

  colEstadosLlanta: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" },
  ];

  TL_ReeLlanta: TipoLista;
  TL_ProveedorLlanta: TipoLista;
  TL_PropositoLlanta: TipoLista;
  listaReeLlanta: Lista[];
  listaProveedorLlanta: Lista[];
  listaPropositoLlanta: Lista[];

  constructor(private serviceComponent: LlantaService, private tipoLlantaService: LlantaTiposService,
    private sweetService: SweetService, private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private tipoListaService: TipoListaService, private listaService: ListaService, private estadosService: EstadosService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.estadosService.getCargando(),
      this.tipoLlantaService.getCargando().pipe(first(val => val == false)),
      this.tipoListaService.getCargando().pipe(first(val => val == false)),
      this.listaService.getCargando().pipe(first(val => val == false)),
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
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "No es posible acceder a la empresa", 'error');
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarTipoListas() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "reencaucheLlantas").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "proveedorId").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "propositoLlanta").pipe(first()),
    ]).subscribe(res => {
      this.TL_ReeLlanta = res[0][0];
      this.TL_ProveedorLlanta = res[1][0];
      this.TL_PropositoLlanta = res[2][0];
      this.cargarListas();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Tipos de Lista");
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_ReeLlanta.id, this.idEmpresa).pipe(first()),
      this.listaService.cargarPagina(this.TL_ProveedorLlanta.id, this.idEmpresa).pipe(first()),
      this.listaService.cargarPagina(this.TL_PropositoLlanta.id, this.idEmpresa).pipe(first()),
      this.tipoLlantaService.cargarPagina(1).pipe(first()),
    ]).subscribe(res => {
      this.listaReeLlanta = res[0];
      this.listaProveedorLlanta = res[1];
      this.listaPropositoLlanta = res[2];
      this.estadosService.cargarPagina("llantaEstados", this.idEmpresa);
      this.configurarFormulario();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Listas");
      this.serviceComponent.paginaAnterior();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigo: [""],
      marca: [""],
      serie: [""],
      reencaucheIngreso: [""], //Lista
      idLlantaTipo: [""],
      proveedorId: [""],
      precio: [""],
      medidas: [""],
      propositoIngreso: [""],
      idEstadoIngreso: [""],
      fechaIngreso: [new Date()],
    });

    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl());
      this.form.addControl("fechaCreacion", new FormControl());
      this.form.addControl("fechaBaja", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).subscribe(res => {
      this.form.patchValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar el registro", "error");
      this.serviceComponent.paginaAnterior();
    });
  }

  getTipoLlantas() {
    return this.tipoLlantaService.getDatos();
  }

  getEstadosLlanta() {
    return this.estadosService.getDatos();
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
    this.form.controls['fechaBaja'].disable();
    this.form.controls['codigo'].disable();
  }

  habilitarInputs() {
    this.form.controls['fechaCreacion'].enable();
    this.form.controls['codigo'].enable();
    this.form.controls['fechaBaja'].disable();
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
