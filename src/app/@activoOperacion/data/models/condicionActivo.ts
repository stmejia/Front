import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { Usuario } from "src/app/@aguila/data/models/usuario";
import { ActivoOperaciones } from "src/app/@catalogos/data/models/activoOperaciones";
import { Empleado } from "src/app/@catalogos/data/models/empleado";
import { CondicionCabezal } from "./condicionCabezal";
import { CondicionLlanta } from "./condicionLlanta";

export interface CondicionActivo {
    id: number;
    idActivo: number;
    idEmpleado: number;
    tipoCondicion: string;
    movimiento: string;
    cargado: boolean;
    ubicacionIdEntrega: number;
    fecha: Date;
    fechaCreacion: Date;
    disponible: boolean;
    observaciones: string;
    noLlantas?: number;
    condicionDetalle: CondicionCabezal;
    idEstacionTrabajo: number;
    idUsuario: number;
    condicionesLlantas: CondicionLlanta[]; //Eliminar
    condicionesLlantasRepuesto: CondicionLlanta[]; //Eliminar
    serie: string;
    irregularidadesObserv: string;
    daniosObserv: string;
    numero: number;
    usuario?: Usuario;
    empleado?: Empleado;
    codigo?: string;
    activoOperacion?: ActivoOperaciones;
    placa?: string;
    imagenFirmaPiloto: ImagenRecurso;
    fotos?: ImagenRecurso;
    estacionTrabajo: Estaciontrabajo;
}

export interface CondicionActivoContenedor {
    id: number;
    idActivo: number;
    idEstacionTrabajo: number;
    idEmpleado: number;
    idUsuario: number;
    fechaInspeccion: Date;
    fechaCreacion: Date;
    serie: string;
    numero: string;
    imagenFirmaPiloto: ImagenRecurso;
    fotos?: ImagenRecurso;
    movimiento: string;
    idEstado: number;
}