import { ReparacionService } from './../../data/services/reparacion.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { first } from 'rxjs/operators';
import { Lista } from '../../data/models/lista';
import { Columna } from 'src/app/@page/models/columna';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { Reparacion } from '../../data/models/reparacion';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reparacion',
  templateUrl: './reparacion.component.html',
  styleUrls: ['./reparacion.component.css']
})
export class ReparacionComponent extends BaseComponent implements OnInit {


  colTipoReparaciones: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ];

  listaCategoriaDeReparaciones: Lista[] = [];

  constructor(protected s: ReparacionService, protected sw: SweetService,
    protected ar: ActivatedRoute, protected formBuilder: FormBuilder) {
    super("Reparación", s, sw, ar);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.s.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
      case 3:
        this.modificarRegistro();
        break;
    }
  }

  cargarComponent(): void {
    this.cargandoDatosDelComponente = true;
    this.header.opciones.push({ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' });
    if (this.validarParametro("id")) {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'), idEvento: 3, toolTip: 'Guardar Registro', color: 'primary' })
    } else {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' })
    }

    forkJoin([
      this.s.getItemsDeLista("idCategoria")
    ]).pipe(first()).subscribe(res => {
      this.listaCategoriaDeReparaciones = res[0];
      this.configurarFormulario();
    },(error)=>{
      console.log(error);
      this.sweetService.sweet_Error(error);
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      idCategoria: ["", [Validators.required]],
      idTipoReparacion: ["", [Validators.required]],
      idEmpresa: ["", [Validators.required]],
      horasHombre: ["", [Validators.required]],
    });
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargandoDatosDelComponente = true;
    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<Reparacion>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          this.form.patchValue(res);
          this.cargandoDatosDelComponente = false;
        }, (error) => {
          console.log(error);
          if (error.status == 404) {
            this.sweetService.sweet_alerta("Error", "Registro no existe.", "error");
            this.header.opciones[1].disponible = this.opcionDisponible("Agregar");
            this.header.opciones[1].nombre = "Guardar";
            this.header.opciones[1].idEvento = 2;
            this.cargandoDatosDelComponente = false;
            return;
          }
          this.sweetService.sweet_Error(error);
          this.s.paginaAnterior();
        });
    } else {
      this.cargandoDatosDelComponente = false;
    }
  }

  modificarRegistro() {
    if (this.form.valid) {
      this.s.modificar(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.cargarDatos();
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.s.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        //this.reiniciarFormularios();
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
  }
}
