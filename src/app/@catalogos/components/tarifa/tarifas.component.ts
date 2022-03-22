import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { DataClienteTarifa } from '../../data/models/dataClienteTarifa';
import { Tarifa } from '../../data/models/tarifa';
import { TarifaService } from '../../data/services/tarifa.service';
import { ClienteTarifaComponent } from '../cliente/cliente-tarifa.component';

@Component({
  selector: 'app-tarifas',
  templateUrl: './tarifas.component.html',
  styleUrls: ['./tarifas.component.css']
})
export class TarifasComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  idEmpresa: number;
  
  private columnasDefault: Columna[] = [
    { nombre: '', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Tipo De Carga', targetId: 'tipoCarga', tipo: 'texto', aligment: 'left' },
    { nombre: 'Tipo De Movimiento', targetId: 'tipoMovimiento', tipo: 'texto', aligment: 'left' },
    { nombre: 'Segmento', targetId: 'segmento', tipo: 'texto', aligment: 'left' },
    { nombre: 'Precio', targetId: 'precio', tipo: 'texto', aligment: 'left' },
    { nombre: 'Combustible (Gls)', targetId: 'combustibleGls', tipo: 'texto', aligment: 'left' },
    { nombre: '¿Es Especializado?', targetId: 'esEspecializado', tipo: 'boolean', aligment: 'left' },
    { nombre: 'Recorrido Con Carga (Km)', targetId: 'kmRecorridosCargado', tipo: 'texto', aligment: 'left' },
    { nombre: 'Recorrido Sin Carga (km)', targetId: 'kmRecorridosVacio', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Vigente Hasta', targetId: 'fechaVigencia', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: TarifaService, private router: Router,
    private sweetService: SweetService, public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
    ]).subscribe(() => this.validarPermiso());
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso('Consultar');
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('tarifas')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Tarifas',
          opciones: [
            {
              icono: 'refresh', nombre: 'Mostrar Datos', disponible: this.opcionDisponible('Consultar'),
              idEvento: 1, toolTip: 'Mostrar lista de datos', color: 'primary'
            },
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
        // {
        //   icono: 'assignment_ind', nombre: 'Asignar Cliente', disponible: this.opcionDisponible('Asignar Cliente'),
        //   idEvento: 3, toolTip: 'Asignar tarifa personalizada a cliente'
        // }
      ]);
    }
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
      this.cargandoDatos = false;
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "No es posible acceder a la empresa", 'error');
      this.serviceComponent.paginaAnterior();
    });

  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.cargarPagina(1);
        break;
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
        this.asignarCliente(event.objeto);
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  asignarCliente(tarifa: Tarifa) {
    let datos: DataClienteTarifa = {
      objeto: tarifa,
      titulo: 'Asignar Tarifa A Cliente',
      tipo: 'tarifa'
    }
    let dialogRef = this.dialog.open(ClienteTarifaComponent, {
      data: datos
    });

    dialogRef.afterClosed().pipe(first()).subscribe();
  }

  cargarPagina(noPagina: number) {
    this.serviceComponent.cargarPagina(noPagina, this.idEmpresa);
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
