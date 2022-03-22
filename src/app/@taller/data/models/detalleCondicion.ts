import { Usuario } from "src/app/@aguila/data/models/usuario";
import { Reparacion } from "src/app/@catalogos/data/models/reparacion";

export interface DetalleInspeccion {
    id: number;
    idUsuario: number;
    usuarios?: Usuario;
    idUsuarioAutoriza: number;
    usuarioAutoriza: Usuario;
    idCondicion: number;
    idReparacion: number;
    reparaciones?: Reparacion;
    cantidad?: number;
    aprobado?: boolean;
    nombreAutoriza: string;
    observaciones: string;
    fechaAprobacion?: Date;
    fechaEstimadoReparacion: Date;
    fechaFinalizacionRep?: Date;
    fechaCreacion: Date;
}