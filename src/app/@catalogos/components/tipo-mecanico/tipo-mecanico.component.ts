import { TipoMecanicoService } from './../../data/services/tipo-mecanico.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { first } from 'rxjs/operators';
import { Lista } from '../../data/models/lista';
import { ListaService } from '../../data/services/lista.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { TipoLista } from '../../data/models/tipoLista';

@Component({
  selector: 'app-tipo-mecanico',
  templateUrl: './tipo-mecanico.component.html',
  styleUrls: ['./tipo-mecanico.component.css']
})
export class TipoMecanicoComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Tipo de Mecánico',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }
  codErrores = {
    nombre: "*Campo Requerido",
    especialidad: "*Campo Requerido",
    codigo: "*Campo Requerido",
    descripcion: "*Campo Requerido"
  };
  tipoLista_ListaEspecialidades: TipoLista;
  listaEspecialidades: Lista[];

  constructor(private serviceComponent: TipoMecanicoService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private listaService: ListaService,
    private tipoListaService: TipoListaService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(first(value => value === false))
      .subscribe(() => this.validarPermiso());
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 es Regresar
      case 1:
        this.serviceComponent.paginaAnterior();
        break;
      // El evento 2 Guarda Registro Nuevo
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

    this.cargarTiposListas();
  }

  cargarTiposListas() {
    this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, 'especialidad')
      .pipe(first())
      .subscribe(res => {
        if (res.length > 0) {
          this.tipoLista_ListaEspecialidades = res[0];
          this.cargarListas();
        } else {
          this.sweetService.sweet_alerta('Error', 'El tipo de lista no ha sido creado', 'error');
          this.serviceComponent.paginaAnterior();
        }
      });
  }

  cargarListas() {
    this.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.listaService.cargarPagina(this.tipoLista_ListaEspecialidades.id, res.estacionTrabajo.sucursal.empresaId)
        .pipe(first()).subscribe(res => {
          this.listaEspecialidades = res;
          this.configurarFormulario();
        });
    })
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      especialidad: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
    });
    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).pipe(
        first()
      ).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Completado",
          "Registro guardado exitosamene"
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

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).pipe(
      first()
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    })
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    //this.form.controls['codigo'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    //this.form.controls['codigo'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
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

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  getEstacionTrabajo() {
    return this.serviceComponent.getEstacionTrabajo();
  }

  errores(validaciones: []) {
    //Recorremos por medio del form los errores que contiene
    for (const validacion in validaciones) {
      //Esta variable contiene el mensaje de error proveniente del api
      var error = validaciones[validacion];
      //Recorremos nuestro array que contiene los codigos de los errores
      for (const codError in this.codErrores) {
        //verificamos si un error esta contenido en nuestro array
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          //Si la condicion se cumple seteamos el mensaje de error a nuestro array  y lo mostramos en el input
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
  }

}
