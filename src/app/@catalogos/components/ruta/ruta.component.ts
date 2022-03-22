import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { LatLng } from 'src/app/@page/models/latlng';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { TipoLista } from '../../data/models/tipoLista';
import { Ubicacion } from '../../data/models/ubicacion';
import { ListaService } from '../../data/services/lista.service';
import { RutaService } from '../../data/services/ruta.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { UbicacionService } from '../../data/services/ubicacion.service';
import { UbicacionesComponent } from '../ubicacion/ubicaciones.component';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.component.html',
  styleUrls: ['./ruta.component.css']
})
export class RutaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Registro de Rutas Maestras',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }
  ubicacionOrigen: Ubicacion;
  ubicacionDestino: Ubicacion;
  codErrores = {
    codigo: "*Campo Requerido",
    nombre: "*Campo Requerido",
    existeRutaAlterna: "*Campo Requerido",
    distanciaKms: "*Campo Requerido",
    gradoPeligrosidad: "*Campo Requerido",
    estadoCarretera: "*Campo Requerido"
  };
  tipoLista_gradoPeligrosidad: TipoLista;
  tipoLista_estadoCarretera: TipoLista;
  listaGradoPeligrosidad: Lista[];
  listaEstadoCarretera: Lista[];
  origen: LatLng;
  destino: LatLng;

  constructor(private serviceComponent: RutaService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private UbicacionService: UbicacionService, private listaService: ListaService,
    private tipoListaService: TipoListaService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.UbicacionService.getCargando().pipe(
        first(value => value === false))
        .subscribe(() => {
          this.tipoListaService.getCargando().pipe(
            first(value => value === false)
          ).subscribe(() => {
            this.listaService.getCargando().pipe(
              first(value => value === false)
            ).subscribe(() => this.validarPermiso());
          });
        });
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
    this.cargarTiposLista();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idEmpresa: ["", [Validators.required]],
      idUbicacionOrigen: ["", [Validators.required]],
      idUbicacionDestino: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      existeRutaAlterna: ["", [Validators.required]],
      distanciaKms: ["", [Validators.required]],
      gradoPeligrosidad: ["", [Validators.required]],
      estadoCarretera: ["", [Validators.required]],
      vUbicacionDestino: [],
      vUbicacionOrigen: [],

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
      this.UbicacionService.getId(res.idUbicacionOrigen).pipe(first()).subscribe(ubOrigen => {
        this.ubicacionOrigen = ubOrigen;

        if (ubOrigen.latitud && ubOrigen.longitud) {
          this.origen = { nombre: "Ubicación de Origen", latitud: ubOrigen.latitud, longitud: ubOrigen.longitud }
        }

        this.UbicacionService.getId(res.idUbicacionDestino).pipe(first()).subscribe(ubDestino => {
          this.ubicacionDestino = ubDestino;

          if (ubDestino.latitud && ubDestino.longitud) {
            this.destino = { nombre: "Ubicación de Destino", latitud: ubDestino.latitud, longitud: ubDestino.longitud }
          }

          this.form.setValue(res);
          this.bloquearInputs();
          this.cargandoDatos = false;
        });
      });
    });
  }

  cargarTiposLista() {
    this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, 'gradoPeligrosidad')
      .pipe(first())
      .subscribe(res => {
        if (res.length > 0) {
          this.tipoLista_gradoPeligrosidad = res[0];
          this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, 'estadoCarretera')
            .pipe(first())
            .subscribe(res => {
              if (res.length > 0) {
                this.tipoLista_estadoCarretera = res[0];
                this.cargarListas();
              } else {
                this.sweetService.sweet_alerta('Error', 'El tipo de lista no ha sido creado', 'error');
                this.serviceComponent.paginaAnterior();
              }
            });
        } else {
          this.sweetService.sweet_alerta('Error', 'El tipo de lista no ha sido creado', 'error');
          this.serviceComponent.paginaAnterior();
        }
      });
  }

  cargarListas() {
    this.getEstacionTrabajo().pipe(first()).subscribe(resEstacion => {
      this.listaService.cargarPagina(this.tipoLista_gradoPeligrosidad.id, resEstacion.estacionTrabajo.sucursal.empresaId)
        .pipe(first()).subscribe(res => {
          this.listaGradoPeligrosidad = res;
          this.listaService.cargarPagina(this.tipoLista_estadoCarretera.id, resEstacion.estacionTrabajo.sucursal.empresaId)
            .pipe(first()).subscribe(res => {
              this.listaEstadoCarretera = res;
              this.configurarFormulario();
            }, (error) => {
              this.sweetService.sweet_alerta('Error', 'No es posible cargar la lista "Estado de Carretera"', 'error');
              this.serviceComponent.paginaAnterior();
            });
        }, (error) => {
          this.sweetService.sweet_alerta('Error', 'No es posible cargar la lista "Grados de Pligrosidad"', 'error');
          this.serviceComponent.paginaAnterior();
        });
    }, (error) => {
      this.sweetService.sweet_alerta('No es posible obtener la información de la empresa',
        'Vuelva a cargar la aplicación oh contacte con el administrador del sistema', 'error');
    });
  }

  guardarRegistro() {
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.form.controls['idEmpresa'].setValue(res.estacionTrabajo.sucursal.empresaId);
      if (this.form.valid) {
        console.log(this.form.value);

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
    }, (error) => {
      this.sweetService.sweet_alerta('No es posible obtener la información de la empresa',
        'Vuelva a cargar la aplicación oh contacte con el administrador del sistema', 'error');
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
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  abrirModalUbicacionOrigen() {
    this.UbicacionService.abrirModal(false, "Seleccione una Ubicación", UbicacionesComponent).subscribe((res: Ubicacion[]) => {
      if (res) {
        if (res[0].latitud && res[0].longitud) {
          this.origen = { nombre: "Ubicación de Origen", latitud: res[0].latitud, longitud: res[0].longitud };
        }

        this.form.controls['idUbicacionOrigen'].setValue(res[0].id);
        this.ubicacionOrigen = res[0];

        if (this.ubicacionDestino) {
          this.sugerirCodigoDeRuta();
        }
      }
    });
  }

  abrirModalUbicacionDestino() {
    this.UbicacionService.abrirModal(false, "Seleccione una Ubicación", UbicacionesComponent).subscribe((res: Ubicacion[]) => {
      if (res) {
        if (res[0].latitud && res[0].longitud) {
          this.destino = { nombre: "Ubicación de Destino", latitud: res[0].latitud, longitud: res[0].longitud };
        }

        this.form.controls['idUbicacionDestino'].setValue(res[0].id);
        this.ubicacionDestino = res[0];

        if (this.ubicacionOrigen) {
          this.sugerirCodigoDeRuta();
        }
      }
    });
  }

  sugerirCodigoDeRuta() {
    this.sweetService.sweet_confirmacion('Sugerencia de Código', `¿Desea utilizar el código ${this.ubicacionOrigen.codigo}${this.ubicacionDestino.codigo} como código de ruta?`)
      .then(res => {
        if (res.isConfirmed) {
          this.form.controls['codigo'].setValue(`${this.ubicacionOrigen.codigo}${this.ubicacionDestino.codigo}`);
        }
      });
  }

  getUbicacionString(ubicacion: Ubicacion): string {
    if (ubicacion) {
      return `${ubicacion.lugar}, ${ubicacion.esPuerto ? 'Es Puerto' : 'No Es Puerto'}, 
      Cód. Postal ${ubicacion.codigoPostal}, `;
    } else {
      return "";
    }

  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar - Agregar - Modificar");
      this.serviceComponent.paginaAnterior();
    }
  }

  getEstacionTrabajo() {
    return this.serviceComponent.getEstacionTrabajo();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
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
