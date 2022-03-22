import { DetalleInspeccion } from "./detalleCondicion";

export interface InspeccionIngresoVehiculo {
    /* Encabezado */
    id?: number;
    idActivo: number;
    idEmpleado: number;
    idUsuario: number;
    idEstacionTrabajo: number;
    tipoActivo: string;
    serie: string;
    numero?: number;
    fechaIngreso: Date;
    fechaSalida?: Date;
    fechaRechazo?: Date;
    fechaAprobacion?: Date;
    fechaCreacion: Date;

    /* Detalle */
    vidrios?: string;
    llantas?: string;
    tanqueCombustible?: string;
    observaciones?: string;

    detalleInspeccion: DetalleInspeccion;
}