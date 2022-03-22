import { DepartamentoService } from './../../data/services/departamento.service';
import { MunicipioService } from './../../data/services/municipio.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { first } from 'rxjs/operators';
import { PaisService } from '../../data/services/pais.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-municipio',
  templateUrl: './municipio.component.html',
  styleUrls: ['./municipio.component.css']
})

export class MunicipioComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Municipio',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    idDepartamento: "*Campo Requerido",
    codMunicipio: "*Campo Requerido",
    nombreMunicipio: "*Campo Requerido",
  };

  colPaises: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codAlfa2", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  colDepartamentos: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  constructor(private municipioService: MunicipioService, private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder, private sweetService: SweetService, private departamentoService: DepartamentoService,
    private paisService: PaisService) { }

  ngOnInit(): void {
    forkJoin([
      this.paisService.getCargando().pipe(first(v => v === false)),
      this.departamentoService.getCargando().pipe(first(v => v === false)),
      this.municipioService.getCargando().pipe(first(v => v === false))
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventoSelectRecurso(evento) {
    this.form.controls['idRecurso'].setValue(evento);
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 es Regresar
      case 1:
        this.municipioService.paginaAnterior();
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

  getPaises() {
    return this.paisService.getPaises();
  }

  getDepartamentos() {
    return this.departamentoService.getDepartamentos(false, null);
  }

  selectPais(event: any) {
    this.form.controls['idPais'].setValue(event);
    this.form.controls['idDepartamento'].setValue(null);
    this.departamentoService.cargarPaginaPais(this.form.controls['idPais'].value).pipe(first()).subscribe();
  }

  validarPermiso() {
    if (this.municipioService.validarPermiso('Consultar') ||
      this.municipioService.validarPermiso('Agregar') ||
      this.municipioService.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.municipioService.errorPermiso();
      this.municipioService.paginaAnterior();
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

    this.municipioService.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.configurarFormulario();
    this.paisService.cargarPagina().pipe(first()).subscribe();

  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idDepartamento: ["", [Validators.required]],
      codMunicipio: ["", [Validators.required]],
      nombreMunicipio: ["", [Validators.required]],
      idPais: ["", [Validators.required]]
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
    this.municipioService.getId(id).pipe(
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
      this.municipioService.crear(this.form.value).pipe(
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
      this.municipioService.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.municipioService.paginaAnterior();
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
    return this.municipioService.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.municipioService.getConfiguracionComponent();
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
