import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecurso } from 'src/app/@aguila/data/models/imagenRecurso';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { AreaCOP, COP } from 'src/app/@page/models/cop';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ListaGeneral } from 'src/app/@page/models/listaGeneral';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { VisitasService } from '../../data/services/visitas.service';

@Component({
  selector: 'app-visita',
  templateUrl: './visita.component.html',
  styleUrls: ['./visita.component.css']
})
export class VisitaComponent implements OnInit {

  form: FormGroup;
  cargando: boolean = true;
  listaEmpresas: ListaGeneral = null;
  listaAreas: AreaCOP[] = null;
  listaAreasFiltradas: Observable<AreaCOP[]>;
  imgRecursoDPI: ImagenRecursoConfiguracion = null;

  codErrores = {
    nombre: "*Campo Requerido",
    identificacion: "*Campo Requerido",
    motivoVisita: "*Campo Requerido",
    areaVisita: "*Campo Requerido",
    nombreQuienVisita: "*Campo Requerido",
    empresaVisita: "*Campo Requerido",
    vehiculo: "*"
  }

  constructor(private service: VisitasService, private sweetService: SweetService,
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
      { icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Ingreso'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' }
    ];
    this.service.setConfiguracionComponent({
      header: {
        titulo: "Ingreso De Visita",
        opciones: opt
      },
      isModal: false,
    });
    this.imgRecursoDPI = this.service.getImagenRecurso("DPI");
    this.cargarListas();
  }

  cargarListas() {
    forkJoin([
      this.service.getListaJSON('generales'),
      this.service.getListaCops(),
    ]).pipe(first()).subscribe(res => {
      this.listaEmpresas = res[0].find(tl => tl.tipoLista.toLowerCase() == "empresas");
      this.listaAreas = res[1].areas;
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      identificacion: ["", [Validators.required]],
      motivoVisita: ["", [Validators.required]],
      areaVisita: ["", [Validators.required]],
      nombreQuienVisita: ["", [Validators.required]],
      vehiculo: [""],
      dpi: [""],
      idImagenRecursoDpi: [null],
      empresaVisita: ["", [Validators.required]],
      idEstacionTrabajo: [this.service.getEstacionTrabajo().id]
    });

    this.listaAreasFiltradas = this.form.controls['areaVisita'].valueChanges.pipe(
      startWith(''),
      map(valor => this._filtrarListaAreas(valor))
    )
    this.cargando = false;
  }

  private _filtrarListaAreas(valor: string): AreaCOP[] {
    const v = valor.toLowerCase();
    return this.listaAreas.filter(area => area.nombre.toLowerCase().includes(valor.toLowerCase()))
  }

  guardarRegistro() {
    if (this.form.valid) {
      if (this.form.controls["idImagenRecursoDpi"].value) {
        this.form.controls["dpi"].setValue(null);
      }
      this.service.marcarIngreso(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado");
        this.service.navegar(["controlGarita", "visitas"]);
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
