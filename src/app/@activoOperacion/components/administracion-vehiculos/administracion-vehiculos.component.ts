import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Lista } from 'src/app/@catalogos/data/models/lista';
import { TipoLista } from 'src/app/@catalogos/data/models/tipoLista';
import { TipoVehiculo } from 'src/app/@catalogos/data/models/tipoVehiculo';
import { ActivoOperacionService } from 'src/app/@catalogos/data/services/activo-operacion.service';
import { ListaService } from 'src/app/@catalogos/data/services/lista.service';
import { TipoListaService } from 'src/app/@catalogos/data/services/tipo-lista.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { ControlVehiculosService } from '../../data/services/control-vehiculos.service';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { SweetAlertOptions } from 'sweetalert2';
import { ControlEventosEquiposService } from '../../data/services/control-eventos-equipos.service';
import { EventosControlEquipo } from '../../data/models/eventosControlEquipo';

@Component({
  selector: 'app-administracion-vehiculos',
  templateUrl: './administracion-vehiculos.component.html',
  //styleUrls: ['./administracion-vehiculos.component.css']
})

export class AdministracionVehiculosComponent implements OnInit {

  cargando: boolean = true;
  rutaComponent: string = "";
  tipoVehiculo: TipoVehiculo = null;

  columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'Código', target: ["activoOperacion", "codigo"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ["activoOperacion", "coc"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Transporte', target: ["activoOperacion", "transporte", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
    //{ titulo: 'Propio', target: ["activoOperacion", "transporte", "propio"], tipo: 'boolean', aligment: 'left', visible: false },
    { titulo: 'Lugar', target: ['activoOperacion', 'movimientoActual', 'lugar'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Estado', target: ['activoOperacion', 'movimientoActual', 'estado', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Disponible', target: ['activoOperacion', 'movimientoActual', 'estado', 'disponible'], tipo: 'boolean', aligment: 'center', visible: true },
    { titulo: "Dias S/Mov.", target: ["activoOperacion", "movimientoActual", "vDiasUltMov"], tipo: "texto", aligment: "right", visible: true },
    { titulo: 'U. Servicio', target: ['activoOperacion', 'movimientoActual', 'servicio', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'U. Ruta', target: ['activoOperacion', 'movimientoActual', 'ruta', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: "Piloto", target: ["activoOperacion", "movimientoActual", "empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["activoOperacion", "movimientoActual", "usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Observaciones", target: ["activoOperacion", "movimientoActual", "observaciones"], tipo: "texto", aligment: "left", visible: true },
  ];

  colTipoVehiculo: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  colEstadosActivo: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" },
  ];

  queryFilters: QueryFilter[] = [
    { filtro: "equipoActivo", parametro: "" },
    { filtro: "propio", parametro: "" },
    { filtro: "idEstado", parametro: "" },
    { filtro: "flota", parametro: "" },
    { filtro: "distancia", parametro: "" },
    { filtro: "potencia", parametro: "" },
    { filtro: "tornamesaGraduable", parametro: "" },
    { filtro: "capacidadCarga", parametro: "" },
    { filtro: "carroceria", parametro: "" },
    { filtro: "tipoCarga", parametro: "" },
    { filtro: "tipoVehiculo", parametro: "" },
    { filtro: "capacidadCarga", parametro: "" },
    { filtro: "tipoMotor", parametro: "" },
    { filtro: "tipoVehiculo", parametro: "" },
    { filtro: "idTipoVehiculo", parametro: "" },
    { filtro: "PageNumber", parametro: "" },
    { filtro: "global", parametro: false },
    { filtro: "idEstacionTrabajo", parametro: "" },
  ];

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
  listaCapacidadCargaCamion: Lista[] = []; //Camion
  listaCarroceria: Lista[] = [];
  listaTipoCarga: Lista[] = [];
  listaTipoVehiculo: Lista[] = [];
  listaCapacidadMontaCarga: Lista[] = []; //MontaCarga
  listaTipoMotor: Lista[] = [];
  listaTipoMaquinaria: Lista[] = [];
  listaFlota: Lista[] = [];
  listaEstados: Estados[] = [];

  constructor(private serviceComponent: ControlVehiculosService, private sweetService: SweetService,
    private router: Router, private tipoListaService: TipoListaService, private listaService: ListaService,
    private activoOperacionService: ActivoOperacionService, private reporteService: ReportesService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(value => value === false)),
      this.tipoListaService.getCargando().pipe(first(val => val === false)),
      this.listaService.getCargando().pipe(first(val => val === false)),
      this.activoOperacionService.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        //this.cargarPagina(1);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
      case 2:
        this.ponerEnBodega(event.objeto)
        break;
      case 3:
        this.ponerEnReparacion(event.objeto)
        break;
      case 4:
        this.ponerEnRentaInterna(event.objeto)
        break;
      case 5:
        this.ponerEnRentaExterna(event.objeto)
        break;
      case 6:
        this.ponerEnRuta(event.objeto)
        break;
      case 7:
        this.crearEvento(event.objeto)
        break;
      case 8:
        this.ponerDisponible(event.objeto)
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  cargarComponent() {
    if (this.router.url.endsWith('administracionVehiculos')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: "Administración De Vehículos",
          opciones: []
        },
        isModal: false
      });

      this.serviceComponent.setMenuOpcionesTabla([
        { icono: "find_in_page", nombre: "Consultar Movimientos", idEvento: 1, disponible: this.opcionDisponible("Historial") },
        { icono: "garage", nombre: "Poner En Bodega", idEvento: 2, disponible: this.opcionDisponible("PonerBodega") },
        { icono: "build", nombre: "Enviar A Reparación", idEvento: 3, disponible: this.opcionDisponible("PonerReparacion") },
        { icono: "rv_hookup", nombre: "Renta Interna", idEvento: 4, disponible: this.opcionDisponible("RentaInterna") },
        { icono: "rv_hookup", nombre: "Renta Externa", idEvento: 5, disponible: this.opcionDisponible("RentaExterna") },
        { icono: "add_road", nombre: "Enviar A Ruta", idEvento: 6, disponible: this.opcionDisponible("EnviarRuta") },
        { icono: "report_problem", nombre: "Crear Evento", idEvento: 7, disponible: this.opcionDisponible("AgregarEvento") },
        { icono: "task_alt", nombre: "Poner En Disponible", idEvento: 8, disponible: this.opcionDisponible("Poner Disponible") },
      ]);
      this.cargarTiposLista();
    } else {
      this.cargando = false;
    }
  }

  cargarTiposLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "distancia").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "potencia").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "tornamesaGraduable").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "capacidadCarga").pipe(first()), //Camion
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "carroceria").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "tipoCarga").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "tipoVehiculo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "capacidad").pipe(first()), // MontaCarga
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "tipoMotor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoVehiculos().id, "tipoMaquinaria").pipe(first()),
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
      this.serviceComponent.getEstados()
    ]).subscribe(res => {
      this.listaDistancia = res[0] as Lista[];
      this.listaPotencia = res[1] as Lista[];
      this.listaTornamesaGraduable = res[2] as Lista[];
      this.listaCapacidadCargaCamion = res[3] as Lista[];
      this.listaCarroceria = res[4] as Lista[];
      this.listaTipoCarga = res[5] as Lista[];
      this.listaTipoVehiculo = res[6] as Lista[];
      this.listaCapacidadMontaCarga = res[7] as Lista[];
      this.listaTipoMotor = res[8] as Lista[];
      this.listaTipoMaquinaria = res[9] as Lista[];
      this.listaFlota = res[10] as Lista[];
      this.listaEstados = res[11] as Estados[];
      this.cargando = false;
    });
  }

  limpiarFiltros() {
    this.queryFilters.forEach(f => {
      if (!f.filtro.includes('global')) {
        f.parametro = "";
      }
    });
    this.tipoVehiculo = null;
  }

  getTipoVehiculo() {
    return this.serviceComponent.getTiposVehiculos();
  }

  cargarPagina(noPagina) {
    this.queryFilters.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.queryFilters[i].parametro = noPagina;
      }
      if (f.filtro == "idTipoVehiculo" && this.tipoVehiculo) {
        this.queryFilters[i].parametro = this.tipoVehiculo.id
      }
      if (f.filtro == "idEstacionTrabajo") {
        this.queryFilters[i].parametro = this.serviceComponent.getEstacionTrabajo().id;
      }
    });
    this.serviceComponent.cargarPagina(this.queryFilters.filter(f => f.parametro !== ""));
  }

  ponerEnBodega(equipo: Vehiculo) {
    if (equipo.activoOperacion.movimientoActual.estado.evento.toLocaleLowerCase().includes("egresado")) {
      let opt: SweetAlertOptions = {
        title: "¿Poner En Bodega?",
        icon: "question",
        heightAuto: false,
        showCancelButton: true,
        input: "textarea",
        confirmButtonText: "Poner En Bodega",
        html: `
        <p class="text-left text-bold">¿Desea asignar el equipo ${equipo.activoOperacion.codigo} a bodega del cliente?</p>
        <p>Observaciones: </p>
        `
      }
      this.sweetService.sweet_custom(opt).then(r => {
        if (r.isConfirmed) {
          let reserva: any = {
            idActivo: equipo.idActivo,
            idEmpresa: this.serviceComponent.getEmpresa().id,
            idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
            idUsuario: this.serviceComponent.getUsuario().id,
            //documento: equipo.activoOperacion.movimientoActual.documento,
            lugar: this.serviceComponent.getEstacionTrabajo().nombre,
            observaciones: r.value ? r.value : ''
          }
          this.serviceComponent.ponerBodegaEquipo(reserva).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion("Equipo asignao a bodega de cliente");
            this.cargarPagina(1);
          });
        }
      })
    } else {
      this.sweetService.sweet_alerta("Error", "El equipo debe estar en ruta", "error");
    }
  }

  ponerEnReparacion(equipo: Vehiculo) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Reparación?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Reparación",
      html: `
      <p class="text-left text-bold">¿Desea enviar a reparación el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.enviarReparacionEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a reparación");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRentaInterna(equipo: Vehiculo) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Renta Interna?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Renta Interna",
      html: `
      <p class="text-left text-bold">¿Desea enviar a renta interna el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }
        this.serviceComponent.evniarRentaInternaEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a renta interna");
          this.cargarPagina(1);
        });
      }
    });
  }

  ponerEnRentaExterna(equipo: Vehiculo) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Renta Externa?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Renta Externa",
      html: `
      <p class="text-left text-bold">¿Desea enviar a renta externa el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }
        this.serviceComponent.evniarRentaExternaEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a renta externa");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRuta(equipo: Vehiculo) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Ruta?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Ruta",
      html: `
      <p class="text-left text-bold">¿Desea enviar a ruta el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }
        this.serviceComponent.enviarRuta(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a ruta");
          this.cargarPagina(1);
        });
      }
    })
  }

  crearEvento(equipo: Vehiculo) {
    let opt: SweetAlertOptions = {
      title: "Crear Evento",
      heightAuto: false,
      icon: 'warning',
      showCancelButton: true,
      //input: "textarea",
      confirmButtonText: "Crear Evento",
      html: `
      <p class="text-left p-0 m-0"><b>Código De Equipo: </b>${equipo.activoOperacion.codigo}</p>
      <p class="text-left p-0 m-0 pt-10"><b>Titulo De Evento:</b> </p>
      <input id="swal-input1" class="swal2-input p-0 m-0">
      <p class="text-left p-0 m-0 pt-10"><b>Observaciones:</b> </p>
      <textarea id="swal-input2" class="swal2-input p-0 m-0"></textarea>
      `,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('swal-input1')).value,
          (<HTMLTextAreaElement>document.getElementById('swal-input2')).value
        ]
      }
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        if (r.value[0].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar un Titulo Valido para el Evento.', 'error');
          return;
        }
        if (r.value[1].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar una Observación Valida para el Evento.', 'error');
          return;
        }

        let eventoRevisa: EventosControlEquipo = {
          idActivo: equipo.activoOperacion.id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          descripcionEvento: r.value[0],
          bitacoraObservaciones: r.value[1],
          idUsuarioRevisa: this.serviceComponent.getUsuario().id,
        }
        this.serviceComponent.crearEvento(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
        });
      }
    });
  }

  ponerDisponible(equipo: Vehiculo) {
    if (!this.serviceComponent.validarPermiso("Poner Disponible")) {
      this.serviceComponent.errorPermiso("Poner En Disponible");
      return;
    }

    let opt: SweetAlertOptions = {
      title: "¿Poner El Equipo Disponible?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Poner En Disponible",
      html: `
        <p class="text-left text-bold">¿Desea colocar el equipo ${equipo.activoOperacion.codigo} como disponible?</p>
        <p>Observaciones: </p>
        `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.ponerDisponible(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("El equipo ha sido colocado como disponible", 5000, 'info');
          this.cargarPagina(1);
        });
      }
    })
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  generarExcel(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Administración De Vehículos", bold: true, size: 14 },
      ]
    }

    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }

    this.reporteService.generarExcelTabla(evento.columnas, evento.datos, titulos);
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Administración De Vehículos", bold: true, size: 18 }
      ]
    }
    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }
    this.reporteService.generarPDFTabla(evento.columnas, evento.datos, titulos);
  }

  getSubtituloFiltrosAplicados() {
    let filtrosAplicados = "Filtros Aplicados: ";
    this.queryFilters.forEach((f, i) => {
      if (f.parametro !== "") {
        switch (f.filtro) {
          case "idTipoVehiculo":
            filtrosAplicados += ` -Tipo De Vehiculo: ${this.serviceComponent.getTiposVehiculosValue().find(t => t.id.toString() == f.parametro).prefijo}`;
            break;
          case "flota":
            filtrosAplicados += ` -Flota: ${f.parametro}`;
            break;
          case "propio":
            filtrosAplicados += ` -Equipo Propio: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "equipoActivo":
            filtrosAplicados += ` -Equipo Activo: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "idEstado":
            filtrosAplicados += ` -Estado: ${this.listaEstados.find(t => t.id.toString() == f.parametro).nombre}`;
            break;
          case "distancia":
            filtrosAplicados += ` -Distancia: ${f.parametro}`;
            break;
          case "potencia":
            filtrosAplicados += ` -Potencia: ${f.parametro}`;
            break;
          case "tornamesaGraduable":
            filtrosAplicados += ` -Tornamesa Graduable: ${f.parametro}`;
            break;
          case "capacidadCarga":
            filtrosAplicados += ` -Capacidad De Carga:  ${f.parametro}`;
            break;
          case "carroceria":
            filtrosAplicados += ` -Carroceria: ${f.parametro}`;
            break;
          case "tipoCarga":
            filtrosAplicados += ` -Tipo De Carga: ${f.parametro}`;
            break;
          case "tipoVehiculo":
            filtrosAplicados += ` -Tipo De Vehículo: ${f.parametro}`;
            break;
          case "tipoMotor":
            filtrosAplicados += ` -Tipo De Motor: ${f.parametro}`;
            break;
          case "tipoMaquina":
            filtrosAplicados += ` -Tipo De Maquinaria ${f.parametro}`
            break;
          case "global":
            filtrosAplicados += ` -Global: ${f.parametro ? 'Si' : 'No'}`
            break;
        }
      }
    });
    return filtrosAplicados;
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getTipoVehiculoSelect() {
    if (this.tipoVehiculo) {
      return this.tipoVehiculo.id
    } else {
      return "";
    }
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  getOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
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

  limpiarDatos() {
    this.serviceComponent.setDatos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }
}
