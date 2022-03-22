export class TipoReparacion {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    idEmpresa:number; //Se debe setear la empresa en la que esta trabajando el usuario
    fechaCreacion?: Date;
}