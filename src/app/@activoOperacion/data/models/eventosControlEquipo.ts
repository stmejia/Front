import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { Usuario } from "src/app/@aguila/data/models/usuario";
import { ActivoOperaciones } from "src/app/@catalogos/data/models/activoOperaciones";

export interface EventosControlEquipo {
    id?: number;
    idActivo?: number; //*
    idEstacionTrabajo?: number; //*
    idUsuarioCreacion?: number;
    idUsuarioRevisa?: number;
    idUsuarioResuelve?: number;
    idUsuarioAnula?: number;
    estado?: string;
    descripcionEvento?: string; // Titulo*
    bitacoraObservaciones: string; //*
    fechaRevisado?: Date;
    fechaResuelto?: Date;
    fechaAnulado?: Date;
    fechaCreacion?: Date;
    activoOperacion?: ActivoOperaciones;
    estacionTrabajo?: Estaciontrabajo;
    usuarioCreacion?: Usuario;
    usuarioRevisa?: Usuario;
    usuarioResuelve?: Usuario;
    usuarioAnula?: Usuario;
}