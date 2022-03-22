export class TipoActivo {
    id?: number;
    codigo: string;
    nombre: string;
    area: string;
    operaciones: boolean;
    idCuenta: number;
    porcentajeDepreciacionAnual: number;
    fechaCreacion?: Date;
}