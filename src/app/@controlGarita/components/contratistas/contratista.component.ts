import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecurso } from 'src/app/@aguila/data/models/imagenRecurso';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ListaGeneral } from 'src/app/@page/models/listaGeneral';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ContratistasService } from '../../data/services/contratistas.service';

@Component({
  selector: 'app-contratista',
  templateUrl: './contratista.component.html',
  styleUrls: ['./contratista.component.css']
})
export class ContratistaComponent implements OnInit {

  form: FormGroup;
  cargando: boolean = true;
  listaEmpresas: ListaGeneral = null;
  imgRecursoDPI: ImagenRecursoConfiguracion = null;

  codErrores = {
    nombre: "*Campo Requerido",
    identificacion: "*Campo Requerido",
    empresa: "*Campo Requerido",
    empresaVisita: "*Campo Requerido",
    vehiculo: "*"
  }

  constructor(private service: ContratistasService, private sweetService: SweetService,
    private formBuilder: FormBuilder) { }

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
    this.service.setConfiguracionComponent({
      header: {
        titulo: "Ingreso De Contratista",
        opciones: opt
      },
      isModal: false,
    });
    this.imgRecursoDPI = this.service.getImagenRecurso("DPI");
    this.cargarListas();
  }

  cargarListas() {
    forkJoin([
      this.service.getListaJSON('generales')
    ]).pipe(first()).subscribe(res => {
      this.listaEmpresas = res[0].find(tl => tl.tipoLista.toLowerCase() == "empresas");
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      identificacion: ["", [Validators.required]],
      empresa: ["", [Validators.required]],
      vehiculo: [""],
      dpi: [""],
      idImagenRecursoDpi: [null], 
      empresaVisita: ["", [Validators.required]],
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id]
    });

    this.cargando = false;
  }

  guardarRegistro() {
    if (this.form.valid) {
      if (this.form.controls["idImagenRecursoDpi"].value) {
        this.form.controls["dpi"].setValue(null);
      }
      this.service.marcarIngreso(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado");
        this.service.navegar(["controlGarita", "contratistas"]);
      }, (error) => {
        if (error.status == 400) {
          this.mostrarErrores(error.error.aguilaErrores[0].validacionErrores);
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
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
    if (this.service.validarPermiso('Ingreso')) {
      this.cargarComponent();
    } else {
      this.service.errorPermiso("Ingreso");
      this.service.paginaAnterior();
    }
  }

  buscarDocumento() {
    this.service.buscarXDocumento(this.form.controls["identificacion"].value).subscribe(res => {
      if (res) {
        this.form.controls["nombre"].setValue(res.nombre);
        this.form.controls["dpi"].setValue(res.dpi ? res.dpi : null);
        this.form.controls["idImagenRecursoDpi"].setValue(res.idImagenRecursoDpi ? res.idImagenRecursoDpi : null);
      }
    });
  }

  setImagenesSelect(imagenes: Imagen[]) {
    this.form.controls["idImagenRecursoDpi"].setValue(null);
    let imagenRecurso: ImagenRecurso = { imagenes: [] };
    imagenRecurso.imagenes = imagenRecurso.imagenes.filter(i => i.id).concat(imagenes);
    this.form.controls["dpi"].setValue(imagenRecurso);
  }

  setImagenesEliminar(imagenes: string[]) {
    let imagenRecurso: ImagenRecurso = { imagenesEliminar: [] };
    if (this.form.controls["dpi"].value) {
      imagenRecurso = this.form.controls["dpi"].value as ImagenRecurso;
    }
    imagenRecurso.imagenesEliminar = imagenes;
    this.form.controls["dpi"].setValue(imagenRecurso);
  }

  setImagenesVisor(imagenes: Imagen[]) {
    let imagenRecurso = this.form.controls["dpi"].value as ImagenRecurso;
    imagenRecurso.imagenes = imagenes;
    this.form.controls["dpi"].setValue(imagenRecurso);
  }

  getImagenesVisor() {
    if (this.form.controls["dpi"].value) {
      return this.form.controls["dpi"].value.imagenDefault ? [this.form.controls["dpi"].value.imagenDefault] : [];
    } else {
      return [];
    }
  }

  get configuracionComponent() {
    return this.service.getConfiguracionComponent();
  }
}
