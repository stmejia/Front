import { ImagenRecurso } from './imagenRecurso';

export class Empresa {
    id?: number; //No se debe enviar ID al crear una empresa
    codigo: number; //Este campo es opcional, por defecto asigna 0
    nombre: string;
    abreviatura: string; //El valor de abreviatura no se debe repetir
    aleas: string;
    activ: boolean; //Opcional, por defecto null
    fchCreacion: Date;
    nit: string;
    direccion: string;
    telefono: string; //Opcional, por defecto null
    email: string; //Opcional, por defecto null
    webPage: string; //Opcional, por defecto null
    imagenLogo: ImagenRecurso;
    pais: string;
    departamento: string; //Opcional, por defecto null
    municipio: string; //Opcional, por defecto null
    esEmpleador: boolean;
}