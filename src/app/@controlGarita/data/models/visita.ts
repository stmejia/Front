import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { Usuario } from "src/app/@aguila/data/models/usuario";

export interface Visita {
    id: number;
    nombre: string;
    identificacion: string;
    motivoVisita: string;
    areaVisita: string;
    nombreQuienVisita: string;
    vehiculo: string;
    ingreso: Date | string;
    salida: Date | string;
    idEstacionTrabajo: number;
    idImagenRecursoDpi: string;
    dpi: ImagenRecurso;

    estacion: Estaciontrabajo,
    usuario: Usuario;
}