import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ImagenrecursoconfiguracionService } from '../../data/services/imagenrecursoconfiguracion.service';
import { Imagen } from '../../data/models/imagen';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ImagenRecursoConfiguracion } from '../../data/models/imagenRecursoConfiguracion';
import { Recurso } from '../../data/models/recurso';
import { ImagenRecurso } from '../../data/models/imagenRecurso';
@Component({
  selector: 'app-imagenrecursoconfiguracion',
  templateUrl: './imagenrecursoconfiguracion.component.html',
  styleUrls: ['./imagenrecursoconfiguracion.component.css']
})
export class ImagenrecursoconfiguracionComponent extends BaseComponent implements OnInit {

  recurso: Recurso = null;
  constructor(protected sw: SweetService, protected s: ImagenrecursoconfiguracionService,
    protected ar: ActivatedRoute, protected formBuilder: FormBuilder) {
    super("Imagenes Recurso Configuración", s, sw, ar);
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

  cargarComponent() {
    this.cargandoDatosDelComponente = true;
    this.header.opciones.push({ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' });
    if (this.validarParametro("id")) {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'), idEvento: 3, toolTip: 'Guardar Registro', color: 'primary' })
    } else {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' })
    }
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      recurso_Id: ["", [Validators.required]],
      propiedad: ["", [Validators.required]],
      servidor: ["", [Validators.required]],
      carpeta: ["", [Validators.required]],
      pesoMaxMb: ["", [Validators.required]],
      noMaxImagenes: ["", [Validators.required]],
      defaultImagen: [""],
      eliminacionFisica: ["", [this.booleanValidator]],
      multiplesImagenes: ["", [this.booleanValidator]],
      subirImagenBase64: [""],
      fchCreacion: [new Date()],
    });

    this.cargarDatos();
  }

  cargarDatos() {
    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<ImagenRecursoConfiguracion>(this.activatedRoute.snapshot.paramMap.get("id")).subscribe(res => {
        this.form.patchValue(res);
        this.s.getRecursoId(res.recurso_Id).subscribe(res => {
          this.recurso = res;
          this.cargandoDatosDelComponente = false;
        }, (error => {
          this.form.controls["recurso_id"].setValue("");
          this.recurso = null;
          this.cargandoDatosDelComponente = false;
        }));
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

  guardarRegistro() {
    if (this.form.valid) {
      this.s.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.form.reset();
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

  buscarRecurso(evento) {
    const value = (evento.value || '').trim();
    if (value) {
      this.s.getRecursoXControlador(value).subscribe(res => {
        if (res.length > 0) {
          this.form.controls["recurso_Id"].setValue(res[0].id);
          this.recurso = res[0];
        } else {
          this.sweetService.sweet_alerta("Error", "No fue posible encontrar el recurso", "error");
          this.recurso = null;
        }
      });
    }
  }

  getImagenes(imagenes: Imagen[]) {
    if (imagenes.length > 0) {
      let imagenRecurso = new ImagenRecurso();
      imagenRecurso.imagenes = imagenes;
      this.form.controls["subirImagenBase64"].setValue(imagenRecurso);
    }
  }
}
