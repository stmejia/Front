import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { Usuario } from "src/app/@aguila/data/models/usuario";
import { Empleado } from "src/app/@catalogos/data/models/empleado";
import { Estados } from "src/app/@catalogos/data/models/estados";

export interface MovimientoActual {
    id: number;
    estado: Estados;
    estacionTrabajo: Estaciontrabajo;
    empleado: Empleado;
    usuario: Usuario;
    cargado: boolean;
    documento: string;
    fecha: Date;
    fechaCreacion: Date;
    idActivo: number;
    idEstacionTrabajo: number;
    idEstado: number;
    idPiloto: number;
    idRuta: number;
    idServicio: number;
    idUsuario: number
    lugar: string;
    observaciones: string;
    ruta: any;
    servicio: any;
    tipoDocumento: string;
    ubicacionId: number;
    vDiasUltMov: number;
}