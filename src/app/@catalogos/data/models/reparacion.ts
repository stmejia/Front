export class Reparacion {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    idCategorias: number; //Biene de la lista
    idTipoReparacion: number;
    idEmpresa: number;
    horasHombre: number;
    fechaCreacion?: Date;
}