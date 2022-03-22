import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { EquipoRemolque } from 'src/app/@catalogos/data/models/equipoRemolque';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Lista } from 'src/app/@catalogos/data/models/lista';
import { TipoEquipoRemolque } from 'src/app/@catalogos/data/models/tipoEquipoRemolque';
import { TipoLista } from 'src/app/@catalogos/data/models/tipoLista';
import { ActivoOperacionService } from 'src/app/@catalogos/data/services/activo-operacion.service';
import { ListaService } from 'src/app/@catalogos/data/services/lista.service';
import { TipoListaService } from 'src/app/@catalogos/data/services/tipo-lista.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { Columna } from 'src/app/@page/models/columna';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { EventosControlEquipo } from '../../data/models/eventosControlEquipo';
import { ControlEquipoService } from '../../data/services/control-equipo.service';
import { ControlEventosEquiposService } from '../../data/services/control-eventos-equipos.service';

@Component({
  selector: 'app-administracion-equipos-remolque',
  templateUrl: './administracion-equipos-remolque.component.html',
  styleUrls: ['./administracion-equipos-remolque.component.css']
})
export class AdministracionEquiposRemolqueComponent implements OnInit {

  cargando: boolean = true;
  rutaComponent: string = "";
  tipoEquipo: TipoEquipoRemolque = null;

  TL_NoEjes: TipoLista;
  TL_TandemCorredizo: TipoLista;
  TL_ChasisExtensible: TipoLista;
  TL_TipoCuello: TipoLista;
  TL_AcopleGenset: TipoLista;
  TL_AcopleDolly: TipoLista;
  TL_MedidaPlataforma: TipoLista;
  TL_PlataformaExtensible: TipoLista;
  TL_Pechera: TipoLista;
  TL_CapacidadCargaLB: TipoLista;
  TL_lbExtensible: TipoLista;
  TL_AlturaContenedor: TipoLista;
  TL_TipoContenedor: TipoLista;
  TL_MarcaUR: TipoLista;
  TL_EjeCorredizo: TipoLista;
  TL_LargoFurgon: TipoLista;
  TL_MedidasFurgon: TipoLista;
  TL_RielesHorizontales: TipoLista;
  TL_RielesVerticales: TipoLista;
  TL_Flota: TipoLista;

  listaNoEjes: Lista[] = [];
  listaTandemCorredizo: Lista[] = [];
  listaChasisExtensible: Lista[] = [];
  listaTipoCuello: Lista[] = [];
  listaAcopleGenset: Lista[] = [];
  listaAcopleDolly: Lista[] = [];
  listaMedidaPlataforma: Lista[] = [];
  listaPlataformaExtensible: Lista[] = [];
  listaPechera: Lista[] = [];
  listaCapacidadCargaLB: Lista[] = [];
  listaLbExtensible: Lista[] = [];
  listaAlturaContenedor: Lista[] = [];
  listaTipoContenedor: Lista[] = [];
  listaMarcaUR: Lista[] = [];
  listaEjeCorredizo: Lista[] = [];
  listaFurgonLargo: Lista[] = [];
  listaMedidasFurgon: Lista[] = [];
  listaRielesHorizontales: Lista[] = [];
  listaRielesVerticales: Lista[] = [];
  listaFlota: Lista[] = [];

  listaEstados: Estados[] = [];

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
    { titulo: 'F. Baja', target: ["activoOperacion", "fechaBaja"], tipo: 'texto', aligment: 'left', visible: true },
  ];

  colTipoEquipo: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  colEstadosActivo: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" },
  ];

  filtros: QueryFilter[] = [
    { filtro: "PageNumber", parametro: "1" }, // 0
    { filtro: "idTipoEquipoRemolque", parametro: "" }, // 1
    { filtro: "equipoActivo", parametro: "" }, // 2
    { filtro: "propio", parametro: "" }, //3
    { filtro: "idEstado", parametro: "" }, //4
    //
    { filtro: "noEjes", parametro: "" }, //5
    { filtro: "tandemCorredizo", parametro: "" }, //6
    { filtro: "chasisExtensible", parametro: "" }, //7
    { filtro: "tipoCuello", parametro: "" }, //8
    { filtro: "acopleGenset", parametro: "" }, //9
    { filtro: "acopleDolly", parametro: "" }, //10
    { filtro: "medidaPlataforma", parametro: "" }, //11 ---
    { filtro: "plataformaExtensible", parametro: "" }, //12
    { filtro: "pechera", parametro: "" }, //13
    { filtro: "capacidadCargaLB", parametro: "" }, //14
    { filtro: "lbExtensible", parametro: "" }, //15
    { filtro: "alturaContenedor", parametro: "" }, //16
    { filtro: "tipoContenedor", parametro: "" }, //17
    { filtro: "marcaUR", parametro: "" }, //18
    { filtro: "largoFurgon", parametro: "" }, //19
    { filtro: "medidasFurgon", parametro: "" }, //20 -----
    { filtro: "rielesHorizontales", parametro: "" }, //21
    { filtro: "rielesVerticales", parametro: "" }, //22
    { filtro: "flota", parametro: "" }, //23
    { filtro: "global", parametro: false },
    { filtro: "idEstacionTrabajo", parametro: "" },
  ]

  constructor(private sweetService: SweetService, private router: Router, private tipoListaService: TipoListaService,
    private listaService: ListaService, private activoOperacionService: ActivoOperacionService,
    private serviceComponent: ControlEquipoService, private reporteService: ReportesService,) { }

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

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.sweetService.sweet_notificacion("Cambio de estado");
        break;
      case 2:
        this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
      case 3:
        this.reservarEquipo(event.objeto);
        break;
      case 4:
        this.quitarReservaEquipo(event.objeto)
        break;
      case 5:
        this.ponerEnBodega(event.objeto)
        break;
      case 6:
        this.ponerEnReparacion(event.objeto)
        break;
      case 7:
        this.ponerEnRentaInterna(event.objeto)
        break;
      case 8:
        this.ponerEnRentaExterna(event.objeto)
        break;
      case 9:
        this.ponerEnRuta(event.objeto)
        break;
      case 10:
        this.preReservarEquipo(event.objeto)
        break;
      case 11:
        this.crearEvento(event.objeto)
        break;
      case 12:
        this.ponerDisponible(event.objeto)
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  cargarComponent() {
    if (this.router.url.endsWith('administracionEquipoRemolque')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: "Administración De Equipos Remolque",
          opciones: []
        },
        isModal: false
      });
      this.serviceComponent.setMenuOpcionesTabla([
        //{ icono: "published_with_changes", nombre: "Cambiar Estado", idEvento: 1, disponible: this.opcionDisponible("CambiarEstado") },
        { icono: "find_in_page", nombre: "Consultar Movimientos", idEvento: 2, disponible: this.opcionDisponible("Consultar") },
        { icono: "book_online", nombre: "Reservar", idEvento: 3, disponible: this.opcionDisponible("ReservarEquipo") },
        { icono: "delete", nombre: "Quitar Reservar", idEvento: 4, disponible: this.opcionDisponible("QuitarReserva") },
        { icono: "garage", nombre: "Poner En Bodega", idEvento: 5, disponible: this.opcionDisponible("PonerBodega") },
        { icono: "build", nombre: "Enviar A Reparación", idEvento: 6, disponible: this.opcionDisponible("PonerReparacion") },
        { icono: "rv_hookup", nombre: "Renta Interna", idEvento: 7, disponible: this.opcionDisponible("RentaInterna") },
        { icono: "rv_hookup", nombre: "Renta Externa", idEvento: 8, disponible: this.opcionDisponible("RentaExterna") },
        { icono: "add_road", nombre: "Enviar A Ruta", idEvento: 9, disponible: this.opcionDisponible("EnviarRuta") },
        { icono: "edit_calendar", nombre: "Pre Reservar", idEvento: 10, disponible: this.opcionDisponible("PreReservar") },
        { icono: "report_problem", nombre: "Crear Evento", idEvento: 11, disponible: this.opcionDisponible("AgregarEvento") },
        { icono: "task_alt", nombre: "Poner En Disponible", idEvento: 12, disponible: this.opcionDisponible("Poner Disponible") },
      ]);
      this.cargarTiposLista();
    } else {
      this.cargando = false;
    }
  }

  cargarTiposLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "noEjes").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "tandemCorredizo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "chasisExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "tipoCuello").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "acopleGenset").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "acopleDolly").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "medidaPlataforma").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "plataformaExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "pechera").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "capacidadCargaLB").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "lbExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "alturaContenedor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "tipoContenedor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "marcaUR").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "ejeCorredizo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "largoFurgon").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "medidasFurgon").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "rielesHorizontales").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoEquipos().id, "rielesVerticales").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.activoOperacionService.getRecurso().id, "flota").pipe(first()),
    ]).subscribe(res => {
      this.TL_NoEjes = res[0][0];
      this.TL_TandemCorredizo = res[1][0];
      this.TL_ChasisExtensible = res[2][0];
      this.TL_TipoCuello = res[3][0];
      this.TL_AcopleGenset = res[4][0];
      this.TL_AcopleDolly = res[5][0];
      this.TL_MedidaPlataforma = res[6][0];
      this.TL_PlataformaExtensible = res[7][0];
      this.TL_Pechera = res[8][0];
      this.TL_CapacidadCargaLB = res[9][0];
      this.TL_lbExtensible = res[10][0];
      this.TL_AlturaContenedor = res[11][0];
      this.TL_TipoContenedor = res[12][0];
      this.TL_MarcaUR = res[13][0];
      this.TL_EjeCorredizo = res[14][0];
      this.TL_LargoFurgon = res[15][0];
      this.TL_MedidasFurgon = res[16][0];
      this.TL_RielesHorizontales = res[17][0];
      this.TL_RielesVerticales = res[18][0];
      this.TL_Flota = res[19][0];
      this.cargarListas();
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_NoEjes.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TandemCorredizo.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_ChasisExtensible.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoCuello.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_AcopleGenset.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_AcopleDolly.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_MedidaPlataforma.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_PlataformaExtensible.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Pechera.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_CapacidadCargaLB.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_lbExtensible.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_AlturaContenedor.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoContenedor.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_MarcaUR.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_EjeCorredizo.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_LargoFurgon.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_MedidasFurgon.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_RielesHorizontales.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_RielesVerticales.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Flota.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.serviceComponent.getEstados(),
    ]).pipe(first()).subscribe(res => {
      this.listaNoEjes = res[0] as Lista[];
      this.listaTandemCorredizo = res[1] as Lista[];
      this.listaChasisExtensible = res[2] as Lista[];
      this.listaTipoCuello = res[3] as Lista[];
      this.listaAcopleGenset = res[4] as Lista[];
      this.listaAcopleDolly = res[5] as Lista[];
      this.listaMedidaPlataforma = res[6] as Lista[];
      this.listaPlataformaExtensible = res[7] as Lista[];
      this.listaPechera = res[8] as Lista[];
      this.listaCapacidadCargaLB = res[9] as Lista[];
      this.listaLbExtensible = res[10] as Lista[];
      this.listaAlturaContenedor = res[11] as Lista[];
      this.listaTipoContenedor = res[12] as Lista[];
      this.listaMarcaUR = res[13] as Lista[];
      this.listaEjeCorredizo = res[14] as Lista[];
      this.listaFurgonLargo = res[15] as Lista[];
      this.listaMedidasFurgon = res[16] as Lista[];
      this.listaRielesHorizontales = res[17] as Lista[];
      this.listaRielesVerticales = res[18] as Lista[];
      this.listaFlota = res[19] as Lista[];
      this.listaEstados = res[20] as Estados[];
      this.cargando = false;
    });
  }

  cargarPagina(noPagina) {
    this.filtros.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.filtros[i].parametro = noPagina;
      }
      if (f.filtro == "idTipoEquipoRemolque" && this.tipoEquipo) {
        this.filtros[i].parametro = this.tipoEquipo.id
      }
      if (f.filtro == "idEstacionTrabajo") {
        this.filtros[i].parametro = this.serviceComponent.getEstacionTrabajo().id;
      }
    });
    this.serviceComponent.cargarPagina(this.filtros.filter(f => f.parametro !== ""));
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  limpiarFiltros() {
    this.filtros.forEach(f => f.parametro = "");
    this.tipoEquipo = null;
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

  reservarEquipo(equipo: EquipoRemolque) {
    if (equipo.activoOperacion.movimientoActual.estado.disponible) {
      this.serviceComponent.seleccionarSolicitudAltas().pipe(first()).subscribe((res: any) => {
        //***** Reservar Equipo *****\\
        let opt: SweetAlertOptions = {
          title: "¿Reservar Equipo?",
          icon: "question",
          heightAuto: false,
          showCancelButton: true,
          confirmButtonText: "Reservar",
          html: `
          <h4 class="text-left text-bold">¿Desea reservara el equipo ${equipo.activoOperacion.codigo} a la siguiente solicitud?</h4>
          <p class="text-left p-0 m-0"><b>Solicitud:</b> ${res[0].solicitudMovimiento.tipoDocumento.tpDcCodigo} ${res[0].solicitudMovimiento.soliCodigo}</p>
          <p class="text-left p-0 m-0"><b>Fecha Solicitud:</b> ${res[0].solicitudMovimiento.soliFchMov ? moment(res[0].solicitudMovimiento.soliFchMov).format('DD-MM-YYYY hh:mm') : ''}</p>
          <p class="text-left p-0 m-0"><b>Fecha Ingreso:</b> ${moment(res[0].solicitudMovimiento.soliFch).format('DD-MM-YYYY hh:mm')}</p>
          <p class="text-left p-0 m-0"><b>Contenedor:</b> ${res[0].slMIContPref}${res[0].slMIContNumero}</p>
          <p class="text-left p-0 m-0"><b>Tipo:</b> ${res[0].tipoContenedor.tpCnCodigo}</p>
          <p class="text-left p-0 m-0"><b>Mercaderia:</b> ${res[0].slMIMercaderia ? res[0].slMIMercaderia : ''}</p>
          <p class="text-left p-0 m-0"><b>Peso:</b> ${res[0].slMIPeso ? res[0].slMIPeso : ''}</p>
          <p class="text-left p-0 m-0"><b>Sercicio:</b> ${res[0].servicio.servCodigo}</p>
          <p class="text-left p-0 m-0"><b>Cliente:</b> ${res[0].solicitudMovimiento.clientes.clieNombre}</p>
          <p class="text-left p-0 m-0"><b>Consignatario:</b> ${res[0].solicitudMovimiento.soliConsignatario}</p>
          <p class="text-left p-0 m-0"><b>Origen:</b> ${res[0].solicitudMovimiento.soliDirOrigen}</p>
          <p class="text-left p-0 m-0"><b>Destino:</b> ${res[0].solicitudMovimiento.soliDirDestino}</p>
          <p class="text-left p-0 m-0"><b>Usuario:</b> ${res[0].usuario ? res[0].usuario.usua_nombre : ''}</p>
          `
        }
        this.sweetService.sweet_custom(opt).then(r => {
          if (r.isConfirmed) {
            let reserva: any = {
              idActivo: equipo.idActivo,
              idServicio: res[0].slMIID,
              idEmpresa: this.serviceComponent.getEmpresa().id,
              idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
              idUsuario: this.serviceComponent.getUsuario().id,
              documento: res[0].solicitudMovimiento.soliCodigo,
              lugar: res[0].solicitudMovimiento.soliDirOrigen.trim() + ' A ' + res[0].solicitudMovimiento.soliDirDestino.trim(),
              observaciones: res[0].solicitudMovimiento.clientes.clieNombre.trim() + '- Contenedor: ' + res[0].slMIContPref + res[0].slMIContNumero
            }

            this.serviceComponent.reservarEquipo(reserva).pipe(first()).subscribe(res => {
              this.sweetService.sweet_notificacion("Equipo Reservado");
              this.cargarPagina(1);
            });
          }
        })
      });
    } else {
      this.sweetService.sweet_alerta("Equipo No Disponible", "No es posible reservar equipos que no estén disponibles", "error")
    }
  }

  quitarReservaEquipo(equipo: EquipoRemolque) {
    if (equipo.activoOperacion.movimientoActual.estado.evento.toLocaleLowerCase().includes("reservado")) {
      let opt: SweetAlertOptions = {
        title: "¿Quitar Reserva?",
        icon: "question",
        heightAuto: false,
        showCancelButton: true,
        input: "textarea",
        confirmButtonText: "Quitar Reserva",
        html: `
        <p class="text-left text-bold">¿Desea quitar la reservara al equipo ${equipo.activoOperacion.codigo} con documento #${equipo.activoOperacion.movimientoActual.documento}?</p>
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
            documento: equipo.activoOperacion.movimientoActual.documento,
            lugar: this.serviceComponent.getEstacionTrabajo().nombre,
            observaciones: r.value ? r.value : ''
          }

          this.serviceComponent.quitarReservaEquipo(reserva).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion("Se ha quitado la reserva al equipo");
            this.cargarPagina(1);
          });
        }
      })
    } else {
      this.sweetService.sweet_alerta("Error", "El equipo debe estar reservado", "error");
    }
  }

  ponerEnBodega(equipo: EquipoRemolque) {
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

  ponerEnReparacion(equipo: EquipoRemolque) {
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

        this.serviceComponent.evniarReparacionEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a reparación");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRentaInterna(equipo: EquipoRemolque) {
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
    })
  }

  ponerEnRentaExterna(equipo: EquipoRemolque) {
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

  ponerEnRuta(equipo: EquipoRemolque) {
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

  preReservarEquipo(equipo: EquipoRemolque) {
    if (equipo.activoOperacion.movimientoActual.estado.evento.toLocaleLowerCase().includes("egresado")) {
      this.serviceComponent.seleccionarSolicitudAltas().pipe(first()).subscribe((res: any) => {
        let opt: SweetAlertOptions = {
          title: "¿Pre Reservar Equipo?",
          icon: "question",
          heightAuto: false,
          showCancelButton: true,
          confirmButtonText: "Pre Reservar",
          html: `
          <h4 class="text-left text-bold">¿Desea Pre reservara el equipo ${equipo.activoOperacion.codigo} a la siguiente solicitud?</h4>
          <p class="text-left p-0 m-0"><b>Solicitud:</b> ${res[0].solicitudMovimiento.tipoDocumento.tpDcCodigo} ${res[0].solicitudMovimiento.soliCodigo}</p>
          <p class="text-left p-0 m-0"><b>Fecha Solicitud:</b> ${res[0].solicitudMovimiento.soliFchMov ? moment(res[0].solicitudMovimiento.soliFchMov).format('DD-MM-YYYY hh:mm') : ''}</p>
          <p class="text-left p-0 m-0"><b>Fecha Ingreso:</b> ${moment(res[0].solicitudMovimiento.soliFch).format('DD-MM-YYYY hh:mm')}</p>
          <p class="text-left p-0 m-0"><b>Contenedor:</b> ${res[0].slMIContPref}${res[0].slMIContNumero}</p>
          <p class="text-left p-0 m-0"><b>Tipo:</b> ${res[0].tipoContenedor.tpCnCodigo}</p>
          <p class="text-left p-0 m-0"><b>Mercaderia:</b> ${res[0].slMIMercaderia ? res[0].slMIMercaderia : ''}</p>
          <p class="text-left p-0 m-0"><b>Peso:</b> ${res[0].slMIPeso ? res[0].slMIPeso : ''}</p>
          <p class="text-left p-0 m-0"><b>Sercicio:</b> ${res[0].servicio.servCodigo}</p>
          <p class="text-left p-0 m-0"><b>Cliente:</b> ${res[0].solicitudMovimiento.clientes.clieNombre}</p>
          <p class="text-left p-0 m-0"><b>Consignatario:</b> ${res[0].solicitudMovimiento.soliConsignatario}</p>
          <p class="text-left p-0 m-0"><b>Origen:</b> ${res[0].solicitudMovimiento.soliDirOrigen}</p>
          <p class="text-left p-0 m-0"><b>Destino:</b> ${res[0].solicitudMovimiento.soliDirDestino}</p>
          <p class="text-left p-0 m-0"><b>Usuario:</b> ${res[0].usuario ? res[0].usuario.usua_nombre : ''}</p>
          `
        }
        this.sweetService.sweet_custom(opt).then(r => {
          if (r.isConfirmed) {
            let reserva: any = {
              idActivo: equipo.idActivo,
              idServicio: res[0].slMIID,
              idEmpresa: this.serviceComponent.getEmpresa().id,
              idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
              idUsuario: this.serviceComponent.getUsuario().id,
              documento: res[0].solicitudMovimiento.soliCodigo,
              lugar: res[0].solicitudMovimiento.soliDirOrigen.trim() + ' A ' + res[0].solicitudMovimiento.soliDirDestino.trim(),
              observaciones: res[0].solicitudMovimiento.clientes.clieNombre.trim() + '- Contenedor: ' + res[0].slMIContPref + res[0].slMIContNumero
            }

            this.serviceComponent.reservarEquipo(reserva).pipe(first()).subscribe(res => {
              this.sweetService.sweet_notificacion("Equipo Pre Reservado");
              this.cargarPagina(1);
            });
          }
        })
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Solo se pueden Pre Reservar equipos que se encuentran en ruta", "error")
    }
  }

  crearEvento(equipo: EquipoRemolque) {
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
        console.log(r.value);
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

  ponerDisponible(equipo: EquipoRemolque) {
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

  getTipoEquipoRemolque() {
    return this.serviceComponent.getTiposEquipos();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  getSubtituloFiltrosAplicados() {
    let filtrosAplicados = "Filtros Aplicados: ";
    this.filtros.forEach((f, i) => {
      if (f.parametro !== "") {
        switch (f.filtro) {
          case "idTipoEquipoRemolque":
            filtrosAplicados += ` -Tipo De Equipo: ${this.serviceComponent.getTiposEquiposValue().find(t => t.id.toString() == f.parametro).prefijo}`;
            break;
          case "equipoActivo":
            filtrosAplicados += ` -Equipo Activo: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "propio":
            filtrosAplicados += ` -Equipo Propio: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "idEstado":
            filtrosAplicados += ` -Estado: ${this.listaEstados.find(t => t.id.toString() == f.parametro).nombre}`;
            break;
          case "noEjes":
            filtrosAplicados += ` -No. De Ejes: ${f.parametro}`;
            break;
          case "tandemCorredizo":
            filtrosAplicados += ` -Tandem Corredizo: ${f.parametro}`;
            break;
          case "chasisExtensible":
            filtrosAplicados += ` -Chasis Extensible: ${f.parametro}`;
            break;
          case "tipoCuello":
            filtrosAplicados += ` -Tipo De Cuello:  ${f.parametro}`;
            break;
          case "acopleGenset":
            filtrosAplicados += ` -Acople Para Genset: ${f.parametro}`;
            break;
          case "acopleDolly":
            filtrosAplicados += ` -Acople Para Dolly: ${f.parametro}`;
            break;
          case "medidaPlataforma":
            filtrosAplicados += ` -Medida De Plataforma: ${f.parametro}`;
            break;
          case "plataformaExtensible":
            filtrosAplicados += ` -Plataforma Extensible: ${f.parametro}`;
            break;
          case "pechera":
            filtrosAplicados += ` -Pechera: ${f.parametro}`
            break;
          case "capacidadCargaLB":
            filtrosAplicados += ` -Capacidad De Carga: ${f.parametro}`;
            break;
          case "lbExtensible":
            filtrosAplicados += ` -Extensible: ${f.parametro}`
            break;
          case "alturaContenedor":
            filtrosAplicados += ` -Altura: ${f.parametro}`
            break;
          case "tipoContenedor":
            filtrosAplicados += ` -Tipo: ${f.parametro}`
            break;
          case "marcaUR":
            filtrosAplicados += ` -Marca: ${f.parametro}`
            break;
          case "largoFurgon":
            filtrosAplicados += ` -Largo: ${f.parametro}`
            break;
          case "medidasFurgon":
            filtrosAplicados += ` -Medidas: ${f.parametro}`
            break;
          case "rielesHorizontales":
            filtrosAplicados += ` -Rieles Horizontales: ${f.parametro}`
            break;
          case "rielesVerticales":
            filtrosAplicados += ` -Rieles Verticales: ${f.parametro}`
            break;
          case "flota":
            filtrosAplicados += ` -Flota: ${f.parametro}`
            break;
          case "global":
            filtrosAplicados += ` -Global: ${f.parametro ? 'Si' : 'No'}`
            break;
        }
      }
    });
    return filtrosAplicados;
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getTipoEquipoSelect() {
    if (this.tipoEquipo) {
      return this.tipoEquipo.id
    } else {
      return "";
    }
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  mostrarCampo(campo: string): boolean {
    try {
      if (this.tipoEquipo) {
        if (this.tipoEquipo.estructuraCoc.toLocaleLowerCase().indexOf(campo.toLocaleLowerCase()) !== -1) {
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

  getOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

}
