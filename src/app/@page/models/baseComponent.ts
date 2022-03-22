import { AbstractControl, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { first } from "rxjs/operators";
import { SweetService } from "../services/sweet.service";
import { ColumnaTabla } from "./aguilaTabla";
import { FiltrosC, QueryFilter } from "./filtros";
import { ItemHeaderComponent } from "./headers";
import { MenuOpciones } from "./menu";
import { EventoPaginador } from "./paginador";
import { TitulosReporte } from "./titulosReporte";

export class BaseComponent<S = any, RS = any> {

    /* Pantalla para lista de datos */
    protected rutaComponent: string = "";
    protected queryFilters: QueryFilter[] = [];
    protected columnasTabla: ColumnaTabla[] = []
    protected filtros: FiltrosC[] = [];
    protected menuDeOpcionesTabla: MenuOpciones[] = [];
    /* ----- ----- ----- */

    /* Pantalla para formularios */
    public form: FormGroup;
    codErrores: { [key: string]: any } = {};
    /* ----- ----- ----- */

    protected cargandoDatosDelComponente: boolean = true;
    protected headerComponent: ItemHeaderComponent = {
        titulo: "",
        opciones: []
    }

    constructor(protected titulo: string, protected service: S | any, protected sweetService: SweetService,
        protected activatedRoute?: ActivatedRoute) {
        this.headerComponent.titulo = titulo;

    }

    iniciarComponent() {
        this.service.getCargando().pipe(
            first(value => value === false)
        ).subscribe(res => {
            this.validarPermiso();
        }, (error) => {
            console.log(error);
            this.sweetService.sweet_alerta("Error", "No es posible cargar el comonente", "error");
            this.service.paginaAnterior();
        });
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
        if (this.service.validarPermiso('Consultar')) {
            this.cargarComponent();
        } else {
            this.service.errorPermiso("Consultar");
            this.service.paginaAnterior();
        }
    }

    cargarComponent() {
        return this.sweetService.sweet_alerta("Metodo No Implementado", "'cargarComponent no esta implementado'", "error");
    }

    cargarPaginaFiltros() {
        this.service.cargarPagina(this.queryFilters);
    }

    getFiltros(filtros) {
        this.queryFilters = filtros;
        this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
        this.service.setDatos([]);
        this.service.setPaginador(null);
        this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
    }

    getDatos() {
        return this.service.getDatos();
    }

    getPaginador() {
        return this.service.getPaginador();
    }

    opcionDisponible(opcion: string): boolean {
        return this.service.validarPermiso(opcion);
    }

    errores(validaciones: []) {
        for (const validacion in validaciones) {
            var error = validaciones[validacion];
            this.codErrores[validacion] = error;
            this.form.get(validacion).setErrors(["api"]);
            this.form.markAllAsTouched();
        }
    }

    validarParametro(parametro: string) {
        if (this.activatedRoute.snapshot.paramMap.get(parametro)) {
            return true;
        } else {
            return false;
        }
    }

    booleanValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (typeof (control.value) !== "boolean") {
            return { 'boolean': true }
        }
        return null;
    }

    generarPDF(evento) {
        let titulosDocumento: TitulosReporte = {
            titulo: {
                text: this.service.getEmpresa().nombre,
                bold: true,
                size: 18
            },
            subTitulos: [
                { text: this.header.titulo, bold: true, size: 16 }
            ]
        }

        let fA = this.filtrosAplicados;
        if (fA.length > 20) titulosDocumento.subTitulos.push({ text: fA, bold: false, size: 12 });

        this.service.generarPDFTabla(evento.columnas, evento.datos, titulosDocumento);
    }

    generarExcel(evento) {
        let titulosDocumento: TitulosReporte = {
            titulo: {
                text: this.service.getEmpresa().nombre,
                bold: true,
                size: 18
            },
            subTitulos: [
                { text: this.header.titulo, bold: true, size: 16 }
            ]
        }

        let fA = this.filtrosAplicados;
        if (fA.length > 20) titulosDocumento.subTitulos.push({ text: fA, bold: false, size: 12 });

        this.service.generarExcelTabla(evento.columnas, evento.datos, titulosDocumento);
    }

    get header() {
        return this.headerComponent;
    }

    get cargandoDatos() {
        return this.cargandoDatosDelComponente;
    }

    get columnas() {
        return this.columnasTabla;
    }

    get filtrosComponent() {
        return this.filtros;
    }

    get menuOpcionesTabla() {
        return this.menuDeOpcionesTabla;
    }

    get filtrosAplicados() {
        let fA = "Filtros Aplicados: ";

        this.queryFilters.forEach(filtroAplicado => {
            if (filtroAplicado.filtro == 'idEstacionTrabajo') return;
            if (filtroAplicado.filtro == 'fechaInicio') return;
            if (filtroAplicado.filtro == 'fechaFin') return;
            if (filtroAplicado.filtro == 'idEmpresa') return;

            let filtroComponente = this.filtrosComponent.find(filtro => {
                if (filtro.filters.find(f => f.filtro == filtroAplicado.filtro)) {
                    return true;
                } else {
                    return false;
                }
            });

            if (filtroComponente) {
                switch (typeof filtroAplicado.parametro) {
                    case "boolean":
                        fA += ` -${filtroComponente.nombre}: ${filtroComponente.valores.find(v => v.valor == filtroAplicado.parametro).nombre}`;
                        return;
                        break;
                }
                fA += ` -${filtroComponente.nombre}: ${filtroAplicado.parametro}`;
            }
        });

        let filtroRangoFechasInicio = this.queryFilters.find(f => f.filtro == 'fechaInicio');
        let filtroRangoFechasFin = this.queryFilters.find(f => f.filtro == 'fechaFin');
        if (filtroRangoFechasInicio && filtroRangoFechasFin) {
            let filtroComponente = this.filtrosComponent.find(filtro => {
                if (filtro.filters.find(f => f.filtro == 'fechaInicio')) {
                    return true;
                } else {
                    return false;
                }
            });

            if (filtroComponente) {
                fA += ` -${filtroComponente.nombre}: ${moment(filtroRangoFechasInicio.parametro).format('DD-MM-YYYY')} al ${moment(filtroRangoFechasFin.parametro).format('DD-MM-YYYY')}`;
            }
        }

        let filtroEstacionTrabajo = this.queryFilters.find(f => f.filtro == 'idEstacionTrabajo');
        if (filtroEstacionTrabajo) {
            let filtroComponente = this.filtrosComponent.find(filtro => {
                if (filtro.filters.find(f => f.filtro == 'idEstacionTrabajo')) {
                    return true;
                } else {
                    return false;
                }
            });

            if (filtroComponente) {
                fA += ` -${filtroComponente.nombre}: ${this.service.getUsuarioActual().estacionesTrabajoAsignadas.find(et => et.estacionTrabajoId.toString() == filtroEstacionTrabajo.parametro).estacionTrabajo.nombre}`;
            }
        }

        let filtroEmpresa = this.queryFilters.find(f => f.filtro == 'idEmpresa');
        if (filtroEmpresa) {
            let filtroComponente = this.filtrosComponent.find(filtro => {
                if (filtro.filters.find(f => f.filtro == 'idEmpresa')) {
                    return true;
                } else {
                    return false;
                }
            });

            if (filtroComponente) {
                fA += ` -${filtroComponente.nombre}: ${this.service.getEmpresasAsignadasValue().find(em => em.id.toString() == filtroEmpresa.parametro).nombre}`;
            }
        }

        return fA;
    }
}