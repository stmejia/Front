import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { EmpleadoService } from '../../data/services/empleado.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { Empleado } from '../../data/models/empleado';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];
  qrText: string = "";
  intentos: number = 0;

  private columnasDefault: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COP', target: ['cop'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'DPI', target: ['dpi'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'NIT', target: ['nit'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Teléfono', target: ['telefono'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Fecha de Alta', target: ['fechaAlta'], tipo: 'fecha', aligment: 'center', visible: true },
    { titulo: 'Fecha de Baja', target: ['fechaBaja'], tipo: 'fecha', aligment: 'center', visible: true },
    { titulo: 'Fecha de Creación', target: ['fechaCreacion'], tipo: 'fecha', aligment: 'center', visible: true }
  ];

  filtros: QueryFilter[] = [];

  constructor(private http: HttpClient, private serviceComponent: EmpleadoService, private sweetService: SweetService, private router: Router) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).pipe(first(val => val === false)).subscribe(res => {
      this.validarPermiso();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_alerta("Error", "No es posible cargar el comonente", "error");
      this.serviceComponent.paginaAnterior();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 2:
        this.router.navigate([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, event.objeto.id]);
        break;
      case 2:
        this.router.navigate([this.rutaComponent, event.objeto.id]);
        break;
      case 3:
        this.eliminarItem(event.objeto);
        break;
      case 4:
        this.serviceComponent.imprimirEtiqueta(event.objeto);
        break;
      case 5:
        this.qrText = JSON.stringify({
          codigo: event.objeto.codigo,
          td: this.serviceComponent.getRecurso().controlador
        });

        this.descargarQR(event.objeto);
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.queryFilters.forEach(f => {
      if (f.filtro == "PageNumber") {
        f.parametro = event.noPagina;
      }
    });
    this.cargarPaginaFiltros();
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('empleados')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Empleados',
          opciones: [
            {
              icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
              idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
            }
          ]
        },
        isModal: false,
      });
      this.serviceComponent.setColumnas(this.columnasDefault);
      this.serviceComponent.setMenuOpcionesTabla([
        { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
        { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
        { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 },
        { icono: 'print', nombre: 'Imprimir QR', disponible: this.opcionDisponible('Imprimir'), idEvento: 5 },
      ]);
    }
    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    let filtros: FiltrosC[] = [
      {
        nombre: "Nombre Empleado",
        valores: [],
        filters: [{ filtro: "nombres", parametro: "" }],
        tipo: "input",
        activo: true,
        requerido: false
      }
    ];
    this.serviceComponent.setFiltrosComponent(filtros);
    this.queryFilters = [];
    this.cargandoDatos = false;
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  cargarPaginaFiltros() {
    this.serviceComponent.cargarPagina(this.queryFilters);
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.serviceComponent.setDatos([]);
    this.serviceComponent.setPaginador(null);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  eliminarItem(item: Empleado) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.nombres} - ${item.apellidos}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
            this.cargarPaginaFiltros();
          }, (error) => {
            console.log(error);
            this.sweetService.sweet_Error(error);
          });
        }
      });
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  descargarQR(empleado: Empleado) {
    if (this.intentos > 3) {
      this.sweetService.sweet_alerta("Error", "No es posible generar el codigo QR", "error");
      return;
    }
    this.sweetService.sweet_carga('Generando QR', true);

    let htmlC: HTMLCollection = document.getElementsByClassName('ngxQRCode');

    try {
      let fileName = empleado.nombres + "_" + empleado.apellidos + "_" + empleado.codigo;
      let base64Img = htmlC[0].children[0]['src'] as string;

      let url = window.URL.createObjectURL(this.convertBase64ToBlob(base64Img));

      this.qrText = null;
      this.intentos = 0;

      let link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      this.sweetService.sweet_notificacion("Descargando codigo QR", 5000, 'info');
      fileName = null;
      base64Img = null;
      url = null;
      link = null;
      htmlC = null;
    } catch (error) {
      console.log(error);
      this.intentos++;
      let interval;
      let tiempo = 1000;
      interval = setInterval(() => {
        if (tiempo > 0) {
          tiempo -= 1000;
        } else {
          clearInterval(interval);
          this.descargarQR(empleado);
        }
      }, 1000);
    }
  }

  convertBase64ToBlob(base64Image: string) {
    // Split into two parts
    const parts = base64Image.split(';base64,');

    // Hold the content type
    const imageType = parts[0].split(':')[1];

    // Decode Base64 string
    const decodedData = window.atob(parts[1]);

    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    // Return BLOB image after conversion
    return new Blob([uInt8Array], { type: imageType });
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  getMenuOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }
}
