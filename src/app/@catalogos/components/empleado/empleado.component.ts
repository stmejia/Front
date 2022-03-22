import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecurso } from 'src/app/@aguila/data/models/imagenRecurso';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { COP } from 'src/app/@page/models/cop';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ListaGeneral } from 'src/app/@page/models/listaGeneral';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { EmpleadoService } from '../../data/services/empleado.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
  }]
})
export class EmpleadoComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Empleados',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    codigo: "*Campo Requerido",
    nombres: "*Campo Requerido",
    apellidos: "*Campo Requerido",
    dpi: "*Campo Requerido",
    nit: "*Campo Requerido",
    direccion: "*Campo Requerido",
    telefono: "*Campo Requerido",
    fechaAlta: "*Campo Requerido",
    licenciaConducir: "*Campo Requerido",
    placas: "*Campo Requerido",
    fechaNacimiento: "*Campo Requerido",
    fechaBaja: "*Campo Requerido",

    pais: "*Campo Requerido",
    idEmpresa: "*Campo Requerido",
    correlativo: "*Campo Requerido",
    departamento: "*Campo Requerido",
    area: "*Campo Requerido",
    subArea: "*Campo Requerido",
    puesto: "*Campo Requerido",
    categoria: "*Campo Requerido",
    localidad: "*Campo Requerido",
    idEmpresaEmpleador: "*Campo Requerido",
    estado: "*Campo Requerido",
    codigoAnterior: "*Campo Requerido",
    dependencia: "*Campo Requerido"
  };

  rutaComponent: string = "";
  cop: COP = null;
  listaPaises: ListaGeneral = null;
  imagenRecursoFoto: ImagenRecursoConfiguracion = null;
  empresasEmpleadoras: Empresa[] = [];

  constructor(private serviceComponent: EmpleadoService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(first(value => value === false))
      .subscribe(() => this.validarPermiso());
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

    forkJoin([
      this.serviceComponent.getListaCops(),
      this.serviceComponent.getListaJSON('generales'),
      this.serviceComponent.getHttp().get(this.serviceComponent.getUrlBase() + "/api/empresas?esEmpleador=true")
        .pipe(map((res: AguilaResponse<Empresa[]>) => res.aguilaData))
    ]).subscribe(res => {
      this.cop = res[0];
      this.rutaComponent = this.router.url;
      this.listaPaises = res[1].find(tl => tl.tipoLista.toLowerCase() == "paises");
      this.imagenRecursoFoto = this.serviceComponent.getImagenRecurso("Fotos");
      this.empresasEmpleadoras = res[2];
      this.configurarFormulario();
    }, (error) => {
      this.sweetService.sweet_Error(error);
      this.serviceComponent.paginaAnterior();
    });
  }

  getCasillaCop(casilla: string): any[] {
    return this.cop[casilla]
  }

  getCasillaCopFiltro(casilla: string, filtro: string, campo: string): any[] {
    return this.cop[casilla].filter(c => c[campo] == filtro);
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [null],
      codigo: [""],
      nombres: ["", [Validators.required]],
      apellidos: ["", [Validators.required]],
      dpi: ["", [Validators.required]],
      nit: [""],
      idDireccion: [0],
      telefono: ["", [Validators.required]],
      fechaAlta: ["", [Validators.required]],
      licenciaConducir: [""],
      placas: [""],
      fechaNacimiento: ["", [Validators.required]],
      fechaBaja: [""],
      //CUI
      pais: ["", [Validators.required]],
      idEmpresa: ["", [Validators.required]],
      correlativo: [""],
      //COP
      departamento: ["", [Validators.required]],
      area: ["", [Validators.required]],
      subArea: ["", [Validators.required]],
      puesto: ["", [Validators.required]],
      categoria: ["", [Validators.required]],
      localidad: ["", [Validators.required]],
      idEmpresaEmpleador: ["", [Validators.required]],
      estado: ["", [Validators.required]],
      //--
      fechaCreacion: [new Date()],
      direccion: [""],
      fotos: [""],
      codigoAnterior: [""],
      dependencia: [""]
    });

    if (!this.serviceComponent.validarPermiso("Correlativo")) {
      this.form.controls['correlativo'].disable();
    }

    if (!this.isNuevo()) {
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.form.removeControl("id");
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).subscribe(res => {
      this.form.patchValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
      this.sweetService.sweet_notificacion("Listo");
    }, (error => {
      this.sweetService.sweet_Error(error);
      this.serviceComponent.paginaAnterior();
    }));
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_alerta("Completado", "Registro Guardado");
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      console.log(this.form.value);

      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  modificarRegistro() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        console.log(error);
        this.bloquearInputs();
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  bloquearInputs() {
    this.form.controls['codigo'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['codigo'].enable();
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
      this.serviceComponent.errorPermiso("Consultar-Modificar-Agregar");
      this.serviceComponent.paginaAnterior();
    }
  }

  getEmpresas() {
    //return this.serviceComponent.getEmpresasAsignadas();
    return this.serviceComponent.getEmpresasAsignadas();
  }

  // validarCOP() {
  //   if (this.form.controls["departamento"].valid && this.form.controls["area"].valid
  //     && this.form.controls["subArea"].valid && this.form.controls["puesto"].valid
  //     && this.form.controls["categoria"].valid && this.form.controls["localidad"].valid
  //     && this.form.controls["empleador"].valid && this.form.controls["estado"].valid) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }

  setImagenesSelect(imagenes: Imagen[]) {
    let imagenRecurso: ImagenRecurso = { imagenes: [] };
    if (this.form.controls["fotos"].value) {
      imagenRecurso = this.form.controls["fotos"].value as ImagenRecurso;
    }
    imagenRecurso.imagenes = imagenRecurso.imagenes ? imagenRecurso.imagenes.filter(i => i.id).concat(imagenes) : imagenes;
    this.form.controls["fotos"].setValue(imagenRecurso);
    console.log(this.form.value);

  }

  setImagenesEliminar(imagenes: string[]) {
    let imagenRecurso: ImagenRecurso = { imagenesEliminar: [] };
    if (this.form.controls["fotos"].value) {
      imagenRecurso = this.form.controls["fotos"].value as ImagenRecurso;
    }
    imagenRecurso.imagenesEliminar = imagenes;
    this.form.controls["fotos"].setValue(imagenRecurso);
  }

  setImagenesVisor(imagenes: Imagen[]) {
    let imagenRecurso = this.form.controls["fotos"].value as ImagenRecurso;
    imagenRecurso.imagenes = imagenes;
    this.form.controls["fotos"].setValue(imagenRecurso);
  }

  getImagenesVisor() {
    if (this.form.controls["fotos"].value) {
      return this.form.controls["fotos"].value.imagenDefault ? [this.form.controls["fotos"].value.imagenDefault] : [];
    } else {
      return [];
    }
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
