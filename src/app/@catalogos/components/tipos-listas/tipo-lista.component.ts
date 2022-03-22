import { RecursoService } from './../../../@aguila/data/services/recurso.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { Columna } from 'src/app/@page/models/columna';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tipo-lista',
  templateUrl: './tipo-lista.component.html',
  styleUrls: ['./tipo-lista.component.css']
})
export class TipoListaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Tipo de Lista',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    descripcion: "*Campo Requerido",
    idRecurso: "*Campo Requerido",
    tipoDato: "*Campo Requerido",
    campo: "*Campo Requerido"
  };

  colRecursos: Columna[] = [
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true },
    { nombre: "Tipo", aligment: "center", targetId: "tipo", texto: true }
  ]

  constructor(private tipoListaService: TipoListaService, private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder, private sweetService: SweetService, private recursoService: RecursoService) {
  }

  getRecursos() {
    return this.recursoService.getDatos();
  }

  eventoSelectRecurso(evento) {
    this.form.controls['idRecurso'].setValue(evento);
  }

  ngOnInit(): void {
    forkJoin([
      this.tipoListaService.getCargando().pipe(
        first(value => value === false)
      ),
      this.recursoService.getCargando().pipe(
        first(value => value === false)
      )
    ]).subscribe(res => {
      this.validarPermiso();
      this.recursoService.cargarPagina([{ filtro: "PageSize", parametro: 1000 }]);
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
    });

  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 es Regresar
      case 1:
        this.tipoListaService.paginaAnterior();
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

  validarPermiso() {
    if (this.tipoListaService.validarPermiso('Consultar') ||
      this.tipoListaService.validarPermiso('Agregar') ||
      this.tipoListaService.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.tipoListaService.errorPermiso();
      this.tipoListaService.paginaAnterior();
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

    this.tipoListaService.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      descripcion: ["", [Validators.required]],
      idRecurso: ["", [Validators.required]],
      tipoDato: ["numero", [Validators.required]],
      campo: ["", [Validators.required]],
    });
    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  cargarRegistro(id: number) {
    this.tipoListaService.getId(id).pipe(
      first()
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    })
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.tipoListaService.crear(this.form.value).pipe(
        first()
      ).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Registro Completo",
          "Pais registrado correctamente"
        );
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
      this.tipoListaService.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.tipoListaService.paginaAnterior();
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

  opcionDisponible(opcion: string): boolean {
    return this.tipoListaService.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.tipoListaService.getConfiguracionComponent();
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
