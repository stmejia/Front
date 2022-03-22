import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InspeccionContenedor } from '../../data/models/inspeccionContenedor';
import { InspeccionContenedorService } from '../../data/services/inspeccion-contenedor.service';

@Component({
  selector: 'app-inspeccion-contenedores',
  templateUrl: './inspeccion-contenedores.component.html',
  styleUrls: ['./inspeccion-contenedores.component.css']
})
export class InspeccionContenedoresComponent extends BaseComponent<InspeccionContenedorService> implements OnInit {

  constructor(protected sw: SweetService, protected s: InspeccionContenedorService, protected r: Router) {
    super("INSPECCIONES DE SEGURIDAD PARA CONTENEDORES", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.s.navegar([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(evento: EventoMenuOpciones<InspeccionContenedor>) {
    switch (evento.idEvento) {
      case 1:
        //Imprimir Condicion
        this.s.imprimirCondicion(evento.objeto.condicionActivo.id);
        break;

      case 2:
        //Mostrar Imagenes
        break
    }
  }

  cargarComponent(): void {
    this.rutaComponent = this.r.url;
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 1, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
      { titulo: "Tipo Condición", target: ["condicionActivo", "movimiento"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Serie", target: ["condicionActivo", "serie"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "No. Doc.", target: ["condicionActivo", "numero"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "CUI", target: ["condicionActivo", "activoOperacion", "codigo"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Piloto", target: ["condicionActivo", "empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Observaciones", target: ["condicionActivo", "observaciones"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Fecha", target: ["condicionActivo", "fecha"], tipo: "fecha", aligment: "left", visible: true },
    ];

    this.menuDeOpcionesTabla = [
      { icono: 'print', nombre: 'Imprimir', disponible: this.opcionDisponible('Imprimir'), idEvento: 1 },
      { icono: 'search', nombre: 'Ver Imagenes', disponible: this.opcionDisponible('Consultar'), idEvento: 2 }
    ]

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push({
      nombre: "Movimiento",
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Ingreso", valor: "ingreso" },
        { nombre: "Salida", valor: "salida" }],
      filters: [{ filtro: "movimiento", parametro: "" }],
      tipo: "lista",
      activo: true,
      requerido: false,
    }, {
      nombre: "Rango De Fechas",
      valores: [
        { nombre: "F. Inicio", valor: "" },
        { nombre: "F. Fin", valor: "" }],
      filters: [{ filtro: "fechaInicio", parametro: "" }, { filtro: "fechaFin", parametro: "" }],
      tipo: "rangoFechas",
      activo: true,
      requerido: true,
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

}
