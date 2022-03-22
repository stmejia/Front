import { MovimientoActual } from "src/app/@activoOperacion/data/models/movimientoActual";
import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { Empleado } from "./empleado";
import { Transporte } from "./transporte";

export class ActivoOperaciones {
    id?: number;
    codigo?: string;
    descripcion?: string;
    idActivoGenerales?: number;
    movimientoActual?: MovimientoActual;
    movimientos?: MovimientoActual[];
    fechaCreacion?: Date;
    fechaBaja: Date;
    categoria: string; //V,E,G
    color: string;
    marca: string;
    vin: string;
    correlativo: string;
    serie: string;
    modeloAnio: string;
    idTransporte: number;
    transporte: Transporte;
    coc: string;
    flota: string;
    fotos: ImagenRecurso;
}

export interface ISEquipo {
    idActivo: number;
    placa: string;
    flota: string;
    transporte: string;
    tipoEquipo: string;
    piloto: string;
    condicion: string;
    idEmpresa: number;
    idEstacionTrabajo: number;
    guardiaNombre: string;
    idPiloto: number;
    tipoMovimiento: boolean;
    cargado: boolean;
    empleado: Empleado;
    activoOperacion: ActivoOperaciones;
}