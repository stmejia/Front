import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { BaseComponent } from "src/app/@page/models/baseComponent";
import { OpcionesHeaderComponent } from "src/app/@page/models/headers";
import { EventoMenuOpciones } from "src/app/@page/models/menu";
import { SweetService } from "src/app/@page/services/sweet.service";
import { Generador } from "../../data/models/generador";
import { GeneradorService } from "../../data/services/generador.service";

@Component({
  selector: "app-generadores",
  templateUrl: "./generadores.component.html",
  styleUrls: ["./generadores.component.css"],
})
export class GeneradoresComponent
  extends BaseComponent<GeneradorService>
  implements OnInit {

  constructor(protected s: GeneradorService, protected sweetService: SweetService, protected router: Router) {
    super("Generadores", s, sweetService);
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

  eventoMenuOpciones(event: EventoMenuOpciones<Generador>) {
    switch (event.idEvento) {
      case 1:
        this.s.navegar([this.rutaComponent, event.objeto.idActivo.toString()]);
        break;
      case 2:
        this.s.navegar([this.rutaComponent, event.objeto.idActivo.toString()]);
        break;
      case 3:
        this.eliminarGenerador(event.objeto);
        break;
    }
  }

  cargarComponent(): void {
    this.rutaComponent = this.router.url;
    this.headerComponent.opciones.push(
      {
        nombre: "Nuevo", icono: "add_circle_outline", color: "primary", toolTip: "Agregar registro nuevo", idEvento: 1, disponible: this.s.validarPermiso("Nuevo")
      }
    )
    this.columnasTabla.push(
      { titulo: "settings", tipo: "opcion", visible: true, aligment: "center", target: [] },
      { titulo: "CUI", tipo: "texto", visible: true, aligment: "center", target: ["activoOperacion", "codigo"] },
      { titulo: "COC", target: ["activoOperacion", "coc"], tipo: "texto", aligment: "center", visible: true, },
      { titulo: "Observaciones", target: ["activoOperacion", "descripcion"], tipo: "texto", aligment: "left", visible: true, },
      { titulo: "Marca", target: ["activoOperacion", "marca"], tipo: "texto", aligment: "left", visible: true, },
      { titulo: "Serie", target: ["activoOperacion", "serie"], tipo: "texto", aligment: "left", visible: true, },
      { titulo: "Modelo (Año)", target: ["activoOperacion", "modeloAnio"], tipo: "texto", aligment: "center", visible: true, },
      { titulo: "Transporte", target: ["activoOperacion", "transporte", "nombre"], tipo: "texto", aligment: "left", visible: true, },
      { titulo: "Fecha de Creación", target: ["activoOperacion", "fechaCreacion"], tipo: "fecha", aligment: "center", visible: true, }
    )
    this.menuDeOpcionesTabla.push(
      { nombre: "Consultar", icono: "find_in_page", idEvento: 1, disponible: this.s.validarPermiso("Consultar")},
      { nombre: "Modificar", icono: "create", idEvento: 2, disponible: this.s.validarPermiso("Modificar")},
      { nombre: "Eliminar", icono: "delete_forever", idEvento: 3, disponible: this.s.validarPermiso("Eliminar")},
    )
    
    this.setFiltrosComponent();
  }

  setFiltrosComponent(){
    forkJoin([
      this.s.getTiposGenerador()
    ]).subscribe(res => {
      this.filtros.push(
        { nombre: "Tipos de generador", tipo: "lista", requerido: false, filters: [{filtro:"idTipoGenerador", parametro:""}], activo: true,
         valores: res[0].map(tg => {
           return {nombre: tg.descripcion, valor: tg.id}
         })},
        { nombre: "Código", tipo: "input", tipoInput: "string", requerido: false, filters: [{filtro:"codigo", parametro:""}], activo: true},
        { nombre: "Equipo Propio", tipo: "lista", requerido: false, filters: [{filtro:"propio", parametro:""}], activo: true,
          valores: [{nombre:"Todos", valor: ""},{nombre:"Si", valor:true},{nombre:"No", valor:false}]
        }
      )

      this.cargandoDatosDelComponente = false;
    })
  }

  eliminarGenerador(generador: Generador){
    this.sweetService.sweet_confirmacion("Eliminar registro", `¿Desea eliminar el registro ${generador.activoOperacion.codigo}?`).then(res => {
      if (res.isConfirmed) {
        this.s.eliminar(generador.idActivo).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro eliminado", 5000, "info");
          this.cargarPaginaFiltros();
        })
      }
    })
  }
}
