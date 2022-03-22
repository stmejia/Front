import { TipoClienteService } from './../../data/services/tipo-cliente.service';
import { Direccion } from './../../data/models/direccion';
import { EntidadComercial } from './../../data/models/entidadComercial';
import { ClienteService } from './../../data/services/cliente.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Lista } from '../../data/models/lista';
import { MatStepper } from '@angular/material/stepper';
import { Columna } from 'src/app/@page/models/columna';
import { EntidadComercialDireccion } from '../../data/models/entidadComercialDireccion';
import { EntidadComercialDireccionService } from '../../data/services/entidad-comercial-direccion.service';
import { MatDialog } from '@angular/material/dialog';
import { ClienteTarifaService } from '../../data/services/cliente-tarifa.service';
import { forkJoin } from 'rxjs';
import { DataClienteTarifa } from '../../data/models/dataClienteTarifa';
import { ClienteTarifaComponent } from './cliente-tarifa.component';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})

export class ClienteComponent implements OnInit {

  cargandoDatos: boolean = true;
  direccionNueva: boolean = false;
  direccionEditar: boolean = false;

  form: FormGroup;
  formDireccionNueva: FormGroup;

  header: ItemHeaderComponent = {
    titulo: 'Registro de Cliente',
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
    titulo: 'Dirección Fiscal De Cliente',
    opciones: [
      {
        icono: 'navigate_next', nombre: 'Siguiente', disponible: true,
        idEvento: 2, toolTip: 'Siguiente Paso', color: 'primary'
      }
    ]
  }

  listaTipoNit: Lista[];
  listaDirecciones: EntidadComercialDireccion[] = [];

  codErrores = {
    diasCredito: "*Campo Requerido",
    entidadComercial: "*Campo Requerido",
    direccion: "",
    direccionFiscal: "",
    codigo: ""
  };

  colTipoCliente: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", texto: true }
  ];

  public colClientetarifa: Columna[] = [
    { nombre: 'Código Tarifa', targetOpt: ['tarifa', 'codigo'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Servicio', targetOpt: ['tarifa','servicio','nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Precio Estandar', targetOpt: ['tarifa', 'precio'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Precio Pactado', targetId: 'precio', tipo: 'texto', aligment: 'left' },
    { nombre: 'Activa', targetId: 'activa', tipo: 'boolean', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' },
    { nombre: 'Vigente Hasta', targetId: 'vigenciaHasta', tipo: 'fecha', aligment: 'center' },
  ];

  constructor(private serviceComponent: ClienteService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private tipoClienteService: TipoClienteService,
    private entidadComercialDireccionesService: EntidadComercialDireccionService,
    private clienteTarifaService: ClienteTarifaService, public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(value => value === false)),
      this.tipoClienteService.getCargando().pipe(first(value => value === false)),
      this.entidadComercialDireccionesService.getCargando().pipe(first(value => value === false)),
      this.clienteTarifaService.getCargando(),
    ]).subscribe(() => this.validarPermiso(), (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar los servicios", 'error');
      this.serviceComponent.paginaAnterior();
    });
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

  eventoGetDireccionFiscal(direccionFiscal: Direccion, stepper?: MatStepper) {
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
    this.clienteTarifaService.setDatos([]);
    this.tipoClienteService.cargarPagina().pipe(first()).subscribe();
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      direccion: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      direccionFiscal: ["", [Validators.required]],
      entidadComercial: ["", Validators.required],
      //idCorporacion: ["", [Validators.required]],
      diasCredito: ["", [Validators.required]],
      fechaBaja: [""],
      idDireccion: [0],
      idEmpresa: ["", [Validators.required]],
      idEntidadComercial: [0],
      vDireccion: [""],
      vDireccionFiscal: [""],
      corporacion: [""],
      tipoCliente: [""],
      idTipoCliente: ["", [Validators.required]]
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

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).pipe(
      first()
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      //this.cargandoDatos = false;
      this.cargarDirecciones();
      let f: QueryFilter[] = [];
      f.push({ filtro: "PageNumber", parametro: 1 });
      f.push({ filtro: "idCliente", parametro: this.form.controls["id"].value });
      this.clienteTarifaService.cargarPagina(f);
    })
  }

  abrirModalClienteTarifa() {
    this.habilitarInputs();
    let datos: DataClienteTarifa = {
      objeto: this.form.value,
      titulo: 'Asignar Tarifa A Cliente',
      tipo: 'cliente'
    }
    let dialogRef = this.dialog.open(ClienteTarifaComponent, {
      data: datos
    });

    dialogRef.afterClosed().pipe(first()).subscribe();
    this.bloquearInputs();
  }

  getClienteTarifa() {
    return this.clienteTarifaService.getDatos();
  }

  getPaginadorCT() {
    return this.clienteTarifaService.getPaginador();
  }

  eventoPaginadorCT(event: EventoPaginador) {
    let f: QueryFilter[] = [];
    f.push({ filtro: "PageNumber", parametro: event.noPagina });
    f.push({ filtro: "idCliente", parametro: this.form.controls["id"].value });
    this.clienteTarifaService.cargarPagina(f);
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

  getTiposClientes() {
    return this.tipoClienteService.getDatos();
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

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['codigo'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['codigo'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  guardarRegistro() {
    console.log(this.form.value);
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.form.controls['idEmpresa'].setValue(res.estacionTrabajo.sucursal.empresaId);
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
    })
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
