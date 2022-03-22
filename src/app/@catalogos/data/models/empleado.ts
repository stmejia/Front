import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { Direccion } from "./direccion";

export class Empleado {
    id?: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    dpi: string;
    nit: string;
    idDireccion: number;
    telefono: string;
    fechaAlta: Date;
    licenciaConducir: string;
    fechaNacimiento: Date;
    fechaBaja: Date;
    idEmpresa;
    //COP
    pais: string;
    razonSocial: string;
    correlativo: string;
    departamento: string;
    area: string;
    subArea: string;
    puesto: string;
    categoria: string;
    localidad: string;
    empleador: string;
    estado: number;

    fechaCreacion?: Date;
    direccion: Direccion;
    placas: string;

    fotos: ImagenRecurso
}