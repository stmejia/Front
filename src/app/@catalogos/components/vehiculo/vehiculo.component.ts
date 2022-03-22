import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { TipoLista } from '../../data/models/tipoLista';
import { TipoVehiculo } from '../../data/models/tipoVehiculo';
import { ActivoOperacionService } from '../../data/services/activo-operacion.service';
import { ListaService } from '../../data/services/lista.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { TipoVehiculoService } from '../../data/services/tipo-vehiculo.service';
import { TransporteService } from '../../data/services/transporte.service';
import { VehiculoService } from '../../data/services/vehiculo.service';

@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.css']
})

export class VehiculoComponent implements OnInit {

  cargando: boolean = true;
  form: FormGroup;
  formActivo: FormGroup;
  imgRecursoFotos: ImagenRecursoConfiguracion = null;
  imgRecursoTarjetaCirculacion: ImagenRecursoConfiguracion = null;

  erroresActivoOperacion: { [key: string]: any } = {};

  header: ItemHeaderComponent = {
    titulo: 'Vehiculo',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    motor: "*Campo Requerido",
    ejes: "*Campo Requerido",
    tarjetaCirculacion: "*Campo Requerido",
    placa: "*Campo Requerido",
    tamanoMotor: "*Campo Requerido",
    llantas: "*Campo Requerido",
    distancia: "*Campo Requerido",
    potencia: "*Campo Requerido",
    tornamesaGraduable: "*Campo Requerido",
    capacidadCarga: "*Campo Requerido",
    carroceria: "*Campo Requerido",
    tipoCarga: "*Campo Requerido",
    tipoVehiculo: "*Campo Requerido",
    tipoMotor: "*Campo Requerido",
    tipoMovimiento: "",
    dobleRemolque: "",
    aptoParaCentroAmerica: "",
    medidaFurgon: ""
  };

  codErroresA = {
    fechaBaja: "*Campo Requerido",
    categoria: "*Campo Requerido",
    color: "*Campo Requerido",
    marca: "*Campo Requerido",
    vin: "*Campo Requerido",
    serie: "*Campo Requerido",
    modeloAnio: "*Campo Requerido, el valor minimo es 1950",
    correlativo: "*Campo Requerido",
    idTransporte: "*Campo Requerido",
    descripcion: "*Campo Requerido"
  };

  colTipoVehiculo: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  colTransportes: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" }
  ];

  tipoVehiculo: TipoVehiculo;

  TL_Distancia: TipoLista;
  TL_Potencia: TipoLista;
  TL_TornamesaGraduable: TipoLista;
  TL_CapacidadCarga: TipoLista;
  TL_Carroceria: TipoLista;
  TL_TipoCarga: TipoLista;
  TL_TipoVehiculo: TipoLista;
  TL_Capacidad: TipoLista;
  TL_TipoMotor: TipoLista;
  TL_TipoMaquinaria: TipoLista;
  TL_Flota: TipoLista;

  listaDistancia: Lista[] = [];
  listaPotencia: Lista[] = [];
  listaTornamesaGraduable: Lista[] = [];
  listaCapacidadCarga: Lista[] = []; //Camion
  listaCarroceria: Lista[] = [];
  listaTipoCarga: Lista[] = [];
  listaTipoVehiculo: Lista[] = [];
  listaCapacidad: Lista[] = []; //MontaCarga
  listaTipoMotor: Lista[] = [];
  listaTipoMaquinaria: Lista[] = [];
  listaFlota: Lista[] = [];
  listaTipoMovimiento: Lista[] = [];
  listaDobleRemolque: Lista[] = [];
  listaAptoParaCentroAmerica: Lista[] = [];
  listaMedidaFurgon: Lista[] = [];

  constructor(private tipoVehiculoService: TipoVehiculoService, private sweetService: SweetService, private formBuilder: FormBuilder,
    private tipoListaService: TipoListaService, private listaService: ListaService, private serviceComponent: VehiculoService,
    private activatedRoute: ActivatedRoute, private activoOperacionService: ActivoOperacionService, private transporteService: TransporteService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(val => val === false)),
      this.tipoVehiculoService.getCargando().pipe(first(val => val === false)),
      this.tipoListaService.getCargando().pipe(first(val => val === false)),
      this.listaService.getCargando().pipe(first(val => val === false)),
      this.activoOperacionService.getCargando().pipe(first(val => val === false)),
      this.transporteService.getCargando(),
    ]).subscribe(res => {
      this.cargarComponent();
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

  cargarComponent() {
    if (this.isNuevo()) {
      this.header.opciones.push({
        //icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'),
        icono: 'save_alt', nombre: 'Guardar', disponible: true,
        idEvento: 2, toolTip: 'Guardar Registro', color: 'primary'
      });
    } else {
      this.header.opciones.push({
        //icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'),
        icono: 'save_alt', nombre: 'Guardar Cambios', disponible: true,
        idEvento: 3, toolTip: 'Guardar Registro', color: 'primary'
      });
    }

    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });

    this.tipoVehiculoService.cargarPagina().pipe(first()).subscribe();
    this.imgRecursoFotos = this.activoOperacionService.getImagenRecurso("Fotos");
    this.serviceComponent.getImagenRecursoConfiguracion("ImagenTarjetaCirculacion").subscribe(res => {
      this.imgRecursoTarjetaCirculacion = res;
      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      activoOperacion: [""],
      idTipoVehiculo: ["", [Validators.required]],
      motor: [""],//
      ejes: [""],//
      tarjetaCirculacion: [""],//
      placa: ["", [Validators.required]],//
      tamanoMotor: [""],//
      llantas: [""],//
      distancia: [""],//---------- ----------
      potencia: [""],//
      tornamesaGraduable: [""],//
      capacidadCarga: [""],//
      carroceria: [""],//
      tipoCarga: [""],//
      tipoVehiculo: [""],//
      tipoMotor: [""],//
      polizaSeguro: [""],
      tipoMovimiento: [""],
      dobleRemolque: [""],
      aptoParaCentroAmerica: [""],
      imagenTarjetaCirculacion: [""],
      medidaFurgon: [""],
      idEstacion: [this.serviceComponent.getEstacionTrabajo().id]
    });

    this.formActivo = this.formBuilder.group({
      id: [0],
      idEmpresa: [this.serviceComponent.getEmpresa().id],
      codigo: [""],
      descripcion: [""],
      idActivoGenerales: [0],
      fechaCreacion: [new Date],
      fechaBaja: [""],
      categoria: [""],
      color: [""],
      marca: [""],
      vin: [""],
      correlativo: ["", [Validators.max(9999)]],
      serie: [""],
      modeloAnio: [""],
      idTransporte: [""],
      flota: [""],
      coc: [""],
      fotos: [""],
      transporte: [""]
    });
    this.cargarTiposLista();
    this.bloquearInputs();
  }

  cargarTiposLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "distancia").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "potencia").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tornamesaGraduable").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "capacidadCarga").pipe(first()), //Camion
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "carroceria").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoCarga").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoVehiculo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "capacidad").pipe(first()), // MontaCarga
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoMotor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoMaquinaria").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.activoOperacionService.getRecurso().id, "flota").pipe(first()),
    ]).subscribe(res => {
      this.TL_Distancia = res[0][0];
      this.TL_Potencia = res[1][0];
      this.TL_TornamesaGraduable = res[2][0];
      this.TL_CapacidadCarga = res[3][0];
      this.TL_Carroceria = res[4][0];
      this.TL_TipoCarga = res[5][0];
      this.TL_TipoVehiculo = res[6][0];
      this.TL_Capacidad = res[7][0];
      this.TL_TipoMotor = res[8][0];
      this.TL_TipoMaquinaria = res[9][0];
      this.TL_Flota = res[10][0];
      this.cargarListas();
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_Distancia.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Potencia.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TornamesaGraduable.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_CapacidadCarga.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Carroceria.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoCarga.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoVehiculo.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Capacidad.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoMotor.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoMaquinaria.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Flota.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.serviceComponent.getListas("tipoMovimiento"),
      this.serviceComponent.getListas("dobleRemolque"),
      this.serviceComponent.getListas("aptoCentroAmerica"),
      this.serviceComponent.getListas("medidaFurgon"),
    ]).pipe(first()).subscribe(res => {
      this.listaDistancia = res[0];
      this.listaPotencia = res[1];
      this.listaTornamesaGraduable = res[2];
      this.listaCapacidadCarga = res[3];
      this.listaCarroceria = res[4];
      this.listaTipoCarga = res[5];
      this.listaTipoVehiculo = res[6];
      this.listaCapacidad = res[7];
      this.listaTipoMotor = res[8];
      this.listaTipoMaquinaria = res[9];
      this.listaFlota = res[10];
      this.listaTipoMovimiento = res[11];
      this.listaDobleRemolque = res[12];
      this.listaAptoParaCentroAmerica = res[13];
      this.listaMedidaFurgon = res[14];
      console.log(res);

      this.transporteService.cargarPagina().pipe(first()).subscribe();
      this.cargarDatos(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    });
  }

  bloquearInputs() {
    this.formActivo.controls['fechaCreacion'].disable();
    this.formActivo.controls['fechaBaja'].disable();
    this.form.controls["motor"].disable();
    this.form.controls["ejes"].disable();
    this.form.controls["tamanoMotor"].disable();
  }

  habilitarInputs() {
    this.formActivo.controls['fechaCreacion'].enable();
    this.formActivo.controls['fechaBaja'].enable();
  }

  cargarDatos(id: number) {
    if (!this.isNuevo()) {
      this.form.addControl("idActivo", new FormControl());
      this.form.addControl("fechaCreacion", new FormControl());
      this.serviceComponent.getId(id).subscribe(res => {
        this.form.patchValue(res);
        this.formActivo.patchValue(res.activoOperacion);
        this.habilitarInputs();
        this.getTipoVehiculo().pipe(first(val => val.length > 0)).subscribe(resTV => {
          this.tipoVehiculo = resTV.filter(val => val.id == this.form.controls["idTipoVehiculo"].value)[0];
          this.bloquearInputs();
          this.cargando = false;
        });
      });
    } else {
      this.cargando = false;
    }
  }

  getTipoVehiculo() {
    return this.tipoVehiculoService.getDatos();
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  guardarRegistro() {
    if (this.form.valid && this.formActivo.valid) {
      this.form.controls["activoOperacion"].setValue(this.formActivo.value);

      this.serviceComponent.crear(this.form.value).pipe(first())
        .subscribe(res => {
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
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", 'error');
      this.erroresActivoOperacion = [];
      this.form.markAllAsTouched();
    }
  }

  modificarRegistro() {
    if (this.form.valid && this.formActivo.valid) {
      this.form.controls["activoOperacion"].setValue(this.formActivo.value);
      this.serviceComponent.modificar(this.form.value).pipe(first())
        .subscribe(res => {
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
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", 'error');
      this.erroresActivoOperacion = [];
      this.form.markAllAsTouched();
    }
  }

  mostrarCampo(campo: string): boolean {
    try {
      if (this.tipoVehiculo) {
        if (this.tipoVehiculo.estructuraCoc.toLocaleLowerCase().indexOf(campo.toLocaleLowerCase()) !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  getTransportes() {
    return this.transporteService.getDatos();
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  errores(validaciones: any) {
    let erroresAO: { [key: string]: any } = {}
    for (const validacion in validaciones) {
      var error = validaciones[validacion];
      if (validacion.startsWith("activoOperacion.")) {
        erroresAO[validacion.substring(16)] = error;
      }
      for (const codError in this.codErrores) {
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
    this.erroresValidacion(erroresAO);
  }

  erroresValidacion(validaciones: any) {
    for (const validacion in validaciones) {
      var error = validaciones[validacion];
      for (const codError in this.codErrores) {
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          this.codErrores[codError] = error;
          this.formActivo.get(codError).setErrors(["api"]);
          this.formActivo.markAllAsTouched();
        }
      }
    }
  }
}
