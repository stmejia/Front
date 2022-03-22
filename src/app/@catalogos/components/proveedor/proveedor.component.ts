import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Direccion } from '../../data/models/direccion';
import { EntidadComercial } from '../../data/models/entidadComercial';
import { EntidadComercialDireccion } from '../../data/models/entidadComercialDireccion';
import { Lista } from '../../data/models/lista';
import { EntidadComercialDireccionService } from '../../data/services/entidad-comercial-direccion.service';
import { ProveedorService } from '../../data/services/proveedor.service';
import { TipoProveedorService } from '../../data/services/tipo-proveedor.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {

  cargandoDatos: boolean = true;
  direccionNueva: boolean = false;
  direccionEditar: boolean = false;

  form: FormGroup;
  formDireccionNueva: FormGroup;

  header: ItemHeaderComponent = {
    titulo: 'Proveedor',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  headerEntidadComercialDireccionNueva: ItemHeaderComponent = {
    titulo: 'Registrar Dirección Nueva',
    opciones: [
      {
        icono: 'clear', nombre: 'Cancelar', disponible: true,
        idEvento: 1, toolTip: 'Cancelar registro', color: 'warn'
      },
      {
        icono: 'save_alt', nombre: 'Guardar', disponible: true,
        idEvento: 2, toolTip: 'Guardar registro', color: 'primary'
      }
    ]
  }

  headerEntidadComercialDireccionEditar: ItemHeaderComponent = {
    titulo: 'Actualizar Dirección',
    opciones: [
      {
        icono: 'clear', nombre: 'Cancelar', disponible: true,
        idEvento: 1, toolTip: 'Cancelar registro', color: 'warn'
      },
      {
        icono: 'save_alt', nombre: 'Guardar Cambios', disponible: true,
        idEvento: 2, toolTip: 'Actualizar registro', color: 'primary'
      }
    ]
  }

  listaTipoNit: Lista[];
  listaDirecciones: EntidadComercialDireccion[] = [];

  codErrores = {
    codigo: "*Campo Requerido",
    idTipoProveedor: "*Campo Requerido",
    entidadComercial: "*Campo Requerido",
    direccionFiscal: "*Campo Requerido",
    direccion: "*Campo Requerido"
  };

  colTipoProveedor: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", texto: true }
  ];

  headerDireccionFiscal: ItemHeaderComponent = {
    titulo: 'Dirección Fiscal',
    opciones: [
      {
        icono: 'navigate_next', nombre: 'Siguiente', disponible: true,
        idEvento: 2, toolTip: 'Siguiente Paso', color: 'primary'
      }
    ]
  }

  headerDireccionComercial: ItemHeaderComponent = {
    titulo: 'Dirección Comercial',
    opciones: [
      {
        icono: 'navigate_next', nombre: 'Siguiente', disponible: true,
        idEvento: 2, toolTip: 'Siguiente Paso', color: 'primary'
      }
    ]
  }

  constructor(private serviceComponent: ProveedorService, private sweetService: SweetService, private entidadComercialDireccionesService: EntidadComercialDireccionService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private tipoProveedorService: TipoProveedorService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.tipoProveedorService.getCargando().pipe(
        first(value => value === false)
      ).subscribe(res => {
        this.entidadComercialDireccionesService.getCargando().pipe(
          first(value => value === false)
        ).subscribe(res => this.validarPermiso());
      });
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

  eventoGetEntidadComercial(entidadComercial: EntidadComercial, stepper: MatStepper) {
    if (entidadComercial) {
      this.form.controls['entidadComercial'].setValue(entidadComercial);
      if (entidadComercial.direccionFiscal) {
        if (entidadComercial.direccionFiscal.id > 0) {
          this.form.controls['direccionFiscal'].setValue(entidadComercial.direccionFiscal);
        }
      }
      stepper.next();
    } else {
      this.form.controls['entidadComercial'].setValue(null);
      this.form.markAllAsTouched();
    }
  }

  eventoGetDireccionFiscal(direccionFiscal: Direccion[], stepper?: MatStepper) {
    if (direccionFiscal) {
      this.form.controls['direccionFiscal'].setValue(direccionFiscal);

      this.sweetService.sweet_confirmacion('Sugerencia', '¿Desea utilizar la Dirección Fiscal como Dirección Comercial?', 'question')
        .then(res => {
          if (res.isConfirmed) {
            this.form.controls['direccion'].setValue(direccionFiscal);
          } else {
            this.form.controls['direccion'].setValue(null);
          }
        });

      if (stepper) {
        stepper.next();
      }

    } else {
      this.form.controls['direccionFiscal'].setValue(null);
      this.form.markAllAsTouched();
    }
  }

  eventoGetDireccion(direccionFiscal: Direccion, stepper: MatStepper) {
    if (direccionFiscal) {
      console.log(direccionFiscal);
      this.form.controls['direccion'].setValue(direccionFiscal);
      stepper.next();
    } else {
      this.form.controls['direccion'].setValue(null);
      this.form.markAllAsTouched();
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
    this.tipoProveedorService.cargarPagina().pipe(first()).subscribe();
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      direccion: ["", [Validators.required]], //
      direccionFiscal: ["", [Validators.required]], //
      entidadComercial: ["", Validators.required], //
      //idCorporacion: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      idEmpresa: ["", [Validators.required]],
      idTipoProveedor: ["", [Validators.required]],
      fechaBaja: [""],
      idDireccion: [0],
      idEntidadComercial: [0],
      vDireccion: [""],
      vDireccionFiscal: [""],
      corporacion: [""],
      tipoProveedor: [""],
    });

    this.formDireccionNueva = this.formBuilder.group({
      id: [0],
      idEntidadComercial: [""], //Cliente
      idDireccion: [0],
      direccion: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      fechaCreacion: [new Date()],
      vDireccion: [""]
    });

    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).pipe(
      first()
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargarDirecciones();
    });
  }

  cargarDirecciones() {
    this.entidadComercialDireccionesService.getLista(this.form.controls['idEntidadComercial'].value)
      .pipe(first()).subscribe(res => {
        console.log(res);
        this.listaDirecciones = res;
        this.cargandoDatos = false;
      });
  }

  cargarDireccionId(id: number) {
    this.entidadComercialDireccionesService.getId(id)
      .pipe(first()).subscribe(res => {
        console.log(res);
        this.direccionEditar = true;
        this.direccionNueva = false;
        this.formDireccionNueva.controls['id'].enable();
        this.formDireccionNueva.controls['idDireccion'].enable();
        this.formDireccionNueva.controls['fechaCreacion'].enable();
        this.formDireccionNueva.setValue(res);
      });
  }

  guardarDireccionNueva(direccion: Direccion) {
    if (direccion) {
      this.formDireccionNueva.controls['direccion'].setValue(direccion);
      this.formDireccionNueva.controls['idEntidadComercial'].setValue(this.form.controls['idEntidadComercial'].value);

      this.formDireccionNueva.controls['id'].disable();
      this.formDireccionNueva.controls['idDireccion'].disable();
      this.formDireccionNueva.controls['fechaCreacion'].disable();

      if (this.formDireccionNueva.valid) {
        this.entidadComercialDireccionesService.crear(this.formDireccionNueva.value).pipe(first()).subscribe(res => {
          console.log(res);
          this.cargandoDatos = true;
          this.cargarDirecciones();
          this.sweetService.sweet_notificacion("Registro Guardado");
          this.direccionNueva = false;
          this.formDireccionNueva.reset();
        });
      } else {
        this.formDireccionNueva.markAllAsTouched();
        this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
      }
    }
  }

  actualizardireccion(direccion: Direccion) {
    this.formDireccionNueva.controls['direccion'].setValue(direccion);

    if (this.formDireccionNueva.valid) {
      this.entidadComercialDireccionesService.modificar(this.formDireccionNueva.value).pipe(first()).subscribe(res => {
        this.cargandoDatos = true;
        this.cargarDirecciones();
        this.sweetService.sweet_notificacion("Registro Actualizado");
        this.direccionEditar = false;
        this.formDireccionNueva.reset();
      });
    } else {
      if (direccion) {
        this.formDireccionNueva.markAllAsTouched();
        this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
      }
    }
  }

  eliminarDireccion(direccion: EntidadComercialDireccion) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar la dirección ${direccion.vDireccion}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.entidadComercialDireccionesService.eliminar(direccion.id).pipe(first())
            .subscribe(res => {
              this.listaDirecciones = this.listaDirecciones.filter(e => e.id != direccion.id);
              this.sweetService.sweet_notificacion("Registro eliminado");
            });
        }
      });
  }

  cambiarDireccionDefecto(direccion: EntidadComercialDireccion) {
    this.sweetService.sweet_confirmacion(
      '¿Cambiar Dirección Comercial?',
      `¿Desea usar la dirección ${direccion.vDireccion} como dirección comercial?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.entidadComercialDireccionesService.getId(direccion.id)
            .pipe(first()).subscribe(res => {
              this.form.controls['idDireccion'].setValue(res.direccion.id);
              this.form.controls['direccion'].setValue(res.direccion);
              this.modificarRegistro();
            });
        }
      });
  }

  getTiposProveedores() {
    return this.tipoProveedorService.getDatos();
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
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.form.controls['idEmpresa'].setValue(res.estacionTrabajo.sucursal.empresaId);
      if (this.form.valid) {
        this.serviceComponent.crear(this.form.value).pipe(
          first()
        ).subscribe((res) => {
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
        if (!this.form.controls['entidadComercial'].valid) {
          this.codErrores.entidadComercial = "Complete los campos y pulse en Siguiente.";
          this.sweetService.sweet_alerta('Error', 'Complete los Datos Comerciales y pulse en Siguiente.', 'error');
          return;
        }
        if (!this.form.controls['direccionFiscal'].valid) {
          this.codErrores.direccionFiscal = "Complete los campos y pulse en Siguiente.";
          this.sweetService.sweet_alerta('Error', 'Complete los datos de Dirección Fiscal y pulse en Siguiente.', 'error');
          return;
        }
        if (!this.form.controls['direccion'].valid) {
          this.codErrores.direccion = "Complete los campos y pulse en Siguiente.";
          this.sweetService.sweet_alerta('Error', 'Complete los datos de Dirección Comercial y pulse en Siguiente.', 'error');
          return;
        }
        this.form.markAllAsTouched();
        this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
      }
    });
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
      if (!this.form.controls['entidadComercial'].valid) {
        this.codErrores.entidadComercial = "Complete los campos y pulse en Siguiente.";
        this.sweetService.sweet_alerta('Error', 'Complete los Datos Comerciales y pulse en Siguiente.', 'error');
        return;
      }
      if (!this.form.controls['direccionFiscal'].valid) {
        this.codErrores.direccionFiscal = "Complete los campos y pulse en Siguiente.";
        this.sweetService.sweet_alerta('Error', 'Complete los datos de Dirección Fiscal y pulse en Siguiente.', 'error');
        return;
      }
      if (!this.form.controls['direccion'].valid) {
        this.codErrores.direccion = "Complete los campos y pulse en Siguiente.";
        this.sweetService.sweet_alerta('Error', 'Complete los datos de Dirección Comercial y pulse en Siguiente.', 'error');
        return;
      }
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
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

  opcionDisponibleDirecciones(opcion: string) {
    return this.entidadComercialDireccionesService.validarPermiso(opcion);
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
