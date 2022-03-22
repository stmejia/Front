import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { Usuario } from "src/app/@aguila/data/models/usuario";

export interface Contratista {
    id: number;
    nombre: string;
    identificacion: string;
    empresa: string;
    vehiculo: string;
    ingreso: Date | string;
    salida: Date | string;
    idImagenRecursoDpi: string;
    idEstacionTrabajo: number;
    dpi: ImagenRecurso;

    estacion: Estaciontrabajo;
    usuario: Usuario;
}